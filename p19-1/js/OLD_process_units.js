// by Richard K. Herz of www.ReactorLab.net
// 2015, 2016

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units
// For functions that use these objects, see files
// process_main.js and process_plotter.js.

// ----- OBJECT TO CONTAIN & SET SIMULATION & PLOT PARAMETERS ---------

var simParams = {
  runButtonID : "button_runButton_1158", // for functions to run, reset, copy data
  loggerURL : "../webAppRunLog.lc",
  runningFlag : false, // set runningFlag to false initially
  // all units will use simParams.dt, getting it at each step in unit updateInputs()
  // see method simParams.changeDtByFactor() below to change dt value
  dt : 0.1, // (s), time step value, simulation time
  stepRepeats : 10, // number of process unit updates between display updates
  updateDisplayTimingMs : 200, // real time milliseconds between display updates

  // LIST ACTIVE PROCESS UNITS
  // processUnits array is the list of names of active process units
  // the order of units in the list is not important

  processUnits : [
    "puWaterSource",
    "puWaterTank",
    "puController"
  ],

  // SET PLOT PARAMETERS for use in file process_plotter.js

  // LIST PROCESS VARIABLES TO PLOT AND COPY-SAVE DATA
  // these variables must be defined in units as variable objects
  // [process unit object name, variable object name, left or right plot y axis, and "show" or "hide"],
  // list plot variables in order you want to appear in save-copy data columns
  // e.g. ["puWaterSource", "flowRate", "left", "show"] >> show puWaterSource.flowRate on left y axis
  // "hide" variables will still be listed in copy-save data

  plotVariables: [
    ["puWaterSource", "flowRate", "left", "show"],
    ["puWaterTank", "level", "right", "show"],
    ["puController", "setPoint", "right", "hide"],
    ["puController", "command", "right", "show"]
  ],

  // get plotCanvasHtmlID from HTML file
  plotCanvasHtmlID : "#div_plotCanvas_1169",
  numPlotPoints : 60,
  xAxisLabel : "Time (s)",
  // x-axis min is 0.0
  // x-axis max is computed from dt, stepRepeats, & plotPoints

  yLeftAxisLabel : "Inlet Flow Rate",
  yLeftAxisMin : 0.0,
  yLeftAxisMax : 3.0,

  yRightAxisLabel : "Water Level - Controller Command",
  yRightAxisMin : 0.0,
  yRightAxisMax : 2.0,

  plotLegendPosition : "nw", // e.g., nw = north (top) west (left)

  // runningFlag value can change by click of RUN-PAUSE or RESET buttons
  // calling functions toggleRunningFlag and stopRunningFlag

  toggleRunningFlag : function() {
    this.runningFlag = !this.runningFlag;
  },

  stopRunningFlag : function() {
    this.runningFlag = false;
  },

  changeDtByFactor : function(factor) {
    // WARNING: do not change dt except immediately before or after a display update
    // in order to maintain sync between sim time and real time
    this.dt = factor * this.dt;
  }

}; // END var simParams

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE FOUR FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

var puWaterSource = {
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puWaterSource.flowRate.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  inputFlowRate : "range_enterFlowRate_slider_1172",
  inputFlowRateReadout: "field_enterFlowRate_value_1159", // updateUIparams writes to this field
  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  //   no user entered values for this unit
  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE EXCEPT simParams.dt ----

  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent
  initialFlowRate : 0.2, // default initial flow rate of water

  // define the main variables which will not be plotted or save-copy data
  dt : 0.1, // default time step, changed below in updateInputs size

  // variables to be plotted are defined as objects
  // with the properties: value, name, label, symbol, dimensional units
  // name used for copy-save data column headers, label for plot legend
  flowRate : {
    value  : this.initialFlowRate,
    name   : "flow rate",
    label  : "flow rate",
    symbol : "v0",
    units  : "(m<sup>3</sup>/s)"
  },

  reset : function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings
    //   none here
  },

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value

    if (document.getElementById(this.inputFlowRate)) {
      let tmpFunc = new Function("return " + this.inputFlowRate + ".value;");
      this.flowRate.value = tmpFunc();
    } else {
      this.flowRate.value = this.initialFlowRate;
    }

    // updateUIparams is called by range slider when it moves so it
    // also need to update the flow rate readout field
    if (document.getElementById(this.inputFlowRateReadout)) {
      document.getElementById(this.inputFlowRateReadout).innerHTML = this.flowRate.value;
    }

  },

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //
    this.dt = simParams.dt; // all units need to use same dt
    //
    // The following TRY-CATCH structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    //   none for this unit
  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    //    nothing to do here for this unit
  },

  display : function() {
    // document.getElementById("dev01").innerHTML = "puWaterSource.flowRate.value = " + this.flowRate.value;
  }

}; // END var puWaterSource

