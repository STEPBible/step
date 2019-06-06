function ULOBJ(nameOfUlObj) {
  this.name = nameOfUlObj;
  this.img = new Image();
  this.canvas = null;
  this.context = null;
  this.animCount = 0;
  this.animIncrement = 1;
  this.displayStatusSelectedByMood = true;
  this.displayStatusSelectedByTense = true;
}
var uLBASEIMGS = [new ULOBJ('ulArrow'), new ULOBJ('ulDash'), new ULOBJ('ulSolid'),
                  new ULOBJ('ulDoubleSolid'), new ULOBJ('ulDot'), new ULOBJ('ulWave'),
                  new ULOBJ('ulDashDot'), new ULOBJ('ulDashDotDot'), new ULOBJ('ulShortArrow'),
                  new ULOBJ('ulReverseArrow'), new ULOBJ('ulShortReverseArrow')
];

/* each value is an index to ulBaseImg */
var ulVerbCSS = [
  new ULOBJ('pai'), /* 0 */  new ULOBJ('pmi'), /* 1 */  new ULOBJ('ppi'), // 2
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
];

function NAMEANDARRAY(argName, argArray) {
  this.name = argName;
  this.array = argArray;
}
var moodIndexArray = [
  new NAMEANDARRAY('indicative', [0, 1, 2, 17, 18, 19, 22, 23, 24, 36, 37, 38, 41, 42, 43, 59, 60, 61]),
  new NAMEANDARRAY('subjunctive', [3, 4, 5, 20, 25, 44, 45, 46, 62, 63, 64]),
  new NAMEANDARRAY('optative', [6, 7, 26, 47, 48, 49, 65, 66]),
  new NAMEANDARRAY('imperative', [8, 9, 10, 27, 28, 29, 50, 51, 52, 70]),
  new NAMEANDARRAY('infinitive', [11, 12, 13, 30, 31, 32, 53, 54, 55, 67, 68, 69]),
  new NAMEANDARRAY('participle', [14, 15, 16, 21, 33, 34, 35, 39, 40, 56, 57, 58, 71, 72, 73])
];

