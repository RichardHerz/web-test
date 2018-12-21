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
