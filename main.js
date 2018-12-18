var dgram = require('dgram');
var client = dgram.createSocket('udp4');

// express
var express = require('express');
var bodyParser = require('body-parser');
var app = express(); // define our app using express

// email
var mailer = require("nodemailer");
var gmailAccount = require('./gmailAccount');

// database
var Datastore = require('nedb');
var db = {};

var fs = require('fs');

// config & app info
var config = require('./config');
var appInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// email setup

var smtpTransport = mailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: gmailAccount.email,
    pass: gmailAccount.password
  }
});

var mail = {
    from: "Your Door",
    to: config.email,
    subject: "",
    text: "",
    html: ""
}

// database setup

db.devices = new Datastore({
	filename: config.databaseLocation + 'devices.db',
	autoload: true
});

// user authentication

// #TODO: Add encryption, as a university project we don't need it, but if you want to run it yourself you absolutely need it

db.userdata = new Datastore({
	filename: config.databaseLocation + 'userdata.db',
	autoload: true
});

db.tags = new Datastore({
	filename: config.databaseLocation + 'tags.db',
	autoload: true
});

db.sessions = new Datastore(); // In-memory only

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
	return format(
		'%s:%s:%s',
		(date.getHours() < 10 ? '0' : '') + date.getHours(),
		(date.getMinutes() < 10 ? '0' : '') + date.getMinutes(),
		(date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
	);
}

function debugMessage(msg) {
	if (config.debug) {
		console.log(format('[%s] %s', currentTime(), msg));
	}
}

// global variables, yeah I'm that lazy

var newScanPromt = new Date(0); // update on new tag scan prompt from client.android, allows for new scan timeout

// service discovery

client.on('error', err => {
	console.log('Server Error:\n${err.stack}');
	client.close();
});

client.on('listening', function() {
	var address = client.address();
	debugMessage(format('Service discovery running on port %s', config.port));
	client.setBroadcast(true);
});

client.on('message', function(message, rinfo) {
	debugMessage(
		format(
			'%s:%s @ service discovery : %s',
			rinfo.address,
			rinfo.port,
			message
		)
	);
	client.send(message, 0, message.length, rinfo.port, rinfo.address);
});

client.bind(config.port);

// http server
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	debugMessage(
		format(
			'%s @ %s',
			req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			req.originalUrl
		)
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
	if (req.body.mac_address) {
		db.devices.findOne({ mac_address: req.body.mac_address }, function(err, docs) {
			if (!docs) {
				// if device with mac address doesn't exist in database, create entry
				db.devices.insert(
					{
						mac_address: req.body.mac_address,
						register_time: new Date(),
						ip_address: ip_address
					},
					function(err, doc) {
						res.json(doc);
					}
				);
			} else {
				// if device has already been registered, update the entry
				db.devices.update(
					{ mac_address: req.body.mac_address },
					{
						$set: {
							register_time: new Date(),
							ip_address: ip_address
						}
					}
				);
				
				db.devices.findOne({ mac_address: req.body.mac_address }, function(err, docs) {
					if (docs) {
						res.json(docs);
					} else {
						res.sendStatus(500); // something went wrong somewhere
					}
				});
			}
		});
	} else {
		res.sendStatus(422);
	}
});

router.get('/devices', function(req, res) {
	db.devices.find({}, function(err, docs) {
		res.json(docs);
	});
});

router.get('/tags', function(req, res) {
	db.tags.find({}, function(err, docs) {
		res.json(docs);
	});
});

// client.android #TODO: add auth for "production".

router.post('/edit', function(req, res) {
	if (req.body.id && req.body.name && req.body.desc) {
		db.tags.update(
			{ _id: req.body.id },
			{
				$set: {
					name: req.body.name,
					desc: req.body.desc
				}
			}
		);

		db.tags.findOne({ _id: req.body.id }, function(err, docs) {
			if (docs) {
				res.json(docs);
			} else {
				res.sendStatus(500); // something went wrong somewhere.
			}
		});
	} else {
		res.sendStatus(422);
	}
});

// nodemcu.f_module

router.post('/scan/new', function(req, res) {
	if (req.body.mac_address && req.body.tag) {
		db.tags.findOne({ tag: req.body.tag }, function(err, docs) {
			if (!docs) {
				tempObject = {
					tag: req.body.tag,
					name: req.body.tag,
					desc: '',
					time: new Date()
				};
				db.tags.insert(tempObject);
				res.json(tempObject);
			} else {
				res.sendStatus(409); // conflict, tag already exists
			}
		});
	} else {
		res.sendStatus(422);
	}
});

router.post('/scan/single', function(req, res) {
	debugMessage('/scan/single is deprecated, use /scan instead');
	if (req.body.mac_address && req.body.tag) {
		db.tags.findOne({ tag: req.body.tag }, function(err, docs) {
			if (docs) {
				// success! we scanned a tag that already exists.
				res.json(docs);
			} else {
				res.sendStatus(404);
			}
		});
	} else {
		res.sendStatus(422);
	}
});

router.post('/scan', function(req, res) {
	if (req.body.mac_address && req.body.tags) {
		querry = [];
		for (var i = 0; i < req.body.tags.length; i++) {
			querry.push({
				tag: req.body.tags[i]
			});
		}

		// #TODO: Add groups
		db.tags.find({ $not: {$or: querry} }, function(err, docs) {

			if (docs) {
				// if an item is not scanned
				missingObjects = [];
				for (var i = 0; i < docs.length; i++) {
					debugMessage("missing: " + docs[i].name);
					missingObjects.push(docs[i].name);
				}

				var mail = {
				    from: "Your Door",
				    to: config.email,
				    subject: "You forgot something!",
				    text: "You forgot: " + missingObjects.join(", ") + ".",
				    html: "You forgot: <b>" + missingObjects.join(", ") + "</b>."
				}

				smtpTransport.sendMail(mail, function(error, response){
				    if(error){
				        console.log(error);
				    }else{
				        console.log("Message sent: " + mail.text);
				    }

				    smtpTransport.close();
				});
			}

		});

		db.tags.find({ $or: querry }, function(err, docs) {
			if (docs) {
				// success! we scanned a tag that already exists.


				res.json(docs);
			} else {
				res.sendStatus(404);
			}
		});
	} else {
		res.sendStatus(422);
	}
});

// users

router.get('/user/:id', function(req, res) {
	db.userdata.findOne({ user: req.params.id }, function(err, docs) {
		delete docs.pass; // remove password from JSON response
		res.json(docs);
	});
});

router.post('/user/register', function(req, res) {
	if (req.body.username && req.body.password) {
		db.userdata.findOne({ user: req.body.username }, function(err, docs) {
			if (!docs) {
				// if user with given username doesn't exist
				db.userdata.insert({
					user: req.body.username,
					pass: req.body.password,
					admin: false
				});
				res.sendStatus(200);
			} else {
				debugMessage(
					format('User %s already exists', req.body.username)
				);
				res.sendStatus(409);
			}
		});
	} else {
		res.sendStatus(422);
	}
});

router.post('/user/login', function(req, res) {
	if (req.body.username && req.body.password) {
		db.userdata.findOne({ user: req.body.username }, function(err, docs) {
			if (req.body.password === docs.pass) {
				res.sendStatus(200);
				return;
			}
			debugMessage(format('User %s already exists', req.body.username));
			res.sendStatus(409);
		});
	} else {
		res.sendStatus(422);
	}
});

// all of our routes will be prefixed with config.apiUrl
app.use(config.apiUrl, router);

app.listen(config.port);
debugMessage(format('HTTP server running on port %s', config.port));