var tenseIndexArray = [
  new NAMEANDARRAY('present', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
  new NAMEANDARRAY('imperfect', [17, 18, 19, 20, 21]),
  new NAMEANDARRAY('perfect', [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
  new NAMEANDARRAY('pluperfect', [36, 37, 38, 39, 40]),
  new NAMEANDARRAY('aorist', [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]),
  new NAMEANDARRAY('future', [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73])
];

var activeIndexArray = [0, 3, 6, 8, 11, 14, 17, 20, 21, 22, 25, 26, 27, 30, 33, 36, 41, 44, 47, 50, 53, 56, 59, 62, 65, 67, 70, 71];
var middleIndexArray = [1, 4, 7, 9, 12, 15, 18, 23, 28, 31, 34, 37, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 68, 72];
var passiveIndexArray = [2, 5, 10, 13, 16, 19, 24, 29, 32, 35, 38, 40, 43, 46, 49, 52, 55, 58, 61, 64, 69, 73];
var copyOfpassiveIndexArray = passiveIndexArray.slice(0);
var copyOfmiddleIndexArray = middleIndexArray.slice(0);
var animationIndexArray = [];
var handleOfRequestedAnimation = -1;
var timestampOfLastAnimation = 0;
var animationInterval = 800; // Milliseconds per frame for animation.  Lower number will use more CPU
var numOfAnimationsAlreadyPerformedOnSamePage = 0; // If the number of animation on the same page is high, the user might not be around
var maxAnimationOnSamePageWithoutMovement = 900000 / animationInterval; // there are 900,000 is milliseconds in 15 minutes. Stop wasting CPU if the user did not display a new passage, used quick lexicon and use the sidebar
var colorCodeGrammarAvailableAndSelected = false;
var displayQuickTryoutAccordion1 = true; // display the first section of the quick link by default
var displayQuickTryoutAccordion2 = false;
var displayQuickTryoutAccordion3 = false;
var axisUserSelectedToSort = '';
var userProvidedSortOrder = [];

var robinsonCodeOfTense = {
  p: 'present',
  i: 'imperfect',
  r: 'perfect',
  l: 'pluperfect',
  a: 'aorist',
  f: 'future'
};

var robinsonNameOfTense = {
  present: 'p',
  imperfect: 'i',
  perfect: 'r',
  pluperfect: 'l',
  aorist: 'a',
  future: 'f'
};

var defaultOrderOfTense = ['r', 'l', 'i', 'a', 'p', 'f'];
var defaultTenseToCombineWithPrevious = [false, false, false, false, false, false];

var robinsonCodeOfMood = {
  i: 'indicative',
  s: 'subjunctive',
  o: 'optative',
  m: 'imperative',
  n: 'infinitive',
  p: 'participle'
};

var robinsonNameOfMood = {
  indicative: 'i',
  subjunctive: 's',
  optative: 'o',
  imperative: 'm',
  infinitive: 'n',
  participle: 'p'
};

var defaultOrderOfMood = ['i', 's', 'o', 'm', 'n', 'p'];
var defaultMoodToCombineWithPrevious = [false, false, false, false, false, false];

var underlineCanvasName = {
  Arrow: 'ulArrow',
  'Short Arrow': 'ulShortArrow',
  'Reverse Arrow': 'ulReverseArrow',
  'Short Reverse Arrow': 'ulShortReverseArrow',
  Dash: 'ulDash',
  '2 lines': 'ulDoubleSolid',
  Underline: 'ulSolid',
  Dots: 'ulDot',
  Wave: 'ulWave',
  'Dash Dot': 'ulDashDot',
  'Dash Dot Dot': 'ulDashDotDot'
};

var canvasUnderlineName = {
  ulArrow: 'Arrow',
  ulShortArrow: 'Short Arrow',
  ulReverseArrow: 'Reverse Arrow',
  ulShortReverseArrow: 'Short Reverse Arrow',
  ulDash: 'Dash',
  ulDoubleSolid: '2 lines',
  ulSolid: 'Underline',
  ulDot: 'Dots',
  ulWave: 'Wave',
  ulDashDot: 'Dash Dot',
  ulDashDotDot: 'Dash Dot Dot'
};

var defaultColorCodeGrammarSettingsVerbMoodTense = {
  enableGreekVerbColor: true,
  enableGreekNounColor: true,
  inputPassiveBackgroundColor: '#ffd6b8',
  inputPassiveUlColor1: '#000000',
  inputPassiveUlColor2: '#ffffff',
  inputCheckboxPassiveBackgroundColor: true,
  inputCheckboxPassiveBackgroundColorCheckValue: false,
  inputCheckboxPassiveUlColor1: true,
  inputCheckboxPassiveUlColor1CheckValue: false,
  inputCheckboxPassiveUlColor2: false,
  inputCheckboxPassiveUlColor2CheckValue: false,
  inputMiddleBackgroundColor: '#a3fefe',
  inputMiddleUlColor1: '#000000',
  inputMiddleUlColor2: '#ffffff',
  inputCheckboxMiddleBackgroundColor: true,
  inputCheckboxMiddleBackgroundColorCheckValue: false,
  inputCheckboxMiddleUlColor1: true,
  inputCheckboxMiddleUlColor1CheckValue: false,
  inputCheckboxMiddleUlColor2: false,
  inputCheckboxMiddleUlColor2CheckValue: false,
  inputColorVerbItem0: '#31ff00',
  inputColorVerbItem1: '#ffa500',
  inputColorVerbItem2: '#925011',
  inputColorVerbItem3: '#f92d02',
  inputColorVerbItem4: '#fff700',
  inputColorVerbItem5: '#091bfd',
  selectedHighlightVerbItem0: 'Short Reverse Arrow',
  selectedHighlightVerbItem1: 'Short Reverse Arrow',
  selectedHighlightVerbItem2: 'Reverse Arrow',
  selectedHighlightVerbItem3: 'Dots',
  selectedHighlightVerbItem4: 'Dash',
  selectedHighlightVerbItem5: 'Arrow',
  inputAnimate0: false,
  inputAnimate1: false,
  inputAnimate2: false,
  inputAnimate3: false,
  inputAnimate4: false,
  inputAnimate5: false,
  inputColorMasculine: '#000099',
  inputColorFeminine: '#C90000',
  inputColorNeuter: '#000000',
  selectedHighlightSingular: 'normal',
  selectedHighlightPlural: 'bold',
  orderOfTense: defaultOrderOfTense,
  orderOfMood: defaultOrderOfMood,
  tenseToCombineWithPrevious: defaultTenseToCombineWithPrevious,
  moodToCombineWithPrevious: defaultMoodToCombineWithPrevious,
  granularControlOfMoods: false,
  granularControlOfTenses: false,
  moodsOnOff: [false, false, false, false, false, false],
  tensesOnOff: [false, false, false, false, false, false],
  xAxisForMood: true,
  enableAdvancedTools: false
};

var defaultColorCodeGrammarSettingsVerbMoodTense2 = {
  enableGreekNounColor: false,
  inputColorVerbItem0: '#ff0000',
  inputColorVerbItem1: '#ff8800',
  inputColorVerbItem2: '#ffff00',
  inputColorVerbItem3: '#00ff00',
  inputColorVerbItem4: '#0000ff',
  inputColorVerbItem5: '#ff00ff',
  selectedHighlightVerbItem0: 'Wave',
  selectedHighlightVerbItem1: 'Dash',
  selectedHighlightVerbItem2: '2 lines',
  selectedHighlightVerbItem3: '2 lines',
  selectedHighlightVerbItem4: 'Underline',
  selectedHighlightVerbItem5: 'Dots',
  orderOfTense: ['p', 'i', 'r', 'l', 'a', 'f']
};

var defaultColorCodeGrammarSettings = JSON.parse(JSON.stringify(defaultColorCodeGrammarSettingsVerbMoodTense)); // Quick way to make a copy of the object

var defaultColorCodeGrammarSettingsVerbWithMiddlePassive = {
  inputCheckboxPassiveBackgroundColor: true,
  inputCheckboxPassiveBackgroundColorCheckValue: true,
  inputCheckboxPassiveUlColor1CheckValue: true,
  inputCheckboxPassiveUlColor2: true,
  inputCheckboxMiddleBackgroundColor: true,
  inputCheckboxMiddleBackgroundColorCheckValue: true,
  inputCheckboxMiddleUlColor1CheckValue: true,
  inputCheckboxMiddleUlColor2: true,
  inputCheckboxMiddleUlColor2CheckValue: true
};

var defaultColorCodeGrammarSettingsVerbTenseMood = {
  enableGreekNounColor: false,
  xAxisForMood: false
};

var defaultColorCodeGrammarSettingsMainVsSupporingVerbs = {
  enableGreekNounColor: false,
  inputColorVerbItem0: '#008000',
  inputColorVerbItem1: '#ed12ed',
  inputColorVerbItem2: '#ed12ed',
  inputColorVerbItem3: '#008000',
  inputColorVerbItem4: '#ed12ed',
  inputColorVerbItem5: '#ed12ed',
  selectedHighlightVerbItem0: 'Underline',
  selectedHighlightVerbItem1: 'Underline',
  selectedHighlightVerbItem2: 'Underline',
  selectedHighlightVerbItem3: 'Underline',
  selectedHighlightVerbItem4: 'Underline',
  selectedHighlightVerbItem5: 'Underline'
}

var defaultColorCodeGrammarSettingsNounOnly = {
  enableGreekVerbColor: false,
  enableGreekNounColor: true
};

var defaultColorCodeGrammarSettingsImperativesOnly = {
  enableGreekNounColor: false,
  granularControlOfMoods: true,
  moodsOnOff: [false, false, false, true, false, false],
  selectedHighlightVerbItem0: 'Underline',
  selectedHighlightVerbItem1: 'Underline',
  selectedHighlightVerbItem2: 'Underline',
  selectedHighlightVerbItem3: 'Underline',
  selectedHighlightVerbItem4: 'Underline',
  selectedHighlightVerbItem5: 'Underline'
};
var currentColorCodeSettings;

function initCanvasAndCssForColorCodeGrammar() {
  if (currentColorCodeSettings === undefined) getColorCodeGrammarSettings();
  addVerbTable2(false, '#colorCodeTableDiv');
  createUlArrow();
  createUlShortArrow();
  createUlReverseArrow();
  createUlShortReverseArrow();
  createUlDash();
  createUlSolid();
  createUlDoubleSolid();
  createUlDot();
  createUlWave();
  createUlDashDot();
  createUlDashDotDot();
  createUlForAllItemsInYAndX();
  refreshForAllInstancesOfTense();
  goAnimate();
}

function calculateAnimationPixelIncrement(width) {
  var increment = Math.round(width / 5);
  // increment has to be an odd number so that the underline to highligh passive 
  // and middle voice can change to alternate between two colors in goAnimate()
  if (increment % 2 === 0) {
    if (increment > 3) increment -= 1;
    else increment += 1;
  }
  return increment;
}

function createCanvas(canvasId, width, height) {
  var canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = width;
  canvas.height = height;
  canvas.hidden = true;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(canvas);
  return canvas;
}

function createUlArrow() {
  var ulArrow = uLBASEIMGS[0];
  ulArrow.canvas = createCanvas(ulArrow.name, 18, 10);
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
  ulArrow.animIncrement = calculateAnimationPixelIncrement(ulArrow.canvas.width);
}

function createUlShortArrow() {
  var ulArrow = uLBASEIMGS[8];
  ulArrow.canvas = createCanvas(ulArrow.name, 10, 10);
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
  ulArrow.animIncrement = calculateAnimationPixelIncrement(ulArrow.canvas.width);
}

function createUlReverseArrow() {
  var ulArrow = uLBASEIMGS[9];
  ulArrow.canvas = createCanvas(ulArrow.name, 18, 10);
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
  ulArrow.animIncrement = calculateAnimationPixelIncrement(ulArrow.canvas.width);
}

function createUlShortReverseArrow() {
  var ulArrow = uLBASEIMGS[10];
  ulArrow.canvas = createCanvas(ulArrow.name, 10, 10);
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
  ulArrow.animIncrement = calculateAnimationPixelIncrement(ulArrow.canvas.width);
}

function createUlDash() {
  var ulDash = uLBASEIMGS[1];
  ulDash.canvas = createCanvas(ulDash.name, 13, 10);
  ulDash.context = ulDash.canvas.getContext('2d');
  ulDash.context.beginPath();
  ulDash.context.lineWidth = 4;
  ulDash.context.moveTo(4, 4);
  ulDash.context.lineTo(13, 4);
  ulDash.context.stroke();
  ulDash.context.closePath();
  ulDash.img.src = ulDash.canvas.toDataURL('image/png');
  ulDash.animIncrement = calculateAnimationPixelIncrement(ulDash.canvas.width);
}

function createUlDashDot() {
  var ulDashDot = uLBASEIMGS[6];
  ulDashDot.canvas = createCanvas(ulDashDot.name, 19, 10);
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
  ulDashDot.animIncrement = calculateAnimationPixelIncrement(ulDashDot.canvas.width);
}

function createUlDashDotDot() {
  var ulDashDotDot = uLBASEIMGS[7];
  ulDashDotDot.canvas = createCanvas(ulDashDotDot.name, 26, 10);
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
  ulDashDotDot.animIncrement = calculateAnimationPixelIncrement(ulDashDotDot.canvas.width);
}

function createUlSolid() {
  var ulSolid = uLBASEIMGS[2];
  ulSolid.canvas = createCanvas(ulSolid.name, 1, 10);
  ulSolid.context = ulSolid.canvas.getContext('2d');
  ulSolid.context.beginPath();
  ulSolid.context.lineWidth = 3;
  ulSolid.context.moveTo(0, 4);
  ulSolid.context.lineTo(1, 4);
  ulSolid.context.stroke();
  ulSolid.context.closePath();
  ulSolid.img.src = ulSolid.canvas.toDataURL('image/png');
}

function createUlDoubleSolid() {
  var ulDoubleSolid = uLBASEIMGS[3];
  ulDoubleSolid.canvas = createCanvas(ulDoubleSolid.name, 1, 10);
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
}

function createUlDot() {
  var ulDot = uLBASEIMGS[4];
  ulDot.canvas = createCanvas(ulDot.name, 10, 10);
  ulDot.context = ulDot.canvas.getContext('2d');
  ulDot.context.beginPath();
  ulDot.context.arc(5, 4, 2, 0, 2 * Math.PI);
  ulDot.context.fill();
  ulDot.context.stroke();
  ulDot.context.closePath();
  ulDot.img.src = ulDot.canvas.toDataURL('image/png');
  ulDot.animIncrement = calculateAnimationPixelIncrement(ulDot.canvas.width);
}

function createUlWave() {
  var ulWave = uLBASEIMGS[5];
  ulWave.canvas = createCanvas(ulWave.name, 22, 10);
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
  ulWave.animIncrement = calculateAnimationPixelIncrement(ulWave.canvas.width);
}

function createUlForAllItemsInYAndX() {
  var moodOrTenseOnYAxis;
  if (currentColorCodeSettings.xAxisForMood) {
    moodOrTenseOnYAxis = 'tense';
    moodOrTenseOnXAxis = 'mood';
  }
  else {
    moodOrTenseOnYAxis = 'mood';
    moodOrTenseOnXAxis = 'tense';
  }
  var r = getVariablesForVerbTable();
  for (var counter1 = 0; counter1 < r.nameOfAllYAxisItems.length; counter1 += 1) {
    var currentULForYAxis = underlineCanvasName[currentColorCodeSettings['selectedHighlightVerbItem' + getAxisOrderOfItem(moodOrTenseOnYAxis, counter1)]];
    var srcImgObj = _.find(uLBASEIMGS, function(obj) { return obj.name == currentULForYAxis; });
    for (var counter2 = 0; counter2 < r.nameOfAllXAxisItems.length; counter2 += 1) {
      colorForXAxis = currentColorCodeSettings['inputColorVerbItem' + getAxisOrderOfItem(moodOrTenseOnXAxis, counter2)];
      if (currentColorCodeSettings.xAxisForMood) {
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
      var arrayIndexOfCurrentTense = _.find(tenseIndexArray, function(obj) { return obj.name == currentTenseDescription; }).array;
      var moodIndex = _.find(moodIndexArray, function(obj) { return obj.name == currentMoodDescription; }).array;
      for (var counter3 = 0; counter3 < arrayIndexOfCurrentTense.length; counter3 += 1) {
        var indexToUlVerbCSS = arrayIndexOfCurrentTense[counter3];
        if (moodIndex.indexOf(indexToUlVerbCSS) > -1) {
          createUlForOneInstanceOfTense(ulVerbCSS[indexToUlVerbCSS], srcImgObj, colorForXAxis, indexToUlVerbCSS);
          ulVerbCSS[indexToUlVerbCSS].displayStatusSelectedByTense = (!(currentColorCodeSettings.granularControlOfTenses && !currentColorCodeSettings.tensesOnOff[tenseCounter]));
          ulVerbCSS[indexToUlVerbCSS].displayStatusSelectedByMood = (!(currentColorCodeSettings.granularControlOfMoods && !currentColorCodeSettings.moodsOnOff[moodCounter]));
        }
      }
    }
  }
}

function createUlForOneInstanceOfTense(destImgObj, srcImgObj, color, ulVerbCSSIndex) {
  destImgObj.canvas = createCanvas(destImgObj.name, 100, 10);
  updateUlForSpecificYAxis(destImgObj, srcImgObj, color, ulVerbCSSIndex);
}

function userUpdateYAxisItem(itemNumberOfYAxis, nameOfUnderline) {
  updateLocalStorage('selectedHighlightVerbItem' + itemNumberOfYAxis, canvasUnderlineName[nameOfUnderline]);
  var srcImgObj = _.find(uLBASEIMGS, function(obj) { return obj.name == nameOfUnderline; });
  if (srcImgObj === undefined) {
    alert('Error: cannot find the name of tense or underline');
  } else {
    var r = getVerbItemsCombinedWithCurrentItem('Y', itemNumberOfYAxis);
    for (var count = 0; count < r.nameOfItemCombinedWithCurrentItem.length; count ++) {
      updateUlForAllInstancesOfYAxisItem(r.nameOfItemCombinedWithCurrentItem[count], srcImgObj);
    }
    if ((nameOfUnderline !== 'ulSolid') && (nameOfUnderline !== 'ulDoubleSolid') && (currentColorCodeSettings.enableAdvancedTools) ) {
      hideIndividualInputField('#inputAnimate' + itemNumberOfYAxis, true);
      hideIndividualInputField('#inputAnimateCheckbox' + itemNumberOfYAxis, true);
    }
    else {
      hideIndividualInputField('#inputAnimate' + itemNumberOfYAxis, false);
      hideIndividualInputField('#inputAnimateCheckbox' + itemNumberOfYAxis, false);
      updateLocalStorage('inputAnimate' + itemNumberOfYAxis, false);
      $('#inputAnimate' + itemNumberOfYAxis).prop('checked', false);
    }
  }
  
}

function updateUlForAllInstancesOfYAxisItem(nameOfYAxisItem, srcImgObj, color) {
  var indexOfYAxisItem, orderOfCurrentXAxisItem;
  if (currentColorCodeSettings.xAxisForMood)
    indexOfYAxisItem = _.find(tenseIndexArray, function(obj) { return obj.name == nameOfYAxisItem; }).array;
  else 
    indexOfYAxisItem = _.find(moodIndexArray, function(obj) { return obj.name == nameOfYAxisItem; }).array;
  for (var j = 0; j < indexOfYAxisItem.length; j += 1) {
    var index = indexOfYAxisItem[j];
    orderOfCurrentXAxisItem = getAxisOrderOfCSS(ulVerbCSS[index].name, 'X');
    var color = currentColorCodeSettings['inputColorVerbItem' + orderOfCurrentXAxisItem];
    updateUlForSpecificYAxis(ulVerbCSS[index], srcImgObj, color, index);
  }
}

function displayUlVerbCSSOrNot(indexToUlVerbCSS) {
  if ( ( (!currentColorCodeSettings.granularControlOfMoods && !currentColorCodeSettings.granularControlOfTenses) || 
         ((indexToUlVerbCSS != null) && ulVerbCSS[indexToUlVerbCSS].displayStatusSelectedByMood && currentColorCodeSettings.granularControlOfMoods) || 
         ((indexToUlVerbCSS != null) && ulVerbCSS[indexToUlVerbCSS].displayStatusSelectedByTense && currentColorCodeSettings.granularControlOfTenses) ) &&
         currentColorCodeSettings.enableGreekVerbColor) 
    return true;
  else return false;
}

function refreshForAllInstancesOfTense() {
//  var a = performance.now();
  for (var j = 0; j < ulVerbCSS.length; j += 1) {
    if (displayUlVerbCSSOrNot(j)) {
      $('.v' + ulVerbCSS[j].name).css('background', 'url(' + ulVerbCSS[j].img.src + ') repeat-x 100% 100%');
    }
    else {
      $('.v' + ulVerbCSS[j].name).css('background', 'none');
    }
  }

  if (currentColorCodeSettings.enableGreekNounColor) {
    $('.mas').css('color', currentColorCodeSettings.inputColorMasculine);
    $('.fem').css('color', currentColorCodeSettings.inputColorFeminine);
    $('.neut').css('color', currentColorCodeSettings.inputColorNeuter);
    updateCssForNumber('singular', currentColorCodeSettings.selectedHighlightSingular);
    updateCssForNumber('plural', currentColorCodeSettings.selectedHighlightPlural);
  } else {
    $('.mas').css('color', '#000000');
    $('.fem').css('color', '#000000');
    $('.neut').css('color', '#000000');
    updateCssForNumber('singular', 'normal');
    updateCssForNumber('plural', 'normal');
  }
  $('.primaryLightBg').css('text-shadow', 'none'); // Need to set it in the program, if not the browser will prioritize the CSS updated in this Javascript.  
//  var b = performance.now();
//  console.log('refresh took ' + (b - a) + ' ms.');
}

function updateUlForSpecificYAxis(destImgObj, srcImgObj, color, ulVerbCSSIndex) {
  if (color !== undefined) {
    var backgroundColor;
    destImgObj.canvas.heigth = srcImgObj.canvas.height;
    destImgObj.canvas.width = srcImgObj.canvas.width;
    destImgObj.context = destImgObj.canvas.getContext('2d');
    destImgObj.context.drawImage(srcImgObj.canvas, 0, 0);
    if (destImgObj.name.length === 3) {
      if ((destImgObj.name.substr(1, 1) === 'p') &&
        (currentColorCodeSettings.inputCheckboxPassiveBackgroundColorCheckValue)) {
        backgroundColor = currentColorCodeSettings.inputPassiveBackgroundColor;
      } else if ((destImgObj.name.substr(1, 1) === 'm') &&
        (currentColorCodeSettings.inputCheckboxMiddleBackgroundColorCheckValue)) {
        backgroundColor = currentColorCodeSettings.inputMiddleBackgroundColor;
      }
    }
    changeImageColor(destImgObj, color, backgroundColor);
    if (destImgObj.name.length === 3) {
      if ((destImgObj.name.substr(1, 1) === 'p') &&
        (currentColorCodeSettings.inputCheckboxPassiveUlColor1CheckValue)) {
        destImgObj.context.beginPath();
        destImgObj.context.strokeStyle = currentColorCodeSettings.inputPassiveUlColor1;
        destImgObj.context.lineWidth = 2;
        destImgObj.context.moveTo(0, destImgObj.canvas.heigth - 1);
        destImgObj.context.lineTo(destImgObj.canvas.width, destImgObj.canvas.heigth - 1);
        destImgObj.context.stroke();
        destImgObj.context.closePath();
      } else if ((destImgObj.name.substr(1, 1) === 'm') &&
        (currentColorCodeSettings.inputCheckboxMiddleUlColor1CheckValue)) {
        destImgObj.context.beginPath();
        destImgObj.context.strokeStyle = currentColorCodeSettings.inputMiddleUlColor1;
        destImgObj.context.lineWidth = 2;
        destImgObj.context.moveTo(0, destImgObj.canvas.heigth - 1);
        destImgObj.context.lineTo(destImgObj.canvas.width, destImgObj.canvas.heigth - 1);
        destImgObj.context.stroke();
        destImgObj.context.closePath();
      }
    }
    destImgObj.img.src = destImgObj.canvas.toDataURL('image/png');
    destImgObj.animIncrement = calculateAnimationPixelIncrement(destImgObj.canvas.width);
    if (displayUlVerbCSSOrNot(ulVerbCSSIndex)) { 
      $('.v' + destImgObj.name).css('background', 'url(' + destImgObj.img.src + ') repeat-x 100% 100%');
    }
  }
}

function checkNounColor() {
  var currentColorPicker = $('#inputColorMasculine').spectrum('get').toHexString();
  if (currentColorCodeSettings.inputColorMasculine != currentColorPicker) 
    userUpdateNounColor('masculine', currentColorPicker);
  currentColorPicker = $('#inputColorFeminine').spectrum('get').toHexString();
  if (currentColorCodeSettings.inputColorFeminine != currentColorPicker) 
    userUpdateNounColor('feminine', currentColorPicker);
  currentColorPicker = $('#inputColorNeuter').spectrum('get').toHexString();
  if (currentColorCodeSettings.inputColorNeuter != currentColorPicker) 
    userUpdateNounColor('feminine', currentColorPicker);
}

function checkVerbColorInput() {
  for (var i = 0; i < getVariablesForVerbTable().orderOfXAxisItems.length; i ++) {
    var currentColor = currentColorCodeSettings['inputColorVerbItem' + i];
    var currentColorPicker = $('#inputColorVerbItem' + i).spectrum("get").toHexString();
    if (currentColor != currentColorPicker)
      userUpdateColor(i, currentColorPicker);
  }
  var currentColor = currentColorCodeSettings.inputMiddleBackgroundColor;
  var currentColorPicker = $('#inputMiddleBackgroundColor').spectrum("get").toHexString();
  var colorForMiddleWasUpdated = false;
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputMiddleBackgroundColor', currentColorPicker);
    colorForMiddleWasUpdated = true;
  }
  currentColor = currentColorCodeSettings.inputMiddleUlColor1;
  currentColorPicker = $('#inputMiddleUlColor1').spectrum("get").toHexString();
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputMiddleUlColor1', currentColorPicker);
    colorForMiddleWasUpdated = true;
  }
  currentColor = currentColorCodeSettings.inputMiddleUlColor2;
  currentColorPicker = $('#inputMiddleUlColor2').spectrum("get").toHexString();
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputMiddleUlColor2', currentColorPicker);
    colorForMiddleWasUpdated = true;
  }
  if (colorForMiddleWasUpdated) updateVerbsBackground('middle');
  currentColor = currentColorCodeSettings.inputPassiveBackgroundColor;
  currentColorPicker = $('#inputPassiveBackgroundColor').spectrum("get").toHexString();
  var colorForPassiveWasUpdated = false;
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputPassiveBackgroundColor', currentColorPicker);
    colorForPassiveWasUpdated = true;
  }
  currentColor = currentColorCodeSettings.inputPassiveUlColor1;
  currentColorPicker = $('#inputPassiveUlColor1').spectrum("get").toHexString();
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputPassiveUlColor1', currentColorPicker);
    colorForPassiveWasUpdated = true;
  }
  currentColor = currentColorCodeSettings.inputPassiveUlColor2;
  currentColorPicker = $('#inputPassiveUlColor2').spectrum("get").toHexString();
  if (currentColor != currentColorPicker) {
    updateLocalStorage('inputPassiveUlColor2', currentColorPicker);
    colorForPassiveWasUpdated = true;
  }
  if (colorForPassiveWasUpdated) updateVerbsBackground('passive');
}

