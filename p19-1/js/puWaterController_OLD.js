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
