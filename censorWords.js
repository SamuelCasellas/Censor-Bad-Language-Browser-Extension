
// Insert your own replacements for these words here (if you know what they are)
// Remove the slashes in line 101 and comment out the previous line to implement these custom words 
// However, the YouTube video censoring will not work if you do this.

badWords = {
    "shpx": "freak",
    "shx": "freak",
    "shpxvat": "",
    "shpxre": "",
    "ovgpu": "",
    "fuvg": "",
    "fuvggl": "",
    "qnza": "",
    "qnzzvg": "",
    "pbpx": "",
    "nff": "",
    "nffubyr": "",
    "phpx": "",
    "qvpx": "",
    "tbq": "doge",
    "tbqqnza": "",
    "wrfhf": "",
    "puevfg": "",
    "onfgneq": "",
    "uryy": "heck",
    "phag": "",
    "chffl": "",
    "snttbg": "",
    "avttre": "",
    "avttn": "",
    "yznb": "",
    "tgsb": "",
    "zbgure shpxre": "",
    "jgs": "",
    "cravf": "",
    "obbo": "",
    "intvan": "",
    "[ __ ]": "[ __ ]" // This is for YouTube
};

decryptionKey = {
    "a":"n",
    "b":"o",
    "c":"p",
    "d":"q",
    "e":"r",
    "f":"s",
    "g":"t",
    "h":"u",
    "i":"v",
    "j":"w",
    "k":"x",
    "l":"y",
    "m":"z",
    "n":"a",
    "o":"b",
    "p":"c",
    "q":"d",
    "r":"e",
    "s":"f",
    "t":"g",
    "u":"h",
    "v":"i",
    "w":"j",
    "x":"k",
    "y":"l",
    "z":"m",
    " ":" "
};

setTimeout(findText(document.body), 1000) // After a second of load time

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(findText)
    });
});

observer.observe(document.body,  
    { 
        subtree: true,
        childList: true // Look for any additions of child nodes
    });

function findText(element) {
    if (element.hasChildNodes()) {
        element.childNodes.forEach(findText); // Dig deeper in the DOM
    } 
    else if (element.nodeType === Text.TEXT_NODE) {
        replaceText(element);
    }
    
}

function replaceText(textElement) {
   // Some textual elements may be by themselves. Put spaces to accomodate
   for (let encryptedBadWord in badWords) {
        if (encryptedBadWord != "[ __ ]") {
            if (encryptedBadWord != decrypt("nff") && encryptedBadWord != decrypt("uryy")) {
                var decryptedBadWord = decrypt(encryptedBadWord);
                // So we can read variables as strings
                var sRegExpInput = new RegExp(decryptedBadWord, "gi");
                textElement.textContent = textElement.textContent.replace(sRegExpInput, "████");
        //     textElement.textContent = textElement.textContent.replace(sRegExpInput, badWords[encryptedBadWord]); // For custom-replace
            }
            else {
                textElement.textContent = ` ${textElement.textContent} `;
                var decryptedBadWord = decrypt(encryptedBadWord);
                decryptedBadWord = " " + decryptedBadWord + " ";
                // So we can read variables as strings
                var sRegExpInput = new RegExp(decryptedBadWord, "gi");
                textElement.textContent = textElement.textContent.replace(sRegExpInput, " ████ ");
        //      textElement.textContent = textElement.textContent.replace(sRegExpInput, ` ${badWords[encryptedBadWord]} `); // For custom-replace
            }
        }
        // For YouTube subtitles
        else {
            try {
                if (textElement.parentElement.className === "captions-text" || 
                textElement.parentElement.className === "ytp-caption-segment") {
                    // replace the no break space with a normal space for detection purposes
                    textElement.textContent = textElement.textContent.replace(/ /gi, " ");
                    textElement.textContent = textElement.textContent.replace(/\[ __ \]/gi, "████");
                }
            }
            catch(Exception) {} // pass
        }

    }
}

function decrypt(word) {
    let newWord = new String;
    let chars = word.split("");
    for (let char of chars) {
        newWord += decryptionKey[char];
    }
    return newWord;
}
