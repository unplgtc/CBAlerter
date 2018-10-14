'use strict';

const CBAlerter = require('./../src/CBAlerter');
const StandardError = require('@unplgtc/standard-error');
const HttpRequest = require('@unplgtc/http-request');

HttpRequest.build = jest.fn(() => HttpRequest);
HttpRequest.post = jest.fn(() => Promise.resolve());

var builder = function(level, key, data, options, err) {
	return {
		url: 'some_url',
		body: {
			key: key,
			data: data
		},
		json: true
	}
}
var anotherBuilder = function(level, key, data, options, err) {
	return {
		url: 'some_other_url',
		body: {
			key: key,
			data: data
		},
		json: true
	}
}
var webhookName = 'some_webhook_name';
var mockedArgs = ['DEBUG', 'test_key', {text: 'testing'}, {alert: true}];
var moreMockedArgs = ['ERROR', 'another_test_key', {text: 'testing again'}, {alert: true, webhook: webhookName}, StandardError.http_500()];

test('Can\'t trigger a default alert before a default webhook has been added', async() => {
	// Execute
	var resErr;
	var res = await CBAlerter.alert(...mockedArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toEqual(StandardError.CBAlerter_404());
});

test('Can add a default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(builder);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via the default webhook', async() => {
	// Execute
	var resErr;
	var res = await CBAlerter.alert(...mockedArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(builder(...mockedArgs));
	expect(HttpRequest.post).toHaveBeenCalled();
});

test('Can\'t add a second default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(anotherBuilder);

	// Test
	expect(success).toEqual(StandardError.CBAlerter_409());
});

test('Can add a named webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(anotherBuilder, webhookName);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via a named webhook', async() => {
	// Execute
	var resErr;
	var res = await CBAlerter.alert(...moreMockedArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(anotherBuilder(...moreMockedArgs));
	expect(HttpRequest.post).toHaveBeenCalled();
});

test('Can\'t add a named webhook with an existing name', async() => {
	// Execute
	var success = CBAlerter.addWebhook(builder, webhookName);

	// Test
	expect(success).toEqual(StandardError.CBAlerter_409());
});
