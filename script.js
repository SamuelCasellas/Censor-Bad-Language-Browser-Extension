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

  "snttbg": "", // Rider
  "snt": "", // Short Rider
  "onfgneq": "", // MM
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
  "cvff":"",
  "qbhpur":"",
  "onyyf":""
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
  "avttn": "", // Small-racist
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
  "gjng": ""
};

const filterNameToWords = {
  "allCurses": semiBaddies,
  "religious": religious,
  "racial": racialSlurs,
  "sexual": sexual
};

// Apply filters
for (let filter in filterNameToWords) {
  getChromeAttr(filter, null).then(currentSetting => {
    if (currentSetting) {badWords = {...badWords, ...filterNameToWords[filter]};}
  });
}

let wordRegExMemoization = new Object;

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

const wordCheck = (textElement, encryptedBadWord) => {
  let regExpWord;

  // IF word not memoized: create and store its RegEx search pattern
  if (!wordRegExMemoization[encryptedBadWord]) {
    const decryptedBadWord = decrypt(encryptedBadWord);
    // IF word is truncated strictly (not commonly composing other words)
    if (!badWords[encryptedBadWord]) {
      regExpWord = RegExp(decryptedBadWord, "gi");
    } else {
      regExpWord = RegExp(`(\\s|[^a-zA-Z]|^)${decryptedBadWord}(\\s|[^a-zA-Z]|$\)`, "gi")
    }
    wordRegExMemoization[encryptedBadWord] = regExpWord;
  }

  regExpWord = wordRegExMemoization[encryptedBadWord];
  
  let bleep;
  badWords[encryptedBadWord] === "soft"
  ? bleep = " ████ "
  : bleep = "████";

  textElement.textContent = textElement.textContent.replace(regExpWord, bleep);
};

const replaceText = (textElement) => {
  for (let encryptedBadWord in badWords) {
    encryptedBadWord === "[ __ ]"
    ? ytSpecialChar(textElement)
    : wordCheck(textElement, encryptedBadWord);
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

// Parse all text on initial load
findText(document.body);

// newTextMO for dynamic text
new MutationObserver((mutations) => {
  document.querySelectorAll('[contenteditable]').forEach(createInputEventListener);
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach(findText);
  });
}).observe(document.body, {subtree: true, childList: true});


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