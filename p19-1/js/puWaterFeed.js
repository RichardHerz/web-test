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

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // define variables
  this.ssCheckSum = 0; // used in checkForSteadyState() method
  this.flowRate = 0; // feed to water tank

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // input field ID's
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  // XXX why need these when have them in initialize method???
  // XXX but they are used below if want to eliminate
  // XXX or keep one (input field) in initialize and keep the other here???
  this.inputFeedSlider = 'range_slider_enterFlowRate',
  this.inputFeedInput = 'input_field_enterFlowRate',

  this.initialize = function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'Flow Rate';
    this.dataInputs[v] = 'input_field_enterFlowRate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 3;
    this.dataInitial[v] = 1;
    this.flowRate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.flowRate; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Flow Rate';
    this.dataInputs[v] = 'range_slider_enterFlowRate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 3;
    this.dataInitial[v] = 1;
    this.flowRate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.flowRate; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // this.VarCount = v;
    //
    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //
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
    let numStripVars = 1; // flowRate
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {

    // updateUIparams gets called on page load but not new range and input
    // updates, so need to call updateUIfeedInput here
    this.updateUIfeedInput();
    // console.log('updateUIparams: this.Cmax = ' + this.Cmax);
    //
    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    // SPECIAL for this unit methods updateUIfeedInput and updateUIfeedSlider
    //         below get slider and field value for [0] and [1]

  } // END of updateUIparams() method

  this.updateUIfeedInput = function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element
    // [0] is field, [1] is slider
    // get field value
    let unum = this.unitIndex;
    this.flowRate = this.dataValues[0] = interface.getInputValue(unum, 0);
    // update slider position
    document.getElementById(this.dataInputs[1]).value = this.flowRate;
    // console.log('updateUIfeedInput: this.Cmax = ' + this.flowRate);
  } // END method updateUIfeedInput()

  this.updateUIfeedSlider = function() {
    let unum = this.unitIndex;
    this.flowRate = this.dataValues[0] = interface.getInputValue(unum, 0);
    // update input field display
    // alert('slider: this.conc = ' + this.conc);
    if (document.getElementById(this.inputFeedInput)) {
      document.getElementById(this.inputFeedInput).value = this.flowRate;
    }
    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;
    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;
  } // END method updateUIfeedSlider()

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // no inputs from other units for this unit

  } // END of updateInputs() method

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    // nothing to do for this this feed unit
    // updates handled by updateUIparams

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 1; // only the variables from this unit

    // handle flowRate
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
        // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
      }
    }

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
