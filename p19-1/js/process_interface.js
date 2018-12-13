// by Richard K. Herz of www.ReactorLab.net
// 2015, 2016

// ----------------- HANDLE UI CONTROLS ----------------------

// HANDLE RUN-PAUSE BUTTON CLICK
function runThisLab() {
  // uses object simParams from file process_units.js
  // CALLED BY UI RUN-PAUSE BUTTON DEFINED IN HTML
  // TOGGLE runningFlag FIRST before doing stuff below
  simParams.toggleRunningFlag(); // toggle runningFlag true-false
  // TOGGLE runningFlag FIRST before doing stuff below
  var runButtonID = simParams.runButtonID;
  var runningFlag = simParams.runningFlag;
  var loggerURL = simParams.loggerURL;
  if (runningFlag) {
    eval(runButtonID + '.value = "Pause"');
    runSimulation();
   $.post(loggerURL,{webAppNumber: "1"});
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
  resetFlag = 1; // 0 for no reset, 1 for reset lab
  updateProcessUnits(resetFlag);
  updateDisplay(resetFlag);
  eval(runButtonID + '.value = "Run"');
  // do NOT update process nor display again here (will take one step)
} // END OF function resetThisLab
