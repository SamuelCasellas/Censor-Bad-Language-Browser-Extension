const _numSyllablesInWord = (word) => {
  /* 
  
  */
  const vowels = ["a", "e", "i", "o", "u", "y"];
  let consonantClustersCounter = 0;
  let lastLetter;
  let lastLetterIsVowel;
  console.log(word)
  if (typeof word !== "string") return null;

  if (word === "") return 0;
  if (word.startsWith("[") && word.endsWith("]")) return 0;
  if (word === "ok") return 2;
  if (word.includes("hhh") || word.includes("aaa")) return 5;

  // if (!ignoreEndingPunct) {
    if (word.replace(/[^a-z\s]+/g, "") !== word) {
      if (word.endsWith("...")) {
        consonantClustersCounter += 3;
      }
      else if (word.endsWith(".") || word.endsWith("?")) {
        consonantClustersCounter += 2;
      }
      else if (word.endsWith("!") || word.endsWith(",") || word.endsWith("-")) {
        consonantClustersCounter += 1;
      }
      word = word.replace(/[^a-z\s]+/g, "");
    }
  // }

  const doubleVowelSplitsPossibilities = [
    "ia",
    "oi"
  ];

  word.split("").forEach((l, indx) => {
    try {
      if (indx === 0) {
        lastLetterIsVowel = vowels.includes(l);
        consonantClustersCounter++;
      } else {
        if (vowels.includes(l) !== lastLetterIsVowel) {
          lastLetterIsVowel = vowels.includes(l);
          if (!vowels.includes(l)) consonantClustersCounter++;
        }
        // Account for double vowels that split: () ia, oi (doing), // NOT: ie (friend),  
        else if (vowels.includes(l)) {
          if (doubleVowelSplitsPossibilities.includes(lastLetter + l)) {
            consonantClustersCounter++;
          }
        }
      }
      lastLetter = l;
    } catch (e) {
    }
  });

  // Distribute syllable worth
  if (word.endsWith("ed")) consonantClustersCounter--;
  if (consonantClustersCounter === 0) return 1;
  if (!lastLetterIsVowel) return consonantClustersCounter - 1;
  else {
    if (word[word.length - 1] === "e") {
      if ((word[word.length - 2] in vowels) || word[word.length - 2] === "l") {
        return consonantClustersCounter;
      } else {
        return consonantClustersCounter - 1 === 0 ? 1 : consonantClustersCounter - 1;
      }
    } else {
      return consonantClustersCounter;
    }
  }
};

const timesOfTargetInSentence = (sentence, bleepSymbol) => {
  sentence = sentence.toLowerCase().replace(/-|–|—/g, "");
  let totalSyllables = 0;
  let syllableTimingOfTargets = [];

  sentence.split(" ").forEach((word, indx, array) => {
    if (word.includes(bleepSymbol)) {
      syllableTimingOfTargets.push(totalSyllables*0.16) // On average a person speaks 4 to 5 syllables a second.
    }
    const result = _numSyllablesInWord(word);
    totalSyllables += result;
  });

  return [syllableTimingOfTargets, totalSyllables * 0.16];
  // syllableTimingOfTargets.forEach((pos) => {
  //   console.log("Target word", bleepSymbol, "is said after", pos*0.2, "seconds in a sentence that is", totalSyllables*0.2);
  // })
};

// For testing
// module.exports = [_numSyllablesInWord];