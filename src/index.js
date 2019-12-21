require('dotenv').config()
const {AWSTranslateJSON} = require('aws-translate-json')
const jsonfile = require('jsonfile')

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
  // PSR-3 logging levels (https://www.php-fig.org/psr/psr-3/)
  psr3: {
    emergency: 'emergency',
    alert: 'alert',
    critical: 'critical',
    error: 'error',
    warning: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug'
  }
}).then( (trans) => {
  console.log(trans)
  return jsonfile.writeFile('./dist/trans.json', trans)
}).then(res => {
  console.log('Write complete')
}).catch(error => console.error(error))
