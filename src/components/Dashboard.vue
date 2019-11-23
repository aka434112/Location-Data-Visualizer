<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs12 sm7>
          <input-csv-file></input-csv-file>
          <v-card class="map" id="map"></v-card>
        </v-flex>
        <v-flex xs12 sm5>
          <v-card class="chart">
            <v-container fluid>
              <v-layout row wrap>
				<v-flex xs12>
					<v-alert v-show="onlyHeat" type="info">'Point View' not available for this selection</v-alert>
				</v-flex>
                <v-flex xs12 sm7>
						<v-checkbox dense v-model="drawSource" label="Show Source Coordinates"></v-checkbox>
						<v-checkbox dense v-model="drawDestination" label="Show Destination Coordinates"></v-checkbox>
						<v-checkbox v-show="!onlyHeat" dense v-model="drawHeatMap" label="Heat Map"></v-checkbox>
                </v-flex>
                <v-flex xs5 align-self-end>
                  <v-btn text color="primary" v-show="chartFilterInPlay" @click="resetFilter()">RESET CHART FILTER</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
          <v-card v-show="bookingTypeData" class="chart">
            <GChart :resizeDebounce="0" ref="bookingTypeChart" type="PieChart" id="bookingTypeChart" :data="bookingTypeData" :options="bookingTypeBasedChartOptions" :events="bookingTypeFilterEvents"/>
          </v-card>
        </v-flex>
        <v-flex xs12 sm5>
          <v-card v-show="vehicleTypeData" class="chart">
            <GChart :resizeDebounce="0" ref="vehicleTypeChart" type="PieChart" id="vehicleTypeChart" :data="vehicleTypeData" :options="vehicleModelBasedchartOptions" :events="filterEvents"/>
          </v-card>
        </v-flex>
        <v-flex xs12 sm7 v-show="totalCancellations">
          <v-card id="circleCard" class="chart">
			<v-container fluid>
				<v-layout row wrap>
					<v-flex xs12>
						<v-card-title class="headline">Other Key Metrics</v-card-title>
					</v-flex>
					<v-flex xs12 sm6 class="circleContainer">
						<div><div class="circle" @click="resetFilter()">{{totalRides}}</div> <div class="circleText">Total Number Of Rides</div></div>					
					</v-flex>
					<v-flex xs12 sm6 class="circleContainer">
						<div><div class="circle" @click="applyCancellationFilter()">{{totalCancellations}}</div> <div class="circleText">Number Of Cancellations</div></div>					
					</v-flex>
				</v-layout>
			</v-container>
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import mapConstants from '../constants/mapconstants'
import FeatureCollection from '../models/featureCollection'
import utilityMixin from '../mixins/utility'
import { GChart } from 'vue-google-charts'
import inputCsvFile from './DataSource'
import {mapGetters, mapMutations} from 'vuex'

