/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// DISPLAY INITIAL STATE ON OPEN WINDOW
window.onload = openThisLab; // can NOT use = openThisLab();

function openThisLab() {

  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  el.style.top = "198px";
  el.style.height = "2px";

} // END OF function openThisLab

var updateDisplayTimingMs = 100;
var fillFlag = 0;
var emptyFlag = 0;
var reactFlag = 0;

function fillReactor() {

  if (emptyFlag == 1 || reactFlag == 1) {
    fillFlag = 0;
    return;
  } else {
    fillFlag = 1;
  }

  // get time at start of repeating fillReactor
  startDate = new Date(); // need this here
  startMs = startDate.getTime();

  // both two lines below work by themselves and don't require jquery
  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  // var el = document.getElementById("div_PLOTDIV_reactor_contents");
  var top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
  var height = parseFloat(el.style.height); // convert, e.g., "100px" to 100

  // put this before change height or get height change each onclick
  if (height >= 70) {
    fillFlag = 0;
    return;
  }

  el.style.top = top - 2 + 'px';
  height = height + 2;
  el.style.height = height + 'px';

  // CONTINUE fillReactor WITH CALL TO ITSELF AFTER updateMs WAIT
  var thisDate = new Date();
  var currentMs = thisDate.getTime();
  elapsedMs = currentMs - startMs;
  updateMs = updateDisplayTimingMs - elapsedMs;
  setTimeout(fillReactor, updateMs);  // fillReactor, updateMs

} // END OF function fillReactor

function emptyReactor() {

  if (fillFlag == 1 || reactFlag == 1) {
    emptyFlag = 0;
    return;
  } else {
    emptyFlag = 1;
  }

  // get time at start of repeating emptyReactor
  startDate = new Date(); // need this here
  startMs = startDate.getTime();

  // both two lines below work by themselves and don't require jquery
  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  // var el = document.getElementById("div_PLOTDIV_reactor_contents");
  var top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
  var height = parseFloat(el.style.height); // convert, e.g., "100px" to 100

  // put this before change height or get height change each onclick
  if (height <= 2) {
    emptyFlag = 0;
    return;
  }

  el.style.top = top + 2 + 'px';
  height = height - 2;
  el.style.height = height + 'px';

  // CONTINUE emptyReactor WITH CALL TO ITSELF AFTER updateMs WAIT
  var thisDate = new Date();
  var currentMs = thisDate.getTime();
  elapsedMs = currentMs - startMs;
  updateMs = updateDisplayTimingMs - elapsedMs;
  setTimeout(emptyReactor, updateMs);  // emptyReactor, updateMs

} // END OF function emptyReactor

function reactReactor() {

  if (fillFlag == 1 || emptyFlag == 1) {
    reactFlag = 0;
    return;
  } else {
    reactFlag = 1;
  }

  // get time at start of repeating reactReactor
  startDate = new Date(); // need this here
  startMs = startDate.getTime();

  // both two lines below work by themselves and don't require jquery
  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  // var el = document.getElementById("div_PLOTDIV_reactor_contents");

  // >>> BREAK OUT reactReactor WHEN REACTION DONE
  // put this before change reaction or get reaction change each onclick
  // if (height <= 2) {
  //   emptyFlag = 0;
  //   return;
  // }

  el.style.backgroundColor = "Tomato"; // backgroundColor NOT background-color
  reactFlag = 0;

  return; // xxx TEMPORARY

  // CONTINUE reactReactor WITH CALL TO ITSELF AFTER updateMs WAIT
  var thisDate = new Date();
  var currentMs = thisDate.getTime();
  elapsedMs = currentMs - startMs;
  updateMs = updateDisplayTimingMs - elapsedMs;
  setTimeout(reactReactor, updateMs);  // reactReactor, updateMs

} // END OF function reactReactor
