/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units

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

  title : 'Packed Bed PFR + Heat Exchanger', // title of simulation

  // ssFlag new for process with one unit - rethink for multiple-unit processes
  // unit's updateState can set ssFlag true when unit reaches steady state
  // REDUCES CPU LOAD ONLY when return from top of process_main.js functions
  // updateProcessUnits and updateDisplay but NOT from top of unit functions here
  ssFlag : false, // steady state flag set true when sim reaches steady state
  // also see below in simParams the var oldSimTime
  // also see in process unit the vars SScheck and residenceTime

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
  simTimeStep : 1, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 100, // real time milliseconds between display updates

  simTime : 0, // (s), time, initialize simulation time, also see resetSimTime
  oldSimTime : 0, // (s), used to check for steady state

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "8, Plug Flow Reactor + Heat Exchanger"})
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

  // checkForSteadyState : function() {
  //   // required - called by process_main.js
  //   // use OS Activity Monitor of CPU load to see effect of this
  //   // not implemented here
  // } // END OF checkForSteadyState()

  checkForSteadyState : function() {
    // // processUnits[0] is plug flow reactor in this web lab
    // // required - called by process_main.js
    // // use OS Activity Monitor of CPU load to see effect of this
    // if (this.simTime >= this.oldSimTime + processUnits[0].residenceTime) {
    //   // check in order to save CPU time when sim is at steady state
    //   // check for SS by checking for any significant change in array end values
    //   // but wait at least one residence time after the previous check
    //   // to allow changes to propagate down reactor
    //   // create SScheck which is a 16-digit number unique to current 4 end T's
    //   // NOTE: these are end values in arrays, not those displayed in inlet & outlet fields
    //   var nn = processUnits[0].numNodes;
    //   var hlt = 1.0e5 * processUnits[0]['Trxr'][nn].toFixed(1);
    //   var hrt = 1.0e1 * processUnits[0]['Trxr'][0].toFixed(1);
    //   var clt = 1.0e-3 * processUnits[0]['Ca'][nn].toFixed(1);
    //   var crt = 1.0e-7 * processUnits[0]['Ca'][0].toFixed(1);
    //   var SScheck = hlt + hrt + clt + crt;
    //   SScheck = SScheck.toFixed(8); // need because last sum operation adds significant figs
    //   // note SScheck = hlt0hrt0.clt0crt0 << 16 digits, 4 each for 4 end values
    //   var oldSScheck = processUnits[0].SScheck;
    //   if (SScheck == oldSScheck) {
    //     // set ssFlag
    //     simParams.ssFlag = true;
    //   } // end if (SScheck == oldSScheck)
    //
    //   // save current values as the old values
    //   processUnits[0].SScheck = SScheck;
    //   simParams.oldSimTime = simParams.simTime;
    // } // END OF if (simParams.simTime >= simParams.oldSimTime + processUnits[0].residenceTime)
  } // END OF checkForSteadyState()

}; // END var simParams

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 6 FUNCTIONS:
//   initialize, reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var processUnits = new Object();
  // contents must be only the process units as child objects
  // children optionally can be defined in separate script files, e.g., as puHeatExchanger,
  // then inserted into processUnits, e.g., processUnits[0] = puHeatExchanger,
  // then cleared for garbage collection, e.g., puHeatExchanger = null;
  // units defined in separate files makes them easier to edit

