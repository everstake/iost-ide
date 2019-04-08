<template>
  <div class="tabs-component">
    <ul role="tablist" class="tabs-component-tabs">
      <li @click="onClick">+</li>
      <li
        v-for="(tab, i) in tabs"
        :key="i"
        :class="{ 'is-active': tab.isActive, 'is-disabled': tab.isDisabled }"
        class="tabs-component-tab"
        role="presentation"
        v-show="tab.isVisible"
      >
        <a v-html="tab.header"
           :aria-controls="tab.hash"
           :aria-selected="tab.isActive"
           @click="selectTab(tab.hash, $event)"
           :href="tab.hash"
           class="tabs-component-tab-a"
           role="tab"
        ></a>
        <span v-on:click="deleteTab(tab.hash)" class="close"></span>
      </li>
    </ul>
    <div id="codeList" class="tabs-component-panels">
      <slot/>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Tab from './Tab'
  import expiringStorage from './expiringStorage'

  export default {
    name: 'Tabs',
    props: {
      cacheLifetime: {
        default: 5,
      },
      options: {
        type: Object,
        required: false,
        default: () => ({
          useUrlFragment: true,
          defaultTabHash: null,
        }),
      },
    },
    data: () => ({
      tabCounter: 0,
      tabs: [],
      activeTabHash: '',
      activeTabIndex: 0,
      lastActiveTabHash: '',
    }),
    computed: {
      storageKey() {
        return `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
      },
    },
    created() {
      this.tabs = this.$children;
    },
    mounted() {
      window.addEventListener('hashchange', () => this.selectTab(window.location.hash));
      if (this.findTab(window.location.hash)) {
        this.selectTab(window.location.hash);
        return;
      }
      const previousSelectedTabHash = expiringStorage.get(this.storageKey);
      if (this.findTab(previousSelectedTabHash)) {
        this.selectTab(previousSelectedTabHash);
        return;
      }
      if(this.options.defaultTabHash !== null && this.findTab("#" + this.options.defaultTabHash)) {
        this.selectTab("#" + this.options.defaultTabHash);
        return;
      }
      if (this.tabs.length) {
        this.selectTab(this.tabs[0].hash);
      }
    },
    methods: {
      findTab(hash) {
        return this.tabs.find(tab => tab.hash === hash);
      },
      deleteTab(selectedTabHash){
        for(var i=0; i<this.tabs.length; i++) {
          if(this.tabs[i].hash == selectedTabHash) {
            document.getElementById(this.tabs[i].id).remove()
            if (localStorage.getItem(this.tabs[i].hash)) {
                localStorage.removeItem(this.tabs[i].hash)
            }
            this.tabs.splice(i, 1)
          }
        }
      },
      selectTab(selectedTabHash, event) {
        // See if we should store the hash in the url fragment.
        if (event && !this.options.useUrlFragment) {
          event.preventDefault();
        }
        const selectedTab = this.findTab(selectedTabHash);
        if (! selectedTab) {
          return;
        }
        if (selectedTab.isDisabled) {
          event.preventDefault();
          return;
        }
        if (this.lastActiveTabHash === selectedTab.hash) {
          this.$emit('clicked', { tab: selectedTab });
          return;
        }
        this.tabs.forEach(tab => {
          tab.isActive = (tab.hash === selectedTab.hash);
        });
        this.$emit('changed', { tab: selectedTab });
        this.activeTabHash = selectedTab.hash;
        this.activeTabIndex = this.getTabIndex(selectedTabHash);
        this.lastActiveTabHash = this.activeTabHash = selectedTab.hash;
        expiringStorage.set(this.storageKey, selectedTab.hash, this.cacheLifetime);
      },
      setTabVisible(hash, visible) {
        const tab = this.findTab(hash);
        if (! tab) {
          return;
        }
        tab.isVisible = visible;
        if (tab.isActive) {
          // If tab is active, set a different one as active.
          tab.isActive = visible;
          this.tabs.every((tab, index, array) => {
            if (tab.isVisible) {
              tab.isActive = true;
              return false;
            }
            return true;
          });
        }
      },
      getTabIndex(hash){
        const tab = this.findTab(hash);

        return this.tabs.indexOf(tab);
      },
      getTabHash(index){
        const tab = this.tabs.find(tab => this.tabs.indexOf(tab) === index);

        if (!tab) {
          return;
        }

        return tab.hash;
      },

      getActiveTab(){
        return this.findTab(this.activeTabHash);
      },

      getActiveTabIndex() {
        return this.getTabIndex(this.activeTabHash);
      },
      onClick() {
        this.tabCounter++;
        let ComponentClass = Vue.extend(Tab)
        let instance = new ComponentClass({
          propsData: {
            id: 'Tab'+(this.tabCounter),
            name: 'New Tab '+(this.tabCounter),
            code: 'my code'
          }
        })
        let el = instance.$mount()
        document.getElementById('codeList').appendChild(el.$el)
        this.tabs.push(instance)
        instance.$mount()
        this.selectTab(instance.hash)
      }
    }
  };
</script>
