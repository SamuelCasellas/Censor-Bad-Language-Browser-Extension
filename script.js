
'use strict';

const decryptionKey = {
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
  " ":" ",
};

let badWords = {
  // The baddies //
  "zbgureshpxre": "",
  "shpx": "",
  "ovgpu": "",
  "ohyyfuvg": "",
  "fuvg": "",

  "pbpx": "soft",
  "qvpx": "",
  "phag": "",
  "chffl": "",

  "onfgneq": "", // MM
  "avttn": "", // Small-racist
  "[ __ ]": "[ __ ]", // This is for YouTube    
};

const semiBaddies = {
  "nff": "soft",
  "nffubyr": "",
  "qhzonff": "",
  "wnpxnff": "",
  "qnza": "",
  "qnzzvg": "",
  "uryy": "soft",
  "cvff":""
};

const religious = {
  "tbqqnza": "",
  "tbq": "",
  "wrfhf": "",
  "puevfg": "soft",
  "ybeq": "",
};

const racialSlurs = {
  "avttre": "", // Racist
  "snttbg": "", // Rider
};

const sexual = {
  "frk": "",
  "znfgheongr": "",
  "cravf": "",
  "intvan": "",
  "obbof": "",
  "wnpx bss": "",
  "oybj wbo": "",
  "onyys": ""
};


// Apply filters
chrome.storage.sync.get(["allCurses"], function(result) {
  // console.log(result);
  if (JSON.parse(result["allCurses"])) {
    // console.log("Added all");
    badWords = {...badWords, ...semiBaddies};
  }
});

chrome.storage.sync.get(["religious"], function(result) {
  // console.log(result);
  if (JSON.parse(result["religious"])) {
    // console.log("Added all with religious");
    badWords = {...badWords, ...religious};
  }
});

chrome.storage.sync.get(["racial"], function(result) {
  // console.log(result);
  if (JSON.parse(result["racial"])) {
    // console.log("Added all with religious");
    badWords = {...badWords, ...racialSlurs};
  }
});

chrome.storage.sync.get(["sexual"], function(result) {
  // console.log(result);
  if (JSON.parse(result["sexual"])) {
    // console.log("Added all with religious");
    badWords = {...badWords, ...sexual};
  }
});

let wordMemoization = new Object;

const findText = (element) => {
  if (element.hasChildNodes()) {
    element.childNodes.forEach(findText); // Dig deeper in the DOM
  } 
  else if (element.nodeType === Text.TEXT_NODE) {
    replaceText(element);
  }
}

const ytSpecialChar = (textElement) => {
  try {
    if (textElement.parentElement.className === "captions-text" || 
    textElement.parentElement.className === "ytp-caption-segment") {
      // replace the no break space with a normal space for detection purposes
      textElement.textContent = textElement.textContent.replace(/ /gi, " ");
      textElement.textContent = textElement.textContent.replace(/\[ __ \]/gi, " ████ ");
    }
  } catch(e) {} // pass
}

const replaceText = (textElement) => {
  for (let encryptedBadWord in badWords) {
    if (encryptedBadWord === "[ __ ]") {
      ytSpecialChar(textElement);
    } else {
      if (!wordMemoization[encryptedBadWord]) {
        wordMemoization[encryptedBadWord] = decrypt(encryptedBadWord);
      }
      let decryptedBadWord = wordMemoization[encryptedBadWord];
      let regExpWord;
      // First case: truncated word search; aka not "soft" search
      if (!badWords[encryptedBadWord]) {
        regExpWord = RegExp(decryptedBadWord, "gi");
        textElement.textContent = textElement.textContent.replace(regExpWord, "████");
      } else {
        regExpWord =  RegExp(`(\\s|[^a-zA-Z]|^)${decryptedBadWord}(\\s|[^a-zA-Z]|$\)`, "gi")
        textElement.textContent = textElement.textContent.replace(regExpWord, " ████ ");
      }
    }
  }
}

const decrypt = (word) => {
  let newWord = new String;
  let chars = word.split("");
  for (let char of chars) {
    newWord += decryptionKey[char];
  }
  return newWord;
}

// const punctuation = ['!', '\\?', '\\.', ',', ':', ';', '—', '\'', '\"'];
// const addPunct = (word) => {
//   /* Assumes that the word already has a space before and after added to it.
//   */
//   let possibilityList = [word];
//   let truncateWord = word.slice(0, word.length - 1);
//   for (let punct of punctuation) {
//     possibilityList.push(truncateWord + punct);
//   }
//   return possibilityList;
// }

// Parse all text on initial load
findText(document.body);

// newTextMO for dynamic text
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach(findText);
  });
}).observe(document.body, {subtree: true, childList: true});
