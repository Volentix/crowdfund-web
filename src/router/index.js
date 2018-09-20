import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Dashboard from '@/components/Dashboard'
import Contribute from '@/components/Contribute'
import Settings from '@/components/Settings'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/contribute',
      name: 'Contribute',
      component: Contribute
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})