processUnits[0] = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Adiabatic Packed Bed PFR',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes

  // **** WHEN RXR COUPLED TO HX *****
  //    all flow rates are the same in reactor and heat exchanger
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //    reactor outlet T to heat exchanger hot inlet T
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //    heat exchanger cold out T is reactor inlet T

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayReactorLeftConc: 'field_reactor_left_conc',
  displayReactorRightConc: 'field_reactor_right_conc',
  displayReactorLeftT: 'field_reactor_left_T',
  displayReactorRightT: 'field_reactor_right_T',
  // displayJacketLeftArrow : '#field_jacket_left_arrow', // needs # with ID

  // define main inputs
  // values will be set in method intialize()
  Kf300 : 0,
  Ea : 0,
  DelH : 0,
  Wcat : 0,
  Cain : 0,
  Flowrate : 0,
  // *** WHEN RXR COUPLED TO HX, THIS IS INLET T TO COLD SIDE HX ***
  // *** WHEN RXR COUPLED TO HX, SEE Tin BELOW FOR RXR INLET T ***
  TinHX : 0, // inlet T to heat exchanger cold side
  UAcoef : 0,
  Tjacket : 0,

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataInitial : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()
  Trxr : [],
  Ca : [],
  TrxrNew : [], // 'New' hold intermediate values during updateState
  CaNew : [],

  // *** WHEN RXR COUPLED TO HX, Tin IS RXR INLET T ***
  // these will be filled with values in method initialize()
  // and updated in updateState()
  Tin : 0, //

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 200, // XXX
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200, // XXX

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number of array end values
  residenceTime : 0, // for timing checks for steady state check

  // fluid Cp and both dens need to be accessible in updateUIparams()
  // Cp and dens for catalyst set in updateState()
  CpFluid : 2, // (kJ/kg/K)
  densFluid : 1000, // (kg/m3)
  densCat : 1000, // (kg/m3)

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'Kf300';
    this.dataInputs[v] = 'input_field_Kf300';
    this.dataUnits[v] = 'm3/kg/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 1.0e-7;
    this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_Ea';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 100;
    this.Ea = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Ea; // current input value for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'DelH';
    this.dataInputs[v] = 'input_field_DelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -150;
    this.dataMax[v] = 150;
    this.dataInitial[v] = -125;
    this.DelH = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.DelH; // current input value for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'Wcat';
    this.dataInputs[v] = 'input_field_Wcat';
    this.dataUnits[v] = 'kg';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataInitial[v] = 100;
    this.Wcat = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Wcat; // current input value for reporting
    //
    v = 4;
    this.dataHeaders[v] = 'Cain';
    this.dataInputs[v] = 'input_field_Cain';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 550;
    this.dataInitial[v] = 500;
    this.Cain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Cain; // current input value for reporting
    //
    v = 5;
    this.dataHeaders[v] = 'Flowrate';
    this.dataInputs[v] = 'input_field_Flowrate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 4.0e-3;
    this.Flowrate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Flowrate; // current input value for reporting
    //
    // *** WHEN RXR COUPLED TO HX, THIS IS Tin TO COLD SIDE HEAT EXCHANGER ***
    v = 6;
    this.dataHeaders[v] = 'Tin'; // TinHX
    this.dataInputs[v] = 'input_field_Tin';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 325;
    this.dataMax[v] = 425;
    this.dataInitial[v] = 325;
    this.TinHX = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.TinHX; // current input value for reporting
    //
    // *** WHEN RXR COUPLED TO HX, THIS IS UA of HEAT EXCHANGER ***
    v = 7;
    this.dataHeaders[v] = 'UAcoef';
    // NOTE: dataInputs example where field ID name differs from variable name
    this.dataInputs[v] = 'input_field_UA';
    this.dataUnits[v] = 'kW/K';
    this.dataMin[v] = 0;
    this.dataMax[v] = 60;
    this.dataInitial[v] = 10;
    this.UAcoef = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.UAcoef; // current input value for reporting
    //
    // *** Tjacket not used for adiabatic reactor coupled to heat exch ***
    v = 8;
    this.dataHeaders[v] = 'Tjacket';
    this.dataInputs[v] = 'input_field_Tjacket';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 250;
    this.dataMax[v] = 400;
    this.dataInitial[v] = 360;
    this.Tjacket = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Tjacket; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table in _plotter.js

    // *** CHANGE FROM = v TO = v-1 FOR ADIABATIC RXR COUPLED TO HX ***
    this.VarCount = v-1;

    //
    // OUTPUT VARS
    //
    v = 9;
    this.dataHeaders[v] = 'Trxr';
    this.dataUnits[v] =  'K';
    // Trxr dataMin & dataMax can be changed in updateUIparams()
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    v = 10;
    this.dataHeaders[v] = 'Ca';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[4]; // [4] is Cain
    //

    // *** heat exchanger needs reactor outlet T for HX hot inlet T ***
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
    }

  }, // END of initialize()

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
    this.SScheck = 0; // rest steady state check number of array end values

    // **** CHANGE WHEN REACTOR COUPLED TO HEAT EXCHANGER ****
    document.getElementById(this.displayReactorLeftT).innerHTML = this.TinHX.toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.TinHX.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = this.Cain.toFixed(1) + ' mol/m<sup>3</sup>';

    for (k = 0; k <= this.numNodes; k += 1) {
      // **** CHANGE WHEN RXR COUPLED TO HX ****
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
    }

    // initialize profile data array - must follow function initPlotData in this file
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    // this.stripData = initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = initColorCanvasArray(2,this.numNodes,1);

    var kn = 0;
    for (k = 0; k <= this.numNodes; k += 1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotsObj variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = this.dataInitial[6]; // [6] is Tin
      this.profileData[1][k][1] = this.dataInitial[4]; // [4] is Cain
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
    // getInputValue(unit index in processUnits, var index in input arrays)
    var unum = this.unitIndex;
    this.Kf300 = getInputValue(unum, 0);
    this.Ea = getInputValue(unum, 1);
    this.DelH = getInputValue(unum, 2);
    this.Wcat = getInputValue(unum, 3);
    this.Cain = getInputValue(unum, 4);
    this.Flowrate = getInputValue(unum, 5);
    this.TinHX = getInputValue(unum, 6);
    this.UAcoef = getInputValue(unum, 7);

    // // *** DEACTIVATE FOR ADIABATIC OPERATION ***
    // this.Tjacket = getInputValue(unum, 8);

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    this.Tin = processUnits[1]['Tcold'][0];

    // calc adiabatic delta T, positive for negative H (exothermic)
    var adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;

    // *** CHANGE MIN-MAX T FOR ADIABATIC REACTOR ***
    // calc max possible T
    if(this.DelH < 0) {
      // exothermic
      this.dataMax[9] = this.TinHX + adiabDeltaT;
    } else {
      // endothermic
      this.dataMax[9] = this.TinHX;
    }
    // calc min possible T
    if(this.DelH > 0) {
      // endothermic
      this.dataMin[9] = this.TinHX + adiabDeltaT;
    } else {
      // exothermic
      this.dataMin[9] = this.TinHX;
    }

    // // adjust axis of profile plot
    // plotArrays['plotFlag'][0] = 0;  // so axes will refresh
    // plotsObj[0]['yLeftAxisMin'] = this.dataMin[9]; // [9] is Trxr
    // plotsObj[0]['yLeftAxisMax'] = this.dataMax[9];
    // plotsObj[0]['yRightAxisMin'] = 0;
    // plotsObj[0]['yRightAxisMax'] = this.Cain;
    // // adjust color span of spaceTime, color canvas plots
    // plotsObj[1]['varValueMin'] = this.dataMin[9]; // [9] is Trxr
    // plotsObj[1]['varValueMax'] = this.dataMax[9];
    // plotsObj[2]['varValueMin'] = this.dataMin[9];
    // plotsObj[2]['varValueMax'] = this.dataMax[9];

    // also update ONLY inlet values at inlet of reactor in case sim is paused
    // but do not do full updateDisplay

    // *** deactivate since inlet to reactor isn't directly affected by UI update ***
    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1);

    // residence time used for timing checks for steady state
    // use this for now but should consider voidFrac and Cp's...
    this.residenceTime = this.Wcat / this.densCat / this.Flowrate;

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
    //
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

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    this.Tin = processUnits[1]['Tcold'][0];

  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    var i = 0; // index for step repeats
    var n = 0; // index for nodes
    var TrxrN = 0;
    var dTrxrDT = 0;
    var CaN = 0;
    var dCaDT = 0;

    // CpFluid, densFluid, densCat are properties of puPlugFlowReactor
    var CpCat= 2; // (kJ/kg/K), catalyst heat capacity
    var CpCat = 2; // (kJ/kg/K), catalyst heat capacity
    var voidFrac = 0.3; // bed void fraction
    var densBed = (1 - voidFrac) * this.densCat; // (kg/m3), bed density
    // assume fluid and catalyst at same T at each position in reactor
    var CpMean = voidFrac * this.CpFluid + (1 - voidFrac) * CpCat;

    var dW = this.Wcat / this.numNodes;
    var Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    var kT = 0; // will vary with T below
    var EaOverRg = this.Ea / Rg; // so not compute in loop below
    var EaOverRg300 = EaOverRg / 300; // so not compute in loop below

    var flowCoef = this.Flowrate * densBed / voidFrac / dW;
    var rxnCoef = densBed / voidFrac;

    var energyFlowCoef = this.Flowrate * this.densFluid * this.CpFluid / CpMean / dW;

    // *** FOR ADIABATIC RXR + HX, no heat transfer to rxr walls ***
    var energyXferCoef = 0;
    // var energyXferCoef = this.UAcoef / CpMean;

    var energyRxnCoef = this.DelH / CpMean;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet end
      n = 0;

      // TrxrN = this.TinHX; // XXX TEST
      TrxrN = this.Tin;

      CaN = this.Cain;

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

        dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
        dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                  + energyXferCoef * (this.Tjacket - this.Trxr[n])
                  - energyRxnCoef * kT * this.Ca[n];

        CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
        TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

        // XXX // CONSTRAIN TO BE IN BOUND
        // if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
        // if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
        if (CaN < 0.0) {CaN = 0.0;}
        if (CaN > this.Cain) {CaN = this.Cain;}

        this.TrxrNew[n] = TrxrN;
        this.CaNew[n] = CaN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

      dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
      dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                + energyXferCoef * (this.Tjacket - this.Trxr[n])
                - energyRxnCoef * kT * this.Ca[n];

      CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
      TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

      // XXX // CONSTRAIN TO BE IN BOUND
      // if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
      // if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = this.TrxrNew;
      this.Ca = this.CaNew;

      // XXX
      // for (n = 0; n <= this.numNodes; n += 1) {
      //   alert('this.Ca[' +n+ '] & this.Trxr[' +n+ '] = ' + this.Ca[n] + ', ' + this.Trxr[n]);
      // }

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // not implemented
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    // XXX *** change next line when rxr + hx - but maybe do this to regular rxr?
    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Trxr[0].toFixed(1) + ' K';

    document.getElementById(this.displayReactorRightT).innerHTML = this.Trxr[this.numNodes].toFixed(1) + ' K';

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = this.Ca[this.numNodes].toFixed(1) + ' mol/m<sup>3</sup>';;

    // HANDLE PROFILE PLOT DATA

    // copy variable values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    for (n=0; n<=this.numNodes; n+=1) {
      this.profileData[0][n][1] = this.Trxr[n];
      this.profileData[1][n][1] = this.Ca[n];
    }

    // HANDLE COLOR CANVAS DATA - HERE FOR PFR TEMPERATURE vs. POSITION
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize colorCanvasData array, take this into account
    // FOR PFR - COLOR CANVAS DOES NOT SCROLL WITH TIME
    // SO DO NOT SHIFT AND PUSH DATA LIKE DO IN SCROLLING CANVAS

    // colorCanvasData[v][x][y]
    for (n=0; n<=this.numNodes; n+=1) {
      this.colorCanvasData[0][n][0] = this.Trxr[n];
      this.colorCanvasData[1][n][0] = this.Tjacket; // XXX should only do this once...
    }

  } // end display method

}; // END var puPlugFlowReactor

