/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units

// ----- GLOBAL ARRAYS TO HOLD WORKING DATA -----------

var Thot = [];
var Tcold = [];
var ThotNew = []; // new values
var TcoldNew = []; // new values
var tempArray = []; // for shifting data in strip chart plots
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

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "6, heat exchanger"})
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
    // processUnits[0] is heat exchanger in this web lab
    // see its method checkSSvalues() for energy balance at SS
    if (this.simTime >= this.oldSimTime + processUnits[0]['residenceTime']) {
      // check in order to save CPU time when sim is at steady state
      // check for steady state by checking for any significant change in end T's
      // but wait at least one hot flow residence time after the previous check
      // to allow changes to propagate down tubes
      // XXX is hot flow residence time a sufficient time constant - or check cold flow?
      // create SScheck which is a 16-digit number unique to current 4 end T's
      // NOTE: earlier try of checking for max change in dThotDT & dTcoldDT < criterion
      // in puHeatExchanger.updateState() was not successful
      // since those values appeared to settle down to different non-zero values
      // that didn't appear to change with time for different input values
      // NOTE: these are end values in arrays, not those displayed in inlet & outlet fields
      var nn = processUnits[0]['numNodes'];
      // Thot and Tcold arrays are globals
      var hlt = 1.0e5 * Thot[nn].toFixed(1);
      var hrt = 1.0e1 * Thot[0].toFixed(1);
      var clt = 1.0e-3 * Tcold[nn].toFixed(1);
      var crt = 1.0e-7 * Tcold[0].toFixed(1);
      var SScheck = hlt + hrt + clt  + crt;
      SScheck = SScheck.toFixed(8); // need because last sum operation adds significant figs
      // note SScheck = hlt0hrt0.clt0crt0 << 16 digits, 4 each for 4 end T's
      var oldSScheck = processUnits[0]['SScheck'];
      if (SScheck == oldSScheck) {
        // set ssFlag
        simParams.ssFlag = true;
        // processUnits[0].checkSSvalues(); // WARNING - has alerts - TESTING ONLY
      } // end if (SScheck == oldSScheck)

      // save current values as the old values
      processUnits[0]['SScheck'] = SScheck;
      simParams.oldSimTime = simParams.simTime;
    } // END OF if (simParams.simTime >= simParams.oldSimTime + processUnits[0]['residenceTime'])

  } // END OF checkForSteadyState()

}; // END var simParams


// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 5 FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var processUnits = new Object();
  // contents will be only the process units as child objects

