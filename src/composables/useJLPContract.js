import { ethers } from "ethers";
import useUser from "@/composables/useUser";
import abi from "@/abi/JLP.json";
import useUserStore from "@/stores/user";

export default (address) => {
  const { wallet, isAuthenticated } = useUser();
  const userStore = useUserStore();
  const { VITE_CONTRACT_JLP, VITE_CONTRACT_REWARDER } = import.meta.env;

  let contract;
  const setContract = (payload) =>
    (contract = new ethers.Contract(VITE_CONTRACT_JLP, abi, payload));

  const symbolJLP = async () => await contract.symbol();
  const approveJLP = async (_number) =>
    await contract.approve(
      VITE_CONTRACT_REWARDER,
      ethers.utils.parseEther(String(_number))
    );
  const allowanceJLP = async (payload) =>
    await contract
      .allowance(payload ?? address.value, VITE_CONTRACT_REWARDER)
      .then((response) => Number(ethers.utils.formatEther(response)));
  const balanceOfJLP = async (payload) =>
    await contract
      .balanceOf(payload ?? address.value)
      .then((response) =>
        Number(ethers.utils.formatEther(response)).toFixed(2)
      );

  userStore.$onAction(({ name, after }) => {
    after(() => {
      const actions = {
        setUser: () => setContract(wallet.getSigner()),
        resetUser: () => setContract(wallet),
      };

      actions[name]?.() || null;
    });
  });

  isAuthenticated.value ? setContract(wallet.getSigner()) : setContract(wallet);

  return {
    contract,
    symbolJLP,
    approveJLP,
    allowanceJLP,
    balanceOfJLP,
  };
};
