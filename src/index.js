require('dotenv').config()
const {AWSTranslateJSON} = require('aws-translate-json')
const jsonfile = require('jsonfile')
const vuei18nPo = require('vuei18n-po');

const translatorLocales = require('./data/translator_locales')

const awsConfig = {
    accessKeyId: process.env.AWS_TRANSLATE_ID,
    secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
    region: process.env.AWS_TRANSLATE_REGION,
}

const sourceLocale = 'en_GB';
// Msg ids to review
let msgids = []

vuei18nPo({ // Convert PO files to translation object
    po: [
      'src/translations/**/*.po' // PSR-3 logging levels (https://www.php-fig.org/psr/psr-3/)
    ],
    pluralRules: 'spec/data/out/choices.js',
    messagesFile: 'generated/allInOne.json',
    messagesDir: 'generated'
}).then( (trans) => { // Merge empty translations with
  let sourceTrans = trans[sourceLocale]
  let targetLocales = Object.keys(trans)
  targetLocales.splice(targetLocales.indexOf(sourceLocale), 1)

  Object.entries(trans).map( ([locale, data]) => {
    if (locale != sourceLocale) {
      let {messages} = data

      Object.entries(messages).map( ([msgid, msgstring]) => {
        if (msgstring.trim() == '') { // No translation availble
          msgids.push(msgid)
        }
      })
    }
  })

  return {msgids, targetLocales, sourceTrans}
}).then( ({msgids, targetLocales, sourceTrans}) => { // Extract and translate reviewable subset of translations
  if (msgids.length > 0) {
    let {messages} = sourceTrans
    let subset = msgids.reduce((a, e) => (a[e] = messages[e], a), {});

    console.log('test', supportedLocaleAlias(sourceLocale), targetLocales.map(locale => supportedLocaleAlias(locale)))
    let {translateJSON} = new AWSTranslateJSON(awsConfig, supportedLocaleAlias(sourceLocale), targetLocales.map(locale => supportedLocaleAlias(locale)));
    return translateJSON({ messages: subset })
  } else {
    throw new Error('No translations to review (all translations provided fulfilled)')
  }
}).then( (trans) => {
  return jsonfile.writeFile('./dist/trans.json', trans)
}).then(res => {
  console.log('Write complete')
}).catch(error => console.error(error))


// Get equivalent supported locale alias for API
function supportedLocaleAlias(locale) {
  let lang = locale.split('_')[0]
  let apiLocale = null

  if (translatorLocales.includes(locale)) {
    apiLocale = locale
  } else if (translatorLocales.includes(lang)) {
    apiLocale = lang
  }

  return apiLocale
}
