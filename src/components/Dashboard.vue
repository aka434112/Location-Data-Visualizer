<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs11 sm5 offset-sm1>

        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Dashboard',
  data () {
    return {

    }
  },
  methods: {
    initMap () {},
    initLayers () {}
  },
  mounted() {
    this.initMap()
    this.initLayers()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
