function puWaterController(pUnitIndex) {
  // constructor function for process unit

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit Water Controller';

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    inputs[0] = processUnits[1].level; // level in water tank unit
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
  this.processVariable = 0;
  this.setPoint = 0;
  this.gain = 0; // controller gain
  this.resetTime = 0; // controller reset time
  this.command = 0; // controller command from this controller unit
  this.errorIntegral = 0;

  this.ssCheckSum = 0;
  this.residenceTime = 0;

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // input field ID's
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  this.initialize = function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'set point';
    this.dataInputs[v] = 'input_field_enterSetpoint';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataInitial[v] = 1;
    this.setPoint = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.setPoint; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'gain';
    this.dataInputs[v] = 'input_field_enterGain';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 20;
    this.dataInitial[v] = 5;
    this.gain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.gain; // current input oalue for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'reset time';
    this.dataInputs[v] = 'input_field_enterResetTime';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 20;
    this.dataInitial[v] = 2;
    this.resetTime = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.resetTime; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    v = 3;
    this.dataHeaders[v] = 'command';
    this.dataUnits[v] =  '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    //
  } // END of initialize() method

  this.reset = function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams to initial settings
    
    this.command = 0;
    this.errorIntegral = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // setPoint, command
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.setPoint = this.dataValues[0] = interface.getInputValue(unum, 0);
    this.gain = this.dataValues[1] = interface.getInputValue(unum, 1);
    this.resetTime = this.dataValues[2] = interface.getInputValue(unum, 2);

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
    this.processVariable = inputs[0]; // level in water tank unit

  } // END of updateInputs() method

  this.updateState = function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    // compute new value of PI controller command
    let error = this.setPoint - this.processVariable
    this.command = this.gain * (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup

    let cMax = 1;
    let cMin = 0;

    if (this.command.value > cMax) {
      this.command.value = cMax;
    } else if (this.command.value < cMin) {
      this.command.value = cMin;
    } else {
      // not at limit, OK to update integral of error
      // update errorIntegral only after it is used above to update this.command.value
      this.errorIntegral = this.errorIntegral + error * this.unitTimeStep;
    }

  } // END of updateState() method

  this.updateDisplay = function() {

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle setPoint
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.setPoint] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle command
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.command] );
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
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // this.ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puWaterController
