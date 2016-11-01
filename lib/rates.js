'use strict';

const mongoose = require('mongoose');

/*
 * db.rates.collection schema
 * from - currency e.g. HKD
 * to - currency
 * date - ISO date object when rate was fetched
 * rate - exchage rate of FROM to TO (round off to 2 decimals)
 */
const schema = mongoose.Schema({
	from: String,
	to: String,
	date: {type: Date, default: Date.now},
	rate: Number
});

module.exports = mongoose.model('Rates', schema);
