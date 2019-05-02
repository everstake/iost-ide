<template>
  <div>
    <div class="contract-line" :title=this.contractID>
      <span style="">{{this.contractID}}</span>
      <span v-clipboard="this.copyAddress"
            @success="handleSuccess"
            @error="handleError"
            class="button-copy">Copy</span>
    </div>
    <ul class="methodInfoLine">
      <li v-for="call in this.calls">
        <div style="width:100%" v-if="call.args.length>0">
          <input v-for="arg in call.args" type="text" v-model="arg.value" :placeholder="arg.name" />
        </div>
        <button @click="callMethod(call.name)">{{call.name}}</button>
        <div class="call-response" v-bind:id=createID(call.name) v-model="call.response"></div>
      </li>
    </ul>
  </div>
</template>
<script>
  import Deploy from '../contract/deploy'
  export default {
    name: 'ContractMethodsList',
    props: {
      contractID:String,
      methods:Array,
      isDeploy: Boolean
    },
    mounted(){
      Deploy.init(400000, 1)
    },
    computed:{
      copyAddress(){
        return this.contractID
      },
      calls(){
        let calls = []
        for(let i=0;i<this.methods.length;i++) {
          let args = []
          for(let j=0;j<this.methods[i].args.length;j++){
            let arg = {
              id:j,
              name:this.methods[i].args[j],
              value:''
            }
            args.push(arg)
          }
          calls.push({name:this.methods[i].name,args:args,response:''})
        }
        return calls
      }
    },
    methods: {
      handleSuccess(e) {
        console.log(e);
      },
      handleError(e) {
        console.log(e);
      },
      callMethod(methodName){
        function toConsole(ref, text){
          let code = ''
          if(ref.$parent.$parent.$parent.$parent.$parent.$refs.compiler.code.length>0)
            code = ref.$parent.$parent.$parent.$parent.$parent.$refs.compiler.code
          ref.$parent.$parent.$parent.$parent.$parent.$refs.compiler.code = text + '\n' + code
        }
        function currentTime(){
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

          return h+':'+m+':'+d.getSeconds()+' '+l;
          //return date.getHours() + ":" + date.getMinutes()+":"+date.getSeconds()
        }
        for(let i=0;i<this.calls.length;i++) {
          if(this.calls[i].name == methodName) {
            let methodArgs = []
            for(let j=0;j<this.calls[i].args.length;j++){
              methodArgs.push(this.calls[i].args[j].value)
            }
            Deploy.callContract(this.contractID, methodName, methodArgs).on('pending', (pending) => {
              this.calls[i].response = 'pending ...'

              toConsole(this, '-------------------------------------------')
              toConsole(this, methodName+' is pending tx_hash:'+pending)
              toConsole(this, '-------------------------------------------')

              //this.$parent.$parent.$parent.$parent.$parent.$refs.compiler.code += '\n'+methodName+' is pending tx_hash:'+pending;
              document.getElementById(this.createID(methodName)).innerHTML = this.calls[i].response
            }).on('success', (result) => {
              this.calls[i].response = JSON.parse(result.returns[0])[0]
              document.getElementById(this.createID(methodName)).innerHTML = JSON.parse(result.returns[0])[0]

              let ram = 0, igas = 0;

              if(result.ram_usage.length>0)
                ram = result.ram_usage
              if(result.gas_usage !== undefined)
                igas = result.gas_usage

              toConsole(this, 'Ram used:'+ram)
              toConsole(this, 'iGas used:'+igas)
              toConsole(this, 'Tx hash:'+result.tx_hash)
              toConsole(this, 'Response status:'+result.status_code)
              toConsole(this, '--------------------CallMethod:'+methodName+' at time '+currentTime() +'--------------------')
              return result
            }).on('failed', (failed) => {
              if(failed.message !== undefined){
                this.calls[i].response = failed.message
                toConsole(this,failed.message)
              }
              else{
                this.calls[i].response = failed
                toConsole(this,failed)
              }
              document.getElementById(this.createID(methodName)).innerHTML = 'failed'
            })
          }
        }
      },
      createID(name){
        return 'resMethodOf'+name
      },
    }
  }
</script>
