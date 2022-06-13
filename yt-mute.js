const settingsButton = document.querySelector(".ytp-settings-button");
const captionsDisplay = document.getElementsByClassName("ytp-caption-window-container")[0];
const muteButton = document.getElementsByClassName("ytp-mute-button")[0];
const video = document.querySelector("video");

let hasAutoGenerate = false;

setTimeout(() => {
    let captionButton = document.getElementsByClassName("ytp-subtitles-button")[0];
    if (captionButton.ariaPressed === true) {
        captionButton.click();
    }
}, 150)

// Overall premise: Captions must be secretly on to activate
// muting feature for each foul word presented as its being said.

// Must open the settings button to access its menu options.
setTimeout(settingsButton.click(), 200);

/*
3 steps:
1. Find the subtitle menu title and click the button
2. Find if the auto generate option is available and click that button. Press settings button to exit.
3. Successfully track the mutations for the ytp-caption-window-container class
*/

const captionOperationHandler = [

    // Step 1
    function() {
        let settings = document.body.getElementsByClassName("ytp-settings-menu");
        // Not all videos have the same number of menu items when settings is selected.
        // Survey each one.
        let menuItems = settings[0].childNodes[0].childNodes[0].childNodes;
        menuItems.forEach((menuItem) => {
            let itemLabelText = menuItem.childNodes.item(1).textContent;
            if (itemLabelText != "Annotations" && itemLabelText != "Playback speed" && itemLabelText != "Quality") 
                // Found subtitles option
                menuItem.click();
                // wait until the screen has updated with the available subtitles: wait time 0.7 seconds
        });
    },
    
    // Step 2: wait until the screen has updated with the available subtitles
    function() {
        let captionsAvailable = document.getElementsByClassName("ytp-panel-menu")[0].childNodes;
        captionsAvailable.forEach((caption) => {
            if (caption.firstChild.innerText == "English (auto-generated)") {
                // Select auto generated
                caption.click();
                hasAutoGenerate = true;
                settingsButton.click();
            }
        });
    }
]
// carry out timely executions
for (let i = 0; i < captionOperationHandler.length; i++) {
    setTimeout(captionOperationHandler[i], (i + 1) * 600);
}
            
setTimeout(() => {
    if (!hasAutoGenerate)
        alert("Warning: Auto generate is not available. Censoring of foul language cannot be timed properly.");
    else {
        // Step 3: Begin observing the caption screen for mutations (added text nodes).
        // Must be a specific snapshot of the caption screen (not its constant static reference).
        let currentCaptionWindow = document.getElementsByClassName("ytp-caption-window-container")[0];
        // Use this function to clear amy subtitles that may have already been said to start afresh.
        clearCaptionWindow(currentCaptionWindow);
        captionPresenceObserver.observe(currentCaptionWindow, {
            childList: true
        });
    }
}, 2500);

function clearCaptionWindow(window) {
    while (window.hasChildNodes())
        window.removeChild(window.firstChild)
}

////// OBSERVATIONS ///////

const captionPresenceObserver = new MutationObserver((mutations) => {
    if (mutations[0].addedNodes.length != 0) {
        // The caption window has captions-text again (nodes length is 1)
        var captionsText = mutations[0].addedNodes[0].childNodes[0]

        // watch the initial captionVisualLine
        var captionVisualLine = captionsText.childNodes.item(0);
        // The initial word will not be watched in the observer; account for it.
        censorWord(captionVisualLine.innerText.toString())
        observeNewCaptionVisualLine(captionVisualLine)
        
        // watch for any added captionVisualLines
        newCaptionLineObserver.observe(captionsText, {
            childList: true
        });
    }
});

const newCaptionLineObserver = new MutationObserver((mutations) => {
    if (mutations.length === 1) {
        var addedCaptionLine = mutations[0].addedNodes.item(0);
        // The initial word will not be watched in the observer; account for it.
        censorWord(addedCaptionLine.innerText)
        observeNewCaptionVisualLine(addedCaptionLine);
    }
    else if (mutations.length != 0) {
        // The last mutation is the most recent captionVisualLine
        mutations[mutations.length-1].addedNodes.forEach(observeNewCaptionVisualLine);
    }
});

    function observeNewCaptionVisualLine(visualLine) {
        /* Helper function used in captionPresenceObserver for initial caption lines
        as well as for any additional lines (see newCaptionLineObserver)
        */

        // visualLine elements only will ever have one child: ytp-caption-segment
        var captionSegment = visualLine.firstChild; 
        individualLineCaptionObserver.observe(captionSegment, {
            childList: true, // Observe for individual word insertions
            subtree: true
        });
    }

const individualLineCaptionObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        censorWord(node.textContent)}
    )); // May be the error
});

function censorWord(textNode) {
  // DEBUGGER console.log(textNode)
    if (textNode.includes("████")) {
        video.muted = true;
        unMute(video);
    }
}

// Having a callback here allows for repeated unmutes
function unMute(theVideo) {
    setTimeout(() => {
        theVideo.muted = false;
    }, 700);
}

