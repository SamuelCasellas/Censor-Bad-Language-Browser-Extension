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
  ",":",",
  "?":"?"
};

const youtubeRegex = '\\[\u00A0__\u00A0\\]';

const bleep = '████';
const softBleep = ' ████ ';

let badWords = {
  // The baddies //
  "zbgureshpxre": "",
  "shpx": "",
  "ovgpu": "",
  "ohyyfuvg": "",
  "fuvg": "",

  "pbpx": "soft", // "Don't get too cocky"
  "qvpx": "",
  "phag": "",
  "chffl": "",

  "snttbg": "", // Rider
  "snt": "", // Short Rider
  "onfgneq": "", // MM
};

const semiBaddies = {
  "nffr?f?": "soft", // bum
  "nffubyr": "",
  "qhzonff": "",
  "wnpxnff": "",
  "qnza": "",
  "qnzzvg": "",
  "uryy": "soft",
  "cvff": "",
  "qbhpur": "",
  "onyyf": "",
};

const religious = {
  "tbq ?qnza": "",
  "zl tbq": "",
  "bu,? tbq": "",
  "tbq,": "",
  "wrfhf": "",
  "puevfg": "soft",
};

const racialSlurs = {
  "avttre": "", // Racist
  "avttn": "", // Semi-racist
};

const sexual = {
  "frk": "",
  "znfgheongr": "",
  "cravf": "",
  "intvan": "",
  "obbof": "",
  "wnpx bss": "",
  "wrex bss": "",
  "oybj wbo": "",
  "onyyf": "",
  "ubeal": "",
  "betl": "",
  "gjng": "",
};

const filterNameToWords = {
  "allCurses": semiBaddies,
  "religious": religious,
  "racial": racialSlurs,
  "sexual": sexual
};

let decryptedBadWordsHardRegExp, decryptedBadWordsSoftRegExp;

const findText = (element) => {
  if (element.hasChildNodes()) {
    element.childNodes.forEach(findText); // Dig deeper in the DOM
  } 
  else if (element.nodeType === Text.TEXT_NODE) {
    replaceText(element);
  }
}

const replaceText = (textElement) => {
  textElement.textContent = textElement.textContent.replace(decryptedBadWordsSoftRegExp, softBleep);
  textElement.textContent = textElement.textContent.replace(decryptedBadWordsHardRegExp, bleep);
}

const decrypt = (word) => {
  let newWord = new String;
  let chars = word.split("");
  for (let char of chars) {
    newWord += decryptionKey[char];
  }
  return newWord;
}

// Parse all text on initial load
async function initialLoad() {
  // Apply filters
  for (let filter in filterNameToWords) {
    let currentSetting = await getChromeAttr(filter, null);
    if (currentSetting) 
      badWords = {...badWords, ...filterNameToWords[filter]};
  }

  let softWords = [];
  let hardWords = [];
  for (let [encryptedWord, isSoft] of Object.entries(badWords)) {
    (isSoft)
    ? softWords.push('(\\s|[^a-zA-Z]|^)' + decrypt(encryptedWord) + '(\\s|[^a-zA-Z]|$\)')
    : hardWords.push(decrypt(encryptedWord));
  }
  softWords.push(youtubeRegex);

  decryptedBadWordsSoftRegExp = createGrandRegexForMultipleWords(softWords);
  decryptedBadWordsHardRegExp = createGrandRegexForMultipleWords(hardWords);
  
  findText(document.body);
  dynamicMO.observe(document.body, {subtree: true, childList: true});
}

// newTextMO for dynamic text
const dynamicMO = new MutationObserver((mutations) => {
  document.querySelectorAll('[contenteditable]').forEach(createInputEventListener);
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach(findText);
  });
});


function createInputEventListener(el) {
  el.addEventListener("input", function(event) {
    const input = event.target;
    if (input.textContent.length > 1) return;
    setTimeout(() => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 10);
  });
}

initialLoad();
