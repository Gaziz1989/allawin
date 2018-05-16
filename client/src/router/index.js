import Vue from 'vue'
import Router from 'vue-router'
import Auth from '../utils/Auth'

// Containers
import Full from '@/containers/Full'

// Views
import MainPage from '@/views/MainPage'
import RoomsPage from '@/views/RoomsPage'
import OneRoomPage from '@/views/OneRoomPage'

// Pages
import Greetings from '@/pages/GreetingsPage'
Vue.use(Router)

export default new Router({
  mode: 'hash',
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      name: 'greetings',
      component: Greetings
    },
    {
      path: '/mainpage',
      redirect: '/mainpage',
      name: 'Full',
      component: Auth().isLoggedIn() ? Full : Greetings,
      children: [
        {
          path: '/mainpage',
          name: 'MainPage',
          component: Auth().isLoggedIn() ? MainPage : Greetings
        },
        {
          path: '/roomspage',
          name: 'RoomsPage',
          component: Auth().isLoggedIn() ? RoomsPage : Greetings
        },
        {
          path: '/oneroompage',
          name: 'OneRoomPage',
          component: Auth().isLoggedIn() ? OneRoomPage : Greetings
        }
      ]
    }
  ]
})
