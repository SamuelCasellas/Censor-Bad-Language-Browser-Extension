const allCurseRadioButton = document.getElementById("all");
const someCurseRadioButton = document.getElementById("some");
const religiousCensorButton = document.getElementById("religious");
const racialCensorButton = document.getElementById("racial");
const sexualCensorButton = document.getElementById("sexual");
const ytSubtitlesButton = document.getElementById("yt-sub");
const netflixSubtitlesButton = document.getElementById("netflix-sub");
const netflixMuteButton = document.getElementById("netflix-mute");
const smartCensorButton = document.getElementById("smart-censor");

const statusMessage = document.getElementById("status-message");

// Note: These reusable functions were added here to 
// avoid the extra activateTab permission to make this
// popup script a recognized content script.
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/#programmatic

const setChromeAttr = (key, val) => {
  chrome.storage.sync.set({[key]: JSON.stringify(val)});
};

const getChromeAttr = (key, defaultVal=null) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] != null ? JSON.parse(result[key]) : defaultVal);
      }
    });
  });
};

const keysButtonPair = {
  "allCurses": allCurseRadioButton,
  "someCurses": someCurseRadioButton,
  "religious": religiousCensorButton,
  "racial": racialCensorButton,
  "sexual": sexualCensorButton,
  "netflixSubs": netflixSubtitlesButton,
  "ytSubs": ytSubtitlesButton,
  "netflixMute": netflixMuteButton,
  "smartCensor": smartCensorButton
};

const configureSavedSettings = (key, button) => {
  getChromeAttr(key, true).then(currentSetting => {
    if (currentSetting) button.click();
  });
};

const time = () => new Date().getTime();
let lastClickAt;
const openedAt = time();

const showNewSettingNotif = () => {
  if (time() - openedAt < 100) return;

  lastClickAt = time();
  statusMessage.style = "color: green; margin-bottom: -14px; display: block;";
  setTimeout(() => {
    if (time() - lastClickAt > 5000) statusMessage.style = "display: none;"
  }, 5000);
};

// Event Listeners for new settings

const addEventListenerRadio = (button) => {
  let allCursesSetting, someCursesSetting;
  button.id === "all" 
  ? (allCursesSetting = true, someCursesSetting = false) 
  : (allCursesSetting = false, someCursesSetting = true);
  // Radio buttons can only select "ON" when clicked
  button.addEventListener("click", () => {
    setChromeAttr("someCurses", someCursesSetting);
    setChromeAttr("allCurses", allCursesSetting);
    showNewSettingNotif();
  });
};

const addEventListenerCheck = (button, key) => {
  button.addEventListener("click", () => {
    const currentSetting = JSON.parse(button.ariaChecked);
    button.ariaChecked = !currentSetting;
    setChromeAttr(key, !currentSetting);
    showNewSettingNotif();
  });
};

for (let key in keysButtonPair) {
  const button = keysButtonPair[key];
  configureSavedSettings(key, button);
  // Adding event listeners
  button.type === "radio" 
  ? addEventListenerRadio(button) 
  : addEventListenerCheck(button, key);
}
