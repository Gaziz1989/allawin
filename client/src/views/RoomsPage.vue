<template>
	<div class="mainInfo">
    <h5>Комнаты</h5>
    <div class="rooms" v-for="(room, index) in rooms">
      <span class="room" @click="choose(room)">{{index}} : {{room.id}}</span>
    </div>
  </div>
</template>

<script>
  import RoomsService from '@/services/RoomsService'
  export default {
    name: 'RoomsPage',
    components: {},
    data () {
      return {
        isConnected: false,
        rooms: []
      }
    },
    async beforeMount () {
      try {
        let response = await RoomsService.getrooms()
        this.rooms = response.data.myrooms
      } catch (error) {
        console.log(error)
      }
    },
    computed: {
      disabled () {
        if (this.message && this.room) {
          return false
        } else {
          return true
        }
      },
      buttonclass () {
        if (this.message && this.room) {
          return 'mainbtn'
        } else {
          return 'dis_main_btn'
        }
      }
    },
    methods: {
      async choose (_item) {
        this.room = _item
        this.$router.push({
          name: 'OneRoomPage',
          params: {
            room: _item
          }
        })
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
  .rooms {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .room {
    width: 100%;
    text-align: center;
  }
  .room:hover {
    background: grey;
  }
  .chat {
    position: absolute;
    bottom: 5.5%;
    right: 0;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border: 1px solid black;
    border-radius: 10px;
    width: 300px;
    height: 450px;
  }
  .messages {
    width: 100%;
    height: 100%;
    padding: 15px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
  .message {
    width: 100%;
    text-align: center;
  }
  .mysms {
    align-self: flex-end;
  }
  .sending {
    width: 100%;
    height: 25px;
    margin-top: 15px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .sendInput {
    width: 100%;
    height: 25px;
    border: 1px solid #82caef;
    border-radius: 10px;
  }
  .mainbtn {
    padding: 0 15px 0 15px;
    height: 25px;
    background: #33444c;
    border: none;
    border-radius: 50px;
    color: #fafafa;
    cursor: pointer;
  }
  .dis_main_btn {
    padding: 0 15px 0 15px;
    height: 25px;
    background: grey;
    border-radius: 50px;
    border: none;
    color: #fafafa;
  }
  .mainbtn:hover {
    background: #3ca8d8;
  }
</style>