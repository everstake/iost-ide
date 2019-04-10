<template>
  <div class="toolsBlock">
    <WalletInfo></WalletInfo>
    <SelectContract ref="sel"></SelectContract>
    <input type="text"  v-model="contractAddress" placeholder="Address">
    <input type="text"  v-model="methodName" placeholder="method">
    <button @click="deploy" class="button-deploy">Deploy Smart Contract</button>
    <button @click="compile" class="button-compile">Compile Smart Contract</button>
    <input type="checkbox" id="checkbox" v-model="checked"><label for="checkbox">Auto compile</label>
  </div>
</template>

<script>
  import WalletInfo from './WalletInfo'
  import SelectContract from './SelectContract'
  import tabsStorage from './Tabs/tabsStorage'
  import Compiler from '../compile/contract'
  import IOST from 'iost'
  import ETH from 'ethjs'
  export default {
    name: 'ToolsPanel',
    data() {
      return {
        fileName:'',
        checked:false,
        contractAddress:'',
        methodName:''
      }
    },
    methods: {
      deploy() {
        let iost = IWalletJS.newIOST(IOST)

        //GdAC8CzuBSwGHHGTGHxeFvDNVg6msQPkzdjgcpXoB6XP
        //ContractGdAC8CzuBSwGHHGTGHxeFvDNVg6msQPkzdjgcpXoB6XP
        //Contract9p1K4gNqRuNrh6xK1xV5RN1MqX7xhxaqiV7FL7NwbNPM
        const contractAddress = this.contractAddress
        if (contractAddress !== ''){
         //DEPLOY FROM ACCOUNT
         let tx = iost.callABI(contractAddress, "hello", ['test'])
         iost.signAndSend(tx)
           .on('pending', (pending) => {
             console.log(pending, 'pending')
           })
           .on('success', (result) => {
             console.log(result,'result')
           })
           .on('failed', (failed) => {
             console.log(failed, 'failed')
             console.log(failed.message)
           })
        } else {
          //DEPLOY FROM LOCALSTORAGE
          if ((this.fileName == this.$refs.sel.selected) && (localStorage.getItem('compiledCode') != '') && tabsStorage.get(this.fileName,'code') != undefined){
            let iost = IWalletJS.newIOST(IOST)
            let code = tabsStorage.get(this.fileName,'code')
            //code = code.replace(/\n/g, " ")
            let abi = localStorage.getItem('compiledCode')
            let vmContract = {"info":abi, "code":code}
            let tx = iost.callABI("system.iost", "setCode", [vmContract])
            iost.signAndSend(tx)
              .on('pending', (pending) => {
                console.log(pending, 'pending')
              })
              .on('success', (result) => {
                console.log(result,'result')
              })
              .on('failed', (failed) => {
                console.log(failed, 'failed')
                console.log(failed.message)
              })
          } else {
            console.log('Errror!')
          }
        }
      },
      compile() {
        this.fileName = this.$refs.sel.selected
        let fText = tabsStorage.get(this.fileName, 'code')
        try {
          let res = Compiler.processContract(fText)
          if(res.length >0 )
          {
            localStorage.setItem('compiledCode', res)
            this.$parent.$parent.$parent.$refs.compiler.code = 'Success!'
          }
        } catch (e) {
          this.$parent.$parent.$parent.$refs.compiler.code = e.message
        }
      },
      changeFile(hash){
        this.fileName = hash
        localStorage.setItem('compiledCode', '')
        if(this.checked){
          this.compile()
        }
      }
    },
    watch: {
      checked() {
        if(this.checked){
          this.compile()
        }
      }
    },
    components: {
      WalletInfo,
      SelectContract
    }
  }
</script>
