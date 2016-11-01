'use strict';

const chai = require('chai');
const chai_as_promised = require('chai-as-promised');

chai.use(chai_as_promised);

const nock = require('nock');
const ExchangeRate = require('./../lib/exchange_rate');
const expect = chai.expect;
const assert = chai.assert;

describe('ExchangeRate', function () {
	const exr = new ExchangeRate();
	it('rate() should return 2 decimal places in rate', function () {
		nock('http://api.fixer.io')
			.get(/latest/)
			.reply(200, {'base': 'USD', 'date': '2016-10-25', 'rates': {'USD': 0.12812}});
		return expect(exr.rate('HKD', 'USD')).to.eventually.equal('0.13');
	});
	it('rate() should return 0 if currency is invalid', function () {
		nock('http://api.fixer.io')
			.get(/latest/)
			.reply(200, {'base': 'EUR', 'date': '2016-10-25', 'rates': {}});
		return expect(exr.rate('HKD', 'USD')).to.eventually.equal(0);
	});
	it('rate() should throw error if response is not success', function () {
		nock('http://api.fixer.io')
			.get(/latest/)
			.replyWithError('api is throwing error');
		return assert.isRejected(exr.rate('HKD', 'USD'), Error, 'api is throwing error');
	});
	it('rate() should throw error if response is not json object', function () {
		nock('http://api.fixer.io')
			.get(/latest/)
			.reply(200, 'not an object');
		return assert.isRejected(exr.rate('HKD', 'USD'), Error);
	});
});
