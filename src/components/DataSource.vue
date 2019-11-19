<template>
    <v-container>
        <v-layout row wrap>
            <v-dialog v-model="uploadDataSource" max-width="700px">
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

            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    let rowData = results.data
                    let originMarkerFeatures = []
                    let destinationMarkerFeatures = []
                    let markerFeaturesBasedOnVehicle = {}
                    const vehicleModelIdKey = 'vehicle_model_id'
                    const markerFeaturesBasedOnVehicleSourceKey = 'source'
                    const markerFeaturesBasedOnVehicleDestKey = 'dest'
                    rowData.forEach(row => {
                        let originMarkerFeature = new OriginMarkerFeature(row)
                        let destinationMarkerFeature = new DestinationMarkerFeature(row)
                        originMarkerFeatures.push(originMarkerFeature)
                        destinationMarkerFeatures.push(destinationMarkerFeature)
                        console.log(row['vehicle_model_id'])
                        if(!markerFeaturesBasedOnVehicle[row.vehicleModelIdKey]) {
                            markerFeaturesBasedOnVehicle[row.vehicleModelIdKey] = {}
                            markerFeaturesBasedOnVehicle[row.vehicleModelIdKey][markerFeaturesBasedOnVehicleSourceKey] = []
                            markerFeaturesBasedOnVehicle[row.vehicleModelIdKey][markerFeaturesBasedOnVehicleDestKey] = []
                        }
                        markerFeaturesBasedOnVehicle[row.vehicleModelIdKey][markerFeaturesBasedOnVehicleSourceKey].push(originMarkerFeature)
                        markerFeaturesBasedOnVehicle[row.vehicleModelIdKey][markerFeaturesBasedOnVehicleDestKey].push(destinationMarkerFeature)                        
                    })
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
