/**
 * This is written to work with the locale js files generated by
 * bin/build-scripts/ftl-to-js.js. Those files place the content strings of ftl
 * files into window.l10nMessages.
 *
 * It waits a _max_ of about five seconds for the js files to be retrieved.
 */

const localePromises = {};

function getPromise(locale) {
  if (!localePromises[locale]) {
    localePromises[locale] = getPollingPromise(locale);
  }
  return localePromises[locale];
}

function getPollingPromise(locale) {
  return new Promise((resolve, reject) => {
    let wait = 5000; // maybe make configurable?
    let checkForMessages = () => {
      if (window && window.l10nMessages && window.l10nMessages[locale]) {
        let messages = {};
        messages[locale] = window.l10nMessages[locale];
        resolve(messages);
        return;
      }
      if (wait > 0) {
        wait -= 100;
        setTimeout(checkForMessages, 100);
        return;
      }
      reject(locale);
    };
    checkForMessages();
  });
}

function setLocaleMessages(locale, messages) {
  if (!localePromises[locale]) {
    const x = {};
    x[locale] = messages;
    localePromises[locale] = Promise.resolve(x);
  }
}

if (typeof window !== 'undefined' && !window.notifyL10nLoaded) {
  window.notifyL10nLoaded = setLocaleMessages;
}

exports.getLocaleMessages = function(locales) {
  return Promise.all(locales.map(getPromise));
};
