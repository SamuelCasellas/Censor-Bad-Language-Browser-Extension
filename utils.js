const thisNumSeconds = async(s) => {
  return new Promise(res => {
    setTimeout(() => res(true), s * 1000);
  });
};

/**
 * selectElementPersist
 * 
 * Select an HTML element persistently based on the provided selector and selector type.
 * If the query element is not provided, it queries the whole document.
 * 
 * @param {string} selector - The selector string used to select the element.
 * @param {string} [selectorType="qSA"] - The type of the selector. It can be 'byId', 'byClass', 'qS', 'qSA', or 'byTag'.
 * @param {number} [expectedNumElements=1] - The minimum number of elements to wait for before returning list.
 * @param {number} [timeoutSeconds=10] - The maximum number of seconds to wait for the element to appear in seconds.
 * @param {number} [millisPerAttempt=100] - The number of milliseconds per query attempt.
 * 
 * @returns {Promise<HTMLElement>} - Returns a promise that resolves to the selected HTML element.
 */
async function selectElementPersist(
  selector, selectorType = 'qSA', expectedNumElements=1, targetsInnerText = null, timeoutSeconds = 10, millisPerAttempt = 100
) {
  const maxNumAttempts = timeoutSeconds / (millisPerAttempt / 1000);
  const selectorKeyToFuncAndFullName = {
    'byId': [document.getElementById.bind(document), 'getElementById', 'single'],
    'byClass': [document.getElementsByClassName.bind(document), 'getElementsByClassName', 'multiple'],
    'qS': [document.querySelector.bind(document), 'querySelector', 'single'],
    'qSA': [document.querySelectorAll.bind(document), 'querySelectorAll', 'multiple'],
    'byTag': [document.getElementsByTagName.bind(document), 'getElementsByTagName', 'multiple']
  };
  
  return new Promise((res, rej) => {
    if (!selectorKeyToFuncAndFullName[selectorType]) {
      rej(`Invalid selector type: ${selectorType}`);
    }
    const isSingleElement = selectorKeyToFuncAndFullName[selectorType][2] === 'single';
    const selectorFunc = selectorKeyToFuncAndFullName[selectorType][0];
    if (isSingleElement) {
      expectedNumElements = 1;
    }
    function attemptQuery_(numAttempts = 1) {
      let elementsQueried = selectorFunc.call(document, selector);
      if (elementsQueried) {
        // Single queries will not return a list
        if (typeof elementsQueried.length !== 'number') {
          elementsQueried = [elementsQueried];
        }
        if (targetsInnerText) {
          elementsQueried = Array.from(elementsQueried).filter(element => element.innerText.match(targetsInnerText));
        }
        if (elementsQueried.length >= expectedNumElements) {
          res(
            (isSingleElement || expectedNumElements === 1)
              ? elementsQueried[0] 
              : elementsQueried
          );
          return;
        }
      }
      if (numAttempts < maxNumAttempts) {
        setTimeout(() => attemptQuery_(++numAttempts), millisPerAttempt);
      } else {
        const selectorName = selectorKeyToFuncAndFullName[selectorType][1];
        rej(`Searching for ${expectedNumElements} element(s) with selector "${selector}" using document.${selectorName} not found within ${timeoutSeconds} seconds.`);
        return;
      }
    }
    attemptQuery_();
  });
}

function createGrandRegexForMultipleWords(words, regexOptions = 'gi') {
  let regexString = '';
  for (let i = 0; i < words.length; i++) {
    regexString += words[i];
    if (i !== words.length - 1) {
      regexString += '|';
    }
  }

  return new RegExp(regexString, regexOptions);
}
