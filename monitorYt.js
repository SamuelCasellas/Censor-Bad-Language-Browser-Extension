'use strict';
let settingsButton, video;

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

let hasEnglishCaptions = false;
let sentenceCaptions = false;
let adShowing = false;
let firstAdShown = false;
let singleThreshold = false;

// Entry-point
const adMOSetUp = () => {
  try {
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
    }).observe(document.querySelector(".html5-video-player"), {attributes: true});
  } catch (e) {}
};

// First load
if (location.href.includes("youtube.com/watch?")) {
  settingsButton = document.querySelector(".ytp-settings-button");
  video = document.querySelector("video");
  adMOSetUp();
}

const captionOperationSteps = [
  // Step 1: Click the settings button to access its menu options.
  function() {
    setTimeout(() => {
      let adContainer = document.querySelector(".video-ads");
      try {   
        if (adContainer.hasChildNodes() && !firstAdShown) {
          adShowing = true;
        } else {
          settingsButton.click();
          let settings = document.body.getElementsByClassName("ytp-settings-menu")[0];
          settings.setAttribute("style", "display: none;");
        }
      } catch (e) {
        console.log(e);
        settingsButton.click();
        let settings = document.body.getElementsByClassName("ytp-settings-menu")[0];
        settings.setAttribute("style", "display: none;");
      }
    }, 200);
  },
  // Step 2: Click on the subtitles button to open the subtitles.
  function() {
    if (adShowing) return;
    let settings = document.body.getElementsByClassName("ytp-settings-menu")[0];
    settings.setAttribute("style", "display: none;");
    // Not all videos have the same number of menu items when settings is selected.
    // Survey each one.
    let menuItems = settings.childNodes[0].childNodes[0].childNodes;
    // Find subtitles option and click it.
    menuItems.forEach((menuItem) => {
      let itemLabelText = menuItem.childNodes.item(1).textContent;
      if (itemLabelText != "Annotations" && itemLabelText != "Playback speed" && itemLabelText != "Quality") 
        menuItem.click();
        // What is this for?
        // wait until the screen has updated with the available subtitles: wait time 0.7 seconds
    });
  },
  
  // Step 3: Wait until the screen has updated with the available subtitles before selecting
  function() {
    if (adShowing) return;
    const captionsAvailable = document.getElementsByClassName("ytp-panel-menu")[0].childNodes;

    // See if the video has English captions provided by creator. 
    // These are preferred.
    captionsAvailable.forEach((caption) => {
      if (caption.firstChild.innerText.includes("English") && 
      !caption.firstChild.innerText.includes("(auto-generated)")) {
        caption.click();
        hasEnglishCaptions = true;
        sentenceCaptions = true;
        settingsButton.click();
        let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
        if (!showYtSubtitles && currentCaptionWindow) 
          currentCaptionWindow.style = "display: none !important;";
      }
    });
    if (sentenceCaptions) return;
    // If not, see if the video has English captions provided by YouTube.
    captionsAvailable.forEach((caption) => {
      if (caption.firstChild.innerText.includes("English (auto-generated)")) {
        caption.click();
        hasEnglishCaptions = true;
        settingsButton.click();
        let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
        if (!showYtSubtitles) currentCaptionWindow.style = "display: none !important;";
      }
    });
  },
  // Step 4: Begin observing captions
  function() {
    if (!hasEnglishCaptions && !adShowing) alert("Censoring unavailable for this video.");
    if (adShowing || !hasEnglishCaptions) return;
    
    // Step 3: Begin observing the caption screen for mutations (added text nodes).
    // Must be a specific snapshot of the caption screen (not its constant static reference).
    let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
    try {
      if (!(showYtSubtitles || timingCensorOn))
        currentCaptionWindow.style = "display: none !important;";
    } catch (e) {}
    // Use this function to clear any subtitles that may have already been said to start afresh.
    clearAllChildren(currentCaptionWindow);
    
    // Begin observing
    try {
      captionPresenceObserver.observe(currentCaptionWindow, {childList: true});
    } catch (e) {}
  }
];

function setUpSubtitles() {
  // carry out timely executions
  for (let i = 0; i < captionOperationSteps.length; i++) {
    setTimeout(captionOperationSteps[i], (i) * 600);
  }
};

// Subsequent videos
let currentURL = location.href;
// URL MO must always be kept on.
new MutationObserver(() => {
  if (currentURL === location.href) return;
  currentURL = location.href;
  if (location.href.includes("youtube.com/watch")) {
    settingsButton = document.querySelector(".ytp-settings-button");
    video = document.querySelector("video");
    hasEnglishCaptions = adShowing = firstAdShown = singleThreshold = sentenceCaptions = false;
    adMOSetUp();
  }
}).observe(document, {childList: true, subtree: true});

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
      if (currentFixedText.includes("████")) {
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
  try {
    newCaptionLineObserver.observe(captionsText, {childList: true});
  } catch (e) {}
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
      try {
        individualLineCaptionObserver.observe(captionSegment, {
          childList: true, // Observe for individual word insertions
          subtree: true
        });
      } catch (e) {}
    };

const individualLineCaptionObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
    // console.log(node.textContent); // useful!
    censorWord(node.textContent, video)}
  ));
});

const timingCensor = (sentence, vid) => {
  // timesOfTargetInSentence: available in the global setting 
  // defined in manifest file!
  let [timings, projectedTimeInSeconds] = timesOfTargetInSentence(sentence, "████");
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
let wordQueue = new Queue;
// Mute by time first, then if the next word has not been said yet, wait until that word
const censorWord = (textNode, vid, extraTime=false) => {
  wordQueue.enqueue(textNode.trim());
  if (textNode.includes("████") || wordQueue.hasInOrder("oh", "my")) {
    vid.muted = true;
    mutedTime = currentMilliseconds();
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