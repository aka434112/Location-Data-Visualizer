<template>
    <v-container>
        <v-layout row wrap>
            <v-dialog v-model="uploadDataSource" persistent max-width="700px">
                    <v-card>
                        <v-card-title class="headline">Input the CSV file to look at a story behind your data</v-card-title>
                        <v-card-actions>
                            <v-file-input id="fileUpload" @change="handleFileSelect($event)" accept=".csv"></v-file-input>
                        </v-card-actions>
                    </v-card>
            </v-dialog>
        </v-layout>
  </v-container>
</template>

<script>
import Papa from 'papaparse'
import {OriginMarkerFeature, DestinationMarkerFeature} from '../models/MarkerFeature'
import mapConstants from '../constants/mapconstants'
import utilityMixin from '../mixins/utility'
import FeatureCollection from '../models/featureCollection'
import {mapMutations, mapActions} from 'vuex'

export default {
    data () {
        return {
            uploadDataSource: true
        }
    },
    props: {
        showInputOption: {
            default: true,
            type: Boolean
        }
    },
	mixins: [utilityMixin],
    methods: {
        ...mapMutations(['updateApplicationLoadingState']),
        ...mapActions(['updateOriginMarkerFeatures', 'updateDestMarkerFeatures', 'updateMarkerFeaturesBasedOnVehicle', 'updateHeatMapCompatibleDataOrigin', 'updateHeatMapCompatibleDataDest']),
        handleFileSelect () {
            let file = window.event.target.files[0]
            let that = this
            that.uploadDataSource = false
            that.updateApplicationLoadingState()
            let originMarkerFeatures = []
            let destinationMarkerFeatures = []
            let markerFeaturesBasedOnVehicle = {}
            let tempRowAttributes = {}
            const vehicleModelIdKey = mapConstants.vehicleModelIdKey
            const markerFeaturesBasedOnVehicleSourceKey = mapConstants.markerFeaturesBasedOnVehicleSourceKey
            const markerFeaturesBasedOnVehicleDestKey = mapConstants.markerFeaturesBasedOnVehicleDestKey
            const mobileBookingKey = mapConstants.mobileBookingKey
            const desktopBookingKey = mapConstants.desktopBookingKey
            const otherMediumBookingKey = mapConstants.otherMediumBookingKey
			const carCancellationKey = mapConstants.carCancellationKey
            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey] = {}
            markerFeaturesBasedOnVehicle[mapConstants.demandObjKey] = {}
			markerFeaturesBasedOnVehicle[mapConstants.carCancellationKey] = {}
            let tempCount = 0

            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                worker: true,
                step: function(row) {
                    let rowData = row.data
                    if((rowData['from_area_id'] && rowData['to_area_id'] && rowData['from_lat'] && rowData['from_long'] && rowData['to_lat'] && rowData['to_long']) && (rowData['from_area_id'] !== 'NULL' && rowData['to_area_id'] !== 'NULL' && rowData['from_lat'] !== 'NULL' && rowData['from_long'] !== 'NULL' && rowData['to_lat'] !== 'NULL' && rowData['to_long'] !== 'NULL')) {
                        let originMarkerFeature = new OriginMarkerFeature(rowData)
                        let destinationMarkerFeature = new DestinationMarkerFeature(rowData)
                        let vehicleModelId = rowData[vehicleModelIdKey]
                        let isMobileBooking = rowData[mobileBookingKey]
                        let isDesktopBooking = rowData[desktopBookingKey]
						const cancelledTrip = rowData[carCancellationKey]
                        const chartMobileBookingKey = mobileBookingKey.split('_').join(' ')
                        const chartDesktopBookingKey = desktopBookingKey.split('_').join(' ')
						
                        if (!vehicleModelId) {
                            vehicleModelId = "unknown"
                        } else {
                            vehicleModelId = mapConstants.vehicleModelConstant + vehicleModelId
                        }
                        originMarkerFeatures.push(originMarkerFeature)
                        destinationMarkerFeatures.push(destinationMarkerFeature)
                        if(!markerFeaturesBasedOnVehicle[mapConstants.demandObjKey][vehicleModelId]) {
                            tempRowAttributes = {}
                            tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                            tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = []
                            markerFeaturesBasedOnVehicle[mapConstants.demandObjKey][vehicleModelId] = tempRowAttributes
                        }
                        markerFeaturesBasedOnVehicle[mapConstants.demandObjKey][vehicleModelId][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                        markerFeaturesBasedOnVehicle[mapConstants.demandObjKey][vehicleModelId][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
						if (cancelledTrip) {
							if(!markerFeaturesBasedOnVehicle[mapConstants.carCancellationKey][markerFeaturesBasedOnVehicleSourceKey]) {
                                tempRowAttributes = {}
                                tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                                tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = [] 
								markerFeaturesBasedOnVehicle[mapConstants.carCancellationKey] = tempRowAttributes
							}
							markerFeaturesBasedOnVehicle[mapConstants.carCancellationKey][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
							markerFeaturesBasedOnVehicle[mapConstants.carCancellationKey][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
						}
                        if (isMobileBooking) {
                            if(!markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartMobileBookingKey]) {
                                tempRowAttributes = {}
                                tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                                tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = [] 
                                markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartMobileBookingKey] = tempRowAttributes                           
                            } 
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartMobileBookingKey][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartMobileBookingKey][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
                        } else if (isDesktopBooking) {
                            if(!markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartDesktopBookingKey]) {
                                tempRowAttributes = {}
                                tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                                tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = [] 
                                markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartDesktopBookingKey] = tempRowAttributes                           
                            } 
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartDesktopBookingKey][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][chartDesktopBookingKey][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
                        } else {
                            if(!markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][otherMediumBookingKey]) {
                                tempRowAttributes = {}
                                tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                                tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = [] 
                                markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][otherMediumBookingKey] = tempRowAttributes                           
                            } 
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][otherMediumBookingKey][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                            markerFeaturesBasedOnVehicle[mapConstants.bookingObjKey][otherMediumBookingKey][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
                        }
                    }                    
                },
                complete: function() {
                    Promise.all([
                        that.updateOriginMarkerFeatures(originMarkerFeatures),
                        that.updateDestMarkerFeatures(destinationMarkerFeatures),
                        that.updateMarkerFeaturesBasedOnVehicle(markerFeaturesBasedOnVehicle)
                    ]).finally(() => {
						that.updateHeatMapCompatibleDataOrigin(that.geoJson2heat(new FeatureCollection(originMarkerFeatures), 1))
						that.updateHeatMapCompatibleDataDest(that.geoJson2heat(new FeatureCollection(destinationMarkerFeatures), 1))
						that.updateApplicationLoadingState()
                    })
                }
            })
        }
    },
    created () {

    }
}
</script>

<style lang="stylus" scoped>
.headline
  font-family 'Montserrat', sans-serif !important
</style>
