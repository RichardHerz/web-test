function puCSTR(pUnitIndex) {
  // constructor function for CSTR process units

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit CSTR constructor';

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    inputs[0] = processUnits[this.unitIndex - 1]['conc'];
    return inputs;
  }

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name

  // // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // // SEE dataInputs array in initialize() method for input field ID's
  //
  // // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',
  //
  // // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***
  //
  // // define main inputs
  // // values will be set in method intialize()
  // // *** e.g., Kf300 : 0, // forward rate coefficient value at 300 K
  //
  // // define arrays to hold info for variables
  // // these will be filled with values in method initialize()
  // dataHeaders : [], // variable names
  // dataInputs : [], // input field ID's
  // dataUnits : [],
  // dataMin : [],
  // dataMax : [],
  // dataInitial : [],
  // dataValues : [],
  //
  // // define arrays to hold output variables
  // // these will be filled with initial values in method reset()
  // // *** e.g., Trxr : [],
  //
  // // define arrays to hold data for plots, color canvas
  // // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  // colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 10;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables which will not be plotted nor saved in copy data table
  this.conc = 0;

  this.ssCheckSum = 0; // used to check for steady state
  this.residenceTime = 100; // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  this.initialize = function() {
    //
    // let v = 0;
    // this.dataHeaders[v] = 'Kf300';
    // this.dataInputs[v] = 'input_field_Kf300';
    // this.dataUnits[v] = 'm3/kg/s';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 1;
    // this.dataInitial[v] = 1.0e-7;
    // this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    // this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // *** use v-1 here since TinHX only used to initialize & reset plots

    // to use this prob have to define this.VarCount above this function first...
    // this.VarCount = v-1;

    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //

  } // END initialize method

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

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

    this.conc = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 1; // conc
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    let kn = 0;
    for (k = 0; k <= numStripPts; k += 1) {
      kn = k * simParams.simTimeStep * simParams.simStepRepeats;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable in plot data array
      this.stripData[0][k][0] = kn;
      // y-axis values
      this.stripData[0][k][1] = 0;
    }

    // update display
    this.updateDisplay();

  } // end reset

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    // *** e.g., this.Kf300 = this.dataValues[0] = interface.getInputValue(unum, 0);

  } // END of updateUIparams()

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.concIn = inputs[0]; // conc from upstream CSTR

    // console.log('updateInputs, CSTR = ' + this.unitIndex + ', concIn = ' + this.concIn);

  } // END of updateInputs()

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    let flowrate = 1;
    let volume = 100;
    let krate = 0.001;

      // this unit may take multiple steps within one outer main loop repeat step
    for (let i = 0; i < this.unitStepRepeats; i += 1) {
      let dcdt = flowrate/volume * (this.concIn - this.conc) - krate * this.conc;
      this.conc = this.conc + dcdt * this.unitTimeStep;
    }

    // console.log('leave updateState, CSTR = ' + this.unitIndex + ', conc = ' + this.conc);

  } // END of updateState()

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 1; // only the variables from this unit

    // handle reactor conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.conc] );
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

  } // END of updateDisplay()

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // *** RXR NOT USED TO CHECK FOR SS IN THIS LAB - HX is checked ***
    //
    let ssFlag = false;
    return ssFlag;
  } // END OF checkForSteadyState()

} // END puCSTR
