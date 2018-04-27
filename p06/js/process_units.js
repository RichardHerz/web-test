/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units
// For functions that use these objects, see files
// process_main.js and process_plotter.js.

// ----- ARRAYS TO HOLD WORKING DATA -----------

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

  // ssFlag new for process with one unit - rethink for multiple-unit processes
  // unit's updateState can set ssFlag true when unit reaches steady state
  // REDUCES CPU LOAD ONLY when return from top of process_main.js functions
  // updateProcessUnits and updateDisplay but NOT from top of unit functions here
  ssFlag : false, // steady state flag set true when sim reaches steady state
  oldSimTime : 0, // (s), time at last check for steady state
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

  // LIST ACTIVE PROCESS UNITS
  // processUnits array is the list of names of active process units
  // the order of units in the list is not important

  processUnits : [
    "puHeatExchanger"
  ],

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    // $.post(this.runLoggerURL,{webAppNumber: "2, rxn-diff"}) .done(function(data) {
      // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

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
  }

}; // END var simParams


// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 5 FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var puHeatExchanger = {
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puController.command.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //   e.g., inputModel01 : "radio_Model_1",
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
  //   no user entered values for this unit
  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE EXCEPT -----
  // ------- simParams.simTimeStep and simParams.simStepRepeats ----

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for dt in this case in this unit's updateInputs method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

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

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200,

  // for Reynolds number Re, use kinematic viscosity from
  // https://www.engineeringtoolbox.com/water-dynamic-kinematic-viscosity-d_596.html?vA=30&units=C#
  FluidKinematicViscosity : 5.0e-7, // m2/s, for water at mid-T of 330 K for Reynolds number
  FluidDensity : 1000.0, // kg/m3, fluid density specified to be that of water

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number
  residenceTime : 0, // for timing checks for steady state check

  // XXX WARNING: THESE DO NOT HAVE ANY EFFECT HERE WHEN
  //     THEY ARE ALSO SET IN updateUIparams
  //     BUT WHEN NOT SET IN updateUIparams THEN setting to
  //     this.initial___ HAS NO EFFECT AND GET NaN
  // if list here must supply a value (e.g., this.initial___) but if not
  // list here then apparently is created in updateUIparams...
  //   e.g., Cmax : this.initialCmax,
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

    // alert('enter reset function'); // XXX

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

    // XXX also need to reset strip chart data

    // WARNING - if change a value to see initialization here
    // then reset it to zero below this line or will get results at this node
    // document.getElementById("dev01").innerHTML = "RESET time = " + simParams.simTime.toFixed(0) + "; y = " + y[0];

    // alert('exit reset function'); // XXX

  }, // end reset

  updateUIparams : function() {

    // alert('enter updateUIparams function'); // XXX

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
    var cra = document.querySelector('#field_cold_right_arrow');
    var cla = document.querySelector('#field_cold_left_arrow');
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

    if (document.getElementById(this.inputTinHot)) {
      let tmpFunc = new Function("return " + this.inputTinHot + ".value;");
      this.TinHot = tmpFunc();
      this.TinHot = Number(this.TinHot); // force any string to number
      this.TinHot = this.TinHot;
    } else {
      this.TinHot = this.initialTinHot;
    }

    if (document.getElementById(this.inputTinCold)) {
      let tmpFunc = new Function("return " + this.inputTinCold + ".value;");
      this.TinCold = tmpFunc();
      this.TinCold = Number(this.TinCold); // force any string to number
      this.TinCold = this.TinCold;
    } else {
      this.TinCold = this.initialTinCold;
    }

    if (document.getElementById(this.inputFlowHot)) {
      let tmpFunc = new Function("return " + this.inputFlowHot + ".value;");
      this.FlowHot = tmpFunc();
      this.FlowHot = Number(this.FlowHot); // force any string to number
    } else {
      this.FlowHot = this.initialFlowHot;
    }

    if (document.getElementById(this.inputFlowCold)) {
      let tmpFunc = new Function("return " + this.inputFlowCold + ".value;");
      this.FlowCold = tmpFunc();
      this.FlowCold = Number(this.FlowCold); // force any string to number
    } else {
      this.FlowCold = this.initialFlowCold;
    }

    if (document.getElementById(this.inputCpHot)) {
      let tmpFunc = new Function("return " + this.inputCpHot + ".value;");
      this.CpHot = tmpFunc();
      this.CpHot = Number(this.CpHot); // force any string to number
    } else {
      this.CpHot = this.initialCpHot;
    }

    if (document.getElementById(this.inputCpCold)) {
      let tmpFunc = new Function("return " + this.inputCpCold + ".value;");
      this.CpCold = tmpFunc();
      this.CpCold = Number(this.CpCold); // force any string to number
    } else {
      this.CpCold = this.initialCpCold;
    }

    if (document.getElementById(this.inputUcoef)) {
      let tmpFunc = new Function("return " + this.inputUcoef+ ".value;");
      this.Ucoef= tmpFunc();
      this.Ucoef = Number(this.Ucoef); // force any string to number
    } else {
      this.Ucoef= this.initialUcoef;
    }

    if (document.getElementById(this.inputArea)) {
      let tmpFunc = new Function("return " + this.inputArea + ".value;");
      this.Area = tmpFunc();
      this.Area = Number(this.Area); // force any string to number
    } else {
      this.Area = this.initialArea;
    }

    if (document.getElementById(this.inputDiam)) {
      let tmpFunc = new Function("return " + this.inputDiam + ".value;");
      this.Diam = tmpFunc();
      this.Diam = Number(this.Diam ); // force any string to number
    } else {
      this.Diam = this.initialDiam;
    }

    // also update ONLY inlet T's on ends of heat exchanger in case sim is paused
    // outlet T's not defined on first entry into page
    // but do not do full updateDisplay
    document.getElementById("field_hot_right_T").innerHTML = this.TinHot + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById("field_cold_right_T").innerHTML = this.TinCold + ' K';
        break
      case 1: // counter-current
        document.getElementById("field_cold_left_T").innerHTML = this.TinCold + ' K';
    }

    // update display of tube length and Reynolds number

    // from Area and Diam inputs & specify cylindrical tube
    // can compute Length and Volume
    var Length = this.Area / this.Diam / Math.PI;
    var Volume = Length * Math.PI * Math.pow(this.Diam, 2) / 4.0;

    document.getElementById("field_length").innerHTML = 'L (m) = ' + Length.toFixed(1);
    // note use .toFixed(n) method of object to round number to n decimal points

    // note Re is dimensionless Reynolds number in hot flow tube
    var Re = this.FlowHot / this.FluidDensity / this.FluidKinematicViscosity * 4 / Math.PI / this.Diam;
    document.getElementById("field_Reynolds").innerHTML = 'Re<sub> hot-tube</sub> = ' + Re.toFixed(0);

    // compute axial dispersion coefficient for turbulent flow
    // Dispersion coefficient correlation for Re > 2000 from Wen & Fan as shown in
    // https://classes.engineering.wustl.edu/che503/Axial%20Dispersion%20Model%20Figures.pdf
    // and
    // https://classes.engineering.wustl.edu/che503/chapter%205.pdf
    var Ax = Math.PI * Math.pow(this.Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    var VelocHot = this.FlowHot / this.FluidDensity / Ax; // (m/s), linear fluid velocity
    this.DispCoef = VelocHot * this.Diam * (3.0e7/Math.pow(Re, 2.1) + 1.35/Math.pow(Re, 0.125)); // (m2/s)
    // document.getElementById("field_output_field").innerHTML = 'this.DispCoef = ' + this.DispCoef;

    // residence time used for timing checks for steady state
    this.residenceTime = Length / VelocHot;

    // alert('residence time = ' + Length / VelocHot);

    // UPDATE UNIT TIME STEP AND UNIT REPEATS

    // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    //                          = space time of equivalent single mixing cell
    var spaceTime = (Length / this.numNodes) / VelocHot; // (s)
    // document.getElementById("field_output_field").innerHTML = 'cell residence time = ' + spaceTime;

    // SECOND, estimate unitTimeStep
    // do NOT change simParams.simTimeStep here
    this.unitTimeStep = spaceTime / 15;

    // THIRD, get integer number of unitStepRepeats
    this.unitStepRepeats = Math.round(simParams.simTimeStep / this.unitTimeStep);
    // min value of unitStepRepeats is 1 or get divide by zero error
    if (this.unitStepRepeats <= 0) {this.unitStepRepeats = 1;}

    // FOURTH and finally, recompute unitTimeStep with integer number unitStepRepeats
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
    // document.getElementById("field_output_field").innerHTML = 'this.unitStepRepeats = ' + this.unitStepRepeats;

    // alert('exit updateUIparams function'); // XXX

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

    // document.getElementById("dev01").innerHTML = "UPDATE time = " + simParams.simTime.toFixed(0) + "; y = " + inverseDz2;
    // document.getElementById("field_output_field").innerHTML = "UPDATE time = " + simParams.simTime.toFixed(0) + "; Thot[this.numNodes] = " + Thot[this.numNodes];
    // document.getElementById("field_output_field").innerHTML = "UPDATE time = " + simParams.simTime.toFixed(0) + "; TinCold = " + this.TinCold;

    // from Area and Diam inputs & specify cylindrical tube for hot flow
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
    // DispHot = 0.0 // XXX TEST
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
    var absDT = 0.0;
    var dTmax = 0.0;

    var NmaxDThot = 999;
    var NmaxDTcold = 999;
    var DThot = 0;
    var DTcold = 0;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // reset dTmax at top every repeat or get stuck with initial large change
      dTmax = 0.0;

      // do node at hot inlet end
      n = 0;

      ThotN = Thot[n];
      ThotNp1 = Thot[n+1];
      ThotNm1 = this.TinHot; // SPECIAL for n=0 cell, hot inlet
      dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                    + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1);

      TcoldN = Tcold[n];
      TcoldNp1 = Tcold[n+1];
      switch(this.ModelFlag) {
        case 0: // co-current
          TcoldNm1 = this.TinCold; // special for n=0 cell, cold inlet for co-current
          dTcoldDT = VelocColdOverDZ*(TcoldNm1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                        + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
        break
        case 1: // counter-current
          TcoldNm1 = Tcold[n]; // special for n=0 cell, cold outlet for counter-current
          dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                        + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
      }

      ThotN = ThotN + dThotDT * this.unitTimeStep;
      TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

      // CONSTRAIN T's TO BE IN BOUND
      // can not use TinHot and TinCold because want to be able
      // to change these in middle of a run
      if (ThotN > plotsObj[0]['yLeftAxisMax']) {ThotN = plotsObj[0]['yLeftAxisMax'];}
      if (ThotN < plotsObj[0]['yLeftAxisMin']) {ThotN = plotsObj[0]['yLeftAxisMin'];}
      if (TcoldN > plotsObj[0]['yLeftAxisMax']) {TcoldN = plotsObj[0]['yLeftAxisMax'];}
      if (TcoldN < plotsObj[0]['yLeftAxisMin']) {TcoldN = plotsObj[0]['yLeftAxisMin'];}
      // XXX maybe change primary location of these values to simParams...?

      ThotNew[n] = ThotN;
      TcoldNew[n] = TcoldN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        ThotN = Thot[n];
        ThotNp1 = Thot[n+1];
        ThotNm1 = Thot[n-1];
        dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                      + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1);

        TcoldN = Tcold[n];
        TcoldNp1 = Tcold[n+1];
        TcoldNm1 = Tcold[n-1];
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
        // can not use TinHot and TinCold because want to be able
        // to change these in middle of a run
        if (ThotN > plotsObj[0]['yLeftAxisMax']) {ThotN = plotsObj[0]['yLeftAxisMax'];}
        if (ThotN < plotsObj[0]['yLeftAxisMin']) {ThotN = plotsObj[0]['yLeftAxisMin'];}
        if (TcoldN > plotsObj[0]['yLeftAxisMax']) {TcoldN = plotsObj[0]['yLeftAxisMax'];}
        if (TcoldN < plotsObj[0]['yLeftAxisMin']) {TcoldN = plotsObj[0]['yLeftAxisMin'];}

        ThotNew[n] = ThotN;
        TcoldNew[n] = TcoldN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      ThotN = Thot[n];
      ThotNm1 = Thot[n-1];
      ThotNp1 = Thot[n]; // SPECIAL at hot outlet
      dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                    + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1);

      TcoldN = Tcold[n];
      TcoldNm1 = Tcold[n-1];
      switch(this.ModelFlag) {
        case 0: // co-current
          TcoldNp1 = Tcold[n]; // SPECIAL for n=numNodes cell, cold outlet for co-current
          dTcoldDT = VelocColdOverDZ*(TcoldNm1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                        + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
          break
        case 1: // counter-current
          TcoldNp1 = this.TinCold; // SPECIAL for n=numNodes cell, cold inlet for counter-current
          dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                        + DispColdOverDZ2 * (TcoldNp1 - 2.0 * TcoldN + TcoldNm1);
      }

      ThotN = ThotN + dThotDT * this.unitTimeStep;
      TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

      // CONSTRAIN T's TO BE IN BOUND
      // can not use TinHot and TinCold because want to be able
      // to change these in middle of a run
      if (ThotN > plotsObj[0]['yLeftAxisMax']) {ThotN = plotsObj[0]['yLeftAxisMax'];}
      if (ThotN < plotsObj[0]['yLeftAxisMin']) {ThotN = plotsObj[0]['yLeftAxisMin'];}
      if (TcoldN > plotsObj[0]['yLeftAxisMax']) {TcoldN = plotsObj[0]['yLeftAxisMax'];}
      if (TcoldN < plotsObj[0]['yLeftAxisMin']) {TcoldN = plotsObj[0]['yLeftAxisMin'];}

      ThotNew[n] = ThotN;
      TcoldNew[n] = TcoldN;

      // finished updating all nodes

      // copy new to current
      Thot = ThotNew;
      Tcold = TcoldNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
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
    var RHS = this.Ucoef * this.Area * (dT2 - dT1) / Math.log(dT2/dT1); // kJ/s = kW
    var Qhot = (hrt - hlt) * this.FlowHot * this.CpHot; // kJ/s = kW
    alert('Qhot = RHS: ' + Qhot + ' = ' + RHS);
    // getting about 2.5% discrepancy that increases somewhat as
    // the two dT's approach same values...
    // similar discrepancy using inlet & outlet display values
    var Qcold = (crt - clt) * this.FlowCold * this.CpCold;
    alert('Qhot = Qcold: ' + Qhot + ' = '+ Math.abs(Qcold)); // abs for co- or counter-
    // got about 1% discrepancy in Q's using either array ends or display values
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index
    document.getElementById("field_hot_left_T").innerHTML = Thot[this.numNodes].toFixed(1) + ' K';
    document.getElementById("field_hot_right_T").innerHTML = this.TinHot + ' K';
    switch(this.ModelFlag) {
      case 0: // co-current
        document.getElementById("field_cold_left_T").innerHTML = Tcold[this.numNodes].toFixed(1) + ' K';
        document.getElementById("field_cold_right_T").innerHTML = this.TinCold + ' K';
        break
      case 1: // counter-current
        document.getElementById("field_cold_left_T").innerHTML = this.TinCold + ' K';
        document.getElementById("field_cold_right_T").innerHTML = Tcold[0].toFixed(1) + ' K';
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

}; // END var puHeatExchanger
