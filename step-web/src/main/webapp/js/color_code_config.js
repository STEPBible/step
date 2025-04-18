function initializeClrCodeHtmlModalPage() { // Do not shorten name
  addVerbTable();
  addOTVerbTable();
  addNounTable();
  updateHtmlForYAxis();
  updateHtmlForXAxis();
  updateHtmlForGender();
  updateHtmlForNumber();
  updateHtmlForPassiveBkgrdClr();
  updateHtmlForMiddleBkgrdClr();
  enableOrDisableAxisConfigButtons('X');
  enableOrDisableAxisConfigButtons('Y');
  enableOrDisableAxisConfigButtons('X', 'OT');
  enableOrDisableAxisConfigButtons('Y', 'OT');
  enableOrDisableVerbAndNounButtons();
  cf.refreshClrGrammarCSS();
  if ((((c4[C_Greek][C_chkbxPassiveUlColr1Value]) && (c4[C_Greek][C_chkbxPassiveUlColr2Value])) ||
      ((c4[C_Greek][C_chkbxMiddleUlColr1Value]) && (c4[C_Greek][C_chkbxMiddleUlColr2Value]))) &&
    (cv[C_handleOfRequestedAnimation] === -1)) cf.goAnimate(0);  //c4 is currentClrCodeConfig.  It is changed to c4 to save space
  step.util.localStorageSetItem('colorCode-PreviousSettings', JSON.stringify(c4));
}

function initializeClrCodeSidebar() { // Do not shorten name
  if (typeof c4 === "undefined") cf.initCanvasAndCssForClrCodeGrammar(); //c4 is currentClrCodeConfig.  It is called to c4 to save space
  addNounSideBar();
  addVerbSideBar();
  addOTVerbSideBar();
  updateHtmlForYAxis();
  updateHtmlForXAxis();
  updateHtmlForGender();
  updateHtmlForNumber();
  updateHtmlForPassiveBkgrdClr();
  updateHtmlForMiddleBkgrdClr();
  enableOrDisableAxisConfigButtons('X');
  enableOrDisableAxisConfigButtons('Y');
  enableOrDisableAxisConfigButtons('X', 'OT');
  enableOrDisableAxisConfigButtons('Y', 'OT');
  enableOrDisableVerbAndNounButtonsSideBar();
  enableInfoIcon();
  if (!c4[C_enableGenderNumberClr])
    $('#gendernumbertable').hide();
  if (!c4[C_Greek][C_enableVerbClr]) {
    $("#greekverbtable").hide();
    $("#greekverbexplaindoc").hide();
  }
  if (!c4[C_OT][C_enableVerbClr])
    $("#hebrewverbtable").hide();
  cf.refreshClrGrammarCSS();
  if ((((c4[C_Greek][C_chkbxPassiveUlColr1Value]) && (c4[C_Greek][C_chkbxPassiveUlColr2Value])) ||
      ((c4[C_Greek][C_chkbxMiddleUlColr1Value]) && (c4[C_Greek][C_chkbxMiddleUlColr2Value]))) &&
    (cv[C_handleOfRequestedAnimation] === -1)) cf.goAnimate(0);  //c4 is currentClrCodeConfig.  It is changed to c4 to save space
  step.util.localStorageSetItem('colorCode-PreviousSettings', JSON.stringify(c4));
  step.util.showOrHideColorSideBarItem();
}

function convertLangInfoToHtml(langInfo) {
  var result = langInfo[0] + "<br>" + langInfo[1] + "; " + langInfo[2] + "; " +
    "<br>&nbsp;&nbsp;&nbsp;<a class='langInfo' href='"+ langInfo[3] + "' target='grammarInfo'> more info...</a>";
  if ((typeof langInfo[4] === "string") && (langInfo[4].length > 0))
    result += "&nbsp;&nbsp;<a class='langInfo' href='"+ langInfo[4] + "' target='grammarInfo'> training...</a>";
  return result;
}

function addElementToQtip(elementName, langInfo) {
  var element = $(elementName);
  element.qtip({
    position: { my: "top left", at: "top left", viewport: $(window) },
    style: { tip: false, classes: 'draggable-tooltip xrefPopup' },
    show: { event: 'mouseenter' },
    hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
    content: {
      text: convertLangInfoToHtml(langInfo)
    }
  });
}

function enableInfoIcon() {
  var greek_info = {};
  var hebrew_info = {};

  greek_info['masculine']=['male or masculine word','eg "he”','"hiereus" = priest','https://uhg.readthedocs.io/en/latest/gender_masculine.html','']
  greek_info['feminine']=['female or feminine word','eg "she”','"heireia" = priestess','https://uhg.readthedocs.io/en/latest/gender_feminine.html','']
  greek_info['neuter']=['neither male nor female','eg "it”','"hieron" = temple','https://ugg.readthedocs.io/en/latest/gender.html','']
  greek_info['singular']=['only one','eg "he, she, it”','"hieros" = holy (male)','https://ugg.readthedocs.io/en/latest/en_uhg/content/number_singular.html','']
  greek_info['plural']=['more than one','eg "they”','"hieroi" = holy (males)','https://ugg.readthedocs.io/en/latest/en_uhg/content/number_plural.html','']
    
  greek_info['present']=['action now or constantly','eg "he does”, "I am running", "she is cooking"','he eats','https://ugg.readthedocs.io/en/latest/tense_present.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-16-present-active-indicative']
  greek_info['future']=['action not yet started','eg "he will do”','he will eat','https://ugg.readthedocs.io/en/latest/tense_future.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-19-future-active-middle-indicative']
  greek_info['aorist']=['action in past or present','eg "he did/ does”','he ate','https://ugg.readthedocs.io/en/latest/tense_aorist.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-23-first-aorist-active-middle-indicative']
  greek_info['imperfect']=['action was continuous','eg "he was doing”','he was eating','https://ugg.readthedocs.io/en/latest/tense_imperfect.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-21-imperfect-indicative']
  greek_info['perfect']=['action was done & stays done','eg "he did & it\'s done”','he\'s eaten','https://ugg.readthedocs.io/en/latest/tense_perfect.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-25-perfect-indicative']
  greek_info['pluperfect']=['action that was already done','eg "he had done”','he had eaten','https://ugg.readthedocs.io/en/latest/tense_pluperfect.html','']
    
  greek_info['active']=['doing something','eg "he hit it”','he sold cakes','https://ugg.readthedocs.io/en/latest/voice_active.html','']
  greek_info['middle']=['doing to oneself','eg "he hit himself”','cakes sold themselves','https://ugg.readthedocs.io/en/latest/voice_middle.html','']
  greek_info['passive']=['something is done','eg "he is hit”','cakes were sold','https://ugg.readthedocs.io/en/latest/voice_passive.html','']
    
  greek_info['indicative']=['it happens','eg "he does”','they sing','https://ugg.readthedocs.io/en/latest/mood_indicative.html','']
  greek_info['subjunctive']=['it might happen','eg "he may do”','he might sing','https://ugg.readthedocs.io/en/latest/mood_subjunctive.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-31-subjunctive-mood']
  greek_info['optative']=['it should happen','eg "may he do”','he should sing','https://ugg.readthedocs.io/en/latest/mood_optative.html','']
  greek_info['imperative']=['an order or plea','eg "do it!”','he must sing','https://ugg.readthedocs.io/en/latest/mood_imperative.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-33-imperative']
  greek_info['infinitive']=['about the action','eg "to do”','to learn to sing','https://ugg.readthedocs.io/en/latest/mood_infinitive.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-32-infinitive']
  greek_info['participle']=['action as a noun or adjective . A participle is a verbal adjective (e.g. eating, going, running). Participles are never the main verb in the sentence. It can function as an adverb modifying other verbs, as an adjective modifying noun or even as a noun.','eg "the doing", "the doing of it”, "eating", "running"','the singing of a singing bird','https://ugg.readthedocs.io/en/latest/mood_participle.html','https://www.biblicaltraining.org/learn/institute/nt201-biblical-greek/nt201-26-introduction-to-participles']
    
  hebrew_info['qal']=['Simple active','eg “he rises”','he dies','https://biblicalhebrew.org/mastering-the-qal-stem-in-biblical-hebrew-a-quick-guide-with-tanakh-examples.aspx','']
  hebrew_info['niphal']=['Simple passive','eg “he is risen”','-','https://biblicalhebrew.org/mastering-the-niphal-stem-in-biblical-hebrew.aspx','']
  hebrew_info['hithpael']=['Simple reflexive','eg “he rises himself”','-','https://uhg.readthedocs.io/en/latest/stem_hithpael.html','']
  hebrew_info['piel']=['Intense/Transitive active','eg “he raises”','he kills','https://biblicalhebrew.org/mastering-the-piel-stem-in-biblical-hebrew.aspx','']
  hebrew_info['pual']=['Intense/Transitive passive','eg “he is raised”','he is killed','https://biblicalhebrew.org/mastering-the-pual-stem-in-biblical-hebrew.aspx','']
  hebrew_info['hithpael']=['Intense/Transitive reflexive','eg “he raises himself”','he kills himself','https://biblicalhebrew.org/mastering-the-hithpael-stem-in-biblical-hebrew.aspx','']
  hebrew_info['hiphil']=['Caused/Declared active','eg “he exalts”','he destroys','https://biblicalhebrew.org/mastering-the-hiphil-stem-in-biblical-hebrew.aspx','']
  hebrew_info['hophal']=['Caused/Declared passive','eg “he is exalted”','he is destroyed','https://biblicalhebrew.org/mastering-the-hophal-stem-in-biblical-hebrew.aspx','']
  hebrew_info['hishtaphel']=['Caused/Declared reflexive','eg “he exalts himself”','he destroys himself','https://uhg.readthedocs.io/en/latest/stem_hishtaphel.html','']
  
  hebrew_info['perfect']=['in past or present','eg "he did/ does"','he saw / sees it','https://uhg.readthedocs.io/en/latest/verb_perfect.html','']
  hebrew_info['imperfect']=['in future or present','eg "he will do/ does"','will / does see it','https://uhg.readthedocs.io/en/latest/verb_imperfect.html','']
  hebrew_info['infinitive']=['emphasise the action','eg "to do"','he certainly saw it','https://uhg.readthedocs.io/en/latest/infinitive_absolute.html','']
  hebrew_info['infinitive_construct']=['purpose of the action','','in order to see it','https://uhg.readthedocs.io/en/latest/infinitive_construct.html','']
  hebrew_info['imperative']=['an order or plea','eg "do it!"','do see it!','https://uhg.readthedocs.io/en/latest/verb_imperative.html','']
  hebrew_info['jussive']=['a request or hope','eg "may he do it!"','may he see you!','https://uhg.readthedocs.io/en/latest/verb_jussive.html','']
  hebrew_info['cohortative']=['a decision or encouragement','eg "may I do it!"','let us see it!','https://uhg.readthedocs.io/en/latest/verb_cohortative.html','']
  hebrew_info['participle']=['action as a thing or description','eg "the doing of it"','a seer, a seeing man','https://uhg.readthedocs.io/en/latest/participle_active.html','']

  var r = cf.getVariablesForVerbTable();
  var greekXAxisItems = r.nameOfXAxisItems;
  var greekYAxisItems = r.nameOfYAxisItems;
  r = cf.getVariablesForOTVerbTable('H');
  var hebrewXAxisItems = r.nameOfXAxisItems;
  var hebrewYAxisItems = r.nameOfYAxisItems;
  require(["qtip"], function () {
    for (l = 0; l < greekYAxisItems.length; l++)
      addElementToQtip(".tense_info" + l, greek_info[greekYAxisItems[l]]);
    for (l = 0; l < greekXAxisItems.length; l++)
      addElementToQtip(".mood_info" + l, greek_info[greekXAxisItems[l]]);
    for (l = 0; l < hebrewXAxisItems.length; l++)
      addElementToQtip(".stem_info" + l, hebrew_info[hebrewXAxisItems[l]]);
    for (l = 0; l < hebrewYAxisItems.length; l++)
      addElementToQtip(".form_info" + l, hebrew_info[hebrewYAxisItems[l]]);
    addElementToQtip(".passive_info", greek_info["passive"]);
    addElementToQtip(".OTpassive_info", greek_info["passive"]);
    addElementToQtip(".middle_info", greek_info["middle"]);
    addElementToQtip(".OTmiddle_info", greek_info["middle"]);
    addElementToQtip(".masc_info", greek_info["masculine"]);
    addElementToQtip(".fem_info", greek_info["feminine"]);
    addElementToQtip(".neut_info", greek_info["neuter"]);
    addElementToQtip(".singular_info", greek_info["singular"]);
    addElementToQtip(".plural_info", greek_info["plural"]);
  });
}

function addVerbSideBar() {
    var r = cf.getVariablesForVerbTable();
    var yAxisItems, descOfXAxisItems, descOfYAxisItems;
    yAxisItems = r.orderOfYAxisItems;
    descOfXAxisItems = r.descOfXAxisItems;
    descOfYAxisItems = r.descOfYAxisItems;
    var htmlTable = '';
    htmlTable += 
    '<table>' +
    '<tr><td><div class="modalonoffswitch">' +
      '<span class="onoffswitch2 pull-left">' +
      '<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="verb2onoffswitch" onchange="userToggleClrGrammar(\'verb2\')"/>' +
      '<label class="onoffswitch2-label" for="verb2onoffswitch">' +
        '<span class="onoffswitch2-inner"></span>' +
        '<span class="onoffswitch2-switch"></span>' +
      '</label>' +
      '</span>' +
      '</div>' +
    '</td>' +
    '<td>&nbsp;&nbsp;&nbsp;</td>' +
    '<td><h2>Greek Verbs</td></tr></table><table id="greekverbtable" class="clrTblWidth">';

    for (var i = 0; i < yAxisItems.length; i ++) {
      var cssClass = 'tensePreview' + i;
      if (c4[C_Greek][C_tensesOnOff][i])
        cssClass += ' ul' + c4[C_Greek][C_slctUlVerbItem][i].replace(/\s/g, ""); 
      cssClass += ' sdBrRow';
      htmlTable += '<tr>';
      htmlTable += '<td class="sdBrRow">' + htmlToAdd5a(i, "") + '</td>' +
        '<td class="sdBrRow">' +
        '<span class="' + cssClass + '">' + descOfYAxisItems[i] + '</span>' +
        '</td>';
      htmlTable += '<td class="grmSlctBx">' + htmlToAdd5b(i, "", false) +
        '<a class="tense_info' +  i + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a>' +
        '</td></tr>';
    }
    htmlTable += '<tr></tr>';
    htmlTable += addTitleToXAxisSideBar(descOfXAxisItems);
    htmlTable += htmlToAdd6('', true);
    htmlTable += '</table>';
    htmlTable += '<br><p id="greekverbexplaindoc"><a href="images/greek_verbs.pdf" target="grammarInfo">Information on colors and underlines</a> selected for Greek verbs</p>';
    htmlTable = $(htmlTable);
    htmlTable.appendTo('#sideBarVerbClrs');
}

