<template>
    <div id="app">
	  <v-app>
      <v-app-bar color="blue" dark>
          <v-app-bar-nav-icon @click="showNavMenu=true"></v-app-bar-nav-icon>
          <v-toolbar-title>Ride Analysis Dashboard</v-toolbar-title>
      </v-app-bar>
		<v-dialog v-model="loading" persistent width="500">
			<v-card color="primary" dark>
			  <v-card-text>
				Processing Your Input... This Might Take Some Time
				  <v-progress-linear
				  indeterminate
				  color="white"
				  class="mb-0"
				  ></v-progress-linear>
			  </v-card-text>
			</v-card>
		</v-dialog>
      <v-navigation-drawer
        v-model="showNavMenu"
        dark
		absolute
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
	  </v-app>
	</div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'App',
  data () {
    return {
      showNavMenu: false,
      items: [
        { title: 'Home', icon: 'dashboard', to: '/' }
      ],
    }
  },
  computed: {
    ...mapGetters([
      'loading'
    ])
  },
}
</script>

<style lang="stylus">
#app 
  font-family 'Montserrat', sans-serif !important
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
.leaflet-heatmap-layer
  opacity 0.7 !important
</style>
