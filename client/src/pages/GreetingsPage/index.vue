<style src="./style.css" scoped></style>
<template>
  <main class="greet-container">
    <header>
    </header>
    <div class="body">
      <div class="body_right">
        <div class="entry_form">
          <div class="form_title">ВХОД</div>
          <input type="text" name="name" placeholder="E-mail" id="_login" v-model="email" title="Введите ваш логин" autofocus required>
          <input type="password" name="password" placeholder="Пароль" id="password" v-model="password" title="Введите ваш пароль" required>
          <button @click="login()">Войти</button>
        </div>
      </div>
    </div>
    <footer>
    </footer>
  </main>
</template>

<script>
import AuthenticationService from '../../services/AuthenticationService'
export default {
  name: 'Greetings',
  components: {},
  data () {
    return {
      email: '',
      password: ''
    }
  },
  computed: {},
  methods: {
    async login () {
      try {
        const response = await AuthenticationService.login({
          email: this.email,
          password: this.password
        })
        this.$auth.saveToken(response.data.token)
        this.$router.push({
          name: 'MainPage'
        })
        window.location.reload()
      } catch (error) {
        alert(error.response.data.error)
      }
    }
  }
}
</script>
