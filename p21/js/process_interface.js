/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ----------- HANDLE UI CONTROLS & INPUT FIELDS ------------------

// HANDLE RUN-PAUSE BUTTON CLICK
function runThisLab() {
  // uses object simParams from file process_units.js
  // CALLED BY UI RUN-PAUSE BUTTON DEFINED IN HTML
  // TOGGLE runningFlag FIRST before doing stuff below
  simParams.toggleRunningFlag(); // toggle runningFlag true-false
  // TOGGLE runningFlag FIRST before doing stuff below
  var runningFlag = simParams.runningFlag;
  if (runningFlag) {
    simParams.ssFlag = false; // unit sets true when sim reaches steady state
    button_runButton.value = 'Pause'; // REQUIRES run button id="button_runButton"
    runSimulation();
    simParams.updateRunCount();
    } else {
      button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
  }
} // END OF function runThisLab

// HANDLE RESET BUTTON CLICK
function resetThisLab() {
  // uses object simParams from file process_units.js
  // input argument is the RUN button ID, not the reset button ID
  simParams.stopRunningFlag();
  simParams.resetSimTime();
  simParams.ssFlag = false; // unit sets true when sim reaches steady state
  // reset all units
  var numUnits = Object.keys(processUnits).length; // number of units
  for (n = 0; n < numUnits; n += 1) {
    processUnits[n].reset();
  }
  updateDisplay();
  button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
  // do NOT update process nor display again here (will take one step)
} // END OF function resetThisLab

// GET INPUT VALUES FROM INPUT FIELDS - CALLED IN UNITS updateUIparams()
function getInputValue(pUnitIndex,pVarName) {
  // requires specific naming convention for input variables
  // generate the names
  var tInput = 'input' + pVarName;
  var tInitial = 'initial' + pVarName;
  var tMin = 'min' + pVarName;
  var tMax = 'max' + pVarName;
  // get the values
  var varInputID = processUnits[pUnitIndex][tInput];
  var varInitial = processUnits[pUnitIndex][tInitial];
  var varMin = processUnits[pUnitIndex][tMin];
  var varMax = processUnits[pUnitIndex][tMax];
  // get the contents of the input and handle
  if (document.getElementById(varInputID)) {
    // the input exists so get the value and make sure it is within range
    var varValue = eval(varInputID + '.value');
    varValue = Number(varValue); // force any number as string to numeric number
    if (isNaN(varValue)) {varValue = varInitial;} // handle e.g., 259x, xxx
    if (varValue < varMin) {varValue = varMin;}
    if (varValue > varMax) {varValue = varMax;}
    document.getElementById(varInputID).value = varValue;
  } else {
    // this 'else' is in case there is no input on the web page yet
    // in order to allow for independence and portability of this
    // process unit
    varValue = varInitial;
  }
  return varValue
} // end of getInputValue()
