export default {
    tile: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
    geoJSONMarkerOptionOrigin: {
        radius: 3,
        fillColor: "#ffaa00",
        opacity: 0.6,
        weight: 1,
        fillOpacity: 0.6
    },
    geoJSONMarkerOptionDestination: {
        radius: 3,
        fillColor: "#af0",
        opacity: 1,
        weight: 1,
        fillOpacity: 1      
    },
    vehicleModelIdKey: 'vehicle_model_id',
    markerFeaturesBasedOnVehicleSourceKey: 'source',
    markerFeaturesBasedOnVehicleDestKey: 'dest',
    mobileBookingKey: 'mobile_site_booking',
    desktopBookingKey: 'online_booking',
    otherMediumBookingKey: 'other mediums',
    bookingObjKey: 'medium_of_booking',
    locationSrcKey: 'source',
    locationDestKey: 'dest',
	carCancellationKey: 'Car_Cancellation',
	markerLimit: 15000,
	filterLoadingDelay: 500,
    vehicleModelConstant: 'Model ',
    demandObjKey: 'demand_based_on_vehicle_model',
	bookingTypeBasedChartOptions: {
        title: 'THE NUMBER OF BOOKING AGAINST THE PLATFORM',
        titleTextStyle : {
            fontSize: 14,
            fontName: 'Montserrat',
            bold: true
        },
        is3D: true,
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out'
        },
        chartArea: {bottom: 15, width: '80%', height: '78%'},
        legend: {
          position:'labeled',
          labeledValueText: 'both',
          textStyle: {
            fontName: 'Montserrat',
            fontSize: 12,
			bold: true
          }
        },
        sliceVisibilityThreshold: 0,
        pieSliceText: 'value'
    },
    vehicleModelBasedchartOptions: {
        title: 'THE NUMBER OF BOOKINGS AGAINST A VEHICLE MODEL',
        titleTextStyle : {
            fontSize: 14,
            fontName: 'Montserrat',
            bold: true
        },
        is3D: true,
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out'
        },
        chartArea: {bottom: 15, width: '80%', height: '78%'},
        legend: {
          position:'labeled',
          labeledValueText: 'both',
          textStyle: {
            fontName: 'Montserrat',
            fontSize: 10,
			bold: true
          }
        },
        sliceVisibilityThreshold: 0,
        pieSliceText: 'value'
    }
}