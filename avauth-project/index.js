const express = require('express');
// const axios = require('axios');
const redisClient = require('redis');
const redis = redisClient.createClient();
const server = express();
const processLot = require('./processLot');
// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;

const airlines = require('./mocks/airlines_mock.json');
const airports = require('./mocks/airports_mock.json');
const clients = require('./mocks/clients_mock.json');

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
  const airlineIdRequest = req.params.id;

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
      if (error) {
        throw error;
      }
    });

    console.log("RESPONSE WITHOUT REDIS");
    return res.status(200).send(airline);
  });
});

server.get('/airports/:id', function (req, res) {
  const airportIdRequest = req.params.id;

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
      if (error) {
        throw error;
      }
    });

    console.log("RESPONSE WITHOUT REDIS");
    return res.status(200).send(airport);
  });
});

server.listen(5000, function () {
  console.log("Server online en el puerto 5000, accede a http://localhost:5000");
});
