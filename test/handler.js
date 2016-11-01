'use strict';

const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const Handler = require('./../lib/handler');
const ExchangeRate = require('./../lib/exchange_rate');


function test_callback(type, num) {
	// should see one success or bury at end
	console.log(type);
}

describe('Handler() test success calls', function () {
	let max_success = 10;
	let handler = new Handler({rate: {success: max_success}}, new ExchangeRate());
	let promise = Promise.resolve(0.8);
	let stub_rate = sinon.stub(handler.exrate, 'rate', function (from, to) { return promise; });
	let stub_save = sinon.stub(handler, '_save_to_db', function () { console.log('save'); });

	before(function (done) {
		promise.then(function (rate) {
			done();
		});
	});

	after(function () {
		stub_rate.restore();
		stub_save.restore();
	});

	it('work() successful rate() calls should not save more than max_success', function (done) {
		for (let i = 0; i < (max_success + 1); i++) {
			handler.work({from: 'HKD', to: 'USD'}, test_callback);
		}
		done();
		expect(handler.rates).to.have.length(max_success);
		expect(console.log.calledWith('success')).to.be.true;
		expect(console.log.calledWith('bury')).to.be.false;
		expect(console.log.calledWith('save')).to.be.true;
	});
});

describe('Handler() test fail calls (non-consecutive)', function () {
	let max_fail = 3;
	let handler = new Handler({rate: {fail: max_fail}}, new ExchangeRate());
	let promise_ok = Promise.resolve(0.8);
	let promise_fail = Promise.reject(new Error('error fail rate'));
	let stub_ok = null;
	let stub_fail = null;
	before(function (done) {
		promise_ok.then(function (rate) {
			done();
		});
		promise_fail.then(function (rate) {
			done();
		});
	});

	after(function () {
		stub_ok.restore();
		stub_fail.restore();
	});

	it('work() fail rate() calls should not exceed max_fail', function (done) {
		// ok, ok, fail, fail, ok, fail, fail
		stub_ok = sinon.stub(handler.exrate, 'rate', function (from, to) { return promise_ok; });
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		stub_ok.restore();

		stub_fail = sinon.stub(handler.exrate, 'rate', function (from, to) { return promise_fail; });
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		stub_fail.restore();

		stub_ok = sinon.stub(handler.exrate, 'rate', function (from, to) { return promise_ok; });
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		stub_ok.restore();

		stub_fail = sinon.stub(handler.exrate, 'rate', function (from, to) { return promise_fail; });
		handler.work({from: 'HKD', to: 'USD'}, test_callback);
		stub_fail.restore();

		done();
		expect(handler.fail_ctr).to.equal(max_fail);
		expect(console.log.calledWith('success')).to.be.false;
		expect(console.log.calledWith('bury')).to.be.true;
		expect(console.log.calledWith('save')).to.be.false;
	});
});
