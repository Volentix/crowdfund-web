// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from '@/store'
import VueI18n from 'vue-i18n'
import messages from '@/translations'
import BootstrapVue from 'bootstrap-vue'
import VueProgressBar from 'vue-progressbar'
import VueNativeSock from 'vue-native-websocket'
import VueCookie from 'vue-cookie'
import VeeValidate from 'vee-validate'
import VueSwal from 'vue-swal'
import axios from 'axios'
import numeral from 'numeral'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue2-animate/dist/vue2-animate.min.css'

const options = {
  color: '#2a96b6',
  failedColor: '#c82333',
  thickness: '5px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false
}

Vue.use(VueCookie)
Vue.use(VueProgressBar, options)
Vue.use(BootstrapVue)
Vue.use(VueSwal)
Vue.use(VueI18n)
Vue.use(VeeValidate)

axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN'
axios.defaults.xsrfCookieName = 'csrftoken'

var websocketUrl
if (process.env.DEBUG) {
  axios.defaults.baseURL = 'https://cftest.volentix.com'
  websocketUrl = 'wss://cftest.volentix.com/ws/notifications?subscribe-session'
} else {
  axios.defaults.baseURL = 'http://localhost:8000'
  websocketUrl = 'ws://localhost:9000'
}

Vue.use(VueNativeSock, websocketUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000
})

const i18n = new VueI18n({
  locale: 'en',
  messages
})

Vue.config.productionTip = false

Vue.filter('two_digits', function (value) {
  try {
    if (value.toString().length <= 1) {
      return '0' + value.toString()
    }
    return value.toString()
  } catch (err) {
    return value
  }
})

Vue.filter('currency_format', function (value) {
  try {
    return numeral(value).format('0,0.00')
  } catch (err) {
    return value
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  template: '<App/>',
  components: { App }
})