function openClrConfig() { // Do not shorten name
  var openConfigPage = $('<div id="openClrModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel">' +
    '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('openClrModal');
  if (!temp) openConfigPage.appendTo('body');
  $('#openClrModal').modal('show').find('.modal-content').load('/html/open_color_code_grammar.html');
}

function initOpenClrCodeModal() { // Do not shorten name
  var s = $('<select id="openClrConfigDropdown"/>');
  s.append($('<option/>').html(step.util.capitalizeFirstLetter(C_AspectDesc)));
  s.append($('<option/>').html(step.util.capitalizeFirstLetter(C_TenseDesc)));
  s.append($('<option/>').html(step.util.capitalizeFirstLetter(C_OrigDesc)));
   var tmp = step.util.localStorageGetItem('colorCode-UserClrConfigNames');
  if (tmp) {
    var UserClrConfigNames = JSON.parse(tmp);
    for (var i in UserClrConfigNames) {
      s.append($('<option/>').html(UserClrConfigNames[i]));
    }
  }
  $('#openClrModalSelectArea').append(s);
}

function initSortVerbItem() { // Do not shorten name
  var r = cf.getVariablesForVerbTable();
  var sortType = r[cv[C_axisUserSelectedToSort].toLowerCase() + 'AxisTitle'];
  var moodOrTense = sortType.substr(0,sortType.length - 1);
  var nameOfAllItems = r['nameOfAll' + cv[C_axisUserSelectedToSort] + 'AxisItems'];
  var itemsToCombineWithPrevious = (sortType.substr(0, sortType.length -1) == 'mood') ? c4[C_Greek][C_moodToCombineWithPrevious] : c4[C_Greek][C_tenseToCombineWithPrevious];
  var axisName, otherAxisName;
  if (cv[C_axisUserSelectedToSort] == 'X') {
    axisName = 'horizontal';
    otherAxisName = 'vertical';
  }
  else {
    axisName = 'vertical';
    otherAxisName = 'horizontal';
  }
  cv[C_userProvidedSortOrder] = [];
  var s = '<p class="col-12">The ' + sortType + ' are currently in the ' + axisName + ' axis.</p>' +
    '<button id="swapAxisBtn" class="btn btn-default btn-sm icon-not-highlighted" type="button" title="Swap" onclick="userSwapAxis()">' +
    '<p class="col-10">Swap the ' + sortType + ' from the ' + axisName + ' to the ' + otherAxisName + ' axis.</p>' +
    '</button><br><br>';
  s += '<p class="col-12">The ' + sortType + ' are listed in the currently selected order.<br>' +
    'Click and drag a ' + moodOrTense + ' to can change the order of the ' + sortType + '.<br>' +
    'Drag a ' + moodOrTense + ' on top on another to group them to the same color configuration.<br>' +
    'When you are finished, click on "Save" at the bottom.<br>' +
    '<div id="nestedVerbItem" class="list-group col nested-sortable">';
  var skipDiv = false;
  for (var i = 0; i < nameOfAllItems.length; i++) {
    s += '<div class="list-group-item nested-1">' + cf.upCaseFirst(nameOfAllItems[i]) +
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
  for (var j = 0; j < nestedSortables.length; j++) {
    new Sortable(nestedSortables[j], {
      group: 'nested',
      animation: 150,
      onEnd: function() {
        cv[C_userProvidedSortOrder] = [];
        for (var j = 0; j < $('#nestedVerbItem')[0].children.length; j ++) {
          cv[C_userProvidedSortOrder].push($('#nestedVerbItem')[0].children[j].innerText);
        }
      }
    });
  }
}

function initAddHeaderInfo() { // Do not shorten name
  var arrayDesc = [];
  var testament = $('#uahi_testament')[0].innerHTML;
  var axis = $('#uahi_axis')[0].innerHTML;
  if (testament == 'ot') {
    var r = cf.getVariablesForOTVerbTable('H');
    if (axis == 'X') {
      var r2 = cf.getVariablesForOTVerbTable('A');
      for (var i = 0; i < r.descOfXAxisItems.length; i ++) {
        var aramaicStems = (r2.descOfXAxisItems[i].length > 0) ? r2.descOfXAxisItems[i].replace(/^/, "(").replace(/$/, ")") : '';
        arrayDesc.push(r.descOfXAxisItems[i] + '<br>' + aramaicStems.replace(/<br>/g, ")<br>("));
      }
    }
    else arrayDesc = cf.getVariablesForOTVerbTable('H').descOfYAxisItems;
  }
  else {
    arrayDesc = cf.getVariablesForVerbTable()['descOf' + axis + 'AxisItems'];
  }
  var c4Ref = (testament == 'nt') ? c4[C_Greek]: c4[C_OT];
  var temp2 = (axis == 'X') ? c4Ref[C_verbTableXHeader] : c4Ref[C_verbTableYHeader];
  var previousHeader = JSON.parse(JSON.stringify(temp2)); // Quick way to make a copy of the object
  (axis == 'X') ? c4Ref[C_verbTableXHeader] = null : c4Ref[C_verbTableYHeader] = null;
  cf.updtLocalStorage(); // If user does not save, the previous header should not be re-use so clear it.
  var prevHdrArray = [];
  if (previousHeader != null) {
    for (var j = 0; j < previousHeader.desc.length; j ++) {
      for (var k = 0; k <= previousHeader.repeat[j]; k++) {
        prevHdrArray.push(previousHeader.desc[j]);
      }
    }
  }
  for (var l = 0; l < 25; l ++) { // add some extra blank items so that the input fields will not show "undefined"
    prevHdrArray.push('');
  }
  var s = '<p class="col-12">Enter the additional header information for the ' + axis + ' axis.</p><br>' +
    '<span id="uahi_num_of_input" style="visibility:hidden">' + arrayDesc.length + '</span>' +
    '<form>';
  for (var counter = 0; counter < arrayDesc.length; counter ++) {
    var text = arrayDesc[counter].replace(/<br>/g, ", ");
    s += text + '<br><input id="uahi_input' + counter + '" type="text" value="' + prevHdrArray[counter] + '"><br>';
  }
  s += '</form>';
  $('#addHeaderInfoArea').append($(s));
}

function saveHeaderInfo() { // Do not shorten name
  var testament = $('#uahi_testament')[0].innerHTML;
  var axis = $('#uahi_axis')[0].innerHTML;
  var numOfInput = $('#uahi_num_of_input')[0].innerHTML;
  var newHeader = {desc: [], repeat: []};
  var hdrNum = 0;
  for (var j = 0; j < numOfInput; j ++) {
    var text = $('#uahi_input' + j)[0].value;
    if ((hdrNum > 0) && (newHeader.desc[(hdrNum-1)] == text))
    newHeader.repeat[(hdrNum-1)] ++;
    else {
      newHeader.desc.push(text);
      newHeader.repeat.push(0);
      hdrNum ++;
    }
  }
  if (testament == 'ot') {
    (axis == 'X') ? c4[C_OT][C_verbTableXHeader] = newHeader : c4[C_OT][C_verbTableYHeader] = newHeader;
  }
  else {
    (axis == 'X') ? c4[C_Greek][C_verbTableXHeader] = newHeader : c4[C_Greek][C_verbTableYHeader] = newHeader;
  }
  cf.updtLocalStorage();
  step.util.closeModal("addHeaderInfoModal");
  // $('#addHeaderInfoModal .close').click();
  // var element = document.getElementById('addHeaderInfoModal');
  // element.parentNode.removeChild(element);
  $('#sortAxisModal .close').click();
  updateAllSettingsAndInputFields();
}

function initSortOTVerbItem() { // Do not shorten name
  var r1 = cf.getVariablesForOTVerbTable('H');
  var r2 = cf.getVariablesForOTVerbTable('A');
  var sortType = r1[cv[C_axisUserSelectedToSort].toLowerCase() + 'AxisTitle'];
  var stemOrForm = sortType.substr(0,sortType.length - 1);

  var itemsToCombineWithPrevious = []; var nameOfAllItems = [];
  if (cv[C_axisUserSelectedToSort] == 'X') {
    var nameOfAllHebrewItems = r1['nameOfAll' + cv[C_axisUserSelectedToSort] + 'AxisItems'];
    var nameOfAllAramaicItems = r2['nameOfAll' + cv[C_axisUserSelectedToSort] + 'AxisItems'];
    var aramaicStemIndex = 0;
    for (var i = 0; i < nameOfAllHebrewItems.length; i ++) {
      var noStemForThisGroupYet = true;
      if (nameOfAllHebrewItems[i] != '') {
        nameOfAllItems.push(nameOfAllHebrewItems[i]);
        itemsToCombineWithPrevious.push(c4[C_OT][C_hebrewStemToCombineWithPrevious][i]);
        noStemForThisGroupYet = false;
      }
      if ((i == (nameOfAllHebrewItems.length - 1)) || (!c4[C_OT][C_hebrewStemToCombineWithPrevious][i+1])) {
        do {
          if (nameOfAllAramaicItems[aramaicStemIndex] != '') {
            nameOfAllItems.push('(' + nameOfAllAramaicItems[aramaicStemIndex] + ')');
            itemsToCombineWithPrevious.push(!noStemForThisGroupYet);
            noStemForThisGroupYet = false;
          }
          aramaicStemIndex ++;
        } while ((aramaicStemIndex < nameOfAllAramaicItems.length) && (c4[C_OT][C_aramaicStemToCombineWithPrevious][aramaicStemIndex]));
      }
    }
  }
  else {
    nameOfAllItems = r1['nameOfAll' + cv[C_axisUserSelectedToSort] + 'AxisItems'];
    itemsToCombineWithPrevious = c4[C_OT][C_verbFormToCombineWithPrevious];
  }
  cv[C_userProvidedSortOrder] = [];
  var s = '<p class="col-12">Click and drag a ' + stemOrForm + ' to can change the order of the ' + sortType + '.<br>' +
    'Drag a ' + stemOrForm + ' on top on another to group them to the same color configuration.<br>';
  if (stemOrForm == 'stem') s += 'Aramaic stems are in parentheses (round brackets).<br>';
  s += 'When you are finished, click on "Save" at the bottom.<br>' +
    '<div id="nestedVerbItem" class="list-group col nested-sortable">';
  var skipDiv = false, voice;
  for (var counter = 0; counter < nameOfAllItems.length; counter++) {
    var displayInTitle = '', activeSelected = '', passiveSelected = '', middleSelected = '', languageCode = '';
    var nameOfCurrentItem =  nameOfAllItems[counter];
    var upperCaseName = cf.upCaseFirst(nameOfCurrentItem);
    if (cv[C_axisUserSelectedToSort] == 'X') {
      if (nameOfAllItems[counter].charAt(0) == '(') {
        languageCode = 'A';
        nameOfCurrentItem = nameOfAllItems[counter].substr(1, (nameOfAllItems[counter].length - 2));
        upperCaseName = '(' + upperCaseName.charAt(1).toUpperCase() + upperCaseName.slice(2);
        voice = c4[C_OT][C_aramaicCodeOfStem][cc[C_aramaicNameOfStem][nameOfCurrentItem]][1];
        displayInTitle = (c4[C_OT][C_aramaicCodeOfStem][cc[C_aramaicNameOfStem][nameOfCurrentItem]][2] === true) ? ' checked' : '';
      }
      else {
        languageCode = 'H';
        nameOfCurrentItem = nameOfAllItems[counter];
        voice = c4[C_OT][C_hebrewCodeOfStem][cc[C_hebrewNameOfStem][nameOfCurrentItem]][1];
        displayInTitle = (c4[C_OT][C_hebrewCodeOfStem][cc[C_hebrewNameOfStem][nameOfCurrentItem]][2] === true) ? ' checked' : '';
      }
      if (voice == 'a') activeSelected = ' selected';
      else if (voice == 'p') passiveSelected = ' selected';
      else if (voice == 'm') middleSelected = ' selected';
    }
    else {
      upperCaseName = c4[C_OT][C_codeOfForm][cc[C_otNameOfVerbForm][nameOfCurrentItem]][1];
      displayInTitle = (c4[C_OT][C_codeOfForm][cc[C_otNameOfVerbForm][nameOfCurrentItem]][2] === true) ? ' checked' : '';
    }
    s += '<div class="list-group-item nested-1">' + upperCaseName + ' - ' +
      '<span>Show at title of color config screen: </span>' +
      '<input id="sortCheckbox'  + languageCode + nameOfCurrentItem + '"type="checkbox"' + displayInTitle + '></input>';
    if (cv[C_axisUserSelectedToSort] == 'X')
      s += '<span>&nbsp;Voice:&nbsp;</span><select id="sortSelect' + languageCode + nameOfCurrentItem + '"><option value="a"' + activeSelected + '>Active</option><option value="p"' + passiveSelected + '>Passive</option><option value="m"' + middleSelected + '>Middle</option></select>';
    s += '<div class="list-group nested-sortable">';
    if ((counter >= nameOfAllItems.length - 1) || (!itemsToCombineWithPrevious[counter + 1])) {
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

  for (var counter2 = 0; counter2 < nestedSortables.length; counter2++) {
    new Sortable(nestedSortables[counter2], {
      group: 'nested',
      animation: 150,
      onEnd: function(/**Event*/evt) {
        cv[C_userProvidedSortOrder] = [];
        for (var counter3 = 0; counter3 < $('#nestedVerbItem')[0].children.length; counter3 ++) {
          cv[C_userProvidedSortOrder].push($('#nestedVerbItem')[0].children[counter3].innerText);
        }
      }
    });
  }
}

function resetSortOrder() { // Do not shorten name
  $('#sortAxisModal .close').click();
  var element = document.getElementById('sortAxisModal');
  if (element)
    element.parentNode.removeChild(element);
  userSortAxis(cv[C_axisUserSelectedToSort]);
}

function resetSortOTOrder() { // Do not shorten name
  $('#sortAxisModal .close').click();
  var element = document.getElementById('sortAxisModal');
  if (element)
    element.parentNode.removeChild(element);
  userSortOTAxis(cv[C_axisUserSelectedToSort]);
}

function saveSortOrder() { // Do not shorten name
  var currentItem, sortType, orderOfUserProvidedItems = [], itemsToCombineWithPrevious = [false, false, false, false, false, false];
  var j = 0;
  if (cv[C_axisUserSelectedToSort] == 'X') sortType = cf.getVariablesForVerbTable().xAxisTitle;
  else sortType = cf.getVariablesForVerbTable().yAxisTitle;
  if (cv[C_userProvidedSortOrder].length > 0) {
    for (var i = 0; i < cv[C_userProvidedSortOrder].length; i ++) {
      var verbItem = cv[C_userProvidedSortOrder][i].toLowerCase().replace(/\r\n/g, "\n").replace(/\n\n/g, "\n"); // IE would have \r\n\r\n instead of \n.  The two replace will handle either 1 or 2 \r\n
      while (verbItem.length > 0) {
        var indexOfLineBreak = verbItem.indexOf('\n');
        if (indexOfLineBreak == -1) {
          currentItem = verbItem;
          verbItem = '';
        }
        else {
          currentItem = verbItem.substr(0, indexOfLineBreak).toLowerCase();
          verbItem = verbItem.substr(indexOfLineBreak + 1);
          if (verbItem.length > 0) itemsToCombineWithPrevious[j+1] = true; // Edge can add an extra \n to the end.
        }
        if (sortType == 'moods') orderOfUserProvidedItems[j] = cc[C_robinsonNameOfMood][currentItem];
        else orderOfUserProvidedItems[j] = cc[C_robinsonNameOfTense][currentItem];
        j++;
      }
    }
    if (sortType == 'moods') {
      c4[C_Greek][C_orderOfMood] = orderOfUserProvidedItems;
      c4[C_Greek][C_moodToCombineWithPrevious] = itemsToCombineWithPrevious;
    }
    else {
      c4[C_Greek][C_orderOfTense] = orderOfUserProvidedItems;
      c4[C_Greek][C_tenseToCombineWithPrevious] = itemsToCombineWithPrevious;
    }
    cf.updtLocalStorage();
    if (confirm('Do you want to edit the optional header information for the verb ' + sortType + '?'))
      userAddHeaderInfo(cv[C_axisUserSelectedToSort]);
    else {
      if (cv[C_axisUserSelectedToSort] == 'X') c4[C_Greek][C_verbTableXHeader] = null;
      else c4[C_Greek][C_verbTableYHeader] = null;
      cf.updtLocalStorage();
    }
    cv[C_userProvidedSortOrder] = [];
  }
  step.util.closeModal("sortAxisModal");
  updateAllSettingsAndInputFields();
}

function saveSortOTOrder() { // Do not shorten name
  var sortType, previousString, currentStemCode, currentStem, verbItem;
  if (cv[C_userProvidedSortOrder].length > 0) {
    if (cv[C_axisUserSelectedToSort] == 'X')
      sortType = cf.getVariablesForOTVerbTable('H').xAxisTitle;
    else
      sortType = cf.getVariablesForOTVerbTable('H').yAxisTitle;
    if (sortType == 'stems') {
      c4[C_OT][C_orderOfHebrewStem] = [];
      c4[C_OT][C_hebrewStemToCombineWithPrevious] = [];
      c4[C_OT][C_orderOfAramaicStem] = [];
      c4[C_OT][C_aramaicStemToCombineWithPrevious] = [];
      for (var i = 0; i < cv[C_userProvidedSortOrder].length; i ++) {
        verbItem = cv[C_userProvidedSortOrder][i].toLowerCase().replace(/\r\n/g, "\n").replace(/\n\n/g, "\n"); // IE would have \r\n\r\n instead of \n.  The two replace will handle either 1 or 2 \r\n
        verbItem = '\n' + verbItem.replace(/(active|passive|middle)\n?/g, "").replace(/\s-\sshow\sat\stitle\sof\scolor\sconfig\sscreen:\s+voice:/g, "").replace(/\s+/g, "\n");
        var updatedString = verbItem;
        do {
          previousString = updatedString;
          updatedString = updatedString.replace(/\n\([a-z]+\)\n/g, "\n"); // loop is requried because the global replace will not include the newly replaced "\n"
        } while (previousString != updatedString);
        var hebrewStemsInThisGroup = updatedString.replace(/^\n/, "").replace(/\n$/, "").replace(/\s+/g, " ").split(' ');
        updatedString = verbItem;
        do {
          previousString = updatedString;
          updatedString = updatedString.replace(/\n[a-z]+\n/g, "\n"); // loop is requried because the global replace will not include the newly replaced "\n"
        } while (previousString != updatedString);
        var aramaicStemsInThisGroup = updatedString.replace(/^\n/, "").replace(/\n$/, "").replace(/\s+/g, " ").replace(/[()]/g, "").split(' ');
        for (var j = 0; j < hebrewStemsInThisGroup.length; j++) {
          c4[C_OT][C_orderOfHebrewStem].push( cc[C_hebrewNameOfStem][hebrewStemsInThisGroup[j]] );
          c4[C_OT][C_hebrewStemToCombineWithPrevious].push( (j > 0) );
        }
        for (var k = 0; k < aramaicStemsInThisGroup.length; k++) {
          c4[C_OT][C_orderOfAramaicStem].push( cc[C_aramaicNameOfStem][aramaicStemsInThisGroup[k]] );
          c4[C_OT][C_aramaicStemToCombineWithPrevious].push( (k > 0) );
        }
      }
      for (var counter2 = 0; counter2 < c4[C_OT][C_orderOfHebrewStem].length; counter2++) {
        currentStemCode = c4[C_OT][C_orderOfHebrewStem][counter2];
        if (currentStemCode != undefined) {
          currentStem = c4[C_OT][C_hebrewCodeOfStem][currentStemCode][0];
          if (currentStem != '') {
            c4[C_OT][C_hebrewCodeOfStem][currentStemCode][1] = $('#sortSelectH' + currentStem + ' option:selected')[0].value;
            c4[C_OT][C_hebrewCodeOfStem][currentStemCode][2] = $('#sortCheckboxH' + currentStem)[0].checked;
          }
        }
      }
      for (var counter3 = 0; counter3 < c4[C_OT][C_orderOfAramaicStem].length; counter3++) {
        currentStemCode = c4[C_OT][C_orderOfAramaicStem][counter3];
        if (currentStemCode != undefined) {
          currentStem = c4[C_OT][C_aramaicCodeOfStem][currentStemCode][0];
          if (currentStem != '') {
            c4[C_OT][C_aramaicCodeOfStem][currentStemCode][1] = $('#sortSelectA' + currentStem + ' option:selected')[0].value;
            c4[C_OT][C_aramaicCodeOfStem][currentStemCode][2] = $('#sortCheckboxA' + currentStem)[0].checked;
          }
        }
      }
    }
    else {
      c4[C_OT][C_orderOfForm] = [];
      c4[C_OT][C_verbFormToCombineWithPrevious] = [];
      for (var counter4 = 0; counter4 < cv[C_userProvidedSortOrder].length; counter4 ++) {
        verbItem = cv[C_userProvidedSortOrder][counter4].replace(/\r\n/g, "\n").replace(/\n\n/g, "\n"); // IE would have \r\n\r\n instead of \n.  The two replace will handle either 1 or 2 \r\n
        verbItem = '\n' + verbItem.replace(/\s-\sShow\sat\stitle\sof\scolor\sconfig\sscreen:\s/g, "").replace(/\s+/g, "\n");
        var formsInThisGroup = verbItem.replace(/^\n/, "").replace(/\n$/, "").replace(/\s+/g, " ").replace(/[()]/g, "").split(' ');
        for (var counter5 = 0; counter5 < formsInThisGroup.length; counter5++) {
          var result = _.find(c4[C_OT][C_codeOfForm], function(obj) { return obj[1] == formsInThisGroup[counter5]; });
          c4[C_OT][C_orderOfForm].push( cc[C_otNameOfVerbForm][result[0]] );
          c4[C_OT][C_verbFormToCombineWithPrevious].push( (counter5 > 0) );
        }
      }
      for (var counter6 = 0; counter6 < c4[C_OT][C_orderOfForm].length; counter6++) {
        var currentFormCode = c4[C_OT][C_orderOfForm][counter6];
        if (currentFormCode != undefined) {
          var currentForm = c4[C_OT][C_codeOfForm][currentFormCode][0];
          if (currentForm != '')
            c4[C_OT][C_codeOfForm][currentFormCode][2] = $('#sortCheckbox' + currentForm)[0].checked;
        }
      }
    }
    cf.updtLocalStorage();
    if (confirm('Do you want to edit the optional header information for the verb ' + sortType + '?'))
        userAddHeaderInfo(cv[C_axisUserSelectedToSort], 'OT');
    else {
        if (cv[C_axisUserSelectedToSort] == 'X') c4[C_OT][C_verbTableXHeader] = null;
        else c4[C_OT][C_verbTableYHeader] = null;
        cf.updtLocalStorage();
    }
    cv[C_userProvidedSortOrder] = [];
  }
  step.util.closeModal("sortAxisModal");
  updateAllSettingsAndInputFields();
}

function saveClrConfig() { // Do not shorten name
  var saveConfigPage = $('<div id="saveClrModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel">' +
    '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('saveClrModal');
  if (!temp) {
    saveConfigPage.appendTo('body');
  }
  $('#saveClrModal').modal('show').find('.modal-content').load('/html/save_color_code_grammar.html');
}

function initSaveClrCodeModal() { // Do not shorten name
  var tmp = step.util.localStorageGetItem('colorCode-UserClrConfigNames');
  if (tmp) {
    $('#saveClrModalPromptForDropdownList').show();
    var s = $('<select id="saveClrConfigDropdown"/>');
    var UserClrConfigNames = JSON.parse(tmp);
    s.append($('<option/>').html(''));
    for (var i in UserClrConfigNames) {
      s.append($('<option/>').html(UserClrConfigNames[i]));
    }
    $('#saveClrModalSelectArea').append(s);
  } else $('#saveClrModalPromptForDropdownList').hide();
}

function saveUserClrConfig() { // Do not shorten name
  var userClrConfigNames = [];
  var inTxt = document.getElementById('saveClrModalInputArea').value.trim();
  var selectedConfig = document.getElementById('saveClrConfigDropdown');
  if (selectedConfig) selectedConfig = selectedConfig.value.trim();
  var tmp = step.util.localStorageGetItem('colorCode-UserClrConfigNames');
  if (inTxt === '') {
    if (!tmp) {
      alert('Please enter a name for your color configuration before using the "Save" button.');
      return;
    } else if (selectedConfig === '') {
      alert('Please enter or select a name for your color configuration before using the "Save" button.');
      return;
    } else inTxt = selectedConfig;
  } else {
    if (tmp) {
      userClrConfigNames = JSON.parse(tmp);
      if (userClrConfigNames.filter(function(cfgName) { return cfgName.toLowerCase() == inTxt; }).length > 0) {
        alert('The name you entered is already used.  If you want to save the configuration to the same name, select the name from the dropdown list instead of using the text in field.');
        return;
      }
    }
    userClrConfigNames.push(inTxt);
    step.util.localStorageSetItem('colorCode-UserClrConfigNames', JSON.stringify(userClrConfigNames));
  }
  step.util.localStorageSetItem('colorCode-UserClrConfigName-' + inTxt, JSON.stringify(c4));
  step.util.closeModal("saveClrModal");
  // $('#saveClrModal .close').click();
  // var element = document.getElementById('saveClrModal');
  // element.parentNode.removeChild(element);
}

function addNounTable() {
  var htmlTable = '<table class="tg2">' +
    '<tr>' +
        '<th valign="middle" align="center" colspan="2" rowspan="2">' +
        '<div class="onoffswitch">' +
        '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="gennumonoffswitch" onchange=\'userToggleClrGrammar("gennum")\'/>' +
        '<label class="onoffswitch-label" for="gennumonoffswitch">' +
        '<span class="onoffswitch-inner"></span>' +
        '<span class="onoffswitch-switch"></span>' +
        '</label>' +
        '</div>' +
        '</th>' +
        '<th class="tg-amwm2" colspan="4">Gender</th>' +
    '</tr><tr>' +
        '<td class="tg-yw4l">Masculine:<br>' +
        '<input id="inClrMasculine" type="color" class="nInptC" value="' + c4[C_inClrMasculine] + '"/>' +
        '</td>' +
        '<td class="tg-yw4l">Feminine:<br>' +
        '<input id="inClrFeminine" type="color" class="nInptC" value="' + c4[C_inClrFeminine] + '"/>' +
        '</td>' +
        '<td class="tg-yw4l">Neuter:<br>' +
        '<input id="inClrNeuter" type="color" class="nInptC" value="' + c4[C_inClrNeuter] + '"/>' +
        '</td>' +
    '</tr><tr>' +
        '<td class="tg-e3zv2" rowspan="4">Number</td>' +
        '<td><span>Singular:</span><br><br>' +
            '<select id="slctUlSingular" class="nInptN" onchange=\'userUpdateNumber("singular", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Italic</option>' +
                '<option value="bold">Bold</option>' +
                // '<option value="bold_italic">Bold Italic</option>' +
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
            '<select id="slctUlPlural" class="nInptN" onchange=\'userUpdateNumber("plural", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Italic</option>' +
                '<option value="bold">Bold</option>' +
                // '<option value="bold_italic">Bold Italic</option>' +
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
  htmlTable.appendTo('#nounClrs');
}

function addNounSideBar() {
  var htmlTable = 
      '<table>' +
        '<tr><td><div class="modalonoffswitch">' +
          '<span class="onoffswitch2 pull-left">' +
          '<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="gennum2onoffswitch" onchange="userToggleClrGrammar(\'gennum2\')"/>' +
          '<label class="onoffswitch2-label" for="gennum2onoffswitch">' +
            '<span class="onoffswitch2-inner"></span>' +
            '<span class="onoffswitch2-switch"></span>' +
          '</label>' +
          '</span>' +
          '</div>' +
        '</td>' +
        '<td>&nbsp;&nbsp;&nbsp;</td>' +
        '<td><h2>Gender & Number</td></tr>' +
      '</table>' +
      '<table id="gendernumbertable" class="clrTblWidth">' +
        '<tr><td class="sing mas sdBrRow">Masculine:</td>' +
        '<td class="grmSlctBx">' +
          '<input id="inClrMasculine" type="color" class="nInptC" value="' + c4[C_inClrMasculine] + '"/>' +
          '<span><a class="masc_info glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>' +
        '</td>' +
        '</tr>' +
        '<tr><td class="sing fem sdBrRow">Feminine:</td>' +
        '<td class="grmSlctBx">' +
          '<input id="inClrFeminine" type="color" class="nInptC" value="' + c4[C_inClrFeminine] + '"/>' +
          '<span><a class="fem_info glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>' +
        '</td>' +
        '</tr>' +
        '<tr><td class="sing neut sdBrRow">Neuter:</td>' +
        '<td class="grmSlctBx">' +
          '<input id="inClrNeuter" type="color" class="nInptC" value="' + c4[C_inClrNeuter] + '"/>' +
          '<span><a class="neut_info glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>' +
        '</td>' +
        '</tr>' +
        '<tr><td class="sdBrRow">Singular:</td>' +
            '<td class="grmSlctBx"><select id="slctUlSingular" class="nInptN" onchange=\'userUpdateNumber("singular", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Italic</option>' +
                '<option value="bold">Bold</option>' +
                // '<option value="bold_italic">Bold Italic</option>' +
            '</select>' +
            '<span><a class="singular_info glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>' +
            '</td>' +
            '</tr>' +
        '</tr>' +
        '<tr><td class="plur sdBrRow">Plural:</td>' +
            '<td class="grmSlctBx"><select id="slctUlPlural" class="nInptN" onchange=\'userUpdateNumber("plural", value)\'>' +
                '<option value="normal">Normal</option>' +
                '<option value="normal_italic">Italic</option>' +
                '<option value="bold">Bold</option>' +
                // '<option value="bold_italic">Bold Italic</option>' +
            '</select>' +
            '<span><a class="plural_info glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>' +
            '</td>' +
        '</tr></table>';
  htmlTable = $(htmlTable);
  htmlTable.appendTo('#sideBargenderNumClrs');
}

function addOtTitleToXAxis(descOfHebrewXAxisItems, descOfAramaicwXAxisItems, numOfRows) {
  var htmlTable = '';
  var curXTitle = c4[C_OT][C_verbTableXHeader];
  if (curXTitle != null) {
      htmlTable += '<tr>';
      for (var i = 0; i < curXTitle.desc.length; i ++) {
        htmlTable += '<td class="tg-yw4l" align="center" colspan="' + (curXTitle.repeat[i] + 1) + '"';
        if (curXTitle.desc[i].length < 10) htmlTable += ' width=70';
        htmlTable += '>' + curXTitle.desc[i] + '</td>';
      }
      htmlTable += '</tr>';
  }
  htmlTable += '<tr>';
  var descOfXAxisItems = addCssToXAxisHeader(descOfHebrewXAxisItems, descOfAramaicwXAxisItems, numOfRows);
  for (var j = 0; j < descOfHebrewXAxisItems.length; j += 1) {
    htmlTable += '<td class="tg-yw4l">' + descOfXAxisItems[j];
    htmlTable += htmlToAdd3a(j, 'OT', false) +
      htmlToAdd3b(j, 'OT', false);
    htmlTable += '</td>';
  }
  htmlTable += '</tr>';
  return htmlTable;
}

function addOtTitleToXAxisSideBar(descOfHebrewXAxisItems, descOfAramaicwXAxisItems, numOfRows) {
  var htmlTable = '';
  var descOfXAxisItems = addCssToXAxisHeader(descOfHebrewXAxisItems, descOfAramaicwXAxisItems, numOfRows);
  for (var j = 0; j < descOfHebrewXAxisItems.length; j += 1) {
    htmlTable += '<tr><td>' + htmlToAdd3a(j, 'OT', false) + '</td>';
    var shortenName = descOfXAxisItems[j].split("<br")[0] + " etc";
    htmlTable += '<td style="text-decoration:underline solid 33%" class="stemPreview' + j + ' sdBrRow">' + 
      shortenName + '</td>';
    htmlTable += '<td class="grmSlctBx">' + htmlToAdd3b(j, 'OT', false) +
      '<span><a class="stem_info' +  j + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span' +
      '</td>';
    htmlTable += '</tr>';
  }
  htmlTable += '</tr>';
  return htmlTable;
}

function addCssToXAxisHeader(descOfHebrewXAxisItems, descOfAramaicwXAxisItems, numOfRows) {
  var result = [], voice;
  for (var counter = 0; counter < descOfHebrewXAxisItems.length; counter++) {
    var hebrewStemsInThisGroup = descOfHebrewXAxisItems[counter].replace(/<br>/g, " ").replace(/\s+/g, " ").split(' ');
    var aramaicStemsInThisGroup = descOfAramaicwXAxisItems[counter].replace(/<br>/g, " ").replace(/\s+/g, " ").split(' ');
    result.push("");
    for (var i = 0; i < hebrewStemsInThisGroup.length; i++) {
      if (hebrewStemsInThisGroup[i] != '') {
        if (result[counter].length > 0) result[counter] += '<br>';
        voice = c4[C_OT][C_hebrewCodeOfStem][cc[C_hebrewNameOfStem][hebrewStemsInThisGroup[i].toLowerCase()]][1];
        if (voice == 'p') {
            result[counter] += '<span class="vot_R' + numOfRows + 'C' + ((counter*3)+1) + '">' + hebrewStemsInThisGroup[i] + '</span>';
        }
        else if (voice == 'm') {
            result[counter] += '<span class="vot_R' + numOfRows + 'C' + ((counter*3)+2) + '">' + hebrewStemsInThisGroup[i] + '</span>';
        }
        else result[counter] += hebrewStemsInThisGroup[i];
      }
    }
    for (var j = 0; j < aramaicStemsInThisGroup.length; j++) {
      if (aramaicStemsInThisGroup[j] != '') {
        if (result[counter].length > 0) result[counter] += '<br>';
        voice = c4[C_OT][C_aramaicCodeOfStem][cc[C_aramaicNameOfStem][aramaicStemsInThisGroup[j].toLowerCase()]][1];
        if (voice == 'p') {
            result[counter] += '<span class="vot_R' + numOfRows + 'C' + ((counter*3)+1) + '">(' + aramaicStemsInThisGroup[j] + ')</span>';
        }
        else if (voice == 'm') {
            result[counter] += '<span class="vot_R' + numOfRows + 'C' + ((counter*3)+2) + '">(' + aramaicStemsInThisGroup[j] + ')</span>';
        }
        else result[counter] += '(' + aramaicStemsInThisGroup[j] + ')';
      }
    }
  }
  return result;
}
  
function addOTVerbTable() {
  var r = cf.getVariablesForOTVerbTable('H');
  var xAxisItems, yAxisItems, descOfXAxisItems, descOfYAxisItems;
  xAxisItems = r.orderOfXAxisItems;
  yAxisItems = r.orderOfYAxisItems;
  descOfXAxisItems = r.descOfXAxisItems;
  descOfYAxisItems = r.descOfYAxisItems;
  var htmlTable = '';
  var yAxisSpan = tableAxisSpan('Y', 'OT');
  htmlTable += '<table class="tg2"><tr><th valign="middle" align="center" colspan="' +
    yAxisSpan + '" rowspan="' + tableAxisSpan('X', 'OT') + '">';
  htmlTable += htmlToAdd1('OT');
  htmlTable += '</th><th class="tg-amwm2" colspan="' + xAxisItems.length + '">' + cf.upCaseFirst(r.xAxisTitle);
  htmlTable += htmlToAdd2(r.xAxisTitle, 'OT');
  htmlTable += '</th></tr>';
  htmlTable += addOtTitleToXAxis(descOfXAxisItems, cf.getVariablesForOTVerbTable('A').descOfXAxisItems, yAxisItems.length);
  htmlTable += '<tr>' +
  '<td class="tg-e3zv2" rowspan="' + yAxisItems.length + '">' + cf.upCaseFirst(r.yAxisTitle);
  htmlTable += htmlToAdd4(r.yAxisTitle, 'OT');
  htmlTable += '</td>';
  for (var i = 0; i < yAxisItems.length; i += 1) {
    if (i > 0) htmlTable += '<tr>';
    htmlTable += addTitleToYAxis(i, descOfYAxisItems[i], yAxisSpan, 'OT');
    htmlTable += htmlToAdd5a(i, 'OT') + htmlToAdd5b(i, 'OT', false) + '</td>';
    htmlTable += '</td>';
    for (var counter = 0; counter < xAxisItems.length; counter += 1) {
      htmlTable += '<td>' + voicesInFormAndStem(counter, i) + '</td>';
    }
    htmlTable += '</tr>';
  }
  htmlTable += '</table><br>';
  htmlTable += htmlToAdd6('OT');
  htmlTable = $(htmlTable);
  htmlTable.appendTo('#hVerbClrs');
}

function addOTVerbSideBar() {
  var r = cf.getVariablesForOTVerbTable('H');
  var yAxisItems, descOfXAxisItems, descOfYAxisItems;
  yAxisItems = r.orderOfYAxisItems;
  descOfXAxisItems = r.descOfXAxisItems;
  descOfYAxisItems = r.descOfYAxisItems;
  var yAxisSpan = tableAxisSpan('Y', 'OT');
  var htmlTable = '';
  var htmlTable =
    '<table>' +
    '<tr><td><div class="modalonoffswitch">' +
      '<span class="onoffswitch2 pull-left">' +
      '<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="OTverb2onoffswitch" onchange="userToggleClrGrammar(\'OTverb2\')"/>' +
      '<label class="onoffswitch2-label" for="OTverb2onoffswitch">' +
        '<span class="onoffswitch2-inner"></span>' +
        '<span class="onoffswitch2-switch"></span>' +
      '</label>' +
      '</span>' +
      '</div>' +
    '</td>' +
    '<td>&nbsp;&nbsp;&nbsp;</td>' +
    '<td><h2>Hebrew Verbs</td></tr></table><table id="hebrewverbtable" class="clrTblWidth">';
  for (var i = 0; i < yAxisItems.length; i += 1) {
    htmlTable += '<tr>';
    var cssClass = 'formPreview' + i;
    if (c4[C_OT][C_yAxisOnOff][i])
      cssClass += ' ul' + c4[C_OT][C_slctUlVerbItem][i].replace(/\s/g, ""); 
    htmlTable += addTitleToYAxis(i, descOfYAxisItems[i], yAxisSpan, 'OT', true, /* paddingRequiredForSidebar */
      cssClass);
    htmlTable += '<td class="grmSlctBx">' + htmlToAdd5b(i, 'OT', false) +
    '<a class="form_info' +  i + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a>' +
    '</td>';
    htmlTable += '</tr>';
  }
  htmlTable += '<tr></tr>';
  htmlTable += addOtTitleToXAxisSideBar(descOfXAxisItems, cf.getVariablesForOTVerbTable('A').descOfXAxisItems, yAxisItems.length);
  htmlTable += htmlToAdd6('OT', true);
  htmlTable += '</table><br>';
  htmlTable = $(htmlTable);
  htmlTable.appendTo('#sideBarHVerbClrs');
}

function voicesInFormAndStem(yAxisNum, xAxisNum) {
  yAxisNum = yAxisNum * 3;
  return '<span class="vot_' + cv[C_ulOTVbCSS][xAxisNum][yAxisNum].name + '">active</span><br>' +
          '<span class="vot_' + cv[C_ulOTVbCSS][xAxisNum][yAxisNum+1].name + '">passive</span><br>' +
          '<span class="vot_' + cv[C_ulOTVbCSS][xAxisNum][yAxisNum+2].name + '">middle</span>';
}
  
// function userUpdateYAxisItem(itemNumberOfYAxis, nameOfUnderline) {
//   c4[C_Greek][C_slctUlVerbItem][itemNumberOfYAxis] = cc[C_canvasUnderlineName][nameOfUnderline];
//   cf.updtLocalStorage();
//   cf.createUlForAllItemsInYAndX();
//   updateHtmlForYAxis();
//   updatePreviewAtSideBar('tensePreview' + itemNumberOfYAxis, nameOfUnderline)
// }
  
// function userUpdateOTYAxisItem(itemNumberOfYAxis, nameOfUnderline) {
//   c4[C_OT][C_slctUlVerbItem][itemNumberOfYAxis] = cc[C_canvasUnderlineName][nameOfUnderline];
//   cf.updtLocalStorage();
//   cf.createUlForOTYAxis(itemNumberOfYAxis);
//   updatePreviewAtSideBar('formPreview' + itemNumberOfYAxis, nameOfUnderline)
// }

function updatePreviewAtSideBar(className, nameOfUnderline) {
  var element = $('.' + className);
  if (element.length > 0) {
    element.removeClass()
      .addClass(className)
      .addClass(nameOfUnderline)
      .addClass('sdBrRow');
    var altNameOfUnderline = nameOfUnderline;
    if (nameOfUnderline === 'ul2lines') altNameOfUnderline = 'ulDoubleSolid';
    else if (nameOfUnderline === 'ulUnderline') altNameOfUnderline = 'ulSolid';
    else if (nameOfUnderline === 'ulDots') altNameOfUnderline = 'ulDot';
    var srcImgObj = _.find(cv[C_uLBASEIMGS], function(obj) { return obj.name === altNameOfUnderline; });
    $('.' + nameOfUnderline).css('background', 'url(' + srcImgObj.img.src + ') repeat-x 100% 100%');
  }
}

function userSwapAxis() { // Do not shorten name
  var tmp = c4[C_Greek][C_verbTableXHeader];
  c4[C_Greek][C_verbTableXHeader] = c4[C_Greek][C_verbTableYHeader];
  c4[C_Greek][C_verbTableYHeader] = tmp;
  c4[C_Greek][C_xAxisForMood] = !c4[C_Greek][C_xAxisForMood];
  cf.updtLocalStorage();
  $('#sortAxisModal .close').click();
  var element = document.getElementById('sortAxisModal');
  if (element)
    element.parentNode.removeChild(element);
  updateAllSettingsAndInputFields();
}
  
function userSortAxis(axis) {
  cv[C_axisUserSelectedToSort] = axis;
  var openConfigPage = $('<div id="sortAxisModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel">' +
    '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('sortAxisModal');
  if (!temp) openConfigPage.appendTo('body');
  $('#sortAxisModal').modal('show').find('.modal-content').load('/html/sort_verb_item.html');
}

function userAddHeaderInfo(axis, ot) {
  var otPrefix = 'nt';
  if ((ot != undefined) && (ot == 'OT')) otPrefix = 'ot';
  $('#addHeaderInfoModal').remove();
  var openConfigPage = $('<div id="addHeaderInfoModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel">' +
    '<span id="uahi_testament" style="visibility:hidden">' + otPrefix + '</span>' +
    '<span id="uahi_axis" style="visibility:hidden">' + axis + '</span>' +
    '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('addHeaderInfoModal');
  if (!temp) openConfigPage.appendTo('body');
  $('#addHeaderInfoModal').modal('show').find('.modal-content').load('/html/add_header_to_color_config.html');
}

function userSortOTAxis(axis) {
  cv[C_axisUserSelectedToSort] = axis;
  var openConfigPage = $('<div id="sortAxisModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel">' +
    '<div class="modal-dialog"><div class="modal-content">');
  var temp = document.getElementById('sortAxisModal');
  if (!temp) openConfigPage.appendTo('body');
  $('#sortAxisModal').modal('show').find('.modal-content').load('/html/sort_ot_verb_item.html');
}

function userToggleXOrYAxisConfig(ot, axis, index) { // Do not shorten
  var otPrefix = '';
  if ((ot != undefined) && (ot == 'OT')) {
    otPrefix = 'OT';
    if (axis == 'X') c4[C_OT][C_xAxisOnOff][index] = !c4[C_OT][C_xAxisOnOff][index];
    else {
      c4[C_OT][C_yAxisOnOff][index] = !c4[C_OT][C_yAxisOnOff][index];
      if ($('#sideBarHVerbClrs').length > 0) {
        if (c4[C_OT][C_yAxisOnOff][index]) {
          var cssClass = 'ul' + c4[C_OT][C_slctUlVerbItem][index].replace(/\s/g, ""); 
          updatePreviewAtSideBar('formPreview' + index, cssClass);
        }
        else {
          $('.formPreview' + index).removeClass().addClass('sdBrRow').addClass('formPreview' + index);
          $('.formPreview' + index).css('background', "none");
        }
      }
    }
  }
  else {
    if ((c4[C_Greek][C_xAxisForMood] && axis == 'X') || (!c4[C_Greek][C_xAxisForMood] && axis == 'Y'))
      c4[C_Greek][C_moodsOnOff][index] = !c4[C_Greek][C_moodsOnOff][index];
    else {
      c4[C_Greek][C_tensesOnOff][index] = !c4[C_Greek][C_tensesOnOff][index];
      if ($('#sideBarVerbClrs').length > 0) {
        if (c4[C_Greek][C_tensesOnOff][index]) {
          var cssClass = 'ul' + c4[C_Greek][C_slctUlVerbItem][index].replace(/\s/g, ""); 
          updatePreviewAtSideBar('tensePreview' + index, cssClass);
        }
        else {
          $('.tensePreview' + index).removeClass().addClass('sdBrRow').addClass('tensePreview' + index);
          $('.tensePreview' + index).css('background', "none");
        }
      }
    }
  }
  cf.updtLocalStorage();
  enableOrDisableAxisConfigButtons(axis, otPrefix);
  cf.refreshClrGrammarCSS();
}

function userToggleClrGrammar(grammarFunction) { // Do not shorten
//    $(".colorOffWarning").closest("div").hide();
    $(".colorOffWarning").remove();
    var checkedValue = document.getElementById(grammarFunction + 'onoffswitch').checked;
    var wereAllColorCodeSelectionOff = ((typeof c4 === "object") && !c4[C_Greek][C_enableVerbClr] && !c4[C_enableGenderNumberClr] && !c4[C_OT][C_enableVerbClr]);
    if ((grammarFunction === 'verb') || (grammarFunction === 'verb2')) {
      c4[C_Greek][C_enableVerbClr] = checkedValue;
      cf.updtLocalStorage();
      updateVerbInputFields(checkedValue);
      if (grammarFunction === 'verb2') {
        if (checkedValue) {
          $("#greekverbtable").show();
          $("#greekverbexplaindoc").show();
          cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][0], cv[C_uLBASEIMGS][2], "#000000", 0, "passivePreview");
          cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][1], cv[C_uLBASEIMGS][2], "#000000", 0, "middlePreview");  
        }
        else {
          $("#greekverbtable").hide();
          $("#greekverbexplaindoc").hide();
          if (!c4[C_enableGenderNumberClr] && c4[C_OT][C_enableVerbClr]) {
            $("#sideBarHVerbClrs").show();
            if ($(".colorOffWarning").length == 0) {
              $($("#sideBarHVerbClrs").find("table")[0]).find("h2").after("<p class='colorOffWarning' style='color:red'>If you want to disable color code grammar, turn off Hebrew Verbs also.</p>");
              setTimeout(function() {
                $('.colorOffWarning').remove();
              }, 4500);
            }
          }
        }
      }
    }
    else if ((grammarFunction === 'gennum') || (grammarFunction === 'gennum2')) {
      updateNounInputFields(checkedValue);
      c4[C_enableGenderNumberClr] = checkedValue;
      cf.updtLocalStorage();
      cv[C_userTurnGenderNumberFromOffToOn] = checkedValue;
      if (grammarFunction === 'gennum2') {
        if (checkedValue)
          $('#gendernumbertable').show();
        else {
          $('#gendernumbertable').hide();
          if (!c4[C_Greek][C_enableVerbClr] && $("#sideBarVerbClrs").is(":visible") && c4[C_OT][C_enableVerbClr]) {
            $("#sideBarHVerbClrs").show();
            if ($(".colorOffWarning").length == 0)
              $($("#sideBarHVerbClrs").find("table")[0]).find("h2").after("<p class='colorOffWarning' style='color:red'>If you want to disable color code grammar, turn off Hebrew Verbs also.</p>")
          }
          if (!c4[C_OT][C_enableVerbClr] && $("#sideBarHVerbClrs").is(":visible") && c4[C_Greek][C_enableVerbClr]) {
            $("#sideBarVerbClrs").show();
            if ($(".colorOffWarning").length == 0) {
              $($("#sideBarVerbClrs").find("table")[0]).find("h2").after("<p class='colorOffWarning' style='color:red'>If you want to disable color code grammar, turn off Greek Verbs also.</p>");
              setTimeout(function() {
                $('.colorOffWarning').remove();
              }, 4500);
            }
          }
        }
      }
    }
    else if ((grammarFunction === 'OTverb') || (grammarFunction === 'OTverb2')) {
      c4[C_OT][C_enableVerbClr] = checkedValue;
      cf.updtLocalStorage();
      updateVerbInputFields(checkedValue, 'OT');
      if (grammarFunction === 'OTverb2') {
        if (checkedValue) {
          $('#hebrewverbtable').show();
          cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][2], cv[C_uLBASEIMGS][2], "#000000", 0, "otPassivePreview");
          cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][3], cv[C_uLBASEIMGS][2], "#000000", 0, "otMiddlePreview");  
        }
        else {
           $('#hebrewverbtable').hide();
           if (!c4[C_enableGenderNumberClr] && c4[C_Greek][C_enableVerbClr]) {
            $("#sideBarVerbClrs").show();
            if ($(".colorOffWarning").length == 0) {
              $($("#sideBarVerbClrs").find("table")[0]).find("h2").after("<p class='colorOffWarning' style='color:red'>If you want to disable color code grammar, turn off Greek Verbs also.</p>");
              setTimeout(function() {
                $('.colorOffWarning').remove();
              }, 4500);
            }
          }
        }
      }
    }
    var actPassage = step.util.activePassage();
    if (wereAllColorCodeSelectionOff && !step.util.isColorOptionEnabled(actPassage))
      actPassage.set("selectedOptions", actPassage.get("selectedOptions") + "C"); // Need to enable color in the URL options
    cf.refreshClrGrammarCSS();
    if ((grammarFunction === 'verb') && (checkedValue) && (cv[C_handleOfRequestedAnimation] === -1)) cf.goAnimate(0);
}

