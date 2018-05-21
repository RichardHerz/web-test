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

  // checkForSteadyState : function() {
  //   // required - called by process_main.js
  //   // use OS Activity Monitor of CPU load to see effect of this
  //   // not implemented here
  // } // END OF checkForSteadyState()

  checkForSteadyState : function() {
    // processUnits[0] is plug flow reactor in this web lab
    // required - called by process_main.js
    // use OS Activity Monitor of CPU load to see effect of this
    if (this.simTime >= this.oldSimTime + processUnits[0].residenceTime) {
      // check in order to save CPU time when sim is at steady state
      // check for SS by checking for any significant change in array end values
      // but wait at least one residence time after the previous check
      // to allow changes to propagate down reactor
      // create SScheck which is a 16-digit number unique to current 4 end T's
      // NOTE: these are end values in arrays, not those displayed in inlet & outlet fields
      var nn = processUnits[0].numNodes;
      var hlt = 1.0e5 * processUnits[0]['Trxr'][nn].toFixed(1);
      var hrt = 1.0e1 * processUnits[0]['Trxr'][0].toFixed(1);
      var clt = 1.0e-3 * processUnits[0]['Ca'][nn].toFixed(1);
      var crt = 1.0e-7 * processUnits[0]['Ca'][0].toFixed(1);
      var SScheck = hlt + hrt + clt + crt;
      SScheck = SScheck.toFixed(8); // need because last sum operation adds significant figs
      // note SScheck = hlt0hrt0.clt0crt0 << 16 digits, 4 each for 4 end values
      var oldSScheck = processUnits[0].SScheck;
      if (SScheck == oldSScheck) {
        // set ssFlag
        simParams.ssFlag = true;
      } // end if (SScheck == oldSScheck)
      // save current values as the old values
      processUnits[0].SScheck = SScheck;
      simParams.oldSimTime = simParams.simTime;
    } // END OF if (simParams.simTime >= simParams.oldSimTime + processUnits[0].residenceTime)
  } // END OF checkForSteadyState()

}; // END var simParams

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 5 FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var processUnits = new Object();
  // contents must be only the process units as child objects
  // children optionally can be defined in separate script files, e.g., as puHeatExchanger,
  // then inserted into processUnits, e.g., processUnits[0] = puHeatExchanger,
  // then cleared for garbage collection, e.g., puHeatExchanger = null;

