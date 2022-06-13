 
# Overview

Here is a cool extension I made that will censor all profane words on the screen as well as mute similar words in YouTube videos. This was done with vanilla js.

By making an extension for specific websites such as youtube, I became more familiar with the 
document object model and how to detect mutations using the MutationObserver class. Now I have a better
understanding how dynamic websites work.

The general flow of the program is search the DOM tree for any text nodes already there 
while searching for dynamically-added nodes and replace any profane words with a censor bar.
This will also be detected in the subtitles for youtube videos and will then temporarily
mute the video.

[Software Demo Video](https://youtu.be/n0poQjkZ01w)

# Development Environment

* VSCode for development of extension
* Browser's Development Mod3e with extension functionality and console for debugging

# Useful Websites

* [usefulangle.com](https://usefulangle.com/post/356/javascript-detect-element-added-to-dom) -> How to update new elements being added
* [youtube.com (Web Dev Simplified)](https://www.youtube.com/watch?v=rymG9UmPuhM) -> Tutorial used as a guide for building a browser extension
* [javascript.info](https://javascript.info/mutation-observer) -> Helped me understand more of the configuration for the MutationObserver class
* [stackoverflow](https://stackoverflow.com/questions/4515944/how-to-click-a-browser-button-with-javascript-automatically) -> General references such as how to automatically click a button on the screen.
* [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) -> For finding an alternative to eval(), which poses a security risk
* [burningignorance.io](http://burnignorance.com/php-programming-tips/how-to-use-a-variable-in-replace-function-of-javascript/) -> Using a regional expression for using variables with the .replace method

# Future Work

* Add a funtionality for the user to select any funny video they wish that will replace the screen
temporarily during the mute.
* Add a feature that deletes any comments found that include links (for spam bots)
* Use an alternative to eval(). This can impose a security risk.
