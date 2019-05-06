<template>
  <div class="toolsBlock">
    <div class="bw pd10 tools-title">
      <WalletInfo></WalletInfo>
    </div>

    <SelectContract ref="sel"></SelectContract>

    <div class="bw pd10 compileInfo">
      <input type="checkbox" id="checkbox" v-model="checked"><label for="checkbox">Auto compile</label>
      <button @click="compile" class="button-compile">Compile Smart Contract</button>
      <button @click="compileAuto" style="display: none" class="hidden-button-compile"></button>
    </div>

    <div class="bw pd10 compileData" v-if="copyAbiData!==null">
      <button @click="showAbi" class="button-abi">Show ABI</button>
      <span v-clipboard="copyAbiData"
            @success="handleSuccess"
            @error="handleError"
            class="button-copy">
        <font-awesome-icon icon="copy" />
        Copy</span>
      <ModalAbiView
        v-if="compileModal"
        @close="compileModal = false"></ModalAbiView>
    </div>

    <div class="pd10 mt10">
      <button @click="deploy" class="button-deploy">Deploy Smart Contract</button>
    </div>

    <div class="bw pd10 mt10">
      <button @click="atAccount" class="button-deploy"><font-awesome-icon icon="file-import" /> Deploy from account</button>
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

  import ModalAbiView from './ModalAbiView'
  const autoError = null
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
        isDeploy:false,
        copyAbiData:null,
        compileModal:false
      }
    },
    mounted(){
      Deploy.init(1437936, 1)
    },
    methods: {
      currentTime(){
        let d = new Date();
        var h=d.getHours(),m=d.getMinutes(),l="AM";
        if(h > 12){
          h = h - 12;
        }
        if(h < 10){
          h = '0'+h;
        }
        if(m < 10){
          m = '0'+m;
        }
        if(d.getHours() >= 12){
          l="PM"
        }else{
          l="AM"
        }

        return '['+h+':'+m+':'+d.getSeconds()+' '+l+'] ';
      },
      toConsole(ref, text){
        let line = '________________________________________________________________________'
        ref.$parent.$parent.$parent.$parent.$refs.compiler.code += '\n'+ line + '\n\n' + this.currentTime()+text + '\n' + '\n'
        this.$parent.$parent.$parent.$parent.$refs.compiler.setCursor(this.$parent.$parent.$parent.$parent.$refs.compiler.$children[0].cminstance)
      },
      handleSuccess(e) {
        console.log(e);
      },
      handleError(e) {
        console.log(e);
      },
      showAbi() {
        this.compileModal=true
      },
      selectText(element) {
        var range;
        if (document.selection) {
          // IE
          range = document.body.createTextRange();
          range.moveToElementText(element);
          range.select();
        } else if (window.getSelection) {
          range = document.createRange();
          range.selectNode(element);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
        }
      },
      deploy() {
        if(!Deploy.isConnect())
        {
          this.toConsole(this,'Error! Please, connect iWallet to your browser!')
          return false
        }
        if ((this.fileHash == this.$refs.sel.object.value && (localStorage.getItem('compiledCode') != '') && tabsStorage.get(this.fileHash,'code') != undefined)) {
          Deploy.createContract(this.fileHash).on('pending', (pending) => {
            this.toConsole(this,'Pending! Contract '+this.$refs.sel.object.name+' has address '+pending)
          }).on('success', (result) => {
            this.contractAccount = JSON.parse(result.returns[0])[0]
            Deploy.getMethodsArgs(this.contractAccount).then((res) => {
              this.methodsList = res
            })
            this.isDeploy = true;

            let ram = 0, igas = 0;
            if(result.ram_usage.iostgcoin != undefined)
              ram = result.ram_usage.iostgcoin
            if(result.gas_usage !== undefined)
              igas = result.gas_usage

            let block = '\nResponse status:'+result.status_code + '\n'
            block += 'Tx hash:'+result.tx_hash + '\n'
            block += 'Contract hash:Contract'+result.tx_hash + '\n'
            block += 'iGAS used:'+igas + '\n'
            block += 'iRAM used:'+ram
            this.toConsole(this, block)

          }).on('failed', (failed) => {
            if(failed.message !== undefined)
              this.toConsole(this, 'Error! Contract '+this.$refs.sel.object.name+' cant be deployed ('+failed.message+')')
            else
              this.toConsole(this, 'Error! Contract '+this.$refs.sel.object.name+' cant be deployed ('+failed+')')
            this.isDeploy = false;
          })
        } else {
          if(this.$refs.sel.object.value == null)
            this.toConsole(this, 'Error! Choose contract for deploying!')
          if(localStorage.getItem('compiledCode') == '')
            this.toConsole(this, 'Error! Choose contract for deploying!')
        }
      },
      atAccount() {
        if (this.contractAccount != undefined) {
          Deploy.getMethodsArgs(this.contractAccount).then((res)=>{
            if(res == false){
              this.isDeploy = false
              this.toConsole(this, 'Error! Contract '+this.contractAccount+' cant be deployed (contract not found)')
            }
            else{
              this.methodsList = res
              this.isDeploy = true;
            }
          })
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
                this.copyAbiData=res
                this.toConsole(this, 'Contract '+this.$refs.sel.object.name+' compiled successfully')
                this.isCompiled = true
              }
            } catch (e) {
              this.toConsole(this, e.message)
            }
          }
        }
      },
      compileAuto(){
        this.fileHash = this.$refs.sel.object.value
        if(tabsStorage.is(this.fileHash)) {
          let fText = tabsStorage.get(this.fileHash, 'code')
          if(fText != undefined) {
            try {
              let res = Compiler.processContract(fText)
              if(res.length > 0) {
                localStorage.setItem('compiledCode', res)
                this.copyAbiData=res
                this.isCompiled = true
                if(this.autoError != 'success'){
                  this.autoError = 'success'
                  this.toConsole(this, 'Contract '+this.$refs.sel.object.name+' compiled successfully')
                }
              }
            } catch (e) {
              if(e.message != this.autoError){
                this.toConsole(this, e.message)
                this.autoError = e.message
              }
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
      ContractMethodsList,
      ModalAbiView
    }
  }
</script>
