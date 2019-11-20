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
    midPointLatLng (destinationCoordinates) {
        let latlng1 = this.coords,
          latlng2 = destinationCoordinates
        
        let offsetX = latlng2[1] - latlng1[1],
          offsetY = latlng2[0] - latlng1[0]
        
        let r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
          theta = Math.atan2(offsetY, offsetX)
        
        let thetaOffset = (3.14 / 10)
        
        let r2 = (r / 2) / (Math.cos(thetaOffset)),
          theta2 = theta + thetaOffset
        
        let midpointX = (r2 * Math.cos(theta2)) + latlng1[1],
          midpointY = (r2 * Math.sin(theta2)) + latlng1[0]
        
        let midpointLatLng = [midpointY, midpointX]
        return midpointLatLng
    }
}

export class DestinationMarkerFeature extends MarkerFeature {
    constructor (csvRowData) {
        super (csvRowData)
        this.properties.AREA = csvRowData[toAreaIdKey]
        this.geometry.coordinates = [csvRowData['to_long'], csvRowData['to_lat']]
    }
}