processUnits[0] = {
  unitIndex : 0, // index of this unit as child in processUnits parent object 
  // unitIndex used in this object's updateUIparams() method
  name : 'heat exchanger',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes
  // USES GLOBALS
  //    Thot, Tcold, ThotNew, TcoldNew
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
  inputModel00 : "radio_co-current_flow", // model 0 is co-current flow
  inputModel01 : "radio_counter-current_flow", // model 1 is counter-current flow
  inputTinHot : "input_field_TinHot", // K, hot T in
  inputTinCold : "input_field_TinCold", // K, cold T in
  inputFlowHot : "input_field_FlowHot", // kg/s
  inputFlowCold : "input_field_FlowCold", // kg/s
  inputCpHot : "input_field_CpHot", // kJ/kg/K, hot flow heat capacity
  inputCpCold : "input_field_CpCold", // kJ/kg/K, cold flow heat capacity
  inputUcoef : "input_field_Ucoef", // kW/m2/K, U, heat transfer coefficient
  inputArea : "input_field_Area", // m2, heat transfer surface area
  inputDiam : "input_field_diam", // m, tube diameter

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayHotLeftT: 'field_hot_left_T',
  displayHotRightT: 'field_hot_right_T',
  displayColdLeftT: 'field_cold_left_T',
  displayColdRightT: 'field_cold_right_T',
  displayReynoldsNumber : 'field_Reynolds',
  displayLength : 'field_length',
  displayColdLeftArrow : '#field_cold_left_arrow', // needs # with ID
  displayColdRightArrow : '#field_cold_right_arrow', // needs # with ID

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

  initialModelFlag : 1, // 0 is co-current flow, 1 is counter-current flow
  initialTinHot : 360.0, // K, hot T in
  initialTinCold : 310.0, // K, cold T in
  initialFlowHot : 0.5, // kg/s
  initialFlowCold : 0.75, // kg/s
  initialCpHot : 4.2, // kJ/kg/K, hot flow heat capacity
  initialCpCold : 4.2, // kJ/kg/K, cold flow heat capacity
  initialUcoef : 0.6, // kW/m2/K, U, heat transfer coefficient
  initialArea : 4.0, // m2, heat transfer surface area
  initialDiam : 0.15, // m, tube diameter
  initialDispCoef : 0.0, // (m2/s), axial dispersion coefficient

  // SET MIN AND MAX VALUES FOR INPUTS SET IN INPUT FIELDS
  // here set range so solution stable when only one variable changed in
  // min-max range at default conditions
  // NOTE: these min-max may be used in plot definitions in process_plot_info.js

  minTinHot : 300.0, // K, hot T in
  minTinCold : 300.0, // K, cold T in
  minFlowHot : 0.15, // kg/s
  minFlowCold : 0.15, // kg/s
  minCpHot : 1, // kJ/kg/K, hot flow heat capacity
  minCpCold : 1, // kJ/kg/K, cold flow heat capacity
  minUcoef : 0.0, // kW/m2/K, U, heat transfer coefficient, allow zero
  minArea : 1, // m2, heat transfer surface area
  minDiam : 0.05, // m, tube diameter

  maxTinHot : 370.0, // K, hot T in
  maxTinCold : 370.0, // K, cold T in
  maxFlowHot : 4, // kg/s
  maxFlowCold : 4, // kg/s
  maxCpHot : 10, // kJ/kg/K, hot flow heat capacity
  maxCpCold : 10, // kJ/kg/K, cold flow heat capacity
  maxUcoef : 10, // kW/m2/K, U, heat transfer coefficient
  maxArea : 10, // m2, heat transfer surface area
  maxDiam : 0.28, // m, tube diameter

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200,
  // NOTE 20180427: discrepancy between steady-state Qcold and Qhot (from Qcold/Qhot)
  // from array end values with dispersion decreases as number of nodes increases
  // but shows same output field T's to one decimal place for 200-800 nodes

  // for Reynolds number Re, use kinematic viscosity from
  // https://www.engineeringtoolbox.com/water-dynamic-kinematic-viscosity-d_596.html?vA=30&units=C#
  FluidKinematicViscosity : 5.0e-7, // m2/s, for water at mid-T of 330 K for Reynolds number
  FluidDensity : 1000.0, // kg/m3, fluid density specified to be that of water

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
  ModelFlag : this.initialModelFlag, // 0 is cocurrent flow, 1 is countercurrent flow
  TinHot : this.initialTinHot, // K, hot T in
  TinCold : this.initialTinCold, // K, cold T in
  FlowHot : this.initialFlowHot, // dm3/s
  FlowCold : this.initialFlowCold, // dm3/s
  CpHot : this.initialCpHot, // kJ/dm3/K, hot flow heat capacity
  CpCold : this.initialCpCold, // kJ/dm3/K, cold flow heat capacity
  Ucoef : this.initialUcoef, // J/s/K/m2, U, heat transfer coefficient
  Area : this.initialArea, // m2, heat transfer surface area
  Diam : this.initialDiam, // m, tube diameter
  DispCoef : this.initialDispCoef, // (m2/s), axial dispersion coefficient

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
      Thot[k] = this.initialTinCold;
      ThotNew[k] = this.initialTinCold;
      Tcold[k] = this.initialTinCold;
      TcoldNew[k] = this.initialTinCold;
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
      // for heat exchanger this is dimensionless T
      // (T - TinCold) / (TinHot - TinCold)
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

    // RADIO BUTTONS & CHECK BOX
    // at least for now, do not check existence of UI elements
    // Model radio buttons
    var m00 = document.querySelector('#' + this.inputModel00);
    var cra = document.querySelector(this.displayColdRightArrow);
    var cla = document.querySelector(this.displayColdLeftArrow);
    if (m00.checked) {
      this.ModelFlag = 0; // co-current flow
      cra.style.color = 'blue';
      cla.style.color = 'orange';
      cra.innerHTML = '&larr;';
      cla.innerHTML = '&larr;';
    } else {
      this.ModelFlag = 1; // counter-current flow
      cra.style.color = 'orange';
      cla.style.color = 'blue';
      cra.innerHTML = '&rarr;';
      cla.innerHTML = '&rarr;';
    }

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    this.TinHot = getInputValue(this.unitIndex,'TinHot');
    this.TinCold = getInputValue(this.unitIndex,'TinCold');
    this.FlowHot = getInputValue(this.unitIndex,'FlowHot');
    this.FlowCold = getInputValue(this.unitIndex,'FlowCold');
    this.CpHot = getInputValue(this.unitIndex,'CpHot');
    this.CpCold = getInputValue(this.unitIndex,'CpCold');
    this.Ucoef = getInputValue(this.unitIndex,'Ucoef');
    this.Area = getInputValue(this.unitIndex,'Area');
    this.Diam = getInputValue(this.unitIndex,'Diam');

    // also update ONLY inlet T's on ends of heat exchanger in case sim is paused
    // outlet T's not defined on first entry into page
    // but do not do full updateDisplay
    document.getElementById(this.displayHotRightT).innerHTML = this.TinHot + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById(this.displayColdRightT).innerHTML = this.TinCold + ' K';
        break
      case 1: // counter-current
        document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold + ' K';
    }

    // update display of tube length and Reynolds number

    // from Area and Diam inputs & specify cylindrical tube
    // can compute Length and Volume
    var Length = this.Area / this.Diam / Math.PI;
    var Volume = Length * Math.PI * Math.pow(this.Diam, 2) / 4.0;

    document.getElementById(this.displayLength).innerHTML = 'L (m) = ' + Length.toFixed(1);
    // note use .toFixed(n) method of object to round number to n decimal points

    // note Re is dimensionless Reynolds number in hot flow tube
    var Re = this.FlowHot / this.FluidDensity / this.FluidKinematicViscosity * 4 / Math.PI / this.Diam;
    document.getElementById(this.displayReynoldsNumber).innerHTML = 'Re<sub> hot-tube</sub> = ' + Re.toFixed(0);

    // compute axial dispersion coefficient for turbulent flow
    // Dispersion coefficient correlation for Re > 2000 from Wen & Fan as shown in
    // https://classes.engineering.wustl.edu/che503/Axial%20Dispersion%20Model%20Figures.pdf
    // and
    // https://classes.engineering.wustl.edu/che503/chapter%205.pdf
    var Ax = Math.PI * Math.pow(this.Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    var VelocHot = this.FlowHot / this.FluidDensity / Ax; // (m/s), linear fluid velocity
    this.DispCoef = VelocHot * this.Diam * (3.0e7/Math.pow(Re, 2.1) + 1.35/Math.pow(Re, 0.125)); // (m2/s)

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

    // residence time used for timing checks for steady state
    this.residenceTime = Length / VelocHot;

    // UPDATE UNIT TIME STEP AND UNIT REPEATS

    // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    //                          = space time of equivalent single mixing cell
    var spaceTime = (Length / this.numNodes) / VelocHot; // (s)

    // SECOND, estimate unitTimeStep
    // do NOT change simParams.simTimeStep here
    this.unitTimeStep = spaceTime / 15;

    // THIRD, get integer number of unitStepRepeats
    this.unitStepRepeats = Math.round(simParams.simTimeStep / this.unitTimeStep);
    // min value of unitStepRepeats is 1 or get divide by zero error
    if (this.unitStepRepeats <= 0) {this.unitStepRepeats = 1;}

    // FOURTH and finally, recompute unitTimeStep with integer number unitStepRepeats
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

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

    // from cylindrical outer Area and Diam inputs & specify cylindrical tube for hot flow
    // can compute Length and Volume
    var Length = this.Area / this.Diam / Math.PI;

    // XXX check later for different Volume, Ax and Veloc for hot and cold
    var Volume = Length * Math.PI * Math.pow(this.Diam, 2) / 4.0;
    var Ax = Math.PI * Math.pow(this.Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    var VelocHot = this.FlowHot / this.FluidDensity / Ax; // (m/s), linear fluid velocity
    // XXX assume cold uses same flow cross-sectional area as hot
    var VelocCold = this.FlowCold / this.FluidDensity / Ax; // (m/s), linear fluid velocity

    // note XferCoefHot = U * (wall area per unit length = pi * diam * L/L) / (rho * Cp * Ax)
    var XferCoefHot = this.Ucoef * Math.PI * this.Diam / this.FluidDensity / this.CpHot / Ax;
    var XferCoefCold = this.Ucoef * Math.PI * this.Diam / this.FluidDensity / this.CpCold / Ax;
    // Disp (m2/s) is axial dispersion coefficient for turbulent flow
    // this.DispCoef computed in updateUIparams()
    var DispHot = this.DispCoef; // (m2/s), axial dispersion coefficient for turbulent flow
    // DispHot = 0.0 // FOR TESTING
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

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at hot inlet end
      n = 0;

      // get better steady-state energy balances with no dispersion at ends

      ThotN = Thot[n];
      ThotNm1 = this.TinHot; // SPECIAL for n=0 cell, hot inlet
      dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN);

      TcoldN = Tcold[n];
      TcoldNm1 = this.TinCold; // special for n=0 cell, cold inlet for co-current
      TcoldNp1 = Tcold[n+1];
      switch(this.ModelFlag) {
        case 0: // co-current
          dTcoldDT = VelocColdOverDZ*(TcoldNm1-TcoldN) + XferCoefCold*(ThotN-TcoldN);
        break
        case 1: // counter-current
          dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN);
      }

      ThotN = ThotN + dThotDT * this.unitTimeStep;
      TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

      // CONSTRAIN T's TO BE IN BOUND
      if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
      if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
      if (TcoldN > this.maxTinHot) {TcoldN = this.maxTinHot;}
      if (TcoldN < this.minTinCold) {TcoldN = this.minTinCold;}

      ThotNew[n] = ThotN;
      TcoldNew[n] = TcoldN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        // internal nodes include dispersion terms

        ThotN = Thot[n];
        ThotNm1 = Thot[n-1];
        ThotNp1 = Thot[n+1];
        dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                      + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1);

        TcoldN = Tcold[n];
        TcoldNm1 = Tcold[n-1];
        TcoldNp1 = Tcold[n+1];
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

        // CONSTRAIN T's TO BE IN BOUND
        if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
        if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
        if (TcoldN > this.maxTinHot) {TcoldN = this.maxTinHot;}
        if (TcoldN < this.minTinCold) {TcoldN = this.minTinCold;}

        ThotNew[n] = ThotN;
        TcoldNew[n] = TcoldN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      // get better steady-state energy balances with no dispersion at ends

      ThotN = Thot[n];
      ThotNm1 = Thot[n-1];
      dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN);

      TcoldN = Tcold[n];
      TcoldNm1 = Tcold[n-1];
      TcoldNp1 = this.TinCold; // SPECIAL for n=numNodes cell, cold inlet for counter-current
      switch(this.ModelFlag) {
        case 0: // co-current
          dTcoldDT = VelocColdOverDZ*(TcoldNm1-TcoldN) + XferCoefCold*(ThotN-TcoldN);
          break
        case 1: // counter-current
          dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN);
      }

      ThotN = ThotN + dThotDT * this.unitTimeStep;
      TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

      // CONSTRAIN T's TO BE IN BOUND
      if (ThotN > this.maxTinHot) {ThotN = this.maxTinHot;}
      if (ThotN < this.minTinCold) {ThotN = this.minTinCold;}
      if (TcoldN > this.maxTinHot) {TcoldN = this.maxTinHot;}
      if (TcoldN < this.minTinCold) {TcoldN = this.minTinCold;}

      ThotNew[n] = ThotN;
      TcoldNew[n] = TcoldN;

      // finished updating all nodes

      // copy new to current
      Thot = ThotNew;
      Tcold = TcoldNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // WARNING: has alerts - may be called in simParams.checkForSteadyState()
    // CHECK FOR ENERGY BALANCE ACROSS HEAT EXCHANGER AT STEADY STATE
    // Q = U*A*(dT2 - dT1)/log(dT2/dT1) FOR dT1 != dT2 (or get log = inf)
    // NOTE: these are end values in arrays, not those displayed in inlet & outlet fields
    var nn = puHeatExchanger.numNodes;
    // Thot and Tcold arrays are globals
    var hlt = Thot[nn]; // outlet hot
    var hrt = Thot[0]; // inlet hot
    var clt = Tcold[nn];
    var crt = Tcold[0];
    var dT1 = hrt - crt;
    var dT2 = hlt - clt;
    if (dT1 == dT2) {
      alert('dT1 == dT2');
      return;
    }
    var UAlogMeanDT = this.Ucoef * this.Area * (dT2 - dT1) / Math.log(dT2/dT1); // kJ/s = kW
    var Qhot = (hrt - hlt) * this.FlowHot * this.CpHot; // kJ/s = kW
    var Qcold = Math.abs((crt - clt) * this.FlowCold * this.CpCold); // abs for co- or counter-
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
      profileData[0][n][1] = Thot[n]; // or d'less (Thot[n] - this.TinCold) / (this.TinHot - this.TinCold);
      profileData[1][n][1] = Tcold[n]; // or d'less (Tcold[n] - this.TinCold) / (this.TinHot - this.TinCold);
    }

    // HANDLE SPACE-TIME DATA >> HERE IS HOT AND COLD SIDES OF EXCHANGER
    // FOR HEAT EXCHANGER
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize spaceTimeData array, take this into account

    // spaceTimeData[v][t][s] - variable, time changes to space, space changes to one value
    for (n=0; n<=this.numNodes; n+=1) {
      spaceTimeData[0][n][0] = Thot[n];
      spaceTimeData[1][n][0] = Tcold[n];
    }

    // FOR HEAT EXCHANGER - COLOR CANVAS DOES NOT SCROLL WITH TIME
    // SO DO NOT SHIFT AND PUSH DATA LIKE DO IN SCROLLING CANVAS

    // FOR HEAT EXCHANGER - DO NOT USE STRIP CHART YET
    // HANDLE STRIP CHART DATA

  } // end display method

} // END var puHeatExchanger
