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
