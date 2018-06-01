/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

puPlugFlowReactor = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Adiabatic Packed Bed PFR',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes

  // **** WHEN RXR COUPLED TO HX *****
  //    all flow rates are the same in reactor and heat exchanger
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //    reactor outlet T to heat exchanger hot inlet T
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //    heat exchanger cold out T is reactor inlet T

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  displayReactorLeftConc: 'field_reactor_left_conc',
  displayReactorRightConc: 'field_reactor_right_conc',
  displayReactorLeftT: 'field_reactor_left_T',
  displayReactorRightT: 'field_reactor_right_T',
  // displayJacketLeftArrow : '#field_jacket_left_arrow', // needs # with ID

  // define main inputs
  // values will be set in method intialize()
  Kf300 : 0,
  Ea : 0,
  DelH : 0,
  Wcat : 0,
  Cain : 0,
  Flowrate : 0,
  // *** WHEN RXR COUPLED TO HX, THIS IS INLET T TO COLD SIDE HX ***
  // *** WHEN RXR COUPLED TO HX, SEE Tin BELOW FOR RXR INLET T ***
  TinHX : 0, // inlet T to heat exchanger cold side
  UAcoef : 0,
  Tjacket : 0,

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
  Trxr : [],
  Ca : [],
  TrxrNew : [], // 'New' hold intermediate values during updateState
  CaNew : [],

  // *** WHEN RXR COUPLED TO HX, Tin IS RXR INLET T ***
  // these will be filled with values in method initialize()
  // and updated in updateState()
  Tin : 0, //

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
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200, // XXX

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number of array end values
  residenceTime : 0, // for timing checks for steady state check

  // fluid Cp and both dens need to be accessible in updateUIparams()
  // Cp and dens for catalyst set in updateState()
  CpFluid : 2, // (kJ/kg/K)
  densFluid : 1000, // (kg/m3)
  densCat : 1000, // (kg/m3)

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'Kf300';
    this.dataInputs[v] = 'input_field_Kf300';
    this.dataUnits[v] = 'm3/kg/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 1.0e-7;
    this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_Ea';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 100;
    this.Ea = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Ea; // current input value for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'DelH';
    this.dataInputs[v] = 'input_field_DelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -150;
    this.dataMax[v] = 150;
    this.dataInitial[v] = -125;
    this.DelH = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.DelH; // current input value for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'Wcat';
    this.dataInputs[v] = 'input_field_Wcat';
    this.dataUnits[v] = 'kg';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataInitial[v] = 100;
    this.Wcat = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Wcat; // current input value for reporting
    //
    v = 4;
    this.dataHeaders[v] = 'Cain';
    this.dataInputs[v] = 'input_field_Cain';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 550;
    this.dataInitial[v] = 500;
    this.Cain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Cain; // current input value for reporting
    //
    v = 5;
    this.dataHeaders[v] = 'Flowrate';
    this.dataInputs[v] = 'input_field_Flowrate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 4.0e-3;
    this.Flowrate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Flowrate; // current input value for reporting
    //
    // *** WHEN RXR COUPLED TO HX, THIS IS Tin TO COLD SIDE HEAT EXCHANGER ***
    v = 6;
    this.dataHeaders[v] = 'Tin'; // TinHX
    this.dataInputs[v] = 'input_field_Tin';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 325;
    this.dataMax[v] = 425;
    this.dataInitial[v] = 325;
    this.TinHX = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.TinHX; // current input value for reporting
    //
    // *** WHEN RXR COUPLED TO HX, THIS IS UA of HEAT EXCHANGER ***
    v = 7;
    this.dataHeaders[v] = 'UAcoef';
    // NOTE: dataInputs example where field ID name differs from variable name
    this.dataInputs[v] = 'input_field_UA';
    this.dataUnits[v] = 'kW/K';
    this.dataMin[v] = 0;
    this.dataMax[v] = 60;
    this.dataInitial[v] = 10;
    this.UAcoef = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.UAcoef; // current input value for reporting
    //
    // *** Tjacket not used for adiabatic reactor coupled to heat exch ***
    v = 8;
    this.dataHeaders[v] = 'Tjacket';
    this.dataInputs[v] = 'input_field_Tjacket';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 250;
    this.dataMax[v] = 400;
    this.dataInitial[v] = 360;
    this.Tjacket = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Tjacket; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table in _plotter.js

    // *** CHANGE FROM = v TO = v-1 FOR ADIABATIC RXR COUPLED TO HX ***
    this.VarCount = v-1;

    //
    // OUTPUT VARS
    //
    v = 9;
    this.dataHeaders[v] = 'Trxr';
    this.dataUnits[v] =  'K';
    // Trxr dataMin & dataMax can be changed in updateUIparams()
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    v = 10;
    this.dataHeaders[v] = 'Ca';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[4]; // [4] is Cain
    //

    // *** heat exchanger needs reactor outlet T for HX hot inlet T ***
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
    }

  }, // END of initialize()

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

    // **** CHANGE WHEN REACTOR COUPLED TO HEAT EXCHANGER ****
    document.getElementById(this.displayReactorLeftT).innerHTML = this.TinHX.toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.TinHX.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = this.Cain.toFixed(1) + ' mol/m<sup>3</sup>';

    for (k = 0; k <= this.numNodes; k += 1) {
      // **** CHANGE WHEN RXR COUPLED TO HX ****
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
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
    for (k = 0; k <= this.numNodes; k += 1) {
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
      this.profileData[0][k][1] = this.dataInitial[6]; // [6] is Tin
      this.profileData[1][k][1] = this.dataInitial[4]; // [4] is Cain
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
    // getInputValue(unit index in processUnits, var index in input arrays)
    var unum = this.unitIndex;
    this.Kf300 = getInputValue(unum, 0);
    this.Ea = getInputValue(unum, 1);
    this.DelH = getInputValue(unum, 2);
    this.Wcat = getInputValue(unum, 3);
    this.Cain = getInputValue(unum, 4);
    this.Flowrate = getInputValue(unum, 5);
    this.TinHX = getInputValue(unum, 6);
    this.UAcoef = getInputValue(unum, 7);

    // // *** DEACTIVATE FOR ADIABATIC OPERATION ***
    // this.Tjacket = getInputValue(unum, 8);

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    this.Tin = processUnits[1]['Tcold'][0];

    // calc adiabatic delta T, positive for negative H (exothermic)
    var adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;

    // *** CHANGE MIN-MAX T FOR ADIABATIC REACTOR ***
    // calc max possible T
    if(this.DelH < 0) {
      // exothermic
      this.dataMax[9] = this.TinHX + adiabDeltaT;
    } else {
      // endothermic
      this.dataMax[9] = this.TinHX;
    }
    // calc min possible T
    if(this.DelH > 0) {
      // endothermic
      this.dataMin[9] = this.TinHX + adiabDeltaT;
    } else {
      // exothermic
      this.dataMin[9] = this.TinHX;
    }

    // // adjust axis of profile plot
    // plotArrays['plotFlag'][0] = 0;  // so axes will refresh
    // plotsObj[0]['yLeftAxisMin'] = this.dataMin[9]; // [9] is Trxr
    // plotsObj[0]['yLeftAxisMax'] = this.dataMax[9];
    // plotsObj[0]['yRightAxisMin'] = 0;
    // plotsObj[0]['yRightAxisMax'] = this.Cain;
    // // adjust color span of spaceTime, color canvas plots
    // plotsObj[1]['varValueMin'] = this.dataMin[9]; // [9] is Trxr
    // plotsObj[1]['varValueMax'] = this.dataMax[9];
    // plotsObj[2]['varValueMin'] = this.dataMin[9];
    // plotsObj[2]['varValueMax'] = this.dataMax[9];

    // also update ONLY inlet values at inlet of reactor in case sim is paused
    // but do not do full updateDisplay

    // *** deactivate since inlet to reactor isn't directly affected by UI update ***
    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1);

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
    //
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

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    this.Tin = processUnits[1]['Tcold'][0];

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

    // *** FOR ADIABATIC RXR + HX, no heat transfer to rxr walls ***
    var energyXferCoef = 0;
    // var energyXferCoef = this.UAcoef / CpMean;

    var energyRxnCoef = this.DelH / CpMean;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet end
      n = 0;

      // TrxrN = this.TinHX; // XXX TEST
      TrxrN = this.Tin;

      CaN = this.Cain;

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

        // XXX // CONSTRAIN TO BE IN BOUND
        // if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
        // if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
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

      // XXX // CONSTRAIN TO BE IN BOUND
      // if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
      // if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = this.TrxrNew;
      this.Ca = this.CaNew;

      // XXX
      // for (n = 0; n <= this.numNodes; n += 1) {
      //   alert('this.Ca[' +n+ '] & this.Trxr[' +n+ '] = ' + this.Ca[n] + ', ' + this.Trxr[n]);
      // }

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  checkSSvalues : function() {
    // not implemented
  },

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    // XXX *** change next line when rxr + hx - but maybe do this to regular rxr?
    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Trxr[0].toFixed(1) + ' K';

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
