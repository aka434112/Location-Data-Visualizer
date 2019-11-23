import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    // Making sure that we're doing
    // everything correctly by enabling
    // strict mode in the dev environment.
    strict: process.env.NODE_ENV !== 'production',
    state: {
        loading: false,
        markerFeaturesBasedOnVehicleType: {},
        destinationMarkerFeatures: [],
        originMarkerFeatures: [],
        heatMapCompatibleDataOrigin: [],
        heatMapCompatibleDataDest: [],
		csvProcessed: false
    },
    mutations: {
      updateOriginMarkerFeatures (state, markerFeatures) {
        state.originMarkerFeatures = markerFeatures
      },
      updateDestMarkerFeatures (state, markerFeatures) {
        state.destinationMarkerFeatures = markerFeatures
      },
      updateApplicationLoadingState (state) {
        state.loading = !state.loading
      },
      updateMarkerFeaturesBasedOnVehicle (state, markerFeatures) {
        state.markerFeaturesBasedOnVehicleType = markerFeatures
      },
      heatMapCompatibleData (state, heatMapCompatibleData) {
        state.heatMapCompatibleDataOrigin = heatMapCompatibleData
      },
      updateHeatMapCompatibleDataOrigin (state, heatMapCompatibleData) {
        state.heatMapCompatibleDataOrigin = heatMapCompatibleData
      },
      updateHeatMapCompatibleDataDest (state, heatMapCompatibleData) {
        state.heatMapCompatibleDataDest = heatMapCompatibleData
		state.csvProcessed = true
      }
    },
    actions: {
      updateOriginMarkerFeatures (context, markerFeatures) {
        context.commit('updateOriginMarkerFeatures', markerFeatures)
      },
      updateDestMarkerFeatures (context, markerFeatures) {
        context.commit('updateDestMarkerFeatures', markerFeatures)
      },
      updateMarkerFeaturesBasedOnVehicle (context, markerFeatures) {
        context.commit('updateMarkerFeaturesBasedOnVehicle', markerFeatures)
      },
      updateHeatMapCompatibleDataOrigin (context, heatMapCompatibleData) {
        context.commit('updateHeatMapCompatibleDataOrigin', heatMapCompatibleData)
      },
      updateHeatMapCompatibleDataDest (context, heatMapCompatibleData) {
        context.commit('updateHeatMapCompatibleDataDest', heatMapCompatibleData)
      }
    },
    getters: {
      originMarkerFeatures: state => state.originMarkerFeatures,
      destinationMarkerFeatures: state => state.destinationMarkerFeatures,
      markerFeaturesBasedOnVehicleType: state => state.markerFeaturesBasedOnVehicleType,
      loading: state => state.loading,
      heatMapCompatibleDataOrigin: state => state.heatMapCompatibleDataOrigin,
      heatMapCompatibleDataDest: state => state.heatMapCompatibleDataDest,
	  fileProcessed: state => state.csvProcessed
    }
})
