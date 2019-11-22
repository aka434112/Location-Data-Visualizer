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
import { GChart } from 'vue-google-charts'
import inputCsvFile from './DataSource'
import {mapGetters} from 'vuex'

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
          const table = that.$refs.gChart.chartObject
          const selection = table.getSelection()
          const vehicleTypeDataRowKey = 'row'
          if (selection.length) {
            const vehicleTypeDataRow = selection[0][vehicleTypeDataRowKey] + 1
            const vehicleModel = that.vehicleTypeData[vehicleTypeDataRow][0]
            const vehicleModelGeoJSON = that.markerFeaturesBasedOnVehicleType[vehicleModel]
            that.removeOriginLayer()
            that.removeDestLayer()
            that.createGeoJSON(new FeatureCollection(vehicleModelGeoJSON['source']), new FeatureCollection(vehicleModelGeoJSON['dest']))
            that.chartFilterInPlay = true
            if(that.drawSource) {
              that.addLayerToMap(that.originMarkerFeaturesGeoJSON)       
            } if (that.drawDestination) {
              that.addLayerToMap(that.destinationMarkerFeaturesGeoJSON)
            }
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
    resetFilter() {
      let that = this
      that.drawSource = false
      that.drawDestination = false
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
      return L.heatLayer(heatMapCompatibleData, {
        radius: 12
      }).addTo(this.map)
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
        if (that.drawHeatMap) {
          that.originHeatMap = that.configureHeatMapLayer(that.heatMapCompatibleDataOrigin)
        } else {
          that.addLayerToMap(that.originMarkerFeaturesGeoJSON)
        }
      } else {
        that.removeOriginLayer()
      }
    },
    drawDestination: function (drawDestCoords) {
      let that = this
      if (drawDestCoords) {
        if (that.drawHeatMap) {
          that.destHeatMap = that.configureHeatMapLayer(that.heatMapCompatibleDataDest)
        } else {
          that.addLayerToMap(that.destinationMarkerFeaturesGeoJSON)
        }
      } else {
        that.removeDestLayer()
      }
    },
    drawHeatMap: function () {
      let that = this
      that.drawSource = false
      that.drawDestination = false
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
  height 48vh
.chart
  margin 1%
</style>
