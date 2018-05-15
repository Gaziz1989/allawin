<template>
  <div class="sidebar">
    <SidebarHeader/>
    <SidebarForm/>
    <nav class="sidebar-nav">
      <div slot="header"></div>
      <ul class="nav">
        <template v-for="(item, index) in navItems">
          <template v-if="getType(item)">
            <SidebarNavItem :classes="item.class">
              <SidebarNavLink :name="item.name" :url="item.url" :icon="item.icon" :badge="item.badge" :variant="item.variant" :title="item.name"/>
            </SidebarNavItem>
          </template>
        </template>
        <template>
          <SidebarNavItem title="Выход">
            <a @click="logout()" class="nav-link"><i class="icon-logout"></i> Выход</a>
          </SidebarNavItem>
        </template>
      </ul>
      <slot></slot>
    </nav>
    <SidebarFooter/>
    <SidebarMinimizer/>
  </div>
</template>
<script>
import SidebarFooter from './SidebarFooter'
import SidebarForm from './SidebarForm'
import SidebarHeader from './SidebarHeader'
import SidebarMinimizer from './SidebarMinimizer'
import SidebarNavDivider from './SidebarNavDivider'
import SidebarNavDropdown from './SidebarNavDropdown'
import SidebarNavLink from './SidebarNavLink'
import SidebarNavTitle from './SidebarNavTitle'
import SidebarNavItem from './SidebarNavItem'
import SidebarNavLabel from './SidebarNavLabel'
export default {
  name: 'sidebar',
  props: {
    navItems: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  components: {
    SidebarFooter,
    SidebarForm,
    SidebarHeader,
    SidebarMinimizer,
    SidebarNavDivider,
    SidebarNavDropdown,
    SidebarNavLink,
    SidebarNavTitle,
    SidebarNavItem,
    SidebarNavLabel
  },
  methods: {
    handleClick (e) {
      e.preventDefault()
      e.target.parentElement.classList.toggle('open')
    },
    getType (item) {
      if (this.$auth.currentUser().type === item.type || !item.type) {
        return true
      } else {
        return false
      }
    },
    logout () {
      this.$auth.logout()
      this.$router.push({
        name: 'greetings'
      })
      window.location.reload()
    }
  }
}
</script>

<style lang="css">
  .nav-link {
    cursor:pointer;
  }
</style>
