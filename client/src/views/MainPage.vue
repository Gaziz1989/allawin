<template>
	<div class="mainInfo">
    <div class="users">
      <div class="simple">
        <h5>Пользователи</h5>
        <div class="simples" v-for="item in users">
          <span @click="choose(item.id)" class="one">{{item.email}}</span>
        </div>
      </div>
      <div class="pros">
        <h5>Профессионалы</h5>
        <div class="profs" v-for="item in pros">
          <span @click="choose(item.id)" class="one">{{item.email}}</span>
        </div>
      </div>
    </div>
    <div class="selected">
      <h6>Выбранные пользователи</h6>
      <span v-for="item in selected" @click="choose(item)" class="one">{{item}}</span>
      <button class="mainbtn" @click="createroom" v-if="this.selected.length > 0">Создать комнату</button>
    </div>
	</div>
</template>

<script>
  import UsersService from '@/services/UsersService'
  import RoomsService from '@/services/RoomsService'
  export default {
    name: 'MainPage',
    components: {},
    data () {
      return {
        isConnected: false,
        users: [],
        pros: [],
        selected: [],
        messages: [],
        message: ''
      }
    },
    async beforeMount () {
      try {
        var OneSignal = window.OneSignal || []
        OneSignal.push(() => {
          OneSignal.init({
            appId: 'f6fe8c7b-872d-41bc-823a-dd3426ab5206',
            autoRegister: true,
            notifyButton: {
              enable: true
            }
          })
          OneSignal.sendTags({id: this.$auth.currentUser().id})
        })
        let response = await UsersService.getusers()
        response.data.users.map(item => {
          if (item.type === 'user') {
            this.users.push(item)
          } else {
            this.pros.push(item)
          }
        })
      } catch (error) {
        console.log(error)
      }
    },
    methods: {
      choose (_id) {
        if (this.selected.indexOf(_id) < 0) {
          this.selected.push(_id)
        } else {
          this.selected.splice(this.selected.indexOf(_id), 1)
        }
      },
      async createroom () {
        try {
          let response = await RoomsService.createroom(this.selected)
          alert(response.data.message)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
</script>
<style scoped>
  h5 {
  	color: #404040;
  }
  .mainInfo {
  	display: flex;
  	flex-direction: column;
  	justify-content: center;
  	align-items: center;
    width: 100%;
  	box-shadow: 0 0 2px rgba(0,0,0,0.5);
    border-radius: 1px;
  	margin-bottom: 3em;
  }
  .users {
    width: 100%;
    min-height: 150px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .simple {
    width: 45%;
  }
  .pros {
    width: 45%;
  }
  .one {
    cursor: pointer;
    margin: 5px;
  }
  .one:hover {
    background: grey;
  }
  .selected {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
  .sendInput {
    width: 100%;
    height: 25px;
  }
  .mainbtn {
    padding: 0 15px 0 15px;
    height: 25px;
    background: #33444c;
    border: none;
    border-radius: 50px;
    color: #fafafa;
  }
  .mainbtn:hover {
    background: #3ca8d8;
  }
</style>