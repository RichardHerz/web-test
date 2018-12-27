// by Richard K. Herz of www.ReactorLab.net
// 2015

// this file contains definitions of the process units
// see file process_main.js for the main simulation scripts

// numUnits value needs to agree with number units defined below
var numUnits = 3;

var unitNameBase = 'unit_';
var unitName;

var gMinSetValue = 1.0203040504030201e-230; // special value not 0 (-230 for all digits to display)

// ----------------- PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE FOUR FUNCTIONS:
//   reset, updateUIparams, step, display
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// unit_1 - water source - OBJECT DEFINITION
var unit_1 = {
  //
  // unit_1 IS WATER SOURCE
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   none
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_2 USES unit_1.rate OF unit_1

  dt			: 0.1, // default time step size
  initialRate	: 0,
  offRate		: gMinSetValue,
  onRate		: 1, // modified below in step()
  rate      : this.initialRate,
  rateNEW		: this.initialRate,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // (1) enterFlowRate
    this.rateNEW = enterFlowRate.value;
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    //    none

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.rate = this.rateNEW || this.initialRate;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

  },

  display		: function(){
    // document.getElementById("demo01").innerHTML = "unit_1.rate = " + this.rate;
  }

}; // END var unit_1

// unit_2 - water in tank - OBJECT DEFINITION
var unit_2 = {
  //
  // unit_2 IS WATER TANK
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_2 USES unit_1.rate FROM unit_1
  //   unit_2 USES unit_3.command FROM unit_3
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_3 USES unit_2.height FROM unit_2

  dt				: 0.1, // default time step size
  initialHeight 	: 0, // height of liquid in tank
  Ax 				: 1, // cross sectional area of tank
  coef 			: 1, // Cv*(rho*g/gc)^0.5
  height    : this.initialHeight,
  heightNEW : this.initialHeight,

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.height = this.initialHeight;
    this.heightNEW = this.initialHeight;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // no user entered values
  },

  step		: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var command = unit_3.command;
    var rate = unit_1.rate;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.height = this.heightNEW || this.initialHeight;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    // compute new value of height
    // USING VALUE FROM UNIT 01
    // AND NOW USING VALUE FROM NEW unit_3 - PI controller
    // when command > 0 level below setpoint and want to close down valve
    // when command < 0 level above setpoint and want to open up valve
    // valve coef can be between 0 (valve completely closed) and some max, e.g., 2

    var newCoef = 1.5 - command; // replace this.coef with newCoef in exprValue below

    // XXX 1.5 here is half of limit in IF below
    // XXX maybe should add a manual bias in unit_3 so this is just newCoef = unit_3.command ??
    // XXX and eliminate constant values like 1.5

    // coef is negative of command because of reverse acting control valve
    // greater positive error means want to close down valve more
    // but check for valve limits
    if (newCoef > 3){
      newCoef = 3;
    }
    if (newCoef < 0){
      newCoef = 0;
    }
    var exprValue = (this.height +
      this.dt / this.Ax * (rate - newCoef * Math.pow(this.height,0.5)));
      // this.dt / this.Ax * rate); // NO FLOW OUT FOR CHECKING TIMING

    // check if (0) before setting new value
    if (!exprValue){exprValue = gMinSetValue;} // if value = 0 then set to special small value

    // set new value
    this.heightNEW = exprValue || this.initialHeight;

  }, // end step method

  display		: function(){
    // document.getElementById("demo02").innerHTML = "unit_2.height = " + this.height;
    // set height of div that represents water in tank
    //    css top & left sets top-left of water rectangle
    //    from top of browser window - can't use css bottom because
    //    that is from bottom of browser window (not bottom rect from top window)
    //    and bottom of browser window can be moved by user,
    //    so must compute new top value to keep bottom of water rect
    //    constant value from top of browser window
    var pixPerHtUnit = 50;
    var newHt = pixPerHtUnit * this.height;
    // XXX if can delete "px" then get current height so don't need to
    // XXX reference constant of origHt in css
    var origHt = 465; // XXX MUST AGREE WITH top VALUE IN CSS FOR .element-1
    var el = document.querySelector("#water");
    el.style.height = newHt + "px";
    el.style.top = (origHt - pixPerHtUnit * this.height) + "px";
  }

}; // END var unit_2

// unit_3 - PI level controller - OBJECT DEFINITION
var unit_3 = {
  //
  // unit_3 IS FEEDBACK CONTROLLER
  //
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
  // SEE "GET INPUT CONNECTIONS" below in this unit
  //   unit_3 USES unit_2.height FROM unit_2
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit_2 USES unit_3.command FROM unit_3

  dt        :	0.1, // default time step
  setPoint  :	0.75, // desired height of water in tank
  gain      :	4, // controller gain
  resetTime :	1, // integral mode reset time
  initialCommand  :	0, // controller command signal (coef for unit_2)
  command   : this.initialCommand,
  commandNEW  : this.initialCommand,
  errorIntegral :	0, // integral error
  errorIntegralNEW :	0, // integral error

  reset		: function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    this.command = this.initialCommand;
    this.commandNEW = this.initialCommand;
    this.errorIntegral = 0;
    this.errorIntegralNEW = 0;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    // use suffix NEW only when user enters unit's output variables
    // (3) enterResetTime, enterGain, enterSetpoint
    this.resetTime = enterResetTime.value;
    this.gain = enterGain.value;
    this.setPoint = enterSetpoint.value;
  },

  step	: function(){

    // GET INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS
    var height = unit_2.height;

    // SAVE CURRENT VALUE ON NEW TIME STEP
    // SO OTHER UNITS UPDATING CAN USE VALUE AT START OF TIME STEP
    // FOR THEIR CALCS FOR NEW TIME STEP

    this.command = this.commandNEW || this.initialCommand;
    this.errorIntegral = this.errorIntegralNEW || this.initialCommand;
    // VALUE IS EXPRESSION *||* = *OR* initial value IF EXPRESSION IS UNDEFINED OR FALSE (0)
    // IF WANT (0) VALUE THEN USE SPECIAL SMALL VALUE
    // IF WANT TO RESET NEW VALUE TO (0) WHEN SPECIAL SMALL VALUE
    // THEN BE CAREFUL ALSO ABOUT SAVING CURRENT VALUE

    // compute new value of PI controller command
    // USING VALUE FROM unit_2, unit_2.height
    var error = this.setPoint - height; // get water height from unit_2
    this.commandNEW = this.gain * (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup

    // XXX 1.5 here is half of max valve travel
    // XXX maybe should replace by manual bias
    // XXX and eliminate constant values like 1.5

    if (this.commandNEW > 1.5){
      this.commandNEW = 1.5;
    } else if (this.commandNEW < -1.5){
      this.commandNEW = -1.5; // this will shut control valve on tank (unit_2)
    } else {
      // not at limit, OK to update integral of error
      this.errorIntegralNEW = this.errorIntegral + error * this.dt; // update integral of error
    }

  }, // end step method

  display		: function(){
    // document.getElementById("demo07").innerHTML = "unit_3.command = " + this.command;
  }

}; // END var unit_3
