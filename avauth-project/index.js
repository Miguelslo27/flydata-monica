const express = require('express');
// const axios = require('axios');
const redis = require('redis');
const server = express();
// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;

const airlines = require('./mocks/airlines_mock.json');
const airports = require('./mocks/airports_mock.json');
const clients = require('./mocks/clients_mock.json');
const config = require('./config.json');

server.use(express.urlencoded());
server.use(express.json());

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

/*

- Entran datos nuevos a la base de datos de vuelos
- avauth revisa que haya datos nuevos
- avauth obtiene las apis registradas
- valida los datos a enviar
-- Bucle
  - envia los datos a cada api registrada
  - actualiza los registros

*/

let page = config.OFFSET / config.LOTS_SIZE;
let offset = config.OFFSET;

function processLot() {
  console.log("Page", page);
  console.log("config.MAX_LOTS", config.MAX_LOTS);

  if (page == config.MAX_LOTS) {
    return;
  }

  const client = mongoDb();
  const emptyFilter = [
    { $ne: "" },
    { $ne: undefined },
    { $ne: null }
  ];
  const norEmptyFilter = {
    $nor: emptyFilter
  };
  const orEmptyFilter = {
    $or: emptyFilter
  };

  client
    .then(async function (mongoclient) {
      const flightsCollection = mongoclient.db(dbName).collection('flights');
      // const flightsCount = await flightsCollection.countDocuments();

      // Filtrar en el find por registros que no tengan timestamp
      const flights = await flightsCollection.find({
        YEAR: norEmptyFilter,
        MONTH: norEmptyFilter,
        DAY: norEmptyFilter,
        DAY_OF_WEEK: norEmptyFilter,
        AIRLINE: norEmptyFilter,
        FLIGHT_NUMBER: norEmptyFilter,
        TAIL_NUMBER: norEmptyFilter,
        ORIGIN_AIRPORT: norEmptyFilter,
        DESTINATION_AIRPORT: norEmptyFilter,
        SCHEDULED_DEPARTURE: norEmptyFilter,
        DEPARTURE_TIME: norEmptyFilter,
        DEPARTURE_DELAY: norEmptyFilter,
        TAXI_OUT: norEmptyFilter,
        WHEELS_OFF: norEmptyFilter,
        SCHEDULED_TIME: norEmptyFilter,
        ELAPSED_TIME: norEmptyFilter,
        AIR_TIME: norEmptyFilter,
        DISTANCE: norEmptyFilter,
        WHEELS_ON: norEmptyFilter,
        TAXI_IN: norEmptyFilter,
        SCHEDULED_ARRIVAL: norEmptyFilter,
        ARRIVAL_TIME: norEmptyFilter,
        ARRIVAL_DELAY: norEmptyFilter,
        DIVERTED: norEmptyFilter,
        CANCELLED: norEmptyFilter,
        AIR_SYSTEM_DELAY: norEmptyFilter,
        SECURITY_DELAY: norEmptyFilter,
        AIRLINE_DELAY: norEmptyFilter,
        LATE_AIRCRAFT_DELAY: norEmptyFilter,
        WEATHER_DELAY: norEmptyFilter,
        UPDATED: orEmptyFilter
      }).skip(offset).limit(config.LOTS_SIZE).toArray();

      // console.log(flights);
      // console.log("Offset", offset);
      console.log("Flights", flights.length);

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

      setTimeout(processLot, config.FREQUENCY);
    })
    .catch(function (error) {
      if (client.close) {
        client.close();
      }
      console.log(error);
    });
}

processLot();

server.get('/', function (req, res) {
  return res.status(200).send(`
    <!doctype html>
    <html>
    <head>
      <title>Servicio AvAuth</title>
    </head>
    <body>
      <h2>Endpoints disponibles:</h2>
      <ul>
        <li>
          <a href="/airlines">/airlines</a>
        </li>
        <li>
          <a href="/airports">/airports</a>
        </li>
      </ul>
    <body>
    </html>
  `);
});

server.get('/airlines', function (req, res) {
  return res.status(200).send(airlines);
});

server.get('/airports', function (req, res) {
  return res.status(200).send(airports);
});

server.get('/airlines/:id', function (req, res) {
  const airlineIdRequest = req.param.id;

  redis.get(airlineIdRequest, function (error, reply) {
    if (error) {
      throw error;
    }

    if (reply) {
      console.log("RESPONSE WITH REDIS");
      return res.status(200).send(JSON.parse(reply));
    }

    const airline = airlines.find(airline => airline.IATA_CODE == airlineIdRequest);

    if (!airline) {
      return res.status(404).send({ status: 'error', message: 'Airline not found' });
    }

    redis.set(airlineIdRequest, JSON.stringify(airline), error => {
      throw error;
    });

    console.log("RESPONSE WITHOUT REDIS");
    return res.status(200).send(airline);
  });
});

server.get('/airports/:id', function (req, res) {
  const airportIdRequest = req.param.id;

  redis.get(airportIdRequest, function (error, reply) {
    if (error) {
      throw error;
    }

    if (reply) {
      console.log("RESPONSE WITH REDIS");
      return res.status(200).send(JSON.parse(reply));
    }

    const airport = airports.find(airport => airport.IATA_CODE == airportIdRequest);

    if (!airport) {
      return res.status(404).send({ status: 'error', message: 'Airport not found' });
    }

    redis.set(airportIdRequest, JSON.stringify(airport), error => {
      throw error;
    });

    console.log("RESPONSE WITHOUT REDIS");
    return res.status(200).send(airport);
  });
});

server.listen(5000, function () {
  console.log("Server online en el puerto 5000, accede a http://localhost:5000");
});
