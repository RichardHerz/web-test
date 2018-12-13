// by Richard K. Herz of www.ReactorLab.net
// 2015

// this file contains definitions of the process units
// see file process_main.js for the main simulation scripts

// *** CHANGE SO JACKET T IS JACKET FEED T SO NO JACKET DYNAMICS

// numUnits value needs to agree with number units defined below
var numUnits = 5;

// essentially irreversible reaction in cstr with heat transfer
// units will be:
// (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller
// IF CHANGE THIS LIST EDIT EVERYWHERE BELOW
// controlled variable is reactor T, manipulated variable is jacket T
// **** NOTE CHANGE SO manipulated variable is jacket T, not jacket feed T

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
  //   none
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_2 USES unit_1.rate
  //   unit_2 USES unit_1.conc
  //   unit_2 USES unit_1.TTemp
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt        : 0.1, // (s), default time step size, dt changed by process_main.js

  initialRate	: 0, // (m3/s), feed flow rate
  rate      : this.initialRate, // (m3/s), feed flow rate
  rateNEW		: this.initialRate,

  initialConc	: 0,
  conc      : this.initialConc,
  concNEW		: this.initialConc,

  initialTTemp	: 300, // (K), TTemp = temperature
  TTemp     : this.initialTTemp,
  TTempNEW  : this.initialTTemp,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    // (1) enterFeedConc, enterFeedTTemp, enterFeedFlowRate
    this.concNEW = Number(enterFeedConc.value);
    this.TTempNEW = Number(enterFeedTTemp.value);
    this.rateNEW = Number(enterFeedFlowRate.value);
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    //   none

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.rate = this.rateNEW || this.initialRate;
    this.conc = this.concNEW || this.initialConc;
    this.TTemp = this.TTempNEW || this.initialTTemp;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

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
  //   unit_2 USES unit_4.TTemp // TTemp = temperature
  //   unit_2 USES unit_4.UA
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_5 USES unit_2.TTemp
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt				: 0.1, // (s), default time step size, dt changed by process_main.js
  initialTTemp 	: 300, // (K), TTemp = temperature in Kelvin
  initialConc   : 0, // (mol/m3), reactant concentration
  vol				: 0.1, // (m3), volume of reactor contents = constant with flow rate

  // parameters for essentially irreversible first-order reaction
  k300      : 5e-6, // (1/s), reaction rate coefficient value at 300 K
  Ea        : 200, // (kJ/mol), reaction activation energy
  delH      : -250, // (kJ/mol), reaction heat of reaction (exothermic < 0)
  Rg        : 8.3144598E-3, // (kJ/mol/K), ideal gas constant
  rho       : 1000, // (kg/m3), reactant liquid density
  Cp        : 2.0, // (kJ/kg/K), reactant liquid heat capacity

  TTemp     : this.initialTTemp, // (K), TTemp = temperature in Kelvin
  TTempNEW  : this.initialTTemp,

  conc      : this.initialConc, // (mol/m3), reactant concentration
  concNEW   : this.initialConc,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.TTemp = this.initialTTemp; // (K), TTemp = temperature in Kelvin
    this.TTempNEW = this.initialTTemp;
    this.conc = this.initialConc;
    this.concNEW = this.initialConc;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    this.k300 = Number(enterk300.value);
    this.Ea = Number(enterEa.value);
    this.delH = Number(enterdelH.value);
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var flowRate1 = unit_1.rate;
    var conc1 = unit_1.conc;
    var TTemp4 = unit_4.TTemp;
    var UA4 = unit_4.UA;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.TTemp = this.TTempNEW || this.initialTTemp;
    this.conc = this.concNEW || this.initialConc;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    var krxn = this.k300 * Math.exp(-(this.Ea/this.Rg)*(1/this.TTemp - 1/300));
    var rate = -krxn * this.conc;
    var invTau = flowRate1 / this.vol; // inverse of space time = space velocity

    var dCdt = invTau * (conc1 - this.conc) + rate;
    var dC = this.dt * dCdt;
    var newConc = this.conc + dC;
    if (newConc <= 0){newConc = gMinSetValue;}  // if value = 0 then set to special small value
    this.concNEW = newConc || this.initialConc;

    var dTdt = invTau*(unit_1.TTemp - this.TTemp) + rate*this.delH/(this.rho*this.Cp) +
               (TTemp4 - this.TTemp) * UA4 / (this.vol*this.rho*this.Cp);
    var dTTemp = this.dt * dTdt;
    var newTTemp = this.TTemp + dTTemp;
    if (newTTemp <= 0){newTTemp = gMinSetValue;}  // if value = 0 then set to special small value
    this.TTempNEW = newTTemp || this.initialTTemp;

  }, // end step method

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
    var el = document.querySelector("#reactorContents");
    // reactant is blue, product is red, this.conc is reactant conc
    // xxx assume here max conc is 400 but should make it a variable
    var concB = Math.round((this.conc)/400 * 255);
    var concR = 255 - concB;
    var concColor = "rgb(" + concR + ", 0, " + concB + ")";
    // alert("concColor = " + concColor); // check results
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;
  } // end display method

}; // END var unit_2

