'use strict';

const CBAlerter = require('./../src/CBAlerter');
const StandardError = require('@unplgtc/standarderror');
const request = require('request');

var url = 'some_url';

var namedWebhook = 'test';
var url2 = 'some_other_url';

test('Can\'t default alert before a default webhook has been added', async() => {
	// Setup
	var mockedPayload = {
		text: 'Testing'
	};

	// Execute
	var res = CBAlerter.alert(mockedPayload);

	// Test
	expect(res).toBe(StandardError.cbalerter_404);
});

test('Can add a default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(url);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via the default webhook', async() => {
	// Setup
	var mockedPayload = {
		text: 'Testing'
	};
	var mockedPostPayload = {
		url: url,
		body: mockedPayload,
		json: true
	};
	request.post = jest.fn();

	// Execute
	var sent = CBAlerter.alert(mockedPayload);

	// Test
	expect(sent).toBe(true);
	expect(request.post).toHaveBeenCalledWith(mockedPostPayload, expect.any(Function));
});

test('Can\'t add a second default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(url);

	// Test
	expect(success).toBe(StandardError.cbalerter_409);
});

test('Can add a named webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(url2, namedWebhook);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via a named webhook', async() => {
	// Setup
	var mockedPayload = {
		text: 'Testing'
	};
	var mockedPostPayload = {
		url: url2,
		body: mockedPayload,
		json: true
	};
	request.post = jest.fn();

	// Execute
	var sent = CBAlerter.alert(mockedPayload, namedWebhook);

	// Test
	expect(sent).toBe(true);
	expect(request.post).toHaveBeenCalledWith(mockedPostPayload, expect.any(Function));
});

test('Can\'t add a named webhook with an existing name', async() => {
	// Execute
	var success = CBAlerter.addWebhook(url2, namedWebhook);

	// Test
	expect(success).toBe(StandardError.cbalerter_409);
});
