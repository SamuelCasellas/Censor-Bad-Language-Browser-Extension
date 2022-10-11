const allCurseRadioButton = document.getElementById("all");
const someCurseRadioButton = document.getElementById("some");
const religiousCensorButton = document.getElementById("religious");
const racialCensorButton = document.getElementById("racial");
const sexualCensorButton = document.getElementById("sexual");
const ytSubtitlesButton = document.getElementById("yt-sub");
const netflixSubtitlesButton = document.getElementById("netflix-sub");
const smartCensorButton = document.getElementById("smart-censor");

const statusMessage = document.getElementById("status-message");

const keysButtonPair = {
  "allCurses": allCurseRadioButton,
  "someCurses": someCurseRadioButton,
  "religious": religiousCensorButton,
  "racial": racialCensorButton,
  "sexual": sexualCensorButton,
  "netflixSubs": netflixSubtitlesButton,
  "ytSubs": ytSubtitlesButton,
  "smartCensor": smartCensorButton
};

// Applying previous settings

const configureSavedSettings = (key, button) => {
  chrome.storage.sync.get([key], function(result) {
   // console.log(result)
    if (result[key] != null)
      result[key] ? button.click() : null;
  });
};

const time = () => new Date().getTime();
let lastClick;
const openedAt = time();

const showNewSettingNotif = () => {
  if (time() - openedAt < 100) return;

  lastClick = time();
  statusMessage.style = "color: green; margin-bottom: -14px; display: block;";
  setTimeout(() => {
    if (time() - lastClick > 5000) statusMessage.style="display: none;"
  }, 5000);
};

// Event Listeners for new settings

const createEventListenerRadio = (button) => {
  let allCursesSetting, someCursesSetting;
  button.id === "all" 
  ? (allCursesSetting = true, someCursesSetting = false) 
  : (allCursesSetting = false, someCursesSetting = true);
  button.addEventListener("click", () => {
    chrome.storage.sync.set({someCurses: someCursesSetting});
    chrome.storage.sync.set({allCurses: allCursesSetting});
    showNewSettingNotif();
  });
};

const createEventListenerCheck = (button, key) => {
  button.addEventListener("click", () => {
    let currentSetting = JSON.parse(button.ariaChecked);
    button.ariaChecked = !currentSetting;
    chrome.storage.sync.set({[key]: !(currentSetting)});
    showNewSettingNotif();
  });
};

for (let key in keysButtonPair) {
  let button = keysButtonPair[key];
  configureSavedSettings(key, keysButtonPair[key]);
  button.type === "radio" ? createEventListenerRadio(button) : createEventListenerCheck(button, key);
}