function userUpdateClr(itemNumber, color) {
  c4[C_Greek][C_inClrVerbItem][itemNumber] = color;
  cf.updtLocalStorage();
  cf.createUlForAllItemsInYAndX();
  cf.updateMoodPreview();
}

function userUpdateOTClr(itemNumber, color) {
  c4[C_OT][C_inClrVerbItem][itemNumber] = color;
  cf.updtLocalStorage();
  cf.createUlFor_OT();
  cf.updateStemPreview();
}

function userUpdateNounClr(gender, color) {
  if (gender == 'masculine') c4[C_inClrMasculine] = color;
  else if (gender == 'feminine') c4[C_inClrFeminine] = color;
  else if (gender == 'neuter') c4[C_inClrNeuter] = color;
  else alert('Error: userUpdateNounClr, cannot identify gender');
  cf.updtLocalStorage();
  var cssName = '';
  if (gender === 'masculine') cssName = '.mas';
  else if (gender === 'feminine') cssName = '.fem';
  else if (gender === 'neuter') cssName = '.neut';
  $(cssName).css({
    'color': color
  });
  cv[C_updatedGenderNumberCSS] = true;
}

function userUpdateNumber(type, fontHighlight) { // Do not shorten
  if (type == 'singular') c4[C_slctUlSingular] = fontHighlight;
  else if (type == 'plural') c4[C_slctUlPlural] = fontHighlight;
  else alert('Error: userUpdateNumber, cannot identify number type');
  cf.updtLocalStorage();
  cf.updateCssForNumber(type, fontHighlight);
}

