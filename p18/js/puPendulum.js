function puPendulum(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define variables that are to receive input values from other units
  //   none here

  this.updateInputs = function() {
    // none here
  } // END of updateInputs() method

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  // none here

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // unitIndex may be used in this unit's updateUIparams method
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  // XXX which can be moved into updateState?
  // XXX first check reset(), initialize() and updateUIparams(), updateDisplay()
  const radius = 2; // (m), radius, length of rod
  const pixPerMeter = 100; // (px/m)
  const rpix = radius * pixPerMeter; // (px), pixel length of rod-radius
  const xc = 300; // (px), x location of center of rotation
  const yc = 250; // (px), y location of center of rotation
  const gravity = 9.8; // (m2/s), gravitational accel in vertical direction
  const fricFrac = 0.0016; // friction factor, 0.0016 to offset Euler errors
  const pi = Math.PI;
  let accel = 0; // (m2/s), acceleration in tangential direction
  let veloc = 0; // (m/s), velocity
  let friction = fricFrac * veloc;
  let angle = 0; // (radian)

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit Pendulum'; // used by interfacer.copyData()
  this.residenceTime = 100; // used by controller.checkForSteadyState()

  // define arrays to hold info for variables
  // all used in interfacer.getInputValue() &/or interfacer.copyData() &/or plotInfo obj
  // these will be filled with values in method initialize
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // HTML field ID's of input parameters
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  // define arrays to hold data for plots, color canvas
  // these arrays will be used by plotter object
  // these will be filled with initial values in method reset
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  // this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // *******************************************
  //         define PRIVATE functions
  // *******************************************

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************

  this.initialize = function() {
    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    // this.dataHeaders[v] = 'set point';
    // this.dataInputs[v] = 'input_field_enterSetpoint';
    // this.dataUnits[v] = '';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 2;
    // this.dataInitial[v] = 1;
    // setPoint = this.dataInitial[v]; // dataInitial used in getInputValue
    // this.dataValues[v] = setPoint; // current input oalue for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //
  } // END of initialize method

  this.reset = function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams to initial settings

    angle = pi/2; // (radian), initial angle
    veloc = 0; // (m/s), initial tangential velocity

    // update display
    this.updateDisplay();

  } // END of reset method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState method to check for SS
    ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize
    // note: this.dataValues.[pVar]
    //   is only used in copyData to report input values
    //
    let unum = unitIndex;
    //
    // setPoint = this.dataValues[0] = interfacer.getInputValue(unum, 0);

  } // END of updateUIparams method

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //
    // check for change in overall main time step simTimeStep
    unitTimeStep = simParams.simTimeStep / unitStepRepeats;

    accel = gravity * Math.sin(-angle);
    friction = fricFrac * veloc;
    let newVeloc = veloc + accel * unitTimeStep;
    // apply friction
    newVeloc = newVeloc - friction * unitTimeStep;
    let angularVeloc = veloc * radius; // (radian/s)
    let newAngle = angle + angularVeloc * unitTimeStep;
    // correct angle if pendulum goes past top in CCW direction
    if (newAngle > pi) {
      newAngle = -pi + newAngle % pi;  // % is JS modulo operator,
    }

    // update current values
    angle = newAngle;
    veloc = newVeloc;

  } // END of updateState method

  this.updateDisplay = function() {

    // coordinates for bobANDrod
    let x = xc + rpix * Math.sin(angle);
    let y = yc + rpix * Math.cos(angle);

    // coordinates for velocVector
    let pixFac = 0.15;
    let xv = x + pixFac * pixPerMeter * veloc * Math.cos(angle);
    let yv = y - pixFac * pixPerMeter * veloc * Math.sin(angle);
    // velocVector is x,y to xv,yv

    // coordinates for accelVector
    pixFac = 0.05;
    let xa = x + pixFac * pixPerMeter * accel * Math.cos(angle);
    let ya = y - pixFac * pixPerMeter * accel * Math.sin(angle);
    // accelVector is x,y to xa,ya

    // coordinates for accelVectorDown
    //   component of tangential accel that is gravity pulling down
    let tDownY = y + pixFac * pixPerMeter * gravity;
    // accelVectorDown is x,y to x,tDownY

    // coordinates for accelVectorRod
    //   component of tangential accel that is rod holding bob (radial accel)
    //   with rod in tension when bob below horizontal and
    //   rod in compression when bob above horizontal
    let tRod = gravity * Math.cos(angle);
    let dX = pixFac * pixPerMeter * (tRod * Math.sin(angle));
    let dY = pixFac * pixPerMeter * (tRod * Math.cos(angle));
    // accelVectorRod is x,y to x-dX,y-dY

    // Set new vector positions
    //   bobANDrod is xc,yc to x,y
    //   velocVector is x,y to xv,yv
    //   accelVector is x,y to xa,ya
    //   accelVectorDown is x,y to x,tDownY
    //   accelVectorRod is x,y to x-dX,y-dY

    // http://tutorials.jenkov.com/svg/

    let svgElement = document.getElementById("bobANDrod");
    let xs = xc;
    let xe = x;
    let ys = yc;
    let ye = y;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("velocVector");
    xs = x;
    xe = xv;
    ys = y;
    ye = yv;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVector");
    xs = x;
    xe = xa;
    ys = y;
    ye = ya;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVectorDown");
    xs = x;
    xe = x;
    ys = y;
    ye = tDownY;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVectorRod");
    xs = x;
    xe = x-dX;
    ys = y;
    ye = y-dY;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

  } // END of updateDisplay method

  this.checkForSteadyState = function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    //
    let ssFlag = false; // SPECIAL - will always stay false
    //
    // ssCheckSum set != 0 on updateUIparams execution
    if (ssCheckSum != 0) {
      ssFlag = false;
    }
    ssCheckSum = 0;
    return ssFlag;
  } // END of checkForSteadyState method

} // END of puPendulum
