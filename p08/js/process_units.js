/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units

// ----- GLOBAL ARRAYS TO HOLD WORKING DATA -----------

var Trxr = [];
var TrxrNew = []; // new values
var Ca = []; // concentration of reactant
var CaNew = [];
ar tempArray = []; // for shifting data in strip chart plots
var spaceData = []; // for shifting data in space-time plots

// ----- SEE process_plot_info.js FOR INITIALIZATION OF ---------------
// ----- OTHER DATA ARRAYS --------------------------------------------

// ----- OBJECT TO CONTAIN & SET SIMULATION & PLOT PARAMETERS ---------

var simParams = {
  //
  // file process_main.js uses in object simParams the following:
  //    function updateCurrentRunCountDisplay()
  //    function checkForSteadyState()
  //    function updateSimTime()
  //    variables runningFlag, ssFlag, simStepRepeats, processUnits
  //    variables updateDisplayTimingMs
  //
  // simParams uses the following from process unit puHeatExchanger
  //    variables SScheck, residenceTime, numNodes
  //
  // simParams uses the following global variables:
  //    Thot and Tcold used in function checkForSteadyState()

  // ssFlag new for process with one unit - rethink for multiple-unit processes
  // unit's updateState can set ssFlag true when unit reaches steady state
  // REDUCES CPU LOAD ONLY when return from top of process_main.js functions
  // updateProcessUnits and updateDisplay but NOT from top of unit functions here
  ssFlag : false, // steady state flag set true when sim reaches steady state
  // also see below in simParams the var oldSimTime
  // also see in puHeatExchanger the vars SScheck and residenceTime

  runningFlag : false, // set runningFlag to false initially
  runButtonID : "button_runButton", // for functions to run, reset, copy data
  // URLs for methods updateRunCount and updateCurrentRunCountDisplay below
  runLoggerURL : "../webAppRunLog.lc",
  runCurrrentRunCountURL : "../webAppCurrentCount.lc",
  // warning: this.runCounterFieldID does NOT work below in logger URL methods
  // need literal field ID string in methods below
  runCounterFieldID : "field_run_counter", // not used, see 2 lines above

  // all units use simParams.simTimeStep, getting it at each step in unit updateInputs()
  // see method simParams.changeSimTimeStep() below to change simTimeStep value
  // WARNING: DO NOT CHANGE simTimeStep BETWEEN display updates

  simStepRepeats : 1, // integer number of unit updates between display updates
  simTimeStep : 2, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 50, // real time milliseconds between display updates

  simTime : 0, // (s), time, initialize simulation time, also see resetSimTime
  oldSimTime : 0, // (s), used to check for steady state

  // LIST ACTIVE PROCESS UNITS
  // processUnits array is the list of names of active process units
  // the order of units in the list is not important

  processUnits : [
    "puPlugFlowReactor"
  ],

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "7, Plug Flow Reactor"})
      .done(
        function(data) {
          // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>";
        } // END OF function(data)
      ) // END OF .done(
  }, // END OF updateRunCount

  updateCurrentRunCountDisplay : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    // $.post(this.runCurrrentRunCountURL) .done(function(data) {
      // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

  resetSimTime : function() {
    this.simTime = 0;
  },

  updateSimTime : function() {
    this.simTime = this.simTime + this.simTimeStep;
  },

  // runningFlag value can change by click of RUN-PAUSE or RESET buttons
  // calling functions toggleRunningFlag and stopRunningFlag
  toggleRunningFlag : function() {
    this.runningFlag = !this.runningFlag;
  },

  stopRunningFlag : function() {
    this.runningFlag = false;
  },

  changeSimTimeStep : function(factor) {
    // WARNING: do not change simTimeStep except immediately before or after a
    // display update in order to maintain sync between sim time and real time
    this.simTimeStep = factor * this.simTimeStep;
  },

  checkForSteadyState : function() {
    // required - called by process_main.js
    // not implemented here
  } // END OF checkForSteadyState()

}; // END var simParams


// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 5 FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var puPlugFlowReactor = {
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes
  // USES GLOBALS
  //    Trxr, TrxrNew
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //   e.g., inputModel01 : "radio_Model_1",
  //
  // WARNING: the function getInputValue() called by updateUIparams() below
  // requires a specific naming convention for vars set in INPUT FIELDS
  // for the input ID, and initial, min and max values for each variable
  // e.g., TinHot requires inputTinHot, initialTinHot, minTinHot, maxTinHot
  //
  inputK300 : "input_field_K300",
  inputEa : "input_field_Ea",
  input DelH : "input_field_DelH",
  inputWcat : "input_field_Wcat",
  inputCain : "input_field_Cain",
  inputFlowrate : "input_field_Flowrate",
  inputTin : "input_field_Tin",
  inputUA : "input_field_UA",
  inputTjacket : "input_field_Tjacket",

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayHotLeftT: 'field_jacket_left_T',
  displayHotRightT: 'field_jacket_right_T',
  displayColdLeftT: 'field_reactor_left_T',
  displayColdRightT: 'field_reactor_right_T',
  // displayJacketLeftArrow : '#field_jacket_left_arrow', // needs # with ID

  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE... -----
  // ---- EXCEPT simParams.simTimeStep, simParams.simStepRepeats, simParams.ssFlag ----

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // ADD INITIAL - DEFAULT VALUES FOR INPUTS
  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent

  initialK300 : 1.0e-4, // (m3/kg/s), rate coefficient at 300 K
  initialEa : 100, // (kJ/mol), activation energy
  initialDelH : -125, // (kJ/mol), enthalpy of reaction
  initialWcat : 0.1, // (kg), weight (mass) of catalyst
  initialCain : 500, // (mol/m3), inlet reactant concentration
  initialFlowrate : 4.0e-3, // (m3/s), flow rate of reactant
  initialTin : 350, // (K), inlet T of reactant
  initialUA : 10, // (kW/kg/K), heat transfer coefficient * area
  initialTjacket: 350, // (K), jacket T

  // SET MIN AND MAX VALUES FOR INPUTS SET IN INPUT FIELDS
  // here set range so solution stable when only one variable changed in
  // min-max range at default conditions
  // NOTE: these min-max may be used in plot definitions in process_plot_info.js

  minK300 : 0, // (m3/kg/s), rate coefficient at 300 K
  minEa : 0, // (kJ/mol), activation energy
  minDelH : -200, // (kJ/mol), enthalpy of reaction
  minWcat : 0, // (kg), weight (mass) of catalyst
  minCain : 0, // (mol/m3), inlet reactant concentration
  minFlowrate : 1.0e-6, // (m3/s), flow rate of reactant
  minTin : 250, // (K), inlet T of reactant
  minUA : 0, // (kW/kg/K), heat transfer coefficient * area
  minTjacket: 250, // (K), jacket T

  maxK300 : 10, // (m3/kg/s), rate coefficient at 300 K
  maxEa : 200, // (kJ/mol), activation energy
  maxDelH : 200, // (kJ/mol), enthalpy of reaction
  maxWcat : 100, // (kg), weight (mass) of catalyst
  maxCain : 1000, // (mol/m3), inlet reactant concentration
  maxFlowrate : 10, // (m3/s), flow rate of reactant
  maxTin : 400, // (K), inlet T of reactant
  maxUA : 100, // (kW/kg/K), heat transfer coefficient * (area per kg cat)
  maxTjacket: 400, // (K), jacket T

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200,

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number
  residenceTime : 0, // for timing checks for steady state check

  // XXX WARNING: SETTING TO this.initial___ HAS NO EFFECT HERE WHEN
  //     THEY ARE ALSO SET IN updateUIparams
  //     BUT WHEN NOT SET IN updateUIparams THEN setting to
  //     this.initial___ HAS NO EFFECT AND GET NaN
  // if list here must supply a value (e.g., this.initial___) but if not
  //     list here then apparently is created in updateUIparams...
  //
  // HUH? NEED TO EXPLORE THIS....
  //
  TinHot : this.initialTinHot, // K, hot T in

  K300 : this.initialK300,
  Ea : this.initialEa,
  DelH : this.initialDelH,
  Wcat : this.initialWcat,
  Cain : this.initialCain,
  Flowrate : this.initialFlowrate,
  Tin : this.initialTin,
  UA : this.initialUA,
  Tjacket: this.initialTjacket,

  // variables to be plotted are defined as objects
  // with the properties: value, name, label, symbol, dimensional units
  // name used for copy-save data column headers, label for plot legend

  // y : {
  //   value  : 0,
  //   name   : "y",
  //   label  : "y",
  //   symbol : "y",
  //   units  : "(d'less)"
  // },

  reset : function() {

    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings

    // this.command.value = this.initialCommand;
    // this.errorIntegral = this.initialErrorIntegral;

    simParams.ssFlag = false;
    this.SScheck = 0;

    for (k = 0; k <= this.numNodes; k += 1) {
      Trxr[k] = this.initialTin;
      TrxrNew[k] = this.initialTjacket;
    }

    var kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotsObj variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      profileData[0][k][0] = kn;
      profileData[1][k][0] = kn;
      // y-axis values
      profileData[0][k][1] = 0;
      profileData[1][k][1] = 0;
    }

  }, // end reset

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    // // EXAMPLE FOR SETTING VALUE OF AN OBJECT WITH MULTIPLE properties
    // //   THUS set value of this.setPoint.value
    // if (document.getElementById(this.inputSetPoint)) {
    //   let tmpFunc = new Function("return " + this.inputSetPoint + ".value;");
    //   this.setPoint.value = tmpFunc();
    // } else {
    //   this.setPoint.value = this.initialSetPoint;
    // }
    //
    // // EXAMPLE SETTING VALUE OF SIMPLE VARIABLE (no .value = )
    // if (document.getElementById(this.inputCmax)) {
    //   let tmpFunc = new Function("return " + this.inputCmax + ".value;");
    //   this.Cmax = tmpFunc();
    // } else {
    //   this.Cmax= this.initialCmax;
    // }
    //
    // // EXAMPLE OF SETTING VALUE FROM RANGE SLIDER
    // // update the readout field of range slider
    // if (document.getElementById(this.inputSliderReadout)) {
    //   document.getElementById(this.inputSliderReadout).innerHTML = this.Cmax;

    // change simParams.ssFlag to false if true
    if (simParams.ssFlag) {
      // sim was at steady state, switch ssFlag to false
      simParams.ssFlag = false;
    }
    // reset SScheck checksum used to check for ss
    this.SScheck = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    this.K300 = getInputValue('puPlugFlowReactor','K300');
    this.Ea = getInputValue('puPlugFlowReactor','Ea');
    this.DelH = getInputValue('puPlugFlowReactor','DelH');
    this.Wcat = getInputValue('puPlugFlowReactor','Wcat');
    this.Cain = getInputValue('puPlugFlowReactor','Cain');
    this.Flowrate = getInputValue('puPlugFlowReactor','Flowrate');
    this.Tin = getInputValue('puPlugFlowReactor','Tin');
    this.UA = getInputValue('puPlugFlowReactor','UA');
    this.Tjacket = getInputValue('puPlugFlowReactor','Tjacket');

    // // also update ONLY inlet T's on ends of heat exchanger in case sim is paused
    // // outlet T's not defined on first entry into page
    // // but do not do full updateDisplay
    // document.getElementById(this.displayHotRightT).innerHTML = this.TinHot + ' K';
    // switch(this.ModelFlag) {
    //   case 0: // co-current
    //     document.getElementById(this.displayColdRightT).innerHTML = this.TinCold + ' K';
    //     break
    //   case 1: // counter-current
    //     document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold + ' K';
    // }

    // residence time used for timing checks for steady state
    this.residenceTime = 10; // XXX check this if implement

    // // UPDATE UNIT TIME STEP AND UNIT REPEATS
    //
    // // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    // //                          = space time of equivalent single mixing cell
    // var spaceTime = (Length / this.numNodes) / VelocHot; // (s)
    //
    // // SECOND, estimate unitTimeStep
    // // do NOT change simParams.simTimeStep here
    // this.unitTimeStep = spaceTime / 15;
    //
    // // THIRD, get integer number of unitStepRepeats
    // this.unitStepRepeats = Math.round(simParams.simTimeStep / this.unitTimeStep);
    // // min value of unitStepRepeats is 1 or get divide by zero error
    // if (this.unitStepRepeats <= 0) {this.unitStepRepeats = 1;}
    //
    // // FOURTH and finally, recompute unitTimeStep with integer number unitStepRepeats
    // this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  }, // end of updateUIparams()

  updateInputs : function() {
    //
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    //
    // The following TRY-CATCH structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value

    // try {
    // //   let tmpFunc = new Function("return " + this.inputPV + ";");
    // //   this.PV = tmpFunc();
    // //   // note: can't test for definition of this.inputVAR because any
    // //   // definition is true BUT WHEN try to get value of bad input
    // //   // to see if value is undefined then get "uncaught reference" error
    // //   // that the value of the bad input specified is undefined,
    // //   // which is why use try-catch structure here
    // }
    // catch(err) {
    // //   this.PV = this.initialPV;
    // }

  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    var i = 0; // index for step repeats
    var n = 0; // index for nodes
    var dTrxrDT = 0.0;
    var dCaDT = 0.0;

    var voidFrac = 0.3; // bed void fraction
    var densPellet = 1000; // (kg/m3), pellet density
    var densBed = (1 - voidFrac) * densPellet; // (kg/m3), bed density

    var Cp = 2; // (kJ/kg/K), fluid heat capacity
    var densFluid = 1000; // (kg/m3), fluid density

    var dW = Wcat / this.numNodes;
    var Rg = 8.314; // ideal gas constant
    var kT = this.K300; // will vary with T below
    var EaOverRg = this.Ea / Rg; // so not compute in loop below
    var EaOverRg300 = EaOverRg / 300; // so not compute in loop below

    var flowCoef = Flowrate * densBed / voidFrac / dW;
    var rxnCoef = densBed / voidFrac;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet end
      n = 0;

      kT = this.K300 * Math.exp(EaOverRg300 - EaOverRg/Trxr[n]);

      // special for n=0 is Ca[n-1] is Cain
      dCaDT = -flowCoef * (Cain - Ca[n]) - kT * rxnCoef * Ca[n];

      TrxrN = TrxrN + dTrxrDT * this.unitTimeStep;
      CaN = CaN + dCaDT * this.unitTimeStep;

      // // CONSTRAIN TO BE IN BOUND
      // if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
      // if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      TrxrNew[n] = TrxrN;
      CaNew[n] = CaN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        kT = this.K300 * Math.exp(EaOverRg300 - EaOverRg/Trxr[n]);

        dCaDT = -flowCoef * (Ca[n-1] - Ca[n]) - kT * rxnCoef * Ca[n];

        TrxrN = TrxrN + dTrxrDT * this.unitTimeStep;
        CaN = CaN + dCaDT * this.unitTimeStep;

        // // CONSTRAIN TO BE IN BOUND
        // if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
        // if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
        if (CaN < 0.0) {CaN = 0.0;}
        if (CaN > this.Cain) {CaN = this.Cain;}

        TrxrNew[n] = TrxrN;
        CaNew[n] = CaN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      kT = this.K300 * Math.exp(EaOverRg300 - EaOverRg/Trxr[n]);

      dCaDT = -flowCoef * (Ca[n-1] - Ca[n]) - kT * rxnCoef * Ca[n];

      TrxrN = TrxrN + dTrxrDT * this.unitTimeStep;
      CaN = CaN + dCaDT * this.unitTimeStep;

      // // CONSTRAIN TO BE IN BOUND
      // if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
      // if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      TrxrNew[n] = TrxrN;
      CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      Trxr = TrxrNew;
      Ca = CaNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // not implemented
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    document.getElementById(this.displayHotLeftT).innerHTML = Thot[this.numNodes].toFixed(1) + ' K';
    document.getElementById(this.displayHotRightT).innerHTML = this.TinHot + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById(this.displayColdLeftT).innerHTML = Tcold[this.numNodes].toFixed(1) + ' K';
        document.getElementById(this.displayColdRightT).innerHTML = this.TinCold + ' K';
        break
      case 1: // counter-current
        document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold + ' K';
        document.getElementById(this.displayColdRightT).innerHTML = Tcold[0].toFixed(1) + ' K';
    }

    // HANDLE PROFILE PLOT DATA

    // copy variable values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    for (n=0; n<=this.numNodes; n+=1) {
      profileData[0][n][1] = Trxr[n];
      profileData[1][n][1] = Ca[n];
    }

    // HANDLE SPACE-TIME DATA >> HERE IS HOT AND COLD SIDES OF EXCHANGER
    // FOR HEAT EXCHANGER
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize spaceTimeData array, take this into account

    // spaceTimeData[v][t][s] - variable, time changes to space, space changes to one value
    for (n=0; n<=this.numNodes; n+=1) {
      spaceTimeData[0][n][0] = Trxr[n];
      spaceTimeData[1][n][0] = Tjacket; // XXX should only do this once...
    }

  } // end display method

}; // END var puPlugFlowReactor
