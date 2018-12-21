function puBioReactor(pUnitIndex) {
  // constructor function for process unit

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit Bioreactor';

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    inputs[0] = processUnits[0].flowRate; // input flowRate from feed
    inputs[1] = processUnits[2].command; // command from controller
    return inputs;
  }

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  this.displayReactorContents = "#div_PLOTDIV_reactorContents";

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables
  this.ssCheckSum = 0; // used in checkForSteadyState() method
  this.flowRate = 0; // input flow rate from feed unit
  this.level = 0; // water level in this tank
  this.command = 0; // command from controller

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // input field ID's
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  this.initialize = function() {
    //
    v = 0;
    this.dataHeaders[v] = '';
    this.dataInputs[v] = '';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 0;
    this.dataInitial[v] = 0;
    this.temp = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.temp; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    // v = 1;
    this.dataHeaders[v] = 'Water Level';
    this.dataUnits[v] =  '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
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

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.flowRate = inputs[0]; // input water flow rate from feed unit
    this.command = inputs[1]; // command from controller unit

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

    // compute new value of level
    // here have normally open valve
    // increasing command to valve results in decreasing valve coefficient

    let Ax = 10; // cross sectional area of tank
    let maxValveCoeff = 3;
    let newCoef = maxValveCoeff*(1 - this.command);

    if (newCoef > maxValveCoeff) {
      newCoef = maxValveCoeff;
    }
    if (newCoef < 0) {
      newCoef = 0;
    }

    let exprValue = (this.level +
      this.unitTimeStep / Ax * (this.flowRate - newCoef * Math.pow(this.level,0.5)));

    // make sure within limits
    // see puWaterController function updateInputs, maxSPvalue, minSPvalue
    if (exprValue > 2){exprValue = 2}
    if (exprValue < 0){exprValue = 0}

    // set new value
    this.level = exprValue;

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // SET LEVEL OF WATER IN TANK
    //    css top & left sets top-left of water rectangle
    //    from top of browser window - can't use css bottom because
    //    that is from bottom of browser window (not bottom rect from top window)
    //    and bottom of browser window can be moved by user,
    //    so must compute new top value to keep bottom of water rect
    //    constant value from top of browser window
    let pixPerHtUnit = 48; // was 50
    let newHt = pixPerHtUnit * this.level;
    let origBtm = this.displayWaterDivBottom;
    let el = document.querySelector(this.displayWaterDiv);
    el.style.height = newHt + "px";
    el.style.top = (origBtm - newHt) + "px";

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 1; // only the variables from this unit

    // handle level
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.level] );
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

} // END of puBioReactor
