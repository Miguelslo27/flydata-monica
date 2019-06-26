// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const getEmptyFilter = require('./utils');
const axios = require('axios');
const airlines = require('./mocks/airlines_mock.json');
const airports = require('./mocks/airports_mock.json');
const clients = require('./mocks/clients_mock.json');
const redisClient = require('redis');
const redis = redisClient.createClient();

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'AvAuthDataSet';

// Use connect method to connect to the server
async function mongoDb() {
  var options = {
    useNewUrlParser: true
  };

  const client = await MongoClient.connect(url, options);
  return client;
}

let page = config.OFFSET / config.LOTS_SIZE;
let offset = config.OFFSET;

module.exports = function processLot() {
  if (page == config.MAX_LOTS) {
    return;
  }

  const client = mongoDb();

  client
    .then(async function (mongoclient) {
      const flightsCollection = mongoclient.db(dbName).collection('flights');
      const flightsCount = await flightsCollection.countDocuments();
      let filters = getEmptyFilter({
        YEAR: '$and',
        MONTH: '$and',
        DAY: '$and',
        DAY_OF_WEEK: '$and',
        AIRLINE: '$and',
        FLIGHT_NUMBER: '$and',
        TAIL_NUMBER: '$and',
        ORIGIN_AIRPORT: '$and',
        DESTINATION_AIRPORT: '$and',
        SCHEDULED_DEPARTURE: '$and',
        DEPARTURE_TIME: '$and',
        DEPARTURE_DELAY: '$and',
        TAXI_OUT: '$and',
        WHEELS_OFF: '$and',
        SCHEDULED_TIME: '$and',
        ELAPSED_TIME: '$and',
        AIR_TIME: '$and',
        DISTANCE: '$and',
        WHEELS_ON: '$and',
        TAXI_IN: '$and',
        SCHEDULED_ARRIVAL: '$and',
        ARRIVAL_TIME: '$and'
      });

      // let flightsLotCacheKey = page + '_' + offset + '_' + config.LOTS_SIZE + '_' + config.MAX_LOTS;
      let flightsLotCacheKey = `${page}_${offset}_${config.LOTS_SIZE}_${config.MAX_LOTS}`;
      let flights;

      console.log(flightsLotCacheKey);

      redis.get(flightsLotCacheKey, async (error, reply) => {
        if (error) {
          throw error;
        }

        if (reply) {
          flights = JSON.parse(reply);
        }
        else {
          flights = await flightsCollection.find(filters).skip(offset).limit(config.LOTS_SIZE).toArray();

          redis.set(flightsLotCacheKey, JSON.stringify(flights), error => {
            if (error) {
              throw error;
            }
          });
        }

        // Valido los datos y filtro antes de enviarlos
        // Filtrar en el find por registros que no tengan timestamp
        // const flights = await flightsCollection.find(filters).skip(offset).limit(config.LOTS_SIZE).toArray();
  
        flights.map(flight => {
          let airline = airlines.find(airline => airline.IATA_CODE == flight.AIRLINE);
          let origin_airport = airports.find(airport => airport.IATA_CODE == flight.ORIGIN_AIRPORT);
          let destination_airport = airports.find(airport => airport.IATA_CODE == flight.DESTINATION_AIRPORT);
  
          flight.AIRLINE = airline;
          flight.ORIGIN_AIRPORT = origin_airport;
          flight.DESTINATION_AIRPORT = destination_airport;
        });
  
        
        // Les agrego el timestamp a los registros y los actualizo
        flightsCollection.updateMany(filters, {
          'UPDATED': new Date().getTime()
        });
  
        // Luego se los envio a todos los clientes
        clients.forEach(function (client) {
          axios
            .post(client['service-url'], flights)
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });
        });
  
        if (client.close) {
          client.close();
        }
  
        page++;
        offset = page * config.LOTS_SIZE;
  
        setTimeout(processLot, config.FREQUENCY);
      });
    })
    .catch(function (error) {
      if (client.close) {
        client.close();
      }
      console.log(error);
    });
}
