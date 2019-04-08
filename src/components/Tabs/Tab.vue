<template>
  <section v-show="isActive"
           :aria-hidden="! isActive"
           class="tabs-component-panel"
           :id="computedId"
           role="tabpanel"
  >
    <div>
      <ContractCode :tabHash="this.hash" :contractCode="this.code" ></ContractCode>
    </div>
  </section>
</template>

<script>
  import ContractCode from '../ContractCode'
  export default {
    name: 'Tab',
    props: {
      id: { default: null },
      name: { required: true },
      prefix: { default: '' },
      suffix: { default: '' },
      isDisabled:{ default: false },
      code: {default: ''}
    },
    data: () => ({
      isActive: false,
      isVisible: true,
    }),

    computed: {
      header() {
        return this.prefix + this.name + this.suffix;
      },
      computedId() {
        return this.id ? this.id : this.name.toLowerCase().replace(/ /g, '-');
      },
      hash() {
        if (this.isDisabled) {
          return '#';
        }
        return '#' + this.computedId;
      }
    },
    components: {
      ContractCode
    }
  };
</script>
