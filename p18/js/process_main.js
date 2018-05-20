
/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// this file contains common simulation functions
// see file process_units.js for simulation parameter values and
// definitions of the process units
//
// USES in file process_interface.js the function resetThisLab()
//
// USES in object simParams from file process_units.js the following:
//    function updateCurrentRunCountDisplay()
//    function checkForSteadyState()
//    function updateSimTime()
//    variables runningFlag, ssFlag, simStepRepeats, processUnits
//    variables updateDisplayTimingMs
//
// USES object plotsObj defined in file process_plot_info.js
//
// USES in file process_plotter.js the functions
//    getPlotData() and plotPlotData()
//
// USES in file process_spacetime.js the function plotSpaceTimePlot()

  // DISPLAY INITIAL STATE ON OPEN WINDOW
  window.onload = openThisLab; // can NOT use = openThisLab();

  function openThisLab() {
    resetThisLab(); // defined in file process_interface.js
    simParams.updateCurrentRunCountDisplay();
  } // END OF function openThisLab

  function runSimulation() {

    // CALLED BY function runThisLab ON CLICK OF RUN-PAUSE BUTTON

    // HERE, THE INTEGRATION TIME STEP SIZE MUST BE CONSTANT WITHIN ONE DISPLAY
    // INTERVAL TO MAINTAIN CORRESPONDENCE BETWEEN SIM TIME AND REAL TIME
    // FOR A DIFFERENT CASE WHERE THE INTEGRATION TIME STEP SIZE CAN VARY
    // BETWEEN updateProcessUnits YOU NEED
    // THE MORE COMPLEX TIMING METHOD USED IN dynamic-process-v2.livecode

    // updateDisplayTimingMs is real time milliseconds between display updates
    var updateDisplayTimingMs = simParams.updateDisplayTimingMs;
    var startDate = new Date(); // need this here
    var startMs;
    var currentMs;
    var elapsedMs;
    // updateMs is computed below in function updateProcess to be real time
    // between finish last display update and start next update process
    var updateMs = 0; // initialize as zero for first call immediately below

    // first call to updateProcess, which then calls itself
    // use setTimeout, since updateProcess by itself does not work
    setTimeout(updateProcess, updateMs);

    function updateProcess() {

      var runningFlag = simParams.runningFlag;
      if (!runningFlag) {
        // exit if runningFlag is not true
        // runningFlag can become not true by click of RUN-PAUSE or RESET buttons
        return;
      }

      // update simTime = simulation time elapsed
      simParams.updateSimTime();

      // do NOT return here when ssFlag goes true at steady statement
      // because then simTime will not update since this function will not call itself again
      // DO return at top of updateProcessUnits and updateDisplay which are called below here
      // such that this updateProcess function always completes normally and calls itself again

      // get time at start of repeating updateProcessUnits
      startDate = new Date(); // need this here
      startMs = startDate.getTime();

      // repeating updateProcessUnits must finish before
      // latest real time at which updateDisplay must occur in order
      // to maintain correspondence between sim time and real time
      //

      for (i = 0; i < simParams.simStepRepeats; i += 1) {
        updateProcessUnits();
      }

      // get time at end of repeating updateProcessUnits and call
      // to updateDisplay from updateDisplay function return value
      currentMs = updateDisplay();

      // Adjust wait until next updateProcess to allow for time taken
      // to do updateProcessUnits and updateDisplay.
      // In order to respond to user input, do not need updateMs > 0.
      // BUT DO NEED updateMs > 0 to keep sync between sim time and real time.
      elapsedMs = currentMs - startMs;
      updateMs = updateDisplayTimingMs - elapsedMs;

      // // DISPLAY TIMING DATA DURING DEVELOPMENT - PERCENT TIME IDLE
      // var tIdleTime = 100*(1-elapsedMs/updateMs);
      // tIdleTime = Number(tIdleTime).toPrecision(2);
      // document.getElementById("field_output_field").innerHTML = "% idle = " + tIdleTime + "&nbsp;&nbsp;";

      // END updateProcess WITH CALL TO ITSELF AFTER updateMs WAIT
      setTimeout(updateProcess, updateMs);  // updateMs

    } // END OF function updateProcess (inside function runSimulation)

  } // END OF function runSimulation

  function updateProcessUnits() {
    // DO COMPUTATIONS TO UPDATE STATE OF PROCESS
    // step all units but do not display

    if (simParams.ssFlag) {
      // exit if simParams.ssFlag true
      return;
    }

    var numUnits = Object.keys(processUnits).length; // number of units

    // FIRST, have all units update their unit input connections
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateInputs();
    }

    // SECOND, have all units update their state
    for (n = 0; n < numUnits; n += 1) {
        processUnits[n].updateState();
    }

    // check and set simParams.ssFlag to true if at steady state
    simParams.checkForSteadyState();

  } // END OF updateProcessUnits

  function updateDisplay() {

    if (simParams.ssFlag) {
      // exit if simParams.ssFlag true
      // BUT FIRST MUST DO THIS (also done below at end normal update)
      // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
      // or, if do not do here, simTime will race ahead
      var thisDate = new Date();
      var thisMs = thisDate.getTime();
      return thisMs;
    }

    var numUnits = Object.keys(processUnits).length; // number of units

    // display all units but do not step
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].display();
    }

    // GET AND PLOT ALL PLOTS defined in object plotsObj in process_plot_info.js
    var npl = Object.keys(plotsObj).length; // number of plots
    var p; // used as index
    var data;
    for (p = 0; p < npl; p += 1) {
      if (plotsObj[p]['type'] == 'canvas') {
        // space-time, color-canvas plot
        plotSpaceTimePlot(p); // defined in file process_spacetime.js
      } else {
        // profile (static x,y) or strip chart (scolling x,y)
        data = getPlotData(p); // defined in file process_plotter.js
        plotPlotData(data,p); // defined in file process_plotter.js
      }
    }

    // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
    var thisDate = new Date();
    var thisMs = thisDate.getTime();
    return thisMs;

  }  // END OF function updateDisplay

  function updateUIparams() {
    // Update user-entered inputs from UI to ALL units.
    // Could be called from onclick or onchange in HTML element, if desired.
    // Alternative: in HTML input tag onchange, send unitName.updateUIparams()
    // to method updateUIparams of specific unit involved in that input.

    var numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateUIparams();
    }

  }  // END OF function updateUIparams