processUnits[0] = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'plug flow reactor',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes
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
  // HTML field names may not match this naming convention
  //
  inputKf300 : "input_field_Kf300",
  inputEa : "input_field_Ea",
  inputDelH : "input_field_DelH",
  inputWcat : "input_field_Wcat",
  inputCain : "input_field_Cain",
  inputFlowrate : "input_field_Flowrate",
  inputTin : "input_field_Tin",
  inputUAcoef : "input_field_UA",
  inputTjacket : "input_field_Tjacket",

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayReactorLeftConc: 'field_reactor_left_conc',
  displayReactorRightConc: 'field_reactor_right_conc',
  displayReactorLeftT: 'field_reactor_left_T',
  displayReactorRightT: 'field_reactor_right_T',
  // displayJacketLeftArrow : '#field_jacket_left_arrow', // needs # with ID

  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE... -----
  // ---- EXCEPT simParams.simTimeStep, simParams.simStepRepeats, simParams.ssFlag ----

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 100,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // ADD INITIAL - DEFAULT VALUES FOR INPUTS
  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent

  initialKf300 : 1.0e-7, // (m3/kg/s), rate coefficient at 300 K
  initialEa : 100, // (kJ/mol), activation energy
  initialDelH : -125, // (kJ/mol), enthalpy of reaction
  initialWcat : 100, // (kg), weight (mass) of catalyst
  initialCain : 500, // (mol/m3), inlet reactant concentration
  initialFlowrate : 4.0e-3, // (m3/s), flow rate of reactant
  initialTin : 350, // (K), inlet T of reactant
  initialUAcoef : 0.1, // (kW/kg/K), heat transfer coefficient * area
  initialTjacket: 360, // (K), jacket T

  // SET MIN AND MAX VALUES FOR INPUTS SET IN INPUT FIELDS
  // here set range so solution stable when only one variable changed in
  // min-max range at default conditions
  // NOTE: these min-max may be used in plot definitions in process_plot_info.js

  minKf300 : 0, // (m3/kg/s), rate coefficient at 300 K
  minEa : 0, // (kJ/mol), activation energy
  minDelH : -200, // (kJ/mol), enthalpy of reaction
  minWcat : 0, // (kg), weight (mass) of catalyst
  minCain : 0, // (mol/m3), inlet reactant concentration
  minFlowrate : 0.0, // (m3/s), flow rate of reactant
  minTin : 250, // (K), inlet T of reactant
  minUAcoef : 0, // (kW/kg/K), heat transfer coefficient * area
  minTjacket: 250, // (K), jacket T

  maxKf300 : 10, // (m3/kg/s), rate coefficient at 300 K
  maxEa : 200, // (kJ/mol), activation energy
  maxDelH : 200, // (kJ/mol), enthalpy of reaction
  maxWcat : 1000, // (kg), weight (mass) of catalyst
  maxCain : 1000, // (mol/m3), inlet reactant concentration
  maxFlowrate : 10, // (m3/s), flow rate of reactant
  maxTin : 400, // (K), inlet T of reactant
  maxUAcoef : 100, // (kW/kg/K), heat transfer coefficient * (area per kg cat)
  maxTjacket: 400, // (K), jacket T

  // define arrays to hold data
  Trxr : [],
  Ca : [],
  TrxrNew : [], // 'New' hold intermediate values during updateState
  CaNew : [],
  profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // not used here, for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200,

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number of array end values
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

  Kf300 : this.initialKf300,
  Ea : this.initialEa,
  DelH : this.initialDelH,
  Wcat : this.initialWcat,
  Cain : this.initialCain,
  Flowrate : this.initialFlowrate,
  Tin : this.initialTin,
  UAcoef : this.initialUAcoef,
  Tjacket: this.initialTjacket,

  // max and min Trxr need to be accessible in updateUIparams()
  minTrxr : 200, // (K), changed below
  maxTrxr : 500, // (K), changed below
  // fluid Cp and both dens need to be accessible in updateUIparams()
  // Cp and dens for catalyst set in updateState()
  CpFluid : 2, // (kJ/kg/K)
  densFluid : 1000, // (kg/m3)
  densCat : 1000, // (kg/m3)

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
    this.SScheck = 0; // rest steady state check number of array end values

    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.Tjacket.toFixed(1) + ' K';

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = 0.0 + ' mol/m<sup>3</sup>';

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Trxr[k] = this.initialTjacket; // or initialTin ?
      this.TrxrNew[k] = this.initialTjacket;
      this.Ca[k] = 0; // this.initialCain;
      this.CaNew[k] = 0; // this.initialCain;
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
    for (k=0; k<=this.numNodes; k+=1) {
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
      this.profileData[0][k][1] = this.initialTin;
      this.profileData[1][k][1] = this.initialCain;
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
    this.Kf300 = getInputValue(this.unitIndex,'Kf300');
    this.Ea = getInputValue(this.unitIndex,'Ea');
    this.DelH = getInputValue(this.unitIndex,'DelH');
    this.Wcat = getInputValue(this.unitIndex,'Wcat');
    this.Cain = getInputValue(this.unitIndex,'Cain');
    this.Flowrate = getInputValue(this.unitIndex,'Flowrate');
    this.Tin = getInputValue(this.unitIndex,'Tin');
    this.UAcoef = getInputValue(this.unitIndex,'UAcoef');
    this.Tjacket = getInputValue(this.unitIndex,'Tjacket');

    // calc adiabatic delta T, positive for negative H (exothermic)
    var adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;

    // calc max possible T
    if(this.DelH < 0) {
      // exothermic
      if (this.Tjacket > this.Tin) {
        this.maxTrxr = this.Tjacket + adiabDeltaT;
      } else {
        this.maxTrxr = this.Tin + adiabDeltaT;
      }
    } else {
      // endothermic
      if (this.Tjacket > this.Tin) {
        this.maxTrxr = this.Tjacket;
      } else {
        this.maxTrxr = this.Tin;
      }
    }

    // calc min possible T
    if(this.DelH > 0) {
      // endothermic
      if (this.Tjacket < this.Tin) {
        this.minTrxr = this.Tjacket + adiabDeltaT;
      } else {
        this.minTrxr = this.Tin + adiabDeltaT;
      }
    } else {
      // exothermic
      if (this.Tjacket < this.Tin) {
        this.minTrxr = this.Tjacket;
      } else {
        this.minTrxr = this.Tin;
      }
    }
    if (this.minTrxr < 0) {minT = 0;}

    // adjust axis of profile plot
    plotFlag[0] = 0; // so axes will refresh
    plotsObj[0]['yLeftAxisMin'] = this.minTrxr;
    plotsObj[0]['yLeftAxisMax'] = this.maxTrxr;
    plotsObj[0]['yRightAxisMin'] = 0;
    plotsObj[0]['yRightAxisMax'] = this.Cain;
    // adjust color span of spaceTime, color canvas plots
    plotsObj[1]['varValueMin'] = this.minTrxr;
    plotsObj[1]['varValueMax'] = this.maxTrxr;
    plotsObj[2]['varValueMin'] = this.minTrxr;
    plotsObj[2]['varValueMax'] = this.maxTrxr;

    // also update ONLY inlet values at inlet of reactor in case sim is paused
    // but do not do full updateDisplay
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);

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
    var energyXferCoef = this.UAcoef / CpMean;
    var energyRxnCoef = this.DelH / CpMean;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet end
      n = 0;

      kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

      // special for n=0 is this.Ca[n-1] is this.Cain, this.Trxr[n-1] is this.Tin
      dCaDT = -flowCoef * (this.Ca[n] - this.Cain) - rxnCoef * kT * this.Ca[n];

      dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Tin)
                + energyXferCoef * (this.Tjacket - this.Trxr[n])
                - energyRxnCoef * kT * this.Ca[n];

      CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
      TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

      // CONSTRAIN TO BE IN BOUND
      if (TrxrN > this.maxTrxr) {TrxrN = this.maxTrxr;}
      if (TrxrN < this.minTrxr) {TrxrN = this.minTrxr;}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

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

        // CONSTRAIN TO BE IN BOUND
        if (TrxrN > this.maxTrxr) {TrxrN = this.maxTrxr;}
        if (TrxrN < this.minTrxr) {TrxrN = this.minTrxr;}
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

      // CONSTRAIN TO BE IN BOUND
      if (TrxrN > this.maxTrxr) {TrxrN = this.maxTrxr;}
      if (TrxrN < this.minTrxr) {TrxrN = this.minTrxr;}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = this.TrxrNew;
      this.Ca = this.CaNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // not implemented
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
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
