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
  // function interfacer.runThisLab() USES FROM THIS OBJECT method updateProcess()
  //
  // USES in object interfacer the function interfacer.resetThisLab()
  //
  // USES in object simParams the following:
  //    variables simStepRepeats, simTimeStep, updateDisplayTimingMs
  //    function updateCurrentRunCountDisplay()
  //    controller's changeSimTimeStep() can change simParams.simTimeStep
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
  // ssFlag set to false in runThisLab() and resetThisLab() in interfacer object
  // ssFlag set to false by updateUIparams() in each process unit
  ssFlag : false,
  // ssStartTime is time when first reach steady state
  // used to keep computing & plotting until any strip plots go flat
  // for which stripPlotSpan is also used
  ssStartTime : 0,
  stripPlotSpan : 5000,

  openThisLab : function() {
    // initialize variables in each process unit
    // the order of the numeric index of process units does not affect the simulation
    let numUnits = Object.keys(processUnits).length; // number of units
    for (let n = 0; n < numUnits; n += 1) {
      processUnits[n].initialize();
    }
    // initialize plotInfo to define plots after initialize units
    //    in order to allow plotInfo to use values from units,
    //    e.g., dataUnits of output vars
    plotInfo.initialize();
    // initialize plot arrays after initialize plotInfo
    plotter.plotArrays.initialize();
    interfacer.resetThisLab(); // defined in process_interfacer.js
    simParams.updateCurrentRunCountDisplay(); // defined in process_sim_params.js
  }, // END OF function openThisLab

  updateProcess : function() {

    console.log('enter updateProcess, controller.runningFlag = ' + controller.runningFlag);

    // if (!controller.runningFlag) {
    //   console.log('runningFlag FALSE in updateProcess');
    //   // exit if runningFlag is not true
    //   // runningFlag can become not true by click of RUN-PAUSE, RESET or COPY DATA buttons
    //   return;
    // }

    // update simTime = simulation time elapsed
    // done before simStepRepeats of all units, so
    // simTime update each time is simTimeStep * simStepRepeats
    controller.updateSimTime();

    // do NOT return here when ssFlag goes true at steady statement
    // because then simTime will not update since this function will not call itself again
    // DO return at top of updateProcessUnits and updateDisplay which are called below here
    // such that this updateProcess function always completes normally and calls itself again

    // // get time at start of repeating updateProcessUnits
    // let startDate = new Date(); // need this here
    // let startMs = startDate.getTime();

    // repeating updateProcessUnits must finish before
    // latest real time at which updateDisplay must occur in order
    // to maintain correspondence between sim time and real time
    //

    for (let i = 0; i < simParams.simStepRepeats; i += 1) {
      controller.updateProcessUnits();
    }

    // get time at end of repeating updateProcessUnits and call
    // to updateDisplay from updateDisplay function return value
    let currentMs = controller.updateDisplay();

    // // Adjust wait until next updateProcess to allow for time taken
    // // to do updateProcessUnits and updateDisplay.
    // // In order to respond to user input, do not need updateMs > 0.
    // // BUT DO NEED updateMs > 0 to keep sync between sim time and real time.
    // let elapsedMs = currentMs - startMs;
    // updateMs = simParams.updateDisplayTimingMs - elapsedMs;
    //
    // // DISPLAY TIMING DATA DURING DEVELOPMENT
    // let idleMs = Number(updateMs).toPrecision(2);
    // console.log("idle time = " + idleMs);
    // // // NEED TO EDIT INDEX.HTML TO ACTIVATE "field_output_field"
    // // // first check if field exists
    // // if (document.getElementById("field_output_field")) {
    // //   document.getElementById("field_output_field").innerHTML = "idle time = " + idleMs + "&nbsp;ms";
    // // }

    console.log('leave updateProcess, controller.runningFlag = ' + controller.runningFlag);
  }, // END OF method updateProcess

  updateProcessUnits : function() {

    console.log('enter updateProcessUnits');

    // DO COMPUTATIONS TO UPDATE STATE OF PROCESS
    // step all units but do not display

    if (controller.ssFlag) {
      // exit if ssFlag true
      return;
    }

    let numUnits = Object.keys(processUnits).length; // number of units

    // FIRST, have all units update their unit input connections
    for (let n = 0; n < numUnits; n += 1) {
      processUnits[n].updateInputs();
    }

    // NOTE: UI params are updated whenever UI changes by HTML input actions

    // SECOND, have all units update their state
    for (let n = 0; n < numUnits; n += 1) {
        processUnits[n].updateState();
    }

console.log('leave updateProcessUnits');

  }, // END OF function updateProcessUnits

  updateDisplay : function() {

  console.log('enter updateDisplay');

    // if (controller.ssFlag) {
    //   // exit if ssFlag true
    //   // ONLY IF DO NOT WANT TO UPDATE DISPLAY - SO MUST BE CONSTANT...
    //   // BUT FIRST MUST DO THIS (also done below at end normal update)
    //   // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
    //   // or, if do not do here, simTime will race ahead
    //   let thisDate = new Date();
    //   let thisMs = thisDate.getTime();
    //   return thisMs;
    // }

    // DISPLAY ALL UNITS BUT DO NOT STEP
    let numUnits = Object.keys(processUnits).length; // number of units
    for (let n = 0; n < numUnits; n += 1) {
      processUnits[n].updateDisplay();
    }

    // UPDATE PLOTS HERE AND NOT IN PROCESS UNITS IN ORDER TO ALLOW
    // PLOTS TO CONTAIN DATA FROM MORE THAN ONE PROCESS UNIT

    // NOTE: UNIT COMPUTATION (updateInputs, updateState) AND
    // GETING PLOT DATA (getPlotData) IS FAST
    // REDRAW OF THE PLOT (plotPlotData) IS SLOW STEP IN MANY SIMULATIONS

    // GET AND PLOT ALL PLOTS defined in object plotInfo
    let numPlots = Object.keys(plotInfo).length;
    numPlots = numPlots - 1; // subtract method initialize(), which is counted in length
    for (let p = 0; p < numPlots; p += 1) {
      let ptype = plotInfo[p]['type'];
      if (ptype == 'canvas') {
        // space-time, color-canvas plot
        plotter.plotColorCanvasPlot(p);
      } else if ((ptype == 'profile') || (ptype == 'strip')) {
        // profile (static x,y) or strip chart (scolling x,y)
        let data = plotter.getPlotData(p);
        plotter.plotPlotData(data,p);
      } else {
        // plotting must be handled by a unit's updateDisplay
        // no plotting here
      }
    }

    // check and set ssFlag to true if at steady state
    // do this here in updateDisplay rather than each process update
    // so that don't suspend before a final display update of the steady state
    controller.checkForSteadyState();

    // // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
    // let thisDate = new Date();
    // let thisMs = thisDate.getTime();
    // return thisMs;

console.log('leave updateDisplay');
    return 0;

  },  // END OF method updateDisplay

  // runningFlag value can change by click of RUN-PAUSE or RESET buttons
  // calling functions toggleRunningFlag and stopRunningFlag
  toggleRunningFlag : function() {
    controller.runningFlag = !controller.runningFlag;
    console.log('toggleRunningFlag to ' + controller.runningFlag);
  },

  stopRunningFlag : function() {
    controller.runningFlag = false;
    console.log('leave stopRunningFlag, controller.runningFlag ' + controller.runningFlag);
  },

  resetSimTime : function() {
    // called by method interfacer.resetThisLab
    controller.simTime = 0;
    controller.resetSSflagsFalse();
  },

  updateSimTime : function() {
    // only updated before simStepRepeats are all executed
    // and only updated once each displayUpdate
    controller.simTime = controller.simTime + simParams.simTimeStep * simParams.simStepRepeats;
  },

  changeSimTimeStep : function(factor) {
    // WARNING: do not change simTimeStep except immediately before or after a
    // display update in order to maintain sync between sim time and real time
    simParams.simTimeStep = factor * simParams.simTimeStep;
  },

  resetSSflagsFalse : function() {
    controller.ssStartTime = 0;
    controller.oldSimTime = 0;
    controller.ssFlag = false; // unit sets true when sim reaches steady state
    controller.stripPlotSpan = controller.getStripPlotSpan();
  },

  getStripPlotSpan : function() {
    let numPlots = Object.keys(plotInfo).length; // number of plots
    numPlots = numPlots - 1; // correct for initialize member of plotInfo
    let span = 0;
    for (let p = 0; p < numPlots; p += 1) {
      if (plotInfo[p]['type'] == 'strip') {
        let xMax = plotInfo[p]['xAxisMax'];
        if (xMax > span) {span = xMax}
      }
    }
    return span;
  },

  checkForSteadyState : function() {
    // uses controller.simTime
    // sets controller.ssFlag and controller.oldSimTime
    // requires all units to have a residence time variable
    // calls each unit's own checkForSteadyState()
    // see controller's controller.resetSSflagsFalse sent by units' updateUIparams
    //
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    // open OS Activity Monitor of CPU load to see effect of this

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
    if (controller.simTime >= controller.oldSimTime + 2 * resTime) {

      // get ssFlag from each unit
      let thisFlag = true; // changes to false if any unit not at steady state
      let thisCheck = true;
      for (let n = 0; n < numUnits; n += 1) {
        thisCheck = processUnits[n].checkForSteadyState();
        if (thisCheck == false){
          // result returned by unit is not true
          thisFlag = false;
        }
      }

      if (thisFlag == false) {
        controller.ssFlag = false;
        controller.oldSimTime = controller.simTime;
        controller.ssStartTime = 0;
      } else {
        // all units are at steady state
        if (controller.stripPlotSpan == 0) {
          // no strip plot in this lab
          // all units at SS
          controller.ssFlag = true;
        } else {
          // lab has a strip plot
          if (controller.ssStartTime == 0) {
            // first time reach SS
            // mark time but keep updating plots
            controller.ssStartTime = controller.simTime;
          } else {
            // has strip plot and has reached SS earlier
            if ((controller.simTime - controller.ssStartTime) >= controller.stripPlotSpan) {
              // has strip plot, reached SS earlier, plot lines should be flat
              controller.ssFlag = true;
            } else {
              // has strip plot, reached SS earlier but keep plotting until flat lines
            }
          }
        }
      }

      // save sim time of this check
      // do not save for every call of this function or will never enter IF & check
      controller.oldSimTime = controller.simTime;

    } else { // ELSE OF if (controller.simTime >= controller.oldSimTime + 2 * resTime)
      // keep running
    } // END if (controller.simTime >= controller.oldSimTime + 2 * resTime)

  } // END method checkForSteadyState()

} // END OF OBJECT controller
