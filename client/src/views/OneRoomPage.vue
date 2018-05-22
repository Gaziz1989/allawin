<template>
	<div class="mainInfo">
        <h5>Комната: {{this.room ? this.room.id : this.room}}</h5>
        <div class="chat">
          <div class="messages" v-for="(message, index) in messages">
            <span :class="smsclass(message) + ' download'"  v-if="message.type === 'file'">
              <a :href="message.file" target='_blank' preload="none" download>{{message.text}}</a>
            </span>
            <span :class="smsclass(message) + ' img'"  v-else-if="message.type === 'image'">
              <img :src="message.preview1" alt="Фото" width="180">
            </span>
            <span :class="smsclass(message) + ' video'"  v-else-if="message.type === 'video'">
              <video width="320" height="240" controls>
                <source :src="message.preview2">
              </video>
            </span>
            <span :class="smsclass(message) + ' audio'"  v-else-if="message.type === 'audio'">
              <audio controls>
                <source :src="message.file">
              </audio>
            </span>
            <span :class="smsclass(message)" v-else>{{message.from ? message.from.email : message.fromId}} : {{message.text}}</span>
          </div>
          <div class="sending">
            <input type="text" name="text" class="sendInput" v-model="message">
            <button @click="createMessage" :class="buttonclass" :disabled="disabled">Send</button>
          </div>
        </div>
        <div class=buttons>
          <div class="inputforimg">
            <label title="Загрузить файл" class='uploadlabel'>
              <div>
                <span>Файл</span>
                <input class="imginp" type="file" @change="onFileChange">
              </div>
            </label>
          </div>
          <div class="inputforimg">
            <label title="Загрузить видео" class='uploadlabel'>
              <div>
                <span>Видео</span>
                <input class="imginp" type="file" @change="onVideoChange">
              </div>
            </label>
          </div>
          <div class="inputforimg">
            <label title="Загрузить аудио" class='uploadlabel'>
              <div>
                <span>Аудио</span>
                <input class="imginp" type="file" @change="onAudioChange">
              </div>
            </label>
          </div>
          <div class="inputforimg">
            <label title="Загрузить фото" class='uploadlabel'>
              <div>
                <span>Фото</span>
                <input class="imginp" type="file" @change="onPhotoChange">
              </div>
            </label>
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
        let response1 = await MessagesService.gettwiliotoken()
        this.$auth.saveTwillioToken(response1.data.token)
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
      leaving () {
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++114')
      },
      onFileChange (event) {
        var files = event.target.files || event.dataTransfer.files
        if (!files.length) {
          return
        }
        this.createFile(files[0])
      },
      createFile (file) {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          this.$socket.emit('uploadFile', {
            file: file,
            filename: file.name,
            room: this.room
          })
        }
      },
      onVideoChange (event) {
        var files = event.target.files || event.dataTransfer.files
        if (!files.length) {
          return
        }
        this.createVideo(files[0])
      },
      createVideo (file) {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          this.$socket.emit('uploadVideo', {
            video: file,
            filename: file.name,
            room: this.room
          })
        }
      },
      onAudioChange (event) {
        var files = event.target.files || event.dataTransfer.files
        if (!files.length) {
          return
        }
        this.createAudio(files[0])
      },
      createAudio (file) {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          this.$socket.emit('uploadAudio', {
            audio: file,
            filename: file.name,
            room: this.room
          })
        }
      },
      onPhotoChange (event) {
        var files = event.target.files || event.dataTransfer.files
        if (!files.length) {
          return
        }
        this.createPhoto(files[0])
      },
      createPhoto (file) {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          this.$socket.emit('uploadImage', {
            photo: file,
            filename: file.name,
            room: this.room
          })
        }
      },
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
    border-radius: 10px;
    width: 100%;
    height: 450px;
  }
  .messages {
    width: 100%;
    height: 80%;
    padding: 5px;
    overflow-y: auto;
    overflow-x: auto;
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
  .download {
    cursor: pointer;
  }
  .img {
    cursor: pointer;
  }
  .video {
    cursor: pointer;
  }
  .audio {
    cursor: pointer;
  }
  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
    width: 100%;
    height: 450px;
  }
  .inputforimg{
    margin: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .uploadlabel {
    border: 1px solid black;
    background: grey;
  }
  .imginp {
    display: none;
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