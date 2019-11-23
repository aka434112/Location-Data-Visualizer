export default {
	methods: {
		geoJson2heat (geojson, intensity) {
			if(geojson) {
				return geojson.features.map(function (feature) {
					return [parseFloat(feature.geometry.coordinates[1]),
					parseFloat(feature.geometry.coordinates[0]), intensity]
				})
			}
		}
	}
}