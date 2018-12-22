function puBioRxrController(pUnitIndex) {
  // constructor function for process unit

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit Bioreactor Controller';

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    // WARNING: make sure html field text for set point var name matches this input!
    inputs[0] = processUnits[1].biomass; // biomass in bioreactor
    // inputs[0] = processUnits[1].conc; // substrate conc in bioreactor
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
  this.manualBias = 0;
  this.command = 0; // controller command from this controller unit
  this.errorIntegral = 0;
  this.mode = "manual"; // auto or manual, see changeMode() below

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
    this.dataMax[v] = 30;
    this.dataInitial[v] = 5;
    this.setPoint = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.setPoint; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'gain';
    this.dataInputs[v] = 'input_field_enterGain';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataInitial[v] = 0.2;
    this.gain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.gain; // current input oalue for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'reset time';
    this.dataInputs[v] = 'input_field_enterResetTime';
    this.dataUnits[v] = 'hr';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 5;
    this.resetTime = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.resetTime; // current input oalue for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'manualCommand';
    this.dataInputs[v] = 'input_field_enterSubstrateFeedConc';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
    this.dataInitial[v] = 15;
    this.manualCommand = this.dataInitial[v];
    this.dataValues[v] = this.manualCommand;
    //
    // SPECIAL - SET CHECKED OF RADIO BUTTONS TO MATCH THIS SETTING
    // PAGE RELOAD DOES NOT CHANGE CHECKED BUT DOES CALL initialize
    document.getElementById("radio_controllerAUTO").checked = false;
    document.getElementById("radio_controllerMANUAL").checked = true;
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // special, use v-1 to not report manualCommand in copy data table header
    // but need manualCommand as input var to get from html input
    this.VarCount = v-1;
    //
    // OUTPUT VARS
    //
    v = 4;
    this.dataHeaders[v] = 'command';
    this.dataUnits[v] =  '';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[3];
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

    // set state variables not set by updateUIparams to initial settings
    this.errorIntegral = 0;
    this.command = this.dataInitial[3]; // initial manual command

    // XXX should this reset mode to manual?

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // setPoint, command
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.changeMode = function(){
    let el = document.querySelector("#radio_controllerAUTO");
    if (el.checked){
      // console.log("switch controller to AUTO mode");
      this.mode = "auto"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "hidden";
      //   document.getElementById("enterJacketFeedTTemp_LABEL").style.visibility = "hidden";
    } else {
      // console.log("switch controller to MANUAL mode");
      this.mode = "manual"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "input";
      //   document.getElementById("enterJacketFeedTTemp_LABEL").style.visibility = "visible";
    }

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

  } // END of changeMode() method

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
    this.manualCommand = this.dataValues[3] = interface.getInputValue(unum, 3);

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
    this.processVariable = inputs[0]; // biomass in bioreactor

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

    // compute new value of PI controller command
    let error = this.setPoint - this.processVariable;

    // console.log('this.setPoint = '+this.setPoint);
    // console.log('this.processVariable = '+this.processVariable);
    // console.log('error = '+error);

    this.command = this.manualBias + this.gain *
                  (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup
    let v = 4; // 4 is command
    if (this.command > this.dataMax[v]){
      this.command = this.dataMax[v];
    } else if (this.command < this.dataMin[v]){
      this.command = this.dataMin[v];
    } else {
      // not at limit, OK to update integral of error
      // update errorIntegral only after it is used above to update this.command
      this.errorIntegral = this.errorIntegral + error * this.unitTimeStep; // update integral of error
    }

    if (this.mode == "manual"){
      // replace command with value entered in input in page
      // let el = document.querySelector("#enterJacketFeedTTemp");
      // this.command = el.value;
      this.command = this.manualCommand;
    } else {
      // in auto mode, use command computed above
    }

    // console.log('this.errorIntegral = '+this.errorIntegral);
    // console.log('this.command = '+this.command);

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
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    let ssFlag = false;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puBioRxrController
