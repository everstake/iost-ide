<template>
  <section class="ide" layout="horizontal">
    <div class="resize-h-body pane">
      <div class="columns">
        <div class="column">
          <h2 class="title">IDE</h2>
        </div>
      </div>
      <CustomResize></CustomResize>
    </div>
    <CompilerPanel></CompilerPanel>
  </section>
</template>

<script>
const CustomResize = () => import('./CustomResize')
const CompilerPanel = () => import('./CompilerPanel')

export default {
  name: 'PanelsBlock',
  components: {
    CustomResize,
    CompilerPanel
  }
}
</script>
