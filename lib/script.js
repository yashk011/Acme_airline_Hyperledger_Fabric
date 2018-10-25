/**
 * Create Flight Transaction
 * @param {org.acme.airline.flight.CreateFlight} flightData
 * @transaction
 */
function    createFlight(flightData) {
    // 1. Get the asset registry
    return getAssetRegistry('org.acme.airline.flight.Flight')
        .then(function(flightRegistry){
            // Now add the Flight

            // 2. Get resource factory
            var  factory = getFactory();
            var  NS =  'org.acme.airline.flight';

            // 3. Create the Resource instance
            var  flightId = 'AE102-05-12-18';  /// <<<< THIS IS HARD CODED - FIX IT as an exercise
            
            var  flight = factory.newResource(NS,'Flight',flightId);
            
            // 4. Set the relationship
            flight.flightNumber = flightData.flightNumber;

            // 5. Create a new concept using the factory & set the data in it
            var route = factory.newConcept(NS,"Route");

            route.origin = flightData.origin;
            route.destination = flightData.destination;
            route.schedule = flightData.schedule;
            flight.route = route;
            flight.aliasFlightNumber = [];

            // 6. Emit the event FlightCreated
            var event = factory.newEvent(NS, 'FlightCreated');
            event.flightId = flightId;
            emit(event);

            return flightRegistry.addAll([flight]);
        });
}

/****
 * Creates the flight number from Flight number and the schedule
 * Solution to Exercise.
 */
function generateFlightId(flightNum, schedule){
    var dt = new Date(schedule)

    // Date & Month needs to be in the format 01 02 
    // so add a '0' if they are single digits
    var month = dt.getMonth()+1;
    if((month+'').length == 1)  month = '0'+month;
    var dayNum = dt.getDate();
    if((dayNum+'').length == 1)  dayNum = '0'+dayNum;

    // console.log(dayNum,month,dt.getFullYear())

    return flightNum+'-'+month+'-'+dayNum+'-'+(dt.getFullYear()+'').substring(2,4);
}

/**
 * Create Flight Transaction
 * @param {org.acme.airline.flight.AssignAircraft} flightAircraftData
 * @transaction
 * 
 * **/
function    AssignAircraft(flightAircraftData){
    var flightRegistry={}
    return getAssetRegistry('org.acme.airline.flight.Flight').then(function(registry){
        flightRegistry = registry
        return flightRegistry.get(flightAircraftData.flightId);
    }).then(function(flight){
        if(!flight) throw new Error("Flight : "+flightAircraftData.flightId," Not Found!!!");
        var   factory = getFactory();
        var   relationship = factory.newRelationship('org.acme.airline.aircraft','Aircraft',flightAircraftData.aircraftId);
        flight.aircraft = relationship;
        return flightRegistry.update(flight);
    }).then(function(){
        // Successful update
        var event = getFactory().newEvent('org.acme.airline.flight', 'AircraftAssigned');
        event.flightId = flightAircraftData.flightId;
        event.aircraftId = flightAircraftData.aircraftId;
        emit(event);
    }).catch(function(error){
        throw new Error(error);
    });

}


/****
 
 */