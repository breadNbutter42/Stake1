import { ethers } from 'ethers'
import useUser from '@/composables/useUser'
import abi from '@/abi/Bucks.json'
import useUserStore from '@/stores/user'

export default (address) => {
  const { wallet, isAuthenticated } = useUser()
  const userStore = useUserStore()
  const { VITE_CONTRACT_BUCKS } = import.meta.env

  let contract
  const setContract = (payload) => contract = new ethers.Contract(VITE_CONTRACT_BUCKS, abi, payload)

  const symbolBucks = async () => await contract.symbol()
  const balanceOfBucks = async (payload) => await contract.balanceOf(payload ?? address.value).then(response => Number(ethers.utils.formatEther(response)).toFixed(2))

  
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
    symbolBucks,
    balanceOfBucks
  }
}
