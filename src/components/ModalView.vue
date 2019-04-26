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
            <input id="id" v-model="newName" type="text" />
            <button class="modal-default-button" @click="saveNewNameTab()">
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
  import expiringStorage from './Tabs/expiringStorage'
  import tabsStorage from './Tabs/tabsStorage'

  export default {
    name: 'ModalView',
    props: {
      id: { default: null },
      name: { required: true },
      hash: { required: true }
    },
    data(){
      return {
        newName:''
      }
    },
    computed: {
      storageKey() {
        return `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
      },
    },
    mounted() {
      this.newName = this.name
    },
    methods: {
      saveNewNameTab(){
        //console.log(this.newName)
        let tabs = this.$parent.tabs
        for(let i=0;i<tabs.length;i++){
          if(tabs[i].id == this.id){
           tabs[i].name = this.newName
            tabsStorage.setName(this.hash, this.newName)
          }
        }
        this.$emit('close')
      }

    }
  };
</script>
