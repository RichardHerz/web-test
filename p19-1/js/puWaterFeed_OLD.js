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
