const express = require('express');
const server = express();

// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'FlightDataMW';

// Use connect method to connect to the server
async function mongoDb() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  return client;
}

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.get('/', function(req, res) {
  return res.status(200).send('Server Works!');
});

server.post('/service-interface-registry', async function (req, res) {
  // Recibir la interfaz del servicio que se esta registrando
  // Recibir propieades sobre la forma de uso de la interfaz
    // formato de estructura de datos (JSON, CSV, XML etc)
    // tipo de comunicacion (http, ftp, get, post)
  
  // Recibir bajo que datos de los servicios de AvAuth se debe disparar el
    // envio de datos al servicio registrado (disparador) // trigger

  // Recibir conjunto de datos que el servicio desea recibir de la fuente
    // de datos

  // Recibir validaciones y transformaciones a realizar previo al envio
    // de los datos

    // YEAR
    // MONTH
    // DAY
    // DAY_OF_WEEK
    // AIRLINE
    // FLIGHT_NUMBER
    // TAIL_NUMBER
    // ORIGIN_AIRPORT
    // DESTINATION_AIRPORT
    // SCHEDULED_DEPARTURE
    // DEPARTURE_TIME
    // DEPARTURE_DELAY
    // TAXI_OUT
    // WHEELS_OFF
    // SCHEDULED_TIME
    // ELAPSED_TIME
    // AIR_TIME
    // DISTANCE
    // WHEELS_ON
    // TAXI_IN
    // SCHEDULED_ARRIVAL
    // ARRIVAL_TIME
    // ARRIVAL_DELAY
    // DIVERTED
    // CANCELLED
    // CANCELLATION_REASON
    // AIR_SYSTEM_DELAY
    // SECURITY_DELAY
    // AIRLINE_DELAY
    // LATE_AIRCRAFT_DELAY
    // WEATHER_DELAY
  // {
  //   "data_format": "", // JSON || CSV || XML
  //   "comunication_type": "", // http, ftp, get, post
  //   "triggers": {
  //     "CANCELLED": true,
  //     "CANCELLATION_REASON": "mal tiempo"
  //   },
  //   "data": {
  //     "YEAR": {
  //       "validation": {"required", "> 1999"},
  //       "transform": "año: {{YYYY}}"
  //     },
  //     "MONTH": {
  //       "validation": "",
  //       "transform": "{{MM}}"
  //     },
  //     "DAY": {
  //       "validation": "",
  //       "transform": "{{DD}}"
  //     }
  //   }
  // }

  // console.log(req.body);
  // console.log(await mongoDb());
  const data = req.body;
  const client = await mongoDb();
  const collection = client.db("FlightDataMW").collection('service-interface');

  // console.log(collection);
  collection.insertOne(data)
  
  return res.status(200).send('ok');
});

server.listen(5001, function () {
  console.log("Server FlightDataMW running on http://localhost:5001");
});