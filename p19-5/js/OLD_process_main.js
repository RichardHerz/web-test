// by Richard K. Herz of www.ReactorLab.net
// 2015

// this file contains the main simulation functions
// see file process_units.js for definitions of the process units

var resetFlag // after openThisLab value is set by function resetThisLab and button in UI
var gRunner = false; // controlled by function runThisLab and RUN/PAUSE button

// ------------------- GENERAL FUNCTIONS ----------------------

	// DISPLAY INITIAL STATE ON OPEN WINDOW
	window.onload = openThisLab;

	function openThisLab(){
		resetFlag = 1; // 0 for no reset, 1 for reset lab
		updateProcessUnits(resetFlag);
		updateDisplay(resetFlag);
		resetFlag = 0; // 0 for no reset, 1 for reset lab
	} // END OF function openThisLab

	function runSimulation(){

		// CALLED BY function runThisLab ON CLICK OF RUN-PAUSE BUTTON

		// HERE, THE INTEGRATION TIME STEP SIZE MUST BE CONSTANT WITHIN ONE DISPLAY
		// INTERVAL TO MAINTAIN CORRESPONDENCE BETWEEN SIM TIME AND REAL TIME
		// FOR A DIFFERENT CASE WHERE THE INTEGRATION TIME STEP SIZE CAN VARY
		// BETWEEN updateProcessUnits YOU NEED
		// THE MORE COMPLEX TIMING METHOD USED IN dynamic-process-v2.livecode

		var updateDisplayTimingMs = 250; // milliseconds between calls to updateDisplay
 		var startDate = new Date(); // need this here
 		var startMs;
 		var currentMs;
		var elapsedMs;
 		var updateMs;

		// first call to updateProcess, which then calls itself
		// use setTimeout - updateProcess by itself does not work
 		setTimeout(updateProcess, 0);

		function updateProcess(){

			if (!gRunner) {
				// exit if gRunner is not true
				// gRunner can become not true by click of RUN-PAUSE or RESET buttons
				return;
			}

			// get time at start of repeating updateProcessUnits
			startDate = new Date(); // need this here
			startMs = startDate.getTime();

			// repeating updateProcessUnits must finish before
			// latest real time at which updateDisplay must occur in order
			// to maintain correspondence between sim time and real time

			// use stepRepeats = sim time interval of display / step size dt
			var stepRepeats = 40;
			for (k = 0; k < stepRepeats; k++){
				updateProcessUnits(resetFlag);
			}

			// get time at end of repeating updateProcessUnits and call
			// to updateDisplay from updateDisplay function return value
			currentMs = updateDisplay(resetFlag);

			// adjust wait until next updateProcess
			// for time taken to do updateProcessUnits and updateDisplay
			elapsedMs = currentMs - startMs;
			updateMs = updateDisplayTimingMs - elapsedMs;

			// END updateProcess WITH CALL TO ITSELF AFTER WAIT
			setTimeout(updateProcess, updateMs);

		} // END OF function updateProcess (inside function runSimulation)

	} // END OF function runSimulation

	function updateProcessUnits(resetFlag){
		// DO COMPUTATIONS TO UPDATE STATE OF PROCESS
		// step all units but do not display

		// WARNING: DO NOT CHANGE dt BETWEEN displayUpdate's
		var dt = 0.1;

		for (i = 1; i <= numUnits; i++) {
			// construct unit name
			unitName = unitNameBase + i.toString();
			if (resetFlag){
				eval(unitName +'.reset();');
			}
			eval(unitName + '.dt = dt;'); // units use this dt, not their default dt
			eval(unitName +'.step();');
		}

	} // END OF updateProcessUnits

	function updateDisplay(resetFlag){

		// display all units but do not step

		for (i = 1; i <= numUnits; i++) {
			// construct unit name
			unitName = unitNameBase + i.toString();
			if (resetFlag){
				eval(unitName +'.reset();');
			}
			eval(unitName + '.display();');
		}

		// get and plot the data
		var data = getPlotData(resetFlag);
		plotPlotData(data);

		// RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
		var thisDate = new Date();
		var thisMs = thisDate.getTime();
 		return thisMs

	}  // END OF function updateDisplay

	function updateUIparams(){
		// Update all user-entered inputs from UI to ALL units.
		// Alternative: in HTML input tag onchange, send unit_#.updateUIparams()
		// to specific unit # involved in that input
		for (i = 1; i <= numUnits; i++) {
			// construct unit name
			unitName = unitNameBase + i.toString();
			// update user-entered inputs to each unit
			eval(unitName +'.updateUIparams();');
		}
	}  // END OF function updateUIparams
