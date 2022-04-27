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
    "ovgpu": "buttercup",
    "fuvg": "whiz",
    "fuvggl": "whizzy",
    "qnza": "wham",
    "pbpx": "hack",
    "fhpx": "stink",
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
}, 500) // After half a second of load time


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
    if (element.tagName == "SPAN" || element.tagName == "p" || element.tagName == "YT-FORMATTED-STRING") { // element.nodeType === Text.TEXT_NODE && 
        replaceText(element);
    }
    if (element.hasChildNodes()) {
        element.childNodes.forEach(findText); // Dig deeper in the DOM
    } 
}

function replaceText(textElement) {
    for (let encryptedBadWord in badWords) {
        console.log(textElement.textContent)
        var decryptedBadWord = decrypt(encryptedBadWord);
        eval(`textElement.textContent = textElement.textContent.replace(/${decryptedBadWord}/gi, "*${badWords[encryptedBadWord]}*")`);
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