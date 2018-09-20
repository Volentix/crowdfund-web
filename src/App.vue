<template>
  <div id="app" v-cloak>
    <top-navigation></top-navigation>
    <b-container id="main-container">
      <router-view></router-view>
    </b-container>
  </div>
</template>

<script>
import TopNavigation from '@/components/TopNavigation'

export default {
  name: 'app',
  components: { TopNavigation }
}
</script>

<style>
body {
  background-color: rgba(35, 44, 59, 0.90) !important;
  background-image: url(assets/skyscrapers.jpg);
  background-position: 0px -200px;
  background-size: 100%;
  background-blend-mode: darken;

}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
  position: relative;
}
#main-container {
  padding-bottom: 90px;
  padding-top: 60px;
  width: 85%;
}
.is-danger {
  color: red;
}
button.btn-primary {
  background: rgba(35, 44, 59, 0.9) !important;
  border: 1px solid rgba(35, 44, 59, 0.6) !important;
}
</style>