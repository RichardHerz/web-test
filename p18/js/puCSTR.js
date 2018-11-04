function puCSTR(pUnitIndex) {
  // constructor function for CSTR process units

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit CSTR constructor';

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    inputs[0] = processUnits[this.unitIndex - 1]['conc'];
    inputs[1] = processUnits[0]['conc']; // feed conc
    return inputs;
  }

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData = []; // for profile plots, plot script requires this name
  stripData = []; // for strip chart plots, plot script requires this name

  // // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // // SEE dataInputs array in initialize() method for input field ID's
  //
  // // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',
  //
  // // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***
  //
  // // define main inputs
  // // values will be set in method intialize()
  // // *** e.g., Kf300 : 0, // forward rate coefficient value at 300 K
  //
  // // define arrays to hold info for variables
  // // these will be filled with values in method initialize()
  // dataHeaders : [], // variable names
  // dataInputs : [], // input field ID's
  // dataUnits : [],
  // dataMin : [],
  // dataMax : [],
  // dataInitial : [],
  // dataValues : [],
  //
  // // define arrays to hold output variables
  // // these will be filled with initial values in method reset()
  // // *** e.g., Trxr : [],
  //
  // // define arrays to hold data for plots, color canvas
  // // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  // colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables which will not be plotted nor saved in copy data table
  this.conc = 1; // conc in this reactor
  this.feed = 1; // feed to first reactor
  this.conversion = 0;
  this.rxnRate = 0;
  // rateBranchOLD = 1 for high, 0 for low
  this.rateBranchOLD = 1;

  this.ssCheckSum = 0; // used to check for steady state
  this.residenceTime = 100; // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  this.initialize = function() {
    //
    // let v = 0;
    // this.dataHeaders[v] = 'Kf300';
    // this.dataInputs[v] = 'input_field_Kf300';
    // this.dataUnits[v] = 'm3/kg/s';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 1;
    // this.dataInitial[v] = 1.0e-7;
    // this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    // this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // *** use v-1 here since TinHX only used to initialize & reset plots

    // to use this prob have to define this.VarCount above this function first...
    // this.VarCount = v-1;

    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //

  } // END initialize method

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  this.reset = function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    this.conc = 0;
    this.conversion = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // conc, conversion
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // initialize profile data array
    // initPlotData(numStripVars,numStripPts)
    let numProfileVars = 2; // conversion, rate
    let numProfilePts = plotInfo[2]['numberPoints'];
    this.profileData = plotter.initPlotData(numProfileVars,numProfilePts);

    // update display
    this.updateDisplay();

  } // end reset

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    // *** e.g., this.Kf300 = this.dataValues[0] = interface.getInputValue(unum, 0);

  } // END of updateUIparams()

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.concIn = inputs[0]; // conc from upstream CSTR
    this.feed = inputs[1]; // feed to first CSTR

    // console.log('updateInputs, CSTR = ' + this.unitIndex + ', concIn = ' + this.concIn);

  } // END of updateInputs()

  // rateHIGH is high branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab
  // rateHIGH has 71 elements corresponding to rate at conc from 0.00 to 0.70
  // at 0.01 intervals with rate here as positive values for reactant
  this.rateHIGH = [0,7.87e-05,0.0001574,0.0002151,0.0002728,0.0003305,0.0003704,0.0004103,0.00043873,0.00046717,0.0004956,0.00051665,0.0005377,0.0005541,0.0005705,0.0005869,0.00059876,0.00061062,0.00062248,0.00063434,0.0006462,0.00065474,0.00066328,0.00067182,0.00068036,0.0006889,0.00069548,0.00070206,0.00070864,0.00071522,0.0007218,0.00072712,0.00073244,0.00073776,0.00074308,0.0007484,0.00075284,0.00075728,0.00076172,0.00076616,0.0007706,0.0007744,0.0007782,0.000782,0.0007858,0.0007896,0.0007929,0.0007962,0.0007995,0.0008028,0.0008061,0.00080886,0.00081162,0.00081438,0.00081714,0.0008199,0.00082266,0.00082542,0.00082818,0.00083094,0.0008337,0.00083551,0.00083732,0.00083913,0.00084094,0.00084275,0.00084456,0.00084637,0.00084818,0.00084999,0.0008518];

  // rateLOW is low branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab
  // rateLOW has 55 elements corresponding to rate at conc from 0.46 to 1.00
  // at 0.01 intervals with rate here as positive values for reactant
  this.rateLOW = [0.0003826,0.0003473,0.0003256,0.00031045,0.0002953,0.00028487,0.00027443,0.000264,0.00025605,0.0002481,0.000242,0.0002359,0.0002298,0.0002237,0.0002176,0.0002136,0.0002096,0.0002056,0.0002016,0.0001976,0.0001936,0.0001896,0.0001856,0.0001816,0.0001776,0.00017498,0.00017236,0.00016974,0.00016712,0.0001645,0.00016188,0.00015926,0.00015664,0.00015402,0.0001514,0.0001495,0.0001476,0.0001457,0.0001438,0.0001419,0.00014,0.0001381,0.0001362,0.0001343,0.0001324,0.00013095,0.0001295,0.00012805,0.0001266,0.00012515,0.0001237,0.00012225,0.0001208,0.00011935,0.0001179];

  this.getRxnRate = function(conc) {
    // getRxnRate provides rate of formation of reactant per arbitrary mass
    //    catalyst from Reactor Lab Web Labs, lab 2, reaction-diffusion
    // USES this.rateBranchOLD, this.rateLOW, this.rateHIGH
    // convert from conc 0-1 to c = 0 to 100
    //    for use of c in array indexes
    // return rate as negative value for reactant conversion
    let c = Math.round(100*conc); // 0 to 100
    if (c < 0) {
      c = 0;
    } else if (c > 100) {
      c = 100;
    }
    // determine rate branch, high vs. low
    let rate = 0;
    let cLowBreak = 46;
    let cHighBreak = 70;
    // first do easy decisions
    if (c < cLowBreak) {
      // on high branch
      rate = this.rateHIGH[c];
      this.rateBranchOLD = 1; // 0 is low branch, 1 is high branch
    } else if (c > cHighBreak) {
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      this.rateBranchOLD = 0;
    } else if (this.rateBranchOLD == 0) {
      // in middle range and last on low branch, so still on low branch
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      this.rateBranchOLD = 0;
    } else if (this.rateBranchOLD == 1) {
      // in middle range and last on high branch, so still on high rateBranch
      rate = this.rateHIGH[c];
      this.rateBranchOLD = 1;
    } else {
      // should not get here
      rate = 0.0;
      this.rateBranchOLD = 1;
    }
    // console.log('getRxnRate, unit = ' + this.unitIndex + ', c = ' + c + ', rate = ' + rate + ', branch = ' + this.rateBranchOLD);
    // return rate as negative value for reactant conversion
    return -rate;
  } // END getRxnRate() method

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    let flowrate = 1;
    let volume = 100;
    // rateMultiplier multiplies rate from getRxnRate below
    // getRxnRate provides rate of formation of reactant per arbitrary mass
    //    catalyst from Reactor Lab Web Labs, lab 2, reaction-diffusion
    let rateMultiplier = 2;

    // this unit may take multiple steps within one outer main loop repeat step
    for (let i = 0; i < this.unitStepRepeats; i += 1) {
      let conc = this.conc;
      this.rxnRate = rateMultiplier * this.getRxnRate(conc);
      // console.log('updateState, unit = ' + this.unitIndex + ', conc = ' + conc + ', rxnRate = ' + rxnRate + ', branch = ' + this.rateBranchOLD);
      let dcdt = flowrate/volume * (this.concIn - conc) + this.rxnRate;
      // console.log('updateState, unit = ' + this.unitIndex + ', dcdt = ' + dcdt);
      let newConc = conc + dcdt * this.unitTimeStep;
      //
      // this.conc = newConc;
      //
      // round toFixed(3) to get ss check to work at low conc, since currently
      // only define rate at 0.01 steps of conc and conc oscillates at
      // small conc (consider change to finer resolution or continuous function)
      // but when lower input to near zero input, min conc in rxrs is 0.0040 with
      // current input, which shows in checksum as 40, because dcdt each step
      // then too small to change conc at 3rd position to right decimal point
      // so be careful when computing conversion after lower to zero input...
      let newConcStr = newConc.toFixed(3); // toFixed returns string
      this.conc = Number(newConcStr);
      //
    }

    if (this.feed > 0) {
      this.conversion = 1 - this.conc / this.feed;
    } else {
      this.conversion = 0;
    }
    if (this.conversion < 0) {
      this.conversion = 0;
    }

    // // simple first-order rate
    // let krate = 0.04;
    // let Kads = 1 * 0.0872; // 0.0872 for max conc = 100, Kads * C/2 = 4.36
    //   // this unit may take multiple steps within one outer main loop repeat step
    // for (let i = 0; i < this.unitStepRepeats; i += 1) {
    //   let C = this.conc;
    //   let rxnRate = - krate * C / Math.pow((1 + Kads * C),2);
    //   let dcdt = flowrate/volume * (this.concIn - this.conc) + rxnRate;
    //   this.conc = this.conc + dcdt * this.unitTimeStep;
    // }

    // console.log('leave updateState, CSTR = ' + this.unitIndex + ', conc = ' + this.conc);

  } // END of updateState()

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle reactor conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle conversion
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conversion] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
        // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
      }
    }

  } // END of updateDisplay()

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    // here conc ranges from 0 to 1
    let rcs = 1.0e4 * this.concIn;
    let lcs = 1.0e4 * this.conc;
    rcs = rcs.toFixed(0); // string
    lcs = lcs.toFixed(0); // string
    let newCheckSum = rcs +'.'+ lcs; // concatenate strings, add +'.'+ if desire
    let oldSScheckSum = this.ssCheckSum;
    // console.log('unit ' + this.unitIndex + ', oldSScheckSum = ' + oldSScheckSum);
    // console.log('unit ' + this.unitIndex + ', newCheckSum = ' + newCheckSum);
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time

    // SPECIAL FOR THIS UNIT
    if ((ssFlag == true) && (controller.ssStartTime == 0)) {
      // this unit at steady state && first time all units are at steady state
      // note ssStartTime will be changed != 0 after this check

      // handle SS conversion
      v = 0;
      tempArray = this.profileData[v]; // work on one plot variable at a time
      // delete first and oldest element which is an [x,y] pair array
      tempArray.shift();
      // add the new [x.y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      tempArray.push( [processUnits[0].conc,this.conversion] );
      // update the variable being processed
      this.profileData[v] = tempArray;

      // handle SS rate
      //
      v = 1;
      tempArray = this.profileData[v]; // work on one plot variable at a time
      // delete first and oldest element which is an [x,y] pair array
      tempArray.shift();
      // add the new [x.y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      let thisRate = -100 * this.rxnRate;
      tempArray.push( [this.conc,thisRate] );
      // update the variable being processed
      this.profileData[v] = tempArray;

      console.log('rxnRate = ' + thisRate);

    }

    return ssFlag;
  } // END OF checkForSteadyState()

} // END puCSTR
