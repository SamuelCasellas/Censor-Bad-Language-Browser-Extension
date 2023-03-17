'use strict';

const videoButtonsClass = " ltr-14ph5iy";
const subtitleDivsClass = "ltr-1dudwk2";
const videoContatinerClass = "watch-video--player-view";

let setUpOnce = false;
let videoClicked = false;

let showNfSubtitles = false;
let timingCensorOn = false;
let muteOn = true;

// Async functions whose values can be grabbed later
getChromeAttr("netflixSubs")
  .then(val => showNfSubtitles = val)
  .catch(err => console.error(err));

getChromeAttr("smartCensor")
  .then(val => timingCensorOn = val)
  .catch(err => console.error(err));

getChromeAttr("netflixMute")
  .then(val => muteOn = val)
  .catch(err => console.error(err));

// Step 1: Wait for the video to load before toggling the subtitles.
const newMovieLoading = () => {
  if (document.getElementsByClassName("watch-video")[0].firstElementChild.className === videoContatinerClass) {
    // console.log("Video is already loaded.");
    turnOnEnglishSubtitles();
  } else {
    // console.log("initializing...");
    var BreakException = {};
    const videoSetupMO = new MutationObserver((mutations) => {
      try {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
              if (node.getAttribute("class") === videoContatinerClass && !setUpOnce) {
                setUpOnce = true;
                // console.log("Loaded");
                throw BreakException;
              }
          });
        });
      } catch (e) {
        if (e === BreakException) {
          videoSetupMO.disconnect();
          turnOnEnglishSubtitles();
        }
      }
    });
    videoSetupMO.observe(document.body, 
      {
        childList: true, 
        subtree: true
      }
    );
  }
};

const newURLHandler = () => {
  setTimeout(() => {
    if (!muteOn) return;
    newMovieLoading();
  }, 1300);
};

// First time load
if (location.href.includes("netflix.com/watch/")) {
  newURLHandler();
}

// Check URL status
let currentURL = location.href;
// URL MO must always be kept on.
new MutationObserver(() => {
  if (currentURL === location.href) return;

  currentURL = location.href;
  if (!location.href.includes("netflix.com/watch/")) return;

  setUpOnce = false;
  videoClicked = false;
  newURLHandler();
}).observe(document, {childList: true, subtree: true});


// Step 2: Automatically turn on English subtitles.
const turnOnEnglishSubtitles = () => {
  setTimeout(() => {
    let subtitleButton;
    const videoButtons = document.getElementsByClassName(videoButtonsClass);
    // if (!videoButtons) {
    //   console.log("Video buttons not obtained.");
    // }
    // Watching the last episode means that there is no "next episode" button,
    // where the index is 7. Otherwise, it's 8.
    for (let i = videoButtons.length - 1; i > 0; i--) {
      if (videoButtons[i].ariaLabel === "Audio & Subtitles") {
        subtitleButton = videoButtons[i];
        break;
      }
    }
    try {
      subtitleButton.click();
      const subtitlesContainer = document.getElementsByClassName(subtitleDivsClass)[1]; // 0 === audio, 1 === subtitles // THIS CHANGES??
      // Tacky to show the automation of selecting subtitles.
      subtitlesContainer.parentElement.parentElement.parentElement.style = "display: none;"
      // Add small delay as subtitles opening is not instantaneous.
      setTimeout(() => {
        const subtitles = subtitlesContainer.children[1];
        subtitles.childNodes.forEach((lang) => {
          let langData = lang.getAttribute('data-uia');
          // To avoid error if refreshing while watching movie.
          if (langData) {
            if (langData.includes("English") && !videoClicked) {
              lang.click();
              videoClicked = true;
              const video = document.getElementsByTagName("video")[0];
              // Close subtitles
              video.click();
              configureSubtitleMO();
            }
          }
        });
      }, 300);
    } catch {
      configureSubtitleMO();
    }
  }, 100);
};

const timingCensor = (sentence, vid) => {
  let [timings, projectedTimeInSeconds] = timesOfTargetInSentence(sentence, "████");
  timings.forEach((time) => {
    setTimeout(() => {
      vid.muted = true;
      unMute(vid)
    }, (time * 1000 * subtitleOffsetFactor));
  });
  return projectedTimeInSeconds * 1000; // Return to report the projected time of the sentence
};

const unmuteTiming = 1000;
let mutedStack = [];
const unMute = (vid) => {
  mutedStack.push(true);
  unmuteTiming * subtitleOffsetFactor;
  setTimeout(() => {
    mutedStack.pop();
    if (!mutedStack.length)
      vid.muted = false;
  }, unmuteTiming);
};

// Step 3: Watch Subtitles.
let projectedTimeInMilliSeconds;
let startTime;
let endTime;
let subtitleOffsetFactor = 1;

let censoredWholeLine = false;
const configureSubtitleMO = () => {
  const subtitleContainer = document.getElementsByClassName("player-timedtext")[0];
  // if (!subtitleContainer) {
  //   console.log("Subtitles not obtained");
  // }
  const video = document.getElementsByTagName("video")[0];
  // if (!video) {
  //   console.log("Video not obtained");
  // }
  // Set up Mutation Observer for subtitles

  const currentMilliseconds = () => new Date().getTime();

  let currentSubtitleState = null;
  let lastSubtitleState = "SampleText";
  // Does not start observing until 2.5 second after a new video has reloaded.
  // captionPresenceObserver
  new MutationObserver((mutations) => {
    if (mutations.length !== 1) return;
    try {
      currentSubtitleState = mutations[0].addedNodes.item(0).innerText;
      if (!showNfSubtitles) {
        if ((!timingCensorOn && !currentSubtitleState.includes("████")) || timingCensorOn)
          subtitleContainer.removeChild(subtitleContainer.firstChild);
      }
    } catch (e) {}
    // Standard deviation???
    
    if (currentSubtitleState === lastSubtitleState && timingCensorOn) return;

    // update the lastState.
    if (timingCensorOn) {
      lastSubtitleState = currentSubtitleState;

      if (startTime) {
        endTime = currentMilliseconds();
        let comparePercentage = (endTime-startTime) / projectedTimeInMilliSeconds;
        // If paused or exaggerated
        comparePercentage > 3.5 || comparePercentage < 0.65
        ? subtitleOffsetFactor = 1 
        : subtitleOffsetFactor = (subtitleOffsetFactor * 4 + comparePercentage) / 5;
      }

      if (currentSubtitleState) {
        startTime = currentMilliseconds();
        projectedTimeInMilliSeconds = timingCensor(currentSubtitleState, video);
      }
    } else {
      try {
        if (currentSubtitleState !== lastSubtitleState) {
          lastSubtitleState = currentSubtitleState;
          censoredWholeLine = false;
        }
        if (currentSubtitleState.includes("████")) {
          if (!censoredWholeLine) {
            censoredWholeLine = true;
            video.muted = true;
          } else {
            lastSubtitleState = currentSubtitleState;
            censoredWholeLine = false;
            video.muted = false;
          }
        } else {
          video.muted = false;
        }
      } catch (e) {
        video.muted = false;
      }
    }
    // console.log(currentSubtitleState); // useful! (fixedSubtitles)
  }).observe(subtitleContainer, {childList: true});
};
