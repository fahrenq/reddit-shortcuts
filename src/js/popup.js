/* global chrome */

import '../css/popup.css';

const dssCheckbox = document.querySelector('input#disableSmoothScroll');
const dssLabel = document.querySelector('label[for=disableSmoothScroll]');
const dss = [dssCheckbox, dssLabel];

chrome.storage.sync.get(['disableSmoothScroll'], (result) => {
  dssCheckbox.checked = result.disableSmoothScroll;
});


// Let's hope no one will check it with keyboard.
// I didn't find elegant way to track checkbox change
// without inline function i.e. onclick="fun()"
// Inline functions are forbidden in chrome extensions
dss.forEach((e) => {
  e.addEventListener('click', () => {
    chrome.storage.sync.set({ disableSmoothScroll: dssCheckbox.checked });
  });
});