function userUpdateAnimation(itemNumber) { // Do not shorten
    var arrayIndexOfCSSRelatedToItemSelected = [];
    var currentULForItem = c4[C_Greek][C_slctUlVerbItem][itemNumber];
    var tempIndexArray;
    if (c4[C_Greek][C_xAxisForMood]) tempIndexArray = cc[C_tenseIndexArray];
    else tempIndexArray = cc[C_moodIndexArray];
    var r = getVerbItemsCombinedWithCurrentItem('Y', itemNumber);
    for (var i = 0; i < r.nameOfItemCombinedWithCurrentItem.length; i ++) {
      arrayIndexOfCSSRelatedToItemSelected = arrayIndexOfCSSRelatedToItemSelected.concat(
        _.find(tempIndexArray, function(obj) { return obj.name == r.nameOfItemCombinedWithCurrentItem[i]; }).array );
    }
    var indexToUlVerbCSS;
    if ((document.getElementById('inAnimateCheckbox' + itemNumber).checked) &&
      (currentULForItem !== '2 lines') && (currentULForItem !== 'Underline')) {
      c4[C_Greek][C_inAnimate][itemNumber] = true;
      cf.updtLocalStorage();
      for (var j = 0; j < arrayIndexOfCSSRelatedToItemSelected.length; j += 1) {
        indexToUlVerbCSS = arrayIndexOfCSSRelatedToItemSelected[j];
        if (cv[C_animationIndexArray].indexOf(indexToUlVerbCSS) === -1) cv[C_animationIndexArray].push(indexToUlVerbCSS);
      }
    } else {
      c4[C_Greek][C_inAnimate][itemNumber] = false;
      cf.updtLocalStorage();
      for (var k = 0; k < arrayIndexOfCSSRelatedToItemSelected.length; k += 1) {
        indexToUlVerbCSS = arrayIndexOfCSSRelatedToItemSelected[k];
        var tempIdx = cv[C_animationIndexArray].indexOf(indexToUlVerbCSS);
        if (indexToUlVerbCSS >= 0) cv[C_animationIndexArray].splice(tempIdx, 1);
      }
    }
    cv[C_copyOfPassiveIndexArray] = cc[C_passiveIndexArray].slice(0);
    cv[C_copyOfMiddleIndexArray] = cc[C_middleIndexArray].slice(0);
    for (var counter = 0; counter < cv[C_animationIndexArray].length; counter += 1) {
      var tempIndex1 = cv[C_animationIndexArray][counter];
      var tempIndex2 = cv[C_copyOfPassiveIndexArray].indexOf(tempIndex1);
      if (tempIndex2 >= 0) cv[C_copyOfPassiveIndexArray].splice(tempIndex2, 1);
      tempIndex2 = cv[C_copyOfMiddleIndexArray].indexOf(tempIndex1);
      if (tempIndex2 >= 0) cv[C_copyOfMiddleIndexArray].splice(tempIndex2, 1);
    }
    if ((cv[C_animationIndexArray].length > 0) && (cv[C_handleOfRequestedAnimation] === -1))
      cf.goAnimate(0);
}

