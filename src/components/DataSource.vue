<template>
    <v-container>
        <v-layout row wrap>
            <v-dialog v-model="uploadDataSource" persistent max-width="700px">
                    <v-card>
                        <v-card-title class="headline">Upload the CSV file to look at the Visualizations</v-card-title>
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
    methods: {
        ...mapMutations(['updateApplicationLoadingState']),
        ...mapActions(['updateOriginMarkerFeatures', 'updateDestMarkerFeatures', 'updateMarkerFeaturesBasedOnVehicle']),
        handleFileSelect () {
            let file = window.event.target.files[0]
            let that = this
            that.uploadDataSource = false
            that.updateApplicationLoadingState()
            let originMarkerFeatures = []
            let destinationMarkerFeatures = []
            let markerFeaturesBasedOnVehicle = {}
            const vehicleModelIdKey = 'vehicle_model_id'
            const markerFeaturesBasedOnVehicleSourceKey = 'source'
            const markerFeaturesBasedOnVehicleDestKey = 'dest'

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
                        if (!vehicleModelId) {
                            vehicleModelId = "unknown"
                        }
                        originMarkerFeatures.push(originMarkerFeature)
                        destinationMarkerFeatures.push(destinationMarkerFeature)
                        if(!markerFeaturesBasedOnVehicle[vehicleModelId]) {
                            let tempRowAttributes = {}
                            tempRowAttributes[markerFeaturesBasedOnVehicleSourceKey] = []
                            tempRowAttributes[markerFeaturesBasedOnVehicleDestKey] = []
                            markerFeaturesBasedOnVehicle[vehicleModelId] = tempRowAttributes
                        }
                        markerFeaturesBasedOnVehicle[vehicleModelId][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                        markerFeaturesBasedOnVehicle[vehicleModelId][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)
                    }                    
                },
                complete: function() {
                    Promise.all([
                        that.updateOriginMarkerFeatures(originMarkerFeatures),
                        that.updateDestMarkerFeatures(destinationMarkerFeatures),
                        that.updateMarkerFeaturesBasedOnVehicle(markerFeaturesBasedOnVehicle)
                    ]).finally(() => that.updateApplicationLoadingState())
                }
            })
        }
    }
}
</script>

<style lang="stylus" scoped>
.headline
    font-family 'Montserrat', sans-serif !important
</style>
