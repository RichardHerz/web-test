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
  this.feed = 0; // feed to first reactor
  this.concIn = 0; // conc entering this reactor
  this.conc = 0; // conc inside this reactor
  this.conversion = 0;
  this.rxnRate = 0;
  // rateBranchOLD = 1 for high, 0 for low
  this.rateBranchOLD = 1;

  this.ssCheckSum = 0; // used to check for steady state
  this.residenceTime = 100; // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  // rateHIGH is high branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab (as positive numbers until returned by getRxnRate)
  // rateHIGH has 701 elements at 0.001 conc resolution from 0.000 through 0.700
  // used in getRxnRate() method below
  this.rateHIGH = [0,7.87e-06,1.574e-05,2.361e-05,3.148e-05,3.935e-05,4.722e-05,5.509e-05,6.296e-05,7.083e-05,7.87e-05,8.657e-05,9.444e-05,0.00010231,0.00011018,0.00011805,0.00012592,0.00013379,0.00014166,0.00014953,0.0001574,0.00016317,0.00016894,0.00017471,0.00018048,0.00018625,0.00019202,0.00019779,0.00020356,0.00020933,0.0002151,0.00022087,0.00022664,0.00023241,0.00023818,0.00024395,0.00024972,0.00025549,0.00026126,0.00026703,0.0002728,0.00027857,0.00028434,0.00029011,0.00029588,0.00030165,0.00030742,0.00031319,0.00031896,0.00032473,0.0003305,0.00033449,0.00033848,0.00034247,0.00034646,0.00035045,0.00035444,0.00035843,0.00036242,0.00036641,0.0003704,0.00037439,0.00037838,0.00038237,0.00038636,0.00039035,0.00039434,0.00039833,0.00040232,0.00040631,0.0004103,0.00041314,0.00041599,0.00041883,0.00042167,0.00042452,0.00042736,0.0004302,0.00043305,0.00043589,0.00043873,0.00044158,0.00044442,0.00044726,0.00045011,0.00045295,0.00045579,0.00045864,0.00046148,0.00046432,0.00046717,0.00047001,0.00047285,0.0004757,0.00047854,0.00048138,0.00048423,0.00048707,0.00048991,0.00049276,0.0004956,0.0004977,0.00049981,0.00050192,0.00050402,0.00050613,0.00050823,0.00051033,0.00051244,0.00051455,0.00051665,0.00051875,0.00052086,0.00052297,0.00052507,0.00052718,0.00052928,0.00053138,0.00053349,0.0005356,0.0005377,0.00053934,0.00054098,0.00054262,0.00054426,0.0005459,0.00054754,0.00054918,0.00055082,0.00055246,0.0005541,0.00055574,0.00055738,0.00055902,0.00056066,0.0005623,0.00056394,0.00056558,0.00056722,0.00056886,0.0005705,0.00057214,0.00057378,0.00057542,0.00057706,0.0005787,0.00058034,0.00058198,0.00058362,0.00058526,0.0005869,0.00058809,0.00058927,0.00059046,0.00059164,0.00059283,0.00059402,0.0005952,0.00059639,0.00059757,0.00059876,0.00059995,0.00060113,0.00060232,0.0006035,0.00060469,0.00060588,0.00060706,0.00060825,0.00060943,0.00061062,0.00061181,0.00061299,0.00061418,0.00061536,0.00061655,0.00061774,0.00061892,0.00062011,0.00062129,0.00062248,0.00062367,0.00062485,0.00062604,0.00062722,0.00062841,0.0006296,0.00063078,0.00063197,0.00063315,0.00063434,0.00063553,0.00063671,0.0006379,0.00063908,0.00064027,0.00064146,0.00064264,0.00064383,0.00064501,0.0006462,0.00064705,0.00064791,0.00064876,0.00064962,0.00065047,0.00065132,0.00065218,0.00065303,0.00065389,0.00065474,0.00065559,0.00065645,0.0006573,0.00065816,0.00065901,0.00065986,0.00066072,0.00066157,0.00066243,0.00066328,0.00066413,0.00066499,0.00066584,0.0006667,0.00066755,0.0006684,0.00066926,0.00067011,0.00067097,0.00067182,0.00067267,0.00067353,0.00067438,0.00067524,0.00067609,0.00067694,0.0006778,0.00067865,0.00067951,0.00068036,0.00068121,0.00068207,0.00068292,0.00068378,0.00068463,0.00068548,0.00068634,0.00068719,0.00068805,0.0006889,0.00068956,0.00069022,0.00069087,0.00069153,0.00069219,0.00069285,0.00069351,0.00069416,0.00069482,0.00069548,0.00069614,0.0006968,0.00069745,0.00069811,0.00069877,0.00069943,0.00070009,0.00070074,0.0007014,0.00070206,0.00070272,0.00070338,0.00070403,0.00070469,0.00070535,0.00070601,0.00070667,0.00070732,0.00070798,0.00070864,0.0007093,0.00070996,0.00071061,0.00071127,0.00071193,0.00071259,0.00071325,0.0007139,0.00071456,0.00071522,0.00071588,0.00071654,0.00071719,0.00071785,0.00071851,0.00071917,0.00071983,0.00072048,0.00072114,0.0007218,0.00072233,0.00072286,0.0007234,0.00072393,0.00072446,0.00072499,0.00072552,0.00072606,0.00072659,0.00072712,0.00072765,0.00072818,0.00072872,0.00072925,0.00072978,0.00073031,0.00073084,0.00073138,0.00073191,0.00073244,0.00073297,0.0007335,0.00073404,0.00073457,0.0007351,0.00073563,0.00073616,0.0007367,0.00073723,0.00073776,0.00073829,0.00073882,0.00073936,0.00073989,0.00074042,0.00074095,0.00074148,0.00074202,0.00074255,0.00074308,0.00074361,0.00074414,0.00074468,0.00074521,0.00074574,0.00074627,0.0007468,0.00074734,0.00074787,0.0007484,0.00074884,0.00074929,0.00074973,0.00075018,0.00075062,0.00075106,0.00075151,0.00075195,0.0007524,0.00075284,0.00075328,0.00075373,0.00075417,0.00075462,0.00075506,0.0007555,0.00075595,0.00075639,0.00075684,0.00075728,0.00075772,0.00075817,0.00075861,0.00075906,0.0007595,0.00075994,0.00076039,0.00076083,0.00076128,0.00076172,0.00076216,0.00076261,0.00076305,0.0007635,0.00076394,0.00076438,0.00076483,0.00076527,0.00076572,0.00076616,0.0007666,0.00076705,0.00076749,0.00076794,0.00076838,0.00076882,0.00076927,0.00076971,0.00077016,0.0007706,0.00077098,0.00077136,0.00077174,0.00077212,0.0007725,0.00077288,0.00077326,0.00077364,0.00077402,0.0007744,0.00077478,0.00077516,0.00077554,0.00077592,0.0007763,0.00077668,0.00077706,0.00077744,0.00077782,0.0007782,0.00077858,0.00077896,0.00077934,0.00077972,0.0007801,0.00078048,0.00078086,0.00078124,0.00078162,0.000782,0.00078238,0.00078276,0.00078314,0.00078352,0.0007839,0.00078428,0.00078466,0.00078504,0.00078542,0.0007858,0.00078618,0.00078656,0.00078694,0.00078732,0.0007877,0.00078808,0.00078846,0.00078884,0.00078922,0.0007896,0.00078993,0.00079026,0.00079059,0.00079092,0.00079125,0.00079158,0.00079191,0.00079224,0.00079257,0.0007929,0.00079323,0.00079356,0.00079389,0.00079422,0.00079455,0.00079488,0.00079521,0.00079554,0.00079587,0.0007962,0.00079653,0.00079686,0.00079719,0.00079752,0.00079785,0.00079818,0.00079851,0.00079884,0.00079917,0.0007995,0.00079983,0.00080016,0.00080049,0.00080082,0.00080115,0.00080148,0.00080181,0.00080214,0.00080247,0.0008028,0.00080313,0.00080346,0.00080379,0.00080412,0.00080445,0.00080478,0.00080511,0.00080544,0.00080577,0.0008061,0.00080638,0.00080665,0.00080693,0.0008072,0.00080748,0.00080776,0.00080803,0.00080831,0.00080858,0.00080886,0.00080914,0.00080941,0.00080969,0.00080996,0.00081024,0.00081052,0.00081079,0.00081107,0.00081134,0.00081162,0.0008119,0.00081217,0.00081245,0.00081272,0.000813,0.00081328,0.00081355,0.00081383,0.0008141,0.00081438,0.00081466,0.00081493,0.00081521,0.00081548,0.00081576,0.00081604,0.00081631,0.00081659,0.00081686,0.00081714,0.00081742,0.00081769,0.00081797,0.00081824,0.00081852,0.0008188,0.00081907,0.00081935,0.00081962,0.0008199,0.00082018,0.00082045,0.00082073,0.000821,0.00082128,0.00082156,0.00082183,0.00082211,0.00082238,0.00082266,0.00082294,0.00082321,0.00082349,0.00082376,0.00082404,0.00082432,0.00082459,0.00082487,0.00082514,0.00082542,0.0008257,0.00082597,0.00082625,0.00082652,0.0008268,0.00082708,0.00082735,0.00082763,0.0008279,0.00082818,0.00082846,0.00082873,0.00082901,0.00082928,0.00082956,0.00082984,0.00083011,0.00083039,0.00083066,0.00083094,0.00083122,0.00083149,0.00083177,0.00083204,0.00083232,0.0008326,0.00083287,0.00083315,0.00083342,0.0008337,0.00083388,0.00083406,0.00083424,0.00083442,0.00083461,0.00083479,0.00083497,0.00083515,0.00083533,0.00083551,0.00083569,0.00083587,0.00083605,0.00083623,0.00083642,0.0008366,0.00083678,0.00083696,0.00083714,0.00083732,0.0008375,0.00083768,0.00083786,0.00083804,0.00083823,0.00083841,0.00083859,0.00083877,0.00083895,0.00083913,0.00083931,0.00083949,0.00083967,0.00083985,0.00084004,0.00084022,0.0008404,0.00084058,0.00084076,0.00084094,0.00084112,0.0008413,0.00084148,0.00084166,0.00084185,0.00084203,0.00084221,0.00084239,0.00084257,0.00084275,0.00084293,0.00084311,0.00084329,0.00084347,0.00084366,0.00084384,0.00084402,0.0008442,0.00084438,0.00084456,0.00084474,0.00084492,0.0008451,0.00084528,0.00084546,0.00084565,0.00084583,0.00084601,0.00084619,0.00084637,0.00084655,0.00084673,0.00084691,0.00084709,0.00084727,0.00084746,0.00084764,0.00084782,0.000848,0.00084818,0.00084836,0.00084854,0.00084872,0.0008489,0.00084908,0.00084927,0.00084945,0.00084963,0.00084981,0.00084999,0.00085017,0.00085035,0.00085053,0.00085071,0.00085089,0.00085108,0.00085126,0.00085144,0.00085162,0.0008518];

  // rateLOW is low branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab (as positive numbers until returned by getRxnRate)
  // rateLOW has 541 elements at 0.001 conc resolution from 0.460 through 1.000
  // below at 0.001 conc resolution, 541 elements
  // used in getRxnRate() method below
  this.rateLOW = [0.0003826,0.00037907,0.00037554,0.00037201,0.00036848,0.00036495,0.00036142,0.00035789,0.00035436,0.00035083,0.0003473,0.00034513,0.00034296,0.00034079,0.00033862,0.00033645,0.00033428,0.00033211,0.00032994,0.00032777,0.0003256,0.00032408,0.00032257,0.00032105,0.00031954,0.00031802,0.00031651,0.00031499,0.00031348,0.00031196,0.00031045,0.00030894,0.00030742,0.00030591,0.00030439,0.00030288,0.00030136,0.00029985,0.00029833,0.00029682,0.0002953,0.00029426,0.00029321,0.00029217,0.00029113,0.00029008,0.00028904,0.000288,0.00028695,0.00028591,0.00028487,0.00028382,0.00028278,0.00028174,0.00028069,0.00027965,0.00027861,0.00027756,0.00027652,0.00027548,0.00027443,0.00027339,0.00027235,0.0002713,0.00027026,0.00026922,0.00026817,0.00026713,0.00026609,0.00026504,0.000264,0.00026321,0.00026241,0.00026162,0.00026082,0.00026002,0.00025923,0.00025844,0.00025764,0.00025685,0.00025605,0.00025526,0.00025446,0.00025367,0.00025287,0.00025207,0.00025128,0.00025048,0.00024969,0.0002489,0.0002481,0.00024749,0.00024688,0.00024627,0.00024566,0.00024505,0.00024444,0.00024383,0.00024322,0.00024261,0.000242,0.00024139,0.00024078,0.00024017,0.00023956,0.00023895,0.00023834,0.00023773,0.00023712,0.00023651,0.0002359,0.00023529,0.00023468,0.00023407,0.00023346,0.00023285,0.00023224,0.00023163,0.00023102,0.00023041,0.0002298,0.00022919,0.00022858,0.00022797,0.00022736,0.00022675,0.00022614,0.00022553,0.00022492,0.00022431,0.0002237,0.00022309,0.00022248,0.00022187,0.00022126,0.00022065,0.00022004,0.00021943,0.00021882,0.00021821,0.0002176,0.0002172,0.0002168,0.0002164,0.000216,0.0002156,0.0002152,0.0002148,0.0002144,0.000214,0.0002136,0.0002132,0.0002128,0.0002124,0.000212,0.0002116,0.0002112,0.0002108,0.0002104,0.00021,0.0002096,0.0002092,0.0002088,0.0002084,0.000208,0.0002076,0.0002072,0.0002068,0.0002064,0.000206,0.0002056,0.0002052,0.0002048,0.0002044,0.000204,0.0002036,0.0002032,0.0002028,0.0002024,0.000202,0.0002016,0.0002012,0.0002008,0.0002004,0.0002,0.0001996,0.0001992,0.0001988,0.0001984,0.000198,0.0001976,0.0001972,0.0001968,0.0001964,0.000196,0.0001956,0.0001952,0.0001948,0.0001944,0.000194,0.0001936,0.0001932,0.0001928,0.0001924,0.000192,0.0001916,0.0001912,0.0001908,0.0001904,0.00019,0.0001896,0.0001892,0.0001888,0.0001884,0.000188,0.0001876,0.0001872,0.0001868,0.0001864,0.000186,0.0001856,0.0001852,0.0001848,0.0001844,0.000184,0.0001836,0.0001832,0.0001828,0.0001824,0.000182,0.0001816,0.0001812,0.0001808,0.0001804,0.00018,0.0001796,0.0001792,0.0001788,0.0001784,0.000178,0.0001776,0.00017734,0.00017708,0.00017681,0.00017655,0.00017629,0.00017603,0.00017577,0.0001755,0.00017524,0.00017498,0.00017472,0.00017446,0.00017419,0.00017393,0.00017367,0.00017341,0.00017315,0.00017288,0.00017262,0.00017236,0.0001721,0.00017184,0.00017157,0.00017131,0.00017105,0.00017079,0.00017053,0.00017026,0.00017,0.00016974,0.00016948,0.00016922,0.00016895,0.00016869,0.00016843,0.00016817,0.00016791,0.00016764,0.00016738,0.00016712,0.00016686,0.0001666,0.00016633,0.00016607,0.00016581,0.00016555,0.00016529,0.00016502,0.00016476,0.0001645,0.00016424,0.00016398,0.00016371,0.00016345,0.00016319,0.00016293,0.00016267,0.0001624,0.00016214,0.00016188,0.00016162,0.00016136,0.00016109,0.00016083,0.00016057,0.00016031,0.00016005,0.00015978,0.00015952,0.00015926,0.000159,0.00015874,0.00015847,0.00015821,0.00015795,0.00015769,0.00015743,0.00015716,0.0001569,0.00015664,0.00015638,0.00015612,0.00015585,0.00015559,0.00015533,0.00015507,0.00015481,0.00015454,0.00015428,0.00015402,0.00015376,0.0001535,0.00015323,0.00015297,0.00015271,0.00015245,0.00015219,0.00015192,0.00015166,0.0001514,0.00015121,0.00015102,0.00015083,0.00015064,0.00015045,0.00015026,0.00015007,0.00014988,0.00014969,0.0001495,0.00014931,0.00014912,0.00014893,0.00014874,0.00014855,0.00014836,0.00014817,0.00014798,0.00014779,0.0001476,0.00014741,0.00014722,0.00014703,0.00014684,0.00014665,0.00014646,0.00014627,0.00014608,0.00014589,0.0001457,0.00014551,0.00014532,0.00014513,0.00014494,0.00014475,0.00014456,0.00014437,0.00014418,0.00014399,0.0001438,0.00014361,0.00014342,0.00014323,0.00014304,0.00014285,0.00014266,0.00014247,0.00014228,0.00014209,0.0001419,0.00014171,0.00014152,0.00014133,0.00014114,0.00014095,0.00014076,0.00014057,0.00014038,0.00014019,0.00014,0.00013981,0.00013962,0.00013943,0.00013924,0.00013905,0.00013886,0.00013867,0.00013848,0.00013829,0.0001381,0.00013791,0.00013772,0.00013753,0.00013734,0.00013715,0.00013696,0.00013677,0.00013658,0.00013639,0.0001362,0.00013601,0.00013582,0.00013563,0.00013544,0.00013525,0.00013506,0.00013487,0.00013468,0.00013449,0.0001343,0.00013411,0.00013392,0.00013373,0.00013354,0.00013335,0.00013316,0.00013297,0.00013278,0.00013259,0.0001324,0.00013225,0.00013211,0.00013197,0.00013182,0.00013167,0.00013153,0.00013139,0.00013124,0.00013109,0.00013095,0.00013081,0.00013066,0.00013051,0.00013037,0.00013022,0.00013008,0.00012993,0.00012979,0.00012964,0.0001295,0.00012935,0.00012921,0.00012906,0.00012892,0.00012877,0.00012863,0.00012848,0.00012834,0.0001282,0.00012805,0.0001279,0.00012776,0.00012762,0.00012747,0.00012732,0.00012718,0.00012703,0.00012689,0.00012674,0.0001266,0.00012645,0.00012631,0.00012616,0.00012602,0.00012587,0.00012573,0.00012558,0.00012544,0.00012529,0.00012515,0.00012501,0.00012486,0.00012471,0.00012457,0.00012443,0.00012428,0.00012413,0.00012399,0.00012384,0.0001237,0.00012355,0.00012341,0.00012326,0.00012312,0.00012297,0.00012283,0.00012268,0.00012254,0.00012239,0.00012225,0.0001221,0.00012196,0.00012181,0.00012167,0.00012153,0.00012138,0.00012124,0.00012109,0.00012095,0.0001208,0.00012066,0.00012051,0.00012037,0.00012022,0.00012008,0.00011993,0.00011979,0.00011964,0.0001195,0.00011935,0.00011921,0.00011906,0.00011892,0.00011877,0.00011863,0.00011848,0.00011834,0.00011819,0.00011804,0.0001179];

  this.getRxnRate = function(conc) {
    // getRxnRate provides rate of formation of reactant per arbitrary mass
    //    catalyst from Reactor Lab Web Labs, lab 2, reaction-diffusion
    // USES this.rateBranchOLD, this.rateLOW, this.rateHIGH
    // convert from conc 0-1 to c = 0 to 100
    //    for use of c in array indexes
    // return rate as negative value for reactant conversion

    // for 0.001 conc resolution
    let c = Math.round(1000*conc); // 0 to 100
    if (c < 0) {
      c = 0;
    } else if (c > 1000) {
      c = 1000;
    }

    // determine rate branch, high vs. low
    let rate = 0;
    let cLowBreak = 460; // for 0.001 conc resolution
    let cHighBreak = 700; // for 0.001 conc resolution
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
    // initPlotData(numProfileVars,numProfilePts)
    // SPECIAL CASE - this will be points vs. feed conc so do not fill points
    let numProfileVars = 2; // conversion, rate
    let numProfilePts = 0; // 0+1 points will be filled here
    this.profileData = plotter.initPlotData(numProfileVars,numProfilePts);
    // SPECIAL CASE - move initial [0,0] x,y points of plots
    this.profileData[0] = [-1,-1];
    this.profileData[1] = [-1,-1];
    console.log('this.profileData[0] = ' + this.profileData[0]);

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

      // // for 0.01 conc increment
      // // round toFixed(3) to get ss check to work at low conc, since currently
      // // only define rate at 0.01 steps of conc and conc oscillates at
      // // small conc (consider change to finer resolution or continuous function)
      // // but when lower input to near zero input, min conc in rxrs is 0.0040 with
      // // current input, which shows in checksum as 40, because dcdt each step
      // // then too small to change conc at 3rd position to right decimal point
      // // so be careful when computing conversion after lower to zero input...
      // let newConcStr = newConc.toFixed(3); // toFixed returns string
      // this.conc = Number(newConcStr);
      // //

      // for 0.001 conc increment
      // round toFixed(4) to get ss check to work at low conc, since currently
      // only define rate at 0.001 steps of conc and conc oscillates at
      // small conc (consider change to finer resolution or continuous function)
      // but when lower input to near zero input, min conc in rxrs is xxx with
      // current input, which shows in checksum as 40, because dcdt each step
      // then too small to change conc at 4th position to right decimal point
      // so be careful when computing conversion after lower to zero input...
      let newConcStr = newConc.toFixed(4); // toFixed returns string
      this.conc = Number(newConcStr);

    } // END OF for (let i = 0; i < this.unitStepRepeats; i += 1)

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

    // XXX not needed if do not show dynamic converison strip chart plot
    // XXX also at array initialization only need 1 var for conc
    // XXX and above here at numStripVars
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
      if (tempArray[0][0] <= 0) {
        // shift deletes 1st [x,y] pair created on array initialization
        tempArray.shift();
      }
      // add the new [x,y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      if (processUnits[0].conc > 0) {
        // only add conversion when feed conc > 0
        tempArray.push( [processUnits[0].conc,this.conversion] );
      }
      // update the variable being processed
      this.profileData[v] = tempArray;

      // handle SS rate
      //
      v = 1;
      tempArray = this.profileData[v]; // work on one plot variable at a time
      if (tempArray[0][0] <= 0) {
        // shift deletes 1st [x,y] pair created on array initialization
        tempArray.shift();
      }
      // add the new [x,y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      let thisRate = -100 * this.rxnRate;
      tempArray.push( [this.conc,thisRate] );
      // update the variable being processed
      this.profileData[v] = tempArray;

    } // END OF if ((ssFlag == true) && (controller.ssStartTime == 0))

    return ssFlag;
  } // END OF checkForSteadyState()

} // END puCSTR
