[![CircleCI master build status](https://img.shields.io/circleci/project/github/unplgtc/CBAlerter/master.svg?label=master&logo=circleci)](https://circleci.com/gh/unplgtc/CBAlerter/tree/master)
[![npm version](https://img.shields.io/npm/v/@unplgtc/cbalerter.svg)](https://www.npmjs.com/package/@unplgtc/cbalerter)

# CBAlerter

### Webhook alerting object for Node applications and CBLogger

CBAlerter can be used as a general-purpose object for posting payloads to webhooks, but it also functions as an extension to Unapologetic's [CBLogger](https://github.com/unplgtc/CBAlerter) package.

Extending an instance of CBLogger with a CBAlerter object will allow alert payloads to be sent simply by passing an `alert: true` option to CBLogger. To use CBAlerter on its own, just create a new webhook and then call `CBLogger.alert()` with the necessary arguments.

## Usage

Import CBAlerter into your Node project:

```js
import CBAlerter from '@unplgtc/cbalerter';
```

CBAlerter needs you to configure a webhook before it will be able to kick off requests for you. This can be done with the `addWebhook` function, which takes two arguments: `builder` and `name`. `name` is an optional argument, and if you don't pass one in then the value will be set as `'default'` (but you should never need to worry about that). The `builder` argument should be a function which takes five arguments (`level`, `key`, `data`, `options`, and `err`) and returns a payload that will be sent to your webhook.

```js
function builder(level, key, data, options, err) {
	return {
		url: 'https://example.com/webhook',
		headers: {
			Authorization: `Bearer ${process.env.secretToken}`
		},
		body: {
			text: `${level}: ${key}`,
			data: data,
			err: err
		},
		options
	}
}

CBAlerter.addWebhook(builder);
```

The above code would create a new default webhook using the `builder` function. From then on any time you call `CBAlerter.alert([...])`, the arguments from that call will be passed through to `builder` to generate a payload. That payload will then be sent as a POST request.

```js
CBAlerter.alert('ERROR', 'foo', { bar: baz }, {}, new Error());
```

As long as you're using the default (unnamed) webhook, you don't actually need to pass in an `options` argument. If an `Error` is sent in that argument position, CBAlerter will figure this out and apply your arguments correctly. In other words, the above code is equivalent to this:

```js
CBAlerter.alert('ERROR', 'foo', { bar: baz }, new Error());
```

The `err` argument is also optional, so if you don't have an error that you need to alert about, and you want to use the default webhook, you can trigger an alert with even fewer arguments:

```js
CBAlerter.alert('INFO', 'foo', { bar: baz });
```

The above calls would be passed to your `builder` function to generate payloads, then those payloads would be POSTed to "https://example.com/webhook". Your builder should always include the URL and any required headers in its payload. CBAlerter is just going to send whatever payload the builder returns via POST.

CBAlerter's `alert()` function uses Unapologetic's [HttpRequest](https://github.com/unplgtc/HttpRequest) package to POST requests. See that package for info on what data is returned for each of your requests, and what options you can use when configuring payloads in your `builder`.

```js
let resErr;
const res = await CBAlerter.alert('ERROR', 'foo', { bar: baz }, new Error())
	.catch(err => resErr = err);

if (!resErr) {
	console.log('Success!');
}
```

CBAlerter supports more than one webhook configuration at a time. Just add further webhooks with non-null `name` arguments to configure options beyond the `'default'` webhook.

```js
CBAlerter.addWebhook('another_webhook', builder);
```

To activate a named webhook, just pass the name into your calls to `alert()` via the `webhook` parameter in the `options` argument:

```js
CBAlerter.alert('ERROR', 'foo', { bar: baz }, { webhook: 'another_webhook' }, new Error());
```

To use CBAlerter with CBLogger, import CBAlerter as usual and configure webhooks just as described above. Once your alerter is set up, pass it to `CBLogger.extend()` and you'll be ready to go.

```js
import CBAlerter from '@unplgtc/cbalerter';
import CBLogger from '@unplgtc/cblogger';

function builder(level, key, data, options, err) { ... }

CBAlerter.addWebhook(builder);

CBLogger.extend(CBAlerter);

CBLogger.error('ERROR', 'foo', { bar: baz }, { alert: true }, new Error());
```

The above code will output a log message in CBLogger's standardized format, then POST an alert with the same data using the `builder` function that you configured CBAlerter with to generate the payload.

CBLogger's `options` argument is passed directly through to CBAlerter, so you can trigger named webhooks intuitively:

```js
CBLogger.error('ERROR', 'foo', { bar: baz }, { alert: true, webhook: 'another_webhook' }, new Error());
```
