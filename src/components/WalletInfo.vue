<template>
  <div>
    <div>{{network}}</div>
    <div>{{account}}</div>
    <div>{{amount}} IOST</div>
    <div>iRAM:{{iRAM}} iGAS:{{iGAS}}</div>
  </div>
</template>
<script>
  import IOST from 'iost'
  import ETH from 'ethjs'
  export default {
    name: 'WalletInfo',
    data: function() {
      return {
        amount:0,
        iRAM:0,
        iGAS:0,
      }
    },
    mounted() {
      let iost = IWalletJS.newIOST(IOST)
      //let rpc = iost.rpc(new IOST.HTTPProvider('http://13.52.105.102:30001'))
      iost.rpc.blockchain.getAccountInfo('iostgcoin', true).then((r) => {
          this.amount = r.balance
          this.iRAM = r.gas_info.current_total
          this.iGAS = r.ram_info.available
        }
      )
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
