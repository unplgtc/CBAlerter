'use strict';

const _ = require('@unplgtc/standard-promise');
const HttpRequest = require('@unplgtc/http-request');
const StandardError = require('@unplgtc/standard-error');

const CBAlerter = {
	alert(level, key, data, options, err) {
		var webhook = options.webhook ? options.webhook : 'default';
		if (!this.webhooks[webhook]) {
			return _(Promise.reject(StandardError.CBAlerter_404));
		}
		return _(this.postToWebhook(webhook, level, key, data, options, err));
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
		return HttpRequest.create()
			.build(this.webhooks[webhook](level, key, data, options, err))
			.post()
	}
}

StandardError.add([
	{code: 'CBAlerter_400', domain: 'CBAlerter', title: 'Bad Rquest', message: 'The requested builder was not a function or accepted fewer than the 5 required arguments (level, key, data, options, err)'},
	{code: 'CBAlerter_404', domain: 'CBAlerter', title: 'Not Found', message: 'A webhook with the requested name could not be found'},
	{code: 'CBAlerter_409', domain: 'CBAlerter', title: 'Conflict', message: 'A webhook with the given name already exists'}
]);

Object.setPrototypeOf(CBAlerter, Internal);

module.exports = CBAlerter;
