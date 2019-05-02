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
            <textarea>{{abiCode}}</textarea>
            <button class="modal-default-button" @click="$emit('close')">
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
        abiCode:''
      }
    },
    computed: {
    },
    mounted() {
      let compiledCode = JSON.parse(localStorage.getItem('compiledCode'))
      if(compiledCode !== null){
        this.abiCode = JSON.stringify(compiledCode, null, "\t")
      }
      else
        this.abiCode = '';
    },
    methods: {
    }
  };
</script>
