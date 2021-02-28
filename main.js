import Vue from 'vue'
import App from './App'

import store from './store'
import common from 'common/js/common.js'

Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$common = common

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
