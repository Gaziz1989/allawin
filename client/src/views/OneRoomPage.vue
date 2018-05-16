<template>
	<div class="mainInfo">
        <h5>Комната: {{this.room ? this.room.id : this.room}}</h5>
        <div class="chat">
          <div class="messages" v-for="(message, index) in messages">
            <span :class="smsclass(message)">{{message.from ? message.from.email : message.fromId}} : {{message.text}}</span>
          </div>
          <div class="sending">
            <input type="text" name="text" class="sendInput" v-model="message">
            <button @click="createMessage" :class="buttonclass" :disabled="disabled">Send</button>
          </div>
        </div>
  </div>
</template>

<script>
  import MessagesService from '@/services/MessagesService'
  export default {
    name: 'OneRoomPage',
    components: {},
    data () {
      return {
        room: ' ',
        messages: [],
        message: ''
      }
    },
    async beforeMount () {
      try {
        if (!this.$route.params.room) {
          this.$router.go(-1)
        }
        this.room = this.$route.params.room
        this.$socket.emit('join', this.room)
        let response = await MessagesService.getmessages(this.$route.params.room)
        this.messages = response.data.messages
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
      smsclass (_item) {
        if (_item.fromId === this.$auth.currentUser().id) {
          return 'mysms'
        } else {
          return 'message'
        }
      },
      async createMessage () {
        try {
          await this.$socket.emit('createMessage', ({
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
      updateUserList () {

      },
      newMessage (msg) {
        this.messages.push(msg)
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
  .chat {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border: 1px solid black;
    border-radius: 10px;
    width: 100%;
    height: 450px;
  }
  .messages {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
  .message {
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