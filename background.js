/**
 *              =============
 *              BACKGROUND.JS
 *              =============
 * Sole purpose (for non-revenue extension) is to ensure that the 
 * original settings are default settings are set when extension 
 * is first loaded.
 */

import { setChromeAttr, getChromeAttr } from "./chromeStorageFunctionsES.js";

async function init() {
  if (!await getChromeAttr("firstLoad")) {
    setChromeAttr("firstLoad", true);

    setChromeAttr("allCurses", true);
    setChromeAttr("someCurses", false);
    setChromeAttr("religious", true);
    setChromeAttr("racial", true);
    setChromeAttr("sexual", true);
    setChromeAttr("netflixSubs", false);
    setChromeAttr("ytSubs", false);
    setChromeAttr("netflixMute", true);
    setChromeAttr("smartCensor", false);
  }
}

init();
