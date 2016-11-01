'use strict';

const promisifyAll = require('bluebird').promisifyAll;
const needle = promisifyAll(require('needle'));
const co = require('co');

/*
 * fetch exchange rate from api.fixer.io API and round it off to 2 decimal places
 */
class ExchangeRate {
/*
	* @method - call api.fixer.io api and return exchange rate
	* @params {string} from - currency to convert from
	* @params {string} to - currency to convert to
	*/
	rate(from, to) {
		let url = `http://api.fixer.io/latest?symbols=${from},${to}&base=${from}`;
		return co(function* () {
			return yield needle.getAsync(url);
		}).then(function (response) {
			let rate = 0;
			if (to in response.body.rates) {
				rate = response.body.rates[to].toFixed(2);
			}
			return rate;
		});
	}
}

module.exports = ExchangeRate;
