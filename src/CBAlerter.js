import HttpRequest from '@unplgtc/http-request';
import { createErrors } from '@unplgtc/standard-error';

const [ AlreadyExistsError, NotFoundError ] = createErrors([
	{
		name: 'AlreadyExistsError',
		namespace: 'CBAlerter',
		namespaceOnly: true,
		message: 'A webhook with the requested name \'``requestedName``\' already exists',
		properties: [ 'requestedName' ]
	},
	{
		name: 'NotFoundError',
		namespace: 'CBAlerter',
		namespaceOnly: true,
		message: 'A webhook with the requested name \'``requestedName``\' could not be found',
		properties: [ 'requestedName' ]
	}
]);

const CBAlerter = {
	alert(level, key, data, options, err) {
		if (!options) {
			options = {};
		}

		if (options instanceof Error) {
			options = {};
			err = options;
		}

		const webhook = options.webhook ? options.webhook : 'default';

		if (!this.webhooks[webhook]) {
			throw new NotFoundError(webhook);
		}

		return this.postToWebhook(webhook, level, key, data, options, err);
	},

	addWebhook(name, builder) {
		if (!builder && typeof name === 'function') {
			builder = name;
			name = 'default';
		}

		if (typeof builder !== 'function') {
			throw new TypeError('The requested CBAlerter payload builder is not a function');
		}

		if (typeof name !== 'string') {
			name = 'default';
		}

		if (this.webhooks[name]) {
			throw new AlreadyExistsError(name);
		}

		this.webhooks[name] = builder;
		return true;
	}
}

const Internal = {
	webhooks: {},

	postToWebhook(webhook, level, key, data, options, err) {
		return Object.create(HttpRequest)
			.build(this.webhooks[webhook](level, key, data, options, err))
			.post();
	}
}

Object.setPrototypeOf(CBAlerter, Internal);

export default CBAlerter;
