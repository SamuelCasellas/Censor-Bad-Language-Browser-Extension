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
    "[ __ ]": "[ __ ]"   // This is for YouTube // [&nbsp;__&nbsp;]
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
   // console.log(textElement.textContent)
    textElement.textContent = ` ${textElement.textContent} `;
    for (let encryptedBadWord in badWords) {
        var decryptedBadWord = encryptedBadWord;
        // For YouTube
        if (encryptedBadWord != "[ __ ]")
            decryptedBadWord = decrypt(encryptedBadWord);
        // eval(`textElement.textContent = textElement.textContent.replace(/${decryptedBadWord}/gi, "*${badWords[encryptedBadWord]}*")`);
        eval(`textElement.textContent = textElement.textContent.replace(/ ${decryptedBadWord} /gi, " ████ ")`);
    }
    textElement.textContent = textElement.textContent.trim()
}

function decrypt(word) {
    let newWord = new String;
    let chars = word.split("");
    for (let char of chars) {
        newWord += decryptionKey[char];
    }
    return newWord;
}
