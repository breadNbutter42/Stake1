import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/Rewarder.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()

  let contract
  const setContract = (payload) => contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_REWARDER, abi, payload)

  const myDepositedLP = async () => await contract.myDepositedLP().then(response => Number(ethers.utils.formatEther(response)).toFixed(2))
  const pendingRewards = async (payload) => await contract.pendingTokens(payload ?? address.value).then(response => Number(ethers.utils.formatEther(response)).toFixed(2))
  const depositLP = async (amt) => await contract.deposit(amt)
  const withdrawMyLPAndRewards = async () => await contract.withdrawMyLPAndRewards()
  
  userStore.$onAction(({ name, after }) => {
    after(() => {
      const actions = {
        setUser: () => setContract(wallet.getSigner()),
        resetUser: () => setContract(wallet)
      }

      actions[name]?.() || null
    })
  })

  isAuthenticated.value ? setContract(wallet.getSigner()) : setContract(wallet)

  return {
    contract,
    myDepositedLP,
    pendingRewards,
    depositLP,
    withdrawMyLPAndRewards
  }
}
