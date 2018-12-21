// unit_3 - controller - OBJECT DEFINITION
var unit_3 = {
  //
  // unit_3 IS CONTORLLER
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_3 USES unit_2.biomass - controlled variable
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_1 USES unit_3.mode
  //   unit_1 uses unit_3.command
  // (1) reactor feed, (2) reactor, (3) controller

  dt   :	0.1, // (hr), default time step size, dt changed by process_main.js

  setPoint    :	5, // (kg/m3), desired biomass conc
  gain        :	1, // controller gain
  resetTime   :	10, // integral mode reset time
  manualBias  : 1, // command at zero error
  initialCommand  : 1, // controller command signal
  command     : this.initialCommand,
  commandNEW  : this.initialCommand,
  errorIntegral    :	gMinSetValue, // integral error
  errorIntegralNEW : gMinSetValue,

  mode          : "manual", // auto or manual, see changeMode() below
  manualCommand : 20,

  reset  : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.errorIntegral = gMinSetValue;
    this.errorIntegralNEW = gMinSetValue;
    this.command = this.initialCommand;
    this.commandNEW = this.initialCommand;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  changeMode : function(){
    // below does not work when html input tag id="input.radio_controllerAUTO"
    // use instead id="radio_controllerAUTO" - same for MANUAL & AUTO
    var el = document.querySelector("#radio_controllerAUTO");
    // var el2 = document.querySelector("#enterFeedConc");
    if (el.checked){
      // alert("controller in AUTO mode");
      this.mode = "auto"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      // el2.type = "hidden";
      // document.getElementById("enterFeedConcLABEL").style.visibility = "hidden";

      // TRY FOR "BUMPLESS" TRANSFER FROM MANUAL TO AUTO
      this.manualBias = this.command;

    } else {
      // alert("controller in MANUAL mode");
      this.mode = "manual"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      // el2.type = "input";
      // document.getElementById("enterFeedConcLABEL").style.visibility = "visible";
    }
  }, // end changeMode function

  updateUIparams : function(){
    // this updates input parameters from UI controls and UI input fields only
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    // (5) enterResetTime, enterGain, enterSetpoint
    this.resetTime = Number(enterResetTime.value);
    this.gain = Number(enterGain.value);
    this.setPoint = Number(enterSetpoint.value);
    // at least for input below, value returned is not a number, probably text
    // so convert this and others to numbers
    // noticed problem in process_units copyData function, .toFixed(2) didn't work
    this.manualCommand = Number(enterFeedConc.value);
    // this.changeMode(); // xxx may not want this when reset manualBias in changeMode()
  },

  step	: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    //   unit_3 USES unit_2.biomass - controlled variable
    biomass = unit_2.biomass;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP
    this.command = this.commandNEW || this.initialCommand;
    this.errorIntegral = this.errorIntegralNEW || gMinSetValue;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    // compute new value of PI controller command
    // USING VALUE FROM unit_2, unit_2.biomass
    var error = this.setPoint - biomass;

    // document.getElementById("demo04").innerHTML = "error = " + error;

    this.commandNEW = this.manualBias + this.gain *
                       (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup

    //  change for bioreactor case
    if (this.commandNEW > 40){
      this.commandNEW = 40;
    } else if (this.commandNEW < gMinSetValue){
      this.commandNEW = gMinSetValue;
    } else {
      // not at limit, OK to update integral of error
      this.errorIntegralNEW = this.errorIntegral + error * this.dt; // update integral of error
    }

    if (this.mode == "manual"){
      // replace commandNEW with value entered in input in page
      // var el = document.querySelector("#enterJacketFeedTTemp");
      // this.commandNEW = el.value;
      this.commandNEW = this.manualCommand;
    } else {
      // in auto mode, use commandNEW computed above
    }

  }, // end step method

  display  :  function(){
    // document.getElementById("demo03").innerHTML = "unit_3.mode = " + this.mode;
    // SEE ABOVE FOR LOCAL error
    // document.getElementById("demo05").innerHTML = "unit_3.command = " + this.command;
    // document.getElementById("demo06").innerHTML = "unit_3.manualCommand = " + this.manualCommand;
  } // end display METHOD

}; // END var unit_3
