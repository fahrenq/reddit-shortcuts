/* global chrome */

const STEP = 150;
const HIGHLIGHT_COLOR = '#1E7DCD';
let currentPost;

// Styles
const css = document.createElement('style');
css.type = 'text/css';
css.innerHTML = `
.reddit-shortcuts-reference__wrapper {
  z-index: 9999;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.55);
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reddit-shortcuts-reference {
  width: 100%;
  max-width: 900px;
  height: 550px;
  background-color: #fbfbfb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 1px 1px 5px 0px rgba(0,0,0,0.35);
  animation: appear .25s;
}

@keyframes appear {
  from {
    transform: scale(0.85);
  }
  to {
    transform: scale(1);
  }
}

.reddit-shortcuts-reference__header {
  height: 70px;
  background-color: #f9482c;
  text-align: center;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: system-ui, sans-serif;
  border-bottom-left-radius: 50px 30px;
  font-size: 1.4rem;
}

.reddit-shortcuts-reference__content-wrapper {
  height: 480px;
  background-color: #f9482c;
}

.reddit-shortcuts-reference__content {
  height: 100%;
  background-color: #fbfbfb;
  border-top-right-radius: 50px 30px;
}
`;
document.body.appendChild(css);

function getLightbox() {
  return document.querySelector('#lightbox');
}

function scroll(y, object = window) {
  chrome.storage.sync.get(['disableSmoothScroll'], (result) => {
    const behavior = result.disableSmoothScroll ? 'instant' : 'smooth';
    object.scrollTo({ top: y, behavior });
  });
}

function highlightPost(post) {
  post.style.setProperty('border-color', HIGHLIGHT_COLOR);
}

function removeHighlightFromPost(post) {
  post.style.removeProperty('border-color');
}

function setCurrentPost(post) {
  if (currentPost) removeHighlightFromPost(currentPost);
  highlightPost(post);
  currentPost = post;
}

function topPosition(el) {
  return el.getBoundingClientRect().top;
}

function listItems() {
  return Array.from(document.querySelectorAll('.scrollerItem'));
}

function findClosestPost(options = {}) {
  const items = listItems().filter(el => topPosition(el) !== 0);
  let point = 50;
  if (options.action === '+') point += options.value;
  if (options.action === '-') point -= options.value;

  const reducer = (el1, el2) => {
    const el1top = topPosition(el1);
    const el2top = topPosition(el2);
    return (Math.abs(el1top - point) < Math.abs(el2top - point) ? el1 : el2);
  };

  return items.reduce(reducer);
}

function next() {
  if (getLightbox()) return;

  const items = listItems().filter(el => topPosition(el) > 65);
  const nextItem = items[0];
  setCurrentPost(nextItem);
  const newScrollPosition = (window.pageYOffset + topPosition(nextItem)) - 60;
  scroll(newScrollPosition);
}

function prev() {
  if (getLightbox()) return;

  const items = listItems().filter((el) => {
    const top = topPosition(el);
    return top < 55 && top !== 0;
  });
  const prevItem = items.pop();

  if (!prevItem) return;

  setCurrentPost(prevItem);
  const itemTopOffset = topPosition(prevItem);
  const offset = 60 - itemTopOffset;
  const newScrollPosition = window.pageYOffset - offset;
  scroll(newScrollPosition);
}

function stepUp() {
  const lightbox = getLightbox();
  if (lightbox) scroll(lightbox.scrollTop - STEP, lightbox);
  else {
    setCurrentPost(findClosestPost({ action: '-', value: STEP }));
    scroll(window.pageYOffset - STEP);
  }
}

function stepDown() {
  const lightbox = getLightbox();
  if (lightbox) scroll(lightbox.scrollTop + STEP, lightbox);
  else {
    setCurrentPost(findClosestPost({ action: '+', value: STEP }));
    scroll(window.pageYOffset + STEP);
  }
}

function openCurrentPost() {
  currentPost.querySelector('h2').click();
}

function closePost() {
  if (getLightbox()) window.history.back();
}

function upvotePost(post) {
  post.querySelector('i.icon-upvote').click();
}

function downvotePost(post) {
  post.querySelector('i.icon-downvote').click();
}

function upvoteCurrentPost() {
  upvotePost(currentPost);
}

function downvoteCurrentPost() {
  downvotePost(currentPost);
}

function toggleHelp() {
  const existing = document.querySelector('.reddit-shortcuts-reference__wrapper');

  if (existing) {
    existing.remove();
    return;
  }

  const el = document.createElement('div');

  el.classList = 'reddit-shortcuts-reference__wrapper';

  el.innerHTML = `
    <div class="reddit-shortcuts-reference">
      <div class="reddit-shortcuts-reference__header">
        Reddit Shortcuts
      </div>
      <div class="reddit-shortcuts-reference__content-wrapper">
        <div class="reddit-shortcuts-reference__content">
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(el);
}

document.addEventListener('keyup', ({ keyCode }) => {
  const checks = [
    el => el.tagName === 'INPUT',
    el => el.attributes.role && el.attributes.role.value === 'textbox',
  ];

  const checksExecuted = checks.map(f => f(document.activeElement));

  if (checksExecuted.filter(i => i).length > 0) return;

  switch (keyCode) {
    case 68:
      next();
      break;
    case 65:
      prev();
      break;
    case 90:
      stepUp();
      break;
    case 67:
      stepDown();
      break;
    case 69:
      openCurrentPost();
      break;
    case 81:
      closePost();
      break;
    case 87:
      upvoteCurrentPost();
      break;
    case 83:
      downvoteCurrentPost();
      break;
    case 72: // H
      toggleHelp();
      break;
    default:
      break;
  }
});