function userUpdatePassiveMiddleVoiceBkgrd(voice, otVerb) { // Do not shorten
  var otPrefix = ''; var c4Ref;
  if ((otVerb != undefined) && (otVerb != '')) {
    otPrefix = otVerb;
    c4Ref = c4[C_OT];
  }
  else c4Ref = c4[C_Greek];
  var ucVoice = cf.upCaseFirst(voice);
  if (document.getElementById('chkbx' + otPrefix + ucVoice + 'BkgrdClr').checked) {
    (voice == 'passive') ? c4Ref[C_chkbxPassiveBkgrdColrValue] = true : c4Ref[C_chkbxMiddleBkgrdColrValue] = true;
    $('#in' + otPrefix + ucVoice + 'BkgrdClr').spectrum('enable');
  } else {
    (voice == 'passive') ? c4Ref[C_chkbxPassiveBkgrdColrValue] = false : c4Ref[C_chkbxMiddleBkgrdColrValue] = false;
    $('#in' + otPrefix + ucVoice + 'BkgrdClr').spectrum('disable');
  }
  cf.updtLocalStorage();
  if (otVerb == 'OT') cf.createUlFor_OT();
  else updateVerbsBkgrd(voice);
}

function userEnablePassiveMiddleVerbsUnderline1(voice, otVerb) { // Do not shorten
  var otPrefix = '', c4Ref, checkedValue;
  if ((otVerb != undefined) && (otVerb != '')) {
    otPrefix = otVerb;
    c4Ref = c4[C_OT];
  }
  else c4Ref = c4[C_Greek];
  var ucVoice = cf.upCaseFirst(voice);
  if (document.getElementById('chkbx' + otPrefix + ucVoice + 'UlClr1').checked) {
    checkedValue = true;
    $('#in' + otPrefix + ucVoice + 'UlClr1').spectrum('enable');
    $('#chkbx' + otPrefix + ucVoice + 'UlClr2').show();
    $('#chkbx' + otPrefix + ucVoice + 'UlClr2').prop('disabled', false);
    userEnablePassiveMiddleVerbsUnderline2(voice, otVerb);
  } else {
    checkedValue = false;
    $('#in' + otPrefix + ucVoice + 'UlClr1').spectrum('disable');
    $('#in' + otPrefix + ucVoice + 'UlClr1').hide();
    $('#chkbx' + otPrefix + ucVoice + 'UlClr2').hide();
    $('#chkbx' + otPrefix + ucVoice + 'UlClr2').prop('disabled', true);
    $('#in' + otPrefix + ucVoice + 'UlClr2').spectrum('disable');
  }
  if (voice == 'passive') {
    c4Ref[C_chkbxPassiveUlColr1Value] = checkedValue;
    if (otPrefix == '') c4Ref[C_chkbxPassiveUlClr2] = checkedValue;
  }
  else if (voice == 'middle') {
    c4Ref[C_chkbxMiddleUlColr1Value] = checkedValue;
    if (otPrefix == '') c4Ref[C_chkbxMiddleUlClr2] = checkedValue;
  }
  cf.updtLocalStorage();
  if (otPrefix == 'OT') cf.createUlFor_OT();
  else updateVerbsBkgrd(voice);
}

function userEnablePassiveMiddleVerbsUnderline2(voice, otVerb) { // Do not shorten name
  var otPrefix = '';
  if ((otVerb != undefined) && (otVerb != '')) return;
  var ucVoice = cf.upCaseFirst(voice);
  if (document.getElementById('chkbx' + otPrefix + ucVoice + 'UlClr2').checked) {
    (voice == 'passive') ? c4[C_Greek][C_chkbxPassiveUlColr2Value] = true : c4[C_Greek][C_chkbxMiddleUlColr2Value] = true;
    cf.updtLocalStorage();
    $('#in' + otPrefix + ucVoice + 'UlClr2').spectrum('enable');
    if (cv[C_handleOfRequestedAnimation] === -1) cf.goAnimate(0);
  } else {
    (voice == 'passive') ? c4[C_Greek][C_chkbxPassiveUlColr2Value] = false : c4[C_Greek][C_chkbxMiddleUlColr2Value] = false;
    cf.updtLocalStorage();
    $('#in' + otPrefix + ucVoice + 'UlClr2').spectrum('disable');
  }
}

