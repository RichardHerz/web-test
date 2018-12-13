// by Richard K. Herz of www.ReactorLab.net
// 2015

// ----------------- HANDLE UI CONTROLS ----------------------

// HANDLE RUN-PAUSE BUTTON CLICK
function runThisLab(){
  // CALLED BY UI RUN/PAUSE BUTTON (id="runButton")
  gRunner = !gRunner; // toggle value of gRunner
  if (gRunner) {
    runButton.value = "Pause";
    runSimulation();
    //----------------START NEW------------
      $.post("../webAppRunLog.lc",{webAppNumber: "5"});
    //----------------END NEW------------
  } else {
    runButton.value = "Run";
  }
} // END OF function runThisLab

// HANDLE RESET BUTTON CLICK
function resetThisLab(){
  resetFlag = 1; // 0 for no reset, 1 for reset lab
  updateProcessUnits(resetFlag);
  updateDisplay(resetFlag);
  runButton.value = "Run";
  resetFlag = 0; // 0 for no reset, 1 for reset lab
  gRunner = false;
  // do NOT update process nor display again here (will take one step)
} // END OF function resetThisLab
