<template>
  <v-app id="app">
    <div>
      <v-app-bar color="blue" dark>
          <v-app-bar-nav-icon @click="showNavMenu=true"></v-app-bar-nav-icon>
          <v-toolbar-title>Ride Analysis Dashboard</v-toolbar-title>
      </v-app-bar>
      <v-navigation-drawer
        v-model="showNavMenu"
        :mini-variant="mini"
        absolute
        bottom
        dark
        temporary
      >

        <v-list nav dense>

          <v-list-item
            v-for="item in items"
            :key="item.title" 
            :to="item.to"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <router-view/>
    </div>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      showNavMenu: false,
      items: [
        { title: 'Home', icon: 'dashboard', to: '/' },
        { title: 'Settings', icon: 'settings_applications', to: '/settings' }
      ],
      mini: false
    }
  }
}
</script>

<style>
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
