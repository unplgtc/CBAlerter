'use strict';

const request = require('request');
const StandardError = require('@unplgtc/standarderror');

const CBAlerter = {
	alert(payload, webhookName = 'default') {
		if (!this.webhooks[webhookName]) {
			return StandardError.cbalerter_404;
		}
		return this.postToWebhook(payload, webhookName);
	},

	addWebhook(url, name = 'default') {
		if (this.webhooks[name]) {
			return StandardError.cbalerter_409;
		}
		this.webhooks[name] = {url: url};
		return true;
	}
}

const Internal = {
	webhooks: {},

	postToWebhook(payload, name) {
		request.post({
			url: this.webhooks[name].url,
			body: payload,
			json: true
		}, function(err, response, body) {
			if (!err) {
				console.log(body);
			} else {
				console.error('Error: ' + response.statusCode);
			}
		});
		return true;
	}
}

StandardError.add([
	{code: 'cbalerter_404', domain: 'CBAlerter', title: 'Not Found', message: 'A webhook with the requested name could not be found'},
	{code: 'cbalerter_409', domain: 'CBAlerter', title: 'Conflict', message: 'A webhook with the given name already exists'}
]);

Object.setPrototypeOf(CBAlerter, Internal);

module.exports = CBAlerter;
