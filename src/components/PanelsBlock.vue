<template>
  <section class="ide">
    <HorizontalPane>
      <div class="resize-h-body h-pane" :style="{minHeight:'20%', maxHeight: '100%' }">
        <MainPanel></MainPanel>
      </div>
      <MultipaneResizer></MultipaneResizer>
      <div class="h-pane" :style="{ flexGrow: 1, maxHeight: '50%', minHeight: '75%' }">
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
