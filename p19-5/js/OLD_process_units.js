// by Richard K. Herz of www.ReactorLab.net
// 2015

// this file contains definitions of the process units
// see file process_main.js for the main simulation scripts

// numUnits value needs to agree with number units defined below
var numUnits = 3;

// CSTR bioreactor with one substrate (reactant) and one biomass culture
// units will be:
// (1) reactor feed, (2) reactor, (3) controller
// IF CHANGE THIS LIST EDIT EVERYWHERE BELOW
// controlled variable is biomass conc, manipulated variable is substrate feed conc

var unitNameBase = 'unit_';
var unitName;

var gMinSetValue = 1.0203040504030201e-230; // special value not 0 (-230 for all digits to display)

// ----------------- PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE FOUR FUNCTIONS:
//   reset, updateUIparams, step, display
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// unit_1 - reactor feed - OBJECT DEFINITION
var unit_1 = {
  //
  // unit_1 IS REACTOR FEED
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_1 USES unit_3.command << controller command, substrate conc here
  //   unit_1 USES unit_3.mode << controller mode
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_2 USES unit_1.conc << substrate conc
  //   unit_2 USES unit_1.rate << flow rate
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt          : 0.1, // (hr), default time step size, dt changed by process_main.js

  initialRate : 0.02, // (m3/s), feed flow rate
  rate        : this.initialRate, // (m3/s), feed flow rate
  rateNEW	    : this.initialRate,

  initialConc : 1,
  conc        : this.initialConc, // substrate (reactant) conc
  concNEW     : this.initialConc,

  reset : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // this updates input parameters from UI controls and UI input fields only
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    // (1) enterFeedConc, enterFeedTTemp, enterFeedFlowRate

    this.rateNEW = Number(enterFeedFlowRate.value);

    // *** FEED CONC has to be updated in step because may be
    // *** changing every step due to auto control mode

  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    //   unit_1 USES unit_3.command << controller command, substrate conc here
    //   unit_1 USES unit_3.mode << controller mode
    command  = unit_3.command;
    mode = unit_3.mode;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP
    this.rate = this.rateNEW || this.initialRate;
    this.conc = this.concNEW || this.initialConc;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    // this IF block not needed since both cases do same thing, currently,
    // but keep here for later flexibility
    if (mode == "manual"){
      // in controller manual mode
      this.concNEW = command; // GET SUBSTRATE CONC FROM CONTROLLER
      // document.getElementById("demo01").innerHTML = "MANUAL unit_1.concNEW = " + this.concNEW;
      // document.getElementById("demo02").innerHTML = "--";
    } else {
      // in controller auto mode
      this.concNEW = command // GET SUBSTRATE CONC FROM CONTROLLER
      // document.getElementById("demo01").innerHTML = "--";
      // document.getElementById("demo02").innerHTML = "AUTO this.concNEW  = " + this.concNEW; // this.concNEW;
    }

  }, // end step method

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
  } // end display method

}; // END var unit_1

// unit_2 - reactor - OBJECT DEFINITION
var unit_2 = {
  //
  // unit_2 IS REACTOR
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_2 USES unit_1.rate
  //   unit_2 USES unit_1.conc
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_5 USES unit_2.biomass
  // (1) reactor feed, (2) reactor, (3) controller

  vol				: 0.1, // (m3), volume of reactor contents = constant with flow rate

  dt				: 0.1, // (hr), default time step size, dt changed by process_main.js

  initialConc     : 0.3, // (kg/m3), substrate (reactant) concentration
  initialBiomass  : 1.322, // (kg/m3)

  conc       : this.initialConc, // (kg/m3), reactant concentration
  concNEW    : this.initialConc,
  biomass    : this.initialBiomass,
  biomassNEW : this.initialBiomass,

  MUmax     : 0.3, // default values
  Ks        : 1.75,
  Vmin      : 0.01,
  VA        : 0.03,
  VP        : 0.6,

  reset : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.conc = this.initialConc;
    this.concNEW = this.initialConc;
    this.biomass = this.initialBiomass;
    this.biomassNEW = this.initialBiomass;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // this updates input parameters from UI controls and UI input fields only
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);

    this.MUmax = Number(enterMUmax.value);
    this.Ks = Number(enterKs.value);
    this.Vmin = Number(enterVmin.value);
    this.Va = Number(enterVa.value);
    this.Vp = Number(enterVp.value);
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    //   unit_2 USES unit_1.rate
    //   unit_2 USES unit_1.conc
    feedRate = unit_1.rate;
    feedConc = unit_1.conc;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP
    this.conc = this.concNEW || this.initialConc;
    this.biomass = this.biomassNEW || this.initialBiomass;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    var G = this.MUmax * this.conc / (this.Ks + this.conc); // biomass growth rate
    var Y = (this.Vmin + this.Va * this.conc); // partial yield function
    Y = Math.pow(Y,this.Vp); // complete yield function
    var D = feedRate / this.vol; // dilution rate = space velocity

    var dCdt = D * (feedConc - this.conc) - (G / Y) * this.biomass;
    var dC = this.dt * dCdt;
    var newConc = this.conc + dC;

    var dBdt = (G - D) * this.biomass;
    var dB = this.dt * dBdt;
    var newBiomass = this.biomass + dB;

    if (newConc <= 0){newConc = gMinSetValue;}  // if value = 0 then set to special small value
    if (newBiomass <= 0){newBiomass = gMinSetValue;}  // if value = 0 then set to special small value

    this.concNEW = newConc || this.initialConc;
    this.biomassNEW = newBiomass || this.initialBiomass;

  }, // end step method

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
    var el = document.querySelector("#reactorContents");

    var colorMax = 240;
    var biomassMax = 40;
    var cValue = Math.round((this.biomass)/biomassMax * colorMax);
    var concR = colorMax - cValue;
    var concG = colorMax;
    var concB = colorMax - cValue;;

    var concColor = "rgb(" + concR + ", " + concG + ", " + concB + ")";
    // alert("concColor = " + concColor); // check results
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;
  } // end display method

}; // END var unit_2

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
