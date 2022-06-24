import CBAlerter from './../src/CBAlerter.js';
import HttpRequest from '@unplgtc/http-request';
import { jest } from '@jest/globals';

import Errors from '@unplgtc/standard-error';
const { AlreadyExistsError, NotFoundError } = Errors.CBAlerter;
const { HttpError } = Errors;

HttpRequest.build = jest.fn(() => HttpRequest);
HttpRequest.post = jest.fn(() => Promise.resolve());

const builder = function(level, key, data, options, err) {
	return {
		url: 'some_url',
		body: {
			key: key,
			data: data
		}
	}
}

const anotherBuilder = function(level, key, data, options, err) {
	return {
		url: 'some_other_url',
		body: {
			key: key,
			data: data
		}
	}
}

const webhookName = 'some_webhook_name',
      mockedArgs = [ 'DEBUG', 'test_key', { text: 'testing' }, {}],
      http500Error = new HttpError(500),
      moreMockedArgs = [ 'ERROR', 'another_test_key', {text: 'testing again' }, { webhook: webhookName }, http500Error ],
      noOptionsArgs = [ 'DEBUG', 'test_key', { text: 'testing' } ],
      errorAsOptionsArgs = [ 'DEBUG', 'test_key', { text: 'testing' }, http500Error ];

test('Can\'t trigger a default alert before a default webhook has been added', async() => {
	// Execute
	let resErr;
	try {
		const res = await CBAlerter.alert(...mockedArgs)

	} catch (err) {
		resErr = err;
	}

	// Test
	expect(resErr instanceof NotFoundError).toBe(true);
});

test('Can add a default webhook', async() => {
	// Execute
	const success = CBAlerter.addWebhook(builder);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via the default webhook', async() => {
	// Execute
	let resErr;
	const res = await CBAlerter.alert(...mockedArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(builder(...mockedArgs));
	expect(HttpRequest.post).toHaveBeenCalled();
});

test('Can\'t add a second default webhook', async() => {
	// Execute
	let resErr;
	try {
		const success = CBAlerter.addWebhook(anotherBuilder);

	} catch (err) {
		resErr = err;
	}

	// Test
	expect(resErr instanceof AlreadyExistsError).toBe(true);
});

test('Can add a named webhook', async() => {
	// Execute
	const success = CBAlerter.addWebhook(webhookName, anotherBuilder);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via a named webhook', async() => {
	// Execute
	let resErr;
	const res = await CBAlerter.alert(...moreMockedArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(anotherBuilder(...moreMockedArgs));
	expect(HttpRequest.post).toHaveBeenCalled();
});

test('Can\'t add a named webhook with an existing name', async() => {
	// Execute
	let resErr;
	try {
		const success = CBAlerter.addWebhook(webhookName, builder);

	} catch (err) {
		resErr = err;
	}

	// Test
	expect(resErr instanceof AlreadyExistsError).toBe(true);
});

test('Can send an alert with no options', async() => {
	// Execute
	let resErr;
	const res = await CBAlerter.alert(...noOptionsArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(builder(...[ ...noOptionsArgs, {} ]));
	expect(HttpRequest.post).toHaveBeenCalled();
});

test('Can send an alert with error as options arg', async() => {
	// Setup
	const expectedArgs = errorAsOptionsArgs;
	expectedArgs.pop(); // Remove http500Error
	expectedArgs.push({}); // Add the default options arg that CBAlerter will create
	expectedArgs.push(http500Error); // Add back http500Error

	// Execute
	let resErr;
	const res = await CBAlerter.alert(...errorAsOptionsArgs)
		.catch((err) => { resErr = err; });

	// Test
	expect(resErr).toBe(undefined);
	expect(HttpRequest.build).toHaveBeenCalledWith(builder(...expectedArgs));
	expect(HttpRequest.post).toHaveBeenCalled();
});