processUnits[1] = {
  unitIndex : 1, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Heat Exchanger',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes

  // **** WHEN HX COUPLED TO RXR *****
  //    all flow rates are the same in reactor and heat exchanger
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //    heat exchanger cold outlet T is reactor inlet T
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //    reactor outlet T is heat exchanger hot inlet T

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //   e.g., inputModel01 : "radio_Model_1",
  //
  inputModel00 : "radio_co-current_flow", // model 0 is co-current flow
  inputModel01 : "radio_counter-current_flow", // model 1 is counter-current flow

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayHotLeftT: 'field_hot_left_T',
  displayHotRightT: 'field_hot_right_T',
  displayColdLeftT: 'field_cold_left_T',
  displayColdRightT: 'field_cold_right_T',
  displayReynoldsNumber : 'field_Reynolds',
  displayLength : 'field_length',
  displayColdLeftArrow : '#field_cold_left_arrow', // needs # with ID
  displayColdRightArrow : '#field_cold_right_arrow', // needs # with ID

  // define main inputs
  // values will be set in method intialize()
  TinHot : 0,
  TinCold : 0,
  FlowHot : 0,
  FlowCold : 0,
  CpHot : 0,
  CpCold : 0,
  Ucoef : 0,
  Area : 0,
  Diam : 0,
  VarCount : 0, // number of input variables

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataInitial : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()
  Thot : [],
  Tcold : [],
  ThotNew : [], // 'New' hold intermediate values during updateState
  TcoldNew : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 200, // XXX
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define variables which will not be plotted nor saved in copy data table

  ModelFlag : 1, // 0 is cocurrent flow, 1 is countercurrent flow

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200, // XXX
  // NOTE 20180427: discrepancy between steady-state Qcold and Qhot (from Qcold/Qhot)
  // from array end values with dispersion decreases as number of nodes increases
  // but shows same output field T's to one decimal place for 200-800 nodes

  // for Reynolds number Re, use kinematic viscosity from
  // https://www.engineeringtoolbox.com/water-dynamic-kinematic-viscosity-d_596.html?vA=30&units=C#
  FluidKinematicViscosity : 5.0e-7, // m2/s, for water at mid-T of 330 K for Reynolds number
  FluidDensity : 1000.0, // kg/m3, fluid density specified to be that of water
  DispCoef : 0, // (m2/s), will be updated below, axial dispersion coefficient

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number
  residenceTime : 0, // for timing checks for steady state check

  initialize : function() {

    // *** SPECIAL FOR HX COUPLED TO RXR ***
    // need something here for copy data to table
    // otherwise deactivate


    let v = 0;
    this.dataHeaders[v] = 'heat exchanger values listed above';
    this.dataInputs[v] = '';
    this.dataUnits[v] = '';
    this.dataMin[v] = '';
    this.dataMax[v] = '';
    this.dataInitial[v] = '';
    this.TinHot = ''; // dataInitial used in getInputValue()
    this.dataValues[v] = ''; // current input value for reporting

    // let v = 0;
    // this.dataHeaders[v] = 'TinHot';
    // this.dataInputs[v] = 'input_field_TinHot';
    // this.dataUnits[v] = 'K';
    // this.dataMin[v] = 300;
    // this.dataMax[v] = 370;
    // this.dataInitial[v] = 300;
    // this.TinHot = this.dataInitial[v]; // dataInitial used in getInputValue()
    // this.dataValues[v] = this.TinHot; // current input value for reporting
    //
    // v = 1;
    // this.dataHeaders[v] = 'TinCold';
    // this.dataInputs[v] = 'input_field_TinCold';
    // this.dataUnits[v] = 'K';
    // this.dataMin[v] = 300;
    // this.dataMax[v] = 370;
    // this.dataInitial[v] = 300;
    // this.TinCold =  this.dataInitial[v];
    // this.dataValues[v] = this.TinCold;
    // //
    // v = 2;
    // this.dataHeaders[v] = 'FlowHot';
    // this.dataInputs[v] = 'input_field_FlowHot';
    // this.dataUnits[v] = 'kg/s';
    // this.dataMin[v] = 0.15;
    // this.dataMax[v] = 4.0;
    // this.dataInitial[v] = 0.5;
    // this.FlowHot = this.dataInitial[v];
    // this.dataValues[v] = this.FlowHot;
    // //
    // v = 3;
    // this.dataHeaders[v] = 'FlowCold';
    // this.dataInputs[v] = 'input_field_FlowCold';
    // this.dataUnits[v] = 'kg/s';
    // this.dataMin[v] = 0.15;
    // this.dataMax[v] = 4.0;
    // this.dataInitial[v] = 0.75;
    // this.FlowCold = this.dataInitial[v];
    // this.dataValues[v] = this.FlowCold;
    // //
    // v = 4;
    // this.dataHeaders[v] = 'CpHot';
    // this.dataInputs[v] = 'input_field_CpHot';
    // this.dataUnits[v] =  'kJ/kg/K';
    // this.dataMin[v] = 1;
    // this.dataMax[v] = 10;
    // this.dataInitial[v] = 4.2;
    // this.CpHot = this.dataInitial[v];
    // this.dataValues[v] = this.CpHot;
    // //
    // v = 5;
    // this.dataHeaders[v] = 'CpCold';
    // this.dataInputs[v] = 'input_field_CpCold';
    // this.dataUnits[v] =  'kJ/kg/K';
    // this.dataMin[v] = 1;
    // this.dataMax[v] = 10;
    // this.dataInitial[v] = 4.2;
    // this.CpCold = this.dataInitial[v];
    // this.dataValues[v] = this.CpCold;
    // //
    // v = 6;
    // this.dataHeaders[v] = 'Ucoef';
    // this.dataInputs[v] = 'input_field_Ucoef';
    // this.dataUnits[v] =  'kW/m2/K';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 10;
    // this.dataInitial[v] = 10;
    // this.Ucoef = this.dataInitial[v];
    // this.dataValues[v] = this.Ucoef;
    // //
    // v = 7;
    // this.dataHeaders[v] = 'Area';
    // this.dataInputs[v] = 'input_field_Area';
    // this.dataUnits[v] =  'm2';
    // this.dataMin[v] = 1;
    // this.dataMax[v] = 10;
    // this.dataInitial[v] = 4;
    // this.Area = this.dataInitial[v];
    // this.dataValues[v] = this.Area;
    // //
    // v = 8;
    // this.dataHeaders[v] = 'Diam';
    // this.dataInputs[v] = 'input_field_Diam';
    // this.dataUnits[v] =  'm';
    // this.dataMin[v] = 0.05;
    // this.dataMax[v] = 0.20;
    // this.dataInitial[v] = 0.15;
    // this.Diam = this.dataInitial[v];
    // this.dataValues[v] = this.Diam;
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table in _plotter.js
    // *** FOR HX COUPLED TO RXR, change from = v to = 5
    this.VarCount = v;

    // OUTPUT VARS
    //
    v = 9;
    this.dataHeaders[v] = 'Thot';
    this.dataUnits[v] =  'K';
    this.dataMin[v] = this.dataMin[1]; // [1] is TinCold
    this.dataMax[v] = this.dataMax[0]; // [0] is TinHot
    //
    v = 10;
    this.dataHeaders[v] = 'Tcold';
    this.dataUnits[v] =  'K';
    this.dataMin[v] = this.dataMin[1]; // [1] is TinCold
    this.dataMax[v] = this.dataMax[0]; // [0] is TinHot
    //

    // *** FOR HX COUPLED TO RXR ***
    // processUnits[0] initializes before this processUnits[1]
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Thot[k] = processUnits[0].TinHX;
      this.ThotNew[k] = processUnits[0].TinHX;
      this.Tcold[k] = processUnits[0].TinHX;
      this.TcoldNew[k] = processUnits[0].TinHX;
      // *** FOR HX COUPLED TO RXR ***
      this.FlowHot = processUnits[0].Flowrate; // m3/s in reactor
      // *** reactor Flow is m3/s, whereas heat exchanger flow is kg/s ***
      this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
      this.FlowCold = this.FlowHot;
    }

  }, // END of initialize()

  reset : function() {

    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings

    simParams.ssFlag = false;
    this.SScheck = 0;

    // *** NEW FOR ADIABATIC RXR + HX ***
    // *** GET INFO FROM REACTOR ***
    // processUnits[0] initializes before this processUnits[1]
    let nn = processUnits[0].numNodes;
    this.TinCold = processUnits[0].TinHX;
    this.TinHot = processUnits[0]['Trxr'][nn];
    this.FlowHot = processUnits[0].Flowrate; // m3/s in reactor
    // *** reactor Flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

    // initialize profile data array - must follow function initPlotData in this file
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    // this.stripData = initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = initColorCanvasArray(2,this.numNodes,1);

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Thot[k] = processUnits[0]['dataInitial'][6]; // initial system inlet T
      this.ThotNew[k] = processUnits[0]['dataInitial'][6];
      this.Tcold[k] = processUnits[0]['dataInitial'][6];
      this.TcoldNew[k] = processUnits[0]['dataInitial'][6];
    }

    var kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this array
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = processUnits[0].TinHX;
      this.profileData[1][k][1] = processUnits[0].TinHX;
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

    // // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // // RADIO BUTTONS & CHECK BOX
    // // at least for now, do not check existence of UI elements
    // // Model radio buttons
    // var m00 = document.querySelector('#' + this.inputModel00);
    // var cra = document.querySelector(this.displayColdRightArrow);
    // var cla = document.querySelector(this.displayColdLeftArrow);
    // if (m00.checked) {
    //   // alert('co-current flow');
    //   this.ModelFlag = 0; // co-current flow
    //   cra.style.color = 'blue';
    //   cla.style.color = 'orange';
    //   cra.innerHTML = '&larr;';
    //   cla.innerHTML = '&larr;';
    // } else {
    //   // alert('counter-current flow');
    //   this.ModelFlag = 1; // counter-current flow
    //   cra.style.color = 'orange';
    //   cla.style.color = 'blue';
    //   cra.innerHTML = '&rarr;';
    //   cla.innerHTML = '&rarr;';
    // }

    // // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // // check input fields for new values
    // // function getInputValue() is defined in file process_interface.js
    // // getInputValue(unit index in processUnits, var index in input arrays)
    // var unum = this.unitIndex;
    // this.TinHot = getInputValue(unum, 0);
    // this.TinCold = getInputValue(unum, 1);
    // this.FlowHot = getInputValue(unum, 2);
    // this.FlowCold = getInputValue(unum, 3);
    // this.CpHot = getInputValue(unum, 4);
    // this.CpCold = getInputValue(unum, 5);
    // this.Ucoef = getInputValue(unum, 6);
    // this.Area = getInputValue(unum, 7);
    // this.Diam = getInputValue(unum, 8);

    // also update ONLY inlet T's on ends of heat exchanger in case sim is paused
    // outlet T's not defined on first entry into page
    // but do not do full updateDisplay

    // *** NEW FOR ADIABATIC RXR + HX ***
    // *** GET INFO FROM REACTOR ***
  let nn = processUnits[0].numNodes;
  this.TinCold = processUnits[0].TinHX;
  this.TinHot = processUnits[0]['Trxr'][nn];
  this.FlowHot = processUnits[0].Flowrate; // m3/s in reactor
  // *** reactor Flow is m3/s, whereas heat exchanger flow is kg/s ***
  this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
  this.FlowCold = this.FlowHot;

    document.getElementById(this.displayHotRightT).innerHTML = this.TinHot.toFixed(1) + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById(this.displayColdRightT).innerHTML = this.TinCold.toFixed(1) + ' K';
        break
      case 1: // counter-current
        document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold.toFixed(1) + ' K';
    }

    // update display of tube length and Reynolds number

    // from Area and Diam inputs & specify cylindrical tube
    // can compute Length of heat exchanger
    var Length = this.Area / this.Diam / Math.PI;

    // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // document.getElementById(this.displayLength).innerHTML = 'L (m) = ' + Length.toFixed(1);
    // note use .toFixed(n) method of object to round number to n decimal points

    // note Re is dimensionless Reynolds number in hot flow tube
    var Re = this.FlowHot / this.FluidDensity / this.FluidKinematicViscosity * 4 / Math.PI / this.Diam;

    // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // document.getElementById(this.displayReynoldsNumber).innerHTML = 'Re<sub> hot-tube</sub> = ' + Re.toFixed(0);

    // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    this.DispCoef = 0;
    // // compute axial dispersion coefficient for turbulent flow
    // // Dispersion coefficient correlation for Re > 2000 from Wen & Fan as shown in
    // // https://classes.engineering.wustl.edu/che503/Axial%20Dispersion%20Model%20Figures.pdf
    // // and
    // // https://classes.engineering.wustl.edu/che503/chapter%205.pdf
    // var Ax = Math.PI * Math.pow(this.Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    // var VelocHot = this.FlowHot / this.FluidDensity / Ax; // (m/s), linear fluid velocity
    // this.DispCoef = VelocHot * this.Diam * (3.0e7/Math.pow(Re, 2.1) + 1.35/Math.pow(Re, 0.125)); // (m2/s)

    // NOTE: to see independent effect of DispCoef = 0, set heat transfer
    // coefficient U = 0, since heat exchange contributes to "spreading" of T's
    // NOTE: with DispCoef = 0 and U = 0 you still get effective dispersion
    // because, at zero dispersion coefficient, the finite difference method is
    // same numerically as a mixing-cell-in-series model.
    // Mixing-cell-in-series provide dispersion, though dispersion with some
    // different characteristics, e.g., no upstream information propagation.
    // For N nodes and zero dispersion coefficient value specified,
    // the effective dispersion coefficient = effDisp = v*L/2/(N-1)
    // per https://classes.engineering.wustl.edu/che503/chapter%205.pdf
    // var effDisp = VelocHot * Length / 2 / (this.numNodes + 1 - 1);
    // alert('effDisp = ' + effDisp);
    // alert('this.DispCoef = ' + this.DispCoef);
    // for 200 nodes & default conditions as of 20190505, effDisp = 6e-4 (m2/s)
    // compared to this.DispCoef = four times higher at 25.6e-4 (m2/s)

    // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // // residence time used for timing checks for steady state
    // this.residenceTime = Length / VelocHot;

    // *** DEACTIVATE FOR HX COUPLED TO RXR ***
    // // UPDATE UNIT TIME STEP AND UNIT REPEATS
    //
    // this.unitTimeStep = 0.1 * simParams.simTimeStep; // XXX NEED TO CHECK THIS
    // // // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    // // //                          = space time of equivalent single mixing cell
    // // var spaceTime = (Length / this.numNodes) / VelocHot; // (s)
    // //
    // // // SECOND, estimate unitTimeStep
    // // // do NOT change simParams.simTimeStep here
    // // this.unitTimeStep = spaceTime / 15;
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

    // *** NEW FOR ADIABATIC RXR + HX ***
    // *** GET INFO FROM REACTOR ***
    let nn = processUnits[0].numNodes;
    this.TinCold = processUnits[0].TinHX;
    this.TinHot = processUnits[0]['Trxr'][nn];
    this.FlowHot = processUnits[0].Flowrate; // m3/s in reactor
    // *** reactor Flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

  },

  updateState : function() {
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

      // *** NEW FOR ADIABATIC RXR + HX ***
      // *** GET INFO FROM REACTOR ***
    let nn = processUnits[0].numNodes;
    this.TinCold = processUnits[0].TinHX;
    this.TinHot = processUnits[0]['Trxr'][nn];
    this.FlowHot = processUnits[0].Flowrate; // m3/s in reactor
    // *** reactor Flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

    // *** NEW FOR ADIABATIC RXR + HX ***
    // WARNING: UAcoef can be zero, which interferes with HX method of getting Length
    // pick arbitrary Diam and Area so can get Length and Ax needed below
    this.Diam = 0.1; // arbitrary
    this.Area = 10; // arbitrary
    var UAcoef = processUnits[0].UAcoef;
    this.Ucoef = UAcoef / this.Area;

    // *** NEW FOR ADIABATIC RXR + HX ***
    // fix Cp's here
    CpHot = 4.2; // kJ/kg/K
    CpCold = CpHot;

    // from cylindrical outer Area and Diam inputs & specify cylindrical tube for hot flow
    // can compute Length of exhanger
    var Length = this.Area / this.Diam / Math.PI;

    // XXX check later for different Ax and Veloc for hot and cold
    var Ax = Math.PI * Math.pow(this.Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    var VelocHot = this.FlowHot / this.FluidDensity / Ax; // (m/s), linear fluid velocity
    // XXX assume cold uses same flow cross-sectional area as hot
    var VelocCold = this.FlowCold / this.FluidDensity / Ax; // (m/s), linear fluid velocity

    // note XferCoefHot = U * (wall area per unit length = pi * diam * L/L) / (rho * Cp * Ax)
    var XferCoefHot = this.Ucoef * Math.PI * this.Diam / this.FluidDensity / CpHot / Ax;
    var XferCoefCold = this.Ucoef * Math.PI * this.Diam / this.FluidDensity / CpCold / Ax;

    // Disp (m2/s) is axial dispersion coefficient for turbulent flow
    // this.DispCoef computed in updateUIparams()
    var DispHot = this.DispCoef; // (m2/s), axial dispersion coefficient for turbulent flow

    // *** FOR RXR + HX USE DISP = 0 ***
    DispHot = 0.0 // XXX FOR TESTING

    var DispCold = DispHot; // XXX check later
    var dz = Length / this.numNodes; // (m), distance between nodes
    var VelocHotOverDZ = VelocHot / dz; // precompute to save time in loop
    var VelocColdOverDZ = VelocCold / dz; // precompute to save time in loop
    var DispHotOverDZ2 = DispHot / Math.pow(dz, 2);  // precompute to save time in loop
    var DispColdOverDZ2 = DispCold / Math.pow(dz, 2);  // precompute to save time in loop

    var i = 0; // index for step repeats
    var n = 0; // index for nodes
    var ThotN = 0.0;
    var ThotNm1 = 0.0;
    var ThotNp1 = 0.0;
    var TcoldN = 0.0;
    var TcoldNm1 = 0.0;
    var TcoldNp1 = 0.0;
    var dThotDT = 0.0;
    var dTcoldDT = 0.0;
    var minTinCold = this.dataMin[1];
    var maxTinHot = this.dataMax[0];

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at hot inlet end
      n = 0;

      this.ThotNew[0] = this.TinHot;
      switch(this.ModelFlag) {
        case 0: // co-current, [0] is cold inlet
          this.TcoldNew[0] = this.TinCold;
        break
        case 1: // counter-current, [0] is cold outlet
          this.TcoldNew[0] = this.Tcold[1];
      }

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        // internal nodes include dispersion terms

        ThotN = this.Thot[n];
        ThotNm1 = this.Thot[n-1];
        ThotNp1 = this.Thot[n+1];
        dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                      + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1);

        TcoldN = this.Tcold[n];
        TcoldNm1 = this.Tcold[n-1];
        TcoldNp1 = this.Tcold[n+1];
        switch(this.ModelFlag) {
          case 0: // co-current
            dTcoldDT = VelocColdOverDZ*(TcoldNm1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                          + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
          break
          case 1: // counter-current
            dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                          + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
        }

        ThotN = ThotN + dThotDT * this.unitTimeStep;
        TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

        // XXX // CONSTRAIN T's TO BE IN BOUND
        // if (ThotN > maxTinHot) {ThotN = maxTinHot;}
        // if (ThotN < minTinCold) {ThotN = minTinCold;}
        // if (TcoldN > maxTinHot) {TcoldN = maxTinHot;}
        // if (TcoldN < minTinCold) {TcoldN = minTinCold;}

        // // XXX // CONSTRAIN T's TO BE IN BOUND
        // if (ThotN > 400) {ThotN = 400;}
        // if (ThotN < 300) {ThotN = 300;}
        // if (TcoldN > 400) {TcoldN = 400;}
        // if (TcoldN < 300) {TcoldN = 300;}

        this.ThotNew[n] = ThotN;
        this.TcoldNew[n] = TcoldN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      this.ThotNew[n] = this.Thot[n - 1];
      switch(this.ModelFlag) {
        case 0: // co-current, [n = this.numNodes] is cold outlet
          this.TcoldNew[n] = this.Tcold[n-1];
        break
        case 1: // counter-current, [n = this.numNodes] is cold inlet
          this.TcoldNew[n] = this.TinCold;
      }

      // finished updating all nodes

      // copy new to current
      this.Thot = this.ThotNew;
      this.Tcold = this.TcoldNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // WARNING: has alerts - may be called in simParams.checkForSteadyState()
    // CHECK FOR ENERGY BALANCE ACROSS HEAT EXCHANGER AT STEADY STATE
    // Q = U*A*(dT2 - dT1)/log(dT2/dT1) FOR dT1 != dT2 (or get log = inf)
    var nn = this.numNodes;
    // Thot and Tcold arrays are globals
    var hlt = this.Thot[nn]; // outlet hot
    var hrt = this.Thot[0]; // inlet hot
    var clt = this.Tcold[nn];
    var crt = this.Tcold[0];
    var dT1 = hrt - crt;
    var dT2 = hlt - clt;
    if (dT1 == dT2) {
      alert('dT1 == dT2');
      return;
    }
    // *** for hx coupled to rxr, fix Cp ***
    var CpHot = 4.2; // kJ/kg/K
    var CpCold = CpHot;
    var UAlogMeanDT = this.Ucoef * this.Area * (dT2 - dT1) / Math.log(dT2/dT1); // kJ/s = kW
    var Qhot = (hrt - hlt) * this.FlowHot * CpHot; // kJ/s = kW
    var Qcold = Math.abs((crt - clt) * this.FlowCold * CpCold); // abs for co- or counter-
    var discrep = 100*(UAlogMeanDT/Qhot-1);
    var discrep2 = 100*(UAlogMeanDT/Qcold-1);
    var discrep3 = 100*(Qcold/Qhot-1);
    alert('Qhot = UAlogMeanDT: ' + Qhot + ' = ' + UAlogMeanDT + ', discrepancy = ' + discrep.toFixed(3) + ' %');
    alert('Qcold = UAlogMeanDT: ' + Qcold + ' = ' + UAlogMeanDT + ', discrepancy = ' + discrep2.toFixed(3) + ' %');
    alert('Qhot = Qcold: ' + Qhot + ' = '+ Qcold + ', discrepancy = ' + discrep3.toFixed(3) + ' %');
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    document.getElementById(this.displayHotLeftT).innerHTML = this.Thot[this.numNodes].toFixed(1) + ' K';
    document.getElementById(this.displayHotRightT).innerHTML = this.TinHot.toFixed(1) + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById(this.displayColdLeftT).innerHTML = this.Tcold[this.numNodes].toFixed(1) + ' K';
        document.getElementById(this.displayColdRightT).innerHTML = this.TinCold.toFixed(1) + ' K';
        break
      case 1: // counter-current
        document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold.toFixed(1) + ' K';
        document.getElementById(this.displayColdRightT).innerHTML = this.Tcold[0].toFixed(1) + ' K';
    }

    // HANDLE PROFILE PLOT DATA

    // copy variable values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    for (n=0; n<=this.numNodes; n+=1) {
      this.profileData[0][n][1] = this.Thot[n]; // or d'less (this.Thot[n] - this.TinCold) / (this.TinHot - this.TinCold);
      this.profileData[1][n][1] = this.Tcold[n]; // or d'less (this.Tcold[n] - this.TinCold) / (this.TinHot - this.TinCold);
    }

    // HANDLE COLOR CANVAS DATA >> HERE IS HOT AND COLD SIDES OF EXCHANGER
    // FOR HEAT EXCHANGER
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize colorCanvasData array, take this into account
    // FOR HEAT EXCHANGER - COLOR CANVAS DOES NOT SCROLL WITH TIME
    // SO DO NOT SHIFT AND PUSH DATA LIKE DO IN SCROLLING CANVAS

    // colorCanvasData[v][x][y]
    for (n=0; n<=this.numNodes; n+=1) {
      this.colorCanvasData[0][n][0] = this.Thot[n];
      this.colorCanvasData[1][n][0] = this.Tcold[n];
    }

    // FOR HEAT EXCHANGER - DO NOT USE STRIP CHART YET
    // HANDLE STRIP CHART DATA

  } // end display method

} // END var puHeatExchanger
