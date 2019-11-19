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
        originMarkerFeatures: []
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
      }
    },
    getters: {
      originMarkerFeatures: state => state.originMarkerFeatures,
      destinationMarkerFeatures: state => state.destinationMarkerFeatures,
      markerFeaturesBasedOnVehicleType: state => state.markerFeaturesBasedOnVehicleType,
      loading: state => state.loading
    }
})