function getAxisOrderOfCSS(cssName, axis) {
  var positionInOrderOfMoodOrTense, moodOrTense;
  if ( ((!currentColorCodeSettings.xAxisForMood) && (axis == 'X')) ||
       ((currentColorCodeSettings.xAxisForMood) && (axis == 'Y')) ) {
    moodOrTense = 'tense';
    positionInOrderOfMoodOrTense = currentColorCodeSettings.orderOfTense.indexOf(cssName.substr(0, 1));
  }
  else {
    moodOrTense = 'mood';
    positionInOrderOfMoodOrTense = currentColorCodeSettings.orderOfMood.indexOf(cssName.substr(2, 1));
  }
  return getAxisOrderOfItem(moodOrTense, positionInOrderOfMoodOrTense);
}

function getAxisOrderOfItem(moodOrTense, itemNumber) {
  var orderInAxis = itemNumber;
  for (i = 1; i <= itemNumber; i++) {
    if (currentColorCodeSettings[moodOrTense + 'ToCombineWithPrevious'][i]) orderInAxis --;
  }
  return orderInAxis;
}

function userUpdateColor(itemNumber, color) {
  var robinsonCode, itemIndexArray, orderInYAxis;
  updateLocalStorage('inputColorVerbItem' + itemNumber, color);
  if (currentColorCodeSettings.xAxisForMood) {
    robinsonCode = robinsonCodeOfMood;
    itemIndexArray = moodIndexArray;
  }
  else {
    robinsonCode = robinsonCodeOfTense;
    itemIndexArray = tenseIndexArray;
  }
  var r = getVerbItemsCombinedWithCurrentItem('X', itemNumber);
  for (counter = 0; counter < r.codeOfItemCombinedWithCurrentItem.length; counter ++) {
    var currentItemName = robinsonCode[r.codeOfItemCombinedWithCurrentItem[counter]];
    var arrayIdxWithCurrentItem = _.find(itemIndexArray, function(obj) { return obj.name == currentItemName; }).array;
    for (var i = 0; i < arrayIdxWithCurrentItem.length; i += 1) {
      var indexToUlVerbCSS = arrayIdxWithCurrentItem[i];
      orderInYAxis = getAxisOrderOfCSS(ulVerbCSS[indexToUlVerbCSS].name, 'Y');
      var selectedUnderline = underlineCanvasName[currentColorCodeSettings['selectedHighlightVerbItem' + orderInYAxis]];
      var srcImgObj = _.find(uLBASEIMGS, function(obj) { return obj.name == selectedUnderline; });
      updateUlForSpecificYAxis(ulVerbCSS[indexToUlVerbCSS], srcImgObj, color, indexToUlVerbCSS);
    }
  }
}

function userUpdateNounColor(gender, color) {
  updateLocalStorage('inputColor' + upCaseFirst(gender), color);
  var cssName = '';
  if (gender === 'masculine') cssName = '.mas';
  else if (gender === 'feminine') cssName = '.fem';
  else if (gender === 'neuter') cssName = '.neut';
  $(cssName).css({
    'color': color
  });
}

function userUpdateNumber(type, fontHighlight) {
  updateLocalStorage('selectedHighlight' + upCaseFirst(type), fontHighlight);
  updateCssForNumber(type, fontHighlight);
}

function updateCssForNumber(type, fontHighlight) {
  var cssName = '';
  if (type === 'singular') cssName = '.sing';
  else if (type === 'plural') cssName = '.plur';
  else return; // unknown type. something is wrong!
  if (fontHighlight === 'bold') {
    $(cssName).css('font-style', 'normal');
    $(cssName).css('font-weight', 'bold');
  } else if (fontHighlight === 'normal') {
    $(cssName).css('font-style', 'normal'); // 
    $(cssName).css('font-weight', 'normal');
  } else if (fontHighlight === 'bold_italic') {
    $(cssName).css('font-style', 'italic');
    $(cssName).css('font-weight', 'bold');
  } else if (fontHighlight === 'normal_italic') {
    $(cssName).css('font-style', 'italic');
    $(cssName).css('font-weight', 'normal');
  }
}

function userUpdateAnimation(itemNumber) {
  var arrayIndexOfCSSRelatedToItemSelected = [];
  var currentULForItem = currentColorCodeSettings['selectedHighlightVerbItem' + itemNumber];
  var tempIndexArray;
  if (currentColorCodeSettings.xAxisForMood) tempIndexArray = tenseIndexArray;
  else tempIndexArray = moodIndexArray;
  var r = getVerbItemsCombinedWithCurrentItem('Y', itemNumber);
  for (i = 0; i < r.nameOfItemCombinedWithCurrentItem.length; i ++) {
    arrayIndexOfCSSRelatedToItemSelected = arrayIndexOfCSSRelatedToItemSelected.concat( 
      _.find(tempIndexArray, function(obj) { return obj.name == r.nameOfItemCombinedWithCurrentItem[i]; }).array );
  }
  if ((document.getElementById('inputAnimateCheckbox' + itemNumber).checked) &&
    (currentULForItem !== '2 lines') && (currentULForItem !== 'Underline')) {
    updateLocalStorage('inputAnimate' + itemNumber, true);
    for (var j = 0; j < arrayIndexOfCSSRelatedToItemSelected.length; j += 1) {
      var indexToUlVerbCSS = arrayIndexOfCSSRelatedToItemSelected[j];
      if (animationIndexArray.indexOf(indexToUlVerbCSS) === -1) animationIndexArray.push(indexToUlVerbCSS);
    }
  } else {
    updateLocalStorage('inputAnimate' + itemNumber, false);
    for (var k = 0; k < arrayIndexOfCSSRelatedToItemSelected.length; k += 1) {
      var indexToUlVerbCSS = arrayIndexOfCSSRelatedToItemSelected[k];
      var tempIdx = animationIndexArray.indexOf(indexToUlVerbCSS);
      if (indexToUlVerbCSS >= 0) animationIndexArray.splice(tempIdx, 1);
    }
  }
  copyOfpassiveIndexArray = passiveIndexArray.slice(0);
  copyOfmiddleIndexArray = middleIndexArray.slice(0);
  for (var counter = 0; counter < animationIndexArray.length; counter += 1) {
    var tempIndex1 = animationIndexArray[counter];
    var tempIndex2 = copyOfpassiveIndexArray.indexOf(tempIndex1);
    if (tempIndex2 >= 0) copyOfpassiveIndexArray.splice(tempIndex2, 1);
    tempIndex2 = copyOfmiddleIndexArray.indexOf(tempIndex1);
    if (tempIndex2 >= 0) copyOfmiddleIndexArray.splice(tempIndex2, 1);
  }
  if ((animationIndexArray.length > 0) && (handleOfRequestedAnimation === -1))
    goAnimate();
}

