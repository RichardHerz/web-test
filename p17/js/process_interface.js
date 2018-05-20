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
  var runButtonID = simParams.runButtonID;
  var runningFlag = simParams.runningFlag;
  if (runningFlag) {
    simParams.ssFlag = false; // unit sets true when sim reaches steady state
    eval(runButtonID + '.value = "Pause"');
    runSimulation();
    simParams.updateRunCount();
    } else {
    eval(runButtonID + '.value = "Run"');
  }
} // END OF function runThisLab

// HANDLE RESET BUTTON CLICK
function resetThisLab() {
  // uses object simParams from file process_units.js
  // input argument is the RUN button ID, not the reset button ID
  var runButtonID = simParams.runButtonID;
  simParams.stopRunningFlag();
  simParams.resetSimTime();
  simParams.ssFlag = false; // unit sets true when sim reaches steady state
  resetFlag = 1; // 0 for no reset, 1 for reset lab
  updateProcessUnits(resetFlag);
  updateDisplay(resetFlag);
  eval(runButtonID + '.value = "Run"');
  // do NOT update process nor display again here (will take one step)
} // END OF function resetThisLab

// GET INPUT VALUES FROM INPUT FIELDS - CALLED IN UNITS updateUIparams()
function getInputValue(pUnitName,pVarName) {
  // requires specific naming convention for input variables
  // generate the names
  var tInput = 'input' + pVarName;
  var tInitial = 'initial' + pVarName;
  var tMin = 'min' + pVarName;
  var tMax = 'max' + pVarName;
  // get the values
  var varInputID = processUnits[pUnitName][tInput];
  var varInitial = processUnits[pUnitName][tInitial];
  var varMin = processUnits[pUnitName][tMin];
  var varMax = processUnits[pUnitName][tMax];
  // get the contents of the input and handle
  if (document.getElementById(varInputID)) {
    // the input exists so get the value and make sure it is within range
    let tmpFunc = new Function("return " + varInputID + ".value;");
    varName = tmpFunc();
    varName = Number(varName); // force any number as string to numeric number
    if (isNaN(varName)) {varName = varInitial;} // handle e.g., 259x, xxx
    if (varName < varMin) {varName = varMin;}
    if (varName > varMax) {varName = varMax;}
    document.getElementById(varInputID).value = varName;
  } else {
    // this 'else' is in case there is no input on the web page yet
    // in order to allow for independence and portability of this
    // process unit
    varName = varInitial;
  }
  return varName
} // end of getInputValue()
