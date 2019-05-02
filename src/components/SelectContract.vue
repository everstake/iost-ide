<template>
  <div class="selectBox">
    <dropdown ref="dd-contract-list"
              :options="arrayOfObjects"
              :selected="object"
              v-on:updateOption="methodToRunOnSelect"
    ></dropdown>
  </div>
</template>
<script>
  import tabsStorage from './Tabs/tabsStorage'
  import expiringStorage from './Tabs/expiringStorage'
  import dropdown from './Dropdown'

  export default {
    name: 'SelectContract',
    data() {
      return {
        object: {
          name: 'Object Name',
          value: null
        }
      }
    },
    created(){
      this.object.name = 'Choose Contract'
    },
    mounted(){
      if(expiringStorage.get(this.storageKey) != this.object.name){
        this.object.value = expiringStorage.get(this.storageKey)
      }
    },
    computed: {
      storageKey() {
        return `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
      },
      arrayOfObjects: function(){
        let tabs = this.$parent.$parent.$children[1].tabs;
        let opts = []
        for(let i=0;i<tabs.length;i++) {
          opts.push({
            name:tabs[i].name,
            value:tabs[i].hash,
          })
        }
        return opts
      }
    },
    methods: {
      methodToRunOnSelect(e) {
          this.object = e;
          document.querySelectorAll("a[href='"+e.value+"']")[0].click()
          this.$parent.changeFile(e.value)
      }
    },
    components: {
      'dropdown': dropdown,
    },
  }
</script>
