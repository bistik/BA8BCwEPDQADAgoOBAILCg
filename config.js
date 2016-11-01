'use strict';

const config = {
	remote: {
		beanstalk: {
			host: 'challenge.aftership.net',
			port: 11300,
			tube_name: 'bistik',
			type: 'exchange_rate_handler'
		},
		rate: {
			success: 10,
			fail: 3,
			retry_success: 60,
			retry_fail: 3
		},
		mongodb: 'mongodb://test:test1234@ds021299.mlab.com:21299/test_currency'
	},
	local: {
		beanstalk: {
			host: '127.0.0.1',
			port: 11300,
			tube_name: 'bistik',
			type: 'exchange_rate_handler'
		},
		rate: {
			success: 10,
			fail: 3,
			retry_success: 3,
			retry_fail: 3
		},
		mongodb: 'mongodb://test:test1234@ds021299.mlab.com:21299/test_currency'
	}
};

module.exports = config;
