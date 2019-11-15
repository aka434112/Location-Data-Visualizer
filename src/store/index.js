import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    // Making sure that we're doing
    // everything correctly by enabling
    // strict mode in the dev environment.
    strict: process.env.NODE_ENV !== 'production',
    state: {
        markerFeatures: []
    },
    mutations: {
        updateMarkers (state, markerFeatures) {
            state.markerFeatures = markerFeatures
        }
    },
    actions: {
        updateMarkers (context, markerFeatures) {
            context.commit('updateMarkers', markerFeatures)
        }
    },
    getters: {
        markerFeatures: state => state.markerFeatures
    }
})
