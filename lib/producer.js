'use strict';

const fivebeans = require('fivebeans');
const client = new fivebeans.client('127.0.0.1', 11300);
const config = require('./../config').local;

const payload = {
	type: config.beanstalk.type,
	payload: {
		from: 'HKD',
		to: 'USD'
	}
};
client
	.on('connect', function () {
		client.use(config.beanstalk.tube_name, function (err, name) {
			client.put(0, 0, 30, JSON.stringify([config.beanstalk.tube, payload]), function (error, id) {
				console.log(id);
			});
		});
	})
	.on('error', function (err) {
		console.log(err);
	})
	.on('close', function () {
		console.log('close');
	})
	.connect();
