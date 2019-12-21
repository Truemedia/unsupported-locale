require('dotenv').config()
const {AWSTranslateJSON} = require('aws-translate-json')
// Data
const translatorLocales = require('./data/translator_locales')

const awsConfig = {
    accessKeyId: process.env.AWS_TRANSLATE_ID,
    secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
    region: process.env.AWS_TRANSLATE_REGION,
}
const sourceLocale = 'en';

const { translateJSON } = new AWSTranslateJSON(awsConfig, sourceLocale, translatorLocales);

translateJSON({
    key1: "my text here",
    key2: "other text",
    key3: {
        key4: "nested text"
    }
}).then(console.log);
