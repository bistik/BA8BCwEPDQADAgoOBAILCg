'use strict';

const config =
	process.env.NODE_ENV === 'local' ?
	require('./config').local :
	require('./config').remote;

const Beanworker = require('fivebeans').worker;
const Handler = require('./lib/handler');
const ExchangeRate = require('./lib/exchange_rate');
const handlers = {};
handlers[config.beanstalk.type] = new Handler(config, new ExchangeRate());

const options = {
	id: 'worker_1',
	host: config.beanstalk.host,
	port: config.beanstalk.port,
	handlers: handlers,
	ignoreDefault: true
};

const worker = new Beanworker(options);
worker.start([config.beanstalk.tube_name]);
