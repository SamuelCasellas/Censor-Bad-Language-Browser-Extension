// "icons": {
//     "16": "/images/",
//     "48": "/images/",
//     "128": "/images/"
// },
// "page_action": {
//     "default_icon": {
//     "16": "/images/",
//     "48": "/images/",
//     "128": "/images/"
//    }
// },

// var badWords = require('./bad_words.json');
// var decryptionKey = require('./decryption_key.json');


badWords = {
    "shpx": "flip",
    "shx": "flip",
    "shpxvat": "flipping",
    "shpxre": "flipper",
    "ovgpu": "buttercup",
    "fuvg": "whiz",
    "fuvggl": "whizzy",
    "qnza": "dang",
    "qnzzvg": "darn it",
    "pbpx": "hack",
    "nff": "bum",
    "nffubyr": "bummer",
   // "fhpx": "stink",
    "phpx": "hack",
    "qvpx": "Moby",
    "tbq": "doge",
    "zl tbq": "holy grail",
    "wrfhf": "Jason",
    "puevfg": "Borne",
    "onfgneq": "Mastermind",
    "uryy": "hockey sticks",
    "phag": "loser",
    "chffl": "cat",
    "snttbg": "dummy",
    "avttre": "I'm a super biggot",
    "avttn": "nilla wafer",
    "yznb": "hahaha",
    "tgsb": "please leave",
    "zbgure shpxre": "imbecile",
    "jgs": "what",
    "[ __ ]": "[ __ ]"   // 160: [ __ ]  // This is for YouTube
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

setTimeout(() => {
    findText(document.body);
}, 1000) // After a second of load time


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
    else if (element.nodeType === Text.TEXT_NODE) { // element.nodeType === Text.TEXT_NODE && 
        replaceText(element);
    }
    
}

function replaceText(textElement) {
   // Some textual elements may be by themselves. Put spaces to accomodate.s
   textElement.textContent = ` ${textElement.textContent} `;
   for (let encryptedBadWord in badWords) {
        var decryptedBadWord = encryptedBadWord;
        // For YouTube
        if (encryptedBadWord != "[ __ ]") {
            decryptedBadWord = decrypt(encryptedBadWord);
        // eval(`textElement.textContent = textElement.textContent.replace(/${decryptedBadWord}/gi, "*${badWords[encryptedBadWord]}*")`);
            eval(`textElement.textContent = textElement.textContent.replace(/ ${decryptedBadWord} /gi, " ████ ")`);
        }
        else {
            try {
                if (textElement.parentElement.className === "captions-text" || 
                textElement.parentElement.className === "ytp-caption-segment") {
             //       textElement.textContent = textElement.textContent.trim()

                    // replace the no break space with a normal space for detection purposes
                    textElement.textContent = textElement.textContent.replace(/ /gi, " ");
                    textElement.textContent = textElement.textContent.replace(/\[ __ \]/gi, " ████ ");
                }
            }
            catch(Exception) {} // pass
        }

    }
    // Get rid of added spaces.
    textElement.textContent = textElement.textContent.slice(1, textElement.textContent.length - 1);
}

function decrypt(word) {
    let newWord = new String;
    let chars = word.split("");
    for (let char of chars) {
        newWord += decryptionKey[char];
    }
    return newWord;
}
