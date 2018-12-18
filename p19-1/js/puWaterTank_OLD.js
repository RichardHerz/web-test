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
