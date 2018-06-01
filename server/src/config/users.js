[
  {
    id: '',
    name: '',
    room: ''
  }
]

class Users {
  constructor () {
    this.users = []
  }
  addUser (_user, _room) {
    _user.room = _room
    this.users.push(_user)
    return _user
  }
  removeUser (id) {
    let user = this.getUser(id)

    if (user) {
      this.users = this.users.filter(user => user.id !== id)
    }
    
    return user
  }
  getUser (id) {
    return this.users.filter(user => user.id === id)[0]
  }
  getUserList (room) {
    return this.users.filter(user => user.room === room)
      .map(user => user.name)
  }
}

module.exports = { Users }