/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines objects that represent process units

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let processUnits = new Object();
  // contents must be only the process units as child objects
  // children optionally can be defined in separate script files, e.g., as puHeatExchanger,
  // then inserted into processUnits, e.g., processUnits[0] = puHeatExchanger,
  // then cleared for garbage collection, e.g., puHeatExchanger = null;
  // units defined in separate files makes them easier to edit

// load process unit objects into this object
// as indexed objects in order to allow object controller
// to access them in a repeat with numeric index

processUnits[0] = {
  //
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'arena',

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0];
    return inputs;
  },

  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below

  // define main parameters
  // values will be set in method intialize()
  N : 0, // (d'less), input

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

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 100,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'N';
    this.dataInputs[v] = 'input_field_input';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 5;
    this.flowRate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.flowRate; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //
  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function(){
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

    console.log('in reset after set ssCheckSum');

    // initialize profile data array
    // plotter.initPlotData(numProfileVars,numProfilePts)
    // this.profileData = plotter.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // plotter.initPlotData(numStripVars,numStripPts)
    // this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(1,this.numNodes,this.numNodes+1);

    console.log('in reset after initColorCanvasArray');

    // NEED TO INITIALIZE array colorCanvasData
    for (let r = 0; r <= this.numNodes; r += 1) {
      for (let c = 0; c <= this.numNodes; c += 1) {
        this.colorCanvasData[0][r][c] = 100*(r*c)/(this.numNodes*this.numNodes);
      }
    }

  }, // END reset method

  updateUIparams : function(){
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
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.N = this.dataValues[0] = interface.getInputValue(unum,0);

  }, // END updateUIparams

  updateInputs : function(){
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //    none for this unit
  }, // END updateInputs

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //

    // have one adjustable param from HTML UI at this point, N

    
  }, // end updateState method

  updateDisplay : function(){

    // update array colorCanvasData
    for (let r = 0; r <= this.numNodes; r += 1) {
      for (let c = 0; c <= this.numNodes; c += 1) {
        this.colorCanvasData[0][r][c] = 100*(r*c)/(this.numNodes*this.numNodes);
      }
    }

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 0
