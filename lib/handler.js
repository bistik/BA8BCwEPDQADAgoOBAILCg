'use strict';

const mongoose = require('mongoose');
const Rates = require('./rates');
mongoose.Promise = require('bluebird');

class Handler {
/**
	* fivebeans Handler to save exchange rate from one currency to another
	* @param {object} config - config settings
	* @param {object} config.rate - settings for rate: max number of retry, max number of success, max number of fail
	* @param {string} config.mongodb - db connection string
	* @param {object} exrate - ExchangeRate object (exchange_rate)
	*/
	constructor(config, exrate) {
		this.type = 'exchange_rate_handler';
		this.config = config;
		this.max_success = config.rate.success === undefined ? 3 : config.rate.success;
		this.max_fail = config.rate.fail !== undefined ? config.rate.fail : 3;
		this.retry_success = config.rate.retry_success !== undefined ? config.rate.retry_success : 60;
		this.retry_fail = config.rate.retry_fail !== undefined ? config.rate.retry_fail : 3;
		this.fail_ctr = 1;
		this.exrate = exrate;
		this.rates = [];
	}

/**
	* @method
	* @param {object} payload - payload from producer
	* @param {string} payload.from - currency to convert FROM
	* @param {string} payload.to - currency to convert TO
	* @param {function} callback - function with 2 params: action, delay. action can be 'success','release' or 'bury'. delay is number of seconds to delay. delay used only on 'release'
	*/
	work(payload, callback) {
		this.exrate.rate(payload.from, payload.to)
			.then((rate) => {
				if (this.rates.length === this.max_success) {
					this._save_to_db();
					callback('success');
				} else {
					this.rates.push({
						from: payload.from,
						to: payload.to,
						date: new Date(),
						rate: rate
					});
					callback('release', this.retry_success);
				}
			})
			.catch((err) => {
				console.log(err);
				if (this.fail_ctr === this.max_fail) {
					callback('bury');
				} else {
					this.fail_ctr++;
					callback('release', this.retry_fail);
				}
			});
	}

/**
	* save object.rates[] to db
	* @method (pseudo-private)
	*/
	_save_to_db() {
		mongoose.connect(this.config.mongodb);
		Rates.insertMany(this.rates)
			.then(function (docs) {
				console.log('%d stored docs', docs.length);
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}

module.exports = Handler;
