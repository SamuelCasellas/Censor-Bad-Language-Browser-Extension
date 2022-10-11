
try {
  const monitorNetflix = (function () {
    'use strict';
  
    const vowels = ["a", "e", "i", "o", "u", "y"];
    const numSyllablesInWord = (word, ignoreEndingPunct=false) => {
      /* 
      
      */
      let consonantClustersCounter = 0;
      let lastLetter;
      let lastLetterIsVowel;
    
      if (word === "") return 0;
      if (word.startsWith("[") && word.endsWith("]")) return 0;
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
      // syllableTimingOfTargets.forEach((pos) => {
      //   console.log("Target word", bleepSymbol, "is said after", pos*0.2, "seconds in a sentence that is", totalSyllables*0.2);
      // })
    };
  
    const videoButtonsClass = " ltr-14ph5iy";
    const subtitleDivsClass = "ltr-1dudwk2";
    const videoContatinerClass = "watch-video--player-view";
  
    let setUpOnce = false;
    let videoClicked = false;
  
    let showNfSubtitles = false;
    chrome.storage.sync.get(["netflixSubs"], function(result) {
      if (JSON.parse(result["netflixSubs"])) {
        showNfSubtitles = true;
      }
    });
    
    let timingCensorOn = false;
    chrome.storage.sync.get(["smartCensor"], function(result) {
      if (JSON.parse(result["smartCensor"])) {
        timingCensorOn = true;
      }
    });
  
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
        mutedStack.pop(true);
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
  
      let singleRegister = false;
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
    
          singleRegister = true;
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
  });  
  
  chrome.storage.sync.get(["foobaz"], function(result) {
    if (result.foobaz) {
      monitorNetflix();
    }
  });
  
} catch (e) {}