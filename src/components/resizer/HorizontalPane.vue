<template>
  <div :class="classnames" :style="{ userSelect }" @mousedown="onMouseDown">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'HorizontalPane',
    data () {
      return {
        isResizing: false
      }
    },
    computed: {
      classnames () {
        return 'horizontal-pane'
      },
      userSelect () {
        return this.isResizing ? 'none' : ''
      }
    },
    methods: {
      onMouseDown ({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
        if (resizer.className && resizer.className.match('h-multipane-resizer')) {
          let self = this
          let { $el: container, layout } = self

          let pane = resizer.previousElementSibling
          let nextPane = resizer.nextElementSibling


          let {
            offsetWidth: initialPaneWidth,
            offsetHeight: initialPaneHeight
          } = pane


          let usePercentage = !!(pane.style.height + '').match('%')

          const { addEventListener, removeEventListener } = window

          const resize = (initialSize, offset = 0) => {
              let containerHeight = container.clientHeight
              let paneHeight = initialSize + offset
              nextPane.style.height =100 - (paneHeight / containerHeight * 100) + '%'
              return (pane.style.height = usePercentage
                ? paneHeight / containerHeight * 100 + '%'
                : paneHeight + 'px')
          }

          // This adds is-resizing class to container
          self.isResizing = true

          // Resize once to get current computed size
          let size = resize()

          // Trigger paneResizeStart event
          self.$emit('paneResizeStart', pane, resizer, size)

          const onMouseMove = function ({ pageX, pageY }) {
            size = resize(initialPaneHeight, pageY - initialPageY)
            self.$emit('paneResize', pane, resizer, size)
            //self.$emit('paneResize', nextPane, resizer, size)
          }

          const onMouseUp = function () {
            // Run resize one more time to set computed width/height.
            size = pane.clientHeight

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
