/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

puHeatExchanger = {
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
