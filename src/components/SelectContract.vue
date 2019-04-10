<template>
  <div>
    <select v-model="selected" name="list-contract" @change="onSelected(selected)" id="contracts-list">
      <option v-for="tab in tabs" v-bind:value="tab.value" >{{tab.text}}</option>
    </select>
  </div>
</template>
<script>
  import tabsStorage from './Tabs/tabsStorage'
  import expiringStorage from './Tabs/expiringStorage'
  export default {
    name: 'SelectContract',
    data() {
      return {
        selected: ''
      }
    },
    created(){
      this.selected = expiringStorage.get(this.storageKey)
    },
    mounted(){
      if(expiringStorage.get(this.storageKey) != this.selected)
        this.selected = expiringStorage.get(this.storageKey)
    },
    computed: {
      storageKey() {
        return `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
      },
      tabs: function(){
        let t = []
        let hashList = tabsStorage.getArray()
        for(let i=0;i<hashList.length;i++){
          t.push({
            text:tabsStorage.get('#'+hashList[i],'name'),
            value:'#'+hashList[i],
          })
        }
        return t
      },
    },
    methods: {
      onSelected(e){
          document.querySelectorAll("a[href='"+this.selected+"']")[0].click()
          this.$parent.changeFile(this.selected)
        }
    }
  }
</script>
