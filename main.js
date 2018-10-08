var dgram = require('dgram');
var client = dgram.createSocket('udp4');

// express
var express = require('express');
var app = express(); // define our app using express

// database
var Datastore = require('nedb');
var db = {};

var fs = require('fs');

//config
var config = require('./config');
