[![CircleCI master build status](https://img.shields.io/circleci/project/github/unplgtc/CBAlerter/master.svg?label=master&logo=circleci)](https://circleci.com/gh/unplgtc/CBAlerter/tree/master)
[![npm version](https://img.shields.io/npm/v/@unplgtc/cbalerter.svg)](https://www.npmjs.com/package/@unplgtc/cbalerter)

# CBAlerter

### Webhook alerting object for Node applications and CBLogger

CBAlerter can be used as a general-purpose object for posting payloads to webhooks, but it also functions as an extension to Unapologetic's [CBLogger](https://github.com/unplgtc/CBAlerter) package.

Extending an instance of CBLogger with a CBAlerter object will allow alert payloads to be sent simply by passing an `alert: true` option to CBLogger. To use CBAlerter on its own, just create a new webhook and then call `CBLogger.alert()` with the necessary arguments.

## Usage

Import CBAlerter into your Node project:

```js
const CBAlerter = require('@unplgtc/cbalerter');
```

CBAlerter needs you to configure a webhook before it will be able to kick off requests for you. This can be done with the `addWebhook` function, which takes two arguments: `builder` and `name`. `name` is an optional argument, and if you don't pass one in then the value will be set as `'default'` (but you should never need to worry about that). The `builder` argument should be a function which takes five arguments (`level`, `key`, `data`, `options`, and `err`) and returns a payload that will be sent to your webhook.

```js
function builder(level, key, data, options, err) {
	return {
		url: 'https://example.com/webhook',
		headers: {
			Authorization: `Bearer ${process.env.secretToken`}
		},
		body: {
			text: `${level}: ${key}`,
			data: data,
			err: err
		}
	}
}

CBAlerter.addWebhook(builder);
```

The above code would create a new default webhook using the `builder` function. From then on any time you call `CBAlerter.alert([...])`, the arguments from that call will be passed through to `builder` to generate a payload. That payload will then be sent as a POST request.

```js
CBAlerter.alert('ERROR', 'foo', {bar: baz}, undefined, new Error());
```

The above call would be passed to `builder` to generate a payload, then that payload would be POSTed to "https://example.com/webhook". Your builder should always include the URL and any required headers in its payload. CBAlerter is just going to send whatever payload the builder returns via POST.

CBAlerter's `alert()` function uses [request-promise-native](https://github.com/request/request-promise-native) to POST requests. It returns the Promise that request-promise-native generates, which you can then unwrap to access the success or failure status of your alert.

```js
var res = await CBAlerter.alert('ERROR', 'foo', {bar: baz}, undefined, new Error())
	.catch((err) => console.error('Error!', err));

if (res.statusCode === 200) {
	console.log('Success!');
}
```

CBAlerter supports more than one webhook configurations at a time. Just add further webhooks with non-null `name` arguments to configure options beyond `'default'`.

```js
CBAlerter.addWebhook(builder, 'another_webhook');
```

To activate a named webhook, just pass the name into your calls to `alert()` via a `webhook` parameter in the `options` argument.

```js
CBAlerter.alert('ERROR', 'foo', {bar: baz}, {webhook: 'another_webhook'}, new Error());
```

To use CBAlerter with CBLogger, import CBAlerter as usual and configure webhooks just as described above. Once your alerter is set up, pass it to `CBLogger.extend()` and you'll be ready to go.

```js
const CBAlerter = require('@unplgtc/cbalerter');
const CBLogger = require('@unplgtc/cblogger');

function builder(level, key, data, options, err) { ... }

CBAlerter.addWebhook(builder);

CBLogger.extend(CBAlerter);

CBLogger.error('ERROR', 'foo', {bar: baz}, {alert: true}, new Error());
```

The above code will output a log message in CBLogger's standardized format, then POST an alert with the same data using CBAlerter's configured `builder` function to generate the payload.
