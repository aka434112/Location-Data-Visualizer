function geoJson2heat (geojson, intensity) {
    if(geojson) {
        return geojson.features.map(function (feature) {
        return [parseFloat(feature.geometry.coordinates[1]), 
        parseFloat(feature.geometry.coordinates[0]), intensity]
    })
    }
}

onmessage = function (messageEvent) {
    let params = messageEvent.data
    const heatMapCompatibleData = geoJson2heat(params.geoJSON, params.intensity)
    postMessage({heatMapCompatibleData, type: params.type})
}
