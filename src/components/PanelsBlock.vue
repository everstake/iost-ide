<template>
  <section class="ide">
    <HorizontalPane>
      <div class="resize-h-body h-pane" :style="{minHeight:'60%', maxHeight: '90%' }">
        <MainPanel></MainPanel>
      </div>
      <MultipaneResizer></MultipaneResizer>
      <div class="h-pane" :style="{ flexGrow: 1, maxHeight: '15%', minHeight: '5%' }">
        <CompilerPanel ref="compiler"></CompilerPanel>
      </div>
    </HorizontalPane>
  </section>
</template>

<script>
const MainPanel = () => import('./MainPanel')
const CompilerPanel = () => import('./CompilerPanel')

const MultipaneResizer = () => import('./resizer/h-multipane-resizer')

import HorizontalPane from './resizer/HorizontalPane'

export default {
  name: 'PanelsBlock',
  components: {
    MainPanel,
    MultipaneResizer,
    HorizontalPane,
    CompilerPanel
  }
}
</script>
