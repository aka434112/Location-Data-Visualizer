<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs12 sm7>
          <input-csv-file></input-csv-file>
          <v-card class="map" id="map">
          </v-card>
        </v-flex>
        <v-flex xs12 sm5>
          <v-card class="chart">
            <v-container fluid>
              <v-layout row wrap>
                <v-flex xs7 justify-center>
                  <v-checkbox v-model="drawSource" label="Show Source Coordinates"></v-checkbox>
                  <v-checkbox v-model="drawDestination" label="Show Destination Coordinates"></v-checkbox>
                  <v-checkbox v-model="drawHeatMap" label="Turn on 'Heat Map' mode"></v-checkbox>
                </v-flex>
                <v-flex xs5 align-self-center>
                  <v-btn text color="primary" v-show="chartFilterInPlay" @click="resetFilter()">RESET CHART FILTER</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
          <v-card v-show="vehicleTypeData" class="chart">
            <GChart :resizeDebounce="0" ref="gChart" type="PieChart" id="chart" :data="vehicleTypeData" :options="chartOptions" :events="filterEvents"/>
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import mapConstants from '../constants/mapconstants'
import FeatureCollection from '../models/featureCollection'
import generateChartCompatibleDataWorker from 'worker-loader!./../scripts/generateChartCompatibleDataWorker.js'
import heatMapDataGenerator from 'worker-loader!./../scripts/worker.js'
import { GChart } from 'vue-google-charts'
import inputCsvFile from './DataSource'
import {mapGetters, mapMutations} from 'vuex'

