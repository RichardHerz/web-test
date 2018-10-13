/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let controller = {

  // OBJECT controller contains functions that run the simulation time stepping

  // SUMMARY OF DEPENDENCIES
  //
  // function interface.runThisLab() USES FROM THIS OBJECT function runSimulation()
  //
  // USES in object interface the function interface.resetThisLab()
  //
  // USES in object simParams the following:
  //    variables simStepRepeats, simTimeStep, updateDisplayTimingMs
  //    function updateCurrentRunCountDisplay()
  //    controller.changeSimTimeStep() can change simParams.simTimeStep
  //
  // USES in each process unit object the following:
  //    variable residenceTime
  //    functions initialize(), reset(), updateInputs(), updateState()
  //    functions updateDisplay(), checkForSteadyState()
  //
  // USES object plotInfo defined in file process_plot_info.js
  //
  // USES in object plotter the functions
  //    getPlotData(), plotPlotData(), plotArrays.initialize(),
  //    plotColorCanvasPlot()

  runningFlag : false, // set runningFlag to false initially

  // simTime is changed in updateSimTime() and resetSimTime()
  // simTime & oldSimTime are used in checkForSteadyState()
  simTime : 0, // (s)
  oldSimTime : 0, // (s)

  // ssFlag set to true below in checkForSteadyState() when
  //           sim reaches steady state
  // ssFlag set to false in runThisLab() and resetThisLab() in interface object
  // ssFlag set to false by updateUIparams() in each process unit
  ssFlag : false,

  openThisLab : function() {
    
    // initialize variables in each process unit
    let numUnits = Object.keys(processUnits).length; // number of units
    numUnits = 2;
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].initialize();
    }
    // initialize plotInfo to define plots after initialize units
    plotInfo.initialize();
    // initialize plot arrays after initialize plotInfo
    plotter.plotArrays.initialize();
    interface.resetThisLab(); // defined in process_interface.js
    simParams.updateCurrentRunCountDisplay(); // defined in process_sim_params.js
  }, // END OF function openThisLab

  runSimulation : function() {

    // CALLED BY function runThisLab ON CLICK OF RUN-PAUSE BUTTON

    // HERE, THE INTEGRATION TIME STEP SIZE MUST BE CONSTANT WITHIN ONE DISPLAY
    // INTERVAL TO MAINTAIN CORRESPONDENCE BETWEEN SIM TIME AND REAL TIME
    // FOR A DIFFERENT CASE WHERE THE INTEGRATION TIME STEP SIZE CAN VARY
    // BETWEEN updateProcessUnits YOU NEED
    // THE MORE COMPLEX TIMING METHOD USED IN dynamic-process-v2.livecode

    // updateDisplayTimingMs is real time milliseconds between display updates
    let updateDisplayTimingMs = simParams.updateDisplayTimingMs;
    let startDate = new Date(); // need this here
    let startMs;
    let currentMs;
    let elapsedMs;
    // updateMs is computed below in function updateProcess to be real time
    // between finish last display update and start next update process
    let updateMs = 0; // initialize as zero for first call immediately below

    // first call to updateProcess, which then calls itself
    // use setTimeout, since updateProcess by itself does not work
    // NOTE: updateProcess() is a sub function of controller.runSimulation()
    // and therefore do not use prefix of this. or controller.
    // () optional at end of updateProcess here
    setTimeout(updateProcess(), updateMs);

    function updateProcess() {
      // need controller.runningFlag not this.runningFlag
      // because updateProcess is a subfunction of runSimulation
      if (!controller.runningFlag) {
        // exit if runningFlag is not true
        // runningFlag can become not true by click of RUN-PAUSE, RESET or COPY DATA buttons
        return;
      }

      // update simTime = simulation time elapsed
      // done before simStepRepeats of all units, so
      // simTime update each time is simTimeStep * simStepRepeats
      // need controller.updateSimTime() not this.updateSimTime()
      // because updateProcess is a subfunction of runSimulation
      controller.updateSimTime();

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

      // NOTE: updateProcessUnits() and updateDisplay() are members
      // of top level of controller object and not of this subfunction
      // updateProcess() inside controller.runSimulation()
      // which calls them, so need controller. prefix
      // controller.updateProcessUnits() & controller.updateDisplay()

      for (i = 0; i < simParams.simStepRepeats; i += 1) {
        controller.updateProcessUnits();
      }

      // get time at end of repeating updateProcessUnits and call
      // to updateDisplay from updateDisplay function return value
      currentMs = controller.updateDisplay();

      // Adjust wait until next updateProcess to allow for time taken
      // to do updateProcessUnits and updateDisplay.
      // In order to respond to user input, do not need updateMs > 0.
      // BUT DO NEED updateMs > 0 to keep sync between sim time and real time.
      elapsedMs = currentMs - startMs;
      updateMs = updateDisplayTimingMs - elapsedMs;

      // // DISPLAY TIMING DATA DURING DEVELOPMENT - PERCENT TIME IDLE
      // // NEED TO EDIT INDEX.HTML TO ACTIVATE "field_output_field"
      // let tIdleTime = 100*(1-elapsedMs/updateMs);
      // tIdleTime = Number(tIdleTime).toPrecision(2);
      // document.getElementById("field_output_field").innerHTML = "% idle = " + tIdleTime + "&nbsp;&nbsp;";

      // END updateProcess WITH CALL TO ITSELF AFTER updateMs WAIT
      setTimeout(updateProcess, updateMs);  // updateMs

    } // END OF function updateProcess (inside function runSimulation)

  }, // END OF function runSimulation

  updateProcessUnits : function() {

    // DO COMPUTATIONS TO UPDATE STATE OF PROCESS
    // step all units but do not display

    if (this.ssFlag) {
      // exit if ssFlag true
      return;
    }

    let numUnits = Object.keys(processUnits).length; // number of units

    // FIRST, have all units update their unit input connections
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateInputs();
    }

    // NOTE: UI params are updated whenever UI changes by HTML input actions

    // SECOND, have all units update their state
    for (n = 0; n < numUnits; n += 1) {
        processUnits[n].updateState();
    }

  }, // END OF function updateProcessUnits

  updateDisplay : function() {

    if (this.ssFlag) {
      // exit if ssFlag true
      // BUT FIRST MUST DO THIS (also done below at end normal update)
      // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
      // or, if do not do here, simTime will race ahead
      let thisDate = new Date();
      let thisMs = thisDate.getTime();
      return thisMs;
    }

    // DISPLAY ALL UNITS BUT DO NOT STEP
    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateDisplay();
    }

    // UPDATE PLOTS HERE AND NOT IN PROCESS UNITS IN ORDER TO ALLOW
    // PLOTS TO CONTAIN DATA FROM MORE THAN ONE PROCESS UNIT

    // GET AND PLOT ALL PLOTS defined in object plotInfo
    let numPlots = Object.keys(plotInfo).length;
    numPlots = numPlots - 1; // subtract method initialize(), which is counted in length
    let p; // used as index
    let data;
    for (p = 0; p < numPlots; p += 1) {
      if (plotInfo[p]['type'] == 'canvas') {
        // space-time, color-canvas plot
        plotter.plotColorCanvasPlot(p); // defined in file process_spacetime.js
      } else {
        // profile (static x,y) or strip chart (scolling x,y)
        data = plotter.getPlotData(p);
        plotter.plotPlotData(data,p);
      }
    }

    // check and set ssFlag to true if at steady state
    // do this here in updateDisplay rather than each process update
    // so that don't suspend before a final display update of the steady state
    this.checkForSteadyState();

    // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
    let thisDate = new Date();
    let thisMs = thisDate.getTime();
    return thisMs;

  },  // END OF function updateDisplay

  resetSimTime : function() {
    this.simTime = 0;
  },

  updateSimTime : function() {
    // only updated before simStepRepeats are all executed
    // and only updated once each displayUpdate
    this.simTime = this.simTime + simParams.simTimeStep * simParams.simStepRepeats;
  },

  // runningFlag value can change by click of RUN-PAUSE or RESET buttons
  // calling functions toggleRunningFlag and stopRunningFlag
  toggleRunningFlag : function() {
    this.runningFlag = !this.runningFlag;
  },

  stopRunningFlag : function() {
    this.runningFlag = false;
  },

  changeSimTimeStep : function(factor) {
    // WARNING: do not change simTimeStep except immediately before or after a
    // display update in order to maintain sync between sim time and real time
    simParams.simTimeStep = factor * simParams.simTimeStep;
  },

  checkForSteadyState : function() {
    // uses this.simTime
    // sets this.ssFlag and this.oldSimTime
    // requires all units to have a residence time variable
    // calls each unit's own checkForSteadyState()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    // open OS Activity Monitor of CPU load to see effect of this
    //
    // get longest residence time in all units
    // if all stay constant this check could be moved out of here
    // so only done once, but here allows unit residence times to change
    let numUnits = Object.keys(processUnits).length; // number of units
    let resTime = 0;
    for (let n = 0; n < numUnits; n += 1) {
      if (processUnits[n]['residenceTime'] > resTime) {
        resTime = processUnits[n]['residenceTime'];
      }
    }
    // check all units to see if any not at steady state
    if (this.simTime >= this.oldSimTime + 2 * resTime) {
      // get ssFlag from each unit
      let thisFlag = true; // changes to false if any unit not at steady state
      for (let n = 0; n < numUnits; n += 1) {
        if (!processUnits[n].checkForSteadyState()){
          // result returned by unit is not true
          thisFlag = false;
        }
      }
      this.ssFlag = thisFlag;
      // save sim time of this check
      // do not save for every call of this function or will never enter IF & check
      this.oldSimTime = this.simTime;
    } // END if (this.simTime >= this.oldSimTime + 2 * resTime)
  } // END method checkForSteadyState()

} // END OF OBJECT controller
