<template>
  <div>
    <select name="list-contract" id="contracts">
      <option v-for="tab in tabs">{{tab}}</option>
    </select>
  </div>
</template>
<script>
  import tabsStorage from './Tabs/tabsStorage'
  export default {
    name: 'SelectContract',
    data() {
      return {
        tabs: []
      }
    },
    created () {
      let hashList = tabsStorage.getArray()
      for(let i=0;i<hashList.length;i++){
        this.tabs.push(tabsStorage.get('#'+hashList[i],'name'))
      }

    }
  }
</script>
