<template>
  <header class="app-header navbar">
    <button class="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button" @click="mobileSidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>
    <b-link class="navbar-brand" to="#"></b-link>
    <button class="navbar-toggler sidebar-toggler d-md-down-none mr-auto" type="button" @click="sidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="flex">
    </div>
<!--     <button class="navbar-toggler aside-menu-toggler d-md-down-none" type="button" @click="asideToggle">
      <span class="navbar-toggler-icon"></span>
    </button> -->
  </header>
</template>
<script>
export default {
  name: 'c-header',
  data () {
    return {
      notifications: []
    }
  },
  async beforeMount () {},
  methods: {
    sidebarToggle (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-hidden')
    },
    sidebarMinimize (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-minimized')
    },
    mobileSidebarToggle (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-mobile-show')
    },
    // asideToggle (e) {
    //   e.preventDefault()
    //   document.body.classList.toggle('aside-menu-hidden')
    // },
    goToNotificationsPage () {
      this.$router.push({
        name: 'NotificationsPage'
      })
    }
  },
  sockets: {
    notificationAdded (_notification) {
      this.notifications.push(_notification)
    }
  }
}
</script>
<style scoped>
  .flex {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-content: center;
    height: 100%;
  }
  .meeting {
    margin-right: 15px;
    padding: 16px 0 19px 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-content: center;
  }
  .name {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-content: center;
  }
  .online {
    margin-left: 10px;
    background: #64bb6a;
    border-radius: 5px;
    padding: 1px 1px;
  }
  .notifications {
    height: 50%;
    align-self: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
  }
  .fa-envelope {
    color: #33444c;
    font-size: 2em;
    cursor: pointer;
  }
  .fa-envelope:hover {
    color: #29363d;
  }
  .unread {
    color: red;
    position: relative;
    top: 5px;
    right: 8px;
    font-size: 2em; 
  }
  @media only screen and (max-width: 768px) {
    .meeting {
      display: none;
    }
}
</style>