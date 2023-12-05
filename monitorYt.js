'use strict';
let video, settingsButton;
const censorBlock = "████";
const displayOff = 'display: none !important;';
const displayOn = '';

let showYtSubtitles = false;
let timingCensorOn = false;

getChromeAttr("ytSubs")
  .then(val => showYtSubtitles = val)
  .catch(err => console.error(err));

getChromeAttr("smartCensor")
  .then(val => timingCensorOn = val)
  .catch(err => console.error(err));

const clearAllChildren = (parent) => {
  try {
    while (parent.hasChildNodes())
      parent.removeChild(parent.firstChild)
  } catch (e) {}
};


const settingsButtonQS = '.ytp-settings-button';
const settingsMenuClass = 'ytp-settings-menu';
const captionWindowClass = 'ytp-panel-menu';
const youtubeCaptionsQS = '.ytp-caption-window-container';

let sentenceCaptions = false;
let adShowing = false;
let firstAdShown = false;
let singleThreshold = false;

// Entry-point
const adMOSetUp = async() => {
  new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        let adContainerClassList = mutation.target.classList;
        if (!(adContainerClassList.contains("ad-playing")
        || adContainerClassList.contains("ad-showing")
        || singleThreshold)) {
          singleThreshold = true;
          firstAdShown = true;
          adShowing = false;
          setUpSubtitles();
        }
        else if (adContainerClassList.contains("ad-playing")
        || adContainerClassList.contains("ad-showing")) {
          singleThreshold = false;
          adShowing = true;
        }
    });
  }).observe(await selectElementPersist(".html5-video-player", 'qS'), {attributes: true});
};

// First load
if (location.href.includes("youtube.com/watch?")) {
  selectElementPersist(settingsButtonQS).then(button => settingsButton = button);
  selectElementPersist('video').then(vid => video = vid);
  adMOSetUp();
}

// 1
async function openSubtitles() {
  console.assert(settingsButton);
  settingsButton.click();
  let settingsMenu = await selectElementPersist(settingsMenuClass, 'byClass');
  settingsMenu.setAttribute("style", displayOff);
  const menuItems = Array.from(settingsMenu.childNodes[0].childNodes[0].childNodes);
  const subtitleButton = menuItems.find(item => item.childNodes.item(1).textContent.includes('Subtitles'));
  if (!subtitleButton) {
    // Close
    settingsMenu.style = displayOn;
    settingsButton.click();
    return false;
  }
  subtitleButton.click();
  return true;
}

// 2
async function selectSubtitle() {
  // English captions provided by video creator are generally preferred
  const settingsMenu = document.body.getElementsByClassName("ytp-settings-menu")[0];
  await thisNumSeconds(0.7);
  let captionsAvailable = Array.from(document.getElementsByClassName("ytp-panel-menu")[1].childNodes)

  const regex = /^(?=.*English)(?!.*\(auto-generated\)).*$/i;

  let englishCaption = captionsAvailable.find(c => regex.test(c.firstChild.innerText));
  if (!englishCaption) {
    englishCaption = captionsAvailable.find(c => c.firstChild.innerText.includes('English (auto-generated)'));
    if (!englishCaption) {
      // Close
      settingsMenu.style = displayOn;
      settingsButton.click();
      return false;
    }
  } else {
    sentenceCaptions = true;
  }
  // Turn on selected caption
  englishCaption.click();
  // Close
  settingsMenu.style = displayOn;
  settingsButton.click();
  
  return true;
}

// 3
async function beginObservingCaptions() {  
  // Step 3: Begin observing the caption screen for mutations (added text nodes).
  // Must be a specific snapshot of the caption screen (not its constant static reference).
  let currentCaptionWindow = await selectElementPersist(youtubeCaptionsQS);
  if (!showYtSubtitles && currentCaptionWindow) {
    currentCaptionWindow.style = displayOff;
  }

  if (!(showYtSubtitles || timingCensorOn)) {
    currentCaptionWindow.style = displayOff;
  }

  // Use this function to clear any subtitles that may have already been said to start afresh.
  // TODO: Maybe use this as a censor since the operation should be quicker with these new updates?
  clearAllChildren(currentCaptionWindow);
  
  captionPresenceObserver.observe(currentCaptionWindow, {childList: true});
}

async function setUpSubtitles() {
  if (await openSubtitles()) {
    if (await selectSubtitle()) {
      beginObservingCaptions();
    } else {
      alert("Censoring unavailable for this video. (Failure 2)");
    }
  } else {
    alert("Censoring unavailable for this video. (Failure 1)");
  }
};

// Subsequent videos
let currentURL = location.href;
// URL MO must always be kept on.
new MutationObserver(() => {
  if (currentURL === location.href) return;
  currentURL = location.href;
  if (location.href.includes("youtube.com/watch")) {
    selectElementPersist(settingsButtonQS).then(button => settingsButton = button);
    selectElementPersist('video').then(vid => video = vid);
    adShowing = firstAdShown = singleThreshold = sentenceCaptions = false;
    adMOSetUp();
  }
}).observe(document.head, {childList: true, subtree: true});

////// OBSERVATIONS ///////

let projectedTimeInMilliSeconds;
let startTime;
let endTime;
let subtitleOffsetFactor = 1;

const currentMilliseconds = () => new Date().getTime();

