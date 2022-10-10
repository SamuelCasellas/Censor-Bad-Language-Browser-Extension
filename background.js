
importScripts("ExtPay.js");
const extpay = ExtPay("censor-bad-words-on-netflix");
extpay.startBackground();

const millisecondsInOneDay = 86400000;

const authenticateUser = () => {
  chrome.storage.sync.set({authenticated: true});
};

extpay.getUser().then(user => {
  if (user.paid) {
    authenticateUser();
  } else {
    if (!user.trialStartedAt) {
      extpay.openTrialPage("7-day (IMPORTANT: Updating censoring capabilities may take a minute. Please be sure to refresh any pages already open.)");
    }
    else if (new Date().getTime() - user.trialStartedAt.getTime() > millisecondsInOneDay * 7) {
      chrome.storage.sync.set({authenticated: false});
      extpay.openPaymentPage().catch((rej) => {
      });
    } else {
      authenticateUser();
    }
  }
}).catch((rej) => {
}); 

extpay.onPaid.addListener(user => {
  authenticateUser();
});

extpay.onTrialStarted.addListener(user => {
  authenticateUser();
});

chrome.storage.sync.get(["setup"], function(result) {
  if (!result["setup"]) {
    chrome.storage.sync.set({setup: true});
    chrome.storage.sync.set({allCurses: true});
    chrome.storage.sync.set({someCurses: false});
    chrome.storage.sync.set({religious: true});
    chrome.storage.sync.set({racial: true});
    chrome.storage.sync.set({sexual: true});
    chrome.storage.sync.set({netflixSubs: false});
    chrome.storage.sync.set({ytSubs: false});
    chrome.storage.sync.set({smartCensor: false});
  }
});