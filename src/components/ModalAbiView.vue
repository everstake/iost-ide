<template>
  <div class="modal-mask" >
    <div class="modal-wrapper">
      <div class="modal-container" @click="">

        <div class="modal-header">
          <slot name="header">
          </slot>
        </div>

        <div class="modal-body">
          <slot name="body">
            <textarea>{{abiCode}}</textarea>
            <button class="modal-default-button" @click="saveAbi()">
              OK
            </button>
            <button class="modal-default-button" @click="$emit('close')">
              Close
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
      this.abiCode = localStorage.getItem('compiledCode')
    },
    methods: {
      saveAbi(){
        this.$emit('close')
      }

    }
  };
</script>
