'use strict';

const badWords = {
  // The baddies //
  "zbgureshpxre": "",
  "shpx": "",
  "ovgpu": "",
  "ohyyfuvg": "",
  "fuvg": "",

  "pbpx": "",
  "qvpx": "",
  "phag": "",
  "chffl": "",

  "snttbg": "", // Rider
  "onfgneq": "", // MM
  "avttre": "", // Racist
  "avttn": "", // Small-racist
  // Semi-baddies words //
  "nff": "",
  "nffubyr": "",
  "qhzonff": "",
  "wnpxnff": "",
  "qnza": "",
  "qnzzvg": "",
  "uryy": "",
  //religious//
  "tbqqnza": "",
  "zl tbq": "",
  "wrfhf": "",
  "puevfg": "",
  /////////////
};

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
  " ":" "
};

let wordMemoization = new Object;

findText(document.body);

const newTextMO = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach(findText);
  });
});

newTextMO.observe(document.body,  
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
  for (let encryptedBadWord in badWords) {
    if (wordMemoization[encryptedBadWord] === undefined) {
      wordMemoization[encryptedBadWord] = decrypt(encryptedBadWord);
    }
    var decryptedBadWord = wordMemoization[encryptedBadWord];
    // hell[o] + [b]ass
    if (encryptedBadWord != "uryy" 
    && encryptedBadWord != "nff" 
    && encryptedBadWord != "phpx") {
      var regExpWord = RegExp(decryptedBadWord, "gi");
      textElement.textContent = textElement.textContent.replace(regExpWord, "████");
    } else {
      textElement.textContent = ` ${textElement.textContent} `;
      decryptedBadWord = ` ${decryptedBadWord} `;
      var possibilityList = addPunct(decryptedBadWord);
      possibilityList.forEach((checkWordInstance) => {
        var regExpWord = RegExp(checkWordInstance, "gi");
        textElement.textContent = textElement.textContent.replace(regExpWord, ` ████${checkWordInstance[checkWordInstance.length-1]}`);
      });
      // Get rid of added spaces.
      textElement.textContent = textElement.textContent.slice(1, textElement.textContent.length - 1);
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

function addPunct(word) {
  /* Assumes that the word already has a space before and after added to it.
  */
  const punctuation = ['!', '\\?', '\\.', ',', ':', ';', '—', '\''];
  let possibilityList = [word];
  var truncateWord = word.slice(0, word.length - 1);
  for (let punct of punctuation) {
    possibilityList.push(truncateWord + punct);
  }
  return possibilityList;
}
