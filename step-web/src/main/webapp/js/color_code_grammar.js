'use strict';
// Constants for c4 (current color code config), cc (color grammar const) and cv (color code variable) array index start
// This provdes a long readible name for the programmer.
// The maven process will replace the constant with number so the minify code is small.
// For the color_code_grammar.js and color_code_config.js, it reduced the size of the minify two files by almost 20k bytes.
// Each line starts with "const" and ends with "; // TBRBMR".
// Do not take away the TBRMBR comment (to be removed by maven replacer)
// The maven replacer look for these patterns and remove them from the minify code.
// should use const instead of var, but older browser does not support const
var C_Greek = 0; // TBRBMR
var C_enableVerbClr = 0; // TBRBMR
var C_inClrVerbItem = 1; // TBRBMR
var C_slctUlVerbItem = 2; // TBRBMR
var C_inPassiveBkgrdClr = 3; // TBRBMR
var C_inPassiveUlClr1 = 4; // TBRBMR
var C_chkbxPassiveBkgrdClr = 5; // TBRBMR
var C_chkbxPassiveBkgrdColrValue = 6; // TBRBMR
var C_chkbxPassiveUlClr1 = 7; // TBRBMR
var C_chkbxPassiveUlColr1Value = 8; // TBRBMR
var C_inMiddleBkgrdClr = 9; // TBRBMR
var C_inMiddleUlClr1 = 10; // TBRBMR
var C_chkbxMiddleBkgrdClr = 11; // TBRBMR
var C_chkbxMiddleBkgrdColrValue = 12; // TBRBMR
var C_chkbxMiddleUlClr1 = 13; // TBRBMR
var C_chkbxMiddleUlColr1Value = 14; // TBRBMR
var C_verbTableXHeader = 15; // TBRBMR
var C_verbTableYHeader = 16; // TBRBMR
var C_granularControlOfMoods = 17; // TBRBMR
var C_granularControlOfTenses = 18; // TBRBMR
var C_moodsOnOff = 19; // TBRBMR
var C_tensesOnOff = 20; // TBRBMR
var C_inAnimate = 21; // TBRBMR
var C_orderOfTense = 22; // TBRBMR
var C_orderOfMood = 23; // TBRBMR
var C_tenseToCombineWithPrevious = 24; // TBRBMR
var C_moodToCombineWithPrevious = 25; // TBRBMR
var C_xAxisForMood = 26; // TBRBMR
var C_inPassiveUlClr2 = 27; // TBRBMR
var C_inMiddleUlClr2 = 28; // TBRBMR
var C_chkbxPassiveUlClr2 = 29; // TBRBMR
var C_chkbxPassiveUlColr2Value = 30; // TBRBMR
var C_chkbxMiddleUlClr2 = 31; // TBRBMR
var C_chkbxMiddleUlColr2Value = 32; // TBRBMR
var C_OT = 1; // TBRBMR
var C_granularControlOfXAxis = 17; // TBRBMR
var C_granularControlOfYAxis = 18; // TBRBMR
var C_xAxisOnOff = 19; // TBRBMR
var C_yAxisOnOff = 20; // TBRBMR
var C_orderOfForm = 21; // TBRBMR
var C_verbFormToCombineWithPrevious = 22; // TBRBMR
var C_orderOfHebrewStem = 23; // TBRBMR
var C_hebrewStemToCombineWithPrevious = 24; // TBRBMR
var C_orderOfAramaicStem = 25; // TBRBMR
var C_aramaicStemToCombineWithPrevious = 26; // TBRBMR
var C_hebrewCodeOfStem = 27; // TBRBMR
var C_aramaicCodeOfStem = 28; // TBRBMR
var C_codeOfForm = 29; // TBRBMR
var C_xAxisForStem = 30; // TBRBMR
var C_enableAdvancedTools = 2; // TBRBMR
var C_enableGenderNumberClr = 3; // TBRBMR
var C_inClrMasculine = 4; // TBRBMR
var C_inClrFeminine = 5; // TBRBMR
var C_inClrNeuter = 6; // TBRBMR
var C_slctUlSingular = 7; // TBRBMR
var C_slctUlPlural = 8; // TBRBMR
var C_c4Version = 9; // TBRBMR
var C_activeIndexArray = 0; // TBRBMR
var C_middleIndexArray = 1; // TBRBMR
var C_passiveIndexArray = 2; // TBRBMR
var C_animationInterval = 3; // TBRBMR
var C_maxAnimationOnSamePageWithoutMovement = 4; // TBRBMR
var C_robinsonCodeOfTense = 5; // TBRBMR
var C_robinsonNameOfTense = 6; // TBRBMR
var C_defaultOrderOfTense = 7; // TBRBMR
var C_defaultTenseToCombineWithPrevious = 8; // TBRBMR
var C_robinsonCodeOfMood = 9; // TBRBMR
var C_robinsonNameOfMood = 10; // TBRBMR
var C_defaultOrderOfMood = 11; // TBRBMR
var C_defaultMoodToCombineWithPrevious = 12; // TBRBMR
var C_otNameOfVerbForm = 13; // TBRBMR
var C_defaultOrderOfOTVerbForm = 14; // TBRBMR
var C_defaultOTVerbFormToCombineWithPrevious = 15; // TBRBMR
var C_hebrewNameOfStem = 16; // TBRBMR
var C_defaultOrderOfHebrewStem = 17; // TBRBMR
var C_defaultHebriewStemToCombineWithPrevious = 18; // TBRBMR
var C_aramaicNameOfStem = 19; // TBRBMR
var C_defaultOrderOfAramaicStem = 20; // TBRBMR
var C_defaultAramaicStemToCombineWithPrevious = 21; // TBRBMR
var C_underlineCanvasName = 22; // TBRBMR
var C_canvasUnderlineName = 23; // TBRBMR
var C_moodIndexArray = 24; // TBRBMR
var C_tenseIndexArray = 25; // TBRBMR
var C_defaultCodeOfForm = 26; // TBRBMR
var C_defaultHebrewCodeOfStem = 27; // TBRBMR
var C_defaultAramaicCodeOfStem = 28; // TBRBMR
var C_colorCodeGrammarAvailableAndSelected = 0; // TBRBMR
var C_otMorph = 1; // TBRBMR
var C_displayQuickTryoutAccordion1 = 2; // TBRBMR
var C_displayQuickTryoutAccordion2 = 3; // TBRBMR
var C_displayQuickTryoutAccordion3 = 4; // TBRBMR
var C_uLBASEIMGS = 5; // TBRBMR
var C_ulVerbCSS = 6; // TBRBMR
var C_ulOTVbCSS = 7; // TBRBMR
var C_oTFormIndex2CSS = 8; // TBRBMR
var C_hebrewStemIndex2CSS = 9; // TBRBMR
var C_aramaicStemIndex2CSS = 10; // TBRBMR
var C_handleOfRequestedAnimation = 11; // TBRBMR
var C_copyOfPassiveIndexArray = 12; // TBRBMR
var C_copyOfMiddleIndexArray = 13; // TBRBMR
var C_animationIndexArray = 14; // TBRBMR
var C_timestampOfLastAnimation = 15; // TBRBMR
var C_numOfAnimationsAlreadyPerformedOnSamePage = 16; // TBRBMR
var C_axisUserSelectedToSort = 17; // TBRBMR
var C_userProvidedSortOrder = 18; // TBRBMR
var C_updatedGenderNumberCSS = 19; // TBRBMR
var C_userTurnGenderNumberFromOffToOn = 20; // TBRBMR
// End of const for c4 (current color code config), cc (color grammar const) and cv (color code variable) array index start

/**
 * Underline object
 * @constructor
 */
function ULOBJ(nameOfUlObj) {
  this.name = nameOfUlObj;
  this.img = new Image();
  this.canvas = null;
  this.context = null;
  this.animCount = 0;
  this.animIncrement = 1;
  this.displayStatusByMood = true;
  this.displayStatusByTense = true;
}

/**
 * Name of grammar items and array their index
 * @constructor
 */
function NAMEANDARRAY(argName, argArray) {
  this.name = argName;
  this.array = argArray;
}

