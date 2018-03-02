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
  el.style.top = "156px";
  el.style.height = "43px";

} // END OF function openThisLab

var updateDisplayTimingMs = 100;
var flag = 0;

function fillReactor() {

  // get time at start of repeating fillReactor
  startDate = new Date(); // need this here
  startMs = startDate.getTime();

  // both two lines below work by themselves and don't require jquery
  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  // var el = document.getElementById("div_PLOTDIV_reactor_contents");

    var top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    var height = parseFloat(el.style.height); // convert, e.g., "100px" to 100
    el.style.top = top - 2 + 'px';
    height = height + 2;
    el.style.height = height + 'px';

    if (height >= 200) {flag = 1;}

  // >>> BREAK OUT fillReactor WHEN REACTOR FULL

  var thisDate = new Date();
  var currentMs = thisDate.getTime();
  elapsedMs = currentMs - startMs;
  updateMs = updateDisplayTimingMs - elapsedMs;

  if (flag == 0) {
  // END fillReactor WITH CALL TO ITSELF AFTER updateMs WAIT
  setTimeout(fillReactor, updateMs);  // updateMs
} else {
  flag = 0; // set flag back to zero for other actions
}

} // END OF function fillReactor

function emptyReactor() {

  // get time at start of repeating emptyReactor
  startDate = new Date(); // need this here
  startMs = startDate.getTime();

  // both two lines below work by themselves and don't require jquery
  var el = document.querySelector("#div_PLOTDIV_reactor_contents");
  // var el = document.getElementById("div_PLOTDIV_reactor_contents");

    var top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    var height = parseFloat(el.style.height); // convert, e.g., "100px" to 100
    el.style.top = top + 2 + 'px';
    height = height - 2;
    el.style.height = height + 'px';

    if (height <= 1) {flag = 1;}

  // >>> BREAK OUT emptyReactor WHEN REACTOR EMPTY

  var thisDate = new Date();
  var currentMs = thisDate.getTime();
  elapsedMs = currentMs - startMs;
  updateMs = updateDisplayTimingMs - elapsedMs;

  if (flag == 0) {
  // END emptyReactor WITH CALL TO ITSELF AFTER updateMs WAIT
  setTimeout(emptyReactor, updateMs);  // updateMs
} else {
  flag = 0; // set flag back to zero for other actions
}

} // END OF function emptyReactor

function reactReactor() {

} // END OF function reactReactor
