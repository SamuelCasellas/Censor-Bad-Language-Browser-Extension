// Step 1: Focus on the video so that the captions can be automatically set.

'use strict';

// let foundEnglish = false;

chrome.runtime.onMessage.addListener()

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
      /*
        div: ltr-1dudwk2
        ul: 9/2/22
        ltr-1j0s03q
      */      
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
    // console.log(mutations);
    // mutations.forEach((mutation) => {
    //   console.log("debugging subtitles: ", mutation.addedNodes[0].textContent);
    // });
  }).observe(subtitleContainer, {childList: true});
};


// Must open the settings button to access its menu options.
// setTimeout(settingsButton.click(), 200);

/*
3 steps:
1. Find the subtitle menu title and click the button
2. Find if the auto generate option is available and click that button. Press settings button to exit.
3. Successfully track the mutations for the ytp-caption-window-container class
*/

// const captionOperationHandler = [

//     // Step 1
//     function() {
//         let settings = document.body.getElementsByClassName("ytp-settings-menu");
//         // Not all videos have the same number of menu items when settings is selected.
//         // Survey each one.
//         let menuItems = settings[0].childNodes[0].childNodes[0].childNodes;
//         menuItems.forEach((menuItem) => {
//             let itemLabelText = menuItem.childNodes.item(1).textContent;
//             if (itemLabelText != "Annotations" && itemLabelText != "Playback speed" && itemLabelText != "Quality") 
//                 // Found subtitles option
//                 menuItem.click();
//                 // wait until the screen has updated with the available subtitles: wait time 0.7 seconds
//         });
//     },
    
//     // Step 2: wait until the screen has updated with the available subtitles
//     function() {
//         let captionsAvailable = document.getElementsByClassName("ytp-panel-menu")[0].childNodes;
//         captionsAvailable.forEach((caption) => {
//             if (caption.firstChild.innerText == "English (auto-generated)") {
//                 // Select auto generated
//                 caption.click();
//                 hasAutoGenerate = true;
//                 settingsButton.click();
//             }
//         });
//     }
// ]
// // carry out timely executions
// for (let i = 0; i < captionOperationHandler.length; i++) {
//     setTimeout(captionOperationHandler[i], (i + 1) * 450);
// }
            
// setTimeout(() => {
//     // Step 3: Begin observing the caption screen for mutations (added text nodes).
//     // Must be a specific snapshot of the caption screen (not its constant static reference).
//     let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
//     // Use this function to clear amy subtitles that may have already been said to start afresh.
//     clearCaptionWindow(currentCaptionWindow);
//     captionPresenceObserver.observe(currentCaptionWindow, {
//         childList: true
//     });
// }, 2500);

// function clearCaptionWindow(window) {
//     while (window.hasChildNodes())
//         window.removeChild(window.firstChild)
// }

// ////// OBSERVATIONS ///////

// const captionPresenceObserver = new MutationObserver((mutations) => {
//     if (mutations[0].addedNodes.length != 0) {
//         // The caption window has captions-text again (nodes length is 1)
//         var captionsText = mutations[0].addedNodes[0].childNodes[0]

//         // watch the initial captionVisualLine
//         var captionVisualLine = captionsText.childNodes.item(0);
//         // The initial word will not be watched in the observer; account for it.
//         censorWord(captionVisualLine.innerText.toString())
//         observeNewCaptionVisualLine(captionVisualLine)
        
//         // watch for any added captionVisualLines
//         newCaptionLineObserver.observe(captionsText, {
//             childList: true
//         });
//     }
// });

// const newCaptionLineObserver = new MutationObserver((mutations) => {
//     if (mutations.length === 1) {
//         var addedCaptionLine = mutations[0].addedNodes.item(0);
//         // The initial word will not be watched in the observer; account for it.
//         censorWord(addedCaptionLine.innerText)
//         observeNewCaptionVisualLine(addedCaptionLine);
//     }
//     else if (mutations.length != 0) {
//         // The last mutation is the most recent captionVisualLine
//         mutations[mutations.length-1].addedNodes.forEach(observeNewCaptionVisualLine);
//     }
// });

//             function observeNewCaptionVisualLine(visualLine) {
//                 /* Helper function used in captionPresenceObserver for initial caption lines
//                 as well as for any additional lines (see newCaptionLineObserver)
//                 */

//                 // visualLine elements only will ever have one child: ytp-caption-segment
//                 var captionSegment = visualLine.firstChild; 
//            //     censorWord(captionSegment.innerText)
//                 individualLineCaptionObserver.observe(captionSegment, {
//                     childList: true, // Observe for individual word insertions
//                     subtree: true
//                 });
//             }

// const individualLineCaptionObserver = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
//         censorWord(node.textContent)}
//     )); // May be the error
// });



// function unMute(theVideo) {
//     setTimeout(() => {
//         theVideo.muted = false;
//     }
//     , 600);
// }

