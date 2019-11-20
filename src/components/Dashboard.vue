<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs12>
          <input-csv-file></input-csv-file>
          <v-card class="map" id="map">
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import mapConstants from '../constants/mapconstants'
import FeatureCollection from '../models/featureCollection'
import inputCsvFile from './DataSource'
import {mapGetters} from 'vuex'

export default {
  name: 'Dashboard',
  data () {
    return {
      map: null,
      tileLayer: null,
      destinationMarkerFeaturesGeoJSON: null,
      originMarkerFeaturesGeoJSON: null
    }
  },
  components: {
    inputCsvFile
  },
  methods: {
    initMap() {
      this.map = L.map('map', {preferCanvas: true}).setView([13, 77.6], 12);
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
      let that = this
      const geojsonMarkerOptionsOrigin = mapConstants.geoJSONMarkerOptionOrigin
      const geojsonMarkerOptionsDestination = mapConstants.geoJSONMarkerOptionDestination
      const originMarkerFeatures = that.originMarkerFeatures
      const destinationMarkerFeatures = that.destinationMarkerFeatures
      const originMarkerFeaturesCollection = new FeatureCollection(originMarkerFeatures)
      const destinationMarkerFeaturesCollection = new FeatureCollection(destinationMarkerFeatures)
      that.destinationMarkerFeaturesGeoJSON = new L.GeoJSON(destinationMarkerFeaturesCollection, {
          pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptionsDestination)
          }
      })
      that.originMarkerFeaturesGeoJSON = new L.GeoJSON(originMarkerFeaturesCollection, {
          pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptionsOrigin)
          }
      })
      let markerFeaturesLayerGroup = new L.LayerGroup()
      markerFeaturesLayerGroup.addTo(that.map)
      markerFeaturesLayerGroup.addLayer(that.destinationMarkerFeaturesGeoJSON)
      markerFeaturesLayerGroup.addLayer(that.originMarkerFeaturesGeoJSON)
    }
  },
  computed: {
    ...mapGetters([
      'originMarkerFeatures',
      'destinationMarkerFeatures',
      'loading'
    ])
  },
  watch: {
    loading: function (applicationLoadingState) {
      if(!applicationLoadingState) {
        this.initLayers()
      }
    }
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
  height 80vh
  z-index 0
</style>
