<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs12 sm8>
          <v-card class="map" id="map">
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import mapConstants from '../constants/mapconstants'
import {mapGetters} from 'vuex'

export default {
  name: 'Dashboard',
  data () {
    return {
      map: null,
      tileLayer: null
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([38.63, -90.23], 12);
      this.tileLayer = L.tileLayer(
        mapConstants.tile,
        {
          maxZoom: 18,
          attribution: mapConstants.attribution,
        }
      );
        
      this.tileLayer.addTo(this.map);
    },
    initLayers () {
      const markerFeatures = this.markerFeatures
      markerFeatures.forEach((feature) => {
          feature.leafletObject = L.marker(feature.coords)
            .bindPopup(feature.name);
      });
    }
  },
  computed: {
    ...mapGetters([
      'markerFeatures'
    ])
  },
  mounted() {
    this.initMap()
    this.initLayers()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.map 
  height 500px
  z-index 0
</style>
