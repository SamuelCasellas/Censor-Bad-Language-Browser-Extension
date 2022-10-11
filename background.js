
importScripts("ExtPay.js");
const extpay = ExtPay("censor-bad-words-on-netflix");
extpay.startBackground();

const millisecondsInOneDay = 86400000;

const bo = () => {
  chrome.storage.sync.set({foobaz: true});
};

extpay.getUser().then(user => {
  if (user.paid) {
    bo();
  } else {
    if (!user.trialStartedAt) {
      extpay.openTrialPage("7-day (IMPORTANT: After starting trial, please be sure to refresh the extension on the extensions page in your browser.)");
    }
    else if (new Date().getTime() - user.trialStartedAt.getTime() > millisecondsInOneDay * 7) {
      chrome.storage.sync.set({foobaz: false});
      extpay.openPaymentPage().catch((rej) => {
      });
    } else {
      bo();
    }
  }
}).catch((rej) => {
}); 

extpay.onPaid.addListener(user => {
  bo();
});

extpay.onTrialStarted.addListener(user => {
  bo();
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