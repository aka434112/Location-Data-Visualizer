const rowIdKey = 'id'
const fromAreaIdKey = 'from_area_id'
const toAreaIdKey = 'to_area_id'
const markerFeatureType = 'Feature'
const geometryType = 'Point'

class MarkerFeature {
    constructor (csvRowData) {
        this.id = csvRowData[rowIdKey]
        this.type = markerFeatureType
        this.properties = {}
        this.geometry = {}
        this.geometry.type = geometryType
    }
}

export class OriginMarkerFeature extends MarkerFeature {
    constructor (csvRowData) {
        super(csvRowData)
        this.properties.AREA = csvRowData[fromAreaIdKey]
        this.geometry.coordinates = [csvRowData['from_long'], csvRowData['from_lat']]
    }
}

export class DestinationMarkerFeature extends MarkerFeature {
    constructor (csvRowData) {
        super (csvRowData)
        this.properties.AREA = csvRowData[toAreaIdKey]
        this.geometry.coordinates = [csvRowData['to_long'], csvRowData['to_lat']]
    }
}