function enableOrDisableVerbAndNounButtons() {
    var checkedValue = c4[C_Greek][C_enableVerbClr];
    $('#verbonoffswitch').prop('checked', checkedValue);
    updateVerbInputFields(checkedValue);
    checkedValue = c4[C_enableGenderNumberClr];
    $('#gennumonoffswitch').prop('checked', checkedValue);
    updateNounInputFields(checkedValue);
    checkedValue = c4[C_OT][C_enableVerbClr];
    updateVerbInputFields(checkedValue, 'OT');
    $('#OTverbonoffswitch').prop('checked', checkedValue);
}

function enableOrDisableVerbAndNounButtonsSideBar() {
  var checkedValue = c4[C_Greek][C_enableVerbClr];
  $('#verb2onoffswitch').prop('checked', checkedValue);
  updateVerbInputFields(checkedValue);
  checkedValue = c4[C_enableGenderNumberClr];
  $('#gennum2onoffswitch').prop('checked', checkedValue);
  updateNounInputFields(checkedValue);
  checkedValue = c4[C_OT][C_enableVerbClr];
  updateVerbInputFields(checkedValue, 'OT');
  $('#OTverb2onoffswitch').prop('checked', checkedValue);
}

function enableOrDisableAxisConfigButtons(axis, ot) {
  var otPrefix = '', itemInAxisOnOff, ulVerbCSSArrayOfAxis, itemToCombineWithPrevious;
  if ((ot != undefined) && (ot == 'OT')) otPrefix = 'OT';
  var onOffClassName = '.' + otPrefix + 'vrbInpt' + axis;
  var onOffCheckBox = otPrefix + 'axis' + axis + 'OnOffCheckbox';
  if (otPrefix == '') {
    var r = cf.getVariablesForVerbTable();
    var moodOrTense = r[axis.toLowerCase() + 'AxisTitle'];
    moodOrTense = moodOrTense.substr(0, moodOrTense.length - 1);
    var ucMoodOrTense = cf.upCaseFirst(moodOrTense);
    var orderOfItemsInAxis = r['orderOf' + axis + 'AxisItems'];
    var nameOfAllItemsInAxis = r['nameOfAll' + axis + 'AxisItems'];
    if (moodOrTense == 'mood') {
      itemInAxisOnOff = c4[C_Greek][C_moodsOnOff];
      ulVerbCSSArrayOfAxis = cc[C_moodIndexArray];
      itemToCombineWithPrevious = c4[C_Greek][C_moodToCombineWithPrevious];
    }
    else {
      itemInAxisOnOff = c4[C_Greek][C_tensesOnOff];
      ulVerbCSSArrayOfAxis = cc[C_tenseIndexArray];
      itemToCombineWithPrevious = c4[C_Greek][C_tenseToCombineWithPrevious];
    }
    hideIndividualInputField(onOffClassName, true);
    for (var i = 0; i < orderOfItemsInAxis.length; i += 1) {
      $('#' + onOffCheckBox + i).prop('checked', itemInAxisOnOff[i]);
    }
    var k = -1;
    for (var counter = 0; counter < nameOfAllItemsInAxis.length; counter ++) {
      if (!itemToCombineWithPrevious[counter]) k++;
      var currentItemInAxisOnOff = itemInAxisOnOff[k];
      var index2 = _.find(ulVerbCSSArrayOfAxis, function(obj) { return obj.name == nameOfAllItemsInAxis[counter]; }).array;
      for (var j = 0; j < index2.length; j += 1) {
        cv[C_ulVerbCSS][index2[j]]['displayStatusBy' + ucMoodOrTense] = currentItemInAxisOnOff;
      }
    }
  }
  else if (otPrefix == 'OT') {
    hideIndividualInputField(onOffClassName, true);
    if (axis == 'Y')
      for (var counter3 = 0; counter3 < cv[C_ulOTVbCSS].length; counter3 += 1) {
        $('#' + onOffCheckBox + counter3).prop('checked', c4[C_OT][C_yAxisOnOff][counter3]);
      }
    else if (axis == 'X') {
      for (var counter4 = 0; counter4 < cv[C_ulOTVbCSS][0].length; counter4 += 1) {
        if ((counter4 % 3) == 0) $('#' + onOffCheckBox + (counter4/3)).prop('checked', c4[C_OT][C_xAxisOnOff][counter4/3]);
      }
    }
  }
}

function checkNounClr() {
    var currentClrPicker = $('#inClrMasculine').spectrum('get').toHexString();
    if (c4[C_inClrMasculine] != currentClrPicker)
      userUpdateNounClr('masculine', currentClrPicker);
    currentClrPicker = $('#inClrFeminine').spectrum('get').toHexString();
    if (c4[C_inClrFeminine] != currentClrPicker)
      userUpdateNounClr('feminine', currentClrPicker);
    currentClrPicker = $('#inClrNeuter').spectrum('get').toHexString();
    if (c4[C_inClrNeuter] != currentClrPicker)
      userUpdateNounClr('feminine', currentClrPicker);
}

function checkVerbClrInput() {
  var currentClr, currentClrPicker;
  for (var i = 0; i < cf.getVariablesForVerbTable().orderOfXAxisItems.length; i ++) {
    currentClr = c4[C_Greek][C_inClrVerbItem][i];
    currentClrPicker = $('#inClrVerbItem' + i).spectrum("get").toHexString();
    if (currentClr != currentClrPicker) userUpdateClr(i, currentClrPicker);
  }
  for (var counter = 0; counter < cf.getVariablesForOTVerbTable('H').orderOfXAxisItems.length; counter ++) {
    currentClr = c4[C_OT][C_inClrVerbItem][counter];
    currentClrPicker = $('#inClrOTVerbItem' + counter).spectrum("get").toHexString();
    if (currentClr != currentClrPicker) userUpdateOTClr(counter, currentClrPicker);
  }
  currentClr = c4[C_Greek][C_inMiddleBkgrdClr];
  currentClrPicker = $('#inMiddleBkgrdClr').spectrum("get").toHexString();
  var colorForMiddleWasUpdated = false;
  if (currentClr != currentClrPicker) {
    c4[C_Greek][C_inMiddleBkgrdClr] = currentClrPicker;
    cf.updtLocalStorage();
    colorForMiddleWasUpdated = true;
  }
  var colorIDObj = $('#inMiddleUlClr1');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_Greek][C_inMiddleUlClr1];
    currentClrPicker = colorIDObj.spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_Greek][C_inMiddleUlClr1] = currentClrPicker;
      cf.updtLocalStorage();
      colorForMiddleWasUpdated = true;
    }
  }
  var colorIDObj = $('#inMiddleUlClr2');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_Greek][C_inMiddleUlClr2];
    currentClrPicker = colorIDObj.spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_Greek][C_inMiddleUlClr2] = currentClrPicker;
      cf.updtLocalStorage();
      colorForMiddleWasUpdated = true;
    }
  }
  if (colorForMiddleWasUpdated) updateVerbsBkgrd('middle');
  currentClr = c4[C_Greek][C_inPassiveBkgrdClr];
  currentClrPicker = $('#inPassiveBkgrdClr').spectrum("get").toHexString();
  var colorForPassiveWasUpdated = false;
  if (currentClr != currentClrPicker) {
    c4[C_Greek][C_inPassiveBkgrdClr] = currentClrPicker;
    cf.updtLocalStorage();
    colorForPassiveWasUpdated = true;
  }
  var colorIDObj = $('#inPassiveUlClr1');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_Greek][C_inPassiveUlClr1];
    currentClrPicker = colorIDObj.spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_Greek][C_inPassiveUlClr1] = currentClrPicker;
      cf.updtLocalStorage();
      colorForPassiveWasUpdated = true;
    }
  }
  var colorIDObj = $('#inPassiveUlClr2');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_Greek][C_inPassiveUlClr2];
    currentClrPicker = colorIDObj.spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_Greek][C_inPassiveUlClr2] = currentClrPicker;
      cf.updtLocalStorage();
      colorForPassiveWasUpdated = true;
    }
  }
  if (colorForPassiveWasUpdated) updateVerbsBkgrd('passive');
  if (colorForMiddleWasUpdated) updateVerbsBkgrd('middle');

  currentClr = c4[C_OT][C_inMiddleBkgrdClr];
  currentClrPicker = $('#inOTMiddleBkgrdClr').spectrum("get").toHexString();
  var colorForOTWasUpdated = false;
  if (currentClr != currentClrPicker) {
    c4[C_OT][C_inMiddleBkgrdClr] = currentClrPicker;
    cf.updtLocalStorage();
    colorForOTWasUpdated = true;
  }
  var colorIDObj = $('#inOTMiddleUlClr1');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_OT][C_inMiddleUlClr1];
    currentClrPicker = colorIDObj.spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_OT][C_inMiddleUlClr1] = currentClrPicker;
      cf.updtLocalStorage();
      colorForOTWasUpdated = true;
    }
  }
  currentClr = c4[C_OT][C_inPassiveBkgrdClr];
  currentClrPicker = $('#inOTPassiveBkgrdClr').spectrum("get").toHexString();
  if (currentClr != currentClrPicker) {
    c4[C_OT][C_inPassiveBkgrdClr] = currentClrPicker;
    cf.updtLocalStorage();
    colorForOTWasUpdated = true;
  }
  var colorIDObj = $('#inOTPassiveUlClr1');
  if (colorIDObj.length == 1) {
    currentClr = c4[C_OT][C_inPassiveUlClr1];
    currentClrPicker = $('#inOTPassiveUlClr1').spectrum("get").toHexString();
    if (currentClr != currentClrPicker) {
      c4[C_OT][C_inPassiveUlClr1] = currentClrPicker;
      cf.updtLocalStorage();
      colorForOTWasUpdated = true;
    }
  }
  if (colorForOTWasUpdated) cf.createUlFor_OT();
}

function updateHtmlForYAxis() {
  var currentULForItem;
  var numOfRows = cf.getVariablesForVerbTable().nameOfYAxisItems.length;
  for (var i = 0; i < numOfRows; i += 1) {
    currentULForItem = c4[C_Greek][C_slctUlVerbItem][i];

    $('#slctUlVerbItem' + i + ' option')
      .filter(function() {
        return $.trim($(this).text()) === cc[C_underlineCharsInSelectDropdown][currentULForItem];
      })
      .prop('selected', true);
    if ($('#inAnimate' + i).length == 1) {
      var temp = ((currentULForItem !== '2 lines') && (currentULForItem !== 'Underline') );
      hideIndividualInputField('#inAnimate' + i, temp);
      hideIndividualInputField('#inAnimateCheckbox' + i, temp);
      if (c4[C_Greek][C_inAnimate][i]) {
        document.getElementById('inAnimateCheckbox' + i).checked = true;
        if ((currentULForItem !== '2 lines') && (currentULForItem !== 'Underline'))
          userUpdateAnimation(i);
      } else document.getElementById('inAnimateCheckbox' + i).checked = false;
    }
  }
  numOfRows = cf.getVariablesForOTVerbTable('H').nameOfYAxisItems.length;
  for (var counter = 0; counter < numOfRows; counter += 1) {
    currentULForItem = c4[C_OT][C_slctUlVerbItem][counter];
    $('#slctUlOTVerbItem' + counter + ' option')
      .filter(function() {
        return $.trim($(this).text()) == cc[C_underlineCharsInSelectDropdown][currentULForItem];
      })
      .prop('selected', true);
  }
}

