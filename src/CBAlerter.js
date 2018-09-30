'use strict';

const request = require('request');
const StandardError = require('@unplgtc/standard-error');

const CBAlerter = {
	alert(level, key, data, options, err) {
		var webhook = options.webhook ? options.webhook : 'default';
		if (!this.webhooks[webhook]) {
			return StandardError.CBAlerter_404;
		}
		return this.postToWebhook(webhook, level, key, data, options, err);
	},

	addWebhook(builder, name = 'default') {
		if (this.webhooks[name]) {
			return StandardError.CBAlerter_409;
		}
		if (typeof builder != 'function' || builder.length < 5) {
			return StandardError.CBAlerter_400;
		}
		this.webhooks[name] = builder;
		return true;
	}
}

const Internal = {
	webhooks: {},

	postToWebhook(webhook, level, key, data, options, err) {
		request.post(
			this.webhooks[webhook](level, key, data, options, err),
			function(err, response, body) {
				if (!err) {
					console.log(body);
				} else {
					console.error('Error: ' + response.statusCode);
				}
			}
		);
		return true;
	}
}

StandardError.add([
	{code: 'CBAlerter_400', domain: 'CBAlerter', title: 'Bad Rquest', message: 'The requested builder was not a function or accepted fewer than the 5 required arguments (level, key, data, options, err)'},
	{code: 'CBAlerter_404', domain: 'CBAlerter', title: 'Not Found', message: 'A webhook with the requested name could not be found'},
	{code: 'CBAlerter_409', domain: 'CBAlerter', title: 'Conflict', message: 'A webhook with the given name already exists'}
]);

Object.setPrototypeOf(CBAlerter, Internal);

module.exports = CBAlerter;
