function puWaterFeed(pUnitIndex) {
  // constructor function for process unit

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit Water Feed';

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    return inputs;
  }

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  this.profileData = []; // for profile plots, plot script requires this name
  // this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables
  this.ssCheckSum = 0; // used in checkForSteadyState() method 
  this.flowRate = 0; // feed to first reactor

  this.initialize = function() {
  } // END of initialize() method

  this.reset = function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // conc, conversion
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    // SPECIAL CASE - this will be points vs. feed conc so do not fill points
    let numProfileVars = 2; // conversion, rate
    let numProfilePts = 0; // 0+1 points will be filled here
    this.profileData = plotter.initPlotData(numProfileVars,numProfilePts);
    // SPECIAL CASE - move initial [0,0] x,y points off plots
    // order of 3 indices is var, point, x-y
    this.profileData[0][0][0] = -1;
    this.profileData[0][0][1] = -1;
    this.profileData[1][0][0] = -1;
    this.profileData[1][0][1] = -1;
    // console.log('reset, this.profileData[0] = ' + this.profileData[0]);
    // console.log('reset, this.profileData[1] = ' + this.profileData[1]);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {
  } // END of updateUIparams() method

  this.updateInputs = function() {
  } // END of updateInputs() method

  this.updateState = function() {
  } // END of updateState() method

  this.updateDisplay = function() {
  } // END of updateDisplay() method

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    let ssFlag = false;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puWaterFeed
