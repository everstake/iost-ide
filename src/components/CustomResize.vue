<template>
  <Multipane class="custom-resizer" layout="vertical">
    <div class="pane" :style="{ minWidth: '50%', width: '70%', maxWidth: '80%' }">
      <div>
        <Tabs ref="tabs"></Tabs>
      </div>
    </div>

    <multipane-resizer></multipane-resizer>
    <div class="pane" :style="{ flexGrow: 1 }">
        <ToolsPanel ref="tools"></ToolsPanel>
    </div>
  </Multipane>
</template>

<script>
const Multipane = () => import('./resizer/Multipane')
const MultipaneResizer = () => import('./resizer/multipane-resizer')
const Tab = () => import('./Tabs/Tab')
const Tabs = () => import('./Tabs/Tabs')
const ToolsPanel = () => import('./ToolsPanel')

export default {
  name: 'CustomResize',
  components: {
    ToolsPanel,
    Multipane,
    MultipaneResizer,
    Tab,
    Tabs
  }
}
</script>
