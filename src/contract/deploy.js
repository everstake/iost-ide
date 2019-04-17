var tabsStorage = require('../components/Tabs/tabsStorage')
var IOST = require('iost')

class Deploy{
  init(gasLimit, gasRatio){
    this.iost = window.IWalletJS.newIOST(IOST)
    this.iost.config.gasLimit = gasLimit//400000
    this.iost.config.gasRatio = gasRatio//1
    this.rpc = new IOST.RPC(new IOST.HTTPProvider('http://13.52.105.102:30001'))
  }

  isConnect(){
   if(window.IWalletJS.account != null){
     return true
   }
   else{
     return false
   }
  }

  getCode(hash){
    return tabsStorage.default.get(hash,'code')
  }

  getABI(){
    return localStorage.getItem('compiledCode')
  }

  makeStruct(hashCode){
    return JSON.stringify({"info":JSON.parse(this.getABI()), "code":this.getCode(hashCode)})
  }

  createContract(hashCode){
    let tx = this.iost.callABI("system.iost", "setCode", [this.makeStruct(hashCode)])
    return this.iost.signAndSend(tx)
  }

  callContract(contractID, abi, args){
    let tx = this.iost.callABI(contractID, abi, args)
    return this.iost.signAndSend(tx)
  }

  getListOfMethods(contractAccount){
    let methodsList = []
    this.rpc.getProvider().send('GET', 'getContract/'+contractAccount+'/true').then((r)=>{
      console.log(r)
      for(let i=0; i<r.abis.length; i++){
        methodsList.push(r.abis[i])
      }
    }).catch(e => {
      console.log(e);
    });
    return methodsList
  }

}
export default new Deploy()
//ContractGWnaeJjb2bqo8LgHJhbKUSCVLCJjSvkdrJPjbDM5onSw
