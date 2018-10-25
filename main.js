var dgram = require('dgram');
var client = dgram.createSocket('udp4');

// express
var express = require('express');
var bodyParser = require('body-parser');
var app = express(); // define our app using express

// database
var Datastore = require('nedb');
var db = {};

var fs = require('fs');

// config & app info
var config = require('./config');
var appInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// database setup

db.devices = new Datastore({
  filename: config.databaseLocation + 'devices.db',
  autoload: true
});

// random functions
function format(str) {
  var args = [].slice.call(arguments, 1),
    i = 0;
  return str.replace(/%s/g, function() {
    return args[i++];
  });
}

function currentTime() {
  var date = new Date();
  return format("%s:%s:%s",
    (date.getHours()<10?'0':'') + date.getHours(),
    (date.getMinutes()<10?'0':'') + date.getMinutes(),
    (date.getSeconds()<10?'0':'') + date.getSeconds()
  )
}

function debugMessage(msg) {
  if (config.debug) {
    console.log(
      format('[%s] %s', currentTime(), msg)
    );
  }
}

// service discovery

client.on('error', (err) => {
	console.log('Server Error:\n${err.stack}');
	client.close();
});

client.on('listening', function () {
  var address = client.address();
  debugMessage(
    format('Service discovery running on port %s', config.port)
  );
  client.setBroadcast(true);
});

client.on('message', function (message, rinfo) {
  debugMessage(
    format('%s:%s @ service discovery : %s', rinfo.address, rinfo.port, message)
  );
  client.send(message, 0, message.length, rinfo.port, rinfo.address);
});

client.bind(config.port);

// http server

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.use(function(req, res, next) {
  debugMessage(
    format('%s @ %s', req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.originalUrl)
  );
  next();
});

// endpoints

router.get('/', function(req, res) {
  res.sendStatus(200);
});

router.get('/package.json', function(req, res) {
  res.json(appInfo);
});

router.post('/register', function(req, res) {
  ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (req.body.device_type) {
    db.devices.insert({
      device_type: req.body.device_type,
      register_time: new Date(),
      ip_address: ip_address
    }, function(err, doc) {
      res.json(doc);
    });
  } else {
    res.sendStatus(400); // #TODO: Error codes
  }
});

router.get('/devices', function(req, res) {
  db.devices.find({}, function(err, docs) {
    res.json(docs);
  });
});

router.get('/scan', function(req, res) { // prompt f_modules to scan person for tags
  var message = new Buffer("scan existing");
  db.devices.find({ device_type: "f_module" }, function(err, docs) {
    for (var i = 0; i < docs.length; i++) {
      client.send(message, 0, message.length, config.port, docs[i].ip_address); // UDP, #TODO: make it TCP
    }
  });
  res.sendStatus(200); // #TODO: Error handling
  // #TODO: Reply from f_module
});

router.get('/scan/new', function(req, res) { // prompt f_modules to scan for new tag
  var message = new Buffer("scan new");
  db.devices.find({ device_type: "f_module" }, function(err, docs) {
    for (var i = 0; i < docs.length; i++) {
      client.send(message, 0, message.length, config.port, docs[i].ip_address); // UDP, #TODO: make it TCP
    }
  });
  res.sendStatus(200); // #TODO: Error handling
  // #TODO: Reply from f_module
  // #TODO: Reply to app
});

// all of our routes will be prefixed with config.apiUrl
app.use(config.apiUrl, router);

app.listen(config.port);
debugMessage(format("HTTP server running on port %s", config.port));