function goAnimate(givenTime) {
  var animateUlForPassive = currentColorCodeSettings.inputCheckboxPassiveUlColor1CheckValue &&
    currentColorCodeSettings.inputCheckboxPassiveUlColor2CheckValue;
  var animateUlForMiddle = currentColorCodeSettings.inputCheckboxMiddleUlColor1CheckValue &&
    currentColorCodeSettings.inputCheckboxMiddleUlColor2CheckValue;
  if ((animateUlForPassive || animateUlForMiddle || (animationIndexArray.length > 0)) &&
       colorCodeGrammarAvailableAndSelected && currentColorCodeSettings.enableGreekVerbColor) {
    if (((givenTime - timestampOfLastAnimation) > animationInterval) || (givenTime === undefined)) {
      if (numOfAnimationsAlreadyPerformedOnSamePage < maxAnimationOnSamePageWithoutMovement * 2) {
        if (numOfAnimationsAlreadyPerformedOnSamePage < maxAnimationOnSamePageWithoutMovement) {
          if (animateUlForMiddle) {
            for (var counter2 = 0; counter2 < copyOfmiddleIndexArray.length; counter2 += 1) {
              if (displayUlVerbCSSOrNot(copyOfmiddleIndexArray[counter2]))
                animateCanvasBottomLine(ulVerbCSS[copyOfmiddleIndexArray[counter2]], 'middle');
            }
          }
          if (animateUlForPassive) {
            for (var counter1 = 0; counter1 < copyOfpassiveIndexArray.length; counter1 += 1) {
              if (displayUlVerbCSSOrNot(copyOfpassiveIndexArray[counter1]))
                animateCanvasBottomLine(ulVerbCSS[copyOfpassiveIndexArray[counter1]], 'passive');
            }
          }
          for (var counter = 0; counter < animationIndexArray.length; counter += 1) {
            if (displayUlVerbCSSOrNot(animationIndexArray[counter]))
            animateCanvas(ulVerbCSS[animationIndexArray[counter]], animateUlForPassive, animateUlForMiddle);
          }
        }
        timestampOfLastAnimation = window.performance.now();
        handleOfRequestedAnimation = requestAnimationFrame(goAnimate);
      }
      else handleOfRequestedAnimation = -1;
      numOfAnimationsAlreadyPerformedOnSamePage += 1;
    }
    else handleOfRequestedAnimation = requestAnimationFrame(goAnimate); // Not time yet
  } 
  else handleOfRequestedAnimation = -1; // No animation required so don't requestAnimationFrame() and set it to -1 so that other function will know when to requestAnimationFrame()
}

function animateCanvas(cc, animateUlForPassive, animateUlForMiddle) { // cc is the current image object
  if (cc.canvas.width > 1) {
    cc.context.clearRect(0, 0, cc.canvas.width, cc.canvas.height); // clear the canvas
    if (cc.animCount > cc.canvas.width) // reset, start from beginning
      cc.animCount = cc.animCount - cc.canvas.width;
    if (cc.animCount > 0) // draw image1
      cc.context.drawImage(cc.img, cc.animCount - cc.canvas.width, 0, cc.canvas.width, cc.canvas.height);
    cc.context.drawImage(cc.img, cc.animCount, 0, cc.canvas.width, cc.canvas.height); // draw image2
  }
  cc.animCount = cc.animCount + cc.animIncrement;
  if ((cc.name.substr(1, 1) === 'p') && (animateUlForPassive))
    updateBottomLineOnly(cc, 'passive');
  if ((cc.name.substr(1, 1) === 'm') && (animateUlForMiddle))
    updateBottomLineOnly(cc, 'middle');
  var dataURL = cc.canvas.toDataURL('image/png');
  $('.v' + cc.name).css('background', 'url(' + dataURL + ') repeat-x 100% 100%');
}

function animateCanvasBottomLine(cc, voice) {
  updateBottomLineOnly(cc, voice);
  cc.animCount = cc.animCount + cc.animIncrement;
  var dataURL = cc.canvas.toDataURL('image/png');
  $('.v' + cc.name).css('background', 'url(' + dataURL + ') repeat-x 100% 100%');
}

function updateBottomLineOnly(cc, voice) {
  var color1, color2;
  if (voice === 'middle') {
    color1 = currentColorCodeSettings.inputMiddleUlColor1;
    color2 = currentColorCodeSettings.inputMiddleUlColor2;
  } else {
    color1 = currentColorCodeSettings.inputPassiveUlColor1;
    color2 = currentColorCodeSettings.inputPassiveUlColor2;
  }
  cc.context.beginPath();
  cc.context.lineWidth = 2;
  if (cc.animCount % 2 === 0) cc.context.strokeStyle = color1;
  else cc.context.strokeStyle = color2;
  cc.context.moveTo(0, cc.canvas.height - 1);
  cc.context.lineTo(cc.canvas.width, cc.canvas.height - 1);
  cc.context.stroke();
  cc.context.closePath();
}

function changeImageColor(cc, newColor, backgroundColor) {
  var rgb = hexToRgb(newColor);
  var backgroundRGB = null;
  var imageData = cc.context.getImageData(0, 0, cc.canvas.width, cc.canvas.height);
  var data = imageData.data;

  if (backgroundColor !== undefined) {
    backgroundRGB = hexToRgb(backgroundColor);
  }
  for (var i = 0; i < (data.length - (cc.canvas.width * 2)); i += 4) { // skip the last 2 rows which is used for underline of passive or middle voice
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
  cc.context.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function userUpdatePassiveMiddleVoiceBackground(voice) {
  var ucVoice = upCaseFirst(voice);
  if (document.getElementById('inputCheckbox' + ucVoice + 'BackgroundColor').checked) {
    updateLocalStorage('inputCheckbox' + ucVoice + 'BackgroundColorCheckValue', true);
    $('#input' + ucVoice + 'BackgroundColor').spectrum('enable');
  } else {
    updateLocalStorage('inputCheckbox' + ucVoice + 'BackgroundColorCheckValue', false);
    $('#input' + ucVoice + 'BackgroundColor').spectrum('disable');
  }
  updateVerbsBackground(voice);
}

function userEnablePassiveMiddleVerbsUnderline1(voice) {
  var ucVoice = upCaseFirst(voice);
  if (document.getElementById('inputCheckbox' + ucVoice + 'UlColor1').checked) {
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor1CheckValue', true);
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor2', true);
    $('#input' + ucVoice + 'UlColor1').spectrum('enable');
    $('#inputCheckbox' + ucVoice + 'UlColor2').show();
    $('#inputCheckbox' + ucVoice + 'UlColor2').prop('disabled', false);
    userEnablePassiveMiddleVerbsUnderline2(voice);
  } else {
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor1CheckValue', false);
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor2', false);
    $('#input' + ucVoice + 'UlColor1').spectrum('disable');
    $('#input' + ucVoice + 'UlColor1').hide();
    $('#inputCheckbox' + ucVoice + 'UlColor2').hide();
    $('#inputCheckbox' + ucVoice + 'UlColor2').prop('disabled', true);
    $('#input' + ucVoice + 'UlColor2').spectrum('disable');
  }
  updateVerbsBackground(voice);
}

function userEnablePassiveMiddleVerbsUnderline2(voice) {
  var ucVoice = upCaseFirst(voice);
  if (document.getElementById('inputCheckbox' + ucVoice + 'UlColor2').checked) {
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor2CheckValue', true);
    $('#input' + ucVoice + 'UlColor2').spectrum('enable');
    if (handleOfRequestedAnimation === -1) goAnimate();
  } else {
    updateLocalStorage('inputCheckbox' + ucVoice + 'UlColor2CheckValue', false);
    $('#input' + ucVoice + 'UlColor2').spectrum('disable');
  }
}

function updateVerbsBackground(voice) {
  var selectedUnderline, selectedColor;
  var indexArray = [];
  if (voice === 'passive') indexArray = passiveIndexArray;
  else if (voice === 'middle') indexArray = middleIndexArray;
  else if (voice === 'active') indexArray = activeIndexArray;
  for (var counter = 0; counter < indexArray.length; counter += 1) {
    var indexToUlVerbCSS = indexArray[counter];
    var orderOfXAxis = getAxisOrderOfCSS(ulVerbCSS[indexToUlVerbCSS].name, 'X');
    var orderOfYAxis = getAxisOrderOfCSS(ulVerbCSS[indexToUlVerbCSS].name, 'Y');
    if (currentColorCodeSettings.xAxisForMood) {
      selectedUnderline = underlineCanvasName[currentColorCodeSettings['selectedHighlightVerbItem' + orderOfYAxis]];
      selectedColor = currentColorCodeSettings['inputColorVerbItem' + orderOfXAxis];
    }
    else {
      selectedUnderline = underlineCanvasName[currentColorCodeSettings['selectedHighlightVerbItem' + orderOfXAxis]];
      selectedColor = currentColorCodeSettings['inputColorVerbItem' + orderOfYAxis];
    }
    var srcImgObj = _.find(uLBASEIMGS, function(obj) { return obj.name == selectedUnderline; });
    updateUlForSpecificYAxis(ulVerbCSS[indexToUlVerbCSS], srcImgObj, selectedColor, indexToUlVerbCSS);
  }
}

function updateHtmlForYAxis() {
  r = getVariablesForVerbTable();
  for (var i = 0; i < r.nameOfYAxisItems.length; i += 1) {
    var item = r.nameOfYAxisItems[i];
    var currentULForItem = currentColorCodeSettings['selectedHighlightVerbItem' + i];
    $('#selectedHighlightVerbItem' + i + ' option')
      .filter(function() {
        return $.trim($(this).text()) == currentULForItem;
      })
      .prop('selected', true);
    var temp = ((currentULForItem !== '2 lines') && (currentULForItem !== 'Underline') && (currentColorCodeSettings.enableAdvancedTools) );
    hideIndividualInputField('#inputAnimate' + i, temp);
    hideIndividualInputField('#inputAnimateCheckbox' + i, temp);
    if ((currentColorCodeSettings['inputAnimate' + i]) && (currentColorCodeSettings.enableAdvancedTools)) {
      document.getElementById('inputAnimateCheckbox' + i).checked = true;
      if ((currentULForItem !== '2 lines') && (currentULForItem !== 'Underline'))
        userUpdateAnimation(i);
    } else document.getElementById('inputAnimateCheckbox' + i).checked = false;
  }
}

function updateHtmlForXAxis() {
  var numOfColumns = getVariablesForVerbTable().orderOfXAxisItems.length;
  if (numOfColumns > -1) 
    $('#inputColorVerbItem0').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem0,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(0, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }
    });
  if (numOfColumns > 0) 
    $('#inputColorVerbItem1').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem1,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(1, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }
    });
  if (numOfColumns > 1) 
    $('#inputColorVerbItem2').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem2,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(2, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }
    });
  if (numOfColumns > 2) 
    $('#inputColorVerbItem3').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem3,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(3, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }
    });
  if (numOfColumns > 3)
    $('#inputColorVerbItem4').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem4,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(4, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }
    });
  if (numOfColumns > 4)
    $('#inputColorVerbItem5').spectrum({
      color: currentColorCodeSettings.inputColorVerbItem5,
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateColor(5, color.toHexString());
      },
      show: function(color) {
        checkVerbColorInput();
      }  
    });
}