export default {
  name: 'Dashboard',
  data () {
    return {
      map: null,
      tileLayer: null,
	  onlyHeat: false,
	  defaultOriginMarkerFeaturesGeoJSON: null,
	  defaultDestinationMarkerFeaturesGeoJSON: null,
      destinationMarkerFeaturesGeoJSON: null,
      originMarkerFeaturesGeoJSON: null,
	  totalCancellations: null,
      drawSource: false,
      vehicleTypeData: null,
      bookingTypeData: null,
      drawDestination: false,
	  bookingTypeBasedChartOptions: mapConstants.bookingTypeBasedChartOptions,
	  vehicleModelBasedchartOptions: mapConstants.vehicleModelBasedchartOptions,
      markerFeaturesLayerGroup: null,
      chartFilterInPlay: false,
      filteredHeatMapCompatibleDataSrc: null,
      filteredHeatMapCompatibleDataDest: null,
      drawHeatMap: false,
      originHeatMap: null,
      destHeatMap: null,
	  totalRides: null,
      bookingTypeFilterEvents: {
        'select': () => {
          let that = this
		  that.chartFilterInPlay = false
		  that.updateApplicationLoadingState()
          const table = that.$refs.bookingTypeChart.chartObject
          const selection = table.getSelection()
          const bookingTypeDataRowKey = 'row'
          if (selection.length) {
            that.resetCheckState()
            that.drawHeatMap = false    
            const bookingTypeDataRow = selection[0][bookingTypeDataRowKey] + 1    
            const bookingType = that.bookingTypeData[bookingTypeDataRow][0]
            const bookingTypeGeoJSON = that.markerFeaturesBasedOnVehicleType[mapConstants.bookingObjKey][bookingType]
            const bookingTypeGeoJsonSrc = new FeatureCollection(bookingTypeGeoJSON[mapConstants.locationSrcKey])
            const bookingTypeGeoJsonDest = new FeatureCollection(bookingTypeGeoJSON[mapConstants.locationDestKey])			
			if(bookingTypeGeoJSON[mapConstants.locationSrcKey].length < mapConstants.markerLimit) {
				that.createGeoJSON(bookingTypeGeoJsonSrc, bookingTypeGeoJsonDest)
				that.onlyHeat = false
			} else {
				that.onlyHeat = true
				that.drawHeatMap = true
			}
			that.filteredHeatMapCompatibleDataSrc = that.geoJson2heat(bookingTypeGeoJsonSrc, 1)
			that.filteredHeatMapCompatibleDataDest = that.geoJson2heat(bookingTypeGeoJsonDest, 1)
			that.chartFilterInPlay = true
			setTimeout(() => {
				that.updateApplicationLoadingState()
			}, mapConstants.filterLoadingDelay)
          }  
        }
      },
      filterEvents: {
        'select': () => {
          let that = this
		  that.chartFilterInPlay = false
		  that.updateApplicationLoadingState()
		  const table = that.$refs.vehicleTypeChart.chartObject
		  const selection = table.getSelection()
		  const vehicleTypeDataRowKey = 'row'
		  if (selection.length) {
			that.resetCheckState()
			that.drawHeatMap = false
			const vehicleTypeDataRow = selection[0][vehicleTypeDataRowKey] + 1
			const vehicleModel = that.vehicleTypeData[vehicleTypeDataRow][0]
			const vehicleModelGeoJSON = that.markerFeaturesBasedOnVehicleType[mapConstants.demandObjKey][vehicleModel]
			const vehicleModelGeoJsonSrc = new FeatureCollection(vehicleModelGeoJSON[mapConstants.locationSrcKey])
			const vehicleModelGeoJsonDest = new FeatureCollection(vehicleModelGeoJSON[mapConstants.locationDestKey]) 
			if(vehicleModelGeoJSON[mapConstants.locationSrcKey].length < mapConstants.markerLimit) {
				that.createGeoJSON(vehicleModelGeoJsonSrc, vehicleModelGeoJsonDest)
				that.onlyHeat = false
			} else {
				that.onlyHeat = true
				that.drawHeatMap = true
			}
			that.filteredHeatMapCompatibleDataSrc = that.geoJson2heat(vehicleModelGeoJsonSrc, 1)
			that.filteredHeatMapCompatibleDataDest = that.geoJson2heat(vehicleModelGeoJsonDest, 1)
			that.chartFilterInPlay = true
			setTimeout(() => {
				that.updateApplicationLoadingState()
			}, mapConstants.filterLoadingDelay)
		  }
        }
      }
    }
  },
  components: {
    inputCsvFile,
    GChart
  },
  mixins: [utilityMixin],
  methods: {
    ...mapMutations(['updateApplicationLoadingState']),
	applyCancellationFilter () {
		let that = this
		const carCancellationKey = mapConstants.carCancellationKey
		that.chartFilterInPlay = false
		that.updateApplicationLoadingState()
		that.resetCheckState()
		that.drawHeatMap = false    		
		const cancellationFeaturesSrc = that.markerFeaturesBasedOnVehicleType[carCancellationKey][mapConstants.locationSrcKey]
		const cancellationFeaturesDest = that.markerFeaturesBasedOnVehicleType[carCancellationKey][mapConstants.locationDestKey]
		const cancellationGeoJsonSrc = new FeatureCollection(cancellationFeaturesSrc)
		const cancellationGeoJsonDest = new FeatureCollection(cancellationFeaturesDest)
		if (cancellationFeaturesSrc.length < mapConstants.markerLimit) {
			that.createGeoJSON(cancellationGeoJsonSrc, cancellationGeoJsonDest)
			that.onlyHeat = false
		} else {
			that.onlyHeat = true
			that.drawHeatMap = true
		}
		that.filteredHeatMapCompatibleDataSrc = that.geoJson2heat(cancellationGeoJsonSrc, 1)
		that.filteredHeatMapCompatibleDataDest = that.geoJson2heat(cancellationGeoJsonDest, 1)
		that.chartFilterInPlay = true
		setTimeout(() => {
			that.updateApplicationLoadingState()
		}, mapConstants.filterLoadingDelay)
	},
    resetFilter() {
      let that = this
      that.drawSource = false
      that.drawDestination = false
	  that.markerFeaturesLayerGroup.clearLayers()
      that.drawHeatMap = false
      that.configureDefaultGeoJSON()
	  that.onlyHeat = false
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
		const chartCompatibeData = that.generateChartCompatibleData(vehicleModelTypes)
		that.vehicleTypeData = chartCompatibeData.vehicleTypeData
		that.bookingTypeData = chartCompatibeData.bookingTypeData
		that.totalCancellations = that.markerFeaturesBasedOnVehicleType[mapConstants.carCancellationKey][mapConstants.markerFeaturesBasedOnVehicleSourceKey].length
		that.totalRides = that.originMarkerFeatures.length
        that.configureDefaultGeoJSON ()
    },
	generateChartCompatibleData (data) {
		const vehicleModelTypes = data[mapConstants.demandObjKey]
		const bookingTypes = data[mapConstants.bookingObjKey]
		let modelWiseDemand = [
			['Vehicle Model', 'Number of Bookings']
		]
		let demandBasedOnBookingType = [
			['Booking Type', 'Number of Bookings']
		]
		for(let vehicleModelType in vehicleModelTypes) {
			modelWiseDemand.push([vehicleModelType, vehicleModelTypes[vehicleModelType]['source'].length])
		}
		for(let bookingType in bookingTypes) {
			demandBasedOnBookingType.push([bookingType.split('_').join(' '), bookingTypes[bookingType]['source'].length])
		}
		return {vehicleTypeData: modelWiseDemand, bookingTypeData: demandBasedOnBookingType}
	},
    configureDefaultGeoJSON () {
      let that = this
	  if(that.defaultOriginMarkerFeaturesGeoJSON && that.defaultDestinationMarkerFeaturesGeoJSON) {
		that.destinationMarkerFeaturesGeoJSON = that.defaultDestinationMarkerFeaturesGeoJSON
		that.originMarkerFeaturesGeoJSON = that.defaultOriginMarkerFeaturesGeoJSON
	  } else {
		  that.createGeoJSON(new FeatureCollection(that.originMarkerFeatures), new FeatureCollection(that.destinationMarkerFeatures))
		  that.defaultDestinationMarkerFeaturesGeoJSON = that.destinationMarkerFeaturesGeoJSON 
		  that.defaultOriginMarkerFeaturesGeoJSON = that.originMarkerFeaturesGeoJSON	  
	  }
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
		that.markerFeaturesLayerGroup.removeLayer(that.originMarkerFeaturesGeoJSON)
      }
    },
    removeDestLayer () {
      let that = this
      if (that.destHeatMap) {
        that.map.removeLayer(that.destHeatMap)
        that.destHeatMap = null
      } else {
        that.markerFeaturesLayerGroup.removeLayer(that.destinationMarkerFeaturesGeoJSON)
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
	  that.markerFeaturesLayerGroup.clearLayers()
    }
  },
  computed: {
    ...mapGetters([
      'originMarkerFeatures',
      'destinationMarkerFeatures',
      'loading',
      'heatMapCompatibleDataOrigin',
      'heatMapCompatibleDataDest',
      'markerFeaturesBasedOnVehicleType',
	  'fileProcessed'
    ])
  },
  watch: {
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
	fileProcessed: function (doneProcessingCsv) {
		if(doneProcessingCsv) {
			this.initLayers()
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
  height 90vh
  z-index 0
#vehicleTypeChart
  height 50vh
#bookingTypeChart
  height 45vh
.chart
  margin 10px
  min-height 45vh
.headline
  font-family 'Montserrat', sans-serif !important
.circle
  border-radius 49%
  border 5px solid orange
  cursor pointer
  display inline-block
  font-size 25px
  text-align center
  vertical-align middle
  line-height 88px
  font-weight 800
  width 100px !important
  height 100px
.circleContainer
  text-align center !important
.circleText
  display inline-block
</style>
