<!-- eslint-disable prettier/prettier -->
<script setup>
import {
  useJLPContract,
  useUser,
  useRewarderContract,
  useBucksContract,
} from "@/composables";
import { ref } from "vue";
import { useAsyncState, useEventBus } from "@vueuse/core";
import { notify } from "notiwind";
import IconJoe from "@/assets/icons/joe.svg";

const joeLinks = [

  {
    icon: IconJoe,
    href: "https://traderjoexyz.com/avalanche/pool/v1/AVAX/0xc94f5c4a091418d03ff1989b48db3139d1af0d25",
  } ];

const { on: onAppEvent, emit: emitAppEvent } = useEventBus("app");
const { address, isAuthenticated, isAuthenticating, login } = useUser();
const { symbolJLP, allowanceJLP, approveJLP, balanceOfJLP } =
  useJLPContract(address);
const { symbolBucks, balanceOfBucks } = useBucksContract(address);
const { myDepositedLP, pendingRewards, depositLP, withdrawMyLPAndRewards } =
  useRewarderContract(address);

const JLPCount = ref(0)

const loadAllowanceState = async () => {
  try {
    const [_symbolBucks, _symbolJLP, _allowanceJLP] = await Promise.all([
      symbolBucks(),
      symbolJLP(),
      loadUserAllowance(),
    ]);

    return Promise.resolve({
      symbolBucks: _symbolBucks,
      symbolJLP: _symbolJLP,
      allowanceJLP: _allowanceJLP,
    });
  } catch (error) {
    notify({
      type: "error",
      title: "Allowance State",
      text: error.reason ?? error.message,
    });
  }
  return Promise.resolve({
    symbolBucks: "BUCKS",
    symbolJLP: "JLP",
    allowanceJLP: 0,
  });
};

const loadUserAllowance = async () => {
  if (!isAuthenticated.value) return 0;

  const _allowanceJLP = await allowanceJLP();
  return Promise.resolve(_allowanceJLP);
};

const { state: allowanceState, execute: loadAllowance } = useAsyncState(
  () => loadAllowanceState(),
  {},
  { resetOnExecute: false }
);

const approvalPending = ref(false);
const stakePending = ref(false);
const withdrawPending = ref(false);


const setApprove = async (_count) => {
  approvalPending.value = true;
  try {
    const tx = await approveJLP(_count);
    const receipt = await tx.wait();
    notify({
      type: "success",
      title: "Allowance",
      text: `${_count === 0 ? "Revoked" : "Approved"} $${
        allowanceState.value.symbolJLP
      } allowance`,
    });
    emitAppEvent({ type: "tokensChanged" });
    return Promise.resolve(receipt);
  } catch (error) {
    notify({
      type: "error",
      title: "Allowance",
      text: error.reason ?? error.message,
    });
  } finally {
    approvalPending.value = false;
  }
};

const withdrawAll = async () => {
  withdrawPending.value = true;
  try {
    const tx = await withdrawMyLPAndRewards();
    const receipt = await tx.wait();
    notify({
      type: "success",
      title: "Withdrawl",
      text: `Withdrew LP and Rewards`,
    });
    emitAppEvent({ type: "tokensChanged" });
    return Promise.resolve(receipt);
  } catch (error) {
    notify({
      type: "error",
      title: "Withdrawl",
      text: error.reason ?? error.message,
    });
  } finally {
    withdrawPending.value = false;
  }
};



const depositThatLP = async (_counter) => {
  stakePending.value = true;
  try {
    const tx = await depositLP(_counter);
    const receipt = await tx.wait();
    notify({
      type: "success",
      title: "Staking",
      text: `LP Deposited`,
    });
    emitAppEvent({ type: "tokensChanged" });
    return Promise.resolve(receipt);
  } catch (error) {
    notify({
      type: "error",
      title: "Staking",
      text: error.reason ?? error.message,
    });
  } finally {
    stakePending.value = false;
  }
};



