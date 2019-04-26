<template>
  <div :class="classnames" :style="{ userSelect }" @mousedown="onMouseDown">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'VerticalPane',
    data () {
      return {
        isResizing: false
      }
    },
    computed: {
      classnames () {
        return 'vertical-pane'
      },
      userSelect () {
        return this.isResizing ? 'none' : ''
      }
    },
    methods: {
      onMouseDown ({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
        if (resizer.className && resizer.className.match('v-multipane-resizer')) {
          let self = this
          let { $el: container, layout } = self

          let pane = resizer.previousElementSibling
          let {
            offsetWidth: initialPaneWidth,
            offsetHeight: initialPaneHeight
          } = pane

          let usePercentage = !!(pane.style.width + '').match('%')

          const { addEventListener, removeEventListener } = window

          const resize = (initialSize, offset = 0) => {
            let containerWidth = container.clientWidth
            let paneWidth = initialSize + offset

            return (pane.style.width = usePercentage
              ? paneWidth / containerWidth * 100 + '%'
              : paneWidth + 'px')
          }

          // This adds is-resizing class to container
          self.isResizing = true

          // Resize once to get current computed size
          let size = resize()

          // Trigger paneResizeStart event
          self.$emit('paneResizeStart', pane, resizer, size)

          const onMouseMove = function ({ pageX, pageY }) {
            size = resize(initialPaneWidth, pageX - initialPageX)
            self.$emit('paneResize', pane, resizer, size)
          }

          const onMouseUp = function () {
            // Run resize one more time to set computed width/height.
            size = resize(pane.clientWidth)

            // This removes is-resizing class to container
            self.isResizing = false

            removeEventListener('mousemove', onMouseMove)
            removeEventListener('mouseup', onMouseUp)

            self.$emit('paneResizeStop', pane, resizer, size)
          }

          addEventListener('mousemove', onMouseMove)
          addEventListener('mouseup', onMouseUp)
        }
      }
    }
  }

</script>
