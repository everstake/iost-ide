<template>
  <div class="toolsBlock">
    <div class="bw pd10 tools-title">
      <WalletInfo></WalletInfo>
    </div>

    <SelectContract ref="sel"></SelectContract>

    <div class="bw pd10 compileInfo">
      <input type="checkbox" id="checkbox" v-model="checked"><label for="checkbox">Auto compile</label>
      <button @click="compile" class="button-compile">Compile Smart Contract</button>
    </div>

    <div class="bw pd10 mt10">
      <button @click="deploy" class="button-deploy">Deploy Smart Contract</button>
    </div>

    <div class="bw pd10 mt10">
      <button @click="atAccount" class="button-deploy">Deploy from account</button>
      <input type="text" class="contract-account" v-model="contractAccount" placeholder="Address">
    </div>

    <div v-if="isDeploy" class="bw pd10 mt10">
      <ContractMethodsList :contractID="contractAccount" :methods=this.methodsList :isDeploy=this.isDeploy></ContractMethodsList>
    </div>
  </div>
</template>

<script>

  import WalletInfo from './WalletInfo'
  import SelectContract from './SelectContract'
  import tabsStorage from './Tabs/tabsStorage'
  import ContractMethodsList from './ContractMethodsList'

  import Compiler from '../contract/compile'
  import Deploy from '../contract/deploy'

  export default {
    name: 'ToolsPanel',
    data() {
      return {
        fileHash:'',
        checked:false,
        contractAccount:'',
        methodsList: [],
        showMethods: false,
        isCompiled:true,
        isDeploy:false
      }
    },
    mounted(){
      Deploy.init(1437936, 1)
    },
    methods: {
      deploy() {
        if(!Deploy.isConnect())
        {
          this.$parent.$parent.$parent.$parent.$refs.compiler.code = 'Error! Please, connect iWallet to your browser!'
          return false
        }
        if ((this.fileHash == this.$refs.sel.object.value && (localStorage.getItem('compiledCode') != '') && tabsStorage.get(this.fileHash,'code') != undefined)) {
          Deploy.createContract(this.fileHash).on('pending', (pending) => {
            console.log(pending, 'pending')
          }).on('success', (result) => {
            this.contractAccount = JSON.parse(result.returns[0])[0]
            Deploy.getMethodsArgs(this.contractAccount).then((res)=>{
              this.methodsList = res
            })
            this.isDeploy = true;
          }).on('failed', (failed) => {
            console.log(failed, 'failed')
            console.log(failed.message)
            this.$parent.$parent.$parent.$parent.$refs.compiler.code = 'Error! Contract '+this.$refs.sel.object.name+' cant be deployed ('+failed.message+')'
            this.isDeploy = false;
          })
        } else {
          console.log('Errror!')
          if(this.$refs.sel.object.value == null)
            this.$parent.$parent.$parent.$parent.$refs.compiler.code = 'Error! Choose contract for deploying!'
          if(localStorage.getItem('compiledCode') == '')
            this.$parent.$parent.$parent.$parent.$refs.compiler.code += '\nError! Choose contract for deploying!'
        }
      },
      atAccount() {
        if (this.contractAccount != undefined) {
          Deploy.getMethodsArgs(this.contractAccount).then((res)=>{
            this.methodsList = res
          })
          this.isDeploy = true;
        } else {
          this.isDeploy = false;
        }
      },
      compile() {
        this.fileHash = this.$refs.sel.object.value
        if(tabsStorage.is(this.fileHash)) {
          let fText = tabsStorage.get(this.fileHash, 'code')
          if(fText != undefined) {
            try {
              let res = Compiler.processContract(fText)
              if(res.length > 0) {
                localStorage.setItem('compiledCode', res)
                this.$parent.$parent.$parent.$parent.$refs.compiler.code = 'Contract '+this.$refs.sel.object.name+' compiled successfully'
                this.isCompiled = true
              }
            } catch (e) {
              this.$parent.$parent.$parent.$parent.$refs.compiler.code = e.message
            }
          }
        }
      },
      changeFile(hash) {
        this.fileHash = hash
        localStorage.setItem('compiledCode', '')
        if(this.checked) {
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
      SelectContract,
      ContractMethodsList
    }
  }
  /*
  * ram_usage:
Contract393FDvLQ56sY4fakjdLjfMznb4yG8g2RvD7snVfWX3Gm: "119"
iostgcoin: "658"
__proto__: Object
receipts: []
returns: ["["ContractBDcHFuuKEZKcbWkhjQaQ8ycxDa7eaNjtSQoj45Aj2QaQ"]"]
status_code: "SUCCESS"
  * */
</script>
