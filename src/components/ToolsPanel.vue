<template>
  <div class="toolsBlock">
    <WalletInfo></WalletInfo>
    <button @click="deploy" class="button-deploy">Deploy Smart Contract</button>
    <button @click="compile" class="button-compile">Compile Smart Contract</button>
  </div>
</template>

<script>
  import WalletInfo from './WalletInfo'
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
        this.counter = this.counter+1
      }
    },
    watch: {
      counter() {
        console.log(this.counter)
      }
    },
    components: {
      WalletInfo
    }
  }
</script>
