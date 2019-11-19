// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import router from './router'
import store from './store'
import VueGoogleCharts from 'vue-google-charts'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon
// webpack parses for require.context() in the code while building
// function importAll (r) {
//   r.keys().forEach(r)
// }

// importAll(require.context('./../node_modules/leaflet/dist/images', true, /\.png$/))

Vue.use(VueGoogleCharts)
Vue.use(Vuetify)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  store,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')
