<template>
  <div>
    <div>{{network}}</div>
    <div>{{account}}</div>
    <div>Amount of IOST</div>
    <div>RAM GAS</div>
  </div>
</template>
<script>
  export default {
    name: 'WalletInfo',
    computed: {
      network() {
        return window.IWalletJS.network
      },
      account() {
        return window.IWalletJS.account
      }
    }
  }
</script>
