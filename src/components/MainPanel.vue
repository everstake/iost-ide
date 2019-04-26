<template>
  <VerticalPane class="custom-resizer">
    <div class="pane" :style="{ minWidth: '50%', width: '70%', maxWidth: '80%' }">
      <div class="h100">
        <myTabs ref="tabs"></myTabs>
      </div>
    </div>
    <MultipaneResizer></MultipaneResizer>
    <div class="pane toolPanel" :style="{ flexGrow: 1,}">
        <ToolsPanel ref="tools"></ToolsPanel>
    </div>
  </VerticalPane>
</template>

<script>
const VerticalPane = () => import('./resizer/VerticalPane')
const MultipaneResizer = () => import('./resizer/v-multipane-resizer')

const myTab = () => import('./Tabs/myTab')
const myTabs = () => import('./Tabs/myTabs')
const ToolsPanel = () => import('./ToolsPanel')

export default {
  name: 'MainPanel',
  components: {
    ToolsPanel,
    VerticalPane,
    MultipaneResizer,
    myTab,
    myTabs
  }
}
</script>
