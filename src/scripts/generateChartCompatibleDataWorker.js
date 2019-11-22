onmessage = function (messageEvent) {
    const vehicleModelTypes = messageEvent.data
    let modelWiseDemand = [
        ['Vehicle Model', 'Number of Bookings']
    ]
    for(let vehicleModelType in vehicleModelTypes) {
        modelWiseDemand.push([vehicleModelType, vehicleModelTypes[vehicleModelType]['source'].length])
    }
    postMessage(modelWiseDemand)
}