// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const getEmptyFilter = require('./utils');
const axios = require('axios');

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
  console.log("Page", page);
  console.log("config.MAX_LOTS", config.MAX_LOTS);

  if (page == config.MAX_LOTS) {
    return;
  }

  const client = mongoDb();

  client
    .then(async function (mongoclient) {
      const flightsCollection = mongoclient.db(dbName).collection('flights');
      const flightsCount = await flightsCollection.countDocuments();

      console.log(flightsCount);

      // Filtrar en el find por registros que no tengan timestamp
      const flights = await flightsCollection.find(getEmptyFilter({
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
      })).skip(offset).limit(config.LOTS_SIZE).toArray();

      // Valido los datos y filtro antes de enviarlos

      // Les agrego el timestamp a los registros y los actualizo

      // Luego se los envio a todos los clientes
      // clients.forEach(function (client) {
      //   axios
      //     .post(client['service-url'], flights)
      //     .then(function (response) {
      //       console.log(response);
      //     })
      //     .catch(function (error) {
      //       console.log(error);
      //     });
      // });

      if (client.close) {
        client.close();
      }

      page++;
      offset = page * config.LOTS_SIZE;

      // setTimeout(processLot, config.FREQUENCY);
    })
    .catch(function (error) {
      if (client.close) {
        client.close();
      }
      console.log(error);
    });
}
