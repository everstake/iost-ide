<template>
  <div v-if="iwalletLogIn">
    <div>{{network}}</div>
    <div>{{account}}</div>
    <div>{{amount}} IOST</div>
    <div>iRAM:{{iRAM}} iGAS:{{iGAS}}</div>
  </div>
  <div v-else>Please logIn to <a href="https://www.iwallet.com/" target="_blank">iWallet!</a></div>
</template>
<script>
  import IOST from 'iost'
  import ETH from 'ethjs'
  export default {
    name: 'WalletInfo',
    data: function() {
      return {
        iwalletLogIn:false,
        amount:0,
        iRAM:0,
        iGAS:0,
      }
    },
    mounted() {
      let iost = window.IWalletJS.newIOST(IOST)
      //let rpc = iost.rpc(new IOST.HTTPProvider('http://13.52.105.102:30001'))
      iost.rpc.blockchain.getAccountInfo('iostgcoin', true).then((r) => {
          this.amount = r.balance
          this.iRAM = r.ram_info.available
          this.iGAS = r.gas_info.current_total
          this.iwalletLogIn = true;
        }).catch(e => {
          this.iwalletLogIn = false;
          console.log(e);
      });
    },
    computed: {
      network() {
        return window.IWalletJS.network
      },
      account() {
        return window.IWalletJS.account
      },
    }
  }
</script>
