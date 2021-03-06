import '@/assets/style/layout.scss'

import Vue from 'vue'
import XEUtils from 'xe-utils'
import VXEUtils from 'vxe-utils'
import axios from 'axios'
import VueAxios from 'vue-axios'

import utils from '@/common/utils'
import router from '@/router'
import store from '@/store'
import App from '@/App'

import PageColumn from '@/views/layout/Column.vue'
import PageRow from '@/views/layout/Row.vue'
import PageAside from '@/views/layout/Aside.vue'
import PageHeader from '@/views/layout/Header.vue'
import PageMain from '@/views/layout/Main.vue'
import PageFooter from '@/views/layout/Footer.vue'

// Component
Vue.component(PageColumn.name, PageColumn)
Vue.component(PageRow.name, PageRow)
Vue.component(PageAside.name, PageAside)
Vue.component(PageHeader.name, PageHeader)
Vue.component(PageMain.name, PageMain)
Vue.component(PageFooter.name, PageFooter)

// Plugins
Vue.use(VXEUtils, XEUtils, {mounts: ['cookie']})
Vue.use(VueAxios, axios)

// Config
XEUtils.mixin(utils)
Vue.config.productionTip = false // 阻止Vue生产提示

// Router
router.beforeEach((to, from, next) => {
  document.title = XEUtils.getMetaTitle(to)
  next()
})

// **************** （注意：该全局变量仅用于开发环境调试） ****************
if (process.env.NODE_ENV === 'development') {
  window.Vue = Vue
  window.XEUtils = XEUtils
  window.axios = axios
  window.store = store
  window.router = router
}
// **************** （注意：该全局变量仅用于开发环境调试） ****************

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {
    App
  }
})
