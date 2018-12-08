var config =  {};

config.databaseLocation = './data/'
config.apiUrl = '/api';
config.port = 8080;
config.debug = true;
config.newScanPromtTimeout = 60000; // ms, 60000 ms = 1 min
config.saltRounds = 10;

module.exports = config;
