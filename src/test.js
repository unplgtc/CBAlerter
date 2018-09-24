const CBAlerter = require('./CBAlerter');

CBAlerter.addWebhook('https://hooks.slack.com/services/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');

console.log(CBAlerter.alert({
	text: 'Testing'
}));