export default {
  name: 'Dashboard',
  data () {
    return {
      map: null,
      tileLayer: null,
      destinationMarkerFeaturesGeoJSON: null,
      originMarkerFeaturesGeoJSON: null,
      drawSource: false,
      vehicleTypeData: null,
      drawDestination: false,
      markerFeaturesLayerGroup: null,
      workerThread: null,
      chartFilterInPlay: false,
      filteredHeatMapCompatibleDataSrc: null,
      filteredHeatMapCompatibleDataDest: null,
      chartOptions: {
          title: 'THE NUMBER OF BOOKINGS AGAINST A VEHICLE MODEL',
          titleTextStyle : {
              fontSize: 14,
              fontName: 'Montserrat',
              bold: true
          },
          is3D: true,
          chartArea: {bottom: 15, width:'85%', height:'70%'},
          legend: {
            position:'labeled',
            labeledValueText: 'both',
            textStyle: {
              fontName: 'Montserrat',
              fontSize: 12
            }
          },
          sliceVisibilityThreshold: 0,
          pieSliceText: 'value'
      },
      drawHeatMap: false,
      originHeatMap: null,
      destHeatMap: null,
      filterEvents: {
        'select': () => {
          let that = this
          const heatMapGeneratorThread = new heatMapDataGenerator
          const table = that.$refs.gChart.chartObject
          const selection = table.getSelection()
          const vehicleTypeDataRowKey = 'row'
          if (selection.length) {
            that.resetCheckState()
            that.drawHeatMap = false
            const vehicleTypeDataRow = selection[0][vehicleTypeDataRowKey] + 1
            const vehicleModel = that.vehicleTypeData[vehicleTypeDataRow][0]
            const vehicleModelGeoJSON = that.markerFeaturesBasedOnVehicleType[vehicleModel]
            const vehicleModelGeoJsonSrc = new FeatureCollection(vehicleModelGeoJSON['source'])
            const vehicleModelGeoJsonDest = new FeatureCollection(vehicleModelGeoJSON['dest'])           
            that.createGeoJSON(vehicleModelGeoJsonSrc, vehicleModelGeoJsonDest)
            heatMapGeneratorThread.onmessage = function (messageEvent) {
                const heatMapCompatibleDataWrapper = messageEvent.data
                if(heatMapCompatibleDataWrapper.type === 'origin') {
                    that.filteredHeatMapCompatibleDataSrc = heatMapCompatibleDataWrapper.heatMapCompatibleData
                } else {
                    that.filteredHeatMapCompatibleDataDest = heatMapCompatibleDataWrapper.heatMapCompatibleData
                }
                that.chartFilterInPlay = true
            }
            heatMapGeneratorThread.postMessage({geoJSON: vehicleModelGeoJsonSrc, intensity: 1, type: 'origin'})
            heatMapGeneratorThread.postMessage({geoJSON: vehicleModelGeoJsonDest, intensity: 1, type: 'destination'})
          }
        }
      }
    }
  },
  components: {
    inputCsvFile,
    GChart
  },
  methods: {
    ...mapMutations(['updateApplicationLoadingState']),
    resetFilter() {
      let that = this
      that.drawSource = false
      that.drawDestination = false
      that.drawHeatMap = false
      that.configureDefaultGeoJSON()
      that.chartFilterInPlay = false
    },
    initMap() {
      let that = this
      that.map = L.map('map', {preferCanvas: true}).setView([13, 77.6], 12);
      that.tileLayer = L.tileLayer(
        mapConstants.tile,
        {
          maxZoom: 18,
          attribution: mapConstants.attribution,
        }
      );
        
      that.tileLayer.addTo(that.map)
      that.markerFeaturesLayerGroup = new L.LayerGroup()
      that.markerFeaturesLayerGroup.addTo(that.map)
    },
    initLayers () {
        let that = this
        const vehicleModelTypes = that.markerFeaturesBasedOnVehicleType
        that.workerThread = new generateChartCompatibleDataWorker
        that.workerThread.onmessage = function (messageEvent) {
          that.vehicleTypeData = messageEvent.data
        }
        that.workerThread.postMessage(vehicleModelTypes)
        that.configureDefaultGeoJSON ()
    },
    configureDefaultGeoJSON () {
      let that = this
      const originMarkerFeatures = that.originMarkerFeatures
      const destinationMarkerFeatures = that.destinationMarkerFeatures
      const originMarkerFeaturesCollection = new FeatureCollection(originMarkerFeatures)
      const destinationMarkerFeaturesCollection = new FeatureCollection(destinationMarkerFeatures)
      that.createGeoJSON(originMarkerFeaturesCollection, destinationMarkerFeaturesCollection)
      that.filteredHeatMapCompatibleDataSrc = that.heatMapCompatibleDataOrigin
      that.filteredHeatMapCompatibleDataDest = that.heatMapCompatibleDataDest
    },
    createGeoJSON (originMarkerFeaturesCollection, destinationMarkerFeaturesCollection) {
      let that = this
      const geojsonMarkerOptionsOrigin = mapConstants.geoJSONMarkerOptionOrigin
      const geojsonMarkerOptionsDestination = mapConstants.geoJSONMarkerOptionDestination
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
    },
    configureHeatMapLayer (heatMapCompatibleData) {
      let that = this
      return L.heatLayer(heatMapCompatibleData, {
        radius: 15
      }).addTo(that.map)
    },
    removeOriginLayer () {
      let that = this
      if (that.originHeatMap) {
        that.map.removeLayer(that.originHeatMap)
        that.originHeatMap = null
      } else {
        that.map.removeLayer(that.originMarkerFeaturesGeoJSON)
      }
    },
    removeDestLayer () {
      let that = this
      if (that.destHeatMap) {
        that.map.removeLayer(that.destHeatMap)
        that.destHeatMap = null
      } else {
        that.map.removeLayer(that.destinationMarkerFeaturesGeoJSON)
      }
    },
    addLayerToMap (GeoJSONMarkerFeature) {
      this.markerFeaturesLayerGroup.addLayer(GeoJSONMarkerFeature)
    },
    drawAppropriateSourceLayer () {
      let that = this
      if (that.drawHeatMap) {
          that.originHeatMap = that.configureHeatMapLayer(that.filteredHeatMapCompatibleDataSrc)
      } else {
        that.addLayerToMap(that.originMarkerFeaturesGeoJSON)
      }
    },
    drawAppropriateDestLayer (heatMapCompatibleData) {
      let that = this
      if (that.drawHeatMap) {
          that.destHeatMap = that.configureHeatMapLayer(that.filteredHeatMapCompatibleDataDest)
      } else {
        that.addLayerToMap(that.destinationMarkerFeaturesGeoJSON)
      }
    },
    resetCheckState() {
      let that = this
      that.drawSource = false
      that.drawDestination = false
    }
  },
  computed: {
    ...mapGetters([
      'originMarkerFeatures',
      'destinationMarkerFeatures',
      'loading',
      'heatMapCompatibleDataOrigin',
      'heatMapCompatibleDataDest',
      'markerFeaturesBasedOnVehicleType'
    ])
  },
  watch: {
    loading: function (applicationLoadingState) {
      if(!applicationLoadingState) {
        this.initLayers()
      }
    },
    drawSource: function (drawSourceCoords) {
      let that = this
      if (drawSourceCoords) {
        that.drawAppropriateSourceLayer()
      } else {
        that.removeOriginLayer()
      }
    },
    drawDestination: function (drawDestCoords) {
      let that = this
      if (drawDestCoords) {
        that.drawAppropriateDestLayer()
      } else {
        that.removeDestLayer()
      }
    },
    drawHeatMap: function (resetCheckState) {
      this.resetCheckState()
    },
    heatMapCompatibleDataOrigin: function () {
      let that = this
      if(that.heatMapCompatibleDataDest.length) {
        that.updateApplicationLoadingState()
      }
    },
    heatMapCompatibleDataDest: function () {
      let that = this
      if(that.heatMapCompatibleDataOrigin.length) {
        that.updateApplicationLoadingState()
      }
    }
  },
  mounted() {
    let that = this
    that.initMap()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.map 
  height 80vh
  z-index 0
#chart
  height 45vh
.chart
  margin 1%
</style>