const loadContractState = async () => {
  try {
    const [user] = await Promise.all([loadUserState()]);

    return Promise.resolve({
      ...user,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadUserState = async () => {
  if (!isAuthenticated.value)
    return Promise.resolve({
      myDepositedLP: 0,
      balanceOfBucks: 0,
      balanceOfJLP: 0,
      pendingRewards: 0,
    });
  try {
    const [_myDepositedLP, _balanceOfBucks, _balanceOfJLP, _pendingRewards] =
      await Promise.all([
        myDepositedLP(),
        balanceOfBucks(),
        balanceOfJLP(),
        pendingRewards(),
      ]);

    return Promise.resolve({
      myDepositedLP: _myDepositedLP,
      balanceOfBucks: _balanceOfBucks,
      balanceOfJLP: _balanceOfJLP,
      pendingRewards: _pendingRewards,

    });
  } catch (error) {
    console.log("----------------------------------------------------------");
    console.log(error);
    console.log("----------------------------------------------------------");
  }
  return Promise.resolve({
    myDepositedLP: 0,
    balanceOfBucks: 0,
    balanceOfJLP: 0,
    pendingRewards: 0,
  });
};

const { state, execute: loadStats } = useAsyncState(
  () => loadContractState(),
  {},
  { resetOnExecute: false }
);

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => {
      loadAllowance();
      loadStats();
    },
    tokensChanged: () => {
      loadAllowance();
      loadStats();
    },
  };

  events[type]?.() ?? null;
});
</script>

<template>
  <div class="self-center w-full py-12 px-2 max-w-[1400px] mx-auto px-4">
    <div class="flex flex-wrap justify-between items-center">
      <div class="text-center mx-auto md:mx-0 font-celaraz">
        <div class="font-black text-5xl text-blue-300">
          Cerveau AI $BUCKS Farm
        </div>
        <div class="text-2xl text-blue-300">Deposit JLP to earn rewards</div>
        <div class="mt-2 mb-8 text-xs text-blue-200">
          150,000 $BUCKS rewards over 60 days
        </div>
      </div>

      <template v-if="isAuthenticated">
        <div class="max-w-[300px] text-center grid gap-4 mx-auto md:mx-0">


          <Button
            :loading="approvalPending"
            :disabled="approvalPending || !isAuthenticated || isAuthenticating"
            @click="
              allowanceState.allowanceJLP === 0
                ? setApprove(1234567890)
                : setApprove(0)
            "
          >
            {{ allowanceState.allowanceJLP === 0 ? "Approve" : "Revoke" }} $JLP
            spending
          </Button>


          <Button
            :disabled="!allowanceState.allowanceJLP || stakePending || state.balanceOfJLP==0"
            :loading="stakePending"
            @click="depositThatLP(Number(state.balanceOfJLP))"
          >
            Stake All BUCKS/AVAX JLP
          </Button>

          <Button 
            :disabled="state.myDepositedLP==0 || withdrawPending" 
            :loading="withdrawPending"
            @click="withdrawAll()"
          >
            Withdraw All LP and Rewards
          </Button>


          <div class="text-left self-end">
            <div class="text-xs">
              $JLP amount to deposit
            </div>
            <div class="text-gold-500 max-w-[100px]">
              <input type="number" min="0" class="input input--default text-center" v-model="JLPCount" />
            </div>
          </div>
          <div class="text-left self-end">
            <Button
              :disabled="!JLPCount || !allowanceState.allowanceJLP || stakePending || state.balanceOfJLP==0"
              :loading="stakePending"
              @click="depositThatLP(Number(JLPCount))"
            >
              Stake JLP
            </Button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="max-w-[300px] grid gap-4 text-center mx-auto md:mx-0"></div>
      </template>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
      <div
        class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center"
      >
        <div class="text-xs font-celaraz">My Staked JLP</div>
        <div class="font-bold">{{ state.myDepositedLP }} $JLP</div>
      </div>
      <div
        class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center"
      >
        <div class="text-xs font-celaraz">My Claimable Rewards</div>
        <div class="font-bold">{{ state.pendingRewards }} $BUCKS</div>
      </div>
      <div
        class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center"
      >
        <div class="text-xs font-celaraz">My $JLP balance</div>
        <div class="font-bold">{{ state.balanceOfJLP }} $JLP</div>
      </div>
      <div
        class="px-6 py-4 shadow-sm bg-gradient-to-tr from-red-200/10 rounded-2xl flex justify-between items-center"
      >
        <div class="text-xs font-celaraz">My $BUCKS balance</div>
        <div class="font-bold">{{ state.balanceOfBucks }} $BUCKS</div>
      </div>
    </div>
    <div class="mt-4 text-xs text-center flex flex-wrap gap-2 md:gap-6 italic">
      <div class="text-blue-200">
        Get JLP tokens by depositing LP into the TraderJoe BUCKS/AVAX LP pool.
      </div>
      <a
      v-for="({ href, icon }, index) in joeLinks"
      :key="index"
      :href="href"
      target="_blank"
      class="text-white transition hover:text-white/70 active:text-white"
    >
      <component :is="icon" class="w-6 h-6" />
    </a>
      <div class="text-blue-200">
        Earn $BUCKS rewards split among all LP stakers.
      </div>
    </div>
  </div>
</template>
