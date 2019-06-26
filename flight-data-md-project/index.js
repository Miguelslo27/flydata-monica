const express = require('express');
const server = express();
// Mongo DB Client
const MongoClient = require('mongodb').MongoClient;
const iServiceInterface = require('./interfaces/service-interface.model');

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
  const data = new iServiceInterface(req.body);
  const client = await mongoDb();
  const collection = client.db("FlightDataMW").collection('service-interface');

  collection.insertOne(data)
    .then(function (success) {
      client.close();
      return res.status(200).send({ status: 'success' });
    })
    .catch(function (error) {
      client.close();
      return res.status(500).send({ status: 'error', error: error });
    });
});

server.post('/process-flight-data', function (req, res) {
  // Validamos los datos
  console.log(req.body);
  // Obtenemos las interfaces registradas
  // Para cada interfaz registrada
    // Validamos los triggers
    // Segun los triggers los datos que envio
  return res.status(200).send({ status: 'success' });
});

server.listen(5001, function () {
  console.log("Server FlightDataMW running on http://localhost:5001");
});