// ----------------------------------------------------------------------------

var puWaterTank = {
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puController USES puWaterTank.level.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  inputFlowRate : "puWaterSource.flowRate.value",
  inputCommand : "puController.command.value",
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //   no user entered values for this unit
  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayWaterDiv : "#div_water_1170",
  // displayWaterDivBottom = SUM orig CSS file specs of top+height pixels for water div
  displayWaterDivBottom : 448, // PIXELS, bottom of html water div IN PIXELS
  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE EXCEPT simParams.dt ----

  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent
  initialLevel : 0, // initial level of water in level units
  initialFlowRate : 1.0, // default inlet flow rate
  initialCommand  : 0, // default command to valve from controller

  // define the main variables which will not be plotted or save-copy data
  dt : 0.1, // default time step, changed below in updateInputs size
  Ax   : 10, // cross sectional area of tank
  coef : 1, // valve flow coefficient, Cv*(rho*g/gc)^0.5
  flowRate : this.initialFlowRate,
  command  : this.initialCommand,

  // variables to be plotted are defined as objects
  // with the properties: value, name, label, symbol, dimensional units
  // name used for copy-save data column headers, label for plot legend
  level : {
    value  : this.initialLevel,
    name   : "level",
    label  : "level",
    symbol : "L",
    units  : "(m)"
  },

  reset : function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings
    this.level.value = this.initialLevel;
  },

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    //   no user entered values for this unit
  },

  updateInputs : function() {
    //
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //
    this.dt = simParams.dt; // all units need to use same dt
    //
    // The following TRY-CATCH structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value

    try {
      let tmpFunc = new Function("return " + this.inputFlowRate + ";");
      this.flowRate = tmpFunc();
      // note: can't test for definition of this.inputVAR because any
      // definition is true BUT WHEN try to get value of bad input
      // to see if value is undefined then get "uncaught reference" error
      // that the value of the bad input specified is undefined,
      // which is why use try-catch structure here
    }
    catch(err) {
      this.flowRate = this.initialFlowRate;
    }

    try {
      let tmpFunc = new Function("return " + this.inputCommand + ";");
      this.command = tmpFunc();
      // note: can't test for definition of this.inputVAR because any
      // definition is true BUT WHEN try to get value of bad input
      // to see if value is undefined then get "uncaught reference" error
      // that the value of the bad input specified is undefined,
      // which is why use try-catch structure here
    }
    catch(err) {
      this.command = this.initialCommand;
    }

  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    // compute new value of level
    // here have normally open valve
    // increasing command to valve results in decreasing valve coefficient

    var maxValveCoeff = 3;

    var newCoef = maxValveCoeff*(1 - this.command);

    if (newCoef > maxValveCoeff) {
      newCoef = maxValveCoeff;
    }
    if (newCoef < 0) {
      newCoef = 0;
    }

    var exprValue = (this.level.value +
      this.dt / this.Ax * (this.flowRate - newCoef * Math.pow(this.level.value,0.5)));

    // make sure within limits
    // see puController function updateInputs, maxSPvalue, minSPvalue
    if (exprValue > 2){exprValue = 2}
    if (exprValue < 0){exprValue = 0}

    // set new value
    this.level.value = exprValue;

  }, // end updateState method

  display : function() {
    // document.getElementById("dev01").innerHTML = "puWaterTank.level.value = " + this.level.value;
    // set level of div that represents water in tank
    //    css top & left sets top-left of water rectangle
    //    from top of browser window - can"t use css bottom because
    //    that is from bottom of browser window (not bottom rect from top window)
    //    and bottom of browser window can be moved by user,
    //    so must compute new top value to keep bottom of water rect
    //    constant value from top of browser window
    var pixPerHtUnit = 48; // was 50
    var newHt = pixPerHtUnit * this.level.value;
    var origBtm = this.displayWaterDivBottom;
    var el = document.querySelector(this.displayWaterDiv);
    el.style.height = newHt + "px";
    el.style.top = (origBtm - newHt) + "px";
  }

}; // END var puWaterTank