let currentFixedText;
let singleRegister = false;
// Does not start observing until 2.5 second after a new video has reloaded.
const captionPresenceObserver = new MutationObserver((mutations) => {
  if (sentenceCaptions) {
    currentFixedText = mutations[0].target.innerText;
    if (timingCensorOn) {

      // Standard deviation???
      endTime = currentMilliseconds();
      
      if (!singleRegister) {
        singleRegister = true;

        if (startTime) {
          let comparePercentage = (endTime-startTime) / projectedTimeInMilliSeconds;
          // If paused or exaggerated
          (comparePercentage > 3.5)
          ? subtitleOffsetFactor = 1 
          : subtitleOffsetFactor = (subtitleOffsetFactor * 5 + comparePercentage) / 6;
          // // console.log("This percentage", comparePercentage, "Average", subtitleOffsetFactor);
        }
      }

      if (currentFixedText.length) {
        singleRegister = false;
        startTime = currentMilliseconds();
      }
      
      // // console.log(currentFixedText) // useful! (fixedSubtitles)
      projectedTimeInMilliSeconds = timingCensor(currentFixedText, video);
      return;
    }  // return;

    // ELSE: Mute whole sentenceCaptions //
    if (currentFixedText.length) {
      if (currentFixedText.includes(censorBlock)) {
        video.muted = true;
        mutations[0].target.style = "display: block !important;"
      } else {
        video.muted = false;
        if (!showYtSubtitles) mutations[0].target.style = "display: none !important;";
      } 
    } else {
      video.muted = false;
      if (!showYtSubtitles) mutations[0].target.style = "display: none !important;"
    }
    return;
  } // return;

  // ELSE: Auto-generated captions //
  // The caption window has no captions-text (nodes length is 0)
  if (!mutations[0].addedNodes.length) return;
  
  // The caption window has captions-text again (nodes length is 1)
  let captionsText = mutations[0].addedNodes[0].childNodes[0]

  // // console.log(captionsText);

  // watch the initial captionVisualLine
  let captionVisualLine = captionsText.childNodes.item(0);
  if (!showYtSubtitles)
    captionVisualLine.parentElement.style = "display: none !important;";
  // The initial word will not be watched in the observer; account for it.
//  // console.log(captionVisualLine.innerText.toString()); // useful!
  censorWord(captionVisualLine.innerText.toString(), video);
  observeNewCaptionVisualLine(captionVisualLine);
  
  // watch for any added captionVisualLines
  // try {
    newCaptionLineObserver.observe(captionsText, {childList: true});
  // } catch (e) {}
});

const newCaptionLineObserver = new MutationObserver((mutations) => {
  if (mutations.length === 1) {
    let addedCaptionLine = mutations[0].addedNodes.item(0);
    if (!showYtSubtitles)
      addedCaptionLine.parentElement.style = "display: none !important;";
    // The initial word will not be watched in the observer; account for it.
    // console.log(addedCaptionLine.innerText); // useful!
    censorWord(addedCaptionLine.innerText, video, true);
    observeNewCaptionVisualLine(addedCaptionLine);
  }
  else if (mutations.length != 0) {
    // The last mutation is the most recent captionVisualLine
    mutations[mutations.length-1].addedNodes.forEach(observeNewCaptionVisualLine);
  }
});

    const observeNewCaptionVisualLine = (visualLine) => {
      /* Helper function used in captionPresenceObserver for initial caption lines
      as well as for any additional lines (see newCaptionLineObserver)
      */
      // visualLine elements only will ever have one child: ytp-caption-segment
      let captionSegment = visualLine.firstChild; 
      // try {
        individualLineCaptionObserver.observe(captionSegment, {
          childList: true, // Observe for individual word insertions
          subtree: true
        });
      // } catch (e) {}
    };

const individualLineCaptionObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
    // console.log(node.textContent); // useful!
    if (censorWord(node.textContent, video) === true) {
      node.textContent = node.textContent.replace("god", censorBlock);
    }
  }));
});

const timingCensor = (sentence, vid) => {
  // timesOfTargetInSentence: available in the global setting 
  // defined in manifest file!
  let [timings, projectedTimeInSeconds] = timesOfTargetInSentence(sentence, censorBlock);
  timings.forEach((time) => {
    // console.log(time * subtitleOffsetFactor);
    setTimeout(() => {
      vid.muted = true;
      unMute(vid, false, true)
    }, time * 1000 * subtitleOffsetFactor);
  });
  return projectedTimeInSeconds * 1000; // Return to report the projected time of the sentence
};


let mutedTime;
// for censoring "Oh my _____" in word-by-word captions
let wordQueue = new Queue(2);
// Mute by time first, then if the next word has not been said yet, wait until that word
const censorWord = (textNode, vid, extraTime=false) => {
  wordQueue.enqueue(textNode.trim().toLowerCase());
  if (textNode.includes(censorBlock)) {
    vid.muted = true;
    mutedTime = currentMilliseconds();
  } 
  else if (wordQueue.hasInOrder(/oh|my/gi, "god")) {
    vid.muted = true;
    mutedTime = currentMilliseconds();
    return true;
  } else {
    currentMilliseconds() - mutedTime < 650
    ? setTimeout(() => vid.muted = false, 650 - (currentMilliseconds() - mutedTime))
    : vid.muted = false;
  }
};

let mutedStack = [];
// Having a callback here allows for repeated unmutes
const unMute = (vid, extraTime=false, fixedSubtitles=false) => {
  mutedStack.push(true);
  let unmuteTiming;
  extraTime ? unmuteTiming = 1400 : unmuteTiming = 500;
  if (fixedSubtitles) {
    unmuteTiming * subtitleOffsetFactor;
  }
  setTimeout(() => {
    mutedStack.pop(true);
    if (!mutedStack.length)
      vid.muted = false;
  }, unmuteTiming);
};