function updateHtmlForGender() {
  $('#inputColorMasculine').spectrum({
    color: currentColorCodeSettings.inputColorMasculine,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounColor('masculine', color.toHexString());
    },
    show: function(color) {
      checkNounColor();
    }
  });
  $('#inputColorFeminine').spectrum({
    color: currentColorCodeSettings.inputColorFeminine,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounColor('feminine', color.toHexString());
    },
    show: function(color) {
      checkNounColor();
    }
  });
  $('#inputColorNeuter').spectrum({
    color: currentColorCodeSettings.inputColorNeuter,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounColor('neuter', color.toHexString());
    },
    show: function(color) {
      checkNounColor();
    }
  });
}

function updateHtmlForNumber() {
  $('#selectedHighlightPlural option')
    .filter(function() {
      return $.trim($(this).text()) == upCaseFirst(currentColorCodeSettings.selectedHighlightPlural);
    })
    .attr('selected', true);
  $('#selectedHighlightSingular option')
    .filter(function() {
      return $.trim($(this).text()) == upCaseFirst(currentColorCodeSettings.selectedHighlightSingular);
    })
    .attr('selected', true);
}

function updateHtmlForPassiveBackgroundColor() {
  $('#inputPassiveBackgroundColor').spectrum({
    color: currentColorCodeSettings.inputPassiveBackgroundColor,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputPassiveBackgroundColor', color.toHexString());
      updateVerbsBackground('passive');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
  $('#inputPassiveUlColor1').spectrum({
    color: currentColorCodeSettings.inputPassiveUlColor1,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputPassiveUlColor1', color.toHexString());
      updateVerbsBackground('passive');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
  $('#inputPassiveUlColor2').spectrum({
    color: currentColorCodeSettings.inputPassiveUlColor2,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputPassiveUlColor2', color.toHexString());
      updateVerbsBackground('passive');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
}

function updateHtmlForMiddleBackgroundColor() {
  $('#inputMiddleBackgroundColor').spectrum({
    color: currentColorCodeSettings.inputMiddleBackgroundColor,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputMiddleBackgroundColor', color.toHexString());
      updateVerbsBackground('middle');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
  $('#inputMiddleUlColor1').spectrum({
    color: currentColorCodeSettings.inputMiddleUlColor1,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputMiddleUlColor1', color.toHexString());
      updateVerbsBackground('middle');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
  $('#inputMiddleUlColor2').spectrum({
    color: currentColorCodeSettings.inputMiddleUlColor2,
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      updateLocalStorage('inputMiddleUlColor2', color.toHexString());
      updateVerbsBackground('middle');
    },
    show: function(color) {
      checkVerbColorInput();
    }
  });
}

function hideOrShowHtmlForPassiveBackgroundColor(passiveBackgroundName) {
  var ucPassiveBackgroundName = upCaseFirst(passiveBackgroundName);
  var checkedValue = currentColorCodeSettings['inputCheckbox' + ucPassiveBackgroundName + 'CheckValue'];
  $('#inputCheckbox' + ucPassiveBackgroundName).prop('checked', checkedValue);
  if (currentColorCodeSettings['inputCheckbox' + ucPassiveBackgroundName]) {
    $('#inputCheckbox' + ucPassiveBackgroundName).show();
    $('#inputCheckbox' + ucPassiveBackgroundName).prop('disabled', false);
    if ($('#input' + ucPassiveBackgroundName).length) {
      if (checkedValue) $('#input' + ucPassiveBackgroundName).spectrum('enable');
      else $('#input' + ucPassiveBackgroundName).spectrum('disable');
    }
  } else {
    $('#inputCheckbox' + ucPassiveBackgroundName).hide();
    $('#inputCheckbox' + ucPassiveBackgroundName).prop('disabled', true);
    if ($('#input' + ucPassiveBackgroundName).length)
      $('#input' + ucPassiveBackgroundName).spectrum('disable');
  }
}

function enableOrDisableVerbAndNounButtons() {
  var checkedValue = currentColorCodeSettings.enableGreekVerbColor;
  $('#verbonoffswitch').prop('checked', checkedValue);
  updateVerbInputFields(checkedValue);
  checkedValue = currentColorCodeSettings.enableGreekNounColor;
  $('#nounonoffswitch').prop('checked', checkedValue);
  updateNounInputFields(checkedValue);
}

function enableOrDisableAxisConfigButtons(axis) {
  var iconName = '#config' + axis + 'AxisIcon';
  var onOffClassName = '.vrbInpt' + axis;
  var onOffCheckBox = 'axis' + axis + 'OnOffCheckbox';
  var r = getVariablesForVerbTable();
  var moodOrTense = r[axis.toLowerCase() + 'AxisTitle'];
  moodOrTense = moodOrTense.substr(0, moodOrTense.length - 1);
  var ucMoodOrTense = upCaseFirst(moodOrTense);
  var orderOfItemsInAxis = r['orderOf' + axis + 'AxisItems'];
  var nameOfAllItemsInAxis = r['nameOfAll' + axis + 'AxisItems'];
  var granularControlOfAxis = currentColorCodeSettings['granularControlOf' + ucMoodOrTense +'s'];
  var itemInAxisOnOff = currentColorCodeSettings[moodOrTense + 'sOnOff'];
  var ulVerbCSSArrayOfAxis = window[moodOrTense + 'IndexArray']
  var itemToCombineWithPrevious = currentColorCodeSettings[moodOrTense + 'ToCombineWithPrevious'];
  highlightIcon(iconName, granularControlOfAxis);
  hideIndividualInputField(onOffClassName, granularControlOfAxis);
  for (var i = 0; i < orderOfItemsInAxis.length; i += 1) {
    $('#' + onOffCheckBox + i).prop('checked', granularControlOfAxis && itemInAxisOnOff[i]);
  }
  if (granularControlOfAxis) {
    var k = -1;
    for (var i = 0; i < nameOfAllItemsInAxis.length; i ++) {
      if (!itemToCombineWithPrevious[i]) k++;
      var currentItemInAxisOnOff = itemInAxisOnOff[k];
      index2 = _.find(ulVerbCSSArrayOfAxis, function(obj) { return obj.name == nameOfAllItemsInAxis[i]; }).array;
      for (var j = 0; j < index2.length; j += 1) {
        ulVerbCSS[index2[j]]['displayStatusSelectedBy' + ucMoodOrTense] = currentItemInAxisOnOff;
      }
    }
  }
  else {
    for (k = 0; k < ulVerbCSS.length; k ++) {
      ulVerbCSS[k]['displayStatusSelectedBy' + ucMoodOrTense] = true;
    }
  }
  refreshForAllInstancesOfTense(); // can be updated to only refresh the affect rows or columns
}

function highlightIcon(idOrClass, highlight) {
  if (highlight) {
    $(idOrClass).removeClass('icon-not-highlighted');
    $(idOrClass).addClass('icon-highlighted');
  }
  else {
    $(idOrClass).removeClass('icon-highlighted');
    $(idOrClass).addClass('icon-not-highlighted');
  }
}

function enableOrDisableAdvancedToolsButtons() {
  highlightIcon('#advancedToolsIcon', currentColorCodeSettings.enableAdvancedTools);
  hideIndividualInputField('.advancedtools', currentColorCodeSettings.enableAdvancedTools);
}

function userToggleAdvancedTools() {
  currentColorCodeSettings.enableAdvancedTools = !currentColorCodeSettings.enableAdvancedTools;
  updateLocalStorage('enableAdvancedTools', currentColorCodeSettings.enableAdvancedTools);
  enableOrDisableAdvancedToolsButtons();
  updateHtmlForYAxis();
}

function userSwapAxis() {
  currentColorCodeSettings.xAxisForMood = !currentColorCodeSettings.xAxisForMood;
  localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
  $('#sortAxisModal .close').click();
  var element = document.getElementById('sortAxisModal');
  element.parentNode.removeChild(element);
  updateAllSettingsAndInputFields();
}

function userSortAxis(axis) {
  axisUserSelectedToSort = axis;
  var openConfigPage = $('<div id="sortAxisModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
  '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('sortAxisModal');
  if (!temp) openConfigPage.appendTo('body');
  $('#sortAxisModal').modal('show').find('.modal-content').load('/sort_verb_item.html');
}

function userToggleXOrYAxisConfig(axis, index) {
  var moodOrTense;
  if ((currentColorCodeSettings.xAxisForMood && axis == 'X') ||
      (!currentColorCodeSettings.xAxisForMood && axis == 'Y')) 
    moodOrTense = 'moods';
  else moodOrTense = 'tenses';
  if (index == null) {
    updateLocalStorage('granularControlOf' + upCaseFirst(moodOrTense), !currentColorCodeSettings['granularControlOf' + upCaseFirst(moodOrTense)]);
  }
  else {
    currentColorCodeSettings[moodOrTense + 'OnOff'][index] = !currentColorCodeSettings[moodOrTense + 'OnOff'][index];
    updateLocalStorage(moodOrTense + 'OnOff', currentColorCodeSettings[moodOrTense + 'OnOff']);
  }
  enableOrDisableAxisConfigButtons(axis);
}

function getColorCodeGrammarSettings() {
  if (typeof(Storage) !== 'undefined') {
    var tmp = localStorage.getItem('colorCode-CurrentSettings');
    if (tmp) currentColorCodeSettings = createCopyOfColorSetting(JSON.parse(tmp));
    else currentColorCodeSettings = JSON.parse(JSON.stringify(defaultColorCodeGrammarSettings));
  }
}

function updateLocalStorage(name, value) {
  currentColorCodeSettings[name] = value;
  localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
}

function userToggleColorGrammar(grammarFunction) {
  var checkedValue;
  if (document.getElementById(grammarFunction + 'onoffswitch').checked) checkedValue = true;
  else checkedValue = false;
  updateLocalStorage('enableGreek' + upCaseFirst(grammarFunction) + 'Color', checkedValue);
  if (grammarFunction === 'verb') {
    updateVerbInputFields(checkedValue);
  }
  if (grammarFunction === 'noun') {
    updateNounInputFields(checkedValue);
  }
  refreshForAllInstancesOfTense();
  if ((grammarFunction === 'verb') && (checkedValue) && (handleOfRequestedAnimation === -1)) goAnimate();
}

function hideIndividualInputField(fieldName, inputOnOff, skipShow) {
  if (inputOnOff) {
    $(fieldName).attr('disabled', false);
    $(fieldName).attr('hidden', false);
    if (skipShow == null) 
      $(fieldName).show();
  } else {
    $(fieldName).attr('disabled', true);
    $(fieldName).attr('hidden', true);
    $(fieldName).hide();
  }
}

function hideOrDisplayIndividualColorInputField(fieldName, inputOnOff) {
  if (inputOnOff) $(fieldName).spectrum('enable');
  else $(fieldName).spectrum('disable');
}

function updateVerbInputFields(inputOnOff) {
  hideOrDisplayIndividualColorInputField('.vrbInptC', inputOnOff);
  hideIndividualInputField('.vrbInpt1', inputOnOff);
  hideIndividualInputField('#advancedToolsBtn', inputOnOff);
  var showAnimationCheckbox = currentColorCodeSettings.enableAdvancedTools && inputOnOff;
  hideIndividualInputField('#inputAnimate0', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimate1', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimate2', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimate3', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimate4', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimate5', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox0', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox1', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox2', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox3', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox4', showAnimationCheckbox, true);
  hideIndividualInputField('#inputAnimateCheckbox5', showAnimationCheckbox, true);
  
  if (currentColorCodeSettings.xAxisForMood) {
    hideIndividualInputField('.vrbInptX', currentColorCodeSettings.granularControlOfMoods && inputOnOff);
    hideIndividualInputField('.vrbInptY', currentColorCodeSettings.granularControlOfTenses && inputOnOff);
  }
  else {
    hideIndividualInputField('.vrbInptX', currentColorCodeSettings.granularControlOfTenses && inputOnOff);
    hideIndividualInputField('.vrbInptY', currentColorCodeSettings.granularControlOfMoods && inputOnOff);
  }
  hideOrShowHtmlForPassiveBackgroundColor('PassiveBackgroundColor');
  hideOrShowHtmlForPassiveBackgroundColor('PassiveUlColor1');
  hideOrShowHtmlForPassiveBackgroundColor('PassiveUlColor2');
  hideOrShowHtmlForPassiveBackgroundColor('MiddleBackgroundColor');
  hideOrShowHtmlForPassiveBackgroundColor('MiddleUlColor1');
  hideOrShowHtmlForPassiveBackgroundColor('MiddleUlColor2');
  if (!inputOnOff) { // Turning on the passive colors is more complex and is handled by other routines.  
    hideOrDisplayIndividualColorInputField('#inputPassiveBackgroundColor', inputOnOff);
    hideOrDisplayIndividualColorInputField('#inputPassiveUlColor1', inputOnOff);
    hideOrDisplayIndividualColorInputField('#inputPassiveUlColor2', inputOnOff);
    hideIndividualInputField('#inputCheckboxPassiveBackgroundColor', inputOnOff);
    hideIndividualInputField('#inputCheckboxPassiveUlColor1', inputOnOff);
    hideIndividualInputField('#inputCheckboxPassiveUlColor2', inputOnOff);
    hideOrDisplayIndividualColorInputField('#inputMiddleBackgroundColor', inputOnOff);
    hideOrDisplayIndividualColorInputField('#inputMiddleUlColor1', inputOnOff);
    hideOrDisplayIndividualColorInputField('#inputMiddleUlColor2', inputOnOff);
    hideIndividualInputField('#inputCheckboxMiddleBackgroundColor', inputOnOff);
    hideIndividualInputField('#inputCheckboxMiddleUlColor1', inputOnOff);
    hideIndividualInputField('#inputCheckboxMiddleUlColor2', inputOnOff);
  }
}

function updateNounInputFields(inputOnOff) {
  hideIndividualInputField('.nInptN', inputOnOff);
  hideOrDisplayIndividualColorInputField('.nInptC', inputOnOff);
}

function cancelColorChanges() {
  if (typeof(Storage) !== 'undefined') {
    var tmp = localStorage.getItem('colorCode-PreviousSettings');
    if (tmp) currentColorCodeSettings = JSON.parse(tmp);
    else currentColorCodeSettings = JSON.parse(JSON.stringify(defaultColorCodeGrammarSettings));
    localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
    alert('Your color settings has been reset to your previous setting.');
    updateAllSettingsAndInputFields();
  }
}

function resetColorConfig() {
  if (typeof(Storage) !== 'undefined') {
    currentColorCodeSettings = JSON.parse(JSON.stringify(defaultColorCodeGrammarSettings));
    localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
    alert('Your color settings has been reset to default setting.');
    updateAllSettingsAndInputFields();
  }
}

function updateAllSettingsAndInputFields() {
  animationIndexArray = [];
  copyOfpassiveIndexArray = passiveIndexArray.slice(0);
  copyOfmiddleIndexArray = middleIndexArray.slice(0);
  updateVerbsBackground('active');
  updateVerbsBackground('passive');
  updateVerbsBackground('middle');
  createUlForAllItemsInYAndX();
  $('#theGrammarColorModal .close').click();
  $('#theGrammarColorModal').modal('show').find('.modal-content').load('/color_code_grammar.html');
}

function addNounTable() {
  var htmlTable = '<table class="tg2">' +
    '<tr>' +
        '<th valign="middle" align="center" colspan="2" rowspan="2">' +
        '<div class="onoffswitch">' +
        '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="nounonoffswitch" onchange=\'userToggleColorGrammar("noun")\'/>' +
        '<label class="onoffswitch-label" for="nounonoffswitch">' +
        '<span class="onoffswitch-inner"></span>' +
        '<span class="onoffswitch-switch"></span>' +
        '</label>' +
        '</div>' +
        '</th>' +
        '<th class="tg-amwm2" colspan="4">Gender</th>' +
    '</tr><tr>' +
        '<td class="tg-yw4l">Masculine:<br>' +
        '<input id="inputColorMasculine" type="color" class="nInptC" value="' + currentColorCodeSettings.inputColorMasculine + '"/>' +
        '</td>' +
        '<td class="tg-yw4l">Feminine:<br>' +
        '<input id="inputColorFeminine" type="color" class="nInptC" value="' + currentColorCodeSettings.inputColorFeminine + '"/>' +
        '</td>' +
        '<td class="tg-yw4l">Neuter:<br>' +
        '<input id="inputColorNeuter" type="color" class="nInptC" value="' + currentColorCodeSettings.inputColorNeuter + '"/>' +
        '</td>' +
    '</tr><tr>' +
        '<td class="tg-e3zv2" rowspan="4">Number</td>' +
        '<td><span>Singular:</span><br><br>' +
            '<select id="selectedHighlightSingular" class="nInptN" onchange=\'userUpdateNumber("singular", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Normal and Italic</option>' +
                '<option value="bold">Bold</option>' +
                '<option value="bold_italic">Bold and Italic</option>' +
            '</select><br>' +
        '</td>' +
        '<td><span class="sing mas">Masculine singular</span><br>' +
        '</td>' +
        '<td><span class="sing fem">Feminine singular</span><br>' +
        '</td>' +
        '<td><span class="sing neut">Neuter singular</span><br>' +
        '</td>' +
    '</tr><tr>' +
        '<td><span>Plural:</span><br><br>' +
            '<select id="selectedHighlightPlural" class="nInptN" onchange=\'userUpdateNumber("plural", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Normal and Italic</option>' +
                '<option value="bold">Bold</option>' +
                '<option value="bold_italic">Bold and Italic</option>' +
            '</select><br>' +
        '</td>' +
        '<td><span class="plur mas">Masculine Plural</span><br>' +
        '</td>' +
        '<td><span class="plur fem">Feminine Plural</span><br>' +
        '</td>' +
        '<td><span class="plur neut">Neuter Plural</span><br>' +
        '</td>' +
    '</tr>' +
    '</table>';
  htmlTable = $(htmlTable);
  htmlTable.appendTo('#nounColors');
}

function getVerbItemsCombinedWithCurrentItem(axis, itemNumber) {
  var codeOfItemCombinedWithCurrentItem = [], nameOfItemCombinedWithCurrentItem = [];
  var orderOfItem, itemsCombinedWithPreviousItem, robinsonCode;
  if ( ((currentColorCodeSettings.xAxisForMood) && (axis == 'X')) ||
       ((!currentColorCodeSettings.xAxisForMood) && (axis == 'Y')) ) {
    orderOfItem = currentColorCodeSettings.orderOfMood;
    itemsCombinedWithPreviousItem = currentColorCodeSettings.moodToCombineWithPrevious;
    robinsonCode = robinsonCodeOfMood;
  }
  else {
    orderOfItem = currentColorCodeSettings.orderOfTense;
    itemsCombinedWithPreviousItem = currentColorCodeSettings.tenseToCombineWithPrevious;
    robinsonCode = robinsonCodeOfTense;
  }
  var codeOfCurrentItem = getVariablesForVerbTable()['orderOf' + axis + 'AxisItems'][itemNumber];
  var idxOfCurrentItem = orderOfItem.indexOf(codeOfCurrentItem); 
  for (var i = idxOfCurrentItem; i < itemsCombinedWithPreviousItem.length; i ++) {
    if ((itemsCombinedWithPreviousItem[i]) || (i == idxOfCurrentItem) ) {
      codeOfItemCombinedWithCurrentItem.push(orderOfItem[i]);
      nameOfItemCombinedWithCurrentItem.push(robinsonCode[orderOfItem[i]]);
    }
    if ((!itemsCombinedWithPreviousItem[i]) && (i > idxOfCurrentItem) ) break;
  }
  return {
    codeOfItemCombinedWithCurrentItem: codeOfItemCombinedWithCurrentItem,
    nameOfItemCombinedWithCurrentItem: nameOfItemCombinedWithCurrentItem
  }
}

function getVariablesForVerbTable() {
  var nameOfXAxisItems = [], nameOfYAxisItems = [], descOfXAxisItems = [], descOfYAxisItems = [];
  var orderOfXAxisItems, orderOfYAxisItems, xAxisTitle, yAxisTitle, nameOfAllXAxisItems, nameOfAllYAxisItems;
  var orderOfMood = [], orderOfTense = [], nameOfMood = [], nameOfTense = [], descOfMood = [], descOfTense = [];
  var nameOfAllMood = [], nameOfAllTense = [];
  var previousActiveMood = -1;
  for (var i = 0; i < currentColorCodeSettings.orderOfMood.length; i ++) {
    if (!currentColorCodeSettings.moodToCombineWithPrevious[i]) {
      orderOfMood.push(currentColorCodeSettings.orderOfMood[i]);
      nameOfMood.push(robinsonCodeOfMood[currentColorCodeSettings.orderOfMood[i]]);
      descOfMood.push(upCaseFirst(robinsonCodeOfMood[currentColorCodeSettings.orderOfMood[i]]));
      previousActiveMood ++;
    }
    else descOfMood[previousActiveMood] += '<br>' + upCaseFirst(robinsonCodeOfMood[currentColorCodeSettings.orderOfMood[i]]);
    nameOfAllMood.push(robinsonCodeOfMood[currentColorCodeSettings.orderOfMood[i]]);
  }
  var previousActiveTense = -1;
  for (var i = 0; i < currentColorCodeSettings.orderOfTense.length; i ++) {
    if (!currentColorCodeSettings.tenseToCombineWithPrevious[i]) {
      orderOfTense.push(currentColorCodeSettings.orderOfTense[i]);
      nameOfTense.push(robinsonCodeOfTense[currentColorCodeSettings.orderOfTense[i]]);
      descOfTense.push(upCaseFirst(robinsonCodeOfTense[currentColorCodeSettings.orderOfTense[i]]));
      previousActiveTense ++;
    }
    else descOfTense[previousActiveTense] += '<br>' + upCaseFirst(robinsonCodeOfTense[currentColorCodeSettings.orderOfTense[i]]);
    nameOfAllTense.push(robinsonCodeOfTense[currentColorCodeSettings.orderOfTense[i]]);
  }
  if (currentColorCodeSettings.xAxisForMood) {
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
    nameOfXAxisItems: nameOfXAxisItems,
    nameOfYAxisItems: nameOfYAxisItems,
    descOfXAxisItems: descOfXAxisItems,
    descOfYAxisItems: descOfYAxisItems,
    orderOfXAxisItems: orderOfXAxisItems,
    orderOfYAxisItems: orderOfYAxisItems,
    xAxisTitle: xAxisTitle,
    yAxisTitle: yAxisTitle,
    nameOfAllXAxisItems: nameOfAllXAxisItems,
    nameOfAllYAxisItems: nameOfAllYAxisItems
  }
}

function addVerbTable(createUserInputFields, htmlElement) {
  var r = getVariablesForVerbTable();
  var htmlTable = '';
  if (!createUserInputFields) htmlTable = '<link href="css/color_code_grammar.css" rel="stylesheet" media="screen"/>';
  htmlTable += '<table class="tg2"><tr>' +
    '<th valign="middle" align="center" colspan="2" rowspan="2">';
  if (createUserInputFields) htmlTable +=
    '<div class="onoffswitch">' +
        '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="verbonoffswitch" onchange=\'userToggleColorGrammar("verb")\'/>' +
        '<label class="onoffswitch-label" for="verbonoffswitch">' +
            '<span class="onoffswitch-inner"></span>' +
            '<span class="onoffswitch-switch"></span>' +
        '</label>' +
    '</div>';
  htmlTable += '</th>';
  htmlTable += '<th class="tg-amwm2" colspan="' + r.orderOfXAxisItems.length + '">' + upCaseFirst(r.xAxisTitle);
  if (createUserInputFields) htmlTable += 
    '&nbsp;<button id="configXAxisBtn" class="vrbInpt1 btn btn-default btn-xs" type="button" title="Granular selection of highlight for ' + r.xAxisTitle + '" onclick="userToggleXOrYAxisConfig(\'X\')">' +
      '<span id="configXAxisIcon" class="vrbInpt1 glyphicon glyphicon-cog"></span></button>' + 
    '&nbsp;<button id="configSortXAxisBtn" class="btn btn-default btn-xs advancedtools" type="button" title="Sort ' +  r.xAxisTitle + '" onclick="userSortAxis(\'X\')">' +
      '<span id="configSortXAxisIcon" class="glyphicon glyphicon-sort"></span></button>';

  htmlTable += '</th></tr><tr>';
  for (var i = 0; i < r.orderOfXAxisItems.length; i += 1) {
    htmlTable += '<td class="tg-yw4l">' + r.descOfXAxisItems[i];
    if (createUserInputFields) {
      htmlTable +=
        '<input id="axisXOnOffCheckbox' + i + '" class="vrbInptX" ' +
          'type="checkbox" onchange=\'userToggleXOrYAxisConfig("X", "' + i + '")\'><br>' +
        '<input id="inputColorVerbItem' + i + '" class="vrbInptC" type="color" ' +
          'value="' + currentColorCodeSettings['inputColorVerbItem' + i ] + '" ';
    }
    htmlTable += '</td>';
  }
  htmlTable += '<tr>' +
    '<td class="tg-e3zv2" rowspan="' + r.orderOfYAxisItems.length + '">' + upCaseFirst(r.yAxisTitle);
  if (createUserInputFields) htmlTable += 
    '<button id="configYAxisBtn" class="vrbInpt1 btn btn-default btn-xs" type="button" title="Granular selection of ' + r.yAxisTitle + '" onclick="userToggleXOrYAxisConfig(\'Y\')">' +
      '<span id="configYAxisIcon" class="vrbInpt1 glyphicon glyphicon-cog"></span></button>' +
    '<br><br><button id="configSortYAxisBtn" class="btn btn-default btn-xs advancedtools" type="button" title="Sort ' +  r.yAxisTitle + '" onclick="userSortAxis(\'Y\')">' +
      '<span id="configSortYAxisIcon" class="glyphicon glyphicon-sort advancedtools"></span></button>';

  htmlTable += '</td>';
  for (i = 0; i < r.orderOfYAxisItems.length; i += 1) {
    if (i > 0) htmlTable += '<tr>';
    htmlTable += '<td>' + r.descOfYAxisItems[i] + '<br>';
    if (createUserInputFields) htmlTable +=
      '<input id="axisYOnOffCheckbox' + i + '" class="vrbInptY" ' +
        'type="checkbox" onchange=\'userToggleXOrYAxisConfig("Y", "' + i + '")\'><br>' +
      '<select id="selectedHighlightVerbItem' + i + '" class="vrbInpt1" ' +
        'onchange=\'userUpdateYAxisItem("' + i + '", value)\'>' +
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
      '</select><br>' +
      '<span id="inputAnimate' + i + '" class="advancedtools">' +
      'Animate:<input id="inputAnimateCheckbox' + i + '" class="advancedtools" ' +
      'type="checkbox" onchange=\'userUpdateAnimation("' + i + '")\'></span>';
    htmlTable += '</td>';
    for (var counter = 0; counter < r.orderOfXAxisItems.length; counter += 1) {
      htmlTable += '<td>';
      htmlTable += voicesInTenseAndMood(r.orderOfXAxisItems[counter], r.orderOfYAxisItems[i], createUserInputFields);
      htmlTable += '</td>';
    }
  }
  htmlTable += '</table><br>';
  if (createUserInputFields) htmlTable +=
    '<span>Middle voice: background - </span><input id="inputCheckboxMiddleBackgroundColor" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBackground("middle")\'>' +
    '<input id="inputMiddleBackgroundColor" type="color" ' +
    'value="' + currentColorCodeSettings.inputMiddleBackgroundColor + '"/>' +
    '<span>underline - </span><input id="inputCheckboxMiddleUlColor1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("middle")\'>' +
    '<input id="inputMiddleUlColor1" type="color" ' +
    'value="' + currentColorCodeSettings.inputMiddleUlColor1 + '"/>' +
    '<span>animated underline - </span>' +
    '<input id="inputCheckboxMiddleUlColor2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("middle")\'>' +
    '<input id="inputMiddleUlColor2" type="color" ' +
    'value="' + currentColorCodeSettings.inputMiddleUlColor2 + '"/><br><br>' +
    '<span>Passive voice: background - </span><input id="inputCheckboxPassiveBackgroundColor" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBackground("passive")\'>' +
    '<input id="inputPassiveBackgroundColor" type="color" ' +
    'value="' + currentColorCodeSettings.inputPassiveBackgroundColor + '"/>' +
    '<span>underline - </span><input id="inputCheckboxPassiveUlColor1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("passive")\'>' +
    '<input id="inputPassiveUlColor1" type="color" ' +
    'value="' + currentColorCodeSettings.inputPassiveUlColor1 + '"/>' +
    '<span>animated underline - </span>' +
    '<input id="inputCheckboxPassiveUlColor2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("passive")\'>' +
    '<input id="inputPassiveUlColor2" type="color" ' +
    'value="' + currentColorCodeSettings.inputPassiveUlColor2 + '"/>' +
    '&nbsp;<button id="advancedToolsBtn" class="btn btn-default btn-xs" type="button" title="Advanced tools" onclick="userToggleAdvancedTools(\'Y\')">' +
      '<span id="advancedToolsIcon" class="glyphicon glyphicon-wrench"></span></button>';
  htmlTable = $(htmlTable);
  htmlTable.appendTo(htmlElement);
}

function addVerbTable2(createUserInputFields, htmlElement) {
  var r = getVariablesForVerbTable();
  var htmlTable = '';
  if (!createUserInputFields) htmlTable = '<link href="css/color_code_grammar.css" rel="stylesheet" media="screen"/>';
  htmlTable += '<table class="tg2"><tr>' +
    '<th valign="middle" align="center" colspan="2" rowspan="2">';
  htmlTable += '</th>';
  htmlTable += '<th class="tg-amwm2" colspan="' + r.nameOfAllXAxisItems.length + '">' + upCaseFirst(r.xAxisTitle);

  htmlTable += '</th></tr><tr>';
  for (var i = 0; i < r.nameOfAllXAxisItems.length; i += 1) {
    htmlTable += '<td class="tg-yw4l">' + r.nameOfAllXAxisItems[i];
    htmlTable += '</td>';
  }
  htmlTable += '<tr>' +
    '<td class="tg-e3zv2" rowspan="' + r.nameOfAllYAxisItems.length + '">' + upCaseFirst(r.yAxisTitle);
  htmlTable += '</td>';
  for (i = 0; i < r.nameOfAllYAxisItems.length; i += 1) {
    if (i > 0) htmlTable += '<tr>';
    htmlTable += '<td>' + r.nameOfAllYAxisItems[i] + '<br>';
    htmlTable += '</td>';
    for (var counter = 0; counter < r.nameOfAllXAxisItems.length; counter += 1) {
      htmlTable += '<td>';
      var xAxisCode, yAxisCode;
      if (currentColorCodeSettings.xAxisForMood) {
        xAxisCode = robinsonNameOfMood[r.nameOfAllXAxisItems[counter]];
        yAxisCode = robinsonNameOfTense[r.nameOfAllYAxisItems[i]];
      }
      else {
        yAxisCode = robinsonNameOfMood[r.nameOfAllXAxisItems[counter]];
        xAxisCode = robinsonNameOfTense[r.nameOfAllYAxisItems[i]];
      }
      htmlTable += voicesInTenseAndMood(xAxisCode, yAxisCode, true);
      htmlTable += '</td>';
    }
  }
  htmlTable += '</table><br>';
  htmlTable = $(htmlTable);
  htmlTable.appendTo(htmlElement);
}

function voicesInTenseAndMood(xAxisItem, yAxisItem, createUserInputFields) {
  var currentMoodCode, currentTenseCode;
  var highlightMiddle = currentColorCodeSettings['inputCheckboxMiddleBackgroundColorCheckValue'] ||
    currentColorCodeSettings['inputCheckboxMiddleUlColor1CheckValue'];
  var highlightPassive = currentColorCodeSettings['inputCheckboxPassiveBackgroundColorCheckValue'] ||
    currentColorCodeSettings['inputCheckboxPassiveUlColor1CheckValue'];
  var htmlTable = '';
  if (currentColorCodeSettings.xAxisForMood) {
    currentMoodCode = xAxisItem;
    currentTenseCode = yAxisItem;
  }
  else {
    currentMoodCode = yAxisItem;
    currentTenseCode = xAxisItem;   
  }
  var arrayIndexOfCurrentTense = _.find(tenseIndexArray, function(obj) { return obj.name == robinsonCodeOfTense[currentTenseCode]; }).array;
  var numberOfEntriesAdded = 0;
  var lastVoiceAdded = '';
  for (var i = 0; i < arrayIndexOfCurrentTense.length; i += 1) {
    var indexToUlVerbCSS = arrayIndexOfCurrentTense[i];
    var voice = '';
    if (currentMoodCode === ulVerbCSS[indexToUlVerbCSS].name.substr(2, 1)) {
      if (ulVerbCSS[indexToUlVerbCSS].name.substr(1, 1) === 'a') voice = 'active';
      else if ((ulVerbCSS[indexToUlVerbCSS].name.substr(1, 1) === 'm') &&
        (highlightMiddle || createUserInputFields)) voice = 'middle';
      else if ((ulVerbCSS[indexToUlVerbCSS].name.substr(1, 1) === 'p') &&
        (highlightPassive || createUserInputFields)) voice = 'passive';
      if (voice !== '') {
        if (numberOfEntriesAdded === 0) {
          if (voice === 'middle') htmlTable += '<br>';
          else if (voice === 'passive') {
            if ((!createUserInputFields) && (!highlightMiddle)) htmlTable += '<br>';
            else htmlTable += '<br><br>';
          }
        } else if ( (numberOfEntriesAdded === 1) && (voice === 'passive') && (lastVoiceAdded == 'active') &&
            ((createUserInputFields) || (highlightMiddle))) 
            htmlTable += '<br>';
        htmlTable += '<span class="v' + ulVerbCSS[indexToUlVerbCSS].name + '">' + voice + '</span>';
        lastVoiceAdded = voice;
        if (voice !== "passive") htmlTable += '<br>';
        numberOfEntriesAdded += 1;
      }    
    }
  }
  if ((numberOfEntriesAdded === 1) && (lastVoiceAdded === "active")) {
    if (createUserInputFields) htmlTable += "<br><br>";
    else {
      if (highlightMiddle) htmlTable += '<br>';
      if (highlightPassive) htmlTable += '<br>';
    }
  }
  else if ((numberOfEntriesAdded === 2) && (lastVoiceAdded === "middle")) htmlTable += "<br>";
  return htmlTable;
}

function initializeColorCodeHtmlModalPage() {
  addVerbTable(true, '#verbColors');
  addNounTable();
  updateHtmlForYAxis();
  updateHtmlForXAxis();
  updateHtmlForGender();
  updateHtmlForNumber();
  updateHtmlForPassiveBackgroundColor();
  updateHtmlForMiddleBackgroundColor();
  enableOrDisableAxisConfigButtons('X');
  enableOrDisableAxisConfigButtons('Y');
  enableOrDisableAdvancedToolsButtons();
  enableOrDisableVerbAndNounButtons();
  refreshForAllInstancesOfTense();
  if ((((currentColorCodeSettings['inputCheckboxPassiveUlColor1CheckValue']) && (currentColorCodeSettings['inputCheckboxPassiveUlColor2CheckValue'])) ||
      ((currentColorCodeSettings['inputCheckboxMiddleUlColor1CheckValue']) && (currentColorCodeSettings['inputCheckboxMiddleUlColor2CheckValue']))) &&
    (handleOfRequestedAnimation === -1)) goAnimate();
  localStorage.setItem('colorCode-PreviousSettings', JSON.stringify(currentColorCodeSettings));
}

function createCopyOfColorSetting(obj) {
  var result = JSON.parse(JSON.stringify(defaultColorCodeGrammarSettings)); // Make a copy of the default
  for (var key in obj) { // Add keys and values which are in the user selected color config
    if (key in result) result[key] = obj[key]; // If the key does not exist in the default settings, it is probably an old key that is no longer used
  }
  return result;
}

function openColorConfig() {
  if (typeof(Storage) !== 'undefined') {
    var openConfigPage = $('<div id="openColorModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
      '<div class="modal-dialog"><div class="modal-content">');
    var temp = document.getElementById('openColorModal');
    if (!temp) openConfigPage.appendTo('body');
    $('#openColorModal').modal('show').find('.modal-content').load('/open_color_code_grammar.html');
  }
}

function initOpenColorCodeModal() {
  var s = $('<select id="openColorConfigDropdown"/>');
  s.append($('<option/>').html('Verb, Gender and Number'));
  s.append($('<option/>').html('Verb only (tense-mood)'));
  s.append($('<option/>').html('Verb with Middle and Passive Voices'));
  s.append($('<option/>').html('Verb, imperative mood'));
  s.append($('<option/>').html('Verb, main vs supporting verbs'));
  s.append($('<option/>').html('Gender and Number'));
  s.append($('<option/>').html('Verb only (mood-tense), 2nd version'));
  var tmp = localStorage.getItem('colorCode-UserColorConfigNames');
  if (tmp) {
    var UserColorConfigNames = JSON.parse(tmp);
    for (var i in UserColorConfigNames) {
      s.append($('<option/>').html(UserColorConfigNames[i]));
    }
  }
  $('#openColorModalSelectArea').append(s);
}

function initSortVerbItem() {
  r = getVariablesForVerbTable();
  var sortType = r[axisUserSelectedToSort.toLowerCase() + 'AxisTitle'];
  var moodOrTense = sortType.substr(0,sortType.length - 1);
  var nameOfAllItems = r['nameOfAll' + axisUserSelectedToSort + 'AxisItems'];
  var itemsToCombineWithPrevious = currentColorCodeSettings[sortType.substr(0, sortType.length -1) + 'ToCombineWithPrevious'];
  var axisName, otherAxisName;
  if (axisUserSelectedToSort == 'X') {
    axisName = 'horizontal';
    otherAxisName = 'vertical'; 
  }
  else {
    axisName = 'vertical'; 
    otherAxisName = 'horizontal';
  }
  var s = '<p class="col-12">The ' + sortType + ' are currently in the ' + axisName + ' axis.</p>' +
    '<button id="swapAxisBtn" class="btn btn-default btn-sm icon-not-highlighted" type="button" title="Swap" onclick="userSwapAxis()">' +
    '<p class="col-10">Swap the ' + sortType + ' from the ' + axisName + ' to the ' + otherAxisName + ' axis.</p>' +
    '</button><br><br>';
  s += '<p class="col-12">The ' + sortType + ' are listed in the currently selected order.<br>' +
    'Click and drag a ' + moodOrTense + ' to can change the order of the ' + sortType + '.<br>' +
    'Drag an ' + moodOrTense + ' on top on another to combine them.<br>' +
    'When you are finished with your changes to the order of ' + moodOrTense + ' , click on the "Save the order" button at the bottom.<br>' +
    '<div id="nestedVerbItem" class="list-group col nested-sortable">';
  var skipDiv = false;
  for (var i = 0; i < nameOfAllItems.length; i++) {
    s += '<div class="list-group-item nested-1">' + upCaseFirst(nameOfAllItems[i]) + 
    '<div class="list-group nested-sortable">';
    if ((i >= nameOfAllItems.length - 1) || (!itemsToCombineWithPrevious[i + 1])) {
      s += '</div></div>';
      if (skipDiv) {
        s += '</div></div>';
        skipDiv = false;
      }
    } 
    else {
      if (skipDiv) {
        s += '</div></div>';
      }
      skipDiv = true;
    }
  }
  s += '</div>';
  $('#sortVerbItemArea').append($(s));

  var nestedSortables = [].slice.call(document.querySelectorAll('.nested-sortable'));

  for (var i = 0; i < nestedSortables.length; i++) {
    new Sortable(nestedSortables[i], {
      group: 'nested',
      animation: 150,
      onEnd: function(/**Event*/evt) {
        userProvidedSortOrder = [];
        for (var i = 0; i < $('#nestedVerbItem')[0].children.length; i ++) {
          userProvidedSortOrder.push($('#nestedVerbItem')[0].children[i].innerText);
        }
      }
    });
  }
}

function saveSortOrder() {
  if (axisUserSelectedToSort == 'X') 
    sortType = getVariablesForVerbTable().xAxisTitle;
  else
    sortType = getVariablesForVerbTable().yAxisTitle;
  var currentItem;
  var orderOfUserProvidedItems = [], itemsToCombineWithPrevious = [false, false, false, false, false, false];
  var j = 0;
  for (i = 0; i < userProvidedSortOrder.length; i ++) {
    var verbItem = userProvidedSortOrder[i].toLowerCase().replace(/\r\n/g, "\n").replace(/\n\n/g, "\n"); // IE would have \r\n\r\n instead of \n.  The two replace will handle either 1 or 2 \r\n    
    while (verbItem.length > 0) {
      indexOfLineBreak = verbItem.indexOf('\n');
      if (indexOfLineBreak == -1) {
        currentItem = verbItem;
        verbItem = '';
      }
      else {
        currentItem = verbItem.substr(0, indexOfLineBreak).toLowerCase();
        verbItem = verbItem.substr(indexOfLineBreak + 1);
        if (verbItem.length > 0) itemsToCombineWithPrevious[j+1] = true; // Edge can add an extra \n to the end.
      }
      if (sortType == 'moods')
        orderOfUserProvidedItems[j] = robinsonNameOfMood[currentItem];
      else
        orderOfUserProvidedItems[j] = robinsonNameOfTense[currentItem];
      j++;
    }
  }
  if (sortType == 'moods') {
    currentColorCodeSettings.orderOfMood = orderOfUserProvidedItems;
    currentColorCodeSettings.moodToCombineWithPrevious = itemsToCombineWithPrevious;
  }
  else {
    currentColorCodeSettings.orderOfTense = orderOfUserProvidedItems;
    currentColorCodeSettings.tenseToCombineWithPrevious = itemsToCombineWithPrevious;
  }
  localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
  $('#sortAxisModal .close').click();
  var element = document.getElementById('sortAxisModal');
  element.parentNode.removeChild(element);
  updateAllSettingsAndInputFields();
}

function openUserSelectedConfig(name) {
  var selectedConfig;
  if (name != null) selectedConfig = name;
  else selectedConfig = document.getElementById('openColorConfigDropdown').value.toLowerCase();
  if (selectedConfig === 'verb, gender and number') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsVerbMoodTense);
  else if (selectedConfig === 'verb only (tense-mood)') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsVerbTenseMood);
  else if (selectedConfig === 'gender and number') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsNounOnly);
  else if (selectedConfig === 'verb with middle and passive voices') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsVerbWithMiddlePassive);
  else if (selectedConfig === 'verb, imperative mood') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsImperativesOnly);
  else if (selectedConfig === 'verb, main vs supporting verbs') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsMainVsSupporingVerbs);
  else if (selectedConfig === 'verb only (mood-tense), 2nd version') currentColorCodeSettings = createCopyOfColorSetting(defaultColorCodeGrammarSettingsVerbMoodTense2);
  else {
    var found = false;
    var tmp = localStorage.getItem('colorCode-UserColorConfigNames');
    if (tmp) {
      var UserColorConfigNames = JSON.parse(tmp);
      for (var i = 0; i < UserColorConfigNames.length; i += 1) {
        if (UserColorConfigNames[i].toLowerCase() === selectedConfig) {
          var tmp2 = localStorage.getItem('colorCode-UserColorConfigName-' + UserColorConfigNames[i]);
          if (tmp2) {
            found = true;
            currentColorCodeSettings = createCopyOfColorSetting(JSON.parse(tmp2));
          } else UserColorConfigNames.splice(i, 1);
        }
      }
    }
    if (!found) {
      alert('Cannot find a configuation that match your selection');
      return;
    }
  }
  localStorage.setItem('colorCode-CurrentSettings', JSON.stringify(currentColorCodeSettings));
  if (name == null) { 
    $('#openColorModal .close').click();
    var element = document.getElementById('openColorModal');
    element.parentNode.removeChild(element);
    updateAllSettingsAndInputFields();
  }
}

function saveColorConfig() {
  if (typeof(Storage) !== 'undefined') {
    var saveConfigPage = $('<div id="saveColorModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
      '<div class="modal-dialog"><div class="modal-content">');
    var temp = document.getElementById('saveColorModal');
    if (!temp) {
      saveConfigPage.appendTo('body');
    }
    $('#saveColorModal').modal('show').find('.modal-content').load('/save_color_code_grammar.html');
  }
}

function initSaveColorCodeModal() {
  var tmp = localStorage.getItem('colorCode-UserColorConfigNames');
  if (tmp) {
    $('#saveColorModalPromptForDropdownList').show();
    var s = $('<select id="saveColorConfigDropdown"/>');
    var UserColorConfigNames = JSON.parse(tmp);
    s.append($('<option/>').html(''));
    for (var i in UserColorConfigNames) {
      s.append($('<option/>').html(UserColorConfigNames[i]));
    }
    $('#saveColorModalSelectArea').append(s);
  } else $('#saveColorModalPromptForDropdownList').hide();
}

function saveUserColorConfig() {
  var UserColorConfigNames = [];
  var inputText = document.getElementById('saveColorModalInputArea').value.trim();
  var selectedConfig = document.getElementById('saveColorConfigDropdown');
  if (selectedConfig) selectedConfig = selectedConfig.value.trim();
  var tmp = localStorage.getItem('colorCode-UserColorConfigNames');
  if (inputText === '') {
    if (!tmp) {
      alert('Please enter a name for your color configuration before using the "Save" button.');
      return;
    } else if (selectedConfig === '') {
      alert('Please enter or select a name for your color configuration before using the "Save" button.');
      return;
    } else inputText = selectedConfig;
  } else {
    if (tmp) {
      UserColorConfigNames = JSON.parse(tmp);
      for (var i = 0; i < UserColorConfigNames.length; i += 1) {
        if (UserColorConfigNames[i] === inputText) {
          alert('The name you entered is already used.  If you want to save the configuration to the same name, select the name from the dropdown list instead of using the text input field.');
          return;
        }
      }
    }
    UserColorConfigNames.push(inputText);
    localStorage.setItem('colorCode-UserColorConfigNames', JSON.stringify(UserColorConfigNames));
  }
  localStorage.setItem('colorCode-UserColorConfigName-' + inputText, JSON.stringify(currentColorCodeSettings));
  $('#saveColorModal .close').click();
  var element = document.getElementById('saveColorModal');
  element.parentNode.removeChild(element);
}

function upCaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function setupNextPageAndGotoUrl(url, configName, infoMsg) {
  if (configName.indexOf("function:") == 0){
    var functionName = configName.substr(9);
    if (functionName == "openStats") {
      localStorage.setItem('colorCode-openStatus', JSON.stringify(true));
    }
  }
  else openUserSelectedConfig(configName);
  localStorage.setItem('colorCode-InfoMsg', JSON.stringify(infoMsg));
  window.location.assign(url); 
}
