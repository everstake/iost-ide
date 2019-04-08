<template>
  <div class="toolsBlock">
    <WalletInfo></WalletInfo>
    <SelectContract></SelectContract>
    <button @click="deploy" class="button-deploy">Deploy Smart Contract</button>
    <button @click="compile" class="button-compile">Compile Smart Contract</button>
  </div>
</template>

<script>
  import WalletInfo from './WalletInfo'
  import SelectContract from './SelectContract'
  import Compiler from '../compile/contract'
  import IOST from 'iost'
  import ETH from 'ethjs'
  export default {
    name: 'ToolsPanel',
    data() {
      return {
        counter: 0
      }
    },
    methods: {
      deploy() {
        this.counter = this.counter-1
      },
      compile() {
        // const iost = IWalletJS.newIOST(IOST)
        // //iost.currentRPC().then(console.log)
        // const rpc = new IOST.RPC(new IOST.HTTPProvider('http://13.52.105.102:30001'));
        // rpc.blockchain.getBalance('iostgcoin', false).then(console.log);
        Compiler.processContract('folder')
        this.counter = this.counter+1
      }
    },
    watch: {
      counter() {
        console.log(this.counter)
      }
    },
    components: {
      WalletInfo,
      SelectContract
    }
  }
</script>
