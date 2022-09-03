'use strict';

// Step 1: Wait for the video to load to toggle the subtitles.
const setup = () => {
  // console.log("initializing...");
  const loadedStyleTags = document.getElementsByTagName("style");
  let loaded = false;
  for (let i = 0; i < loadedStyleTags.length; i++) {
    if (loadedStyleTags[i].getAttribute("data-emotion") === "ltr") {
      loaded = true;
    }
  }
  if (loaded) {
    // console.log("Already configured!");
    setTimeout(() => {
      configureSubtitleMO();
    }, 3000);
  } else {
    // console.log("No config, setting up...");
    const headMO = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // Find the specific style tag that loads when the video starts.
          // console.log(mutation.addedNodes[0]);
          if (mutation.addedNodes[0].getAttribute("data-emotion") !== null) {
            // console.log("Video loaded");
            headMO.disconnect();
            turnOnEnglishSubtitles();
          }     
        }
      });
    });
    headMO.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
};

if (location.href.includes("/watch/"))
  setup();

// Check URL status
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  // console.log("loopin..");
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes("/watch/"))
      setup();
  }
}).observe(document, {subtree: true, childList: true});

const turnOnEnglishSubtitles = () => {
  setTimeout(() => {
    const subtitleButton = document.getElementsByClassName(" ltr-14ph5iy")[8];
    subtitleButton.click();
    setTimeout(() => {
      const subtitles = document.getElementsByClassName("ltr-1dudwk2")[1].children[1]; // 0 === audio, 1 === subtitles // THIS CHANGES??
      subtitles.childNodes.forEach((lang) => {
        if (lang.getAttribute('data-uia').includes("English")) {
          lang.click();
          const video = document.getElementsByTagName("video")[0];
          // To close the subtitles
          video.click();
          configureSubtitleMO();
        }
      });
    }, 300);
  }, 100);
};

const configureSubtitleMO = () => {
  const subtitleContainer = document.getElementsByClassName("player-timedtext")[0];
  // console.log(subtitleContainer);
  const video = document.getElementsByTagName("video")[0];
  // Set up Mutation Observer for subtitles
  new MutationObserver((mutations) => {
    if (mutations.length === 1) {
      let currentSubtitleState = mutations[0].addedNodes;
      if (currentSubtitleState.length) {
        if (currentSubtitleState[0].innerText.includes("████")) {
          video.muted = true;
        }
        else {
          subtitleContainer.removeChild(subtitleContainer.firstChild)
        }
      } else {
        video.muted = false;
      }
    }
  }).observe(subtitleContainer, {childList: true});
};