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
var Tcold = []; // new values
var tempArray = []; // for shifting data in strip chart plots
var spaceData = []; // for shifting data in space-time plots

// ----- SEE process_plot_info.js FOR INITIALIZATION OF ---------------
// ----- OTHER DATA ARRAYS --------------------------------------------

// ----- OBJECT TO CONTAIN & SET SIMULATION & PLOT PARAMETERS ---------

var simParams = {

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
  // XXX need to enter id's of inputs
  inputModelFlag : "", // 0 is cocurrent flow, 1 is countercurrent flow
  inputArea : "", // m2, A, heat transfer surface area
  inputCoeffic : "", // J/s/K/m2, U, heat transfer coefficient
  inputTinHot : "", // K, hot T in
  inputTinCold : "", // K, cold T in
  inputFlowHot : "", // m3/s
  inputFlowCold : "", // m3/s
  inputCpHot : "", // J/m3/K, hot flow heat capacity
  inputCpCold : "", // J/m3/K, cold flow heat capacity
  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  //   no user entered values for this unit
  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE EXCEPT -----
  // ------- simParams.simTimeStep and simParams.simStepRepeats ----

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for dt in this case in this unit's updateInputs method
  unitStepRepeats : 100,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define "initialVarName" values for reset function and
  // so that this process unit will run if units that supply inputs and
  // html inputs are not present in order to make units more independent

  initialModelFlag : 1, // 0 is cocurrent flow, 1 is countercurrent flow
  initialArea : 1.9, // m2, A, heat transfer surface area
  initialCoeffic : 252.0, // J/s/K/m2, U, heat transfer coefficient
  initialTinHot : 375, // K, hot T in
  initialTinCold : 280, // K, cold T in
  initialFlowHot : 1.0e-04, // m3/s
  initialFlowCold : 1.0e-04, // m3/s
  initialCpHot : 4.17e+06, // J/m3/K, hot flow heat capacity
  initialCpCold : 4.17e+06, // J/m3/K, cold flow heat capacity

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to change simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed  in process_plot_info.js
  numNodes : 50,

  // XXX WARNING: THESE DO NOT HAVE ANY EFFECT HERE WHEN
  //     THEY ARE ALSO SET IN updateUIparams
  //     BUT WHEN NOT SET IN updateUIparams THEN setting to
  //     this.initial___ HAS NO EFFECT AND GET NaN
  // if list here must supply a value (e.g., this.initial___) but if not
  // list here then apparently is created in updateUIparams...
  //   e.g., Cmax : this.initialCmax,
  ModelFlag : this.initialModelFlag, // 0 is cocurrent flow, 1 is countercurrent flow
  Area : this.initialArea, // m2, A, heat transfer surface area
  Coeff : this.initialCoeffic, // J/s/K/m2, U, heat transfer coefficient
  TinHot : this.initialTinHot, // K, hot T in
  TinCold : this.initialTinCold, // K, cold T in
  FlowHot : this.initialFlowHot, // m3/s
  FlowCold : this.initialFlowCold, // m3/s
  CpHot : this.initialCpHot, // J/m3/K, hot flow heat capacity
  CpCold : this.initialCpCold, // J/m3/K, cold flow heat capacity

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
      Thot[k] = this.initialTinCold;
      Tcold[k] = this.initialTinCold;
      ThotNew[k] = this.initialTinCold;
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
      profileData[0][k][1] = this.initialTinCold;
      profileData[1][k][1] = this.initialTinCold;
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
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    // EXAMPLE FOR SETTING VALUE OF AN OBJECT WITH MULTIPLE properties
    //   THUS set value of this.setPoint.value
    // if (document.getElementById(this.inputSetPoint)) {
    //   let tmpFunc = new Function("return " + this.inputSetPoint + ".value;");
    //   this.setPoint.value = tmpFunc();
    // } else {
    //   this.setPoint.value = this.initialSetPoint;
    // }
    //
    // EXAMPLE SETTING VALUE OF SIMPLE VARIABLE (no .value = )
    // if (document.getElementById(this.inputCmax)) {
    //   let tmpFunc = new Function("return " + this.inputCmax + ".value;");
    //   this.Cmax = tmpFunc();
    // } else {
    //   this.Cmax= this.initialCmax;
    // }
    //
    // EXAMPLE OF SETTING VALUE FROM RANGE SLIDER
    // // update the readout field of range slider
    // if (document.getElementById(this.inputSliderReadout)) {
    //   document.getElementById(this.inputSliderReadout).innerHTML = this.Cmax;
    // }
    //
    // // EXAMPLE RADIO BUTTONS & CHECK BOX
    // // at least for now, do not check existence of UI element as above
    // // Model radio buttons - selects rate determing step
    // var m01 = document.querySelector('#' + this.inputModel01);
    // var m02 = document.querySelector('#' + this.inputModel02);
    // if (m01.checked) {
    //   this.model = 1;
    // } else {
    //   this.model = 2;
    // }
    // // Input shape radio buttons
    // var el0 = document.querySelector('#' + this.inputRadioConstant);
    // var el1 = document.querySelector('#' + this.inputRadioSine);
    // var el2 = document.querySelector('#' + this.inputRadioSquare);
    // var el3 = document.querySelector('#' + this.inputCheckBoxFeed);
    // if (el2.checked) {
    //   this.shape = 'square';
    // } else if (el1.checked) {
    //   this.shape = 'sine';
    // } else {
    //   // assume constant checked
    //   if (el3.checked) {
    //     this.shape = 'constant';
    //   } else {
    //     this.shape = 'off';
    //   }
    // }

    // XXX for now, use this for ModelFlag but replace with radio buttons
    if (document.getElementById(this.inputModelFlag {
      let tmpFunc = new Function("return " + this.inputModelFlag + ".value;");
      this.ModelFlag= tmpFunc();
    } else {
      this.ModelFlag = this.initialModelFlag;
    }

    if (document.getElementById(this.inputArea)) {
      let tmpFunc = new Function("return " + this.inputArea + ".value;");
      this.Area = tmpFunc();
    } else {
      this.Area= this.initialArea;
    }

    if (document.getElementById(this.inputCoeff)) {
      let tmpFunc = new Function("return " + this.inputCoeff + ".value;");
      this.Coeff = tmpFunc();
    } else {
      this.Coeff = this.initialCoeff;
    }

    if (document.getElementById(this.inputTinHot) {
      let tmpFunc = new Function("return " + this.inputTinHot + ".value;");
      this.TinHot = tmpFunc();
    } else {
      this.TinHot = this.initialTinHot;
    }

    if (document.getElementById(this.inputTinCold) {
      let tmpFunc = new Function("return " + this.inputTinCold + ".value;");
      this.TinCold = tmpFunc();
    } else {
      this.TinCold = this.initialTinCold;
    }

    if (document.getElementById(this.inputFlowHot) {
      let tmpFunc = new Function("return " + this.inputFlowHot + ".value;");
      this.FlowHot = tmpFunc();
    } else {
      this.FlowHot = this.initialFlowHot;
    }

    if (document.getElementById(this.inputFlowCold) {
      let tmpFunc = new Function("return " + this.inputFlowCold + ".value;");
      this.FlowCold = tmpFunc();
    } else {
      this.FlowCold = this.initialFlowCold;
    }

    if (document.getElementById(this.inputCpHot {
      let tmpFunc = new Function("return " + this.inputCpHot + ".value;");
      this.CpHot = tmpFunc();
    } else {
      this.CpHot = this.initialCpHot;
    }

    if (document.getElementById(this.inputCpCold {
      let tmpFunc = new Function("return " + this.inputCpHot + ".value;");
      this.CpCold = tmpFunc();
    } else {
      this.CpCold = this.initialCpCold;
    }

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

    // this unit takes multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

    // XXX BUT IF RESET IS TRUE THEN DON'T WANT TO DO ANY STEPPING HERE...

        // boundary condition at inner sealed face
        k = 0;

       // internal nodes
       for (k = 1; k < this.numNodes; k += 1) {

      } // end repeat

      // boundary condition at outer bulk face

      k = this.numNodes;

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
      profileData[3][k][1] = this.Kads * y[k] / Math.pow( (1 + this.Kads * y[k]), this.model); // rate, this.model should be 1 or 2
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

}; // END var puHeatExchanger
