try {
  const monitorYt = (function () {
    const settingsButton = document.querySelector(".ytp-settings-button");
    const video = document.querySelector("video");
  
    let showYtSubtitles = false;
    chrome.storage.sync.get(["ytSubs"], function(result) {
      if (JSON.parse(result["ytSubs"])) {
        showYtSubtitles = true;
      }
    });
    let timingCensorOn = false;
    chrome.storage.sync.get(["smartCensor"], function(result) {
      if (JSON.parse(result["smartCensor"])) {
        timingCensorOn = true;
      }
    });
  
    const clearAllChildren = (parent) => {
      try {
        while (parent.hasChildNodes())
          parent.removeChild(parent.firstChild)
      } catch (e) {}
    };
  
    const vowels = ["a", "e", "i", "o", "u", "y"];
  
    const numSyllablesInWord = (word, ignoreEndingPunct=false) => {
      /* 
      
      */
      let consonantClustersCounter = 0;
      let lastLetter;
      let lastLetterIsVowel;
    
      if (word === "") return 0;
      if (word === "ok") return 2;
      if (word.includes("hhh") || word.includes("aaa")) return 5;
    
     // if (!ignoreEndingPunct) {
        if (word.replace(/[^a-z\s]+/g, "") !== word) {
          if (word.endsWith("...")) {
            consonantClustersCounter += 3;
          }
          else if (word.endsWith(".") || word.endsWith("?")) {
            consonantClustersCounter += 2;
          }
          else if (word.endsWith("!") || word.endsWith(",") || word.endsWith("-")) {
            consonantClustersCounter += 1;
          }
          word = word.replace(/[^a-z\s]+/g, "");
        }
     // }
    
      const doubleVowelSplitsPossibilities = [
        "ia",
        "oi"
      ];
    
      word.split("").forEach((l, indx) => {
        try {
          if (indx === 0) {
            lastLetterIsVowel = vowels.includes(l);
            consonantClustersCounter++;
          } else {
            if (vowels.includes(l) !== lastLetterIsVowel) {
              lastLetterIsVowel = vowels.includes(l);
              if (!vowels.includes(l)) consonantClustersCounter++;
            }
            // Account for double vowels that split: () ia, oi (doing), // NOT: ie (friend),  
            else if (vowels.includes(l)) {
              if (doubleVowelSplitsPossibilities.includes(lastLetter + l)) {
                consonantClustersCounter++;
              }
            }
          }
          lastLetter = l;
        } catch (e) {
        }
      });
    
      // Distribute syllable worth
      if (word.endsWith("ed")) consonantClustersCounter--;
      if (consonantClustersCounter === 0) return 1;
      if (!lastLetterIsVowel) return consonantClustersCounter - 1;
      else {
        if (word[word.length - 1] === "e") {
          if ((word[word.length - 2] in vowels) || word[word.length - 2] === "l") {
            return consonantClustersCounter;
          } else {
            return consonantClustersCounter - 1 === 0 ? 1 : consonantClustersCounter - 1;
          }
        } else {
          return consonantClustersCounter;
        }
      }
    };
    
    const timesOfTargetInSentence = (sentence, bleepSymbol) => {
      sentence = sentence.toLowerCase().replace(/-|–|—/g, "");
      let totalSyllables = 0;
      let syllableTimingOfTargets = [];
    
      sentence.split(" ").forEach((word, indx, array) => {
        if (word.includes(bleepSymbol)) {
          syllableTimingOfTargets.push(totalSyllables*0.16) // On average a person speaks 4 to 5 syllables a second.
        }
        let result = numSyllablesInWord(word);
        totalSyllables += result;
      });
    
      return [syllableTimingOfTargets, totalSyllables * 0.16];
    };
   
    let hasEnglishCaptions = false;
    let sentenceCaptions = false;
    let adShowing = false;
    let firstAdShown = false;
    let singleThreshold = false;
  
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
                // adMO.disconnect();
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
    
    setTimeout(() => {
      adMOSetUp()
    }, 0);
  
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
        menuItems.forEach((menuItem) => {
          let itemLabelText = menuItem.childNodes.item(1).textContent;
          if (itemLabelText != "Annotations" && itemLabelText != "Playback speed" && itemLabelText != "Quality") 
            // Found subtitles option
            menuItem.click();
            // wait until the screen has updated with the available subtitles: wait time 0.7 seconds
        });
      },
      
      // Step 3: Wait until the screen has updated with the available subtitles before selecting
      function() {
        if (adShowing) return;
        let captionsAvailable = document.getElementsByClassName("ytp-panel-menu")[0].childNodes;
        let englishAlt;
        captionsAvailable.forEach((caption) => {
          if (caption.firstChild.innerText.includes("English (auto-generated)")) {
            // Select auto generated
            caption.click();
            hasEnglishCaptions = true;
            settingsButton.click();
            let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
            if (!showYtSubtitles)
              currentCaptionWindow.style = "display: none !important;";
          }
          else if (caption.firstChild.innerText.includes("English")) {
            englishAlt = caption;
          }
        });
        if (!hasEnglishCaptions && englishAlt) {
          sentenceCaptions = true;
          englishAlt.click();
          hasEnglishCaptions = true;
          settingsButton.click();
          let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
          if (!showYtSubtitles)
            currentCaptionWindow.style = "display: none !important;";
        }
      },
      function () {
        if (adShowing) return;
        if (!hasEnglishCaptions)
          alert("Censoring unavailable for this video.");
        else {
          // Step 3: Begin observing the caption screen for mutations (added text nodes).
          // Must be a specific snapshot of the caption screen (not its constant static reference).
          let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
          try {
            if (!showYtSubtitles && !timingCensorOn)
              currentCaptionWindow.style = "display: none !important;";
          } catch (error) {}
          // Use this function to clear amy subtitles that may have already been said to start afresh.
          clearAllChildren(currentCaptionWindow);
          
          // Begin observing
          try {
            captionPresenceObserver.observe(currentCaptionWindow, {childList: true});
          } catch (e) {}
        }
      }
    ];
  
    const setUpSubtitles = () => {
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
              comparePercentage > 3.5 ? subtitleOffsetFactor = 1 : subtitleOffsetFactor = (subtitleOffsetFactor * 5 + comparePercentage) / 6;
             // // console.log("This percentage", comparePercentage, "Average", subtitleOffsetFactor);
            }
          }
    
          if (currentFixedText.length) {
            singleRegister = false;
            startTime = currentMilliseconds();
          }
          
         // // console.log(currentFixedText) // useful! (fixedSubtitles)
          projectedTimeInMilliSeconds = timingCensor(currentFixedText, video);
        } else {
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
        }
        return;
      }
      if (mutations[0].addedNodes.length === 0) return;
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
      if (timingCensorOn) {
        let [timings, projectedTimeInSeconds] = timesOfTargetInSentence(sentence, "████");
        timings.forEach((time) => {
          // console.log(time * subtitleOffsetFactor);
          setTimeout(() => {
            vid.muted = true;
            unMute(vid, false, true)
          }, time * 1000 * subtitleOffsetFactor);
        });
        return projectedTimeInSeconds * 1000; // Return to report the projected time of the sentence
      }
    };
  
  
    let mutedTime;
    // Mute by time first, then if the next word has not been said yet, wait until that word
    const censorWord = (textNode, vid, extraTime=false) => {
      if (textNode.includes("████")) {
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
  });  
  
  
  chrome.storage.sync.get(["foobaz"], function(result) {
    if (result.foobaz) {
      monitorYt();
    }
  });
  
} catch (e) {}

