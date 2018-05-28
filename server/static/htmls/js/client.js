new Vue ({
	el: "#app",
	data: {
		room: '313b9b52-25d2-4a90-93ae-92d44eea08ab',
        messages: [],
        message: '',
        previewTracks: '',
        connectOptions: {
          name: '',
          logLevel: 'debug'
        },
        activeRoom: ''
	},
	created: async function () {
		Vue.prototype.$socket = io(`http://127.0.0.1:8081/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTU1Y2EzLWVhZGEtNGMzYi05MjJkLTM2NTBhMjdjYTVmMCIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkb3ZFbTRlWnRxU0pCQjZYQnBhbXpYTzE4Z0t5VnRnM2MwQkpvMnouNHpwWk9IREc4MEV4STYiLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJhZG1pbiIsImltYWdlIjpudWxsLCJiaW8iOm51bGwsInRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE4LTA1LTE4VDExOjA2OjQ0LjA5MloiLCJ1cGRhdGVkQXQiOiIyMDE4LTA1LTI4VDA2OjMxOjE4Ljg3N1oiLCJpYXQiOjE1Mjc1MDQ4OTQsImV4cCI6MTYxMzkwNDg5NH0.fVBay81ZazhwbHOhbNpnexGhKpjLblWWNRVSZxwnJQQ`)
		
		this.$socket.on('errorHandle', function (msg) {
          alert(msg.text)
        })

        this.$socket.on('newMessage', function (msg) {
          this.messages.push(msg)
        }.bind(this))

        this.$socket.emit('join', this.room)

		let response = await axios.get('/getmessages?room=' + this.room)
		this.messages = response.data.messages
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
        if (_item.fromId === '66555ca3-eada-4c3b-922d-3650a27ca5f0') {
        	// this.$auth.currentUser().id
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
	}
})