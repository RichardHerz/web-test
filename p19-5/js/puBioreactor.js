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
    inputs[1] = processUnits[2].command; // command from controller
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
  this.biomass = 0; // biomass in reactor

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
    this.dataHeaders[v] = '';
    this.dataInputs[v] = '';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 0;
    this.dataInitial[v] = 0;
    this.temp = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.temp; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    v = 1;
    this.dataHeaders[v] = 'Biomass Conc';
    this.dataUnits[v] =  '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    //
    v = 2;
    this.dataHeaders[v] = 'Substrate Conc';
    this.dataUnits[v] =  '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
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
    // no direct UI inputs for this unit

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
    this.flowRate = inputs[0]; // input water flow rate from feed unit
    this.feedConc = inputs[1]; // command from controller unit

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

    let G = this.MUmax * this.conc / (this.Ks + this.conc); // biomass growth rate
    let Y = (this.Vmin + this.Va * this.conc); // partial yield function
    Y = Math.pow(Y,this.Vp); // complete yield function
    let D = this.flowRate / this.vol; // dilution rate = space velocity

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

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    let el = document.querySelector(this.displayReactorContents);

    let colorMax = 240;
    let biomassMax = 40;
    let cValue = Math.round((this.biomass)/biomassMax * colorMax);
    let concR = colorMax - cValue;
    let concG = colorMax;
    let concB = colorMax - cValue;;

    let concColor = "rgb(" + concR + ", " + concG + ", " + concB + ")";
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;

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
    tempArray.push( [0,this.conclevel] );
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