// ----------------------------------------------------------------------------

var puController = {
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puController.command.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  inputPV : "puWaterTank.level.value", // PV = Process Variable value to be controlled
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  inputSetPoint : "input_field_enterSetpoint_1164",
  inputGain : "input_field_enterGain_1168",
  inputResetTime : "input_field_enterResetTime_1166",
  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  //   no user entered values for this unit
  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE EXCEPT simParams.dt ----

  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent
  initialPV : 0.5, // default measured value of process variable PV
  initialSetPoint  :  0.5, // default desired value of process variable PV
  initialCommand   :  0, // default controller command
  initialGain      :  4, // default controller gain
  initialResetTime :  1, // default integral mode reset time
  initialErrorIntegral : 0,

  // define the main variables which will not be plotted or save-copy data
  dt : 0.1, // default time step, changed below in updateInputs
  PV : this.initialPV, // process variable being controlled
  gain      : this.initialGain, // controller gain
  resetTime : this.initialResetTime, // integral mode reset time
  errorIntegral : this.initialErrorIntegral,

  // variables to be plotted are defined as objects
  // with the properties: value, name, label, symbol, dimensional units
  // name used for copy-save data column headers, label for plot legend
  setPoint : {
    value  : this.initialSetPoint,
    name   : "set point",
    label  : "set point",
    symbol : "sp",
    units  : "(m)"
  },
// xxx want to eliminate dimensional units in puController & use 0-1 or 0-100%
//    should get a range for level from puWaterTank, have this setPoint
//    go from 0-1, then compute here actual set point to use...
//    or have 0-1 variable in puWaterTank for output...

  command : {
    value  : this.initialCommand,
    name   : "controller command", // for copy-save data
    label  : "command",  // for plot legend
    symbol : "cc",
    units  : "(0-1)"
  },

  reset : function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings
    this.command.value = this.initialCommand;
    this.errorIntegral = this.initialErrorIntegral;
  },

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value

    if (document.getElementById(this.inputSetPoint)) {
      let tmpFunc = new Function("return " + this.inputSetPoint + ".value;");
      this.setPoint.value = tmpFunc();
      // add input validation
      var maxSPvalue = 2;
      var minSPvalue = 0;
      if (this.setPoint.value > maxSPvalue){
        this.setPoint.value = maxSPvalue;
        document.getElementById(this.inputSetPoint).value = maxSPvalue;
      }
      if (this.setPoint.value < minSPvalue){
        this.setPoint.value = minSPvalue;
        document.getElementById(this.inputSetPoint).value = minSPvalue;
      }
    } else {
      this.setPoint.value = this.initialSetPoint;
    }

    if (document.getElementById(this.inputGain)) {
      let tmpFunc = new Function("return " + this.inputGain + ".value;");
      this.gain = tmpFunc();
    } else {
      this.gain = this.initialGain;
    }

    if (document.getElementById(this.inputResetTime)) {
      let tmpFunc = new Function("return " + this.inputResetTime + ".value;");
      this.resetTime= tmpFunc();
    } else {
      this.resetTime = this.initialGain;
    }

  },

  updateInputs : function() {
    //
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //
    this.dt = simParams.dt; // all units need to use same dt
    //
    // The following TRY-CATCH structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value

    try {
      let tmpFunc = new Function("return " + this.inputPV + ";");
      this.PV = tmpFunc();
      // note: can't test for definition of this.inputVAR because any
      // definition is true BUT WHEN try to get value of bad input
      // to see if value is undefined then get "uncaught reference" error
      // that the value of the bad input specified is undefined,
      // which is why use try-catch structure here
    }
    catch(err) {
      this.PV = this.initialPV;
    }

  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    // compute new value of PI controller command
    var error = this.setPoint.value - this.PV;
    this.command.value = this.gain * (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup

    var cMax = 1;
    var cMin = 0;

    if (this.command.value > cMax) {
      this.command.value = cMax;
    } else if (this.command.value < cMin) {
      this.command.value = cMin;
    } else {
      // not at limit, OK to update integral of error
      // update errorIntegral only after it is used above to update this.command.value
      this.errorIntegral = this.errorIntegral + error * this.dt;
    }

  }, // end updateState method

  display : function() {
    // document.getElementById("dev01").innerHTML = "puController.command.value = " + this.command.value;
  }

}; // END var puController
