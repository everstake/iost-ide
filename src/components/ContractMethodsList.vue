<template>
  <div>
    <div style="width: 50%; margin: auto;" :title=this.contractID><span style="float: left;overflow: hidden;width: 91%;">{{this.contractID}}</span><span>...</span></div>
    <ul class="methodInfoLine">
      <li v-for="call in this.calls">
        <div style="width:100%" v-if="call.args.length>0">
          <input v-for="arg in call.args" type="text" v-model="arg.value" />
        </div>
        <button @click="callMethod(call.name)">{{call.name}}</button>
        <div v-bind:id=createID(call.name) v-model="call.response"></div>
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
      calls(){
        let calls = []
        for(let i=0;i<this.methods.length;i++) {
          let args = []
          for(let j=0;j<this.methods[i].args.length;j++){
            let arg = {
              id:j,
              name:this.methods[i].name + j,
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
      callMethod(methodName){
        for(let i=0;i<this.calls.length;i++) {
          if(this.calls[i].name == methodName) {
            let methodArgs = []
            for(let j=0;j<this.calls[i].args.length;j++){
              methodArgs.push(this.calls[i].args[j].value)
            }
            Deploy.callContract(this.contractID, methodName, methodArgs).on('pending', (pending) => {
              this.calls[i].response = 'pending ...'
              document.getElementById(this.createID(methodName)).innerHTML = this.calls[i].response
            }).on('success', (result) => {
              this.calls[i].response = JSON.parse(result.returns[0])[0]
              document.getElementById(this.createID(methodName)).innerHTML = JSON.parse(result.returns[0])[0]
              return result
            }).on('failed', (failed) => {
              console.log(failed, 'failed')
              this.calls[i].response = failed.message
              this.$parent.$parent.$parent.$parent.$parent.$refs.compiler.code = failed.message
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
