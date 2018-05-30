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
        <div class="buttons">
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
        <div class="webCam">
          <div id="remote-media"></div>
          <div id="local-media"></div>
          <div id="room-controls">
            <button id="button-join" @click="twilliocall">Video Call</button>
            <button id="button-leave" @click="leaveroom">Leave Room</button>
          </div>
        </div>
        <div class="audioCall">
          <div id="remote-media1"></div>
          <div id="room-controls1">
            <button id="button-join" @click="twilliovoicecall">Voice Call</button>
            <button id="button-leave" @click="leaveroom">Leave Room</button>
          </div>
        </div>
  </div>
</template>

<script>
  import MessagesService from '@/services/MessagesService'
  import io from 'socket.io-client'
  import Auth from '@/utils/Auth'
  import Vue from 'vue'
  export default {
    name: 'OneRoomPage',
    components: {},
    data () {
      return {
        room: ' ',
        messages: [],
        message: '',
        previewTracks: '',
        connectOptions: {
          name: '',
          logLevel: 'debug'
        },
        activeRoom: ''
      }
    },
    created: function () {
      try {
        // https://chats-backend.mars.studio/
        // http://127.0.0.1:8081
        Vue.prototype.$socket = io('https://chats-backend.mars.studio/?token=' + `${Auth().getToken()}`)
        this.$socket.on('newMessage', function (msg) {
          this.messages.push(msg)
        }.bind(this))
        this.$socket.on('errorHandle', function (msg) {
          alert(msg.text)
        })
      } catch (error) {
        console.log(error)
      }
    },
    async beforeMount () {
      try {
        if (!this.$route.params.room) {
          this.$router.go(-1)
        }
        this.room = this.$route.params.room
        this.connectOptions.name = this.$route.params.room.id
        this.$socket.emit('join', this.room.id)
        let response = await MessagesService.getmessages(this.$route.params.room.id)
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
      detachTracks (tracks) {
        tracks.map((track) => {
          track.detach().map((detachedElement) => {
            detachedElement.remove()
          })
        })
      },
      detachParticipantTracks (participant) {
        var tracks = Array.from(participant.tracks.values())
        this.detachTracks(tracks)
      },
      attachTracks (tracks, container) {
        tracks.map((track) => {
          container.appendChild(track.attach())
        })
      },
      attachParticipantTracks (participant, container) {
        var tracks = Array.from(participant.tracks.values())
        this.attachTracks(tracks, container)
      },
      roomJoined (room) {
        this.activeRoom = room
        console.log(`Joined as '` + this.$auth.currentUser().email + `'`)
        document.getElementById('button-leave').style.display = 'inline'
        // Attach LocalParticipant's Tracks, if not already attached.
        var previewContainer = document.getElementById('local-media')
        if (!previewContainer.querySelector('video')) {
          this.attachParticipantTracks(room.localParticipant, previewContainer)
        }
        // Attach the Tracks of the Room's Participants.

        if (room.participants.length > 0) {
          room.participants.map((participant) => {
            console.log(`Already in Room: '` + participant.identity + `'`)
            var previewContainer = document.getElementById('remote-media')
            this.attachParticipantTracks(participant, previewContainer)
          })
        }
        // When a Participant joins the Room, console.log the event.
        room.on('participantConnected', (participant) => {
          console.log(`Joining: '` + participant.identity + `'`)
        })
        // When a Participant adds a Track, attach it to the DOM.
        room.on('trackAdded', (track, participant) => {
          console.log(participant.identity + ` added track: ` + track.kind)
          var previewContainer = document.getElementById('remote-media')
          this.attachTracks([track], previewContainer)
        })
        // When a Participant removes a Track, detach it from the DOM.
        room.on('trackRemoved', (track, participant) => {
          console.log(participant.identity + ` removed track: ` + track.kind)
          this.detachTracks([track])
        })
        // When a Participant leaves the Room, detach its Tracks.
        room.on('participantDisconnected', (participant) => {
          console.log(`Participant '` + participant.identity + `' left the room`)
          this.detachParticipantTracks(participant)
        })
        // Once the LocalParticipant leaves the room, detach the Tracks
        // of all Participants, including that of the LocalParticipant.
        room.on('disconnected', () => {
          console.log('Left')
          if (this.previewTracks) {
            this.previewTracks.map((track) => {
              track.stop()
            })
          }
          this.detachParticipantTracks(room.localParticipant)
          if (room.participants.length > 0) {
            room.participants.map(this.detachParticipantTracks)
          }
          this.activeRoom = null
          document.getElementById('button-join').style.display = 'inline'
          document.getElementById('button-leave').style.display = 'none'
        })
      },
      roomJoinedAudio (room) {
        this.activeRoom = room
        // console.log(`Joined as '` + this.$auth.currentUser().email + `'`)
        document.getElementById('button-leave').style.display = 'inline'
        // Attach LocalParticipant's Tracks, if not already attached.
        var previewContainer = document.getElementById('local-media')
        if (!previewContainer.querySelector('video')) {
          this.attachParticipantTracks(room.localParticipant, previewContainer)
        }
        // Attach the Tracks of the Room's Participants.

        if (room.participants.length > 0) {
          room.participants.map((participant) => {
            // console.log(`Already in Room: '` + participant.identity + `'`)
            var previewContainer = document.getElementById('remote-media1')
            this.attachParticipantTracks(participant, previewContainer)
          })
        }
        // When a Participant joins the Room, console.log the event.
        room.on('participantConnected', (participant) => {
          console.log(`Joining: '` + participant.identity + `'`)
        })
        // When a Participant adds a Track, attach it to the DOM.
        room.on('trackAdded', (track, participant) => {
          console.error(track)
          // console.log(participant.identity + ` added track: ` + track.kind)
          var previewContainer = document.getElementById('remote-media1')
          this.attachTracks([track], previewContainer)
        })
        // When a Participant removes a Track, detach it from the DOM.
        room.on('trackRemoved', (track, participant) => {
          // console.log(participant.identity + ` removed track: ` + track.kind)
          this.detachTracks([track])
        })
        // When a Participant leaves the Room, detach its Tracks.
        room.on('participantDisconnected', (participant) => {
          // console.log(`Participant '` + participant.identity + `' left the room`)
          this.detachParticipantTracks(participant)
        })
        // Once the LocalParticipant leaves the room, detach the Tracks
        // of all Participants, including that of the LocalParticipant.
        room.on('disconnected', () => {
          console.log('Left')
          if (this.previewTracks) {
            this.previewTracks.map((track) => {
              track.stop()
            })
          }
          this.detachParticipantTracks(room.localParticipant)
          if (room.participants.length > 0) {
            room.participants.map(this.detachParticipantTracks)
          }
          this.activeRoom = null
          document.getElementById('button-join').style.display = 'inline'
          document.getElementById('button-leave').style.display = 'none'
        })
      },
      async twilliocall () {
        if (this.previewTracks) {
          this.connectOptions.tracks = this.previewTracks
        }
        let response1 = await MessagesService.gettwiliotoken()
        this.$video.connect(response1.data.token, this.connectOptions).then(this.roomJoined, (error) => {
          console.log('Could not connect to Twilio: ' + error.message)
        })
      },
      async twilliovoicecall () {
        if (this.previewTracks) {
          this.connectOptions.tracks = this.previewTracks
        }
        let response1 = await MessagesService.gettwiliotoken()
        this.$video.connect(response1.data.token, this.connectOptions).then(this.roomJoinedAudio, (error) => {
          console.log('Could not connect to Twilio: ' + error.message)
        })
      },
      leaveroom () {
        this.activeRoom.disconnect()
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
            room: this.room.id
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
            room: this.room.id
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
            room: this.room.id
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
            room: this.room.id
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
            room: this.room.id
          }))
          this.message = ''
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
  .chat {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    width: 100%;
    height: 450px;
    border: 1px solid black;
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
    width: 100%;
    height: 250px;
    border: 1px solid black;
  }
  .webCam {
    border: 1px solid black;
    width: 100%;
    height: 1050px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
  }
  #local-media {
    padding: 15px;
    width: 50%;
    height: 550px;
  }
  #local-media > video {
    padding: 15px;
    width: 50%;
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