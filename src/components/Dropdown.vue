<template>
  <div class="btn-group" ref="button" >
    <li @click="toggleMenu()" class="dropdown-toggle"  v-closable="{
                exclude: ['button'],
                handler: 'onClose'
              }"  v-if="selectedOption.name !== undefined">
      {{ selectedOption.name }}
      <span class="caret"></span>
    </li>

    <li @click="toggleMenu()" class="dropdown-toggle" v-if="selectedOption.name === undefined">
      {{placeholderText}}
      <span class="caret"></span>
    </li>
    <ul class="dropdown-menu" v-if="showMenu">
      <li v-for="option in options">
        <a href="javascript:void(0)" @click="updateOption(option)">
          {{ option.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        selectedOption: {
          name: '',
          value:null
        },
        showMenu: false,
        placeholderText: 'Please select an item',
      }
    },
    props: {
      options: {
        type: [Array, Object]
      },
      selected: {},
      placeholder: [String]
    },
    mounted() {
      this.selectedOption = this.selected;
      if (this.placeholder)
      {
        this.placeholderText = this.placeholder;
      }
    },
    methods: {
      updateOption(option) {
        this.selectedOption = option;
        this.showMenu = false;
        this.$emit('updateOption', this.selectedOption);
      },
      toggleMenu() {
        //if(this.showMenu == true)
        //  this.changeList(this.$parent.$parent.$parent.$children[1].tabs)
        this.showMenu = !this.showMenu;
      },
      onClose() {
        this.showMenu = false;
      },
      changeList(tabs){
        this.options = []
        for(let i=0;i<tabs.length;i++) {
          this.options.push({
            name:tabs[i].name,
            value:tabs[i].hash,
          })
        }
      }
    }
  }
</script>

