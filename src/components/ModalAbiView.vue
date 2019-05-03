<template>
  <div class="modal-mask" >
    <div class="modal-wrapper">
      <div class="abiView" @click="">

        <div class="modal-header">
          <slot name="header">
          </slot>
        </div>

        <div class="modal-body">
          <slot name="body">
            <textarea readonly="readonly">{{abiCode}}</textarea>
            <button class="modal-default-button fl"
                    v-clipboard="copyAbiData"
                    @success="handleSuccess"
                    @error="handleError"
                    @click="copyData()">
              Copy
            </button>
            <button class="modal-default-button fr" @click="$emit('close')">
              OK
            </button>
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import tabsStorage from './Tabs/tabsStorage'

  export default {
    name: 'ModalAbiView',
    props: {
    },
    data(){
      return {
        copyAbiData:0,
        abiCode:''
      }
    },
    computed: {
    },
    mounted() {
      let compiledCode = JSON.parse(localStorage.getItem('compiledCode'))
      if(compiledCode !== null){
        this.abiCode = JSON.stringify(compiledCode, null, "\t")
        this.copyAbiData = this.abiCode
      }
      else
        this.abiCode = '';
    },
    methods: {
      handleSuccess(e) {
        console.log(e);
      },
      handleError(e) {
        console.log(e);
      },
      copyData(){
        let self = this
        setTimeout(function(){
          self.$emit('close')
        }, 400);
      }
    }
  };
</script>
