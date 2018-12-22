function puBioReactor(pUnitIndex) {
  // constructor function for process unit

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit Bioreactor';

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    inputs[0] = processUnits[0].flowRate; // input flowRate from feed
    inputs[1] = processUnits[0].conc; // input conc from feed
    return inputs;
  }

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  this.displayReactorContents = "#div_PLOTDIV_reactorContents";

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables
  this.ssCheckSum = 0; // used in checkForSteadyState() method
  this.flowRate = 0; // input flow rate from feed unit
  this.feedConc = 0; // input substrate conc from feed unit
  this.conc = 0; // substrate conc in reactor
  this.biomass = 1; // biomass in reactor, need > 0 initially or no growth
  // rate parameters
  this.MUmax = 0;
  this.ks = 0;
  this.alpha = 0;
  this.beta = 0;
  this.gamma = 0;

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // input field ID's
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  this.initialize = function() {
    //
    v = 0;
    this.dataHeaders[v] = 'MUmax'; // Wu & Chang 2007, MUmax = 0.3
    this.dataInputs[v] = 'input_field_enter_MUmax';
    this.dataUnits[v] = 'm3/kg/hr'; // XXX in paper was 1/hr
    this.dataMin[v] = 0.01;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 0.3;
    this.MUmax = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.MUmax; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'ks';  // Wu & Chang 2007, ks = 1.75
    this.dataInputs[v] = 'input_field_enter_ks';
    this.dataUnits[v] = 'kg/m3';
    this.dataMin[v] = 0.01;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 1.75;
    this.ks = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.ks; // current input oalue for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'alpha';  // Wu & Chang 2007, alpha = 0.01
    this.dataInputs[v] = 'input_field_enter_alpha';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 0.01;
    this.alpha = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.alpha; // current input oalue for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'beta';  // Wu & Chang 2007, beta = 0.03
    this.dataInputs[v] = 'input_field_enter_beta';
    this.dataUnits[v] = 'm3/kg';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 0.03;
    this.beta = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.beta; // current input oalue for reporting
    //
    v = 4;
    this.dataHeaders[v] = 'gamma'; // Wu & Chang 2007, gamma = 0.1
    this.dataInputs[v] = 'input_field_enter_gamma';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataInitial[v] = 0.1;
    this.gamma = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.gamma; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    v = 5;
    this.dataHeaders[v] = 'Biomass Conc';
    this.dataUnits[v] =  'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
    //
    v = 6;
    this.dataHeaders[v] = 'Substrate Conc';
    this.dataUnits[v] =  'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
    //
  } // END of initialize() method

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

    this.biomass = 1.322; // biomass in reactor, need > 0 initially or no growth
    this.conc = 0.3;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // substrate conc, biomass conc in reactor
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {
    //
    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.MUmax = this.dataValues[0] = interface.getInputValue(unum, 0);
    this.ks = this.dataValues[1] = interface.getInputValue(unum, 1);
    this.alpha = this.dataValues[2] = interface.getInputValue(unum, 2);
    this.beta = this.dataValues[3] = interface.getInputValue(unum, 3);
    this.gamma = this.dataValues[4] = interface.getInputValue(unum, 4);

  } // END of updateUIparams() method

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.flowRate = inputs[0]; // input flow rate from feed unit
    this.feedConc = inputs[1]; // input substrate conc from feed unit

  } // END of updateInputs() method

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

     // XXX equations from paper but does NOT seem dimensionlly consistent...
     // XXX only dimensionally consistent if units of MUmax are m3/kg/hr not 1/hr....
    let rxrVolume = 1; // (m3)
    let G = this.MUmax * this.conc / (this.ks + this.conc); // biomass growth rate

    let Y = (this.alpha + this.beta * this.conc); // partial yield function
    Y = Math.pow(Y,this.gamma); // complete yield function
    let D = this.flowRate / rxrVolume; // dilution rate = space velocity

    let dCdt = D * (this.feedConc - this.conc) - (G / Y) * this.biomass;
    let dC = this.unitTimeStep * dCdt;
    let newConc = this.conc + dC;

    let dBdt = (G - D) * this.biomass;
    let dB = this.unitTimeStep * dBdt;
    let newBiomass = this.biomass + dB;

    if (newConc < 0){newConc = 0;}
    if (newBiomass < 0){newBiomass = 0;}

    this.conc = newConc;
    this.biomass = newBiomass;

    // // XXX dimensionally consistent here - seems not in paper...
    // // XXX HERE delete this.conc from numerator of G...
    // let rxrVolume = 1; // (m3)
    // let G = this.MUmax / (this.ks + this.conc); // XXX (1/hr), XXX biomass growth rate
    //
    // let Y = (this.alpha + this.beta * this.conc); // (d'less), partial yield function
    // Y = Math.pow(Y,this.gamma); // (d'less), complete yield function
    // let D = this.flowRate / rxrVolume; // (1/hr), dilution rate = space velocity
    //
    // let dCdt = D * (this.feedConc - this.conc) - (G / Y); // (kg/m3/hr)
    // let dC = this.unitTimeStep * dCdt; // (kg/m3)
    // let newConc = this.conc + dC; // (kg/m3)
    //
    // let dBdt = G - D * this.biomass; // (kg/m3/hr)
    // let dB = this.unitTimeStep * dBdt; // (kg/m3)
    // let newBiomass = this.biomass + dB; // (kg/m3)
    //
    // if (newConc < 0){newConc = 0;}
    // if (newBiomass < 0){newBiomass = 0;}
    //
    // this.conc = newConc;
    // this.biomass = newBiomass;

    // // XXX dimensionally consistent here - seems not in paper...
    // // XXX HERE delete biomass times G in terms
    // let rxrVolume = 1; // (m3)
    // let G = this.MUmax * this.conc / (this.ks + this.conc); // (kg/m3/hr), biomass growth rate
    //
    // let Y = (this.alpha + this.beta * this.conc); // (d'less), partial yield function
    // Y = Math.pow(Y,this.gamma); // (d'less), complete yield function
    // let D = this.flowRate / rxrVolume; // (1/hr), dilution rate = space velocity
    //
    // let dCdt = D * (this.feedConc - this.conc) - (G / Y); // (kg/m3/hr)
    // let dC = this.unitTimeStep * dCdt; // (kg/m3)
    // let newConc = this.conc + dC; // (kg/m3)
    //
    // let dBdt = G - D * this.biomass; // (kg/m3/hr)
    // let dB = this.unitTimeStep * dBdt; // (kg/m3)
    // let newBiomass = this.biomass + dB; // (kg/m3)
    //
    // if (newConc < 0){newConc = 0;}
    // if (newBiomass < 0){newBiomass = 0;}
    //
    // this.conc = newConc;
    // this.biomass = newBiomass;

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    let el = document.querySelector(this.displayReactorContents);

    let colorMax = 240;
    let biomassMax = this.dataMax[5];
    let cValue = Math.round((this.biomass)/biomassMax * colorMax);
    let concR = colorMax - cValue;
    let concG = colorMax;
    let concB = colorMax - cValue;;

    let concColor = "rgb(" + concR + ", " + concG + ", " + concB + ")";
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;

    // console.log('updateDisplay, el.style.backgroundColor = ' + el.style.backgroundColor);

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle biomass
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.biomass] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle conc
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
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

  } // END of updateDisplay() method

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    let ssFlag = false;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puBioReactor
