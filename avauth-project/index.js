const express = require('express');
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
  const airline = airlines.find(function (airline) {
    return airline.IATA_CODE == airlineIdRequest;
  });

  if (!airline) {
    return res.status(404).send({ status: 'error', message: 'Airline not found' });
  }
  
  return res.status(200).send(airline);
});

server.get('/airports/:id', function (req, res) {
  const airportIdRequest = req.params.id;
  const airport = airports.find(function (airport) {
    return airport.IATA_CODE == airportIdRequest;
  });

  if (!airport) {
    return res.status(404).send({ status: 'error', message: 'Airport not found' });
  }

  return res.status(200).send(airport);
});

server.listen(5000, function () {
  console.log("Server online en el puerto 5000, accede a http://localhost:5000");
});
