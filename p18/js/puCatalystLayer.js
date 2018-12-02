/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

let puCatalystLayer = {
  //
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'catalyst layer',

  // NOTE: this single unit could have been split into 3 units:
  //       feed, mixing cell, catalyst layer
  //       but choose to keep as one unit here

  // SUMMARY OF DEPENDENCIES
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   puController.command.value
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  //

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    // inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    return inputs;
  },

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  // XXX  no user entered values for this unit
  // XXX SEE BELOW IN DISPLAY METHOD
  // XXX document.getElementById("field_aveRate").innerHTML = this.aveRate.toExponential(3);
  // XXX document.getElementById("field_aveConversion").innerHTML = this.aveConversion.toFixed(4);

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // ---- NO EXPLICIT REF TO EXTERNAL VALUES BELOW THIS LINE... -----
  // ---- EXCEPT simParams.simTimeStep and simParams.simStepRepeats ----

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // define arrays to hold working data
  y : [], // reactant gas in catalyst layer
  y2 : [], // product gas in catalyst layer
  yNew : [], // new values for reactant gas in layer
  y2New : [], // new values for product gas in layer
  cinNew : 0,
  cinOld : 0,
  caNew : 0,
  cbNew : 0,

  // define the main variables which will not be plotted or save-copy data

  // WARNING: have to change simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed  in process_plot_info.js
  numNodes : 50,

  // WARNING: IF INCREASE NUM NODES IN CATALYST LAYER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for dt in this case in this unit's updateInputs method
  unitStepRepeats : 1200,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // NEW FOR SQUARE CYCLING WITH DUTY CYCLE
  cycleTime : 0,
  frequency : 0, // update in updateUIparams
  sineFunc : 0,
  sineFuncOLD : 0,

  // variables for average rate
  AinSum : 0,
  BoutSum : 0,
  BoutCounter : 0,
  aveRate  : 0,
  aveConversion : 0,

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

  }, // END of method initialize

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

    let kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotsObj variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      this.profileData[2][k][0] = kn;
      this.profileData[3][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = 0;
      this.profileData[1][k][1] = 0;
      this.profileData[2][k][1] = 0;
      this.profileData[3][k][1] = 0;
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
    let m01 = document.querySelector('#' + this.inputModel01);
    let m02 = document.querySelector('#' + this.inputModel02);
    if (m01.checked) {
      this.Model = 1;
    } else {
      this.Model = 2;
    }

    // Input Shape radio buttons
    let el0 = document.querySelector('#' + this.inputRadioConstant);
    let el1 = document.querySelector('#' + this.inputRadioSine);
    let el2 = document.querySelector('#' + this.inputRadioSquare);
    let el3 = document.querySelector('#' + this.inputCheckBoxFeed);
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

    let Krxn = Math.pow(this.Phi, 2)*this.Kdiff/0.3/this.Alpha/this.Kads;
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

    let eps = 0.3; // layer void fraction, constant
    let Vratio = 2; // layer-pellet/cell volume ratio Vp/Vc, keep constant
    let phaseShift = 1.5 * Math.PI; // keep constant

    // compute these products outside of repeat

    // XXX check, note I compute 0 to this.numNodes points, therefore this.numNodes divisions
    let dz = 1/this.numNodes; // dless distance between nodes in layer

    let inverseDz2 = Math.pow(1/dz, 2);
    let KflowCell = this.Kflow*Vratio; // Q/Vc/k-1 = (Q/Vp/k-1)*(Vp/Vc)
    let KdOeps = this.Kdiff / eps;
    let KdOepsOAlpha = KdOeps / this.Alpha;
    let dtKdOepsOAlpha = this.unitTimeStep * KdOepsOAlpha;
    let dtKdOeps = this.unitTimeStep * KdOeps;
    let Phi2 = Math.pow(this.Phi, 2);
    let flowFactor = this.Kflow / this.Alpha / eps; // for aveRate

    let secondDeriv = 0;
    let D2 = 0;
    let Phi2overD2 = 0;
    let tNewFac = 0;
    let i = 0; // used as index
    let k = 0; // used as index
    let flowRate = 0;
    let diffRate = 0;

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

    let k = 0; // used as index
    let v = 0; // used as index
    let s = 0; // used as index
    let t = 0; // used as index
    let tempArray = []; // for shifting data in strip chart plots
    let tempSpaceData = []; // for shifting data in color canvas plots

    // HANDLE PROFILE PLOT DATA

    // copy y values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // this.profileData[0][1][k] = y;

    for (k=0; k<=this.numNodes; k+=1) {
      this.profileData[0][k][1] = y[k];
      this.profileData[1][k][1] = y2[k];
      // update arrays for coverage and rate
      // note that these values are computed above in repeat to get reactant and
      // product gas conc but no need to update coverage and rate arrays inside repeat
      // since this sim assumes pseudo-SS between reactant gas and coverage
      this.profileData[2][k][1] = this.Kads * y[k] / (1 + this.Kads * y[k]); // coverage
      this.profileData[3][k][1] = this.Kads * y[k] / Math.pow( (1 + this.Kads * y[k]), this.Model); // rate, this.Model should be 1 or 2
    }

    // HANDLE SPACE-TIME DATA

    // colorCanvasData[v][t][s] - variable, time, space (profile in layer)
    // get 2D array for one variable at a time
    v = 0; // first variable = rate
    tempArray = this.colorCanvasData[v];
    // get rate profile data, variable 3 in profileData array
    for (k = 0; k <= this.numNodes; k += 1) {
      tempSpaceData = this.profileData[3][k][1]; // use rate computed above
    }

    // update the colorCanvasData array
    for (t = 0; t < numStripPts; t += 1) { // NOTE < numStripPts, don't do last one here
      // XXX numStripPts defined in process_plot_info.js
      for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
        tempArray[t][s] = tempArray[t+1][s];
      }
    }
    // now update the last time
    for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
      tempArray[numStripPts][s] = tempSpaceData[s];
    }
    // update the variable being processed
    this.colorCanvasData[v] = tempArray;

    // HANDLE STRIP CHART DATA

    // copy gas in and out data to stripData array
    // update plotData with new data

    // handle cin - feed of reactant gas to mixing cell
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, cinNew ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle ca - reactant in mixing cell gas
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, caNew ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle cb - product gas in mixing cell gas
    v = 2;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    // don't scale cbNew here or then gets fed back into calc above
    // need to add a scale factor when plotting variable
    tempArray.push( [ 0, cbNew ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values

    // XXX numStripVars & numStripPts are globals defined in process_plot_info.js
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPts; p += 1) { // note = in p <= numStripPts
        // note want p <= numStripPts so get # 0 to  # numStripPts of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (numStripPts - p) * timeStep;
      }
    }

  } // end display method

}; // END object puCatalystLayer
