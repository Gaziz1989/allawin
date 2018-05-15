<template>
	<div class="mainInfo">
        <h5>Комнаты</h5>
        <div class="rooms" v-for="(room, index) in rooms">
          <span class="room" @click="choose(room)">{{index}} : {{room.id}}</span>
        </div>
        <div class="chat">
          <h6>Комната: {{this.room.id}}</h6>
          <div class="messages" v-for="(message, index) in messages">
            <span :class="smsclass(message)">{{message.text}}</span>
          </div>
          <div class="sending">
            <input type="text" name="text" class="sendInput" v-model="message">
            <button @click="send" :class="buttonclass" :disabled="disabled">Send</button>
          </div>
        </div>
  </div>
</template>

<script>
  export default {
    name: 'RoomsPage',
    components: {},
    data () {
      return {
        isConnected: false,
        rooms: [],
        subscribers: [],
        selected: false,
        room: '',
        messages: [],
        message: ''
      }
    },
    beforeMount () {
      try {
        this.$socket.emit('getrooms')
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
      choose (_item) {
        this.room = _item
        document.getElementsByClassName('chat')[0].style.display = 'flex'
        this.$socket.emit('joinroom', _item)
        this.$socket.emit('getmessages', { room: _item })
      },
      smsclass (_item) {
        if (_item.fromId === this.$auth.currentUser().id) {
          return 'mysms'
        }
      },
      async send () {
        try {
          await this.$socket.emit('send', ({
            message: this.message,
            room: this.room
          }))
          this.message = ''
        } catch (error) {
          console.log(error)
        }
      }
    },
    sockets: {
      connect () {
        this.isConnected = true
      },
      getrooms (_rooms) {
        this.rooms = _rooms
      },
      getmessages (_messages) {
        this.messages = _messages
      },
      send (_data) {
        this.messages.push(_data.message)
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