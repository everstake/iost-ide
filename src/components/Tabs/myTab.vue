<template>
  <section v-show="isActive"
           :aria-hidden="! isActive"
           class="tabs-component-panel h100"
           :id="computedId"
           role="tabpanel"
  >
    <div class="h100">
      <ContractCode :tabHash="this.hash" :contractCode="this.code" ></ContractCode>
    </div>
  </section>
</template>

<script>
  import ContractCode from '../ContractCode'
  export default {
    name: 'myTab',
    props: {
      id: { default: null },
      name: { required: true },
      prefix: { default: '' },
      suffix: { default: '' },
      isDisabled:{ default: false },
      code: {default: ''},
      modal: { default: false }
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