function updateHtmlForXAxis() {
  var numOfColumns = cf.getVariablesForVerbTable().orderOfXAxisItems.length;
  if (numOfColumns > -1)
    $('#inClrVerbItem0').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][0],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(0, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  if (numOfColumns > 0)
    $('#inClrVerbItem1').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][1],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(1, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  if (numOfColumns > 1)
    $('#inClrVerbItem2').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][2],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(2, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  if (numOfColumns > 2)
    $('#inClrVerbItem3').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][3],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(3, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  if (numOfColumns > 3)
    $('#inClrVerbItem4').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][4],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(4, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  if (numOfColumns > 4)
    $('#inClrVerbItem5').spectrum({
      color: c4[C_Greek][C_inClrVerbItem][5],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateClr(5, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput();
      }
    });
  numOfColumns = cf.getVariablesForOTVerbTable('H').orderOfXAxisItems.length;
  if (numOfColumns > -1)
    $('#inClrOTVerbItem0').spectrum({
      color: c4[C_OT][C_inClrVerbItem][0],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(0, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
  if (numOfColumns > 0)
    $('#inClrOTVerbItem1').spectrum({
      color: c4[C_OT][C_inClrVerbItem][1],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(1, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
  if (numOfColumns > 1)
    $('#inClrOTVerbItem2').spectrum({
      color: c4[C_OT][C_inClrVerbItem][2],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(2, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
  if (numOfColumns > 2)
    $('#inClrOTVerbItem3').spectrum({
      color: c4[C_OT][C_inClrVerbItem][3],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(3, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
  if (numOfColumns > 3)
    $('#inClrOTVerbItem4').spectrum({
      color: c4[C_OT][C_inClrVerbItem][4],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(4, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
  if (numOfColumns > 4)
    $('#inClrOTVerbItem5').spectrum({
      color: c4[C_OT][C_inClrVerbItem][5],
      showInput: true,
      preferredFormat: 'hex',
      clickoutFiresChange: false,
      change: function(color) {
        userUpdateOTClr(5, color.toHexString());
      },
      show: function(color) {
        checkVerbClrInput('OT');
      }
    });
}

function updateHtmlForGender() {
  $('#inClrMasculine').spectrum({
    color: c4[C_inClrMasculine],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounClr('masculine', color.toHexString());
    },
    show: function(color) {
      checkNounClr();
    }
  });
  $('#inClrFeminine').spectrum({
    color: c4[C_inClrFeminine],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounClr('feminine', color.toHexString());
    },
    show: function(color) {
      checkNounClr();
    }
  });
  $('#inClrNeuter').spectrum({
    color: c4[C_inClrNeuter],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      userUpdateNounClr('neuter', color.toHexString());
    },
    show: function(color) {
      checkNounClr();
    }
  });
}

function updateHtmlForNumber() {
  $('#slctUlPlural option')
    .filter(function() {
      return $.trim($(this).text()) == cf.upCaseFirst(c4[C_slctUlPlural]);
    })
    .attr('selected', true);
  $('#slctUlSingular option')
    .filter(function() {
      return $.trim($(this).text()) == cf.upCaseFirst(c4[C_slctUlSingular]);
    })
    .attr('selected', true);
}

function updateHtmlForPassiveBkgrdClr() {
  $('#inPassiveBkgrdClr').spectrum({
    color: c4[C_Greek][C_inPassiveBkgrdClr],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inPassiveBkgrdClr] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('passive');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inPassiveUlClr1').spectrum({
    color: c4[C_Greek][C_inPassiveUlClr1],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inPassiveUlClr1] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('passive');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inPassiveUlClr2').spectrum({
    color: c4[C_Greek][C_inPassiveUlClr2],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inPassiveUlClr2] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('passive');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });

  $('#inOTPassiveBkgrdClr').spectrum({
    color: c4[C_OT][C_inPassiveBkgrdClr],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_OT][C_inPassiveBkgrdClr] = color.toHexString();
      cf.updtLocalStorage();
      cf.createUlFor_OT();
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inOTPassiveUlClr1').spectrum({
    color: c4[C_OT][C_inPassiveUlClr1],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_OT][C_inPassiveUlClr1] = color.toHexString();
      cf.updtLocalStorage();
      cf.createUlFor_OT();
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
}

function updateHtmlForMiddleBkgrdClr() {
  $('#inMiddleBkgrdClr').spectrum({
    color: c4[C_Greek][C_inMiddleBkgrdClr],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inMiddleBkgrdClr] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('middle');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inMiddleUlClr1').spectrum({
    color: c4[C_Greek][C_inMiddleUlClr1],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inMiddleUlClr1] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('middle');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inMiddleUlClr2').spectrum({
    color: c4[C_Greek][C_inMiddleUlClr2],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_Greek][C_inMiddleUlClr2] = color.toHexString();
      cf.updtLocalStorage();
      updateVerbsBkgrd('middle');
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inOTMiddleBkgrdClr').spectrum({
    color: c4[C_OT][C_inMiddleBkgrdClr],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_OT][C_inMiddleBkgrdClr] = color.toHexString();
      cf.updtLocalStorage();
      cf.createUlFor_OT();
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
  $('#inOTMiddleUlClr1').spectrum({
    color: c4[C_OT][C_inMiddleUlClr1],
    showInput: true,
    preferredFormat: 'hex',
    clickoutFiresChange: false,
    change: function(color) {
      c4[C_OT][C_inMiddleUlClr1] = color.toHexString();
      cf.updtLocalStorage();
      cf.createUlFor_OT();
    },
    show: function(color) {
      checkVerbClrInput();
    }
  });
}

function hideOrShowHtmlForPassiveBkgrdClr(passiveBkgrdName, otPrefix) {
  var checkedValue, checkBox, c4Ref;
  if ((otPrefix !== null) && (otPrefix == 'OT')) {
    c4Ref = c4[C_OT];
  }
  else {
    c4Ref = c4[C_Greek];
    otPrefix = '';
  }
  if (passiveBkgrdName == 'PassiveBkgrdClr') {
    checkBox = c4Ref[C_chkbxPassiveBkgrdClr];
    checkedValue = c4Ref[C_chkbxPassiveBkgrdColrValue];
  }
  else if (passiveBkgrdName == 'PassiveUlClr1') {
    checkBox = c4Ref[C_chkbxPassiveUlClr1];
    checkedValue = c4Ref[C_chkbxPassiveUlColr1Value];
  }
  else if (passiveBkgrdName == 'PassiveUlClr2') {
    checkBox = c4Ref[C_chkbxPassiveUlClr2];
    checkedValue = c4Ref[C_chkbxPassiveUlColr2Value];
  }
  else if (passiveBkgrdName == 'MiddleBkgrdClr') {
    checkBox = c4Ref[C_chkbxMiddleBkgrdClr];
    checkedValue = c4Ref[C_chkbxMiddleBkgrdColrValue];
  }
  else if (passiveBkgrdName == 'MiddleUlClr1') {
    checkBox = c4Ref[C_chkbxMiddleUlClr1];
    checkedValue = c4Ref[C_chkbxMiddleUlColr1Value];
  }
  else if (passiveBkgrdName == 'MiddleUlClr2') {
    checkBox = c4Ref[C_chkbxMiddleUlClr2];
    checkedValue = c4Ref[C_chkbxMiddleUlColr2Value];
  }
  passiveBkgrdName = otPrefix + passiveBkgrdName;
  $('#chkbx' + passiveBkgrdName).prop('checked', checkedValue);
  if (checkBox) {
    $('#chkbx' + passiveBkgrdName).show();
    $('#chkbx' + passiveBkgrdName).prop('disabled', false);
    if ($('#in' + passiveBkgrdName).length) {
      if (checkedValue) $('#in' + passiveBkgrdName).spectrum('enable');
      else $('#in' + passiveBkgrdName).spectrum('disable');
    }
  } else {
    $('#chkbx' + passiveBkgrdName).hide();
    $('#chkbx' + passiveBkgrdName).prop('disabled', true);
    if ($('#in' + passiveBkgrdName).length)
      $('#in' + passiveBkgrdName).spectrum('disable');
  }
}

function cancelClrChanges() { // Do not shorten
  var previousEnableGenderNumberClr = c4[C_enableGenderNumberClr];
  var tmp = step.util.localStorageGetItem('colorCode-PreviousSettings');
  if (tmp) c4 = JSON.parse(tmp);
  else c4 = cf.createC4();
  cf.updtLocalStorage();
  if ((!previousEnableGenderNumberClr) && (c4[C_enableGenderNumberClr])) cv[C_userTurnGenderNumberFromOffToOn] = true;
  alert('Your color settings has been reset to your previous setting.');
  updateAllSettingsAndInputFields();
}

function resetClrConfig() { // Do not shorten
  var previousEnableGenderNumberClr = c4[C_enableGenderNumberClr];
  c4 = cf.createC4();
  cf.updtLocalStorage();
  if ((!previousEnableGenderNumberClr) && (c4[C_enableGenderNumberClr])) cv[C_userTurnGenderNumberFromOffToOn] = true;
  alert('Your color settings has been reset to default setting.');
  updateAllSettingsAndInputFields();
}

function closeClrConfig() { // Do not shorten
  step.util.closeModal("grammarClrModal");
  initializeClrCodeSidebar(); // The color code configuration modal is called by a user click from the sidebar.  Assuming the user has updated the color, update the colors in the sidebar.
}

function updateAllSettingsAndInputFields() {
  cv[C_animationIndexArray] = [];
  cv[C_copyOfPassiveIndexArray] = cc[C_passiveIndexArray].slice(0);
  cv[C_copyOfMiddleIndexArray] = cc[C_middleIndexArray].slice(0);
  updateVerbsBkgrd('active');
  updateVerbsBkgrd('passive');
  updateVerbsBkgrd('middle');
  cf.createUlForAllItemsInYAndX();
  cf.createUlFor_OT();
  $('#grammarClrModal').modal({
    show: false
  });
  step.util.showConfigGrammarColor();
}

function updateNounInputFields(inputOnOff) {
    hideIndividualInputField('.nInptN', inputOnOff);
    hideOrDisplayIndividualClrInputField('.nInptC', inputOnOff);
}

function hideIndividualInputField(fieldName, inputOnOff, skipShow) {
  if ($(fieldName).length == 0) return;
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

function hideOrDisplayIndividualClrInputField(fieldName, inputOnOff) {
    if (inputOnOff) $(fieldName).spectrum('enable');
    else $(fieldName).spectrum('disable');
}

function updateVerbInputFields(inputOnOff, ot) {
    var otPrefix = '';
    if ((ot != undefined) && (ot == 'OT')) otPrefix = 'OT';

    hideOrDisplayIndividualClrInputField('.' + otPrefix + 'vrbInptC', inputOnOff);
    hideIndividualInputField('.' + otPrefix + 'vrbInpt1', inputOnOff);
    if (otPrefix != 'OT') {

      var showAnimationCheckbox = inputOnOff && ($("#grammarClrModal").length > 0); // Advanced color config modal is on
      hideIndividualInputField('#inAnimate0', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimate1', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimate2', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimate3', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimate4', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimate5', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox0', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox1', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox2', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox3', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox4', showAnimationCheckbox, true);
      hideIndividualInputField('#inAnimateCheckbox5', showAnimationCheckbox, true);
      if (c4[C_Greek][C_xAxisForMood]) {
        hideIndividualInputField('.vrbInptX', inputOnOff);
        hideIndividualInputField('.vrbInptY', inputOnOff);
      }
      else {
        hideIndividualInputField('.vrbInptX', inputOnOff);
        hideIndividualInputField('.vrbInptY', inputOnOff);
      }
      hideOrShowHtmlForPassiveBkgrdClr('PassiveUlClr2');
      hideOrShowHtmlForPassiveBkgrdClr('MiddleUlClr2');
    }
    hideOrShowHtmlForPassiveBkgrdClr('PassiveBkgrdClr', otPrefix);
    hideOrShowHtmlForPassiveBkgrdClr('PassiveUlClr1', otPrefix);
    hideOrShowHtmlForPassiveBkgrdClr('MiddleBkgrdClr', otPrefix);
    hideOrShowHtmlForPassiveBkgrdClr('MiddleUlClr1', otPrefix);
    if (!inputOnOff) { // Turning on the passive colors is more complex and is handled by other routines.
      hideOrDisplayIndividualClrInputField('#in' + otPrefix + 'PassiveBkgrdClr', inputOnOff);
      hideOrDisplayIndividualClrInputField('#in' + otPrefix + 'PassiveUlClr1', inputOnOff);
      hideIndividualInputField('#chkbx' + otPrefix + 'PassiveBkgrdClr', inputOnOff);
      hideIndividualInputField('#chkbx' + otPrefix + 'PassiveUlClr1', inputOnOff);
      hideIndividualInputField('#chkbxPassiveUlClr2', inputOnOff);
      hideOrDisplayIndividualClrInputField('#in' + otPrefix + 'MiddleBkgrdClr', inputOnOff);
      hideOrDisplayIndividualClrInputField('#in' + otPrefix + 'MiddleUlClr1', inputOnOff);
      hideIndividualInputField('#chkbx' + otPrefix + 'MiddleBkgrdClr', inputOnOff);
      hideIndividualInputField('#chkbx' + otPrefix + 'MiddleUlClr1', inputOnOff);
      if (otPrefix != 'OT') {
        hideOrDisplayIndividualClrInputField('#inPassiveUlClr2', inputOnOff);
        hideOrDisplayIndividualClrInputField('#inMiddleUlClr2', inputOnOff);
        hideIndividualInputField('#chkbxMiddleUlClr2', inputOnOff);
      }
    }
}

function updateVerbsBkgrd(voice) {
  var selectedUnderline, selectedClr;
  var indexArray = [];
  if (voice === 'passive') indexArray = cc[C_passiveIndexArray];
  else if (voice === 'middle') indexArray = cc[C_middleIndexArray];
  else if (voice === 'active') indexArray = cc[C_activeIndexArray];
  for (var counter = 0; counter < indexArray.length; counter += 1) {
    var indexToUlVerbCSS = indexArray[counter];
    var orderOfXAxis = getAxisOrderOfCSS(cv[C_ulVerbCSS][indexToUlVerbCSS].name, 'X');
    var orderOfYAxis = getAxisOrderOfCSS(cv[C_ulVerbCSS][indexToUlVerbCSS].name, 'Y');
    if (c4[C_Greek][C_xAxisForMood]) {
      selectedUnderline = cc[C_underlineCanvasName][c4[C_Greek][C_slctUlVerbItem][orderOfYAxis]];
      selectedClr = c4[C_Greek][C_inClrVerbItem][orderOfXAxis];
    }
    else {
      selectedUnderline = cc[C_underlineCanvasName][c4[C_Greek][C_slctUlVerbItem][orderOfXAxis]];
      selectedClr = c4[C_Greek][C_inClrVerbItem][orderOfYAxis];
    }
    var srcImgObj = _.find(cv[C_uLBASEIMGS], function(obj) { return obj.name == selectedUnderline; });
    cf.updateUlForSpecificYAxis(cv[C_ulVerbCSS][indexToUlVerbCSS], srcImgObj, selectedClr, indexToUlVerbCSS);
  }
  cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][0], cv[C_uLBASEIMGS][2], "#000000", 0, "passivePreview");
  cf.createUlForOneInstanceOfTense(cv[C_ulVoiceBaseImgs][1], cv[C_uLBASEIMGS][2], "#000000", 0, "middlePreview");
}

function getVerbItemsCombinedWithCurrentItem(axis, itemNumber) {
  var codeOfItemCombinedWithCurrentItem = [], nameOfItemCombinedWithCurrentItem = [];
  var orderOfItem, itemsCombinedWithPreviousItem, robinsonCode;
  if ( ((c4[C_Greek][C_xAxisForMood]) && (axis == 'X')) ||
        ((!c4[C_Greek][C_xAxisForMood]) && (axis == 'Y')) ) {
    orderOfItem = c4[C_Greek][C_orderOfMood];
    itemsCombinedWithPreviousItem = c4[C_Greek][C_moodToCombineWithPrevious];
    robinsonCode = cc[C_robinsonCodeOfMood];
  }
  else {
    orderOfItem = c4[C_Greek][C_orderOfTense];
    itemsCombinedWithPreviousItem = c4[C_Greek][C_tenseToCombineWithPrevious];
    robinsonCode = cc[C_robinsonCodeOfTense];
  }
  var codeOfCurrentItem = cf.getVariablesForVerbTable()['orderOf' + axis + 'AxisItems'][itemNumber];
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
  };
}

function getAxisOrderOfCSS(cssName, axis) {
  var positionInOrderOfMoodOrTense, moodOrTense;
  if ( ((!c4[C_Greek][C_xAxisForMood]) && (axis == 'X')) ||
        ((c4[C_Greek][C_xAxisForMood]) && (axis == 'Y')) ) {
    moodOrTense = 'tense';
    positionInOrderOfMoodOrTense = c4[C_Greek][C_orderOfTense].indexOf(cssName.substr(0, 1));
  }
  else {
    moodOrTense = 'mood';
    positionInOrderOfMoodOrTense = c4[C_Greek][C_orderOfMood].indexOf(cssName.substr(2, 1));
  }
  return cf.getAxisOrderOfItem(moodOrTense, positionInOrderOfMoodOrTense);
}

function addVerbTable() {
  var r = cf.getVariablesForVerbTable();
  var xAxisItems, yAxisItems, descOfXAxisItems, descOfYAxisItems;
  xAxisItems = r.orderOfXAxisItems;
  yAxisItems = r.orderOfYAxisItems;
  descOfXAxisItems = r.descOfXAxisItems;
  descOfYAxisItems = r.descOfYAxisItems;
  var htmlTable = '';
  var yAxisSpan = tableAxisSpan('Y');
  htmlTable += '<table class="tg2"><tr><th valign="middle" align="center" colspan="' +
    yAxisSpan + '" rowspan="' + tableAxisSpan('X') + '">';
  htmlTable += htmlToAdd1();
  htmlTable += '</th><th class="tg-amwm2" colspan="' + xAxisItems.length + '">' + cf.upCaseFirst(r.xAxisTitle);
  htmlTable += htmlToAdd2(r.xAxisTitle);
  htmlTable += '</th></tr>';
  htmlTable += addTitleToXAxis(descOfXAxisItems);
  htmlTable += '<tr>' +
    '<td class="tg-e3zv2" rowspan="' + yAxisItems.length + '">' + cf.upCaseFirst(r.yAxisTitle);
  htmlTable += htmlToAdd4(r.yAxisTitle);
  htmlTable += '</td>';
  for (var i = 0; i < yAxisItems.length; i += 1) {
    if (i > 0) htmlTable += '<tr>';
    htmlTable += addTitleToYAxis(i, descOfYAxisItems[i], yAxisSpan);
    htmlTable += htmlToAdd5a(i, "") + htmlToAdd5b(i, "", true) + '</td>';
    htmlTable += '</td>';
    for (var counter = 0; counter < xAxisItems.length; counter += 1) {
      htmlTable += '<td>';
      var allTM = getAllTenseMoodForThisGroup(r, counter, i);
      htmlTable += voicesInTenseAndMood(allTM.x, allTM.y);
      htmlTable += '</td>';
    }
    htmlTable += '</tr>';
  }
  htmlTable += '</table><br>';
  htmlTable += htmlToAdd6("");
  htmlTable = $(htmlTable);
  htmlTable.appendTo('#verbClrs');
}

function htmlToAdd1(otVerb) {
  var otPrefix = '';
  if (otVerb !== undefined) otPrefix = 'OT';
  return '<div class="onoffswitch">' +
  '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="' + otPrefix + 'verbonoffswitch" onchange=\'userToggleClrGrammar("' + otPrefix + 'verb")\'/>' +
  '<label class="onoffswitch-label" for="' + otPrefix + 'verbonoffswitch">' +
      '<span class="onoffswitch-inner"></span>' +
      '<span class="onoffswitch-switch"></span>' +
  '</label></div>';
}

function htmlToAdd2(xAxisTitle, otVerb) {
  var otPrefix = '';
  if (otVerb !== undefined) otPrefix = 'OT';
  return '&nbsp;&nbsp;<button id="' + otPrefix + 'configSortXAxisBtn" class="btn btn-default btn-xs ' +
    otPrefix + 'vrbInpt1" type="button" title="Sort ' +  xAxisTitle + '" onclick="userSort' + otPrefix + 'Axis(\'X\')">' +
    '<span id="configSortXAxisIcon" class="glyphicon glyphicon-sort"></span></button>';
}

function htmlToAdd3a(i, otVerb, toggleOnOff) {
  var otPrefix = '', result = '', c4Ref;
  if (otVerb === "OT") {
    otPrefix = 'OT';
    c4Ref = c4[C_OT];
  }
  else c4Ref = c4[C_Greek];
  var displayStyle = (toggleOnOff) ? ' ' : ' style="display:none" ';
  result = '<input' + displayStyle + 'id="' + otPrefix + 'axisXOnOffCheckbox' + i + '" class="' + otPrefix + 'vrbInptX grmChkBx" ' +
    'type="checkbox" onchange=\'userToggleXOrYAxisConfig("' + otPrefix + '", "X", "' + i + '")\'>';
  return result;
}

function htmlToAdd3b(i, otVerb, toggleOnOff) {
  var otPrefix = '', result = '', c4Ref;
  if (otVerb === "OT") {
    otPrefix = 'OT';
    c4Ref = c4[C_OT];
  }
  else c4Ref = c4[C_Greek];
  if (toggleOnOff) result += '<br>';
  result += '<input id="inClr' + otPrefix + 'VerbItem' + i + '" class="' + otPrefix + 'vrbInptC" type="color" ' +
    'value="' + c4Ref[C_inClrVerbItem][i] + '" ';
  return result;
}

function htmlToAdd4(yAxisTitle, otVerb) {
  var otPrefix = '';
  if (otVerb !== undefined) otPrefix = 'OT';
  return  '<button id="' + otPrefix + 'configSortYAxisBtn" class="btn btn-default btn-xs ' +
    otPrefix + 'vrbInpt1" type="button" title="Sort ' +  yAxisTitle + '" onclick="userSort' +
    otPrefix + 'Axis(\'Y\')">' +
    '<span id="configSortYAxisIcon" class="glyphicon glyphicon-sort"></span></button>';
}

function htmlToAdd5a(i, otVerb) {
  var otPrefix = '';
  if ((typeof otVerb === "string") && (otVerb === "OT")) otPrefix = 'OT';
  return '<input id="' + otPrefix + 'axisYOnOffCheckbox' + i + '" class="' + otPrefix + 'vrbInptY grmChkBx" ' +
    'type="checkbox" onchange=\'userToggleXOrYAxisConfig("' + otPrefix + '", "Y", "' + i + '")\'>';
}

function htmlToAdd5b(i, otVerb, addAnimation) {
  var otPrefix = ''; var result = '';
  if ((typeof otVerb === "string") && (otVerb === "OT")) otPrefix = 'OT';
  if (addAnimation)
    result += '<br>';
  result += '<select id="slctUl' + otPrefix + 'VerbItem' + i + '" class="' + otPrefix + 'vrbInpt1 underlineSelect" ' +
    'onchange=\'userUpdate' + otPrefix +'YAxisItem("' + i + '", value)\'';
  if ((otPrefix != 'OT') && addAnimation)result += ' style="width: 52px"';
  result += '>' +
    '<option value="ulSolid">' + cc[C_underlineCharsInSelectDropdown]["Underline"] + '</option>' +
    '<option value="ulDoubleSolid">' + cc[C_underlineCharsInSelectDropdown]["2 lines"] + '</option>' +
    '<option value="ulDash">' + cc[C_underlineCharsInSelectDropdown]["Dash"] + '</option>' +
    '<option value="ulDashDot">' + cc[C_underlineCharsInSelectDropdown]["Dash Dot"] + '</option>' +
    '<option value="ulDashDotDot">' + cc[C_underlineCharsInSelectDropdown]["Dash Dot Dot"] + '</option>' +
    '<option value="ulDot">' + cc[C_underlineCharsInSelectDropdown]["Dots"] + '</option>' +
    '<option value="ulWave">' + cc[C_underlineCharsInSelectDropdown]["Wave"] + '</option>' +
    '<option value="ulArrow">' + cc[C_underlineCharsInSelectDropdown]["Arrow"] + '</option>' +
    '<option value="ulShortArrow">' + cc[C_underlineCharsInSelectDropdown]["Short Arrow"] + '</option>' +
    '<option value="ulReverseArrow">' + cc[C_underlineCharsInSelectDropdown]["Reverse Arrow"] + '</option>' +
    '<option value="ulShortReverseArrow">' + cc[C_underlineCharsInSelectDropdown]["Short Reverse Arrow"] + '</option>' +
    '</select>';
  if (addAnimation) {
    var displayStyle = (addAnimation) ? ' ' : ' style="display:none" ';
    if (otPrefix !== "OT") result += '<br><span' + displayStyle + 'id="inAnimate' + i + '">' +
      'Animate:<input' + displayStyle + 'id="inAnimateCheckbox' + i + '" ' + 
      'type="checkbox" onchange=\'userUpdateAnimation("' + i + '")\'></span>';
  }
  return result;
}

function htmlToAdd6(otVerb, callFromSidebar) {
  var otPrefix = ''; var c4Ref;
  if ((otVerb != undefined) && (otVerb === 'OT')) {
    c4Ref = c4[C_OT];
    otPrefix = 'OT';
  }
  else c4Ref = c4[C_Greek];
  var result = "";
  var passiveOnOffCheckbox = '<input id="chkbx' + otPrefix + 'PassiveBkgrdClr" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBkgrd("passive", "' + otPrefix + '")\'>';
  if (callFromSidebar)
    result += '<tr><td class="grmChkBx sdBrRow">' + passiveOnOffCheckbox + "</td><td>";
  result += '<span';
  if (callFromSidebar) {
    result += ' class="';
    if (otPrefix === 'OT')
      result += 'otP';
    else
      result += 'p';
    result += 'assivePreview sdBrRow"';
  }
  result += '>Passive';
  if (callFromSidebar) 
    result += '</span></td><td class="grmSlctBx">';
  else
    result += ' voice: background - </span>' + passiveOnOffCheckbox;
  result += 
    '<input id="in' + otPrefix + 'PassiveBkgrdClr" type="color" ' +
    'value="' + c4Ref[C_inPassiveBkgrdClr] + '"/>';
  if (callFromSidebar) {
    result += '<span><a class="' + otPrefix + 'passive_info' + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span';
    result += "</td></tr>";
  }
  else {
    result += 
      '<span>underline - </span><input id="chkbx' + otPrefix + 'PassiveUlClr1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("passive", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'PassiveUlClr1" type="color" ' +
      'value="' + c4Ref[C_inPassiveUlClr1] + '"/>';
    if (otPrefix !== 'OT')
      result += '<span>animated underline - </span>' +
        '<input id="chkbx' + otPrefix + 'PassiveUlClr2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("passive", "' + otPrefix + '")\'>' +
        '<input id="in' + otPrefix + 'PassiveUlClr2" type="color" ' +
        'value="' + c4Ref[C_inPassiveUlClr2] + '"/>';
    result += '<br><br>';
  }
  var middleOnOffCheckbox = '<input id="chkbx' + otPrefix + 'MiddleBkgrdClr" type="checkbox" onchange=\'userUpdatePassiveMiddleVoiceBkgrd("middle", "' + otPrefix + '")\'>';
  if (callFromSidebar)
    result += '<tr><td class="grmChkBx sdBrRow">' + middleOnOffCheckbox + "</td><td>";
  result += '<span';
  if (callFromSidebar) {
    result += ' class="';
    if (otPrefix === 'OT')
      result += 'M';
    else
      result += 'm';
    result += 'iddlePreview sdBrRow"';
  }  
  result += '>Middle';
  if (callFromSidebar) 
    result += '</span></td><td class="grmSlctBx">';
  else
    result += ' voice: background - </span>' + middleOnOffCheckbox;
  result +=
    '<input id="in' + otPrefix + 'MiddleBkgrdClr" type="color" ' +
    'value="' + c4Ref[C_inMiddleBkgrdClr] + '"/>';
  if (callFromSidebar) {
    result += '<span><a class="' + otPrefix + 'middle_info' + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span';
    result += "</td></tr>";
  }
  else {
      result += 
      '<span>underline - </span><input id="chkbx' + otPrefix + 'MiddleUlClr1" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline1("middle", "' + otPrefix + '")\'>' +
      '<input id="in' + otPrefix + 'MiddleUlClr1" type="color" ' +
      'value="' + c4Ref[C_inMiddleUlClr1] + '"/>';
    if (otPrefix !== 'OT')
      result += '<span>animated underline - </span>' +
        '<input id="chkbx' + otPrefix + 'MiddleUlClr2" type="checkbox" onchange=\'userEnablePassiveMiddleVerbsUnderline2("middle", "' + otPrefix + '")\'>' +
        '<input id="in' + otPrefix + 'MiddleUlClr2" type="color" ' +
        'value="' + c4Ref[C_inMiddleUlClr2] + '"/>';
  }
  return result;
}

function tableAxisSpan(axis, ot) {
  var c4Ref = ((ot != undefined) && (ot == 'OT')) ? c4[C_OT] : c4[C_Greek];
  var curXTitle = (axis == 'X') ? c4Ref[C_verbTableXHeader] : c4Ref[C_verbTableYHeader];
  var modalWidth = $('body').width();
  if ((modalWidth != undefined) && (modalWidth != null) && (!isNaN(modalWidth)) && (modalWidth < 605) && (axis == 'Y')) return 2;
  if (curXTitle != null) return 3; // The header information is not showed if there are no user input fields which is at the help quicklinks panel
  else return 2;
}

function addTitleToXAxis(descOfXAxisItems) {
  var htmlTable = '';
  var curXTitle = c4[C_Greek][C_verbTableXHeader];
  if (curXTitle != null) {
    htmlTable += '<tr>';
    for (var i = 0; i < curXTitle.desc.length; i ++) {
      htmlTable += '<td class="tg-yw4l" align="center" colspan="' + (curXTitle.repeat[i] + 1) + '">' + curXTitle.desc[i] + '</td>';
    }
    htmlTable += '</tr>';
  }
  htmlTable += '<tr>';
  for (var j = 0; j < descOfXAxisItems.length; j += 1) {
    htmlTable += '<td class="tg-yw4l"';
      if (descOfXAxisItems[j].length < 10) htmlTable += ' width=72';
    htmlTable += '>' + descOfXAxisItems[j];
    htmlTable += htmlToAdd3a(j, "", true) + 
      htmlToAdd3b(j, "", true);
    htmlTable += '</td>';
  }
  htmlTable += '</tr>';
  return htmlTable;
}

function addTitleToXAxisSideBar(descOfXAxisItems) {
  var htmlTable = '';
  for (var j = 0; j < descOfXAxisItems.length; j += 1) {
    htmlTable += '<tr><td>';
    htmlTable += htmlToAdd3a(j, "", false) + '</td>';
    htmlTable += '<td style="text-decoration:underline solid 33%" class="moodPreview' + j + ' sdBrRow">' + descOfXAxisItems[j];
    htmlTable += '</td>';
    htmlTable += '<td class="grmSlctBx">' + htmlToAdd3b(j, "", false); 
    htmlTable += '<span><a class="mood_info' + j + ' glyphicon glyphicon-info-sign sdBrIcon" data-hasqtip="true" aria-describedby="qtip-60"></a></span>';
    htmlTable += '</td>';
    htmlTable += '</tr>';
  }
  return htmlTable;
}

function addTitleToYAxis(rowNum, descOfYAxisItems, xAxisRowSpan, ot, forSideBar, verbClass) {
  var htmlTable = '';
  var curYTitles = ((ot != undefined) && (ot == 'OT')) ? c4[C_OT][C_verbTableYHeader] : c4[C_Greek][C_verbTableYHeader];
  if ((curYTitles != null) && (!forSideBar) && (xAxisRowSpan == 3)) { // screen size might not be wide enough for help quicklink
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
  if (forSideBar) {
    htmlTable += '<td>' + htmlToAdd5a(rowNum, ot) + '</td>' +
      '<td class="' + verbClass + ' sdBrRow">' +
      '<span>';
  }
  else
    htmlTable += '<td>';
  htmlTable += descOfYAxisItems;
  if (forSideBar)
    htmlTable += '</span></td>';
  return htmlTable;
}

function getAllTenseMoodForThisGroup(r, x, y) {
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
}

function voicesInTenseAndMood(xAxisItem, yAxisItem) {
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
}