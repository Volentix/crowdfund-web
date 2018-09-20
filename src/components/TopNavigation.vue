<template>
  <div class="topnav">
    <b-navbar toggleable="md" type="dark" variant="dark" class="bg-dark">
      <b-nav-toggle target="nav_collapse"></b-nav-toggle>
      <b-navbar-brand style="font-size: 26px;" href="/">
        <img src="../assets/branding_logo.png" class="d-inline-block align-top" alt="BV">
      </b-navbar-brand>

      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">

          <b-nav-form>
            <b-button size="sm" 
              class="my-2 my-sm-0" 
              variant="primary"
              v-b-modal.login-modal v-if="!$store.state.apiToken">
              {{ $t('login') }}
            </b-button>
          </b-nav-form>
          
           <b-nav-item v-if="$store.state.apiToken" to="/" exact>
            {{ $t('home') }}
          </b-nav-item>

          <b-nav-item v-if="$store.state.apiToken" to="/dashboard" exact>
            {{ $t('dashboard') }}
          </b-nav-item>

          <b-nav-item v-if="$store.state.apiToken" to="/contribute" exact>
            {{ $t('contribute') }}
          </b-nav-item>

          <b-nav-item-dropdown v-if="$store.state.apiToken" right>
            <template slot="button-content">
              {{ username }}
            </template>
            <b-dropdown-item to="/settings">Settings</b-dropdown-item>
            <b-dropdown-item @click="logout()" href="#">Logout</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <login-modal></login-modal>
  </div>
</template>

<script>
import LoginModal from '@/components/modals/LoginModal'
import axios from 'axios'

export default {
  name: 'TopNavigation',
  components: { LoginModal },
  computed: {
    username () {
      return this.$store.state.userName
    }
  },
  methods: {
    logout () {
      axios.post('/logout/', {api_token: this.$store.state.apiToken}).then(response => {
        if (response.data.success) {
          this.$store.commit('updateApiToken', '')
          this.$store.commit('updateUserEmail', null)
          this.$store.commit('updateUserName', null)
          delete axios.defaults.headers.common['Authorization']
          window.location.href = '/'
        }
      })
    },
    setLanguage (lang) {
      this.$i18n.locale = lang
      this.$validator.localize(lang)
    },
    setUser (data) {
      this.$store.commit('updateApiToken', data.token)
      this.$store.commit('updateUserName', data.username)
      this.$store.commit('updateUserEmail', data.email)
      this.$store.commit('updateLanguage', data.language)
    }
  },
  mount () {
    // Get langauge options
    axios.get('/get-languages/').then(response => {
      this.$store.commit('setLanguageOptions', response.data)
    })
    // Get user details
    if (this.$store.state.apiToken) {
      axios.post('/get-user/', {
        api_token: this.$store.state.apiToken
      }).then(response => {
        if (response.data.found === true) {
          this.setUser(response.data)
          // Fix the authorization header for all HTTP requests
          var authHeader = 'Token ' + this.$store.state.apiToken
          axios.defaults.headers.common['Authorization'] = authHeader
          // Localize to selected language
          this.$i18n.locale = this.$store.state.language
          this.$validator.localize(response.data.language)
        }
      })
    }
    if (this.$route.query.email_confirmed === '1') {
      this.$swal({
        title: this.$t('email_confirmed'),
        text: this.$t('email_confirmed_msg'),
        icon: 'success',
        button: {
          text: this.$t('ok'),
          className: 'btn-primary',
          closeModal: true
        }
      })
    }
  }
}
</script>

<style scoped>
.bg-dark {
  background: rgba(35, 44, 59, 0.3) !important;
}
</style>