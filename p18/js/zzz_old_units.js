/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units
// For functions that use these objects, see files
// process_main.js and process_plotter.js.

// ----- ARRAYS TO HOLD WORKING DATA -----------

var y = []; // reactant gas in catalyst layer
var y2 = []; // product gas in catalyst layer
var yNew = []; // new values for reactant gas in layer
var y2New = []; // new values for product gas in layer
var tempArray = []; // for shifting data in strip chart plots
var spaceData = []; // for shifting data in space-time plots
var cinNew = 0;
var cinOld = 0;
var caNew = 0;
var cbNew = 0;

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

  // ssFlag new for process with one unit - rethink for multiple-unit processes
  // unit's updateState can set ssFlag true when unit reaches steady state
  // REDUCES CPU LOAD ONLY when return from top of process_main.js functions
  // updateProcessUnits and updateDisplay but NOT from top of unit functions here
  ssFlag : false, // steady state flag set true when sim reaches steady state
  // also see below in simParams the var oldSimTime and function checkForSteadyState()

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
  simTimeStep : 16, // time step value, simulation time, of main repeat

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
    "puCatalystLayer"
  ],

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "2, rxn-diff"}) .done(function(data) {
      document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

  updateCurrentRunCountDisplay : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    $.post(this.runCurrrentRunCountURL) .done(function(data) {
      document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
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
    // required - called by file main.js
    // not implemented here
    // see Web Lab - Heat Exchanger for example
  } // END OF checkForSteadyState()

}; // END var simParams


// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 5 FUNCTIONS:
//   reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var puCatalystLayer = {
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puController.command.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //
  // WARNING: the function getInputValue() called by updateUIparams() below
  // requires a specific naming convention for vars set in INPUT FIELDS
  // for the input ID, and initial, min and max values for each variable
  // e.g., TinHot requires inputTinHot, initialTinHot, minTinHot, maxTinHot
  //
  inputModel01 : "radio_Model_1",
  inputModel02 : "radio_Model_2",
  inputCmax : "range_setCmax_slider",
  inputCmaxInput : 'input_setCmax_value',
  inputRadioConstant : "radio_Constant",
  inputCheckBoxFeed : "checkbox_on",
  inputRadioSine : "radio_Sine",
  inputRadioSquare : "radio_Square",
  inputPeriod : "input_field_enterCyclePeriod",
  inputDuty : "input_field_enterDuty",
  inputKflow : "input_field_enterKflow",
  inputKads : "input_field_enterKads",
  inputKdiff : "input_field_enterKdiff",
  inputPhi : "input_field_enterThieleMod",
  inputAlpha :  "input_field_enterAlpha",
  inputBscale : "input_field_enterBscale",

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  //   no user entered values for this unit

  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE... -----
  // ---- EXCEPT simParams.simTimeStep and simParams.simStepRepeats ----

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for dt in this case in this unit's updateInputs method
  unitStepRepeats : 1200,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN CATALYST LAYER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent
  //
  initialCmax : 1.0,
  initialCmaxInput : 1.0,
  initialKflow : 2.5, // Q/Vp/k-1 = (Q/Vc/k-1) / (Vp/Vc)
  initialKads : 1,
  initialKdiff : 0.003,
  initialPhi : 34, // Phi = Thiele Modulus
  initialAlpha : 10,
  initialModel : 2, // use integers 1,2 - used in Math.pow(), selects rate determining step
  initialShape : 'sine', // constant, off, sine, square
  initialPeriod : 500, // 0.007854 = Math.PI / 400
  initialDuty : 50, // percent on, duty cycle for square cycling
  initialBscale : 1,

  // XXX WARNING: SETTING TO this.initial___ BELOW HAS NO EFFECT HERE WHEN
  //     THEY ARE ALSO SET IN updateUIparams
  //     BUT WHEN NOT SET IN updateUIparams THEN setting to
  //     this.initial___ HAS NO EFFECT AND GET NaN
  // if list here must supply a value (e.g., this.initial___) but if not
  //     list here then apparently is created in updateUIparams...
  //
  // HUH? NEED TO EXPLORE THIS....
  //
  Cmax : 1.0, // this.initialCmax,
  CmaxInput : 1.0,
  // user will vary Kflow space time based on pellet/layer volume Vp
  Kflow : 2.5, // this.initialKflow, // d'less space time, Q/Vp/k-1 = (Q/Vc/k-1)/(Vp/Vc)
  Kads : 1, // this.initialKads,
  Kdiff : 0.003, // this.initialKdiff,
  Phi : 34, // this.initialPhi, // Phi = ThieleMod
  Alpha : 10, // this.initialAlpha,
  Model : 2, // this.initialModel, // use integers 1,2 - used in Math.pow(), selects rate determining step
  Shape : 'sine', // this.initialShape,
  Period : 500, // this.initialPeriod,
  Duty : 50, // this.initialDuty, // percent on, duty cycle for square cycling
  Bscale : 1, // this.initialBscale,

  // SET MIN AND MAX VALUES FOR INPUTS SET IN INPUT FIELDS
  minCmax : 0,
  minCmaxInput : 0,
  minKflow : 0.001, // Q/Vp/k-1 = (Q/Vc/k-1) / (Vp/Vc)
  minKads : 0,
  minKdiff : 0.0001,
  minPhi : 0.001, // Phi = Thiele Modulus
  minAlpha : 0.001,
  minModel : 1, // use integers 1,2 - used in Math.pow(), selects rate determining step
  // does not apply - minShape : 'sine', // constant, off, sine, square
  minPeriod : 100,
  minDuty : 0, // percent on, duty cycle for square cycling
  minBscale : 0,

  maxCmax : 1.0,
  maxCmax : 1.0,
  maxKflow : 100, // Q/Vp/k-1 = (Q/Vc/k-1) / (Vp/Vc)
  maxKads : 100,
  maxKdiff : 1,
  maxPhi : 1000, // Phi = Thiele Modulus
  maxAlpha : 1000,
  maxModel : 2, // use integers 1,2 - used in Math.pow(), selects rate determining step
  // does not apply - maxShape : 'sine', // constant, off, sine, square
  maxPeriod : 1000,
  maxDuty : 100, // percent on, duty cycle for square cycling
  maxBscale : 100,

  // eps : 0.3, // epsilon, layer void fraction, keep constant
  // phaseShift : 1.5 * Math.PI, // keep constant
  // Vratio : 2, // layer/cell volume ratio, keep constant
  //   KdOeps : 0.01,
  //
  // // new params needed to couple mixing cell to catalyst layer
  //   Kflow : 5, // Q/Vc/k-1 = d'less space time

  // define the main variables which will not be plotted or save-copy data

  // NEW FOR SQUARE CYCLING WITH DUTY CYCLE
  cycleTime : 0,
  frequency : 0, // update in updateUIparams
  sineFunc : 0,
  sineFuncOLD : 0,

  // WARNING: have to change simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed  in process_plot_info.js
  numNodes : 50,

  // variables for average rate
  AinSum : 0,
  BoutSum : 0,
  BoutCounter : 0,
  aveRate  : 0,
  aveConversion : 0,

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

    for (k = 0; k <= this.numNodes; k += 1) {
      y[k] = 0;
      y2[k] = 0;
      yNew[k] = 0;
      y2New[k] = 0;
    }

    cin = 0;
    ca = 0;
    cb = 0;
    cinNew = 0;
    caNew = 0;
    cbNew = 0;

    var kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotsObj variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      profileData[0][k][0] = kn;
      profileData[1][k][0] = kn;
      profileData[2][k][0] = kn;
      profileData[3][k][0] = kn;
      // y-axis values
      profileData[0][k][1] = 0;
      profileData[1][k][1] = 0;
      profileData[2][k][1] = 0;
      profileData[3][k][1] = 0;
    }

    // XXX also need to reset strip chart data

    // WARNING - if change a value to see initialization here
    // then reset it to zero below this line or will get results at this node
    // document.getElementById("dev01").innerHTML = "RESET time = " + simParams.simTime.toFixed(0) + "; y = " + y[0];

  }, // end reset

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    //
    // updateUIparams gets called on page load but not new range and input
    // updates, so need to call here
    this.updateUIfeedInput();
    // console.log('updateUIparams: this.Cmax = ' + this.Cmax);
    //
    this.Period = getInputValue('puCatalystLayer','Period');
    this.Duty = getInputValue('puCatalystLayer', 'Duty');
    this.Kflow = getInputValue('puCatalystLayer','Kflow');
    this.Kads = getInputValue('puCatalystLayer','Kads');
    this.Kdiff = getInputValue('puCatalystLayer','Kdiff');
    this.Phi = getInputValue('puCatalystLayer','Phi'); // Phi = Thiele Modulus
    this.Alpha = getInputValue('puCatalystLayer','Alpha');
    this.Bscale = getInputValue('puCatalystLayer','Bscale');

    // update cycling frequency
    this.frequency = 2 * Math.PI / this.Period;

    // change input y-axis scale factor for plotting of B out
    plotsObj[3]['varYscaleFactor'][1] = this.Bscale; // this.Bscale;

    // RADIO BUTTONS & CHECK BOX
    // at least for now, do not check existence of UI element as above

    // Model radio buttons - selects rate determing step
    var m01 = document.querySelector('#' + this.inputModel01);
    var m02 = document.querySelector('#' + this.inputModel02);
    if (m01.checked) {
      this.Model = 1;
    } else {
      this.Model = 2;
    }

    // Input Shape radio buttons
    var el0 = document.querySelector('#' + this.inputRadioConstant);
    var el1 = document.querySelector('#' + this.inputRadioSine);
    var el2 = document.querySelector('#' + this.inputRadioSquare);
    var el3 = document.querySelector('#' + this.inputCheckBoxFeed);
    if (el2.checked) {
      this.Shape = 'square';
    } else if (el1.checked) {
      this.Shape = 'sine';
    } else {
      // assume constant checked
      if (el3.checked) {
        this.Shape = 'constant';
      } else {
        this.Shape = 'off';
      }
    }

    var Krxn = Math.pow(this.Phi, 2)*this.Kdiff/0.3/this.Alpha/this.Kads;
    // note eps is local to updateState, so use 0.3 here
    document.getElementById("field_Krxn").innerHTML = Krxn.toFixed(4);

    // reset average rate after any change
    this.AinSum = 0;
    this.BoutSum = 0;
    this.BoutCounter = 0;
    this.aveRate = 0;
    this.aveConversion = 0;

  }, // END updateUIparams

  updateUIfeedInput : function() {
    this.Cmax = getInputValue('puCatalystLayer','CmaxInput');
    // update position of the range slider
    if (document.getElementById(this.inputCmax)) {
      // alert('input, slider exists');
      document.getElementById(this.inputCmax).value = this.Cmax;
    }
    // console.log('updateUIfeedInput: this.Cmax = ' + this.Cmax);
  }, // END method updateUIfeedInput()

  updateUIfeedSlider : function() {
    this.Cmax = getInputValue('puCatalystLayer','Cmax');
    // update input field display
    // alert('slider: this.conc = ' + this.conc);
    if (document.getElementById(this.inputCmaxInput)) {
      document.getElementById(this.inputCmaxInput).value = this.Cmax;
    }
    // console.log('updateUIfeedSlider: this.Cmax = ' + this.Cmax);
  }, // END method updateUIfeedSlider()

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

    // document.getElementById("dev01").innerHTML = "UPDATE time = " + simParams.simTime.toFixed(0) + "; y = " + y[20];

    var eps = 0.3; // layer void fraction, constant
    var Vratio = 2; // layer-pellet/cell volume ratio Vp/Vc, keep constant
    var phaseShift = 1.5 * Math.PI; // keep constant

    // compute these products outside of repeat

    // XXX check, note I compute 0 to this.numNodes points, therefore this.numNodes divisions
    var dz = 1/this.numNodes; // dless distance between nodes in layer

    var inverseDz2 = Math.pow(1/dz, 2);
    var KflowCell = this.Kflow*Vratio; // Q/Vc/k-1 = (Q/Vp/k-1)*(Vp/Vc)
    var KdOeps = this.Kdiff / eps;
    var KdOepsOAlpha = KdOeps / this.Alpha;
    var dtKdOepsOAlpha = this.unitTimeStep * KdOepsOAlpha;
    var dtKdOeps = this.unitTimeStep * KdOeps;
    var Phi2 = Math.pow(this.Phi, 2);
    var flowFactor = this.Kflow / this.Alpha / eps; // for aveRate

    var secondDeriv = 0;
    var D2 = 0;
    var Phi2overD2 = 0;
    var tNewFac = 0;
    var i = 0; // used as index
    var k = 0; // used as index
    var flowRate = 0;
    var diffRate = 0;

    // document.getElementById("dev01").innerHTML = "UPDATE time = " + simParams.simTime.toFixed(0) + "; y = " + inverseDz2;

    // this unit takes multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

    // XXX BUT IF RESET IS TRUE THEN DON'T WANT TO DO ANY STEPPING HERE...

        // boundary condition at inner sealed face
        k = 0;

        D2 = Math.pow((1 + this.Kads * y[k]), this.Model); // this.Model should be 1 or 2
        Phi2overD2 = Phi2 / D2;
        secondDeriv = ( 2 * y[k+1] - 2 * y[k] ) * inverseDz2;

        tNewFac = 1 / (1/this.Alpha + this.Kads/D2); // to allow any Alpha (as long as quasi-equil established)
        // replaces (D2/Kads) which is for large Alpha

        yNew[k] = y[k] + dtKdOepsOAlpha * tNewFac * ( secondDeriv - Phi2overD2 * y[k] ); // for LARGE ALPHA

        // now do for y2
        secondDeriv = ( 2*y2[k+1] - 2*y2[k] ) * inverseDz2;
        y2New[k] = y2[k]  + dtKdOeps * ( secondDeriv + Phi2overD2 * y[k] );

       // internal nodes
       for (k = 1; k < this.numNodes; k += 1) {

          D2 = Math.pow(( 1 + this.Kads * y[k] ), this.Model); // this.Model should be 1 or 2
          Phi2overD2 = Phi2 / D2;
          secondDeriv = ( y[k-1] - 2*y[k] + y[k+1] ) * inverseDz2;

          tNewFac = 1 / (1/this.Alpha + this.Kads/D2); // to allow any Alpha (as long as quasi-equil established)
          // replaces D2/Kads which is for large Alpha

          yNew[k] = y[k]  + dtKdOepsOAlpha * tNewFac * ( secondDeriv - Phi2overD2 * y[k] ); // for LARGE ALPHA

          // now do for y2
          secondDeriv = ( y2[k-1] - 2*y2[k] + y2[k+1] ) * inverseDz2;
          y2New[k] = y2[k]  + dtKdOeps * ( secondDeriv + Phi2overD2 * y[k] );

      } // end repeat

      // boundary condition at outer bulk face

      k = this.numNodes;

      // reactant A feed to reactor
      // cinNew = this.Cmax * 0.5 * (1 + Math.sin( this.frequency * simParams.simTime  + phaseShift) );
      this.sineFuncOLD = this.sineFunc; // need for square cycle with duty fraction
      this.sineFunc = 0.5 * (1 + Math.sin( this.frequency * simParams.simTime  + phaseShift) );

      // NEW FOR SQUARE CYCLING WITH DUTY CYCLE
      this.cycleTime = this.cycleTime + this.unitTimeStep;

      cinOld = cinNew;

      switch(this.Shape) {
        case 'off':
          cinNew = 0;
          break;
        case 'constant':
          cinNew = this.Cmax;
          break;
        case 'sine':
          cinNew = this.Cmax * this.sineFunc;
          break;
        case 'square':
          if (this.sineFuncOLD <= 0.5 && this.sineFunc > 0.5) {
            // we are entering new cycle
            // start timer and switch cin
            this.cycleTime = 0;
            cinNew = this.Cmax;
          } else {
            // within sine cycle
            // check cycleTime to see what to do
            if (this.cycleTime < this.Duty/100 * this.Period) {
              // do nothing
            } else {
              cinNew = 0;
            }
          }
          break;
        default:
          cinNew = this.Cmax;
      }

      // force cinNew to be a number, if not, then
      // 0 and 1 values get treated as text when summing for aveConversion
      cinNew = Number(cinNew);

      // compute average rate and conversion
      // need to update only after complete cycles or get values
      // always changing - and works OK for constant feed as well
      if (this.sineFuncOLD <= 0.5 && this.sineFunc > 0.5) {
        // we are entering new cycle
        // start timer
        this.cycleTime = 0;
        // compute averages only after complete cycles
        if (this.BoutCounter > 0) {
          // compute ave d'ess TOF = ave B formed per site per unit d'less time
          this.aveRate = flowFactor * this.BoutSum / this.BoutCounter;
        }
        if (this.AinSum > 0) {
          this.aveConversion = this.BoutSum / this.AinSum;
        }
        // reset variables used to compute averages
        this.AinSum = 0;
        this.BoutSum = 0;
        this.BoutCounter = 0;
      } else {
        // we are in a cycle so update variables used to compute averages
        this.AinSum = this.AinSum + cinNew;
        this.BoutSum = this.BoutSum + cbNew;
        this.BoutCounter = this.BoutCounter + 1;
      }

      // WARNING: do not use stripData for concentrations used in computations
      // because they are only updated after this repeat of unitStepRepeats is done

      // reactant A balance in mixing cell with diffusion in/out of layer
      flowRate = KflowCell * (cinOld - y[k]);
      diffRate = this.Kdiff*Vratio*this.numNodes*(y[k]-y[k-1]);
      dcadt = flowRate - diffRate;
      caNew = y[k] + dcadt * this.unitTimeStep;
      yNew[k] = caNew;

      // document.getElementById("dev01").innerHTML = "flowRate = " + flowRate + "; diffRate = " + diffRate;
      // document.getElementById("dev01").innerHTML = "y[k] = " + y[k] + "; dcadt * this.unitTimeStep = " + dcadt * this.unitTimeStep;

      // product B balance in mixing cell with diffusion in/out of layer
      flowRate = KflowCell * (0 - y2[k]);
      diffRate = this.Kdiff*Vratio*this.numNodes*(y2[k]-y2[k-1]);
      dcbdt = flowRate - diffRate;
      cbNew = y2[k] + dcbdt * this.unitTimeStep;

      // document.getElementById("dev02").innerHTML = "flowRate = " + flowRate + "; diffRate = " + diffRate;
      // document.getElementById("dev02").innerHTML = "y2[k] = " + y2[k] + "; dcbdt * this.unitTimeStep = " + dcbdt * this.unitTimeStep;

      y2New[k] = cbNew;

       // document.getElementById("dev01").innerHTML = "UPDATE BOUNDARY time = " + simParams.simTime.toFixed(0) + "; y = " +  yNew[k].toFixed(3);

       // copy temp y and y2 to current y and y2
      y = yNew;
      y2 = y2New;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  display : function() {

    // display average rate and average conversion
    document.getElementById("field_aveRate").innerHTML = this.aveRate.toExponential(3);
    document.getElementById("field_aveConversion").innerHTML = this.aveConversion.toFixed(4);

    var k = 0; // used as index
    var v = 0; // used as index
    var s = 0; // used as index
    var t = 0; // used as index

    // HANDLE PROFILE PLOT DATA

    // copy y values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][k] = y;

    for (k=0; k<=this.numNodes; k+=1) {
      profileData[0][k][1] = y[k];
      profileData[1][k][1] = y2[k];
      // update arrays for coverage and rate
      // note that these values are computed above in repeat to get reactant and
      // product gas conc but no need to update coverage and rate arrays inside repeat
      // since this sim assumes pseudo-SS between reactant gas and coverage
      profileData[2][k][1] = this.Kads * y[k] / (1 + this.Kads * y[k]); // coverage
      profileData[3][k][1] = this.Kads * y[k] / Math.pow( (1 + this.Kads * y[k]), this.Model); // rate, this.Model should be 1 or 2
    }

    // HANDLE SPACE-TIME DATA

    // spaceTimeData[v][t][s] - variable, time, space (profile in layer)
    // get 2D array for one variable at a time
    v = 0; // first variable = rate
    tempArray = spaceTimeData[v];
    // get rate profile data, variable 3 in profileData array
    for (k = 0; k <= this.numNodes; k += 1) {
      spaceData[k] = profileData[3][k][1]; // use rate computed above
    }

    // // TRY UNSUCCESSFULLY TO USE shift & push to update spaceTimeData array
    // // shift & push worked OK on 1D arrays for strip charts
    // // delete first and oldest element which is a layer profile
    // tempArray.shift();
    // // add the new layer profile at end
    // tempArray.push(spaceData);

    /*
    BUT SHIFT & PUSH DO NOT WORK
    spaceData is changing with time as expected
    trouble is that all of spaceTimeData is getting "filled" with
    same copy of the time varying spaceData instead of just one strip
    getting added to end...
    strips are getting deleted and new strips added to end
    but looks like all non-zero strips are getting filled with current
    spaceData...
    */

    // numStripPts is a global defined in process_plot_info

    // use repeats to update the spaceTimeData array
    for (t = 0; t < numStripPts; t += 1) { // NOTE < numStripPts, don't do last one here
      // numStripPts defined in process_plot_info.js
      for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
        tempArray[t][s] = tempArray[t+1][s];
      }
    }
    // now update the last time
    for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
      tempArray[numStripPts][s] = spaceData[s];
    }
    // update the variable being processed
    spaceTimeData[v] = tempArray;

    // HANDLE STRIP CHART DATA

    // XXX see if can make actions below for strip chart into general function

    // copy gas in and out data to stripData array
    // update plotData with new data

    // handle cin - feed of reactant gas to mixing cell
    v = 0;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, cinNew ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // handle ca - reactant in mixing cell gas
    v = 1;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, caNew ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // handle cb - product gas in mixing cell gas
    v = 2;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    // don't scale cbNew here or then gets fed back into calc above
    // need to add a scale factor when plotting variable
    tempArray.push( [ 0, cbNew ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // // recording flowRate and diffRate below are for development
    // // WARNING: if want to use this then need to dimension stripData to hold them
    // //          when initialize stripData in process_plot_info.js
    //
    // // handle flowRate - gas in mixing cell gas
    // v = 3;
    // tempArray = stripData[v]; // work on one plot variable at a time
    // // delete first and oldest element which is an [x,y] pair array
    // tempArray.shift();
    // // add the new [x.y] pair array at end
    // // don't scale cbNew here or then gets fed back into calc above
    // // need to add a scale factor when plotting variable
    // tempArray.push( [ 0, flowRate ] );
    // // update the variable being processed
    // stripData[v] = tempArray;
    //
    // // handle diffRate - gas in mixing cell gas
    // v = 4;
    // tempArray = stripData[v]; // work on one plot variable at a time
    // // delete first and oldest element which is an [x,y] pair array
    // tempArray.shift();
    // // add the new [x.y] pair array at end
    // // don't scale cbNew here or then gets fed back into calc above
    // // need to add a scale factor when plotting variable
    // tempArray.push( [ 0, diffRate ] );
    // // update the variable being processed
    // stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values

    // numStripVars & numStripPts are globals defined in process_plot_info.js
    var timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPts; p += 1) { // note = in p <= numStripPts
        // note want p <= numStripPts so get # 0 to  # numStripPts of points
        // want next line for newest data at max time
        stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // stripData[v][p][0] = (numStripPts - p) * timeStep;
      }
    }

  } // end display method

}; // END var puCatalystLayer
