// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import Auth from '@/utils/Auth'
import VModal from 'vue-js-modal'
import Video from 'twilio-video'
// https://chats-backend.mars.studio/
Vue.use(BootstrapVue)
Vue.use(VueSocketio, 'https://chats-backend.mars.studio/?token=' + `${Auth().getToken()}`)
Vue.prototype.$auth = new Auth()
Vue.prototype.$video = Video
Vue.use(VModal, { dynamic: true })
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