// unit_3 - feed to heat transfer jacket - OBJECT DEFINITION
var unit_3 = {
  // *** CHANGE SO JACKET T IS JACKET FEED T SO NO JACKET DYNAMICS
  //
  // unit_3 IS FEED TO HEAT TRANSFER JACKET
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_3 USES unit_5.command
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_4 USES unit_3.rate
  //   unit_4 USES unit_3.TTemp // TTemp = temperature
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt        : 0.1, // (s), default time step size, dt changed by process_main.js

  initialRate	: 1, // (m3/s), heat transfer liquid flow rate
  rate      : this.initialRate,
  rateNEW		: this.initialRate,

  initialTTemp	: 350, // (K), TTemp = temperature
  TTemp		: this.initialTTemp,
  TTempNEW		: this.initialTTemp,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.TTempNEW = this.initialTTemp;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    // (3) enterJacketFlowRate

    // *** CHANGE SO JACKET T IS JACKET FEED T SO NO JACKET DYNAMICS
    this.rateNEW = this.initialRate; // arbitrary value
    // this.rateNEW = Number(enterJacketFlowRate.value);
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var command = unit_5.command;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.rate = this.rateNEW || this.initialRate;
    this.TTemp = this.TTempNEW || this.initialTTemp;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    // get feed T from controller command xxx
    this.TTempNEW =  command || this.initialTTemp;

  }, // end step method

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
  } // end display method

}; // END var unit_3

// unit_4 - heat transfer jacket - OBJECT DEFINITION
var unit_4 = {
  // *** CHANGE SO JACKET T IS JACKET FEED T SO NO JACKET DYNAMICS
  //
  // unit_4 IS HEAT TRANSFER JACKET
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_4 USES unit_2.TTemp
  //   unit_4 USES unit_3.rate // flow rate
  //   unit_4 USES unit_3.TTemp
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_2 USES unit_4.TTemp // TTemp = temperature
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt        : 0.1, // (s), default time step size, dt changed by process_main.js

  vol       : 0.02, // (m3), heat transfer jacket volume
  rho       : 1000, // (kg/m3), heat transfer liquid density
  Cp        : 2.0, // (kJ/kg/K), heat transfer liquid heat capacity

  initialTTemp	: 350, // (K), TTemp = temperature
  TTemp     : this.initialTTemp,
  TTempNEW  : this.initialTTemp,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.TTemp = this.initialTTemp;
    this.TTempNEW = this.initialTTemp;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // convert input values to Number() so .toFixed() method works when needed,
    //  e.g., this.UA = Number(enterJacketUA.value);
    this.UA = Number(enterJacketUA.value); // (kJ/s/K), heat transfer area * coefficient
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var TTemp2 = unit_2.TTemp;
    var flowRate3 = unit_3.rate;
    var TTemp3 =  unit_3.TTemp;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.TTemp = this.TTempNEW || this.initialTTemp;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

// *** CHANGE SO JACKET T IS JACKET FEED T SO NO JACKET DYNAMICS

    // var invTau = flowRate3 / this.vol;
    //
    // var dTdt = invTau*(TTemp3 - this.TTemp) +
    //            (TTemp2 - this.TTemp) * this.UA/(this.vol*this.rho*this.Cp);
    // var dTTemp = this.dt * dTdt;
    // var newTTemp= this.TTemp + dTTemp;
    // if (newTTemp <= 0){newTTemp = gMinSetValue;}  // if value = 0 then set to special small value
    // this.TTempNEW = newTTemp || this.initialTTemp;

    var newTTemp = TTemp3; // **** CHANGE use jacket feed T for jacket T
    this.TTempNEW = newTTemp || this.initialTTemp;

    // this.TTempNEW = 347; // XXX TEST

  }, // end step method

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
  } // end display method

}; // END var unit_4

// unit_5 - reactor temperature controller - OBJECT DEFINITION
var unit_5 = {
  //
  // unit_5 IS REACTOR TEMPERATURE CONTORLLER
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_5 USES unit_2.TTemp - controlled variable
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_3 USES unit_5.command - manipulated variable
  // (1) reactor feed, (2) reactor, (3) feed to jacket, (4) jacket, (5) controller

  dt				:	0.1, // (s), default time step size, dt changed by process_main.js

  setPoint		:	330, // (K) desired reactor temperature
  gain				:	100, // controller gain
  resetTime   :	3, // integral mode reset time
  manualBias  : 300, // (K), command at zero error
  initialCommand  :	300, // controller command signal (coef for unit_2)
  command     : this.initialCommand,
  commandNEW  : this.initialCommand,
  errorIntegral :	gMinSetValue, // integral error
  errorIntegralNEW  : gMinSetValue,

  mode        : "manual", // auto or manual, see changeMode() below
  manualCommand : 348,

  reset		: function(){
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
    var el2 = document.querySelector("#enterJacketFeedTTemp");
    if (el.checked){
      // alert("controller in AUTO mode");
      this.mode = "auto"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "hidden";
      //   document.getElementById("enterJacketFeedTTempLABEL").style.visibility = "hidden";
    } else {
      // alert("controller in MANUAL mode");
      this.mode = "manual"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "input";
      //   document.getElementById("enterJacketFeedTTempLABEL").style.visibility = "visible";
    }
  }, // end changeMode function

  updateUIparams : function(){
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
    this.manualCommand = Number(enterJacketFeedTTemp.value);
  },

  step	: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var TTemp2 = unit_2.TTemp;

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
    // USING VALUE FROM unit_2, unit_2.TTemp
    var error = this.setPoint - TTemp2;
    this.commandNEW = this.manualBias + this.gain *
                  (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup
    if (this.commandNEW > 450){
      this.commandNEW = 450;
    } else if (this.commandNEW < 200){
      this.commandNEW = 200;
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

  display		: function(){
    // document.getElementById("demo05").innerHTML = "unit_5.command = " + this.command;
  } // end display METHOD

}; // END var unit_5