var cc = [ /* cc = Color code grammar const.  Changed from const to var because of older browser */
  // C_activeIndexArray
  [0, 3, 6, 8, 11, 14, 17, 20, 21, 22, 25, 26, 27, 30, 33, 36, 41, 44, 47, 50, 53, 56, 59, 62, 65, 67, 70, 71],
  // C_middleIndexArray
  [1, 4, 7, 9, 12, 15, 18, 23, 28, 31, 34, 37, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 68, 72],
  // C_passiveIndexArray
  [2, 5, 10, 13, 16, 19, 24, 29, 32, 35, 38, 40, 43, 46, 49, 52, 55, 58, 61, 64, 69, 73],
  // C_animationInterval
  800, // Milliseconds per frame for animation.  Lower number will use more CPU
  // C_maxAnimationOnSamePageWithoutMovement
  1125,  // 900,000 / animationInterval there are 900,000 is milliseconds in 15 minutes. Stop wasting CPU if the user did not display a new passage, used quick lexicon and use the sidebar
  // C_robinsonCodeOfTense
  {
    'p': 'present',
    'i': 'imperfect',
    'r': 'perfect',
    'l': 'pluperfect',
    'a': 'aorist',
    'f': 'future'
  },
  // C_robinsonNameOfTense
  {
    'present': 'p',
    'imperfect': 'i',
    'perfect': 'r',
    'pluperfect': 'l',
    'aorist': 'a',
    'future': 'f'
  },
  // C_defaultOrderOfTense
  ['r', 'l', 'i', 'a', 'p', 'f'],
  // C_defaultTenseToCombineWithPrevious
  [false, false, false, false, false, false],
  // C_robinsonCodeOfMood
  {
    'i': 'indicative',
    's': 'subjunctive',
    'o': 'optative',
    'm': 'imperative',
    'n': 'infinitive',
    'p': 'participle'
  },
  // C_robinsonNameOfMood
  {
    'indicative': 'i',
    'subjunctive': 's',
    'optative': 'o',
    'imperative': 'm',
    'infinitive': 'n',
    'participle': 'p'
  },
  // C_defaultOrderOfMood
  ['i', 's', 'o', 'm', 'n', 'p'],
  // C_defaultMoodToCombineWithPrevious
  [false, false, false, false, false, false],
  // C_otNameOfVerbForm
  {
    'perfect': 'p',
    'va_imperfect': 'w',
    'infinitive': 'f',
    'participle': 'r',
    'participle_passive': 's',
    'imperative': 'v',
    'imperfect_not_jussive': 'n',
    've_perfect': 'q',
    'imperfect': 'i',
    've_imperfect': 'u',
    'jussive': 'j',
    'cohortative': 'c'
  },
  // C_defaultOrderOfOTVerbForm
  [             'p',   'w',  'f',   'r',   's',  'v',   'i',   'q',  'n',  'u',  'j',   'c'],
  // C_defaultOTVerbFormToCombineWithPrevious
  [false, true, false, false, true, false, false, true, true, true, false, true],
  // C_hebrewNameOfStem
  {
    // Action: Simple
    'qal': 'q',      // Voice: Active
    'niphal': 'N',   // Voice: Passive
    'hithpael': 't', // Voice: Middle
    // Action: Intensive / Resultative
    'piel': 'p',    // Voice: Active
    'pual': 'P', hothpaal: 'u', nithpael: 'D', polal: 'O', // Voice: Passive
    // Action: Causative / Declarative
    'hiphil': 'h', tiphil: 'c', // Voice: Active
    'hophal': 'H',              // Voice: Passive
    'hishtaphel': 'v'           // Voice: Middle
  },
  // C_defaultOrderOfHebrewStem
  ['q', 'N', 't', 'p', 'P', 'u', 'D', 'O', 'h', 'c', 'H', 'v'],
  // C_defaultHebriewStemToCombineWithPrevious
  [false, true, true,
    false, true, true, true, true,
    false, true, true, true],
  // C_aramaicNameOfStem
  {
    // Action: Simple
    'peal': 'q',   // Voice: Active
    'peil': 'Q',   // Voice: Passive
    'itpeel': 'i', hishtaphel: 't', // Voice: Middle
    // Action: Intensive / Resultative
    'pael': 'p',     // Voice: Active
    'hithpeel': 'u', // Voice: Passive
    'ithpaal': 'P', hithpaal: 'M', // Voice: Middle
    // Action: Causative / Declarative
    'aphel': 'a', haphel: 'h', shaphel: 'e', // Voice: Active
    'hophal': 'H',             // Voice: Passive
    'ishtaphel': 'v'           // Voice: Middle
  },
  // C_defaultOrderOfAramaicStem
  ['q', 'Q', 'i', 't', 'p', 'u', 'P', 'M', 'a', 'h', 'e', 'H', 'v'],
  // C_defaultAramaicStemToCombineWithPrevious
  [false, true, true, true,
    false, true, true, true,
    false, true, true, true, true],
  // C_underlineCanvasName
  {
    'Arrow': 'ulArrow',
    'Short Arrow': 'ulShortArrow',
    'Reverse Arrow': 'ulReverseArrow',
    'Short Reverse Arrow': 'ulShortReverseArrow',
    'Dash': 'ulDash',
    '2 lines': 'ulDoubleSolid',
    'Underline': 'ulSolid',
    'Dots': 'ulDot',
    'Wave': 'ulWave',
    'Dash Dot': 'ulDashDot',
    'Dash Dot Dot': 'ulDashDotDot',
    'None': 'ulNone'
  },
  // C_canvasUnderlineName
  {
    'ulArrow': 'Arrow',
    'ulShortArrow': 'Short Arrow',
    'ulReverseArrow': 'Reverse Arrow',
    'ulShortReverseArrow': 'Short Reverse Arrow',
    'ulDash': 'Dash',
    'ulDoubleSolid': '2 lines',
    'ulSolid': 'Underline',
    'ulDot': 'Dots',
    'ulWave': 'Wave',
    'ulDashDot': 'Dash Dot',
    'ulDashDotDot': 'Dash Dot Dot',
    'ulNone': 'None'
  },
  // C_moodIndexArray
  [
    new NAMEANDARRAY('indicative', [0, 1, 2, 17, 18, 19, 22, 23, 24, 36, 37, 38, 41, 42, 43, 59, 60, 61]),
    new NAMEANDARRAY('subjunctive', [3, 4, 5, 20, 25, 44, 45, 46, 62, 63, 64]),
    new NAMEANDARRAY('optative', [6, 7, 26, 47, 48, 49, 65, 66]),
    new NAMEANDARRAY('imperative', [8, 9, 10, 27, 28, 29, 50, 51, 52, 70]),
    new NAMEANDARRAY('infinitive', [11, 12, 13, 30, 31, 32, 53, 54, 55, 67, 68, 69]),
    new NAMEANDARRAY('participle', [14, 15, 16, 21, 33, 34, 35, 39, 40, 56, 57, 58, 71, 72, 73])
  ],
  // C_tenseIndexArray
  [
    new NAMEANDARRAY('present', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    new NAMEANDARRAY('imperfect', [17, 18, 19, 20, 21]),
    new NAMEANDARRAY('perfect', [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
    new NAMEANDARRAY('pluperfect', [36, 37, 38, 39, 40]),
    new NAMEANDARRAY('aorist', [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]),
    new NAMEANDARRAY('future', [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73])
  ],
  // C_defaultCodeOfForm
  {
    p: ['perfect', 'Perfect', true],
    w: ['va_imperfect', 'va+Imperfect', true],
    f: ['infinitive', 'Infinitive', true],
    r: ['participle', 'Participle', true],
    s: ['participle_passive', 'Participle-Passive', false],
    v: ['imperative', 'Imperative', true],
    n: ['imperfect_not_jussive', 'Imperfect-not-jussive', false],
    q: ['ve_perfect', 've+Perfect', true],
    i: ['imperfect', 'Imperfect', true],
    u: ['ve_imperfect', 've+Imperfect', false],
    j: ['jussive', 'Jussive', true],
    c: ['cohortative', 'Cohortative', true]
  },
  // C_defaultHebrewCodeOfStem
  {
    // Action: Simple
    q: ['qal', 'a', true],      // Voice: Active
    N: ['niphal', 'p', true],   // Voice: Passive
    t: ['hithpael', 'm', true], // Voice: Middle
    // Action: Intensive / Resultative
    p: ['piel', 'a', true],    // Voice: Active
    P: ['pual', 'p', true], u: ['hothpaal', 'p', false], D: ['nithpael', 'p', false], O: ['polal', 'p', false], // Voice: Passive
    // Action: Causative / Declarative
    h: ['hiphil', 'a', true], c: ['tiphil', 'a', false], // Voice: Active
    H: ['hophal', 'p', true],              // Voice: Passive
    v: ['hishtaphel', 'm', true]           // Voice: Middle
  },
  // C_defaultAramaicCodeOfStem
  {
    // Action: Simple
    q: ['peal', 'a', false],   // Voice: Active
    Q: ['peil', 'p', false],   // Voice: Passive
    i: ['itpeel', 'm', false], t: ['hishtaphel', 'm', false], // Voice: Middle
    // Action: Intensive / Resultative
    p: ['pael', 'a', false],     // Voice: Active
    u: ['hithpeel', 'p', false], // Voice: Passive
    P: ['ithpaal', 'm', false], M: ['hithpaal', 'm', true], // Voice: Middle
    // Action: Causative / Declarative
    a: ['aphel', 'a', false], h: ['haphel', 'a', false], e: ['shaphel', 'a', false], // Voice: Active
    H: ['hophal', 'p', false],              // Voice: Passive
    v: ['ishtaphel', 'm', false]           // Voice: Middle
  }
];

var cv = // cv = Color code grammar variables
[
  // C_colorCodeGrammarAvailableAndSelected
  false,
  // C_otMorph
  null,
  // C_displayQuickTryoutAccordion1
  true, // display the first section of the quick link by default
  // C_displayQuickTryoutAccordion2
  false,
  // C_displayQuickTryoutAccordion3
  false,
  // C_uLBASEIMGS
  [ new ULOBJ('ulArrow'), new ULOBJ('ulDash'), new ULOBJ('ulSolid'),
    new ULOBJ('ulDoubleSolid'), new ULOBJ('ulDot'), new ULOBJ('ulWave'),
    new ULOBJ('ulDashDot'), new ULOBJ('ulDashDotDot'), new ULOBJ('ulShortArrow'),
    new ULOBJ('ulReverseArrow'), new ULOBJ('ulShortReverseArrow'), new ULOBJ('ulNone') ],
  // C_ulVerbCSS
  [ new ULOBJ('pai'), /* 0 */  new ULOBJ('pmi'), /* 1 */  new ULOBJ('ppi'), // 2
    new ULOBJ('pas'), /* 3 */  new ULOBJ('pms'), /* 4 */  new ULOBJ('pps'), // 5
    new ULOBJ('pao'), /* 6 */  new ULOBJ('pmo'), // 7
    new ULOBJ('pam'), /* 8 */  new ULOBJ('pmm'), /* 9 */  new ULOBJ('ppm'), // 10
    new ULOBJ('pan'), /* 11 */ new ULOBJ('pmn'), /* 12 */ new ULOBJ('ppn'), // 13
    new ULOBJ('pap'), /* 14 */ new ULOBJ('pmp'), /* 15 */ new ULOBJ('ppp'), // 16

    new ULOBJ('iai'), /* 17 */ new ULOBJ('imi'), /* 18 */ new ULOBJ('ipi'), // 19
    new ULOBJ('ias'), // 20
    new ULOBJ('iap'), // 21

    new ULOBJ('rai'), /* 22 */ new ULOBJ('rmi'), /* 23 */ new ULOBJ('rpi'), // 24
    new ULOBJ('ras'), /* 25 */
    new ULOBJ('rao'), /* 26 */
    new ULOBJ('ram'), /* 27 */ new ULOBJ('rmm'), /* 28 */ new ULOBJ('rpm'), // 29
    new ULOBJ('ran'), /* 30 */ new ULOBJ('rmn'), /* 31 */ new ULOBJ('rpn'), // 32
    new ULOBJ('rap'), /* 33 */ new ULOBJ('rmp'), /* 34 */ new ULOBJ('rpp'), // 35

    new ULOBJ('lai'), /* 36 */ new ULOBJ('lmi'), /* 37 */ new ULOBJ('lpi'), // 38
                               new ULOBJ('lmp'), /* 39 */ new ULOBJ('lpp'), // 40

    new ULOBJ('aai'), /* 41 */ new ULOBJ('ami'), /* 42 */ new ULOBJ('api'), // 43
    new ULOBJ('aas'), /* 44 */ new ULOBJ('ams'), /* 45 */ new ULOBJ('aps'), // 46
    new ULOBJ('aao'), /* 47 */ new ULOBJ('amo'), /* 48 */ new ULOBJ('apo'), // 49
    new ULOBJ('aam'), /* 50 */ new ULOBJ('amm'), /* 51 */ new ULOBJ('apm'), // 52
    new ULOBJ('aan'), /* 53 */ new ULOBJ('amn'), /* 54 */ new ULOBJ('apn'), // 55
    new ULOBJ('aap'), /* 56 */ new ULOBJ('amp'), /* 57 */ new ULOBJ('app'), // 58

    new ULOBJ('fai'), /* 59 */ new ULOBJ('fmi'), /* 60 */ new ULOBJ('fpi'), // 61
    new ULOBJ('fas'), /* 62 */ new ULOBJ('fms'), /* 63 */ new ULOBJ('fps'), // 64
    new ULOBJ('fao'), /* 65 */ new ULOBJ('fmo'), /* 66 */
    new ULOBJ('fan'), /* 67 */ new ULOBJ('fmn'), /* 68 */ new ULOBJ('fpn'), // 69
    new ULOBJ('fam'), // 70
    new ULOBJ('fap'), /* 71 */ new ULOBJ('fmp'), /* 72 */ new ULOBJ('fpp')  // 73
    ],
  // C_ulOTVbCSS
  [],
  // C_oTFormIndex2CSS
  {},
  // C_hebrewStemIndex2CSS
  {},
  // C_aramaicStemIndex2CSS
  {},
  // C_handleOfRequestedAnimation
  -1,
  // C_copyOfPassiveIndexArray
  cc[C_passiveIndexArray].slice(0),
  // C_copyOfMiddleIndexArray
  cc[C_middleIndexArray].slice(0),
  // C_animationIndexArray
  [],
  // C_timestampOfLastAnimation
  0,
  // C_numOfAnimationsAlreadyPerformedOnSamePage
  0, // If the number of animation on the same page is high, the user might not be around
  // C_axisUserSelectedToSort
  '',
  // C_userProvidedSortOrder
  [],
  // C_updatedGenderNumberCSS
  false,
  // C_userTurnGenderNumberFromOffToOn
  false
];

var c4;  //c4 is currentClrCodeConfig.  It is changed to c4 to save space

var cf = {
  createC4: function() { // c4 is current color code config
    var x = [];
    x[C_Greek] = [];
        x[C_Greek][C_enableVerbClr] = true;
        x[C_Greek][C_inClrVerbItem] = ['#31ff00', '#ffa500', '#925011', '#f92d02', '#fff700', '#091bfd'];
        x[C_Greek][C_slctUlVerbItem] = ['Short Reverse Arrow', 'Short Reverse Arrow', 'Reverse Arrow', 'Dots', 'Dash', 'Arrow'];
        x[C_Greek][C_inPassiveBkgrdClr] = '#ffd6b8';
        x[C_Greek][C_inPassiveUlClr1] = '#000000';
        x[C_Greek][C_chkbxPassiveBkgrdClr] = true;
        x[C_Greek][C_chkbxPassiveBkgrdColrValue] = false;
        x[C_Greek][C_chkbxPassiveUlClr1] = true;
        x[C_Greek][C_chkbxPassiveUlColr1Value] = false;
        x[C_Greek][C_inMiddleBkgrdClr] = '#a3fefe';
        x[C_Greek][C_inMiddleUlClr1] = '#000000';
        x[C_Greek][C_chkbxMiddleBkgrdClr] = true;
        x[C_Greek][C_chkbxMiddleBkgrdColrValue] = false;
        x[C_Greek][C_chkbxMiddleUlClr1] = true;
        x[C_Greek][C_chkbxMiddleUlColr1Value] = false;
        x[C_Greek][C_verbTableXHeader] = null;
        x[C_Greek][C_verbTableYHeader] = { desc: ['Past', 'Past /<br>Present', 'Present', 'Future'], repeat: [2, 0, 0, 0] };
        x[C_Greek][C_granularControlOfMoods] = false;
        x[C_Greek][C_granularControlOfTenses] = false;
        x[C_Greek][C_moodsOnOff] = [false, false, false, false, false, false];
        x[C_Greek][C_tensesOnOff] = [false, false, false, false, false, false];
        x[C_Greek][C_inAnimate] = [false, false, false, false, false, false];
        x[C_Greek][C_orderOfTense] = cc[C_defaultOrderOfTense];
        x[C_Greek][C_orderOfMood] = cc[C_defaultOrderOfMood];
        x[C_Greek][C_tenseToCombineWithPrevious] = cc[C_defaultTenseToCombineWithPrevious];
        x[C_Greek][C_moodToCombineWithPrevious] = cc[C_defaultMoodToCombineWithPrevious];
        x[C_Greek][C_xAxisForMood] = true;
        x[C_Greek][C_inPassiveUlClr2] = '#ffffff';
        x[C_Greek][C_inMiddleUlClr2] = '#ffffff';
        x[C_Greek][C_chkbxPassiveUlClr2] = false;
        x[C_Greek][C_chkbxPassiveUlColr2Value] = false;
        x[C_Greek][C_chkbxMiddleUlClr2] = false;
        x[C_Greek][C_chkbxMiddleUlColr2Value] = false;
    x[C_OT] = [];
        x[C_OT][C_enableVerbClr] = true;
        x[C_OT][C_inClrVerbItem] = ['#000000', '#ff0000', '#0000ff', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'];
        x[C_OT][C_slctUlVerbItem] = ['Reverse Arrow', 'Dots', 'Dash', 'Dash Dot', 'Arrow', 'Short Arrow', 'Underline', 'Underline', 'Underline', 'Underline', 'Underline', 'Underline'];
        x[C_OT][C_inPassiveBkgrdClr] = '#ffd6b8';
        x[C_OT][C_inPassiveUlClr1] = '#000000';
        x[C_OT][C_chkbxPassiveBkgrdClr] = true;
        x[C_OT][C_chkbxPassiveBkgrdColrValue] = true;
        x[C_OT][C_chkbxPassiveUlClr1] = true;
        x[C_OT][C_chkbxPassiveUlColr1Value] = false;
        x[C_OT][C_inMiddleBkgrdClr] = '#a3fefe';
        x[C_OT][C_inMiddleUlClr1] = '#000000';
        x[C_OT][C_chkbxMiddleBkgrdClr] = true;
        x[C_OT][C_chkbxMiddleBkgrdColrValue] = true;
        x[C_OT][C_chkbxMiddleUlClr1] = true;
        x[C_OT][C_chkbxMiddleUlColr1Value] = false;
        x[C_OT][C_verbTableXHeader] = { desc: ['Simple','Intensive / Resultative', 'Causative / Declarative'], repeat: [0, 0, 0]};
        x[C_OT][C_verbTableYHeader] = { desc: ['Past or poss.<br>Present','Any time<br>or Present', 'Present or<br>Future'], repeat: [0, 2, 1] };
        x[C_OT][C_granularControlOfXAxis] = false;
        x[C_OT][C_granularControlOfYAxis] = false;
        x[C_OT][C_xAxisOnOff] = [false, false, false, false, false, false, false, false, false, false, false, false];
        x[C_OT][C_yAxisOnOff] = [false, false, false, false, false, false, false, false, false, false, false, false];
        x[C_OT][C_orderOfForm] = cc[C_defaultOrderOfOTVerbForm];
        x[C_OT][C_verbFormToCombineWithPrevious] = cc[C_defaultOTVerbFormToCombineWithPrevious];
        x[C_OT][C_orderOfHebrewStem] = cc[C_defaultOrderOfHebrewStem];
        x[C_OT][C_hebrewStemToCombineWithPrevious] = cc[C_defaultHebriewStemToCombineWithPrevious];
        x[C_OT][C_orderOfAramaicStem] = cc[C_defaultOrderOfAramaicStem];
        x[C_OT][C_aramaicStemToCombineWithPrevious] = cc[C_defaultAramaicStemToCombineWithPrevious];
        x[C_OT][C_hebrewCodeOfStem] = cc[C_defaultHebrewCodeOfStem];
        x[C_OT][C_aramaicCodeOfStem] = cc[C_defaultAramaicCodeOfStem];
        x[C_OT][C_codeOfForm] = cc[C_defaultCodeOfForm];
        x[C_OT][C_xAxisForStem] = true;
    x[C_enableAdvancedTools] = true;
    x[C_enableGenderNumberClr] = true;
    x[C_inClrMasculine] = '#000099';
    x[C_inClrFeminine] = '#C90000';
    x[C_inClrNeuter] = '#000000';
    x[C_slctUlSingular] = 'normal';
    x[C_slctUlPlural] = 'bold';
    x[C_c4Version] = '20190905';
    return x;
  },
  // Do not shorten name, called by Javascript functions outside of color_code_grammar and color_code_config
  initCanvasAndCssForClrCodeGrammar: function() {
      if (c4 === undefined) { cf.getC4(); } //c4 is currentClrCodeConfig.  It is changed to c4 to save space
	  cf.addVerbTable(false, '#colorCodeTableDiv');
	  cf.createUlArrow();
	  cf.createUlShortArrow();
	  cf.createUlReverseArrow();
	  cf.createUlShortReverseArrow();
	  cf.createUl_Dash();
	  cf.createUlSolid();
	  cf.createUlDash_Dot();
	  cf.createUlDashDotDot();
	  cf.createUlNone();
	  cf.createUlDoubleSolid();
	  cf.createUlDot();
	  cf.createUlWave();
	  cf.createUlForAllItemsInYAndX();
	  cf.createUlFor_OT();
	  cf.goAnimate(0);
  },

  calcAnimationPixelIncrement: function (width) {
    var increment = Math.round(width / 5);
    // increment has to be an odd number so that the underline to highligh passive
    // and middle voice can change to alternate between two colors in goAnimate()
    if (increment % 2 === 0) {
      if (increment > 3) { increment -= 1; }
      else { increment += 1; }
    }
    return increment;
  },

  createCanvas: function (canvasId, width, height) {
    var canvas = document.getElementById(canvasId);
    if (canvas == undefined) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.width = width;
      canvas.height = height;
      canvas.hidden = true;
      var body = document.getElementsByTagName('body')[0];
      body.appendChild(canvas);
    }
    return canvas;
  },

  createUlArrow: function() {
    var ulArrow = cv[C_uLBASEIMGS][0];
    ulArrow.canvas = cf.createCanvas(ulArrow.name, 18, 10);
    ulArrow.context = ulArrow.canvas.getContext('2d');
    ulArrow.context.beginPath();
    ulArrow.context.lineJoin = 'round';
    ulArrow.context.lineWidth = 1;
    ulArrow.context.moveTo(9, 2);
    ulArrow.context.lineTo(18, 5);
    ulArrow.context.lineTo(9, 8);
    ulArrow.context.fill();
    ulArrow.context.closePath();
    ulArrow.context.beginPath();
    ulArrow.context.lineWidth = 2;
    ulArrow.context.moveTo(9, 5);
    ulArrow.context.lineTo(3, 5);
    ulArrow.context.stroke();
    ulArrow.context.closePath();
    ulArrow.img.src = ulArrow.canvas.toDataURL('image/png');
    ulArrow.animIncrement = cf.calcAnimationPixelIncrement(ulArrow.canvas.width);
  },

  createUlShortArrow: function() {
    var ulArrow = cv[C_uLBASEIMGS][8];
    ulArrow.canvas = cf.createCanvas(ulArrow.name, 10, 10);
    ulArrow.context = ulArrow.canvas.getContext('2d');
    ulArrow.context.beginPath();
    ulArrow.context.lineJoin = 'round';
    ulArrow.context.lineWidth = 2;
    ulArrow.context.moveTo(3, 2);
    ulArrow.context.lineTo(10, 5);
    ulArrow.context.lineTo(3, 8);
    ulArrow.context.stroke();
    ulArrow.context.closePath();
    ulArrow.img.src = ulArrow.canvas.toDataURL('image/png');
    ulArrow.animIncrement = cf.calcAnimationPixelIncrement(ulArrow.canvas.width);
  },

  createUlReverseArrow: function() {
    var ulArrow = cv[C_uLBASEIMGS][9];
    ulArrow.canvas = cf.createCanvas(ulArrow.name, 18, 10);
    ulArrow.context = ulArrow.canvas.getContext('2d');
    ulArrow.context.beginPath();
    ulArrow.context.lineJoin = 'round';
    ulArrow.context.lineWidth = 1;
    ulArrow.context.moveTo(9, 2);
    ulArrow.context.lineTo(0, 5);
    ulArrow.context.lineTo(9, 8);
    ulArrow.context.fill();
    ulArrow.context.closePath();
    ulArrow.context.beginPath();
    ulArrow.context.lineWidth = 2;
    ulArrow.context.moveTo(9, 5);
    ulArrow.context.lineTo(15, 5);
    ulArrow.context.stroke();
    ulArrow.context.closePath();
    ulArrow.img.src = ulArrow.canvas.toDataURL('image/png');
    ulArrow.animIncrement = cf.calcAnimationPixelIncrement(ulArrow.canvas.width);
  },

  createUlShortReverseArrow: function() {
    var ulArrow = cv[C_uLBASEIMGS][10];
    ulArrow.canvas = cf.createCanvas(ulArrow.name, 10, 10);
    ulArrow.context = ulArrow.canvas.getContext('2d');
    ulArrow.context.beginPath();
    ulArrow.context.lineJoin = 'round';
    ulArrow.context.lineWidth = 2;
    ulArrow.context.moveTo(8, 2);
    ulArrow.context.lineTo(1, 5);
    ulArrow.context.lineTo(8, 8);
    ulArrow.context.stroke();
    ulArrow.context.closePath();
    ulArrow.img.src = ulArrow.canvas.toDataURL('image/png');
    ulArrow.animIncrement = cf.calcAnimationPixelIncrement(ulArrow.canvas.width);
  },

  createUl_Dash: function() {
    var ulDash = cv[C_uLBASEIMGS][1];
    ulDash.canvas = cf.createCanvas(ulDash.name, 13, 10);
    ulDash.context = ulDash.canvas.getContext('2d');
    ulDash.context.beginPath();
    ulDash.context.lineWidth = 4;
    ulDash.context.moveTo(4, 4);
    ulDash.context.lineTo(13, 4);
    ulDash.context.stroke();
    ulDash.context.closePath();
    ulDash.img.src = ulDash.canvas.toDataURL('image/png');
    ulDash.animIncrement = cf.calcAnimationPixelIncrement(ulDash.canvas.width);
  },

  createUlSolid: function() {
    var ulSolid = cv[C_uLBASEIMGS][2];
    ulSolid.canvas = cf.createCanvas(ulSolid.name, 1, 10);
    ulSolid.context = ulSolid.canvas.getContext('2d');
    ulSolid.context.beginPath();
    ulSolid.context.lineWidth = 3;
    ulSolid.context.moveTo(0, 4);
    ulSolid.context.lineTo(1, 4);
    ulSolid.context.stroke();
    ulSolid.context.closePath();
    ulSolid.img.src = ulSolid.canvas.toDataURL('image/png');
  },

  createUlDash_Dot: function() {
    var ulDashDot = cv[C_uLBASEIMGS][6];
    ulDashDot.canvas = cf.createCanvas(ulDashDot.name, 19, 10);
    ulDashDot.context = ulDashDot.canvas.getContext('2d');
    ulDashDot.context.beginPath();
    ulDashDot.context.arc(5, 4, 2, 0, 2 * Math.PI);
    ulDashDot.context.fill();
    ulDashDot.context.stroke();
    ulDashDot.context.closePath();
    ulDashDot.context.beginPath();
    ulDashDot.context.lineWidth = 4;
    ulDashDot.context.moveTo(10, 4);
    ulDashDot.context.lineTo(19, 4);
    ulDashDot.context.stroke();
    ulDashDot.context.closePath();
    ulDashDot.img.src = ulDashDot.canvas.toDataURL('image/png');
    ulDashDot.animIncrement = cf.calcAnimationPixelIncrement(ulDashDot.canvas.width);
  },

  createUlDashDotDot: function() {
    var ulDashDotDot = cv[C_uLBASEIMGS][7];
    ulDashDotDot.canvas = cf.createCanvas(ulDashDotDot.name, 26, 10);
    ulDashDotDot.context = ulDashDotDot.canvas.getContext('2d');
    ulDashDotDot.context.beginPath();
    ulDashDotDot.context.arc(5, 4, 2, 0, 2 * Math.PI);
    ulDashDotDot.context.fill();
    ulDashDotDot.context.stroke();
    ulDashDotDot.context.closePath();
    ulDashDotDot.context.beginPath();
    ulDashDotDot.context.arc(12, 4, 2, 0, 2 * Math.PI);
    ulDashDotDot.context.fill();
    ulDashDotDot.context.stroke();
    ulDashDotDot.context.closePath();
    ulDashDotDot.context.beginPath();
    ulDashDotDot.context.lineWidth = 4;
    ulDashDotDot.context.moveTo(17, 4);
    ulDashDotDot.context.lineTo(26, 4);
    ulDashDotDot.context.stroke();
    ulDashDotDot.context.closePath();
    ulDashDotDot.img.src = ulDashDotDot.canvas.toDataURL('image/png');
    ulDashDotDot.animIncrement = cf.calcAnimationPixelIncrement(ulDashDotDot.canvas.width);
  },

  createUlNone: function() {
    var ulNone = cv[C_uLBASEIMGS][11];
    ulNone.canvas = cf.createCanvas(ulNone.name, 1, 10);
    ulNone.context = ulNone.canvas.getContext('2d');
    ulNone.img.src = ulNone.canvas.toDataURL('image/png');
  },

  createUlDoubleSolid: function() {
    var ulDoubleSolid = cv[C_uLBASEIMGS][3];
    ulDoubleSolid.canvas = cf.createCanvas(ulDoubleSolid.name, 1, 10);
    ulDoubleSolid.context = ulDoubleSolid.canvas.getContext('2d');
    ulDoubleSolid.context.beginPath();
    ulDoubleSolid.context.lineWidth = 2;
    ulDoubleSolid.context.moveTo(0, 2);
    ulDoubleSolid.context.lineTo(1, 2);
    ulDoubleSolid.context.stroke();
    ulDoubleSolid.context.moveTo(0, 7);
    ulDoubleSolid.context.lineTo(1, 7);
    ulDoubleSolid.context.stroke();
    ulDoubleSolid.context.closePath();
    ulDoubleSolid.img.src = ulDoubleSolid.canvas.toDataURL('image/png');
  },

  createUlDot: function() {
    var ulDot = cv[C_uLBASEIMGS][4];
    ulDot.canvas = cf.createCanvas(ulDot.name, 10, 10);
    ulDot.context = ulDot.canvas.getContext('2d');
    ulDot.context.beginPath();
    ulDot.context.arc(5, 4, 2, 0, 2 * Math.PI);
    ulDot.context.fill();
    ulDot.context.stroke();
    ulDot.context.closePath();
    ulDot.img.src = ulDot.canvas.toDataURL('image/png');
    ulDot.animIncrement = cf.calcAnimationPixelIncrement(ulDot.canvas.width);
  },

  createUlWave: function() {
    var ulWave = cv[C_uLBASEIMGS][5];
    ulWave.canvas = cf.createCanvas(ulWave.name, 22, 10);
    ulWave.context = ulWave.canvas.getContext('2d');
    // draw sin ulWave
    ulWave.context.beginPath();
    ulWave.context.strokeStyle = 'black';
    ulWave.context.lineWidth = 2;
    var heightOfWave = 7;
    for (var x = 0; x <= ulWave.canvas.width; x += 1) {
      var y = Math.round(( (heightOfWave / 2) + heightOfWave / 2 *
          Math.sin(((x + -heightOfWave / 2) / (ulWave.canvas.width / 2)) * Math.PI)) + 1);
      if (x === 0) ulWave.context.moveTo(x, y);
      else ulWave.context.lineTo(x, y);
    }
    ulWave.context.stroke();
    ulWave.context.closePath();
    ulWave.img.src = ulWave.canvas.toDataURL('image/png');
    ulWave.animIncrement = cf.calcAnimationPixelIncrement(ulWave.canvas.width);
  },

  createUlForOTYAxis: function (rowNum, numOfRows, numOfColumns) {
    var currentUL;
    if ((numOfRows != null) && (rowNum == numOfRows)) currentUL = 'ulNone';
    else currentUL = cc[C_underlineCanvasName][c4[C_OT][C_slctUlVerbItem][rowNum]];
    var srcImgObj = _.find(cv[C_uLBASEIMGS], function(obj) { return obj.name == currentUL; });
    if (numOfColumns == null) numOfColumns = cf.getVariablesForOTVerbTable('H').orderOfXAxisItems.length;
    cv[C_ulOTVbCSS][rowNum] = new Array(numOfColumns * 3);
    for (var counter2 = 0; counter2 < numOfColumns; counter2++) {
      var currentClr = c4[C_OT][C_inClrVerbItem][counter2];
      for (var counter3 = 0; counter3 < 3; counter3 ++) {
        var columnIndex = (counter2 * 3) + counter3;
        cv[C_ulOTVbCSS][rowNum][columnIndex] = new ULOBJ('R' + rowNum + 'C' + columnIndex);
        cf.createUlForOneInstanceOfTense(cv[C_ulOTVbCSS][rowNum][columnIndex], srcImgObj, currentClr, -1);
      }
    }
  },

  createUlFor_OT: function() {
    var numOfRows = cf.getVariablesForOTVerbTable('H').orderOfYAxisItems.length;
    var numOfColumns = cf.getVariablesForOTVerbTable('H').orderOfXAxisItems.length;
    cv[C_ulOTVbCSS] = new Array(numOfRows+1);
    for (var counter1 = 0; counter1 <= numOfRows; counter1++) { // last row is for the title of color configuration screen
      cf.createUlForOTYAxis(counter1, numOfRows, numOfColumns);
    }
    var rowNum = -1;
    cv[C_oTFormIndex2CSS] = {};
    for (var counter = 0; counter < c4[C_OT][C_orderOfForm].length; counter += 1) {
      if (!c4[C_OT][C_verbFormToCombineWithPrevious][counter]) rowNum += 1;
      cv[C_oTFormIndex2CSS][ c4[C_OT][C_orderOfForm][counter] ] = rowNum;
    }
    var colGroup = -1;
    for (var counter2 = 0; counter2 < c4[C_OT][C_orderOfHebrewStem].length; counter2 += 1) {
      if (!c4[C_OT][C_hebrewStemToCombineWithPrevious][counter2]) colGroup += 1;
      var colIndex = colGroup * 3;
      if (c4[C_OT][C_orderOfHebrewStem][counter2] != undefined) {
        if (c4[C_OT][C_hebrewCodeOfStem][c4[C_OT][C_orderOfHebrewStem][counter2]][1] == 'p')
          colIndex += 1;
        else if (c4[C_OT][C_hebrewCodeOfStem][c4[C_OT][C_orderOfHebrewStem][counter2]][1] == 'm')
          colIndex += 2;
        cv[C_hebrewStemIndex2CSS][ c4[C_OT][C_orderOfHebrewStem][counter2] ] = colIndex;
      }
    }
    colGroup = -1;
    for (var counter3 = 0; counter3 < c4[C_OT][C_orderOfAramaicStem].length; counter3 += 1) {
      if (!c4[C_OT][C_aramaicStemToCombineWithPrevious][counter3]) colGroup += 1;
      var colIndex2 = colGroup * 3;
      if (c4[C_OT][C_orderOfAramaicStem][counter3] != undefined) {
        if (c4[C_OT][C_aramaicCodeOfStem][c4[C_OT][C_orderOfAramaicStem][counter3]][1] == 'p')
          colIndex2 += 1;
        else if (c4[C_OT][C_aramaicCodeOfStem][c4[C_OT][C_orderOfAramaicStem][counter3]][1] == 'm')
          colIndex2 += 2;
        cv[C_aramaicStemIndex2CSS][ c4[C_OT][C_orderOfAramaicStem][counter3] ] = colIndex2;
      }
    }
  },

  createUlForAllItemsInYAndX: function() {
    var moodOrTenseOnYAxis, moodOrTenseOnXAxis, moodCounter, tenseCounter, currentMoodDescription, currentTenseDescription;
    if (c4[C_Greek][C_xAxisForMood]) {
      moodOrTenseOnYAxis = 'tense';
      moodOrTenseOnXAxis = 'mood';
    }
    else {
      moodOrTenseOnYAxis = 'mood';
      moodOrTenseOnXAxis = 'tense';
    }
    var r = cf.getVariablesForVerbTable();
    for (var counter1 = 0; counter1 < r.nameOfAllYAxisItems.length; counter1 += 1) {
      var currentULForYAxis = cc[C_underlineCanvasName][ c4[C_Greek][C_slctUlVerbItem][cf.getAxisOrderOfItem(moodOrTenseOnYAxis, counter1)] ];
      var srcImgObj = _.find(cv[C_uLBASEIMGS], function(obj) { return obj.name == currentULForYAxis; });
      for (var counter2 = 0; counter2 < r.nameOfAllXAxisItems.length; counter2 += 1) {
        var colorForXAxis = c4[C_Greek][C_inClrVerbItem][cf.getAxisOrderOfItem(moodOrTenseOnXAxis, counter2)];
        if (c4[C_Greek][C_xAxisForMood]) {
          moodCounter = counter2;
          tenseCounter = counter1;
          currentMoodDescription = r.nameOfAllXAxisItems[counter2];
          currentTenseDescription = r.nameOfAllYAxisItems[counter1];
        }
        else {
          moodCounter = counter1;
          tenseCounter = counter2;
          currentMoodDescription = r.nameOfAllYAxisItems[counter1];
          currentTenseDescription = r.nameOfAllXAxisItems[counter2];
        }
        var arrayIndexOfCurrentTense = _.find(cc[C_tenseIndexArray], function(obj) { return obj.name == currentTenseDescription; }).array;
        var moodIndex = _.find(cc[C_moodIndexArray], function(obj) { return obj.name == currentMoodDescription; }).array;
        for (var counter3 = 0; counter3 < arrayIndexOfCurrentTense.length; counter3 += 1) {
          var indexToUlVerbCSS = arrayIndexOfCurrentTense[counter3];
          if (moodIndex.indexOf(indexToUlVerbCSS) > -1) {
            cf.createUlForOneInstanceOfTense(cv[C_ulVerbCSS][indexToUlVerbCSS], srcImgObj, colorForXAxis, indexToUlVerbCSS);
            cv[C_ulVerbCSS][indexToUlVerbCSS].displayStatusByTense = (!(c4[C_Greek][C_granularControlOfTenses] && !c4[C_Greek][C_tensesOnOff][tenseCounter]));
            cv[C_ulVerbCSS][indexToUlVerbCSS].displayStatusByMood = (!(c4[C_Greek][C_granularControlOfMoods] && !c4[C_Greek][C_moodsOnOff][moodCounter]));
          }
        }
      }
    }
  },

  createUlForOneInstanceOfTense: function (destImgObj, srcImgObj, color, ulVerbCSSIndex) {
    destImgObj.canvas = cf.createCanvas(destImgObj.name, Math.max(srcImgObj.canvas.width, 26), srcImgObj.canvas.height); // Set width to the widest canvas.  The Dash-Dot-Dot canvas as a width of 26
    cf.updateUlForSpecificYAxis(destImgObj, srcImgObj, color, ulVerbCSSIndex);
  },

  displayVerbUlOrNot: function (indexToUlVerbCSS) {
    if ( ( ( (!c4[C_Greek][C_granularControlOfMoods] && !c4[C_Greek][C_granularControlOfTenses]) ||
          ((indexToUlVerbCSS != null) && cv[C_ulVerbCSS][indexToUlVerbCSS].displayStatusByMood && c4[C_Greek][C_granularControlOfMoods]) ||
          ((indexToUlVerbCSS != null) && cv[C_ulVerbCSS][indexToUlVerbCSS].displayStatusByTense && c4[C_Greek][C_granularControlOfTenses]) ) &&
          c4[C_Greek][C_enableVerbClr]) || (indexToUlVerbCSS == -1) ) return true; // indexToUlVerbCSS is -1 when it is OT verb.  Temp solution.
    else return false;
  },

  displayOTVerbUlOrNot: function (yIndex, xIndex) {
    var display = false;
    if (c4[C_OT][C_enableVerbClr]) {
      if (yIndex == (cv[C_ulOTVbCSS].length -1)) display = true;
      else if ( ((!c4[C_OT][C_granularControlOfYAxis]) || (c4[C_OT][C_yAxisOnOff][yIndex])) &&
          ((!c4[C_OT][C_granularControlOfXAxis]) || (c4[C_OT][C_xAxisOnOff][Math.floor(xIndex/3)])) )
        display = true;
      else if (c4[C_OT][C_granularControlOfYAxis] && c4[C_OT][C_granularControlOfXAxis])
        display = (c4[C_OT][C_yAxisOnOff][yIndex]) || (c4[C_OT][C_xAxisOnOff][Math.floor(xIndex/3)]);
    }
    return display;
  },
// Do not shorten name of this function.  It is called by view_display_passage.js
  refreshClrGrammarCSS: function (ntCSSOnThisPage, otCSSOnThisPage) {
    if (c4[C_enableGenderNumberClr]) {
      if (cv[C_userTurnGenderNumberFromOffToOn]) {
        cv[C_userTurnGenderNumberFromOffToOn] = false;
        $('.hide_mas').removeClass('hide_mas').addClass('mas');
        $('.hide_fem').removeClass('hide_fem').addClass('fem');
        $('.hide_neut').removeClass('hide_neut').addClass('neut');
        $('.hide_sing').removeClass('hide_sing').addClass('sing');
        $('.hide_plur').removeClass('hide_plur').addClass('plur');
      }
      $('.mas').css('color', c4[C_inClrMasculine]);
      $('.fem').css('color', c4[C_inClrFeminine]);
      $('.neut').css('color', c4[C_inClrNeuter]);
      cf.updateCssForNumber('singular', c4[C_slctUlSingular]);
      cf.updateCssForNumber('plural', c4[C_slctUlPlural]);
    } else {
      if (cv[C_updatedGenderNumberCSS]) {
        $('.mas').css('color', '');
        $('.fem').css('color', '');
        $('.neut').css('color', '');
        $('.sing').css('font-weight', '');
        $('.plur').css('font-weight', '');
        $('.sing').css('font-style', '');
        $('.plur').css('font-style', '');
        cv[C_updatedGenderNumberCSS] = false;
      }
      $('.mas').removeClass('mas').addClass('hide_mas');
      $('.fem').removeClass('fem').addClass('hide_fem');
      $('.neut').removeClass('neut').addClass('hide_neut');
      $('.sing').removeClass('sing').addClass('hide_sing');
      $('.plur').removeClass('plur').addClass('hide_plur');
    }
    if ((ntCSSOnThisPage == undefined) || (ntCSSOnThisPage.length > 0)) {
      for (var j = 0; j < cv[C_ulVerbCSS].length; j += 1) {
        if (cf.displayVerbUlOrNot(j)) {
          if ((ntCSSOnThisPage == undefined) || (ntCSSOnThisPage.indexOf(' v' + cv[C_ulVerbCSS][j].name + ' ') > -1)) {
            $('.v' + cv[C_ulVerbCSS][j].name).css('background', 'url(' + cv[C_ulVerbCSS][j].img.src + ') repeat-x 100% 100%');
          }
        }
        else if ((!c4[C_Greek][C_enableVerbClr]) || ((c4[C_Greek][C_granularControlOfMoods]) || (c4[C_Greek][C_granularControlOfTenses]))) $('.v' + cv[C_ulVerbCSS][j].name).css('background', 'none');
      }
    }
    if (otCSSOnThisPage == undefined) {
      for (var j2 = 0; j2 < cv[C_ulOTVbCSS].length; j2 += 1) {
        for (var k = 0; k < cv[C_ulOTVbCSS][j2].length; k += 1) {
          if (cf.displayOTVerbUlOrNot(j2, k)) $('.vot_' + cv[C_ulOTVbCSS][j2][k].name).css('background', 'url(' + cv[C_ulOTVbCSS][j2][k].img.src + ') repeat-x 100% 100%');
          else if ((!c4[C_OT][C_enableVerbClr]) || ((c4[C_OT][C_granularControlOfXAxis]) || (c4[C_OT][C_granularControlOfYAxis]))) $('.vot_' + cv[C_ulOTVbCSS][j2][k].name).css('background', 'none');
        }
      }
    }
    else if ((otCSSOnThisPage.length > 4) && (c4[C_OT][C_enableVerbClr])) {
      var cssCodes = otCSSOnThisPage.split(' ');
      for (var j3 = 0; j3 < cssCodes.length; j3 += 1) {
        var r = cf.getRowColNum(cssCodes[j3]);
        var row = r[0];
        var column = r[1];
        if ((row != null) && (column != null)) {
          if (cf.displayOTVerbUlOrNot(row, column)) $('.vot_' + cv[C_ulOTVbCSS][row][column].name).css('background', 'url(' + cv[C_ulOTVbCSS][row][column].img.src + ') repeat-x 100% 100%');
          else if ((c4[C_OT][C_granularControlOfXAxis]) || (c4[C_OT][C_granularControlOfYAxis])) $('.vot_' + cv[C_ulOTVbCSS][row][column].name).css('background', 'none');
        }
      }
    }
    $('.primaryLightBg').css('text-shadow', 'none'); // Need to set it in the program, if not the browser will prioritize the CSS updated in this Javascript.
  },

  getRowColNum: function (inputStr) {
    var row = null, column = null;
    var lng = inputStr.length;
    if ((lng >= 4) && (lng <= 6) && (inputStr.substr(0,1) == 'R')) {
      if (inputStr.substr(2,1) == 'C') {
        row = parseInt(inputStr.substr(1, 1));
        column = parseInt(inputStr.substr(3));
      }
      else if (inputStr.substr(3,1) == 'C') {
        row = parseInt(inputStr.substr(1, 2));
        column = parseInt(inputStr.substr(4));
      }
    }
    return [row, column];
  },

  updateUlForSpecificYAxis: function (destImgObj, srcImgObj, color, ulVerbCSSIndex) {
    if (color !== undefined) {
      var backgroundClr;
      destImgObj.canvas.heigth = srcImgObj.canvas.height;
      destImgObj.canvas.width = srcImgObj.canvas.width;
      destImgObj.context = destImgObj.canvas.getContext('2d');
      destImgObj.context.drawImage(srcImgObj.canvas, 0, 0);
      var passiveVoice = false;
      var middleVoice = false;
      var passiveStrokeStyle = '';
      var middleStrokeStyle = '';
      var otItem = false;
      if (destImgObj.name.length === 3) {
        var pos2 = destImgObj.name.substr(1, 1);
        passiveVoice = ( (destImgObj.name.length === 3) && (pos2 === 'p') );
        middleVoice = ( (destImgObj.name.length === 3) && (pos2 === 'm') );
        if (passiveVoice) {
          if (c4[C_Greek][C_chkbxPassiveBkgrdColrValue])
            backgroundClr = c4[C_Greek][C_inPassiveBkgrdClr];
          if (c4[C_Greek][C_chkbxPassiveUlColr1Value])
            passiveStrokeStyle = c4[C_Greek][C_inPassiveUlClr1];
        }
        else if (middleVoice) {
          if (c4[C_Greek][C_chkbxMiddleBkgrdColrValue])
            backgroundClr = c4[C_Greek][C_inMiddleBkgrdClr];
          if (c4[C_Greek][C_chkbxMiddleUlColr1Value])
            middleStrokeStyle = c4[C_Greek][C_inMiddleUlClr1];
        }
      }
      else if (destImgObj.name.length > 3) {
        var r = cf.getRowColNum(destImgObj.name);
        var column = r[1];
        if (column != null) {
          otItem = true;
          var numOfColumns = cf.getVariablesForOTVerbTable('H').orderOfXAxisItems.length;
          if (column <= (numOfColumns * 3)) {
            if ((column % 3) == 1) {
              passiveVoice = true;
              if (c4[C_OT][C_chkbxPassiveBkgrdColrValue])
                backgroundClr = c4[C_OT][C_inPassiveBkgrdClr];
              if (c4[C_OT][C_chkbxPassiveUlColr1Value])
                passiveStrokeStyle = c4[C_OT][C_inPassiveUlClr1];
            }
            else if ((column % 3) == 2) {
              middleVoice = true;
              if (c4[C_OT][C_chkbxMiddleBkgrdColrValue])
                backgroundClr = c4[C_OT][C_inMiddleBkgrdClr];
              if (c4[C_OT][C_chkbxMiddleUlColr1Value])
                middleStrokeStyle = c4[C_OT][C_inMiddleUlClr1];
            }
          }
        }
      }

      cf.changeImageClr(destImgObj, color, backgroundClr);
      if ((passiveVoice) && (passiveStrokeStyle != '')) {
        destImgObj.context.beginPath();
        destImgObj.context.strokeStyle = passiveStrokeStyle;
        destImgObj.context.lineWidth = 2;
        destImgObj.context.moveTo(0, destImgObj.canvas.heigth - 1);
        destImgObj.context.lineTo(destImgObj.canvas.width, destImgObj.canvas.heigth - 1);
        destImgObj.context.stroke();
        destImgObj.context.closePath();
      } else if ((middleVoice) && (middleStrokeStyle != '')) {
        destImgObj.context.beginPath();
        destImgObj.context.strokeStyle = middleStrokeStyle;
        destImgObj.context.lineWidth = 2;
        destImgObj.context.moveTo(0, destImgObj.canvas.heigth - 1);
        destImgObj.context.lineTo(destImgObj.canvas.width, destImgObj.canvas.heigth - 1);
        destImgObj.context.stroke();
        destImgObj.context.closePath();
      }
      destImgObj.img.src = destImgObj.canvas.toDataURL('image/png');
      destImgObj.animIncrement = cf.calcAnimationPixelIncrement(destImgObj.canvas.width);
      if ((destImgObj.name.length == 3) && (cf.displayVerbUlOrNot(ulVerbCSSIndex))) {
        $('.v' + destImgObj.name).css('background', 'url(' + destImgObj.img.src + ') repeat-x 100% 100%');
      }
      else if (otItem) {
        var result = cf.getRowColNum(destImgObj.name);
        if (cf.displayOTVerbUlOrNot(result[0], result[1]))
          $('.vot_' + destImgObj.name).css('background', 'url(' + destImgObj.img.src + ') repeat-x 100% 100%');
      }
    }
  },

/**
 * Anamate the underline
 * @param {number} givenTime
 *     givenTime is provided by callback which is passed one single argument, a DOMHighResTimeStamp similar to the one returned by performance.now(), indicating the point in time when requestAnimationFrame() starts to execute callback functions.
 */
  goAnimate: function (givenTime) {
    var animateUlForPassive = c4[C_Greek][C_chkbxPassiveUlColr1Value] &&
      c4[C_Greek][C_chkbxPassiveUlColr2Value];
    var animateUlForMiddle = c4[C_Greek][C_chkbxMiddleUlColr1Value] &&
      c4[C_Greek][C_chkbxMiddleUlColr2Value];
    if ((animateUlForPassive || animateUlForMiddle || (cv[C_animationIndexArray].length > 0)) &&
        cv[C_colorCodeGrammarAvailableAndSelected] && c4[C_Greek][C_enableVerbClr]) {
      if ((givenTime === 0) || ((givenTime - cv[C_timestampOfLastAnimation]) > cc[C_animationInterval])) {
        if (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] < cc[C_maxAnimationOnSamePageWithoutMovement] * 2) {
          if (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] < cc[C_maxAnimationOnSamePageWithoutMovement]) {
            if (animateUlForMiddle) {
              for (var counter2 = 0; counter2 < cv[C_copyOfMiddleIndexArray].length; counter2 += 1) {
                if (cf.displayVerbUlOrNot(cv[C_copyOfMiddleIndexArray][counter2]))
                  cf.animateCanvasBottomLine(cv[C_ulVerbCSS][cv[C_copyOfMiddleIndexArray][counter2]], 'middle');
              }
            }
            if (animateUlForPassive) {
              for (var counter1 = 0; counter1 < cv[C_copyOfPassiveIndexArray].length; counter1 += 1) {
                if (cf.displayVerbUlOrNot(cv[C_copyOfPassiveIndexArray][counter1]))
                  cf.animateCanvasBottomLine(cv[C_ulVerbCSS][cv[C_copyOfPassiveIndexArray][counter1]], 'passive');
              }
            }
            for (var counter = 0; counter < cv[C_animationIndexArray].length; counter += 1) {
              if (cf.displayVerbUlOrNot(cv[C_animationIndexArray][counter]))
                cf.animateCanvas(cv[C_ulVerbCSS][cv[C_animationIndexArray][counter]], animateUlForPassive, animateUlForMiddle);
            }
          }
          cv[C_timestampOfLastAnimation] = window.performance.now();
          cv[C_handleOfRequestedAnimation] = requestAnimationFrame(cf.goAnimate);
        }
        else cv[C_handleOfRequestedAnimation] = -1;
        cv[C_numOfAnimationsAlreadyPerformedOnSamePage] += 1;
      }
      else cv[C_handleOfRequestedAnimation] = requestAnimationFrame(cf.goAnimate); // Not time yet
    }
    else cv[C_handleOfRequestedAnimation] = -1; // No animation required so don't requestAnimationFrame() and set it to -1 so that other function will know when to requestAnimationFrame()
  },

  animateCanvas: function (curImg, animateUlForPassive, animateUlForMiddle) { // curImg is the current image object
    if (curImg.canvas.width > 1) {
      curImg.context.clearRect(0, 0, curImg.canvas.width, curImg.canvas.height); // clear the canvas
      if (curImg.animCount > curImg.canvas.width) // reset, start from beginning
        curImg.animCount = curImg.animCount - curImg.canvas.width;
      if (curImg.animCount > 0) // draw image1
        curImg.context.drawImage(curImg.img, curImg.animCount - curImg.canvas.width, 0, curImg.canvas.width, curImg.canvas.height);
      curImg.context.drawImage(curImg.img, curImg.animCount, 0, curImg.canvas.width, curImg.canvas.height); // draw image2
    }
    curImg.animCount = curImg.animCount + curImg.animIncrement;
    if ((curImg.name.substr(1, 1) === 'p') && (animateUlForPassive))
      cf.updateBottomLineOnly(curImg, 'passive');
    if ((curImg.name.substr(1, 1) === 'm') && (animateUlForMiddle))
    cf.updateBottomLineOnly(curImg, 'middle');
    var dataURL = curImg.canvas.toDataURL('image/png');
    $('.v' + curImg.name).css('background', 'url(' + dataURL + ') repeat-x 100% 100%');
  },

  animateCanvasBottomLine: function (curImg, voice) {
    cf.updateBottomLineOnly(curImg, voice);
    curImg.animCount = curImg.animCount + curImg.animIncrement;
    var dataURL = curImg.canvas.toDataURL('image/png');
    $('.v' + curImg.name).css('background', 'url(' + dataURL + ') repeat-x 100% 100%');
  },

  updateBottomLineOnly: function (curImg, voice) {
    var color1, color2;
    if (voice === 'middle') {
      color1 = c4[C_Greek][C_inMiddleUlClr1];
      color2 = c4[C_Greek][C_inMiddleUlClr2];
    } else {
      color1 = c4[C_Greek][C_inPassiveUlClr1];
      color2 = c4[C_Greek][C_inPassiveUlClr2];
    }
    curImg.context.beginPath();
    curImg.context.lineWidth = 2;
    if (curImg.animCount % 2 === 0) curImg.context.strokeStyle = color1;
    else curImg.context.strokeStyle = color2;
    curImg.context.moveTo(0, curImg.canvas.height - 1);
    curImg.context.lineTo(curImg.canvas.width, curImg.canvas.height - 1);
    curImg.context.stroke();
    curImg.context.closePath();
  },

  changeImageClr: function (curImg, newClr, backgroundClr) {
    var rgb = cf.hex2Rgb(newClr);
    var backgroundRGB = null;
    var imageData = curImg.context.getImageData(0, 0, curImg.canvas.width, curImg.canvas.height);
    var data = imageData.data;

    if (backgroundClr !== undefined) {
      backgroundRGB = cf.hex2Rgb(backgroundClr);
    }
    for (var i = 0; i < (data.length - (curImg.canvas.width * 2)); i += 4) { // skip the last 2 rows which is used for underline of passive or middle voice
      if ((rgb !== null) && (data[i] === 0) && (data[i + 1] === 0) && (data[i + 2] === 0) && (data[i + 3] > 20)) {
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      } else if ((backgroundRGB !== null) && (data[i] === 0) && (data[i + 1] === 0) && (data[i + 2] === 0) && (data[i + 3] < 5)) {
        data[i] = backgroundRGB.r;
        data[i + 1] = backgroundRGB.g;
        data[i + 2] = backgroundRGB.b;
        data[i + 3] = 255;
      }
    }
    curImg.context.putImageData(imageData, 0, 0);
  },

  hex2Rgb: function (hex) {
    var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  getC4: function() {
    var tmp = window.localStorage.getItem('colorCode-CurrentSettings');
    if (tmp) {
      var tmpC4 = c4 = JSON.parse(tmp);
      if (tmpC4[C_c4Version] == '20190905') c4 = tmpC4;
      else {
        c4 = cf.createC4();
        alert('The previously used color configuration is out of date.  The default color configuration is used.');
      }
    }
    else c4 = cf.createC4();
  },

  updtLocalStorage: function() {
    window.localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(c4));
  },

  getVariablesForVerbTable: function() {
    var nameOfXAxisItems = [], nameOfYAxisItems = [], descOfXAxisItems = [], descOfYAxisItems = [];
    var orderOfXAxisItems, orderOfYAxisItems, xAxisTitle, yAxisTitle, nameOfAllXAxisItems, nameOfAllYAxisItems;
    var orderOfMood = [], orderOfTense = [], nameOfMood = [], nameOfTense = [], descOfMood = [], descOfTense = [];
    var nameOfAllMood = [], nameOfAllTense = [];
    var previousActiveMood = -1;
    for (var i = 0; i < c4[C_Greek][C_orderOfMood].length; i ++) {
      if (!c4[C_Greek][C_moodToCombineWithPrevious][i]) {
        orderOfMood.push(c4[C_Greek][C_orderOfMood][i]);
        nameOfMood.push(cc[C_robinsonCodeOfMood][c4[C_Greek][C_orderOfMood][i]]);
        descOfMood.push(cf.upCaseFirst(cc[C_robinsonCodeOfMood][c4[C_Greek][C_orderOfMood][i]]));
        previousActiveMood ++;
      }
      else descOfMood[previousActiveMood] += '<br>' + cf.upCaseFirst(cc[C_robinsonCodeOfMood][c4[C_Greek][C_orderOfMood][i]]);
      nameOfAllMood.push(cc[C_robinsonCodeOfMood][c4[C_Greek][C_orderOfMood][i]]);
    }
    var previousActiveTense = -1;
    for (var i2 = 0; i2 < c4[C_Greek][C_orderOfTense].length; i2 ++) {
      if (!c4[C_Greek][C_tenseToCombineWithPrevious][i2]) {
        orderOfTense.push(c4[C_Greek][C_orderOfTense][i2]);
        nameOfTense.push(cc[C_robinsonCodeOfTense][c4[C_Greek][C_orderOfTense][i2]]);
        descOfTense.push(cf.upCaseFirst(cc[C_robinsonCodeOfTense][c4[C_Greek][C_orderOfTense][i2]]));
        previousActiveTense ++;
      }
      else descOfTense[previousActiveTense] += '<br>' + cf.upCaseFirst(cc[C_robinsonCodeOfTense][c4[C_Greek][C_orderOfTense][i2]]);
      nameOfAllTense.push(cc[C_robinsonCodeOfTense][c4[C_Greek][C_orderOfTense][i2]]);
    }
    if (c4[C_Greek][C_xAxisForMood]) {
      xAxisTitle = 'moods';
      yAxisTitle = 'tenses';
      orderOfXAxisItems = orderOfMood;
      orderOfYAxisItems = orderOfTense;
      nameOfXAxisItems = nameOfMood;
      nameOfYAxisItems = nameOfTense;
      descOfXAxisItems = descOfMood;
      descOfYAxisItems = descOfTense;
      nameOfAllXAxisItems = nameOfAllMood;
      nameOfAllYAxisItems = nameOfAllTense;
    }
    else {
      xAxisTitle = 'tenses';
      yAxisTitle = 'moods';
      orderOfXAxisItems = orderOfTense;
      orderOfYAxisItems = orderOfMood;
      nameOfXAxisItems = nameOfTense;
      nameOfYAxisItems = nameOfMood;
      descOfXAxisItems = descOfTense;
      descOfYAxisItems = descOfMood;
      nameOfAllXAxisItems = nameOfAllTense;
      nameOfAllYAxisItems = nameOfAllMood;
    }
    return {
      'nameOfXAxisItems': nameOfXAxisItems,
      'nameOfYAxisItems': nameOfYAxisItems,
      'descOfXAxisItems': descOfXAxisItems,
      'descOfYAxisItems': descOfYAxisItems,
      'orderOfXAxisItems': orderOfXAxisItems,
      'orderOfYAxisItems': orderOfYAxisItems,
      'xAxisTitle': xAxisTitle,
      'yAxisTitle': yAxisTitle,
      'nameOfAllXAxisItems': nameOfAllXAxisItems,
      'nameOfAllYAxisItems': nameOfAllYAxisItems
    };
  },

  getVariablesForOTVerbTable: function (language) {
    var nameOfXAxisItems = [], nameOfYAxisItems = [], descOfXAxisItems = [], descOfYAxisItems = [];
    var orderOfXAxisItems, orderOfYAxisItems, xAxisTitle, yAxisTitle, nameOfAllXAxisItems, nameOfAllYAxisItems;
    var orderOfStem = [], orderOfForm = [], nameOfStem = [], nameOfForm = [], descOfStem = [], descOfForm = [];
    var nameOfAllStem = [], nameOfAllForm = []; var stemToCombineWithPrevious; var lengthOfOrderOfStem = 0;
    var previousActiveStem = -1;
    if (language == 'H') {
      stemToCombineWithPrevious = c4[C_OT][C_hebrewStemToCombineWithPrevious];
      lengthOfOrderOfStem = c4[C_OT][C_orderOfHebrewStem].length;
    }
    else {
      stemToCombineWithPrevious = c4[C_OT][C_aramaicStemToCombineWithPrevious];
      lengthOfOrderOfStem = c4[C_OT][C_orderOfAramaicStem].length;
    }
    for (var i = 0; i < lengthOfOrderOfStem; i ++) {
      var currentStem = ''; var currentName = ''; var currentTitleDisplayStatus = false;
      if ((language == 'H') && (c4[C_OT][C_orderOfHebrewStem][i] != null)) {
        currentStem = c4[C_OT][C_orderOfHebrewStem][i];
        currentName = c4[C_OT][C_hebrewCodeOfStem][currentStem][0];
        currentTitleDisplayStatus = c4[C_OT][C_hebrewCodeOfStem][currentStem][2];
      }
      else if ((language == 'A') && (c4[C_OT][C_orderOfAramaicStem][i] != null)) {
          currentStem = c4[C_OT][C_orderOfAramaicStem][i];
          currentName = c4[C_OT][C_aramaicCodeOfStem][currentStem][0];
          currentTitleDisplayStatus = c4[C_OT][C_aramaicCodeOfStem][currentStem][2];
      }
      if (!stemToCombineWithPrevious[i]) {
        orderOfStem.push(currentStem);
        nameOfStem.push(currentName);
        if (currentTitleDisplayStatus) descOfStem.push(cf.upCaseFirst(currentName));
        else descOfStem.push('');
        previousActiveStem ++;
      }
      else if (currentTitleDisplayStatus) {
        if (descOfStem[previousActiveStem].length > 0) descOfStem[previousActiveStem] += '<br>';
        descOfStem[previousActiveStem] += cf.upCaseFirst(currentName);
      }
      nameOfAllStem.push(currentName);
    }
    var previousActiveForm = -1;
    for (var j = 0; j < c4[C_OT][C_orderOfForm].length; j ++) {
      if (!c4[C_OT][C_verbFormToCombineWithPrevious][j]) {
        orderOfForm.push(c4[C_OT][C_orderOfForm][j]);
        nameOfForm.push(c4[C_OT][C_codeOfForm][ c4[C_OT][C_orderOfForm][j] ][0]);
        if (c4[C_OT][C_codeOfForm][c4[C_OT][C_orderOfForm][j]][2])
          descOfForm.push(c4[C_OT][C_codeOfForm][c4[C_OT][C_orderOfForm][j]][1]);
        else descOfForm.push('');
        previousActiveForm ++;
      }
      else if (c4[C_OT][C_codeOfForm][c4[C_OT][C_orderOfForm][j]][2]) {
        if (descOfForm[previousActiveForm].length > 0) descOfForm[previousActiveForm] += '<br>';
        descOfForm[previousActiveForm] += c4[C_OT][C_codeOfForm][c4[C_OT][C_orderOfForm][j]][1];
      }
      nameOfAllForm.push(c4[C_OT][C_codeOfForm][c4[C_OT][C_orderOfForm][j]][0]);
    }
    if (c4[C_OT][C_xAxisForStem]) {
      xAxisTitle = 'stems';
      yAxisTitle = 'forms';
      orderOfXAxisItems = orderOfStem;
      orderOfYAxisItems = orderOfForm;
      nameOfXAxisItems = nameOfStem;
      nameOfYAxisItems = nameOfForm;
      descOfXAxisItems = descOfStem;
      descOfYAxisItems = descOfForm;
      nameOfAllXAxisItems = nameOfAllStem;
      nameOfAllYAxisItems = nameOfAllForm;
    }
    else {
      xAxisTitle = 'forms';
      yAxisTitle = 'stems';
      orderOfXAxisItems = orderOfForm;
      orderOfYAxisItems = orderOfStem;
      nameOfXAxisItems = nameOfForm;
      nameOfYAxisItems = nameOfStem;
      descOfXAxisItems = descOfForm;
      descOfYAxisItems = descOfStem;
      nameOfAllXAxisItems = nameOfAllForm;
      nameOfAllYAxisItems = nameOfAllStem;
    }
    return {
      'nameOfXAxisItems': nameOfXAxisItems,
      'nameOfYAxisItems': nameOfYAxisItems,
      'descOfXAxisItems': descOfXAxisItems,
      'descOfYAxisItems': descOfYAxisItems,
      'orderOfXAxisItems': orderOfXAxisItems,
      'orderOfYAxisItems': orderOfYAxisItems,
      'xAxisTitle': xAxisTitle,
      'yAxisTitle': yAxisTitle,
      'nameOfAllXAxisItems': nameOfAllXAxisItems,
      'nameOfAllYAxisItems': nameOfAllYAxisItems
    };
  },

  upCaseFirst: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
// Do not shorten name, called by view_examples.js
  setNextPageURL: function (url, configName, infoMsg) {

    if (configName.indexOf("function:") == 0){
      var functionName = configName.substr(9);
      if (functionName == "openStats")
        window.localStorage.setItem('colorCode-openStatus', JSON.stringify(true));
    }
    else cf.openUserSelectedConfig(configName);
    window.localStorage.setItem('colorCode-InfoMsg', JSON.stringify(infoMsg));
    window.location.assign(url);
  },

  getSpecificMorphologyInfo: function (morphCode, morphName, result) {
    var index;
    var ot_var = cv[C_otMorph][morphName];
    for (var count = morphCode.length; ((count > 0) && (index == undefined)); count --) {
      index = ot_var[morphCode.substr(0, count)];
    }
    if (index == undefined) {
      console.log("cannot find code " + morphCode + " name: " + morphName);
      return;
    }
    else {
      var resultStr = cv[C_otMorph].txtArray[index];
      if (resultStr == undefined) {
        console.log("Cannot find code: " + morphCode + " name: " + morphName);
        return;
      }
      result[morphName] = resultStr;
    }
  },
  // Called by other javascript (view_quick_lexicon view_sidebar) in Step.  Do not shorten the name.
  getTOSMorphologyInfo: function (morphCode) {
    var result = {};
    if ((morphCode.startsWith('TOS:')) && (cv[C_otMorph] != null)) {
      var code = morphCode.substr(4);
      var languageCode = code.substr(0, 1);
      cf.getSpecificMorphologyInfo(languageCode, "language", result);
      var descriptionCode = code.substr(1) + code.substr(0, 1);
      cf.getSpecificMorphologyInfo(descriptionCode, "description", result);
      var functionCd = code.substr(1, 1);
      cf.getSpecificMorphologyInfo(functionCd, "ot_function", result);
      if (result.ot_function != undefined) {
        if (code.length > 2) {
          var formPos = 2; var stemExpandedCd = '';
          if (result.ot_function.toLowerCase().startsWith('verb')) {
            formPos = 3;
            stemExpandedCd = code.substr(2, 1) + languageCode;
            cf.getSpecificMorphologyInfo(stemExpandedCd, "stem", result);
            if ( (code.length == 5) && ((code.substr(3, 2) == 'aa') || (code.substr(3, 2) == 'cc')) ) {
                cf.getSpecificMorphologyInfo(code.substr(4, 1), "state", result);
                cf.getSpecificMorphologyInfo(code.substr(4, 1), "stateExplained", result);
                cf.getSpecificMorphologyInfo(code.substr(4, 1), "stateDesc", result);
                code = code.substr(0, 3) + 'f' + code.substr(4, 1); // Have to change the code for infinitive code because it does not have one.
            }
          }
          var formCd = code.substr(formPos, 1);
          var formExpandedCd = formCd + functionCd;
          var personCd, numberCd;
          cf.getSpecificMorphologyInfo(formExpandedCd, "ot_form", result);
          if (code.length == (formPos + 4)) {
            var pos1 = code.substr(formPos + 1, 1);
            var pos2 = code.substr(formPos + 2, 1);
            var pos3 = code.substr(formPos + 3, 1);
            var genderCd;
            if ((pos1 == '1') || (pos1 == '2') || (pos1 == '3') ) {
              personCd = pos1;
              cf.getSpecificMorphologyInfo(personCd, "person", result);
              cf.getSpecificMorphologyInfo(pos1 + pos3, "personExplained", result);
              cf.getSpecificMorphologyInfo(pos1 + pos3, "personDesc", result);
              genderCd = pos2;
              numberCd = pos3;
            }
            else {
              genderCd = pos1;
              numberCd = pos2;
              cf.getSpecificMorphologyInfo(pos3, "state", result);
              cf.getSpecificMorphologyInfo(pos3, "stateExplained", result);
              cf.getSpecificMorphologyInfo(pos3, "stateDesc", result);
            }
            cf.getSpecificMorphologyInfo(genderCd, "gender", result);
            cf.getSpecificMorphologyInfo(numberCd, "number", result);
            cf.getSpecificMorphologyInfo(genderCd, "genderExplained", result);
            var genderExpandedCd = genderCd + numberCd;
            cf.getSpecificMorphologyInfo(genderExpandedCd, "genderDesc", result);
            cf.getSpecificMorphologyInfo(numberCd, "numberExplained", result);
            cf.getSpecificMorphologyInfo(numberCd, "numberDesc", result);
          }
          else if (code.length == 4) {
            cf.getSpecificMorphologyInfo(code.substr(3, 1), "gender", result);
            cf.getSpecificMorphologyInfo(code.substr(3, 1), "genderExplained", result);
            cf.getSpecificMorphologyInfo(code.substr(3, 1), "genderDesc", result);
          }
          if (functionCd == 'V') {
            cf.getSpecificMorphologyInfo(stemExpandedCd, "ot_action", result);
            var voiceCd = stemExpandedCd;
            if ((formExpandedCd == 'sV') && (stemExpandedCd == 'qH')) voiceCd = stemExpandedCd + formCd;
            cf.getSpecificMorphologyInfo(voiceCd, "ot_voice", result);
            cf.getSpecificMorphologyInfo(formExpandedCd, "ot_tense", result);
            var moodCd = formExpandedCd;
            if (formExpandedCd == 'iV') moodCd = formExpandedCd + personCd;
            cf.getSpecificMorphologyInfo(moodCd, "ot_mood", result);
            cf.getSpecificMorphologyInfo(moodCd, "ot_moodExplained", result);
            cf.getSpecificMorphologyInfo(moodCd, "ot_moodDesc", result);
            cf.getSpecificMorphologyInfo(stemExpandedCd, "stemExplained", result);
            cf.getSpecificMorphologyInfo(stemExpandedCd, "stemDesc", result);
            cf.getSpecificMorphologyInfo(stemExpandedCd, "ot_actionExplained", result);
            cf.getSpecificMorphologyInfo(stemExpandedCd, "ot_actionDesc", result);
            cf.getSpecificMorphologyInfo(voiceCd + numberCd, "ot_voiceExplained", result);
            cf.getSpecificMorphologyInfo(voiceCd + numberCd, "ot_voiceDesc", result);
            cf.getSpecificMorphologyInfo(formExpandedCd, "ot_tenseExplained", result);
            cf.getSpecificMorphologyInfo(formExpandedCd, "ot_tenseDesc", result);
          }
          var functionExpandedCd = functionCd + formCd + numberCd;
          cf.getSpecificMorphologyInfo(functionExpandedCd, "ot_functionExplained", result);
          cf.getSpecificMorphologyInfo(functionExpandedCd, "ot_functionDesc", result);
          cf.getSpecificMorphologyInfo(formExpandedCd, "ot_formExplained", result);
          cf.getSpecificMorphologyInfo(formExpandedCd, "ot_formDesc", result);
        }
      }
      cf.getExplanationOfMorph(code, result);
    }
    var resultArray = [];
    resultArray.push(result);
    //console.log(result);
    return resultArray;
  },

  getExplanationOfMorph: function (code, result) {
    var resultString = '';
    if (code.search(/^[HA]V[a-zA-Z](fc|fa)$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['ot_actionDesc', 'functionDesc', 'ot_moodDesc', 'formDesc', 'ot_voiceDesc', 'stateDesc']);
    else if (code.search(/^[HA]V[a-zA-Z][rs]/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['ot_actionDesc', 'functionDesc', 'formDesc', 'ot_voiceDesc', 'genderDesc', 'numberDesc', 'stateDesc']);
    else if (code.search(/^[HA]V/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['ot_actionDesc', 'functionDesc', 'ot_moodDesc', 'formDesc', 'ot_tenseDesc', 'ot_voiceDesc', 'genderDesc', 'numberDesc', 'personDesc']);
    else if (code.search(/^[HA]Ng\w\wd$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'stateDesc', 'genderDesc', 'numberDesc', 'formDesc']);
    else if ((code.search(/^[HA]Ng\w\w[ac]$/) > -1) || (code.search(/^[HA]Aabsa$/) > -1))
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'genderDesc', 'numberDesc', 'formDesc', 'stateDesc']);
    else if (code.search(/^[HA][PS]p\w\w\w$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'formDesc',  'genderDesc', 'numberDesc', 'personDesc']);
    else if (code.search(/^[HA]Ng$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'formDesc',  'genderDesc', 'numberDesc', 'personDesc']);
    else if (code.search(/^[HA]A[co]\w\wd$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'formDesc',  'stateDesc', 'genderDesc', 'numberDesc']); // 15B9A
    else if (code.search(/^[HA][NA]\w\w\wd$/) > -1)
      resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'stateDesc', 'formDesc',  'genderDesc', 'numberDesc']); // 1B59A
    else resultString = cf.assembleDescriptionsOfMorph(result, ['functionDesc', 'ot_actionDesc', 'ot_voiceDesc', 'fromDesc', 'ot_tenseDesc', 'ot_moodDesc', 'personDesc', 'genderDesc', 'numberDesc', 'stateDesc']);
    if (resultString != '') {
      result.explanation = resultString;
    }
  },

  assembleDescriptionsOfMorph: function (morphObj, keys) {
    var result = '';
    for (var counter = 0; counter < keys.length; counter++) {
      if ((morphObj[keys[counter]] != undefined) || (morphObj[keys[counter]] != null) && (morphObj[keys[counter]].length > 0))
        result += morphObj[keys[counter]] + ' ';
    }
    return result.replace(/\s\s+/, ' ').replace(/^\s/, '').replace(/\s$/, '');
  },
  // Do not shorten name, called by Javascript functions outside of color_code_grammar and color_code_config
  addClassForTHOT: function (passageHTML) {
    var result = '', pLength = passageHTML.length, currentPos = 0, lastCopyPos = 0;
    var otCSSOnThisPage = '';
    while (currentPos < pLength) {
      var morphPos = passageHTML.indexOf("morph=", currentPos);
      if (morphPos > -1) {
        var charAfterMorph = passageHTML.substr(morphPos + 6, 1);
        if (((charAfterMorph == '"') || (charAfterMorph == "'")) && (passageHTML.substr(morphPos + 7, 4) == 'TOS:')) {
          currentPos = morphPos + 11;
          var endingQuotePos = passageHTML.indexOf(charAfterMorph, currentPos);
          if ((endingQuotePos > -1) && (endingQuotePos - currentPos < 10)) {
            var morphCode = passageHTML.substring(currentPos, endingQuotePos);
            currentPos = endingQuotePos + 1;
            var cssCode = cf.morph2CSS(morphCode).trim();
            if (cssCode.length > 0) {
              var endOfSpanPos = passageHTML.indexOf(">", currentPos);
              if (endOfSpanPos > -1) {
                var startOfSpanPos = passageHTML.lastIndexOf("<span", morphPos);
                if ((startOfSpanPos > -1) && (startOfSpanPos >= lastCopyPos)) {
                  var shorterStringToSearch = passageHTML.substring(startOfSpanPos + 6, endOfSpanPos);
                  var classPos = shorterStringToSearch.indexOf("class");
                  if (classPos > -1) {
                    result = result.concat(passageHTML.substring(lastCopyPos, startOfSpanPos + classPos + 11));
                    lastCopyPos = startOfSpanPos + classPos + 11;
                    if (shorterStringToSearch.substr(classPos+5, 1) == '=') {
                      var quoteAfterClass = shorterStringToSearch.substr(classPos+6, 1);
                      if ( (quoteAfterClass == '"') || (quoteAfterClass == "'") ) {
                        result = result.concat(passageHTML.substring(lastCopyPos, startOfSpanPos + classPos + 13));
                        lastCopyPos = startOfSpanPos + classPos + 13;
                        result = result.concat(cssCode);
                        if (shorterStringToSearch.substr(classPos+7, 1) != quoteAfterClass) result = result.concat(' ');
                      }
                      else alert("error at addClassForTHOT Cannot find quote after class.  Please let the STEP people know");
                    }
                    else result = result.concat('="' + cssCode + '" ');
                  }
                  else {
                    result = result.concat(passageHTML.substring(lastCopyPos, endOfSpanPos));
                    lastCopyPos = endOfSpanPos;
                    result = result.concat(' class="');
                    result = result.concat(cssCode);
                    result = result.concat('" ');
                  }
                }
                // look for CSS class that starts with 'vot_'.  If found, there should only be one
                var foundCode = cssCode.split(' ').filter(function(code) { return (code.substr(0,4) == 'vot_' && otCSSOnThisPage.indexOf(code.substr(4,4)) == -1); });
                if (foundCode.length > 0) otCSSOnThisPage += ' ' + foundCode[0].substr(4, 4);
              }
              else alert("error at addClassForTHOT cannot find >");
            }
          }
          else alert("error at addClassForTHOT cannot find ending quote at " + endingQuotePos);
        }
        else currentPos = morphPos + 6;
      }
      else break;
    }
    return [result.concat(passageHTML.substring(lastCopyPos, pLength)), otCSSOnThisPage + ' '];
  },

  // Do not shorten name, called by Javascript functions outside of color_code_grammar and color_code_config
  getClassesForNT: function (passageHTML) {
    var pLength = passageHTML.length;
    var currentPos = 0;
    var ntCSSOnThisPage = '';
    while (currentPos < pLength) {
      var classPos = passageHTML.indexOf("class=", currentPos);
      if (classPos > -1) {
        var charAfterClass = passageHTML.substr(classPos + 6, 1);
        if ((charAfterClass == '"') || (charAfterClass == "'")) {
          currentPos = classPos + 7;
          var endingQuotePos = passageHTML.indexOf(charAfterClass, currentPos);
          if ((endingQuotePos > -1) && (endingQuotePos - currentPos < 100)) {
            if (endingQuotePos > 0) {
              var morphCodes = passageHTML.substring(currentPos, endingQuotePos);
              // look for CSS class that starts with 'v'.
              var foundCode = morphCodes.split(' ').filter(function(code) {
                // The CSS name 'verse ...' are not CSS for the color code. Thereore, second character cannot be 'e'
                return ((code.length == 4) && (code.substr(0,1) == 'v') && (code.substr(1,1) != 'e') && (ntCSSOnThisPage.indexOf(code) == -1));
              });
              if (foundCode.length > 0) ntCSSOnThisPage += ' ' + foundCode[0];
            }
            currentPos = endingQuotePos + 1;
          }
          else alert("warning: getClassesForNT cannot find ending quote at " + endingQuotePos);
        }
        else currentPos = classPos + 6;
      }
      else break;
    }
    return ntCSSOnThisPage + ' ';
  },

  tableAxisSpan: function (axis, createUserInputs, ot) {
    var c4Ref = ((ot != undefined) && (ot == 'OT')) ? c4[C_OT] : c4[C_Greek];
    var curXTitle = (axis == 'X') ? c4Ref[C_verbTableXHeader] : c4Ref[C_verbTableYHeader];
    var modalWidth = $('body').width();
    if ((modalWidth != undefined) && (modalWidth != null) && (!isNaN(modalWidth)) && (modalWidth < 605) && (axis == 'Y')) return 2;
    if ((curXTitle != null) && (createUserInputs)) return 3; // The header information is not showed if there are no user input fields which is at the help quicklinks panel
    else return 2;
  },

  addTitleToYAxis: function (rowNum, descOfYAxisItems, createUserInputs, xAxisRowSpan, ot) {
    var htmlTable = '';
    var curYTitles = ((ot != undefined) && (ot == 'OT')) ? c4[C_OT][C_verbTableYHeader] : c4[C_Greek][C_verbTableYHeader];
    if ((curYTitles != null) && (createUserInputs) && (xAxisRowSpan == 3)) { // screen size might not be wide enough for help quicklink
      var title_range_low = 0;
      for (var i = 0; i < curYTitles.desc.length; i ++) {
        var rowsCovered = curYTitles.repeat[i] + 1;
        if (rowNum == title_range_low) {
          htmlTable += '<td class="tg-yw4l" rowspan="' + rowsCovered + '">' + curYTitles.desc[i] + '</td>';
          break;
        }
        title_range_low += rowsCovered;
      }
    }
    if (__s["tense_" + descOfYAxisItems.toLowerCase().replace(/ /g, "_")])
        descOfYAxisItems += " (" + __s["tense_" + descOfYAxisItems.toLowerCase().replace(/ /g, "_")] + ")";
    else if (__s["mood_" + descOfYAxisItems.toLowerCase().replace(/ /g, "_")])
        descOfYAxisItems += " (" + __s["mood_" + descOfYAxisItems.toLowerCase().replace(/ /g, "_")] + ")";
    htmlTable += '<td>' + descOfYAxisItems;
    return htmlTable;
  },

  morph2CSS: function (morphCode) {
    var result = '';
    if (morphCode != undefined) {
      var number = ''; var gender = '';
      var morphCodeLength = morphCode.length;
      if ((morphCodeLength == 6) || (morphCodeLength == 7)) {
          var charMinus2 = morphCode.substr(morphCodeLength - 3, 1);
          if ((charMinus2 == "1") || (charMinus2 == "2") || (charMinus2 == "3")) {
              gender = morphCode.substr(morphCodeLength - 2, 1);
              number = morphCode.substr(morphCodeLength - 1, 1);
          }
          else if ((charMinus2 == "b") || (charMinus2 == "c") || (charMinus2 == "f") || (charMinus2 == "l") || (charMinus2 == "m") || (charMinus2 == "t")) {
              gender = charMinus2;
              number = morphCode.substr(morphCodeLength - 2, 1);
          }
      }
      else if (morphCodeLength == 4) {
          gender = morphCode.substr(3, 1);
      }
      if (number != "") {
          if ((number == "p") || (number == "d")) result += 'plur ';
          else if (number == "s") result += 'sing ';
      }
      if (gender != "") {
          if (gender == "m") result += 'mas ';
          else if (gender == "f") result += 'fem ';
          else if ((gender == "b") || (gender == "c") || (gender == "l") || (gender == "t")) result += 'neut ';
      }
      if (morphCode.substr(1, 1) == 'V') {
          if (morphCode.length == 5)
              morphCode = morphCode.substr(0, 3) + 'f' + morphCode.substr(4, 1);
          var formIndex = cv[C_oTFormIndex2CSS][morphCode.substr(3, 1)];
          var stemIndex;
          if (morphCode.substr(0, 1) == 'H')
              stemIndex = cv[C_hebrewStemIndex2CSS][morphCode.substr(2, 1)];
          else if (morphCode.substr(0, 1) == 'A')
              stemIndex = cv[C_aramaicStemIndex2CSS][morphCode.substr(2, 1)];
          if ((formIndex != undefined) && (stemIndex != undefined)) {
            result += 'vot_R' + formIndex + 'C' + stemIndex;
          }
          else console.log("unknown verb "+ morphCode);
      }
    }
    return result;
  },

  addVerbTable: function (createUserInputs, htmlElement) {
	if ($(htmlElement).length == 0) {
		console.log("addVerbTable return without creating table, no html element: " + htmlElement + " to append to");
		return;
	}
    var r = cf.getVariablesForVerbTable();
    var xAxisItems, yAxisItems, descOfXAxisItems, descOfYAxisItems;
    xAxisItems = r.orderOfXAxisItems;
    yAxisItems = r.orderOfYAxisItems;
    descOfXAxisItems = r.descOfXAxisItems;
    descOfYAxisItems = r.descOfYAxisItems;
    var htmlTable = '';
    if (!createUserInputs) {
		var cssVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";
		htmlTable = '<link href="/css/color_code_grammar.' + cssVersion + 'css" rel="stylesheet" media="screen"/>';
	}
    var yAxisSpan = cf.tableAxisSpan('Y', createUserInputs);
    htmlTable += '<table class="tg2"><tr><th valign="middle" align="center" colspan="' +
      yAxisSpan + '" rowspan="' + cf.tableAxisSpan('X', createUserInputs) + '">';
    if (createUserInputs) htmlTable += cf.htmlToAdd1();
    htmlTable += '</th><th class="tg-amwm2" colspan="' + xAxisItems.length + '">' + cf.upCaseFirst(r.xAxisTitle);
    if (createUserInputs) htmlTable += cf.htmlToAdd2(r.xAxisTitle);
    htmlTable += '</th></tr>';
    htmlTable += cf.addTitleToXAxis(descOfXAxisItems, createUserInputs);
    htmlTable += '<tr>' +
      '<td class="tg-e3zv2" rowspan="' + yAxisItems.length + '">' + cf.upCaseFirst(r.yAxisTitle);
    if (createUserInputs) htmlTable += cf.htmlToAdd4(r.yAxisTitle);
    htmlTable += '</td>';
    for (var i = 0; i < yAxisItems.length; i += 1) {
      if (i > 0) htmlTable += '<tr>';
      htmlTable += cf.addTitleToYAxis(i, descOfYAxisItems[i], createUserInputs, yAxisSpan);
      if (createUserInputs) htmlTable += cf.htmlToAdd5(i);
      htmlTable += '</td>';
      for (var counter = 0; counter < xAxisItems.length; counter += 1) {
        htmlTable += '<td>';
        var allTM = cf.getAllTenseMoodForThisGroup(r, counter, i);
        htmlTable += cf.voicesInTenseAndMood(allTM.x, allTM.y, createUserInputs);
        htmlTable += '</td>';
      }
      htmlTable += '</tr>';
    }
    htmlTable += '</table><br>';
    if (createUserInputs) htmlTable += cf.htmlToAdd6();
    htmlTable = $(htmlTable);
    htmlTable.appendTo(htmlElement);
  },

  htmlToAdd1: function (otVerb) {
    var otPrefix = '';
    if (otVerb !== undefined) otPrefix = 'OT';
    return '<div class="onoffswitch">' +
    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="' + otPrefix + 'verbonoffswitch" onchange=\'userToggleClrGrammar("' + otPrefix + 'verb")\'/>' +
    '<label class="onoffswitch-label" for="' + otPrefix + 'verbonoffswitch">' +
        '<span class="onoffswitch-inner"></span>' +
        '<span class="onoffswitch-switch"></span>' +
    '</label></div>';
  },

  htmlToAdd2: function (xAxisTitle, otVerb) {
    var otPrefix = '';
    if (otVerb !== undefined) otPrefix = 'OT';
    return '&nbsp;<button id="' + otPrefix + 'configXAxisBtn" class="' + otPrefix + 'vrbInpt1 btn btn-default btn-xs" type="button" title="Select ' +
      xAxisTitle + '" onclick=\'userToggleXOrYAxisConfig("' + otPrefix + '", "X")\'>' +
      '<span id="' + otPrefix + 'configXAxisIcon" class="' + otPrefix + 'vrbInpt1 glyphicon glyphicon-cog"></span></button>' +
      '&nbsp;<button id="' + otPrefix + 'configSortXAxisBtn" class="btn btn-default btn-xs ' + otPrefix + 'advancedtools ' + otPrefix + 'vrbInpt1" type="button" title="Sort ' +  xAxisTitle + '" onclick="userSort' + otPrefix + 'Axis(\'X\')">' +
      '<span id="configSortXAxisIcon" class="glyphicon glyphicon-sort"></span></button>';
  },

  htmlToAdd3: function (i, otVerb) {
    var otPrefix = '', result = '', c4Ref;
    if (otVerb !== undefined) {
      otPrefix = 'OT';
      c4Ref = c4[C_OT];
    }
    else c4Ref = c4[C_Greek];
    result = '<input id="' + otPrefix + 'axisXOnOffCheckbox' + i + '" class="' + otPrefix + 'vrbInptX" ' +
      'type="checkbox" onchange=\'userToggleXOrYAxisConfig("' + otPrefix + '", "X", "' + i + '")\'>';
    result += '<br><input id="inClr' + otPrefix + 'VerbItem' + i + '" class="' + otPrefix + 'vrbInptC" type="color" ' +
      'value="' + c4Ref[C_inClrVerbItem][i] + '" ';
    return result;
  },

  htmlToAdd4: function (yAxisTitle, otVerb) {
    var otPrefix = '';
    if (otVerb !== undefined) otPrefix = 'OT';
    return '<button id="' + otPrefix + 'configYAxisBtn" class="' + otPrefix + 'vrbInpt1 btn btn-default btn-xs" type="button" title="Select ' + yAxisTitle + '" onclick=\'userToggleXOrYAxisConfig("' + otPrefix + '", "Y")\'>' +
      '<span id="' + otPrefix + 'configYAxisIcon" class="' + otPrefix + 'vrbInpt1 glyphicon glyphicon-cog"></span></button>' +
      '<br><br><button id="' + otPrefix + 'configSortYAxisBtn" class="btn btn-default btn-xs ' + otPrefix + 'advancedtools ' + otPrefix + 'vrbInpt1" type="button" title="Sort ' +  yAxisTitle + '" onclick="userSort' + otPrefix + 'Axis(\'Y\')">' +
      '<span id="configSortYAxisIcon" class="glyphicon glyphicon-sort ' + otPrefix + 'advancedtools"></span></button>';
  },

  htmlToAdd5: function (i, otVerb) {
    var otPrefix = ''; var result = '';
    if (otVerb != undefined) otPrefix = 'OT';
    result = '<input id="' + otPrefix + 'axisYOnOffCheckbox' + i + '" class="' + otPrefix + 'vrbInptY" ' +
      'type="checkbox" onchange=\'userToggleXOrYAxisConfig("' + otPrefix + '", "Y", "' + i + '")\'><br>';
    result += '<select id="slctUl' + otPrefix + 'VerbItem' + i + '" class="' + otPrefix + 'vrbInpt1" ' +
      'onchange=\'userUpdate' + otPrefix +'YAxisItem("' + i + '", value)\'';
    if (otPrefix != 'OT') result += ' style="width: 52px"';
    result += '>' +
      '<option value="ulSolid">Underline</option>' +
      '<option value="ulDoubleSolid">2 lines</option>' +
      '<option value="ulDash">Dash</option>' +
      '<option value="ulDashDot">Dash Dot</option>' +
      '<option value="ulDashDotDot">Dash Dot Dot</option>' +
      '<option value="ulDot">Dots</option>' +
      '<option value="ulWave">Wave</option>' +
      '<option value="ulArrow">Arrow</option>' +
      '<option value="ulShortArrow">Short Arrow</option>' +
      '<option value="ulReverseArrow">Reverse Arrow</option>' +
      '<option value="ulShortReverseArrow">Short Reverse Arrow</option>' +
      '</select>';
    if (otVerb == undefined) result += '<br><span id="inAnimate' + i + '" class="advancedtools">' +
      'Animate:<input id="inAnimateCheckbox' + i + '" class="advancedtools" ' +
      'type="checkbox" onchange=\'userUpdateAnimation("' + i + '")\'></span>';
    return result;
  },

  htmlToAdd6: function (otVerb) {
    var otPrefix = ''; var c4Ref;
    if ((otVerb != undefined) && (otVerb == 'OT')) {
      c4Ref = c4[C_OT];
      otPrefix = 'OT';
    }
    else c4Ref = c4[C_Greek];
    var result = '<span>Passive voice: background - </span><input id="chkbx' + otPrefix + 'PassiveBkgrdClr" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBkgrd("passive", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'PassiveBkgrdClr" type="color" ' +
      'value="' + c4Ref[C_inPassiveBkgrdClr] + '"/>' +
      '<span>underline - </span><input id="chkbx' + otPrefix + 'PassiveUlClr1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("passive", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'PassiveUlClr1" type="color" ' +
      'value="' + c4Ref[C_inPassiveUlClr1] + '"/>';
    if (otVerb == undefined) result += '<span>animated underline - </span>' +
      '<input id="chkbx' + otPrefix + 'PassiveUlClr2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("passive", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'PassiveUlClr2" type="color" ' +
      'value="' + c4Ref[C_inPassiveUlClr2] + '"/>';
    result += '<br><br>' +
      '<span>Middle voice: background - </span><input id="chkbx' + otPrefix + 'MiddleBkgrdClr" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBkgrd("middle", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'MiddleBkgrdClr" type="color" ' +
      'value="' + c4Ref[C_inMiddleBkgrdClr] + '"/>' +
      '<span>underline - </span><input id="chkbx' + otPrefix + 'MiddleUlClr1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("middle", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'MiddleUlClr1" type="color" ' +
      'value="' + c4Ref[C_inMiddleUlClr1] + '"/>';
    if (otVerb == undefined) result += '<span>animated underline - </span>' +
      '<input id="chkbx' + otPrefix + 'MiddleUlClr2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("middle", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'MiddleUlClr2" type="color" ' +
      'value="' + c4Ref[C_inMiddleUlClr2] + '"/>';
  //  result += '&nbsp;<button id="' + otPrefix + 'advancedToolsBtn" class="btn btn-default btn-xs" type="button" title="Advanced tools" onclick="userToggleAdvancedTools(\'' + otPrefix + '\')">' +
  //    '<span id="' + otPrefix + 'advancedToolsIcon" class="glyphicon glyphicon-wrench"></span></button>';
    return result;
  },

  addTitleToXAxis: function (descOfXAxisItems, createUserInputs) {
    var htmlTable = '';
    var curXTitle = c4[C_Greek][C_verbTableXHeader];
    if ((curXTitle != null) && (createUserInputs)) {
      htmlTable += '<tr>';
      for (var i = 0; i < curXTitle.desc.length; i ++) {
        htmlTable += '<td class="tg-yw4l" align="center" colspan="' + (curXTitle.repeat[i] + 1) + '">' + curXTitle.desc[i] + '</td>';
      }
      htmlTable += '</tr>';
    }
    htmlTable += '<tr>';
    for (var j = 0; j < descOfXAxisItems.length; j += 1) {
      htmlTable += '<td class="tg-yw4l"';
        if (__s["mood_" + descOfXAxisItems[j].toLowerCase().replace(/ /g, "_")])
            descOfXAxisItems[j] += " (" + __s["mood_" + descOfXAxisItems[j].toLowerCase().replace(/ /g, "_")] + ")";
        else if (__s["tense_" + descOfXAxisItems[j].toLowerCase().replace(/ /g, "_")])
            descOfXAxisItems[j] += " (" + __s["tense_" + descOfXAxisItems[j].toLowerCase().replace(/ /g, "_")] + ")";
        if (descOfXAxisItems[j].length < 10) htmlTable += ' width=72';
      htmlTable += '>' + descOfXAxisItems[j];
      if (createUserInputs) htmlTable += cf.htmlToAdd3(j);
      htmlTable += '</td>';
    }
    htmlTable += '</tr>';
    return htmlTable;
  },

  voicesInTenseAndMood: function (xAxisItem, yAxisItem, createUserInputs) {
    var currentMoodCode, currentTenseCode;
    var highlightMiddle = c4[C_Greek][C_chkbxMiddleBkgrdColrValue] ||
      c4[C_Greek][C_chkbxMiddleUlColr1Value];
    var highlightPassive = c4[C_Greek][C_chkbxPassiveBkgrdColrValue] ||
      c4[C_Greek][C_chkbxPassiveUlColr1Value];
    var htmlTable = '';
    if (c4[C_Greek][C_xAxisForMood]) {
      currentMoodCode = xAxisItem;
      currentTenseCode = yAxisItem;
    }
    else {
      currentMoodCode = yAxisItem;
      currentTenseCode = xAxisItem;
    }
    var arrayIndexOfCurrentTense = [];
    for (var j = 0; j < currentTenseCode.length; j ++) {
      arrayIndexOfCurrentTense = arrayIndexOfCurrentTense.concat(_.find(cc[C_tenseIndexArray], function(obj) { return obj.name == cc[C_robinsonCodeOfTense][currentTenseCode[j]]; }).array);
    }
    var arrayIndexOfCurrentTenseAndMood = arrayIndexOfCurrentTense.filter(function(code) { return currentMoodCode.indexOf(cv[C_ulVerbCSS][code].name.substr(2,1)) > -1; });
    var foundCSS = arrayIndexOfCurrentTenseAndMood.filter(function(code) { return cv[C_ulVerbCSS][code].name.substr(1,1) === 'a'; });
    if (foundCSS.length > 0) htmlTable += '<span class="v' + cv[C_ulVerbCSS][foundCSS[0]].name + '">active</span>';
    htmlTable += '<br>';
    foundCSS = arrayIndexOfCurrentTenseAndMood.filter(function(code) { return cv[C_ulVerbCSS][code].name.substr(1,1) === 'p'; });
    if (foundCSS.length > 0) htmlTable += '<span class="v' + cv[C_ulVerbCSS][foundCSS[0]].name + '">passive</span>';
    htmlTable += '<br>';
    foundCSS = arrayIndexOfCurrentTenseAndMood.filter(function(code) { return cv[C_ulVerbCSS][code].name.substr(1,1) === 'm'; });
    if (foundCSS.length > 0) htmlTable += '<span class="v' + cv[C_ulVerbCSS][foundCSS[0]].name + '">middle</span>';
    else htmlTable += '<br>';
    return htmlTable;
  },

  getAllTenseMoodForThisGroup: function (r, x, y) {
    var currentMoodCodes, currentTenseCodes, moodIndex, tenseIndex, allMoods, allTenses, allInXAxis, allInYAxis;
    var allMoodsCdInThisGroup = [], allTensesCdInThisGroup = [];
    if (c4[C_Greek][C_xAxisForMood]) {
      currentMoodCodes = r.orderOfXAxisItems;
      moodIndex = x;
      allMoods = r.nameOfAllXAxisItems;
      currentTenseCodes = r.orderOfYAxisItems;
      tenseIndex = y;
      allTenses = r.nameOfAllYAxisItems;
    }
    else {
      currentMoodCodes = r.orderOfYAxisItems;
      moodIndex = y;
      allMoods = r.nameOfAllYAxisItems;
      currentTenseCodes = r.orderOfXAxisItems;
      tenseIndex = x;
      allTenses = r.nameOfAllXAxisItems;
    }
    var currentMoodName = cc[C_robinsonCodeOfMood][ currentMoodCodes[moodIndex] ];
    var indexOfCurrentMood = allMoods.indexOf(currentMoodName);
    var currentTenseName = cc[C_robinsonCodeOfTense][currentTenseCodes[tenseIndex]];
    var indexOfCurrentTense = allTenses.indexOf(currentTenseName);
    var indexToEndOfCurrentMoodGroup, indexToEndOfCurrentTenseGroup;
    if (currentMoodCodes.length > (moodIndex + 1)) {
      var nextMoodName = cc[C_robinsonCodeOfMood][ currentMoodCodes[moodIndex+1]];
      indexToEndOfCurrentMoodGroup = allMoods.indexOf(nextMoodName) - 1;
    }
    else indexToEndOfCurrentMoodGroup = allMoods.length - 1;
    if (currentTenseCodes.length > (tenseIndex + 1)) {
      var nextTenseName = cc[C_robinsonCodeOfTense][ currentTenseCodes[tenseIndex+1]];
      indexToEndOfCurrentTenseGroup = allTenses.indexOf(nextTenseName) - 1;
    }
    else indexToEndOfCurrentTenseGroup = allTenses.length - 1;
    for (var j = indexOfCurrentMood; j <= indexToEndOfCurrentMoodGroup; j ++) {
      allMoodsCdInThisGroup.push( cc[C_robinsonNameOfMood][allMoods[j]] );
    }
    for (var k = indexOfCurrentTense; k <= indexToEndOfCurrentTenseGroup; k ++) {
      allTensesCdInThisGroup.push( cc[C_robinsonNameOfTense][allTenses[k]] );
    }
    if (c4[C_Greek][C_xAxisForMood]) {
      allInXAxis = allMoodsCdInThisGroup;
      allInYAxis = allTensesCdInThisGroup;
    }
    else {
      allInXAxis = allTensesCdInThisGroup;
      allInYAxis = allMoodsCdInThisGroup;
    }
    return {
      x: allInXAxis,
      y: allInYAxis
    };
  },

  updateCssForNumber: function (type, fontHighlight) {
    var cssName = '';
    if (type === 'singular') cssName = '.sing';
    else if (type === 'plural') cssName = '.plur';
    else return; // unknown type. something is wrong!
    if (fontHighlight === 'bold') {
      $(cssName).css('font-style', 'normal');
      $(cssName).css('font-weight', 'bold');
    } else if (fontHighlight === 'normal') {
      $(cssName).css('font-style', 'normal');
      $(cssName).css('font-weight', 'normal');
    } else if (fontHighlight === 'bold_italic') {
      $(cssName).css('font-style', 'italic');
      $(cssName).css('font-weight', 'bold');
    } else if (fontHighlight === 'normal_italic') {
      $(cssName).css('font-style', 'italic');
      $(cssName).css('font-weight', 'normal');
    }
    cv[C_updatedGenderNumberCSS] = true;
  },

  getAxisOrderOfItem: function (moodOrTense, itemNumber) {
    var orderInAxis = itemNumber;
    var c4Ref = (moodOrTense == 'mood') ? c4[C_Greek][C_moodToCombineWithPrevious] : c4[C_Greek][C_tenseToCombineWithPrevious];
    for (var i = 1; i <= itemNumber; i++) {
      if (c4Ref[i]) orderInAxis --;
    }
    return orderInAxis;
  },
// Do not shorten name, called by open_color_code_grammar.html
  openUserSelectedConfig: function (name) {
    var selectedConfig;
    if (name != null) selectedConfig = name;
    else selectedConfig = document.getElementById('openClrConfigDropdown').value.toLowerCase();
    var previousEnableGenderNumberClr = true;
    if (c4 != undefined) previousEnableGenderNumberClr = c4[C_enableGenderNumberClr];
    if (selectedConfig === 'verb, gender and number') c4 = cf.createC4();
    else if (selectedConfig === 'verb only (tense-mood)') c4 = cf.c4VerbTenseMood();
    else if (selectedConfig === 'gender and number') c4 = cf.c4NounOnly();
    else if (selectedConfig === 'verb with middle and passive voices') c4 = cf.c4VerbWithMiddlePassive();
    else if (selectedConfig === 'verb, imperative mood') c4 = cf.c4ImperativesOnly();
    else if (selectedConfig === 'verb, main vs supporting verbs') c4 = cf.c4MainVsSupporingVerbs();
    else if (selectedConfig === 'verb, without reference to time') c4 = cf.c4VerbMoodTense2();
    else {
      var found = false;
      var tmp = window.localStorage.getItem('colorCode-UserClrConfigNames');
      if (tmp) {
        var foundCfg = JSON.parse(tmp).filter(function(cfgName) { return cfgName.toLowerCase() == selectedConfig; });
        if (foundCfg.length > 0) {
          var tmp2 = window.localStorage.getItem('colorCode-UserClrConfigName-' + foundCfg[0]);
          if (tmp2) {
            found = true;
            var tmpC4 = c4 = JSON.parse(tmp2);
            if (tmpC4[C_c4Version] == '20190905') c4 = tmpC4;
            else alert('The version of the saved color configuration is out of date.  Please define a new one.');
          }
        }
      }
      if (!found) {
        alert('Cannot find a configuation that match your selection');
        return;
      }
    }
    cf.updtLocalStorage();
    if ((!previousEnableGenderNumberClr) && (c4[C_enableGenderNumberClr])) cv[C_userTurnGenderNumberFromOffToOn] = true;
	step.util.closeModal("openClrModal");
    if (name == null) updateAllSettingsAndInputFields();
  },

  c4VerbTenseMood: function() {
    var r = cf.createC4();
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_Greek][C_xAxisForMood] = false;
    r[C_enableGenderNumberClr] = false;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  },

  c4NounOnly: function() {
    var r = cf.createC4();
    r[C_Greek][C_enableVerbClr] = false;
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_enableGenderNumberClr] = true;
    r[C_OT][C_enableVerbClr] = false;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  },

  c4VerbMoodTense2: function() {
    var r = cf.createC4();
    r[C_Greek][C_enableVerbClr] = true;
    r[C_Greek][C_chkbxPassiveBkgrdColrValue] = false;
    r[C_Greek][C_chkbxMiddleBkgrdColrValue] = false;
    r[C_Greek][C_inClrVerbItem] = ['#000000', '#ff0000', '#ff8800', '#ff8800', '#0000ff', '#ff00ff', '#000000'];
    r[C_Greek][C_slctUlVerbItem] = ['Arrow', 'Dash', '2 lines', '2 lines', 'Underline', 'Dots', 'Underline'];
    r[C_Greek][C_orderOfTense] = ['p', 'i', 'r', 'l', 'a', 'f'];
    r[C_Greek][C_tenseToCombineWithPrevious] = [false, false, false, false, false, false];
    r[C_Greek][C_orderOfMood] = ['i', 'm', 's', 'o', 'n', 'p'];
    r[C_Greek][C_moodToCombineWithPrevious] = [false, false, false, false, false, false];
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_enableGenderNumberClr] = false;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  },

  c4VerbWithMiddlePassive: function() {
    var r = cf.createC4();
    r[C_Greek][C_chkbxPassiveBkgrdClr] = true;
    r[C_Greek][C_chkbxPassiveBkgrdColrValue] = true;
    r[C_Greek][C_chkbxPassiveUlColr1Value] = true;
    r[C_Greek][C_chkbxPassiveUlClr2] = true;
    r[C_Greek][C_chkbxMiddleBkgrdClr] = true;
    r[C_Greek][C_chkbxMiddleBkgrdColrValue] = true;
    r[C_Greek][C_chkbxMiddleUlColr1Value] = true;
    r[C_Greek][C_chkbxMiddleUlClr2] = true;
    r[C_Greek][C_chkbxMiddleUlColr2Value] = true;
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  },

  c4MainVsSupporingVerbs: function() {
    var r = cf.createC4();
    r[C_Greek][C_inClrVerbItem] = ['#008000', '#ed12ed', '#ed12ed', '#008000', '#ed12ed', '#ed12ed'];
    r[C_Greek][C_slctUlVerbItem] = ['Underline', 'Underline', 'Underline', 'Underline', 'Underline', 'Underline'];
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_enableGenderNumberClr] = false;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  },

  c4ImperativesOnly: function() {
    var r = cf.createC4();
    r[C_Greek][C_granularControlOfMoods] = true;
    r[C_Greek][C_moodsOnOff] = [false, false, false, true, false, false];
    r[C_Greek][C_slctUlVerbItem] = ['Underline', 'Underline', 'Underline', 'Underline', 'Underline', 'Underline'];
    r[C_Greek][C_verbTableYHeader] = null;
    r[C_enableGenderNumberClr] = false;
    r[C_OT][C_verbTableXHeader] = null;
    r[C_OT][C_verbTableYHeader] = null;
    return r;
  }
}