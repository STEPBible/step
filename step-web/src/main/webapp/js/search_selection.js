window.step = window.step || {};
step.searchSelect = {
	version: "ESV_th",
	userLang: "en",
	searchOnSpecificType: "",
	// Don't change the order of the following. The first 3 search types are non original language
	// searches.  The last two are not displayed in it's own group.  GREEK_MEANINGS are are displayed
	// with GREEK.  HEBREW_MEANINGS are displayed with HEBREW.
	searchTypeCode: [TEXT_SEARCH, SUBJECT_SEARCH, MEANINGS, GREEK, GREEK_MEANINGS, HEBREW, HEBREW_MEANINGS],
	numOfSearchTypesToDisplay: 7, // Not counting GREEK_MEANINGS and HEBREW_MEANINGS from the above line
	displayOptions: ["Strong_number", "Transliteration", "Original_language", "Frequency", "Frequency_details", "Immediate_lookup"],
	searchModalCurrentPage: 1,
	searchUserInput: "",
	searchRange: "Gen-Rev",
	previousSearchTokens: [],
	numOfPreviousSearchTokens: 0,
	includePreviousSearches: false,
	rangeWasUpdated: false,
	andOrNotUpdated: false,
	timer: undefined,
	// idx2osisCHapterJsword has to stay here because when this is running inside the html files for iFrames, step.util is no reachable.  
	idx2osisChapterJsword: {
		"gen": 0,
		"exo": 1, "exod": 1,
		"lev": 2,
		"num": 3,
		"deu": 4, "deut": 4,
		"jos": 5, "josh": 5,
		"judg": 6,
		"rut": 7, "ruth": 7,
		"1sa": 8, "1sam": 8,
		"2sa": 9, "2sam": 9,
		"1ki": 10, "1kgs": 10,
		"2ki": 11, "2kgs": 11,
		"1ch": 12, "1chr": 12,
		"2ch": 13, "2chr": 13,
		"ezr": 14, "ezra": 14,
		"neh": 15,
		"est": 16, "esth": 16,
		"job": 17,
		"psa": 18, "ps": 18,
		"pro": 19, "prov": 19,
		"ecc": 20, "eccl": 20,
		"song": 21,
		"isa": 22,
		"jer": 23,
		"lam": 24,
		"eze": 25, "ezek": 25,
		"dan": 26,
		"hos": 27,
		"joe": 28, "joel": 28,
		"amo": 29, "amos": 29,
		"obd": 30, "obad": 30,
		"jon": 31, "jonah": 31,
		"mic": 32,
		"nah": 33,
		"hab": 34,
		"zep": 35, "zeph": 35,
		"hag": 36,
		"zec": 37, "zech": 37,
		"mal": 38,
		"mat": 39, "matt": 39,
		"mar": 40, "mark": 40,
		"luk": 41, "luke": 41,
		"joh": 42, "john": 42,
		"act": 43, "acts": 43,
		"rom": 44,
		"1cor": 45,
		"2cor": 46,
		"gal": 47,
		"eph": 48,
		"phili": 49, "phil": 49,
		"col": 50,
		"1th": 51, "1thess": 51,
		"2th": 52, "2thess": 52,
		"1ti": 53, "1tim": 53,
		"2ti": 54, "2tim": 54,
		"tit": 55, "titus": 55,
		"phile": 56, "phlm": 56,
		"heb": 57,
		"jam": 58, "jas": 58,
		"1pe": 59, "1pet": 59,
		"2pe": 60, "2pet": 60,
		"1jo": 61, "1john": 61,
		"2jo": 62, "2john": 62,
		"3jo": 63, "3john": 63,
		"jude": 64,
		"rev": 65
	},
	groupsOT: [
		{groupName: __s.book_of_moses, show: false, books: [0, 1, 2, 3, 4], bookOrderPos: [-1, -1, -1, -1, -1]},
		{groupName: __s.history_books, show: false, books: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
			bookOrderPos: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]},
		{groupName: __s.poetic_books, show: false, books: [17, 18, 19, 20, 21], bookOrderPos: [-1, -1, -1, -1, -1]},
		{groupName: __s.major_prophets, show: false, books: [22, 23, 24, 25, 26], bookOrderPos: [-1, -1, -1, -1, -1]},
		{groupName: __s.minor_prophets, show: false, books: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
			bookOrderPos: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]}
	],

	groupsNT: [
		{groupName: __s.gospels_and_acts, show: false, books: [39, 40, 41, 42, 43], bookOrderPos: [-1, -1, -1, -1, -1]},
		{groupName: __s.pauline_epistles, show: false, books: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
			bookOrderPos: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]},
		{groupName: __s.other_nt, show: false, books: [57, 58, 59, 60, 61, 62, 63, 64, 65],
			bookOrderPos: [-1, -1, -1, -1, -1, -1, -1, -1, -1]}
	],

	groupsOther: undefined,
	bookOrder: [],
	idx2BookOrder: {},

	initSearchSelection: function() {
		if ((typeof step.state === "undefined") || (typeof step.state.language === "undefined")) this.userLang = "en-US";
		else this.userLang = step.state.language() || "en-US";
        this.version = "ESV_th";
        this.searchOnSpecificType = "";
        this.searchModalCurrentPage = 1;
        this.searchUserInput = "";
        this.searchRange = "Gen-Rev";
        this.previousSearchTokens = [];
        this.numOfPreviousSearchTokens = 0;
        this.includePreviousSearches = false;
        this.rangeWasUpdated = false;
        this.andOrNotUpdated = false;
        this.timer = undefined;
		// The following fields need to be reset.
   		this.groupsOT[0].show = false;
		this.groupsOT[0].bookOrderPos = [-1, -1, -1, -1, -1];
		this.groupsOT[1].show = false;
		this.groupsOT[1].bookOrderPos = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
		this.groupsOT[2].show = false;
		this.groupsOT[2].bookOrderPos = [-1, -1, -1, -1, -1];
		this.groupsOT[3].show = false;
		this.groupsOT[3].bookOrderPos = [-1, -1, -1, -1, -1];
		this.groupsOT[4].show = false;
		this.groupsOT[4].bookOrderPos = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

		this.groupsNT[0].show = false;
		this.groupsNT[0].bookOrderPos = [-1, -1, -1, -1, -1];
		this.groupsNT[1].show = false;
		this.groupsNT[1].bookOrderPos = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
		this.groupsNT[2].show = false;
		this.groupsNT[2].bookOrderPos = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

        this.groupsOther = undefined,
        this.bookOrder = [];
        this.idx2BookOrder = {};
        
		$("#searchmodalbody").addClass("scrollPart");
		if ((this.userLang.indexOf('en') != 0) && (this.groupsOT[0].groupName === "Books of Moses") && (this.groupsOT[0].groupName !== "Pentateuch"))
			this.groupsOT[0].groupName = __s.the_pentateuch;
		if (step.util.getPassageContainer(step.util.activePassageId()).find(".resultsLabel").text() !== "") {
			var activePassageData = step.util.activePassage().get("searchTokens") || [];
			var existingReferences = "";
			$('#previousSearch').empty();
			var previousSearches = [];
			var previousJoins = [];
			var leftParanthesis = [];
			var rightParanthesis = [];
			for (var j = 0; j < activePassageData.length; j++) {
				var actPsgeDataElm = activePassageData[j];
				var itemType = actPsgeDataElm.itemType ? actPsgeDataElm.itemType : actPsgeDataElm.tokenType
				if (itemType === "srchJoin") {
					var previousJoinsAndSearch = actPsgeDataElm.token.split(/(?=[aon])/);
					for (var k = 0; k < previousJoinsAndSearch.length; k++) {
						if (k > 0) {
							var firstChar = previousJoinsAndSearch[k].substring(0,1);
							if ((firstChar !== "a") && (firstChar !== "o") && (firstChar !== "n"))
								firstChar = "a";
							previousJoins.push(firstChar);
						}
						leftParanthesis.push( (previousJoinsAndSearch[k].match(/\(/) || []).length ); // count the number of left paranthesis
						rightParanthesis.push( (previousJoinsAndSearch[k].match(/\)/) || []).length ); // count the number of right paranthesis
					}
				}
			}
			var previousSearchTokensIndex = 0;
			for (var i = 0; i < activePassageData.length; i++) {
				var actPsgeDataElm = activePassageData[i];
				var itemType = actPsgeDataElm.itemType ? actPsgeDataElm.itemType : actPsgeDataElm.tokenType
				if (itemType === REFERENCE) {
					if (existingReferences !== "") existingReferences += ",";
					existingReferences += actPsgeDataElm.item.osisID.replace(/ /g, ',');
				}
				else if (itemType !== VERSION) {
					if (itemType === SYNTAX) {
						var syntaxWords = actPsgeDataElm.token.replace(/\(/g, '').replace(/\)/g, '').split(" ");
						step.util.findSearchTermsInQuotesAndRemovePrefix(syntaxWords);
							if ((syntaxWords.length == 1) && (syntaxWords[0].substr(0, 7) === STRONG_NUMBER + ":")) {
								var strongNum = syntaxWords[0].substr(7);
								var result = step.util.getDetailsOfStrong(strongNum, this.version);
								currWord = {token: syntaxWords[0], item: {gloss: result[0], stepTransliteration: result[1], matchingForm: result[2]} };
								var searchRelationship = "";
								if ((previousSearchTokensIndex > 0) && (previousSearchTokensIndex <= previousJoins.length)) searchRelationship = previousJoins[previousSearchTokensIndex - 1];
								previousSearchTokensIndex = this.createPreviousSearchList(itemType, currWord, previousSearches, this.previousSearchTokens, previousSearchTokensIndex, searchRelationship, leftParanthesis, rightParanthesis);
							}
							else alert("Something wrong with syntax search "+ syntaxWords);
					}
					else {
						var searchRelationship = "a";
						if (previousSearchTokensIndex == 0) searchRelationship = "";
						else if (previousSearchTokensIndex <= previousJoins.length) searchRelationship = previousJoins[previousSearchTokensIndex - 1];
						previousSearchTokensIndex = this.createPreviousSearchList(itemType, actPsgeDataElm, previousSearches, this.previousSearchTokens, previousSearchTokensIndex, searchRelationship, leftParanthesis, rightParanthesis);
					}
				}
			}
			this.numOfPreviousSearchTokens = previousSearches.length;
			if (previousSearches.length > 0) {
				var previousSearchHTML =
					'<div id="modalonoffswitch" class="modalonoffswitch">' +
						'<span class="pull-left" style="font-size:18px" id="search_with_previous">' + __s.search_with_previous + '&nbsp;&nbsp;</span>' +
						'<span class="pull-left">' +
							'<select id="searchAndOrNot" style="display:none;font-size:16px" class="stepButton" type="text">' +
								'<option id="and_search" value="AND">' + __s.search_previous_and + '</option>' +
								'<option id="or_search" value="OR">' + __s.search_previous_or + '</option>' +
								'<option id="not_search" value="NOT">' + __s.search_previous_not + '</option>' +
							'</select>' +
						'</span>' +
						'<span class="onoffswitch2 pull-left">' +
							'<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="showprevioussearchonoff" onchange="showPreviousSearch()"/>' +
							'<label class="onoffswitch2-label" for="showprevioussearchonoff">' +
							'<span class="onoffswitch2-inner"></span>' +
							'<span class="onoffswitch2-switch"></span>' +
							'</label>' +
						'</span>' +
					'</div>' +
					'<br><br><br><br>' +
					'<ul id="listofprevioussearchs" class="listOPSul" style="display:none">';
				for (var j = 0; j < previousSearches.length; j++) {
					previousSearchHTML += "<li id='lOPS_" + j + "' class='listOPSli'>" + previousSearches[j];
					previousSearchHTML += ((this.previousSearchTokens[j].indexOf("(") > -1) || (this.previousSearchTokens[j].indexOf(")") > -1)) ?
						"" : "<span class='closeMark' onclick=step.searchSelect.removePreviousSearch(" + j + ")>X</span>";
					previousSearchHTML += "</li>";
				}
				previousSearchHTML += "</ul>";
				$('#previousSearch').append(previousSearchHTML);
			}
			if (existingReferences !== "") this.searchRange = existingReferences;
		}
		else {
			$('#modalonoffswitch').hide();
			$('#searchAndOrNot').hide();
		}

		step.searchSelect._initOptions();
		$('#searchHdrTable').append(this._buildSearchHeaderAndTable());
		$('#srchModalBackButton').hide();

		$(function(){
			$('textarea#userTextInput').on('input', function(e){
				this.timer && clearTimeout(this.timer);
				var timeoutPeriod = (step.touchDevice) ? 600 : 300;
				this.timer = setTimeout(step.searchSelect.handleKeyboardInput, timeoutPeriod, e);
			});
		});
		step.searchSelect.updateAdvancedSearchElements();
	},
	updateAdvancedSearchElements: function() {
		var advancedSearchInStorage = step.util.localStorageGetItem("advanced_search");
		if ((advancedSearchInStorage != null) && (advancedSearchInStorage === "true")) {
			$("#basic_search_help_text").hide();
			$(".advanced_search_elements").show();
			$("#select_advanced_search").addClass("checked");
			$("#advancesearchonoffswitch").prop( "checked", true );
			step.searchSelect.previousSearchesEnteredByUser();
		}
		else {
			$("#basic_search_help_text").show();
			$(".advanced_search_elements").hide();
			$("#select_advanced_search").removeClass("checked");
			$("#advancesearchonoffswitch").prop( "checked", false );
		}
		if (($('.passageContainer.active').width() < 500) || (step.touchDevice && !step.touchWideDevice))
			$('#displayLocForm').hide();
	},
	_initOptions: function() {
		var searchOptionsHTML = 
			'<h5>Show in results</h5>' +
			'<ul class="displayModes" style="padding-left:0px" role="presentation">';
		for (var i = 0; i < this.displayOptions.length; i ++) {
			var optionName = this.displayOptions[i].toLowerCase();
			searchOptionsHTML += '<li class="stepModalFgBg passageOptionsGroup dropdown-menu passage" style="display:block;position:initial;opacity:1;border:0px;padding:0px;box-shadow:none">' +
				'<a data-value="STRONG" data-selected="true" class="searchOptions" id="srchOptns' + optionName +'">'+
					this.displayOptions[i].replace("_", " ") +
					'<span id="srchOptnsCheck' + optionName + '" ' +
						'class="glyphicon glyphicon-ok pull-right"></span">' +
				'</a>' +
				'</li><br>';
		}
		searchOptionsHTML += '</ul>';
		$("#srchOptions").append(searchOptionsHTML);
		for (var i = 0; i < this.displayOptions.length; i ++) {
			step.searchSelect._handleOptions(null, this.displayOptions[i].toLowerCase());
		}
		$(".searchOptions").click(step.searchSelect._handleOptions);
	},
	_handleOptions: function(ev, optionNameArg) {
		var optionName = (ev !== null) ? ev.target.id.substring(9): optionNameArg;
        var localStorageSetting = step.util.localStorageGetItem("step.srchOptn" + optionName);
		var currentSetting = false;
		if ((typeof localStorageSetting !== "string") &&
			(optionName !== "strong_number") && (optionName !== "original_language") &&
			(optionName !== "frequency_details") && (optionName !== "immediate_lookup")) {
				currentSetting = true;
		}
		else
			currentSetting = (localStorageSetting === "true");
		if (ev === null) currentSetting = !currentSetting;
		if (currentSetting) {
			$("#srchOptnsCheck" + optionName).css("visibility", "hidden");
		} 
		else {
			$("#srchOptnsCheck" + optionName).css("visibility", "visible");
		}
		step.util.localStorageSetItem("step.srchOptn" + optionName, ((currentSetting) ? "false" : "true"));
		if (ev !== null) step.searchSelect._updateDisplayBasedOnOptions();
		return false;
	},
	previousSearchesEnteredByUser: function() {
	 	var previousSearches = step.util.localStorageGetItem("step.previousSearches");
	 	if (previousSearches == null) {
	 		return;
	 	}
	 	var searchWordsHTML = 
	 		'<h4 style="font-size:14px;margin-bottom:0px">Previous searches</h4>' +
	 		'<ul class="displayModes" style="padding-left:0px" role="presentation">';
	 	previousSearches = previousSearches.split(";");
	 	for (var i = 0; i < previousSearches.length; i ++) {
	 		searchWordsHTML += '<li class="stepModalFgBg dropdown-menu passageOptionsGroup" style="display:block;position:initial;opacity:1;border:0px;padding:0px;box-shadow:none">' +
	 			'<a class="searchWords" id="searchWords' + i +'" style="display:inline-block;width:100%;line-height:20px">' +
	 			previousSearches[i] +
	 			'</a>' +
	 			'</li>';
	 	}
	 	searchWordsHTML += '</ul>';
	 	$("#previousSearchWords").empty().append(searchWordsHTML);
	 	$(".searchWords").click(step.searchSelect._displayPreviousSearchWord);
	},
	_displayPreviousSearchWord: function(ev) {
	 	if ((ev == null) || (typeof ev.target.id !== "string") ||
	 		(ev.target.id.substring(0, 11) !== "searchWords")) return;
	 	var wordIndex = ev.target.id.substring(11);
        var previousSearches = step.util.localStorageGetItem("step.previousSearches");
	 	previousSearches = previousSearches.split(";");
	 	$("textarea#userTextInput").val(previousSearches[wordIndex]);
	 	$("#previousSearchDropDown").removeClass("open");
	 	step.searchSelect.handleKeyboardInput(ev);
	 	return false;
	},
	_updateDisplayBasedOnOptions: function() {
		var wordsAroundDash = 0;
		var showStrong = false;
		for (var i = 0; i < this.displayOptions.length; i ++) {
			var optionName = this.displayOptions[i].toLowerCase();
			var localStorageSetting = step.util.localStorageGetItem("step.srchOptn" + optionName);
			var currentSetting = false;
			if ((typeof localStorageSetting !== "string") &&
				(optionName !== "strong_number") && (optionName !== "frequency")) {
					currentSetting = true;
			}
			else
				currentSetting = (localStorageSetting === "true");
			if (currentSetting) {
				$(".srch" + optionName).show();
				if ((optionName === "transliteration") || (optionName === "original_language")) wordsAroundDash ++;
				if (optionName === "strong_number") showStrong = true;
			}
			else $(".srch" + optionName).hide();
		}
		if ((wordsAroundDash > 1) || (showStrong)) $(".srchParathesis").show();
		else $(".srchParathesis").hide();
		if (wordsAroundDash > 1) $(".srchDash").show();
		else $(".srchDash").hide();
		if ((wordsAroundDash > 1) && (showStrong)) $(".srchSpaceStrong").show();
		else $(".srchSpaceStrong").hide();
	},
	createPreviousSearchList: function(itemType, actPsgeDataElm, previousSearches, previousSearchTokensArg, previousSearchTokensIndex, previousSearchRelationship,
			leftParanthesis, rightParanthesis) {
		var type = itemType.toLowerCase();
		if (type === "srchjoin") return previousSearchTokensIndex; // searchjoins is not a search
		var strongNum = "";
		var html = "";
		if (typeof previousSearchRelationship === "undefined") previousSearchRelationship = "";
		else if (previousSearchRelationship !== "") {
			if (previousSearchRelationship === "a") previousSearchRelationship = "AND";
			else if (previousSearchRelationship === "o") previousSearchRelationship = "OR";
			else if (previousSearchRelationship === "n") previousSearchRelationship = "NOT";
			var andSelected = (previousSearchRelationship === "AND") ? " selected" : "";
			var orSelected = (previousSearchRelationship === "OR") ? " selected" : "";
			var notSelected = (previousSearchRelationship === "NOT") ? " selected" : "";
			previousSearchRelationship = 
				' <select id="searchAndOrNot' + previousSearchTokensArg.length + '" class="stepButton" style="font-size:16px" type="text" onchange="javascript:step.searchSelect.handleAndOrNot()">' +
					'<option id="and_search" value="AND"' + andSelected + '>' + __s.and + '</option>' +
					'<option id="or_search" value="OR"' + orSelected + '>' + __s.or + '</option>' +
					'<option id="not_search" value="NOT"' + notSelected + '>' + __s.not + '</option>' +
				'</select> ';
		}
		if (leftParanthesis[previousSearchTokensIndex] > 0) {
			var leftParanString = "(".repeat(leftParanthesis[previousSearchTokensIndex]);
			var html = "<span style='font-size:16px'>" + previousSearchRelationship + leftParanString + "</span>";
			previousSearchRelationship = "";
			previousSearches.push(html);
			previousSearchTokensArg.push(leftParanString);
		}
		if (type === SYNTAX) {
			var strongNum = (actPsgeDataElm.token.toLowerCase().indexOf("strong:") == 0) ? actPsgeDataElm.token.substr(7) : actPsgeDataElm.token;
			if (strongNum.substring(0,1) === "H") type = HEBREW;
			else if (strongNum.substring(0,1) === "G") type = GREEK;
		}
		if (type.indexOf("greek") == 0) type = "greek";
		else if (type.indexOf("hebrew") == 0) type = "hebrew";
		if ((this.searchTypeCode.indexOf(type) > 2) && (actPsgeDataElm.item !== undefined)) { // The first three search types are not original language search types
			if (typeof __s[type] !== "undefined") type = __s[type];
			var htmlOfTerm = actPsgeDataElm.item.gloss;
			if (actPsgeDataElm.item.stepTransliteration !== "") {
				var strongNumToDisplay = "";
				if (typeof actPsgeDataElm.item.strongNumber === "string") {
					strongNumToDisplay = actPsgeDataElm.item.strongNumber;
				}
				else {
					strongNumToDisplay = actPsgeDataElm.token;
					if (strongNumToDisplay.substring(0,7) === "strong:") strongNumToDisplay = strongNumToDisplay.substring(7) + "*";
				}
				htmlOfTerm += 
				'<i class="srchTransliteration"> ' + actPsgeDataElm.item.stepTransliteration + '</i>' +
				'<span class="srchParathesis"> (</span>' +
				'<span class="srchOriginal_Language">' + actPsgeDataElm.item.matchingForm + '</span>' +
				'<span class="srchSpaceStrong"> </span>' +
				'<span class="srchStrong_number">' + strongNumToDisplay + '</span>' +
				'<span class="srchParathesis">)</span>';
			}
			var html = "<span style='font-size:16px'>" + previousSearchRelationship + type + "</span> = " + htmlOfTerm;
			previousSearches.push(html);
			var strongNum = actPsgeDataElm.token;
			if (itemType === SYNTAX) {
				if (strongNum.toLowerCase().indexOf("strong:") == 0) strongNum = strongNum.substring(7);
				previousSearchTokensArg.push("syntax=t=strong:" + strongNum);
			}
			else previousSearchTokensArg.push("strong=" + strongNum);
			if (actPsgeDataElm.item.stepTransliteration !== "") step.util.putStrongDetails(strongNum, htmlOfTerm);
		}
		else {
			if (typeof __s[type] !== "undefined") type = __s[type];
			previousSearches.push("<span style='font-size:16px'>" + previousSearchRelationship + type + "</span> = " + actPsgeDataElm.token);
			previousSearchTokensArg.push(itemType + "=" + actPsgeDataElm.token);
		}
		if (rightParanthesis[previousSearchTokensIndex] > 0) {
			var rightParanString = ")".repeat(rightParanthesis[previousSearchTokensIndex]);
			var html = "<span style='font-size:16px'>" + rightParanString + "</span>";
			previousSearches.push(html);
			previousSearchTokensArg.push(rightParanString);
		}
		return previousSearchTokensIndex + 1;
	},

	_find_onclick_and_go: function(element) {
		var onclickInfo = $(element).attr("onclick");
		if ((typeof onclickInfo === "string") && (onclickInfo.toLowerCase().indexOf("javascript:") == 0)) {
			if (onclickInfo.replaceAll(" ","").indexOf("goSearch('text','','')") > -1) {
				$('#warningMessage').text("Search word is not valid for text (word or phrase) search.");
				return;
			}
			eval(onclickInfo);
		}
	},

	handleKeyboardInput: function(e) {
		$('#quickLexicon').remove();
		if (e.target.id === "enterRange") {
			$('#userEnterRangeError').text("");
			var userInput =  $('textarea#enterRange').val();
			userInput = userInput.replace(/[\n\r]/g, '').replace(/[\t]/g, ' ').replace(/\s\s+/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '')
			userInput = userInput.replace(/[–—]/g, '-'); // replace n-dash and m-dash with hyphen
			$('textarea#enterRange').val(userInput);
			if (userInput.length > 3) {
				var url = SEARCH_AUTO_SUGGESTIONS + userInput + "/limit%3D" + REFERENCE + URL_SEPARATOR + VERSION + "%3D" + step.searchSelect.version + URL_SEPARATOR +"?lang=" + step.searchSelect.userLang;
				$.getJSON(url, function (data) {
					if (data.length == 0) {
						$("#updateRangeButton").hide();
						$('#userEnterRangeError').text("No match for " + userInput + ", please update your entry.");
						$('textarea#enterRange').focus();
						$('textarea#enterRange').val(userInput);
					}
					else $("#updateRangeButton").show();
				}).fail(function() {
					changeBaseURL();
				});
			}
			else {
				if ((userInput.length == 0) && (step.searchSelect.searchRange.length > 0) && (step.searchSelect.searchRange !== "Gen-Rev"))
					$("#updateRangeButton").show();
				else $("#updateRangeButton").hide();
			}
		}
		else {
			$("#searchButton").hide();
			var userInput = $('textarea#userTextInput').val();
			if ((userInput.slice(-1) === "\n") || (e.originalEvent.inputType === "insertLineBreak")) {
				userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
				$('textarea#userTextInput').val(userInput);
				if (!$("#select_advanced_search").hasClass("checked")) {
					if (userInput.replace(/\s\s+/, ' ').search(/^\s?[\da-z][a-z]+[\s.]?\d/i) > -1) step.searchSelect._handleEnteredSearchWord(null, null, true); // probably a passage
					var sleep = 50;
					if (step.searchSelect.searchUserInput !== userInput) {
						step.searchSelect._handleEnteredSearchWord();
						sleep = 330;
					}
					setTimeout(function() { // Need to give time for the input to the sent to the server and also time for the response to come back to the browser.
						var textSearchResult = $("#searchResultstext").find("a");
						if (textSearchResult.length > 0) {
							if (textSearchResult.length > 1) {
								for (var i = 0; i < textSearchResult.length; i++) {
									var nextElement = $(textSearchResult[i]).next();
									if ((nextElement.length > 0) && ($(nextElement).prop("tagName").toLowerCase() === "span") &&
										($(nextElement).text() === __s.default_search)) {
										step.searchSelect._find_onclick_and_go(textSearchResult[i]);
										return;
									}
								}
							}
							step.searchSelect._find_onclick_and_go(textSearchResult[0]); // Did not find default search text, go with the first link.
							return;
						}
						else {
							$('#warningMessage').text(__s.enter_search_word);
						}
					}, sleep);
				}
				else {
					$('#warningMessage').text('');
					step.searchSelect._handleEnteredSearchWord();
				}	
			}
			else {
				if ($("#select_advanced_search").hasClass("checked")) {
					if ($("#srchOptnsCheckimmediate_lookup").css("visibility") === "visible") {
						step.searchSelect._handleEnteredSearchWord();
						$("#searchButton").hide();
					}
					else
						step.searchSelect.checkSearchButton(userInput);
				}
				else
					step.searchSelect._handleEnteredSearchWord();
			}
		}
	},
	checkSearchButton: function(userInput) {
		if (userInput === undefined)
			userInput = $('textarea#userTextInput').val();
		var requiredLength = (step.searchSelect.userLang.toLowerCase().indexOf("zh") == 0) ? 1 : 2;
		if (userInput.length < requiredLength) $("#searchButton").hide();
		else if ($("#userTextInput").data("lastsearchword") !== userInput)
			$("#searchButton").show();
		else
			$("#searchButton").hide();
	},

	goBackToPreviousPage: function() {
		$('#quickLexicon').remove();
		$('#searchSelectError').text("");
		$('#srchModalBackButton').prop('title', '');
		$("#updateRangeButton").hide();
		$("#advancedsearchonoff").show();
		showPreviousSearch(); // The function will determine if it need to show previous search
		if (typeof $('textarea#userTextInput').val() === "undefined") { // Must be in the search range modal because search range does not have ID userTextInput
			$('#searchHdrTable').empty().append(this._buildSearchHeaderAndTable());
			$('#previousSearch').show();
			if (this.searchModalCurrentPage == 1) $('#srchModalBackButton').hide();
			$(function(){
				$('textarea#userTextInput').on('input', function(e){
					this.timer && clearTimeout(this.timer);
					var timeoutPeriod = (step.touchDevice) ? 600 : 300;
					this.timer = setTimeout(step.searchSelect.handleKeyboardInput, timeoutPeriod, e);
				});
			});
			$('textarea#userTextInput').focus();
			this._handleEnteredSearchWord(null, this.searchUserInput);
		}
		else if ((this.searchModalCurrentPage == 2) || (this.searchModalCurrentPage == 3)) {
			this.searchOnSpecificType = "";
			this.searchModalCurrentPage = 1;
			$('#srchModalBackButton').hide();
			this._handleEnteredSearchWord();
		}
		else console.log('Unknown state goBackToPreviousPage');
		step.searchSelect.updateAdvancedSearchElements();
	},

	_buildSearchHeaderAndTable: function() {
		var copyOfRange = this.searchRange;
		var displayRange = this.searchRange;
		// Show the book names in the local language
		if (((this.userLang.toLowerCase().indexOf("zh") == 0) || (this.userLang.toLowerCase().indexOf("es") == 0)) &&
			(this._getTranslationType() !== "")) {
			displayRange = "";
			var arrayOfTyplicalBooksAndChapters = JSON.parse(__s.list_of_bibles_books);
			while (copyOfRange != "") {
				var separatorChar = "";
				var pos = copyOfRange.search(/[-,]/);
				if (pos > -1) separatorChar = copyOfRange.substr(pos, 1);
				else pos = copyOfRange.length;
				var currentOsisID = copyOfRange.substr(0, pos);
				var posOfBook = this.idx2osisChapterJsword[currentOsisID.toLowerCase()];
				if ((posOfBook > -1) &&
					(typeof arrayOfTyplicalBooksAndChapters !== "undefined") &&
					(arrayOfTyplicalBooksAndChapters[posOfBook].length === 2)) {
						displayRange += arrayOfTyplicalBooksAndChapters[posOfBook][1];
				}
				else displayRange += currentOsisID;
				displayRange += separatorChar;
				copyOfRange = copyOfRange.substr(pos + 1);
			}
		}
		var backgroundColor = (step.util.isDarkMode()) ? "var(--clrBackground)" : "#f5f5f5";
		//var fontColor = "var(--clrStrongText)";
		var html = '<div class="header">' +
			'<h4 id="hd4">' + __s.enter_search_word + '</h4>' +
			'<button id="searchRangeButton" type="button" class="stepButtonTriangle" style="float:right;" onclick=step.searchSelect._buildRangeHeaderAndTable()><b>' + __s.search_range + ':</b> ' + displayRange + '</button>' +
			'</div><br>' +
			'<span id="warningMessage" style="color:red;"></span>' +
			'<textarea id="userTextInput" rows="1" class="stepFgBg" style="font-size:16px;width:50%" placeholder="' + __s.enter_search_word + '"></textarea>' + // size 16px so the mobile devices will not expand
			'<button id="searchButton" style="vertical-align:top;display:none;padding-left:10px;padding-right:10px" class="stepButton primaryLightBg" onclick=step.searchSelect._handleEnteredSearchWord() title="Get suggested search">' +
				'<i style="font-size:12px" class="find glyphicon glyphicon-search"></i>' +
			'</button>' +

			'<span id="previousSearchDropDown" class="dropdown advanced_search_elements">' +
				'<a class="dropdown-toggle showSettings" data-toggle="dropdown" title="Previous searches">' +
				    // using https://www.iconfinder.com/icons/326655/history_icon
				    '&nbsp;&nbsp;<?xml version="1.0" ?><svg height="21px" version="1.1" viewBox="0 0 20 21" width="20px" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" opacity="0.9" transform="translate(-464.000000, -254.000000)"><g id="history" transform="translate(464.000000, 254.500000)"><path d="M10.5,0 C7,0 3.9,1.9 2.3,4.8 L0,2.5 L0,9 L6.5,9 L3.7,6.2 C5,3.7 7.5,2 10.5,2 C14.6,2 18,5.4 18,9.5 C18,13.6 14.6,17 10.5,17 C7.2,17 4.5,14.9 3.4,12 L1.3,12 C2.4,16 6.1,19 10.5,19 C15.8,19 20,14.7 20,9.5 C20,4.3 15.7,0 10.5,0 L10.5,0 Z M9,5 L9,10.1 L13.7,12.9 L14.5,11.6 L10.5,9.2 L10.5,5 L9,5 L9,5 Z" id="Shape"/></g></g></g></svg>' +
				'</a>' +
				'<div id="previousSearchWords" class="stepModalFgBg dropdown-menu pull-right" style="opacity:1" role="menu"></div>' +
			'</span>' +

			'<div id="basic_search_help_text" style="font-size:14px;width:90%">' +
			'<br>' +
			'<p>Examples:</p>' +
			'<p><strong>just</strong> → matches words that start with “just” (e.g. just, justice, justified, …)</p>' +
			'<p><strong>come to me</strong> → matches verses that contain "come", "to", and "me" in any order</p>' +
			'<p><strong>"come to me"</strong> → matches the exact phrase in the selected translations</p>' +
			'</div>' +
			'<div id="search_table" class="advanced_search_elements">' +
			'<table border="1" style="background-color:' + backgroundColor + '">' +
			'<colgroup>' +
			'<col id="column1width" span="1" style="width:39%;">' +
			'<col span="1" style="width:61%;">' +
			'</colgroup>' +
			'<tr>' +
			'<th scope="col" class="search-type-column"' + (step.state.isLtR()? '>' : ' style="text-align: right;">') + __s.type_of_search + '</th>' +
			'<th id="suggest_search_words" scope="col"' + (step.state.isLtR()? '>' : ' style="text-align: right;">')  + __s.suggested_search_words + '</th>' +
			'</tr>';
		for (var i = 0; i < step.searchSelect.numOfSearchTypesToDisplay; i ++) {
			var srchCode = this.searchTypeCode[i];
			html += '<tr style="height:40px;" class="select2-result select2-result-selectable select-' + srchCode + '">' +
				'<td onmousemove="javascript:$(\'#quickLexicon\').remove()" onmouseover="javascript:$(\'#quickLexicon\').remove()" class="search-type-column select2-result select2-result-selectable select-' + srchCode + '" title="' + 
				__s['search_type_title_' + srchCode] + '" style="font-size:12px;text-align:left;' + (step.state.isLtR()? '">': 'text-align: right;">') + __s['search_type_desc_' + srchCode] + ':</td>' +
				'<td onmouseout="javascript:$(\'#quickLexicon\').remove()" onmouseover="javascript:$(\'#quickLexicon\').remove()" style="text-align:left"><span id="searchResults' + srchCode + '"></span></td></tr>';
		}
		html += '</table>' +
			'</div>' +
			'<div id="advancedsearchonoff" class="modalonoffswitch" style="margin-top:10px">' +
				'<span id="select_advanced_search" class="pull-left" style="font-size:16px">&nbsp;<b>' + __s.search_advanced + '</b>&nbsp;</span>' +
				'<span class="onoffswitch2 pull-left">' +
					'<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="advancesearchonoffswitch" onchange="advanceMode()"/>' +
					'<label class="onoffswitch2-label" for="advancesearchonoffswitch">' +
					'<span class="onoffswitch2-inner"></span>' +
					'<span class="onoffswitch2-switch"></span>' +
					'</label>' +
				'</span>' +
			'</div><br>';
		return html;
	},

	_buildRangeHeaderAndTable: function(booksToDisplay) {
		$('#quickLexicon').remove();
		var onlyDisplaySpecifiedBooks = ((typeof booksToDisplay === "object") && (Array.isArray(booksToDisplay)) && (booksToDisplay.length > 0));
		$('#searchSelectError').text("");
		$('#updateFeedback').text("");
		var html = this._buildRangeHeaderAndSkeleton(onlyDisplaySpecifiedBooks);
		$('#previousSearch').hide();
		$('#searchHdrTable').empty().append(html);
		$('#srchModalBackButton').show();
		$('#srchModalBackButton').prop('title', 'Return to search without updating search range.');
		this._buildBookTable();
		var keyboardEnteredRange = false;
		if (this.searchRange !== 'Gen-Rev') {
			var tmpSearchRange = this.searchRange + ',';
			var posOfComma = tmpSearchRange.indexOf(',');
			var curRange = tmpSearchRange.substring(0, posOfComma);
			tmpSearchRange = tmpSearchRange.substring(posOfComma + 1);
			while (curRange !== '') {
				var posOfDash = curRange.indexOf('-');
				if (posOfDash == -1) {
					var posOfBook = this.idx2BookOrder[curRange];
					if (typeof posOfBook !== "undefined") this.bookOrder[posOfBook][1] = true;
					else keyboardEnteredRange = true;
				}
				else if (posOfDash > 1) {
					var firstBook = curRange.substring(0, posOfDash);
					var secondBook = curRange.substring(posOfDash + 1);
					var posOfBook1 = this.idx2BookOrder[firstBook];
					var posOfBook2 = this.idx2BookOrder[secondBook];
					if (typeof posOfBook1 !== "undefined") this.bookOrder[posOfBook1][1] = true;
					else keyboardEnteredRange = true;
					if (typeof posOfBook2 !== "undefined") {
						this.bookOrder[posOfBook2][1] = true;
						if ((posOfBook1 > -1) && (posOfBook1 < posOfBook2)) {
							for (var i = posOfBook1 + 1; i < posOfBook2; i ++) this.bookOrder[i][1] = true; 
						}
					}
					else keyboardEnteredRange = true;
				}
				var posOfComma = tmpSearchRange.indexOf(',');
				if (posOfComma === -1) {
					curRange = '';
					tmpSearchRange = '';
				}
				else {
					curRange = tmpSearchRange.substring(0, posOfComma);
					tmpSearchRange = tmpSearchRange.substring(posOfComma + 1);
				}
			}
		}
		if (keyboardEnteredRange) this._buildRangeKeyboard(this.searchRange);
		else {
			for (var i = 0; i < 3; i++) {
				var curGroup;
				var idPrefix;
				if (i == 0) {
				   curGroup = this.groupsOT;
				   idPrefix = 'ot_tableg';
				}
				else if (i == 1) {
				   curGroup = this.groupsNT;
				   idPrefix = 'nt_tableg';
				}
				else if (i == 2) {
				   curGroup = this.groupsOther;
				   idPrefix = 'ob_tableg';
				}
				var allGroupsDisabled = true;
				for (var j = 0; j < curGroup.length; j++) {
					var allBooksInGroupDisabled = true;
					for (var k = 0; k < curGroup[j].bookOrderPos.length; k++) {
						if ( (curGroup[j].bookOrderPos[k] > -1) &&
							(!(this.bookOrder[curGroup[j].bookOrderPos[k]][1])) ) {
						   this._userClickedBook(idPrefix + j + 'b' + k);
						}
						if (onlyDisplaySpecifiedBooks) {
							curBook = this.bookOrder[curGroup[j].bookOrderPos[k]][0];
							if (booksToDisplay.indexOf(curBook) == -1)
								$("#" + idPrefix + j + 'b' + k).prop("disabled",true).css('opacity',0.5);
							else {
								allBooksInGroupDisabled = false;
								allGroupsDisabled = false;
							}
						}
					}
					if ((onlyDisplaySpecifiedBooks) && (allBooksInGroupDisabled)) {
						for (var k = 0; k < curGroup[j].bookOrderPos.length; k++) {
							$("#" + idPrefix + j + 'b' + k).hide(); // hide the button
							$("#" + idPrefix + j + 'b' + k).parent().parent().hide(); // hide the tr
						}
						$("#" + idPrefix + j).hide(); // hide the group button (e.g.: book of Moses)
					}
				}
				if ((onlyDisplaySpecifiedBooks) && (allGroupsDisabled))
					$("#" + idPrefix.substr(0, 3) + "hdr").hide(); // hide the New Testament or Old Testament button
			}
			if (this.searchRange === 'Gen-Rev') $('#updateFeedback').text(__s.all_books_not_selected);
			else $('#updateFeedback').text(__s.search_range_button_color_desc);
		}
		$('#searchSelectError').text("");
		$('#updateRangeButton').hide();
		$('#updateRangeButton').text(__s.update_search_range);
		$('#updateButton').hide();
	},

	_buildRangeHeaderAndSkeleton: function(onlyDisplaySpecifiedBooks) {
		var fontSize = 16;
		var html = '<div class="header">' +
			'<h4>' + __s.click_to_select_search_range + ':</h4>' +
			'<span style="float:right">' + __s.search_range_button_color_desc + '</span>' +
			'</div>' +
			'<span id="updateFeedback"></span>' +
			'<div id="search_range_table">' +
			'<button id="ot_hdr" type="button" class="stepButton stepPressedButton" style="display:none;width:97%;font-size:' + fontSize + 'px" ' +
			'title="'  + __s.click_to_select + ' ' + __s.all + ' '  + __s.old_testament + ' ' + __s.bible_book + '" ' +
			'onclick=step.searchSelect._userClickedTestament(this.id)><i>' + __s.old_testament + ':</i></button>' +
			'<div id="ot_table"/>' +
			'<button id="nt_hdr" type="button" class="stepButton stepPressedButton" style="display:none;width:97%;font-size:' + fontSize + 'px" ' +
			'title="'  + __s.click_to_select + ' ' + __s.all + ' '  + __s.new_testament + ' ' + __s.bible_book + '" ' +
			'onclick=step.searchSelect._userClickedTestament(this.id)><i>' + __s.new_testament + ':</i></button>' +
			'<div id="nt_table"/>' +
			'<h4 id="other_books_hdr"/>' +
			'<div id="ob_table"/>';
			if ((!onlyDisplaySpecifiedBooks) && (!step.touchDevice) && ($("#keyboardEntry").length == 1)) {
				$('.footer').prepend('<a id="keyboardEntry" class="advanced_search_elements" href="javascript:step.searchSelect._buildRangeKeyboard();"><img src="images/keyboard.jpg" alt="Keyboard entry"></a>');
			}
		return html;
	},

	_buildRangeKeyboard: function(searchRange) {
		$('#searchSelectError').text("");
		$('#updateFeedback').text("");
		$("#keyboardEntry").remove();
		var fontSize = 16;
		var html = '<div class="header">' +
			'<h4>Enter your search range:</h4>' +
			'</div>' +
			'<textarea id="enterRange" rows="1" class="stepFgBg" style="font-size:13px;width:95%;margin-left:5;resize=none;height:24px"' +
				' placeholder="Enter search range"></textarea>' +
			'<br>' +
			'<span id="userEnterRangeError" style="color: red"></span>' +
			'<h5>Examples:</h5>' +
			'<p>Rom.1-3 (Romans chapter 1 to 3)</p>' +
			'<p>Psa.1-15,Pro.1-13 (Psalm chapter 1 to 15 and Proverbs chapter 1 to 15)</p>';
				
		$('#previousSearch').hide();
		$('#searchHdrTable').empty().append(html);
		if (typeof searchRange === "string") $("#enterRange").val(searchRange);
		$('textarea#enterRange').focus();
		$('#srchModalBackButton').show();
		$('#srchModalBackButton').prop('title', 'Return to search without updating search range.');


		$('#searchSelectError').text("");
		$('#updateRangeButton').hide();
		$('#updateRangeButton').text(__s.update_search_range);
		$('#updateButton').hide();
		$(function(){
			$('textarea#enterRange').on('input', function(e){
				this.timer && clearTimeout(this.timer);
				var timeoutPeriod = (step.touchDevice) ? 600 : 300;
				this.timer = setTimeout(step.searchSelect.handleKeyboardInput, timeoutPeriod, e);
			});
		});
	},

	_updateRange: function() {
		var keyboardInput = $('textarea#enterRange').val();
		if (typeof keyboardInput === "string") {
			if (keyboardInput === "") keyboardInput = "Gen-Rev"
			this.searchRange = keyboardInput;
			this.goBackToPreviousPage();
		}
		else {
			$('#searchSelectError').text("");
			var allSelectedBooks = "";
			for (var i = 0; i < 3; i++) {
				var curGroup;
				var idPrefix;
				if (i == 0) {
					curGroup = this.groupsOT;
					idPrefix = '#ot_tableg';
				}
				else if (i == 1) {
					curGroup = this.groupsNT;
					idPrefix = '#nt_tableg';
				}
				else if (i == 2) {
					curGroup = this.groupsOther;
					idPrefix = '#ob_tableg';
				}
				for (var j = 0; j < curGroup.length; j++) {
					for (var k = 0; k < curGroup[j].bookOrderPos.length; k++) {
						if (curGroup[j].bookOrderPos[k] > -1) {
							if ( ($(idPrefix + j + 'b' + k).hasClass('stepPressedButton')) &&
								 (curGroup[j].bookOrderPos[k] > -1) ) {
								this.bookOrder[curGroup[j].bookOrderPos[k]][1] = true;
								allSelectedBooks += "," + this.bookOrder[curGroup[j].bookOrderPos[k]][0];
							}
							else this.bookOrder[curGroup[j].bookOrderPos[k]][1] = false;
						}
					}
				}
			}
			var start = -1;
			var end = -1;
			var result = "";
			for (var i = 0; i < this.bookOrder.length; i++) {
				if (this.bookOrder[i][1]) {
					if (start === -1) start = i;
					end = i;
				}
				else {
					result += this._createSingleRange(start, end);
					start = -1;
					end = -1;
				}
			}
			result += this._createSingleRange(start, end);
			if (result.length > 0) this.searchRange = result.replace(/,$/, '');
			else this.searchRange = "Gen-Rev";
			this.rangeWasUpdated = true;
			if (typeof step.util === "undefined") {
				var element = document.getElementById("rangeModal");
				if (element) {	
					$('#rangeModal').modal('hide');
					$('#rangeModal').modal({
						show: false
					});
					if (element.parentNode) element.parentNode.removeChild(element);
				}
				filterByRange(allSelectedBooks);
			}
			else this.goBackToPreviousPage();
		}
	},

	_createSingleRange: function(start, end) {
		var result = '';
		if (start !== -1) {
			var result = this.bookOrder[start][0];
			if (start !== end) {
				result += '-';
				result += this.bookOrder[end][0];
			}
			result += ',';
		}
		return result;
	},

	_buildBookTable: function() {
		var translationType = this._getTranslationType();
		if (((this.userLang.toLowerCase().indexOf("en") == 0) || (this.userLang.toLowerCase().indexOf("es") == 0) || (this.userLang.toLowerCase().indexOf("zh") == 0)) &&
			(translationType !== "")) {
			this._buildBookHTMLTable(translationType);
		}
		else {
			var url = SEARCH_AUTO_SUGGESTIONS + "%20%20/" + EXAMPLE_DATA + "%3D" + REFERENCE + URL_SEPARATOR + LIMIT + "%3D" + REFERENCE + URL_SEPARATOR + VERSION + "%3D" + this.version + URL_SEPARATOR + "?lang=" + this.userLang;
			$.ajaxSetup({async: false});
			$.getJSON(url, function (data) {
				step.searchSelect._buildBookHTMLTable(data);
			}).fail(function() {
                changeBaseURL();
            });
			$.ajaxSetup({async: true});
		}	
	},

	_getTranslationType: function() {
		if (typeof step.util === "undefined") return "OTNT"; // probably called from the split.html or related doc
		var versionAltName = '';
		var data = step.util.activePassage().get("searchTokens") || [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].itemType === VERSION) {
				this.version = data[i].item.initials;
				versionAltName = data[i].item.shortInitials;
				break;
			}
		}
		var lowerCaseVersion = ' ' + this.version.toLowerCase() + ' ';
		versionAltName = ' ' + versionAltName.toLowerCase() + ' ';
		var translationType = "";
		if ((step.passageSelect.translationsWithPopularBooksChapters.indexOf(lowerCaseVersion) > -1) || (step.passageSelect.translationsWithPopularBooksChapters.indexOf(versionAltName) > -1)) translationType = "OTNT";
		else if ((step.passageSelect.translationsWithPopularNTBooksChapters.indexOf(lowerCaseVersion) > -1) || (step.passageSelect.translationsWithPopularNTBooksChapters.indexOf(versionAltName) > -1)) translationType = "NT";
		else if ((step.passageSelect.translationsWithPopularOTBooksChapters.indexOf(lowerCaseVersion) > -1) || (step.passageSelect.translationsWithPopularOTBooksChapters.indexOf(versionAltName) > -1)) translationType = "OT";
		return translationType;		
	},

	_buildBookHTMLTable: function(data) {
		var counter = 0;
		var notSeenNT = true;
		var typlicalBooksChapters = false;
		var start = 0;
		var end = 0;
		var arrayOfTyplicalBooksAndChapters;
		if (typeof data === "string") {
			if (data === "OTNT") end = 66;
			else if (data === "OT") end = 39;
			else if (data === "NT") {
				start = 39;
				end = 66;
			}
			data = step.passageSelect.osisChapterJsword;
			typlicalBooksChapters = true;
			arrayOfTyplicalBooksAndChapters = JSON.parse(__s.list_of_bibles_books);
		}
		else end = data.length;
		this.groupsOther = [{groupName: 'Other', show: false, books: [], bookOrderPos: []}];
		this.bookOrder = [];
		this.idx2BookOrder = {};
		bookOrderPos = -1;
		for (var i = start; i < end; i++) {
			bookOrderPos ++;
			var currentOsisID;
			var shortNameToDisplay;
			var longNameToDisplay;
			if (typlicalBooksChapters) {
				currentOsisID = (data[i].length === 4) ? data[i][3] : data[i][0];
				longNameToDisplay = currentOsisID;
				shortNameToDisplay = currentOsisID;
			}
			else {
				currentOsisID = data[i].suggestion.osisID;
				longNameToDisplay = data[i].suggestion.fullName;
				shortNameToDisplay = (this.userLang.toLowerCase().indexOf("en") == 0) ? currentOsisID : data[i].suggestion.shortName.replace(/ /g, "").substr(0, 6);
			}
			var longID = currentOsisID;
			var posOfBook = this.idx2osisChapterJsword[currentOsisID.toLowerCase()];
			if (posOfBook > -1) {
				if (typeof step.passageSelect.osisChapterJsword[posOfBook][3] !== "undefined") longID = step.passageSelect.osisChapterJsword[posOfBook][3];
				if (typeof arrayOfTyplicalBooksAndChapters !== "undefined") {
					longNameToDisplay = arrayOfTyplicalBooksAndChapters[posOfBook][0];
					shortNameToDisplay = (arrayOfTyplicalBooksAndChapters[posOfBook].length === 2) ? arrayOfTyplicalBooksAndChapters[posOfBook][1] : currentOsisID;
				}
			}
			this.bookOrder.push([currentOsisID, false, longID, shortNameToDisplay, longNameToDisplay]);
			this.idx2BookOrder[currentOsisID] = bookOrderPos;
			if (currentOsisID != longID) this.idx2BookOrder[longID] = bookOrderPos;
			
			var found = false;
			for (j = 0; j < this.groupsOT.length; j ++) {
				var pos = this._isBookInGroup(this.groupsOT[j], currentOsisID);
				if (pos > -1) {
					this.groupsOT[j].show = true;
					this.groupsOT[j].bookOrderPos[pos] = bookOrderPos;
					found = true;
					break;
				}
			}
			if (!found) for (j = 0; j < this.groupsNT.length; j ++) {
				var pos = this._isBookInGroup(this.groupsNT[j], currentOsisID);
				if (pos > -1) {
					this.groupsNT[j].show = true;
					this.groupsNT[j].bookOrderPos[pos] = bookOrderPos;
					found = true;
					break;
				}
			}
			if (!found) {
				this.groupsOther[0].show = true;
				this.groupsOther[0].books.push(-1);
				this.groupsOther[0].bookOrderPos.push(bookOrderPos);
			}
		}
		var browserWidth = $(window).width();
		var columns = 7;
		if (browserWidth < 1100) {
			columns = 6;
			if (browserWidth < 800) columns = 4;
		}
		this._fillBooksTable(this.groupsOT, columns, 'ot_table');
		this._fillBooksTable(this.groupsNT, columns, 'nt_table');
		this._fillBooksTable(this.groupsOther, columns, 'ob_table');
	},

	_isBookInGroup: function(groupOfBooks, searchForBookName) {
		for (var i = 0; i < groupOfBooks.books.length; i ++) {
			if ((searchForBookName == step.passageSelect.osisChapterJsword[groupOfBooks.books[i]][0]) ||
				(searchForBookName == step.passageSelect.osisChapterJsword[groupOfBooks.books[i]][3])) return i;
		}
		return -1;
	},

	_getBookDisplayName: function(arrayIndex) {
		return [this.bookOrder[arrayIndex][4], this.bookOrder[arrayIndex][3]];
	},

	_fillBooksTable: function(groupsOfBooks, columns, htmlID) {
		var tableHTML = "";
		var trHeight = 29;
		var fontSize = 12;
		for (j = 0; j < groupsOfBooks.length; j ++) {
			var rowsForThisGroup = Math.ceil(groupsOfBooks[j].bookOrderPos.length / (columns - 1));
			var rowHeight = trHeight * rowsForThisGroup;
			if (groupsOfBooks[j].show) {
				tableHTML += '<tr style="height:' + (trHeight + 1) + 'px"><td rowspan="' + rowsForThisGroup + '">' +
					'<button id="' + htmlID + 'g' + j + '"' +
					'type="button" class="stepButton stepPressedButton" style="font-size:' + fontSize + 'px;width:100%;min-height:' +  rowHeight + 'px" ' +
					'title="'  + __s.click_to_select + ' ' + __s.all + ' ' + groupsOfBooks[j].groupName  + ' ' + __s.bible_book + '" ' +
					'onclick=step.searchSelect._userClickedCategory(this.id)>' +
					'<i>' + groupsOfBooks[j].groupName + ':</i></button>' +
					'</td>'; 
				var currentColumn = 2; // first column used by group name
				for (k = 0; k < groupsOfBooks[j].bookOrderPos.length; k++) {
					if (groupsOfBooks[j].bookOrderPos[k] > -1) {
						if (currentColumn === 1) {
							tableHTML += '<tr style="height:' + (trHeight + 1) + 'px">';
							currentColumn = 2; // first column used by group name
						}
						var displayName = this._getBookDisplayName(groupsOfBooks[j].bookOrderPos[k]);
						tableHTML += '<td>' +
							'<button id="' + htmlID + 'g' + j + 'b' + k + '" ' +
							'title="'  + __s.click_to_select + ' ' + displayName[0] + '" ' +
							// height used to be 95%
							'type="button" class="stepButton stepPressedButton" style="font-size:' + fontSize + 'px;width:95%;height:' + (trHeight - 2) + 'px" ' + 'onclick=step.searchSelect._userClickedBook(this.id)>' + 
							displayName[1] +
							'</button>' +
							'</td>';
						currentColumn++;
						if (currentColumn > columns) {
							currentColumn = 1;
							tableHTML += '</tr>';
						}
					}
				}
				tableHTML += '</tr>';
			}
		}
		if (tableHTML.length > 0) {
			if (htmlID === 'ob_table') $('#other_books_hdr').text('Other Books');
			var bt = this._buildBookTableHeader(columns, htmlID);
			$('#' + htmlID).append(this._buildBookTableHeader(columns, htmlID) + tableHTML + '</table>');
			if (htmlID.substr(0, 2) === "nt") $("#nt_hdr").show();
			else if (htmlID.substr(0, 2) === "ot") $("#ot_hdr").show();
		}
	},

	_userClickedTestament: function(clicked_id) {
		var clicked_id2 = '#' + clicked_id;
		$('#searchSelectError').text(__s.click_update_when_finish);
		$('#updateRangeButton').show();
		if ($(clicked_id2).hasClass('stepPressedButton')) {
			$(clicked_id2).removeClass('stepPressedButton');
			$("button[id^='" + clicked_id.substring(0, 2) + "_tableg']").each(function (i, el) {
				$(el).removeClass('stepPressedButton');
			});
			$('#updateFeedback').text(__s.removed + " \"" + $(clicked_id2).text().replace(/:$/, '') + "\".");
		}
		else {
			$(clicked_id2).addClass('stepPressedButton');
			$("button[id^='" + clicked_id.substring(0, 2) + "_tableg']").each(function (i, el) {
				$(el).addClass('stepPressedButton');
			});
			$('#updateFeedback').text(__s.added + " \"" + $(clicked_id2).text().replace(/:$/, '') + "\".");
		}
	},

	_userClickedCategory: function(clicked_id) {
		var clicked_id2 = '#' + clicked_id;
		$('#searchSelectError').text(__s.click_update_when_finish);
		$('#updateRangeButton').show();
		if ($(clicked_id2).hasClass('stepPressedButton')) {
			$(clicked_id2).removeClass('stepPressedButton');
			$("button[id^='" + clicked_id + "b']").each(function (i, el) {
				$(el).removeClass('stepPressedButton');
			});
			$(clicked_id2.substring(0, 3) + '_hdr').removeClass('stepPressedButton');
			$('#updateFeedback').text(__s.removed + " \"" + $(clicked_id2).text().replace(/:$/, '') + "\".");
		}
		else {
			$(clicked_id2).addClass('stepPressedButton');
			$("button[id^='" + clicked_id + "b']").each(function (i, el) {
				$(el).addClass('stepPressedButton');
			});
			this._checkHeaderButton(clicked_id);
			$('#updateFeedback').text(__s.added + " \"" + $(clicked_id2).text().replace(/:$/, '') + "\".");
		}
	},

	_userClickedBook: function(clicked_id) {
		var clicked_id2 = '#' + clicked_id;
		$('#searchSelectError').text(__s.click_update_when_finish);
		$('#updateRangeButton').show();
		if ($(clicked_id2).hasClass('stepPressedButton')) {
			$(clicked_id2).removeClass('stepPressedButton');
			var regex = /b\d{1,2}$/;
			var found = clicked_id.match(regex);
			if (found !== null) {
				var tmpID = clicked_id.substring(0, clicked_id.length - found.toString().length);
				$('#' + tmpID).removeClass('stepPressedButton');
			}
			$(clicked_id2.substring(0, 3) + '_hdr').removeClass('stepPressedButton');
			$('#updateFeedback').text(__s.removed + " \"" + $(clicked_id2).text() + "\".");
		}
		else {
			$(clicked_id2).addClass('stepPressedButton');
			var regex = /b\d{1,2}$/;
			var found = clicked_id.match(regex);
			if (found !== null) {
				var tmpID = clicked_id.substring(0, clicked_id.length - found.toString().length);
				var allOn = true;
				$("button[id^='" + tmpID + "b']").each(function (i, el) {
					if (!($(el).hasClass('stepPressedButton'))) allOn = false;
				});
				if (allOn) {
					$('#' + tmpID).addClass('stepPressedButton');
					this._checkHeaderButton(clicked_id);
				}
				$('#updateFeedback').text(__s.added + " \"" + $(clicked_id2).text() + "\".");
			}
		}
	},

	_checkHeaderButton: function(clicked_id) {
		var idPrefix = clicked_id.substring(0, 2);
		var numOfGroups = 0;
		//$('#searchSelectError').text(__s.click_update_when_finish);
		//$('#updateRangeButton').show();
		if (idPrefix === 'ot') numOfGroups = this.groupsOT.length;
		else if (idPrefix === 'nt') numOfGroups = this.groupsNT.length;
		idPrefix = '#' + idPrefix + '_tableg';
		var allOn = true;
		for (var i = 0; i < numOfGroups; i++) {
			if (!($(idPrefix + i).hasClass('stepPressedButton'))) allOn = false;
		}
		if (allOn) $(idPrefix.substr(0, 3) + '_hdr').addClass('stepPressedButton');
	},

	_buildBookTableHeader: function(columns, htmlID) {
		var modalWidth = $('#' + htmlID).width();
		var firstColumnSize = 145;
		var columnSize = Math.max(Math.floor((modalWidth - firstColumnSize) / (columns - 1)), 10); // avoid negative length.  I have seen the modalWiidt is 0
		html = '<table>' +
			 '<colgroup>' +
			 '<col span="1" style="width:' + firstColumnSize + 'px;">';
		for (var i = 1; i < columns; i++) {
			html += '<col span="1" style="width:' + columnSize + 'px;">';
		}
		html += '</colgroup>';
		return html;
	},
	wordsWithNoInflection: function(string) {
		chars = string.split('');
		for (var i = 0; i < chars.length; i++) {
			var charCode = chars[i].charCodeAt(0);
			if ((charCode >= 19968) && (charCode <= 40959)) // common Chinese characters 4E00-9FFF
				return true;
		}
		return false;
	},
	getGlossInUserLanguage: function(dataSuggestion) {
		if (dataSuggestion.strongNumber == undefined)
			return dataSuggestion.gloss;
		var checkLang = step.userLanguageCode.toLowerCase();
		if ((checkLang === "es") && (typeof dataSuggestion._es_Gloss === "string")) return dataSuggestion._es_Gloss;
		if (((checkLang === "zh_tw") || (checkLang === "zh_hk")) && (typeof dataSuggestion._zh_tw_Gloss === "string")) return dataSuggestion.gloss + " (" + dataSuggestion._zh_tw_Gloss + ")";
		if ((checkLang.substring(0,2) === "zh") && (typeof dataSuggestion._zh_Gloss === "string")) return dataSuggestion.gloss + " (" + dataSuggestion._zh_Gloss + ")";
		if (step.defaults.langWithTranslatedLex.indexOf(checkLang) == -1) return dataSuggestion.gloss;
		fetch("https://us.stepbible.org/html/lexicon/" + checkLang + "_json/" +
			dataSuggestion.strongNumber + ".json")
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			var gloss = data.gloss;
			var pos = gloss.indexOf(":");
			if (pos > -1)
				gloss = gloss.substring(pos+1).trim();
			step.util.updateWhenRendered(".src_gloss_" + data.strong, " [" + gloss.trim() + "]", 0);
		});
		return dataSuggestion.gloss + '<span class="src_gloss_' + dataSuggestion.strongNumber + '"></span>';
	},
	_handleEnteredSearchWord: function(limitType, previousUserInput, userPressedEnterKey) {
		$('#quickLexicon').remove();
		if ((typeof limitType === "undefined") || (limitType === null)) limitType = "";
		var userInput = '';
		$('textarea#userTextInput').show();
		$('#searchButton').show();
		$("#hd4").text(__s.enter_search_word);
		$("#column1width").width("30%");
		$(".search-type-column").show();
		$('#warningMessage').text('');
		if ((typeof previousUserInput === "undefined") || (previousUserInput === null))  userInput =  $('textarea#userTextInput').val();
		else {
			userInput = previousUserInput;
			$('textarea#userTextInput').text(userInput);
		}
		userInput = userInput.replace(/[\n\r]/g, ' ').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
		if ((userInput.length > 1) || ((step.searchSelect.userLang.toLowerCase().indexOf("zh") == 0) && (userInput.length > 0))) {
			// If user enter a Lucene standard stop word, let the user know.
			if ((" a an and are as at be but by for if in into is it no not of on or such that the their then there these they this to was will with ".indexOf(" " + userInput.toLowerCase() + " ") > -1) &&
				($("#select_advanced_search").hasClass("checked"))) {
				$('#warningMessage').text('Search for extremely common words might not be found in Fuzzy, Greek and Hebrew searches.');
				setTimeout(function(){
                    $('#warningMessage').text('');
                }, 5000);
			}
			else if ($('#warningMessage').html().indexOf("common word") > -1)
				$('#warningMessage').text('');
			$('#updateButton').hide();
			var url;
			if ((limitType === "") && (step.searchSelect.searchOnSpecificType === ""))
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version + URL_SEPARATOR + "?lang=" + step.searchSelect.userLang;
			else {
				if (limitType === "") limitType = step.searchSelect.searchOnSpecificType;
				else {
					step.searchSelect.searchOnSpecificType = limitType;
					step.searchSelect.searchModalCurrentPage = 2;
				}
				$('#srchModalBackButton').show();
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version +
					URL_SEPARATOR + LIMIT + "%3D" + limitType +
					URL_SEPARATOR + "?lang=" + step.searchSelect.userLang;
			}
			for (var i = 0; i < step.searchSelect.numOfSearchTypesToDisplay; i++) {
				$('#searchResults' + step.searchSelect.searchTypeCode[i]).empty();
			}
			step["SearchCount" + GREEK] = 0;
			step["SearchCount" + GREEK_MEANINGS] = 0;
			step["SearchCount" + HEBREW] = 0;
			step["SearchCount" + HEBREW_MEANINGS] = 0;
			step["SearchCount" + MEANINGS] = 0;
			step["SearchCount" + SUBJECT_SEARCH] = 0;
			step["SearchCount" + TEXT_SEARCH] = 0;
			$.getJSON(url, function (data) {
				var alreadyShownStrong = [];
				for (var i = 0; i < data.length; i++) {
					var skipBecauseOfZeroCount = false;
					var suggestionType = data[i].itemType;
					var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(suggestionType);
					var currentSearchSuggestionElement = $('#searchResults' + step.searchSelect.searchTypeCode[searchResultIndex]);
					switch(suggestionType) {
						case GREEK:
						case GREEK_MEANINGS:
						case HEBREW:
						case HEBREW_MEANINGS:
						case MEANINGS:
						case SUBJECT_SEARCH:
						case TEXT_SEARCH:
							var text2Display = "";
							if (data[i].grouped) {
								var currentHTML = currentSearchSuggestionElement.html()
								if (typeof data[i].extraExamples !== "undefined") {
									if ((typeof currentHTML === "string") && ((currentHTML.match(/<br>/g) || []).length < 4)) {
										for (var k = 0; k < data[i].extraExamples.length; k++) {
											if (k > 0) text2Display += ", ";
											if ((suggestionType === GREEK) || (suggestionType === HEBREW))
												text2Display += '<i class="srchTransliteration>' + data[i].extraExamples[k].stepTransliteration + '</i>';
											else if ((suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW_MEANINGS) || (suggestionType === MEANINGS))
												text2Display += data[i].extraExamples[k].gloss;
											else if (suggestionType === SUBJECT_SEARCH)
												text2Display += data[i].extraExamples[k].value;
										}
										if (text2Display.length == 0) console.log('group, but no examples');
										else if (currentSearchSuggestionElement.text().indexOf("list all with similar") == -1) {
											var text2Display = '&nbsp;&nbsp;&nbsp;<b>';
											if ((suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW_MEANINGS))
												text2Display += 'list all with similar meaning...';
											else if ((suggestionType === GREEK) || (suggestionType === HEBREW))
												text2Display += 'list all with similar ' + suggestionType.charAt(0).toUpperCase() + suggestionType.slice(1).toLowerCase() + ' spelling...';
											else
												text2Display += __s.more
											text2Display += '</b>...';
											if (currentHTML !== "") currentSearchSuggestionElement.append("<br>");
											currentSearchSuggestionElement.append('<a onmousemove="javascript:$(\'#quickLexicon\').remove()" onmouseover="javascript:$(\'#quickLexicon\').remove()" style="padding:0px;" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' + suggestionType + '\')">' + text2Display + "</a>");
										}
									}
								}
								else {
									if ((typeof currentHTML === "string") && (currentHTML !== ""))
										currentSearchSuggestionElement.append("<br>");
									currentSearchSuggestionElement.append('<span>There are ' + data[i].count + ' more options. Enter a longer search word to get more specific search suggestions.</span>');
								}
							}
							else {
								var str2Search = "";
								var suffixToDisplay = "";
								var suffixTitle = "";
								var activePassageData = step.util.activePassage().get("searchTokens") || [];
								var allVersions = "";
								for (var l = 0; l < activePassageData.length; l++) {
									var itemType = activePassageData[l].itemType ? activePassageData[l].itemType : activePassageData[l].tokenType
									if (itemType === VERSION) {
										if (allVersions !== "") allVersions += ",";
										allVersions += activePassageData[l].item.shortInitials;
									}
								}
								if (suggestionType === SUBJECT_SEARCH) {
									text2Display = data[i].suggestion.value;
									str2Search = text2Display;
								}
								else if (suggestionType === MEANINGS) {
									text2Display = step.searchSelect.getGlossInUserLanguage(data[i].suggestion);
									str2Search = text2Display;
								}
								else if (suggestionType === TEXT_SEARCH) {
									if (data[i].suggestion.text.search(/^[HG]\d/i) == -1) { // Make sure it is not a STRONG number (e.g.: H0001)
										text2Display = data[i].suggestion.text;
										$('#userTextInput').attr('data-lastsearchword', text2Display);
										str2Search = text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22');
										if (str2Search.indexOf("%22") == -1) {
											var strings2Search = str2Search.split(" ");
											var foundOr = false;
											if (strings2Search.length > 1) {
												var tmp = [];
												for (var j = 0; j < strings2Search.length; j ++) {
													var trimString = strings2Search[j].trim();
													if (trimString.length > 0) {
														if (trimString.toLowerCase() === "and") {
														}
														else if (trimString.toLowerCase() === "or") {
															foundOr = true;
														}
														else tmp.push(trimString);
													}
												}
												strings2Search = tmp;
												str2Search = strings2Search.join(" ");
												text2Display = str2Search;
											}
											if (strings2Search.length > 1) {
												var defaultSearchString = "";
												var defaultMouseOverTitle = "";
												if (!foundOr) {
													defaultSearchString = "<b>" + __s.default_search + "</b>";
													defaultMouseOverTitle = __s.default_search_mouse_over_title;
												}
												step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement, 
													str2Search, suggestionType, strings2Search.join(" <sub>and</sub> "), "", defaultSearchString, defaultMouseOverTitle,
													limitType, null, false, false, "", ""); //, hasHebrew, hasGreek);
												defaultSearchString = "";
												defaultMouseOverTitle = "";
												if (foundOr) {
													defaultSearchString = "<b>" + __s.default_search + "</b>";
													defaultMouseOverTitle = __s.default_search_mouse_over_title;
												}
												step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement, 
													str2Search, suggestionType, strings2Search.join(" <sub>or</sub> "),	"", defaultSearchString, defaultMouseOverTitle,
													limitType, null, false, false, "", ""); //, hasHebrew, hasGreek);
												text2Display = '"' + str2Search + '"';
												str2Search = '%22' + str2Search + '%22';
												$("td.search-type-column.select-text").html(__s.search_type_desc_text + ":");
											}
											else {
												if ((str2Search.slice(-1) !== "*") && (!step.searchSelect.wordsWithNoInflection(str2Search))) {
													step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement,
														str2Search, suggestionType, text2Display, "", "", "",
														limitType, null, false, false, "", ""); // , hasHebrew, hasGreek);
													text2Display = str2Search + "* (" + __s.words_that_start_with + " " + str2Search + ")";
													str2Search += "*";
													$("td.search-type-column.select-text").html(__s.search_type_desc_text);
													// Add search_type_desc_text2 to description, if user's language has a definition for it. English already has a definition for it.
													if ((step.userLanguageCode === "en") || (__s.search_type_desc_text2.indexOf("+ words starting with") == -1))
														$("td.search-type-column.select-text").html(__s.search_type_desc_text + __s.search_type_desc_text2);
												}
												suffixToDisplay = "<b>" +__s.default_search + "</b>";
												suffixTitle = __s.default_search_mouse_over_title;
											}
										}
									}
								}
								else {
									str2Search = data[i].suggestion.strongNumber;
									var strongWithoutAugment = str2Search;
									var strongShownToUser = str2Search;
                                    var isAugmentedStrong = false;
									var augStrongSameMeaning = null;
									if (strongWithoutAugment.search(/^([GH]\d{4,5})[A-Za-z]$/) == 0) {
										augStrongSameMeaning = [];
										strongWithoutAugment = RegExp.$1;
										strongShownToUser = strongWithoutAugment + "*";
                                        isAugmentedStrong = true;
										if ((suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW_MEANINGS)) {
											for (var k = 0; k < data.length; k++) {
												if (suggestionType === data[k].itemType) {
													if ((typeof data[k].suggestion === "object") &&
														(typeof data[k].suggestion.strongNumber === "string") &&
														(data[k].suggestion.strongNumber.slice(0, -1) === strongWithoutAugment)) {
														augStrongSameMeaning.push(data[k].suggestion.strongNumber);
													}
												}
											}
										}
                                    }
									if (alreadyShownStrong.includes(suggestionType + strongWithoutAugment)) continue;
									alreadyShownStrong.push(suggestionType + strongWithoutAugment);
									suffixToDisplay = step.searchSelect.getGlossInUserLanguage(data[i].suggestion);
									var hasDetailLexInfo = (typeof data[i].suggestion._detailLexicalTag === "string") && (data[i].suggestion._detailLexicalTag !== "");
									text2Display = 
										'<i class="srchTransliteration">' + data[i].suggestion.stepTransliteration + '</i>' +
										'<span class="srchParathesis"> (</span>' +
										'<span class="srchOriginal_Language">' + data[i].suggestion.matchingForm + '</span>' +
										'<span class="srchSpaceStrong"> </span>' +
										'<span class="srchStrong_number">' + strongShownToUser + '</span>' +
										'<span class="srchParathesis">)</span>';
									if ((hasDetailLexInfo) || ((isAugmentedStrong) && (augStrongSameMeaning.length > 1))) {
											text2Display += " etc.";
									}
									if ((isAugmentedStrong) || (hasDetailLexInfo)) {
										step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement,
											strongWithoutAugment, suggestionType, text2Display, "", suffixToDisplay, "",
											limitType, augStrongSameMeaning, hasDetailLexInfo, false, userInput, allVersions); //, hasHebrew, hasGreek);
										continue;
									}
									else {
										var curWord = { vocabInfos: [{ strongNumber: data[i].suggestion.strongNumber, freqList: data[i].suggestion.popularityList }] };
										step.util.lookUpFrequencyFromMultiVersions(curWord, allVersions);
										var hasBothTestaments = ((typeof curWord.vocabInfos[0].versionCountOT === "number") && (curWord.vocabInfos[0].versionCountOT > 0) &&
											(typeof curWord.vocabInfos[0].versionCountNT === "number") && (curWord.vocabInfos[0].versionCountNT > 0));
										var countDisplay = step.util.formatFrequency(curWord.vocabInfos[0], parseInt(data[i].suggestion.popularity), hasBothTestaments,
											curWord.vocabInfos[0].notInBibleSelected);
										if (countDisplay.indexOf(">0 x") > -1) skipBecauseOfZeroCount = true;
										text2Display += '<span class="srchFrequency"> ' + countDisplay + '</span>';
									}
								}
								if ((!skipBecauseOfZeroCount) || (limitType !== "")) {
									step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement,
										str2Search, suggestionType, text2Display, "", suffixToDisplay, suffixTitle,
										limitType, null, false, false, "", allVersions); //, hasHebrew, hasGreek);
								}
							}
							break;
						case REFERENCE:
							if ((data[i].suggestion.sectionType === 'PASSAGE') && (!data[i].suggestion.wholeBook)) {
								pos = step.searchSelect.searchUserInput.replace(/\s\s+/, ' ').search(/^\s?[\da-z][a-z]+[\s.]?\d/i);
								if (pos > -1) {
									if (userPressedEnterKey) step.searchSelect.goToPassage(data[0].suggestion.osisID);
									$('#warningMessage').empty();
									$('#warningMessage').append('<a href="javascript:step.util.showVideoModal(\'Psalm23.gif\', 15)">You can only search for words and subjects here.  Click to learn how to select passage.<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>');
								}
							}
							break;
						default:
							alert("Unknown result: " + suggestionType);
							break;
					}
				}
				var showedSomething = false;
				var limitTypeToCompare = limitType;
				var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(limitTypeToCompare);
				// Only needed if we combine Greek / Greek Meaning and Hebrew / Hebrew Meaning
				// if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
				// 	limitTypeToCompare = step.searchSelect.searchTypeCode[searchResultIndex - 2];
				for (var l = 0; l < step.searchSelect.numOfSearchTypesToDisplay; l++) {
					if (limitTypeToCompare === "") {
						$('.select-' + step.searchSelect.searchTypeCode[l]).show();
						showedSomething = true;
					}
					else if (step.searchSelect.searchTypeCode[l] === limitTypeToCompare) {
						$('.select-' + step.searchSelect.searchTypeCode[l]).show();
						showedSomething = true;
					}
					else $('.select-' + step.searchSelect.searchTypeCode[l]).hide();
				}
				if (showedSomething) {
					$('#suggest_search_words').html('<i>' + __s.click_on_suggest_word + '</i>');
					$('#suggest_search_words').css('color', "var(--clrStrongText)");
				}
				else {
					$('#suggest_search_words').html(__s.suggested_search_words);
					$('#suggest_search_words').css('color', "var(--clrText)");
				}
			}).fail(function() {
                changeBaseURL();
            });
			step.searchSelect.searchUserInput = userInput;
			step.searchSelect._updateDisplayBasedOnOptions();
		}
		else {
			for (l = 0; l < step.searchSelect.numOfSearchTypesToDisplay; l++) {
				$('#searchResults' + step.searchSelect.searchTypeCode[l]).text("");
			}
			$('#suggest_search_words').html(__s.suggested_search_words);
			$('#suggest_search_words').css('color', "var(--clrText)");
			showPreviousSearch(); // The update previous search button might need to be displayed if user has includes previous search 
		}
	},
	_getSuggestedFrequency: function(curWord, allVersions) {
		var vocabMorphFromJson = { vocabInfos: [ curWord ] };
		step.util.lookUpFrequencyFromMultiVersions(vocabMorphFromJson, allVersions);
		var curOT = (typeof vocabMorphFromJson.vocabInfos[0].versionCountOT === "number") ? vocabMorphFromJson.vocabInfos[0].versionCountOT : 0;
		var curNT = (typeof vocabMorphFromJson.vocabInfos[0].versionCountNT === "number") ? vocabMorphFromJson.vocabInfos[0].versionCountNT : 0;
		return [curOT, curNT, vocabMorphFromJson.vocabInfos[0].notInBibleSelected];
	},
	_getSuggestedWordsInfo: function(data, strongNum, augStrongSameMeaning, allVersions) {
		var augStrongWithMostOccurrence = 0;
		var detailLexSearchStrongs = [];
		var selectedGloss = "";
		var result = 0;
		var frequency = 0;
		var frequencyOT = 0;
		var frequencyNT = 0;
		var notInBibleSelected = "";
		var allDStrongNums = [];
		var allOtherStrongNums = [];
		var freqList = "";
		for (var i = 0; i < data.length; i++) {
			var suggestionType = data[i].itemType;
			if (data[i].grouped) {
				alert("There should be not group here");
				continue;
			}
			if ((suggestionType === GREEK) || (suggestionType === HEBREW)) {
				if ((Array.isArray(augStrongSameMeaning)) && (augStrongSameMeaning.length > 0) && (!augStrongSameMeaning.includes(data[i].suggestion.strongNumber)))
					continue;
				if (!allDStrongNums.includes(data[i].suggestion.strongNumber)) {
					allDStrongNums.push(data[i].suggestion.strongNumber);
					frequency += parseInt(data[i].suggestion.popularity);
					var resultArray = this._getSuggestedFrequency(data[i].suggestion, allVersions);
					frequencyOT += resultArray[0];
					frequencyNT += resultArray[1];
					notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, resultArray[2]);
					if ((!Array.isArray(augStrongSameMeaning)) || ((Array.isArray(augStrongSameMeaning)) && (augStrongSameMeaning.length == 1)))
						freqList = data[i].suggestion.popularityList;
				}
				str2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag);
				if (detailLexSearchStrongs.includes(str2Search)) continue; // Don't show the same search suggestion twice
				detailLexSearchStrongs.push(str2Search);
				if ((Array.isArray(data[i].suggestion._detailLexicalTag)) && (data[i].suggestion._detailLexicalTag.length > 0)) {
					result += data[i].suggestion._detailLexicalTag.length;
					for (var j = 0; j < data[i].suggestion._detailLexicalTag.length; j ++) {
						if (data[i].suggestion._detailLexicalTag[j][1].indexOf(strongNum) != 0) {
							if (!allOtherStrongNums.includes(data[i].suggestion._detailLexicalTag[j][1])) {
								allOtherStrongNums.push(data[i].suggestion._detailLexicalTag[j][1]);
								frequency += parseInt(data[i].suggestion._detailLexicalTag[j][3]);
								var curWord = {	strongNumber: data[i].suggestion._detailLexicalTag[j][1],
															  freqList: data[i].suggestion._detailLexicalTag[j][6]};
								var resultArray = this._getSuggestedFrequency(curWord, allVersions);
								frequencyOT += resultArray[0];
								frequencyNT += resultArray[1];
								notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, resultArray[2]);
							}
						}
					}
				}
				else {
					result ++;
				}
				var currentWordPopularity = parseInt(data[i].suggestion.popularity);
				if ((selectedGloss === "") || (currentWordPopularity > augStrongWithMostOccurrence)) {
					selectedGloss = step.searchSelect.getGlossInUserLanguage(data[i].suggestion);
					augStrongWithMostOccurrence = currentWordPopularity;
					notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, resultArray[2]);
				}
			}
			else {
				result ++;
				frequency += parseInt(data[i].suggestion.popularity);
				var resultArray = this._getSuggestedFrequency(data[i].suggestion, allVersions);
				frequencyOT += resultArray[0];
				frequencyNT += resultArray[1];
				notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, resultArray[2]);
			}
		}
		return [selectedGloss, result, allDStrongNums, allOtherStrongNums, frequency, frequencyOT, frequencyNT, freqList, notInBibleSelected];
	},
	addNotInBibleSelected: function(currentNotInBibleSelected, newNotInBibleSelected) {
		if ((typeof newNotInBibleSelected === "string") && (newNotInBibleSelected.length > 0)) {
			if (currentNotInBibleSelected === "")
				currentNotInBibleSelected = newNotInBibleSelected;
			else { // add Bibles without duplicate.
				var newBibles = newNotInBibleSelected.split(",");
				for (var i = 0; i < newBibles.length; i++) {
					var bibles = currentNotInBibleSelected.split(",");
					if (!bibles.includes(newBibles[i]))
						currentNotInBibleSelected += "," + newBibles[i];
				}
			}
		}
		return currentNotInBibleSelected;
	},
	valueInDuplicatStrongOrNot: function(vocabInfo, index, duplicateStrings) {
		// index of 3 is count
		return ((Number.isInteger(vocabInfo[index])) && (index != 3)) ?
				duplicateStrings[vocabInfo[index]] : vocabInfo[index];
	},

	unpackVocabJSON: function (origJsonVar, index) {
		var duplicateStrings = origJsonVar.d;
		var vocabInfo = origJsonVar.v[index];
		var result = {};
		result['grouped'] = false;
		result['maxReached'] = false;
		var suggestion = {};
		suggestion['strongNumber'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 0, duplicateStrings);
		suggestion['gloss'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 1, duplicateStrings);
		suggestion['stepTransliteration'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 2, duplicateStrings);
		suggestion['popularity'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 3, duplicateStrings);
		suggestion['_es_Gloss'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 4, duplicateStrings);
		suggestion['_zh_Gloss'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 5, duplicateStrings);
		suggestion['_zh_tw_Gloss'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 6, duplicateStrings);
		suggestion['matchingForm'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 14, duplicateStrings);
		suggestion['_detailLexicalTag'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 17, duplicateStrings);
		suggestion['type'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 19, duplicateStrings);
		suggestion['_searchResultRange'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 20, duplicateStrings);
		suggestion['popularityList'] = step.searchSelect.valueInDuplicatStrongOrNot(vocabInfo, 21, duplicateStrings);
		result['suggestion'] = suggestion;
		return result;
	},

	getVocabInfoFromSuggestAPI: function (strongNum, limitType, augStrongSameMeaning, allVersions, element, 
		callBack, titleText, text2Display, userInput, isAugStrong,
		needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType) {
		if (step.searchSelect["LASTSUGGESTKEY"] === strongNum + step.searchSelect.version + limitType) {
			data = step.searchSelect["LASTSUGGESTDATA"];
			step.searchSelect._processAdditionalInfoOnStrong(data, strongNum, augStrongSameMeaning, allVersions, element, 
				callBack, titleText, text2Display, userInput, isAugStrong,
				needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
			return;
		}
		var url = SEARCH_AUTO_SUGGESTIONS + strongNum + "/" + VERSION + "%3D" + step.searchSelect.version +
			URL_SEPARATOR + LIMIT + "%3D" + limitType +
			URL_SEPARATOR + "?lang=" + step.searchSelect.userLang;
		$.getJSON(url, function (data) {
			for (var i = 0; i < data.length; i++) {
				if ((typeof data[i].suggestion._detailLexicalTag === "string") && (data[i].suggestion._detailLexicalTag !== "")) {
					data[i].suggestion._detailLexicalTag = JSON.parse(data[i].suggestion._detailLexicalTag);
				}
			}
			step.searchSelect["LASTSUGGESTKEY"] = strongNum + step.searchSelect.version + limitType;
			step.searchSelect["LASTSUGGESTDATA"] = data;
			step.searchSelect._processAdditionalInfoOnStrong(data, strongNum, augStrongSameMeaning, allVersions, element, 
				callBack, titleText, text2Display, userInput, isAugStrong,
				needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
		});

	},

	getVocabInfoForShowAugStrong: function (strongNum, augStrongSameMeaning, origSuggestionType, userInput, allVersions) {
		var limitType = (strongNum.substring(0, 1) === "H") ? HEBREW : GREEK;
		if (step.state.isLocal()) {
			step.searchSelect.processVocabInfoForShowAugStrong(strongNum, limitType, augStrongSameMeaning, origSuggestionType, userInput, allVersions);
			return;
		}
		var strongWithoutAugment = strongNum;
		if (strongWithoutAugment.search(/^([GH]\d{4,5})[A-Za-z]$/) == 0) {
			strongWithoutAugment = RegExp.$1;
		}
		var additionalPath = step.state.getCurrentVersion();
		if (additionalPath !== "") additionalPath += "/";
		$.getJSON("/html/lexicon/" + additionalPath + strongWithoutAugment + ".json", function(origJsonVar) {
			var vocabInfos = [];
			for (var i = 0; i < origJsonVar.v.length; i++) {
				var jsonVar = step.searchSelect.unpackVocabJSON(origJsonVar, i);
				jsonVar['itemType'] = limitType;
				vocabInfos.push(jsonVar);
			}
			step.searchSelect.createDisplayForAugmentedStrong(vocabInfos, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType, allVersions);
		}).error(function() {
			step.searchSelect.processVocabInfoForShowAugStrong(strongNum, limitType, augStrongSameMeaning, origSuggestionType, userInput, allVersions);
		});
	},
	processVocabInfoForShowAugStrong: function(strongNum, limitType, augStrongSameMeaning, origSuggestionType, userInput, allVersions) {
		var url = SEARCH_AUTO_SUGGESTIONS + strongNum + "/" + VERSION + "%3D" + step.searchSelect.version +
			URL_SEPARATOR + LIMIT + "%3D" + limitType +
			URL_SEPARATOR + "?lang=" + step.searchSelect.userLang;
		$.getJSON(url, function (data) {
			for (var i = 0; i < data.length; i++) {
				if ((typeof data[i].suggestion._detailLexicalTag === "string") && (data[i].suggestion._detailLexicalTag !== "")) {
					data[i].suggestion._detailLexicalTag = JSON.parse(data[i].suggestion._detailLexicalTag);
				}
			}
			step.searchSelect["LASTSUGGESTKEY"] = strongNum + step.searchSelect.version + limitType;
			step.searchSelect["LASTSUGGESTDATA"] = data;
			step.searchSelect.createDisplayForAugmentedStrong(data, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType, allVersions);
		}).fail(function() {
			changeBaseURL();
		});
	},

	_getAdditionalInformationOnStrong: function(strongNum, augStrongSameMeaning, allVersions, element, callBack, titleText, text2Display, userInput, isAugStrong,
		needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType) {
			var limitType = (strongNum.substring(0, 1) === "H") ? HEBREW : GREEK;
			if (step.state.isLocal()) {
			step.searchSelect.getVocabInfoFromSuggestAPI(strongNum, limitType, augStrongSameMeaning, allVersions, element, 
				callBack, titleText, text2Display, userInput, isAugStrong,
				needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
			return;
		}
		var strongWithoutAugment = strongNum;
		if (strongWithoutAugment.search(/^([GH]\d{4,5})[A-Za-z]$/) == 0) {
			strongWithoutAugment = RegExp.$1;
		}
		var additionalPath = step.state.getCurrentVersion();
		if (additionalPath !== "") additionalPath += "/";
		$.getJSON("/html/lexicon/" + additionalPath + strongWithoutAugment + ".json", function(origJsonVar) {
			var vocabInfos = [];
			for (var i = 0; i < origJsonVar.v.length; i++) {
				var jsonVar = step.searchSelect.unpackVocabJSON(origJsonVar, i);
				jsonVar['itemType'] = limitType;
				vocabInfos.push(jsonVar);
			}
			step.searchSelect._processAdditionalInfoOnStrong(vocabInfos, strongNum, augStrongSameMeaning, allVersions, element, 
				callBack, titleText, text2Display, userInput, isAugStrong,
				needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
		}).error(function() {
			step.searchSelect.getVocabInfoFromSuggestAPI(strongNum, limitType, augStrongSameMeaning, allVersions, element, 
				callBack, titleText, text2Display, userInput, isAugStrong,
				needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
		});
	},

	_processAdditionalInfoOnStrong: function(data, strongNum, augStrongSameMeaning, allVersions, element, 
		callBack, titleText, text2Display, userInput, isAugStrong,
		needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType) {
		var result = step.searchSelect._getSuggestedWordsInfo(data, strongNum, augStrongSameMeaning, allVersions);
		if (typeof callBack === "function") {
			if (callBack.name === "_addFreqListQTip")
				callBack(augStrongSameMeaning, allVersions, result[7], element);
			else if (callBack.name === "_addLineWithAugStrongOrDetailLexInfo")
				callBack(result, augStrongSameMeaning, titleText, text2Display, userInput, strongNum, isAugStrong,
					element, needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType, allVersions);
		}
	},

	_addFreqListQTip: function(augStrongSameMeaning, allVersions, freqList, element) {
		if ((element) && (augStrongSameMeaning.length == 1)) {
			var freqListElm = step.util.freqListQTip(augStrongSameMeaning[0], freqList, allVersions, "", "");
			element.append('&nbsp;').append(freqListElm);
			step.searchSelect._updateDisplayBasedOnOptions();
		}		
	},

	_addLineWithAugStrongOrDetailLexInfo: function(additionalInfoOnStrong, augStrongSameMeaning, titleText, text2Display, userInput, str2Search, isAugStrong,
		currentSearchSuggestionElement, needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType, allVersions) {
		var numOfForm = additionalInfoOnStrong[1];
		var updatedGloss = additionalInfoOnStrong[0];
		var numOfFormMsg = "";
		if (numOfForm > 1) {
			numOfFormMsg = "<span>(" + numOfForm + " forms)</span>";
		}
		else {
			if ((Array.isArray(augStrongSameMeaning)) && (augStrongSameMeaning.length == 1)) {
				titleText = ' title="' + augStrongSameMeaning[0] + '" ';
				text2Display = text2Display.replace(str2Search + "\*", augStrongSameMeaning[0]);
			}
		}
		var frequency = additionalInfoOnStrong[4];
		var frequencyOT = additionalInfoOnStrong[5];
		var frequencyNT = additionalInfoOnStrong[6];
		var frequencyMsg = step.util.formatFrequency({strongNumber: str2Search, versionCountOT: frequencyOT, versionCountNT: frequencyNT}, frequency, ((frequencyOT > 0) && (frequencyNT > 0)),
			additionalInfoOnStrong[8]);
		text2Display += '<span class="srchFrequency"> ' + frequencyMsg + '</span>';
		var str2Search4ShowAugmentedStrong = str2Search;
		if (isAugStrong) {
			str2Search = additionalInfoOnStrong[2].toString();
			if (updatedGloss !== "") suffixToDisplay = updatedGloss;
		}
		if (additionalInfoOnStrong[3].length > 0) {
			str2Search += "," + additionalInfoOnStrong[3].toString();
			titleText = ' title="' + __s.all + ' forms: ' + str2Search + '" ';
		}
		var goSearchCall = 'step.searchSelect.goSearch(\'' + searchType + '\',\'' + str2Search + '\')';
		var newSuggestion =	$('<a style="padding:0px"' + titleText + ' onclick="javascript:' + goSearchCall + '">' + text2Display + '</a>');
		var showAugmentCall = 'step.searchSelect._showAugmentedStrong(\'' + str2Search4ShowAugmentedStrong + '\',\'' +
			augStrongSameMeaning + '\',\'' + suggestionType + '\',\'' + userInput + '\',\'' + allVersions + '\')';
		step.searchSelect.addMouseOverEvent(searchType, str2Search, "", allVersions.split(',')[0], newSuggestion);
		if (!step.searchSelect.checkDuplicates(goSearchCall, showAugmentCall, numOfFormMsg) ) {
			currentSearchSuggestionElement.append(needLineBreak).append(prefixToDisplay)
				.append(newSuggestion).append(' - ').append(step.searchSelect.buildSuffixTag(suffixToDisplay, suffixTitle))
				.append(' ')
				.append('<a style="padding:0px" title="Select forms" onmousemove="javascript:$(\'#quickLexicon\').remove()"' + 
				' onmouseover="javascript:$(\'#quickLexicon\').remove()"' +
				' href="javascript:' + showAugmentCall + '">' + numOfFormMsg + '</a>');
			if (numOfForm < 2) {
				var freqListElm = step.util.freqListQTip(str2Search, additionalInfoOnStrong[7], allVersions, "", "");
				currentSearchSuggestionElement.append('&nbsp;').append(freqListElm);
				step.searchSelect._updateDisplayBasedOnOptions();
			}
		}
	},

	createFirstLineForAugmentedStrong: function(data, strongNum, origSuggestionType, userInput, limitType, augStrongToShow, allDStrongNums, 
		strongsToInclude, allVersions) {
		var frequencyFromLexicon = 0;
		var frequencyOT = 0;
		var frequencyNT = 0;
		var notInBibleSelected = "";
		var allStrongNumsPlusLexicalGroup = [];
		for (var i = 0; i < data.length; i++) {
			if ((data[i].itemType === GREEK) || (data[i].itemType === HEBREW)) {
				if (!allDStrongNums.includes(data[i].suggestion.strongNumber))
					allDStrongNums.push(data[i].suggestion.strongNumber);
				if ((strongsToInclude.length == 0) ||
					(strongsToInclude.includes(data[i].suggestion.strongNumber))) {
					augStrongToShow[i] = parseInt(data[i].suggestion.popularity);
					var frequencies = [augStrongToShow[i], 0, 0];
					if (typeof data[i].suggestion._detailLexicalTag === "object") {
						frequencies = step.searchSelect.getFrequencyFromDetailLexicalTag(data[i].suggestion.strongNumber, augStrongToShow[i], 
							data[i].suggestion._detailLexicalTag, allVersions);
						notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, frequencies[3]); 
					}
					augStrongToShow[i] = frequencies[0];
					if (!allStrongNumsPlusLexicalGroup.includes(data[i].suggestion.strongNumber)) {
						allStrongNumsPlusLexicalGroup.push(data[i].suggestion.strongNumber);
						frequencyFromLexicon += augStrongToShow[i];
						frequencyOT += frequencies[1];
						frequencyNT += frequencies[2];	
					}
					var otherStrong2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag).split(",");
					for (var count = 0; count < otherStrong2Search.length; count ++) {
						if (!allStrongNumsPlusLexicalGroup.includes(otherStrong2Search[count]))
							allStrongNumsPlusLexicalGroup.push(otherStrong2Search[count]);
					}
				}
			}
		}
		var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(origSuggestionType);
		// Only needed if we combine Greek / Greek Meaning and Hebrew / Hebrew Meaning
		// if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
		// 	searchResultIndex = searchResultIndex - 2;
		var currentSearchSuggestionElement = $('#searchResults' + step.searchSelect.searchTypeCode[searchResultIndex]);
		var text2Display = '<span>' + strongNum + '*</span>';
		var suffixText = __s.has_various_and_related_forms;
		if ((origSuggestionType === GREEK_MEANINGS) || (origSuggestionType === HEBREW_MEANINGS)) {
			text2Display = '<span>';
			if (strongsToInclude.length > 1)
				text2Display += strongsToInclude.length + ' ' + __s.different + ' ';
			text2Display += strongNum + '* (<i>' + data[0].suggestion.stepTransliteration + '</i>) ' +
				__s.and_synonyms_with_the_meaning + ' ' + userInput + '</span>';
			suffixText = "";
		}
		else text2Display += ' (<i>' + data[0].suggestion.stepTransliteration + '</i>)';
		var hasBothTestaments = ((frequencyOT > 0) && (frequencyNT > 0));
		var frequencyMsg = step.util.formatFrequency({strongNumber: strongNum, versionCountOT: frequencyOT, versionCountNT: frequencyNT}, frequencyFromLexicon, hasBothTestaments,
			notInBibleSelected);
		text2Display += '<span class="srchFrequency"> ' + frequencyMsg + '</span>';
		step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement, 
			allStrongNumsPlusLexicalGroup.toString(), origSuggestionType, text2Display, "", suffixText, "",
			limitType, null, false, false, "", allVersions, false, false);
		return hasBothTestaments;
	},
	createSubsequentLineForAugmentedStrong: function(sorted, data, origStrongNum, origSuggestionType, limitType, strongsToInclude, 
		detailLexSearchStrongs, allVersions, hasBothTestaments) {
		var strongsWithSameSimpleStrongsAsMainStrong = "";
		var numWithSameSimpleStrongsAsMainStrong = 0;
		var freqencyOfSameSimpleStrongAsMainStrong = 0;
		var transliterationOfSameSimpleStrongAsMainStrong = "";
		var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(origSuggestionType);
		// Only needed if we combine Greek / Greek Meaning and Hebrew / Hebrew Meaning
		// if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
		// 		searchResultIndex = searchResultIndex - 2;
		var currentSearchSuggestionElement = $('#searchResults' + step.searchSelect.searchTypeCode[searchResultIndex]);
		for (var k = 0; k < sorted.length; k++) {
			var i = parseInt(sorted[k][0]);
			var suggestionType = data[i].itemType;
			if (data[i].grouped) {
				console.log("There should be not group here");
				continue;
			}
			if (((origSuggestionType === GREEK_MEANINGS) || (origSuggestionType === HEBREW_MEANINGS)) &&
				(strongsToInclude.length > 0) && (!strongsToInclude.includes(data[i].suggestion.strongNumber))) {
				continue;
			}
			if ((suggestionType === GREEK) || (suggestionType === HEBREW) || (suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW_MEANINGS)) {
				var text2Display = "";
				var strongNum = data[i].suggestion.strongNumber;
				var str2Search = strongNum;
				var gloss = step.searchSelect.getGlossInUserLanguage(data[i].suggestion);
				var strongPrefix = strongNum[0].toUpperCase();
				text2Display = data[i].suggestion.type + ": ";
				str2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag);
				if (detailLexSearchStrongs.includes(str2Search)) continue; // Don't show the same search suggestion twice
				detailLexSearchStrongs.push(str2Search);
				var frequency = data[i].suggestion.popularity;
				var curStrong = data[i].suggestion.strongNumber;
				var searchExplaination = "";
				var curWord = { vocabInfos: [{ strongNumber: strongNum, freqList: data[i].suggestion.popularityList }] };
				step.util.lookUpFrequencyFromMultiVersions(curWord, allVersions);
				var frequencyOT = (typeof curWord.vocabInfos[0].versionCountOT === "number") ? curWord.vocabInfos[0].versionCountOT : 0;
				var frequencyNT = (typeof curWord.vocabInfos[0].versionCountNT === "number") ? curWord.vocabInfos[0].versionCountNT : 0;
				var notInBibleSelected = step.searchSelect.addNotInBibleSelected("", curWord.vocabInfos[0].notInBibleSelected);
				if (curStrong.slice(0, -1) === origStrongNum) {
					numWithSameSimpleStrongsAsMainStrong ++;
					if (strongsWithSameSimpleStrongsAsMainStrong !== "")
						strongsWithSameSimpleStrongsAsMainStrong += ",";
					strongsWithSameSimpleStrongsAsMainStrong += curStrong;
					freqencyOfSameSimpleStrongAsMainStrong += frequencyOT + frequencyNT;
					transliterationOfSameSimpleStrongAsMainStrong = data[i].suggestion.stepTransliteration;
				}
				if ((Array.isArray(data[i].suggestion._detailLexicalTag)) && (data[i].suggestion._detailLexicalTag.length > 0)) {
					if ((data[i].suggestion.type === "man") || (data[i].suggestion.type === "woman") || 
						(data[i].suggestion.type === "king") || (data[i].suggestion.type === "queen") ||
						(data[i].suggestion.type === "judge") || (data[i].suggestion.type === "place") ||
						(data[i].suggestion.type === "group") || (data[i].suggestion.type === "prophet")) {
						searchExplaination += "A " + data[i].suggestion.type + " with " + data[i].suggestion._detailLexicalTag.length + " names";
					}
					else {
						searchExplaination += "A " + data[i].suggestion.type + " with " + data[i].suggestion._detailLexicalTag.length + " synonyms"
					}
					if ((step.userLanguageCode.indexOf("en") != 0) && (__s.word_has_synonyms !== "This word has %d synonyms")) {
						searchExplaination = sprintf(__s.word_has_synonyms, data[i].suggestion._detailLexicalTag.length);
					}
					searchExplaination = searchExplaination + ": " + gloss.split(":")[0] + ": ";
					var frequencies = step.searchSelect.getFrequencyFromDetailLexicalTag(strongNum, frequency, data[i].suggestion._detailLexicalTag, allVersions);
					hasBothTestaments = (hasBothTestaments || ((frequencies[1] > 0) && (frequencies[2] > 0))) ? true : false;
					var frequencyMsg = step.util.formatFrequency({strongNumber: strongNum, versionCountOT: frequencies[1], versionCountNT: frequencies[2]}, frequencies[0], hasBothTestaments,
						notInBibleSelected);
					text2Display = __s.all + " " + frequencyMsg + " " + __s.occurrences;
					gloss = "";
				}
				else {
					hasBothTestaments = (hasBothTestaments || ((frequencyOT > 0) && (frequencyNT > 0))) ? true : false;
					var frequencyMsg = step.util.formatFrequency({strongNumber: strongNum, versionCountOT: frequencyOT, versionCountNT: frequencyNT }, frequency, hasBothTestaments,
						notInBibleSelected);
					if (((strongPrefix === "H") || (strongPrefix === "G")) &&
						(typeof data[i].suggestion._searchResultRange === "string")) {
						var moreThanOneStrong = str2Search.indexOf(",") > -1;
						text2Display +=
							'<i class="srchTransliteration">' + data[i].suggestion.stepTransliteration + '</i>' +
							'<span class="srchParathesis"> (</span>' +
							'<span class="srchOriginal_Language">' + data[i].suggestion.matchingForm + '</span>' +
							'<span class="srchSpaceStrong"> </span>' +
							'<span class="srchStrong_number">' + curStrong + '</span>' +
							'<span class="srchParathesis">)</span>' +
							step.util.formatSearchResultRange(data[i].suggestion._searchResultRange, moreThanOneStrong) +
							'<span class="srchFrequency"> ' + frequencyMsg + '</span>';
					}
					else text2Display +=
							'<i class="srchTransliteration">' + data[i].suggestion.stepTransliteration + '</i>' +
							'<span class="srchParathesis"> (</span>' +
							'<span class="srchOriginal_Language">' + data[i].suggestion.matchingForm + '</span>' +
							'<span class="srchSpaceStrong"> </span>' +
							'<span class="srchStrong_number">' + curStrong + '</span>' +
							'<span class="srchParathesis">)</span>' +
							'<span class="srchFrequency"> ' + frequencyMsg + '</span>';
				}
				step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement,
					str2Search, suggestionType, text2Display, searchExplaination, gloss, "", 
					limitType, null, false, true, "", allVersions, false, false);
				step.searchSelect.buildHTMLFromDetailLexicalTag(currentSearchSuggestionElement, strongNum, data[i].suggestion._detailLexicalTag, i, allVersions, hasBothTestaments);
			}
			else
				console.log("Unknown result: " + suggestionType);
		}
		currentSearchSuggestionElement.append('<br>');
		if (numWithSameSimpleStrongsAsMainStrong > 1) {
			currentSearchSuggestionElement.append('<br><hr><br>');
			step.searchSelect.appendSearchSuggestionsToDisplay(currentSearchSuggestionElement,
				strongsWithSameSimpleStrongsAsMainStrong, suggestionType, origStrongNum,
				__s.find_all + " <a title='Document on the Strong number system' href='https://docs.google.com/document/d/1PE_39moIX8dyQdfdiXUS5JkyuzCGnXrVhqBM87ePNqA/preview#heading=h.4a5fldrviek' target='_blank'>" + 
				__s.simple_strong + "</a>: ",
				'(<i class="srchTransliteration">' + transliterationOfSameSimpleStrongAsMainStrong + '</i> - <span class="srchFrequency"> ' + freqencyOfSameSimpleStrongAsMainStrong + ' x</span>)',
				"",
				limitType, null, false, false, "", allVersions, false, false);
		}
	},

	createDisplayForAugmentedStrong: function(data, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType, allVersions) {
		var detailLexSearchStrongs = [];
		for (var i = 0; i < step.searchSelect.numOfSearchTypesToDisplay; i++) {
			$('#searchResults' + step.searchSelect.searchTypeCode[i]).empty();
		}
		var allDStrongNums = [];
		var strongsToInclude = ((augStrongSameMeaning == null) || (augStrongSameMeaning === "") || (augStrongSameMeaning === "null")) ? [] : augStrongSameMeaning.split(",");
		var augStrongToShow = {};
		var sorted = [];
		var hasBothTestaments = false;
		if (data.length > 1) {
			hasBothTestaments = step.searchSelect.createFirstLineForAugmentedStrong(data, strongNum, origSuggestionType, userInput, limitType, augStrongToShow,
				allDStrongNums, strongsToInclude, allVersions);
			for (var key in augStrongToShow) {
				sorted.push([key, augStrongToShow[key]]);
			}
			sorted.sort(function(a, b) {
				return b[1] - a[1];
			});	
		}
		if (sorted.length == 0) {
			sorted.push(['0', 0]);
		}
		step.searchSelect.createSubsequentLineForAugmentedStrong(sorted, data, strongNum, origSuggestionType, limitType, strongsToInclude, 
			detailLexSearchStrongs, allVersions, hasBothTestaments);
		for (var l = 0; l < step.searchSelect.numOfSearchTypesToDisplay; l++) {
			if (step.searchSelect.searchTypeCode[l] === origSuggestionType) {
				$('.select-' + step.searchSelect.searchTypeCode[l]).show();
			}
			else $('.select-' + step.searchSelect.searchTypeCode[l]).hide();
		}
		$(".detailLexTriangle").click(step.searchSelect._handleClickOnTriangle);
		$("#column1width").width("100%");
		$(".search-type-column").hide();
		step.searchSelect._updateDisplayBasedOnOptions();
	},

	_showAugmentedStrong: function(strongNum, augStrongSameMeaning, origSuggestionType, userInput, allVersions) {
		$('#quickLexicon').remove();
		$('#warningMessage').text('');
		$('textarea#userTextInput').hide();
		$('#searchButton').hide();
		$('#updateButton').hide();
		$("#advancedsearchonoff").hide();
		$("#previousSearchDropDown").hide();
		$("#hd4").text(__s.please_select_one);
		step.searchSelect.searchModalCurrentPage = 3;	
		$('#srchModalBackButton').show();
		step.searchSelect.getVocabInfoForShowAugStrong(strongNum, augStrongSameMeaning, origSuggestionType, userInput, allVersions);
	},
	buildSuffixTag: function(suffixToDisplay, suffixTitle) {
		if (suffixToDisplay === "") return "";
		var tag = '<span onmouseover="javascript:$(\'#quickLexicon\').remove()" onmousemove="javascript:$(\'#quickLexicon\').remove()" ';
		if (suffixTitle !== "") tag += ' title="' + suffixTitle + '"';
		tag += '>' + suffixToDisplay + '</span>';
		return tag;
	},
	checkDuplicates: function(goSearchCall, showAugmentCall, numOfFormMsg) {
		var showAugmentCallWithFirstParam = showAugmentCall.split(',')[0];
		// Check the Greek spelling, meaning and Hebrew spelling and meaning catagories
		for (var i = 3; i < step.searchSelect.numOfSearchTypesToDisplay - 1; i++) {
			var existingHTML = $('#searchResults' + step.searchSelect.searchTypeCode[i]).html();
			if ((typeof existingHTML === "string") && (existingHTML !== "")) {
				var existingLines = existingHTML.split("<a");
				for (var j = 0; j < existingLines.length; j++) {
					var k = existingLines[j].indexOf(goSearchCall);
					if (k > -1) {
						k = existingLines[j+1].indexOf(showAugmentCallWithFirstParam); // next a tag should have the next call
						if (k > -1) {
							k = existingLines[j+1].indexOf(numOfFormMsg);
							if (k > -1) { // if numOfFormMsg is an empty string, k would be zero
								console.log("skip: " + goSearchCall + " " + showAugmentCall + " " + numOfFormMsg);
								return true;
							}
						}
					}
				}
			}	
		}
		return false;
	},
	addMouseOverEvent: function(searchType, searchString, prefixToDisplay, version, newElement) {
		if ((step.touchDevice) || ($(window).height() < 600))
			return;
		if (searchType !== "strong") {
			newElement.hover(function (ev) {
				$('#quickLexicon').remove();
			});
			return;
		} 
		var multipleStrongText = "";
		if (searchString.indexOf(",") > -1) {
			var numOfWord = searchString.split(",").length;
			if ($("#userTextInput").is(":visible")) // 1st search modal screen with input field
				multipleStrongText = "Search of " + numOfWord + " words with same meaning, click on '<i>" + numOfWord +
					" forms</i>' at the end of this line for more information";
			else { // 2nd search modal screen with input field hidden
				if ((typeof prefixToDisplay === "string") && (prefixToDisplay.indexOf("docs.google.com")) > -1)
					multipleStrongText = sprintf(__s.old_strong_explain, numOfWord);
				else
					multipleStrongText = sprintf(__s.search_word_same_meaning, numOfWord);
			}
		}
		newElement.hover(function (ev) {
			if (ev.type === "mouseleave") {
				$('#quickLexicon').remove();
				return;
			}
			require(['quick_lexicon'], function () {
				step.util.delay(function () {
					// do the quick lexicon
					step.util.ui.displayNewQuickLexiconForVerseVocab(searchString, '', '', version, step.util.activePassageId(),  ev, ev.pageY, null, multipleStrongText);
				}, MOUSE_PAUSE, 'show-quick-lexicon');
			});
		},
		function () { // mouse pointer ends hover (leave)
			step.util.delay(undefined, 0, 'show-quick-lexicon');
			$("#quickLexicon").remove();
		});
	},

	appendSearchSuggestionsToDisplay: function(currentSearchSuggestionElement,
		str2Search, suggestionType, text2Display, prefixToDisplay, suffixToDisplay, suffixTitle,
		limitType, augStrongSameMeaning, hasDetailLexInfo, needIndent, userInput, allVersions) { // , hasHebrew, hasGreek) {
		var brCount = 0;
		var suggestionsToDisplay = 7;
		var suggestionsToDisplay = ($("#srchModalBackButton").is(":hidden")) ? 7 : 40; // There are 30+ Zechariah so 40 should be enough
		var needLineBreak = "";
		var isAugStrong = Array.isArray(augStrongSameMeaning);
		var existingHTML = currentSearchSuggestionElement.html();
		step["SearchCount" + suggestionType] ++;
		brCount = step["SearchCount" + suggestionType];
		if (brCount >= suggestionsToDisplay) return;
		if ((suffixToDisplay.indexOf(__s.default_search) > -1) && ($("#select_advanced_search").hasClass("checked"))) {
			console.log("removing " + suffixToDisplay);
			suffixToDisplay = "";
		}
		if ((typeof existingHTML === "string") && (existingHTML !== "")) {
			// brCount = (existingHTML.match(/<br>/g) || []).length;
			// brCount += (existingHTML.match(/<\/ol>/g) || []).length;
			if (((brCount < suggestionsToDisplay + 1) || (limitType !== ""))) {
					if (existingHTML.slice(-5) !== "</ol>") {
						needLineBreak = "<br>";
					}
					if (needIndent) {
						needLineBreak +=  "<br style='line-height:" +
						((step.touchDevice) ? "2" : "5") +
						"px'>";
					}
			}
		}
		if (needIndent) needLineBreak += "&nbsp;&nbsp;&nbsp;";
		if ((brCount < suggestionsToDisplay - 1) || (limitType !== "")) {
			var titleText = "";
			if (((str2Search.substring(0,1) === "H") || (str2Search.substring(0,1) === "G"))) {
				titleText = ' title="' + str2Search;
				if (isAugStrong) titleText += "*";
				titleText += '" ';
			}
			var searchType = ((suggestionType === GREEK) || (suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW) || (suggestionType === HEBREW_MEANINGS)) ? "strong" : suggestionType;
			if ((isAugStrong) || (hasDetailLexInfo)) {
				var strongWithAugOrDetailLexInfo = $('<span></span');
				currentSearchSuggestionElement.append(strongWithAugOrDetailLexInfo);
				this._getAdditionalInformationOnStrong(str2Search, augStrongSameMeaning, allVersions, strongWithAugOrDetailLexInfo, step.searchSelect._addLineWithAugStrongOrDetailLexInfo,
					titleText, text2Display, userInput, isAugStrong,
					needLineBreak, prefixToDisplay, searchType, suffixToDisplay, suffixTitle, suggestionType);
			}
			else {
				var newSuggestion = $('<a style="padding:0px"' + titleText +
						' onclick="javascript:step.searchSelect.goSearch(\'' + searchType + '\',\'' + str2Search + '\',\'' + 
						text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22') +
						'\')">' + text2Display + "</a>");
				this.addMouseOverEvent(searchType, str2Search, prefixToDisplay, allVersions.split(',')[0], newSuggestion);
				currentSearchSuggestionElement.append(needLineBreak + prefixToDisplay)
					.append(newSuggestion)
					.append(" " + this.buildSuffixTag(suffixToDisplay, suffixTitle));
				if ((searchType === "strong") && (str2Search.indexOf(',') == -1)) {
					var nonAugStrong = str2Search;
					if (isNaN(str2Search.slice(-1)))
						nonAugStrong = str2Search.slice(0, -1);
					var freqListElm = $('<span></span');
					currentSearchSuggestionElement.append('&nbsp;').append(freqListElm);
					this._getAdditionalInformationOnStrong(nonAugStrong, [ str2Search ], allVersions, freqListElm, step.searchSelect._addFreqListQTip);
				}
			}
			return;
		}
		if (brCount < suggestionsToDisplay) {
			if ((suggestionType === GREEK_MEANINGS) || (suggestionType === HEBREW_MEANINGS)) {
				currentSearchSuggestionElement.append(needLineBreak).append('&nbsp;&nbsp;&nbsp;')
					.append('<a onmousemove="javascript:$(\'#quickLexicon\').remove()" onmouseover="javascript:$(\'#quickLexicon\').remove()" style="padding:0px" title="click to see more suggestions" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' +
						suggestionType + '\')"><b>list all with similar meaning...</b></a>');
			}
			else if ((suggestionType === GREEK) || (suggestionType === HEBREW)) {
				if (needLineBreak === "")
					currentSearchSuggestionElement.append('<br>');
				currentSearchSuggestionElement.append(needLineBreak).append('&nbsp;&nbsp;&nbsp;')
					.append('<a onmousemove="javascript:$(\'#quickLexicon\').remove()" onmouseover="javascript:$(\'#quickLexicon\').remove()" style="padding:0px" title="click to see more suggestions" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' +
						suggestionType + '\')"><b>list all with similar ' + suggestionType.charAt(0).toUpperCase() + suggestionType.slice(1).toLowerCase() +
						' spelling...</b></a>');	
			}
		}
		return;
	},
	extractStrongFromDetailLexicalTag: function(strongNumber, detailLexicalJSON) {
		if ((Array.isArray(detailLexicalJSON)) && (detailLexicalJSON.length > 0)) {
			var allStrongs = [strongNumber];
			detailLexicalJSON.forEach(function (item, index) {
				if (allStrongs.includes(item[1])) return;
				allStrongs.push(item[1]);
			});
			allStrongs.sort();
			return allStrongs.join(",");
		}
		return strongNumber;
	},

	getFrequencyFromDetailLexicalTag: function(strongNum, frequencyFromLexicon, detailLexicalJSON, allVersions) {
		frequencyFromLexicon = parseInt(frequencyFromLexicon);
		var frequencyOT = 0;
		var frequencyNT = 0;
		var notInBibleSelected = "";
		if (Array.isArray(detailLexicalJSON)) {
			detailLexicalJSON.forEach(function (item, index) {
				if (item[1] !== strongNum)
					frequencyFromLexicon += parseInt(item[3]);
				var curWord = { vocabInfos: [{ strongNumber: item[1] , freqList: item[6] }] };
				step.util.lookUpFrequencyFromMultiVersions(curWord, allVersions);
				frequencyOT += (typeof curWord.vocabInfos[0].versionCountOT === "number") ? curWord.vocabInfos[0].versionCountOT : 0;
				frequencyNT += (typeof curWord.vocabInfos[0].versionCountNT === "number") ? curWord.vocabInfos[0].versionCountNT : 0;
				notInBibleSelected = step.searchSelect.addNotInBibleSelected(notInBibleSelected, curWord.vocabInfos[0].notInBibleSelected);
			});
		}
		return [frequencyFromLexicon, frequencyOT, frequencyNT, notInBibleSelected];
	},

	buildHTMLFromDetailLexicalTag: function(currentSearchSuggestionElement, strongNum, detailLexicalJSON, count, allVersions, hasBothTestaments) {
		if ((!detailLexicalJSON) || (!Array.isArray(detailLexicalJSON))) return;
		currentSearchSuggestionElement.append("<a id='detailLexSelect" + count + "' class='detailLexTriangle glyphicon glyphicon-triangle-bottom'></a>");
		var orderList = $("<ol class='detailLex" + count + "' style='margin-bottom:0px;line-height:14px'>");
		var allStrongs = [];
		var addedFreqList = false;
		detailLexicalJSON.forEach(function (item, index) {
			if (allStrongs.includes(item[1])) return;
			allStrongs.push(item[1]);
			var spaceWithoutLabel = "&nbsp;&nbsp;&nbsp;";
			var list = $('<li>');
			if (item[1] === strongNum) {
				list.append("<span class='detailLex" + count + " glyphicon glyphicon-arrow-right' style='font-size:10px'></span>");
				spaceWithoutLabel = "";
			}
			var frequencies = step.searchSelect.getFrequencyFromDetailLexicalTag(item[1], item[3], [item], allVersions);
			hasBothTestaments = ((hasBothTestaments) || ((frequencies[1] > 0) && (frequencies[2] > 0))) ? true : false;
			var frequencyMsg = step.util.formatFrequency({strongNumber: strongNum, versionCountOT: frequencies[1], versionCountNT: frequencies[2]}, frequencies[0], hasBothTestaments,
				frequencies[3]);
			var newSuggestion = $('<a class="detailLex' + count + '" style="padding:0px;color:var(--clrStrongText)" title="' + item[1] + '"' +
					'onclick="javascript:step.searchSelect.goSearch(\'strong\',\'' + 
					item[1] + '\',\'' + item[1] +	'\')">' + spaceWithoutLabel + "" + item[0] + ": " +
					'<i class="srchTransliteration">' + item[5] + '</i>' +
					'<span class="srchParathesis"> (</span>' +
					'<span class="srchOriginal_Language">' + item[4] + '</span>' +
					'<span class="srchSpaceStrong"> </span>' +
					'<span class="srchStrong_number">' + item[1] + '</span>' +
					'<span class="srchParathesis">)</span>' +
					'<span class="srchFrequency"> ' + frequencyMsg + '</span>' +
				"</a>");
			step.searchSelect.addMouseOverEvent("strong", item[1], "", allVersions.split(',')[0], newSuggestion);
			list.append(newSuggestion).append(' - ' +
				step.searchSelect.getGlossInUserLanguage( {"strongNumber":item[1], "gloss": item[2]}));
			if (item[6] !== "") {
				var freqListElm = step.util.freqListQTip(item[1], item[6], allVersions, "", "");
				list.append('&nbsp;').append(freqListElm);
				addedFreqList = true;
			}
			orderList.append(list);
		});
		currentSearchSuggestionElement.append(orderList);
		if (addedFreqList)
			step.searchSelect._updateDisplayBasedOnOptions();
	},
	_handleClickOnTriangle: function(ev){
		var idName = ev.target.id;
		var num = idName.substr(15);
		if (ev.target.classList.contains("glyphicon-triangle-right")) {
			$(".detailLex" + num).show();
			$("#" + idName).removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
		}
		else {
			$(".detailLex" + num).hide();
			$("#" + idName).removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");
		}
	},

	verifySearchJoin: function(join) {
		if ( (typeof join !== "string") ||
		     ((join !== "AND") && (join !== "OR") && (join !== "NOT")) )
			return "a";
		else
			return join.substring(0,1).toLowerCase();
	},

	addSearchWords: function(searchWord) {
		var current = step.util.localStorageGetItem("step.previousSearches");
		var newSearchLists = searchWord;
		var alreadyAdded = [ searchWord.toLocaleLowerCase('en-US') ];
		if (current != null) {
			current = current.split(";");
			for (var i = 0; ((i < current.length) && (i < 9)); i++) {
				if (!alreadyAdded.includes(current[i].toLocaleLowerCase('en-US'))) {
					newSearchLists += ";" + current[i];
					alreadyAdded.push(current[i]);
				}
			}
		}
		step.util.localStorageSetItem("step.previousSearches", newSearchLists);
	},

	goSearch: function(searchType, searchWord, displayText) {
		$('#quickLexicon').remove();
		step.searchSelect.addSearchWords(step.searchSelect.searchUserInput);
		var activePassageData = step.util.activePassage().get("searchTokens") || [];
		var allVersions = "";
		var range = (this.searchRange === "Gen-Rev") ? "" : URL_SEPARATOR + "reference=" + this.searchRange;
		var currentSearch = "";
		for (var i = 0; i < activePassageData.length; i++) {
			var itemType = activePassageData[i].itemType ? activePassageData[i].itemType : activePassageData[i].tokenType
			if (itemType === VERSION) {
				if (allVersions.length > 0) allVersions += URL_SEPARATOR;
				allVersions += 'version=' + activePassageData[i].item.shortInitials;
			}
		}
		if (typeof searchWord !== "string") searchWord = "";
		var numOfSearches = 0;
		var previousJoinString = "";
		var previousSearch = "";
		var currentJoin ;
		if (this.includePreviousSearches) {
			currentJoin = this.verifySearchJoin($("#searchAndOrNot option:selected").val());
			for (var i = 0; i < this.previousSearchTokens.length; i++) {
				if (this.previousSearchTokens[i] === "") continue;
				var leftParanthesisString = "";
				var searchJoinForItem = "";
				if (this.previousSearchTokens[i].substring(0,1) === "(") {
					leftParanthesisString = this.previousSearchTokens[i];
					if (i > 0) searchJoinForItem = this.verifySearchJoin($("#searchAndOrNot" + i + " option:selected").val());
					do {
						i ++;
					} while ((this.previousSearchTokens[i] === "") && (i < this.previousSearchTokens.length));
				}
				else if (this.previousSearchTokens[i].substring(0,1) === ")") {
					previousJoinString += this.previousSearchTokens[i];
					continue;
				}
				numOfSearches ++;
				if (numOfSearches > 1) {
					if (searchJoinForItem === "")
						searchJoinForItem = this.verifySearchJoin($("#searchAndOrNot" + i + " option:selected").val());
					previousJoinString += searchJoinForItem + leftParanthesisString + (numOfSearches);
				}
				else previousJoinString += leftParanthesisString + "1";
				previousSearch += URL_SEPARATOR + this.previousSearchTokens[i];
			}
		}
		var searchJoinsForMultipleStrongs = "";
		numOfSearches ++;
		if (searchType === TEXT_SEARCH) {
			var andSearchStrings = displayText.split(" <sub>and</sub> ");
			if (andSearchStrings.length > 1) {
				currentSearch = "";
				for (var i = 0; i < andSearchStrings.length; i++) {
					currentSearch += URL_SEPARATOR + 'text=' + andSearchStrings[i];	
				}
			}
			else currentSearch = URL_SEPARATOR + 'text=' + searchWord;
		}
		else if (searchType === STRONG_NUMBER) {
			var searchWords = searchWord.split(",");
			currentSearch = URL_SEPARATOR + 'strong=' + searchWords[0];
			step.util.putStrongDetails(searchWord[0], displayText);
			if (searchWords.length > 1) {
				searchJoinsForMultipleStrongs = "("  + numOfSearches;
				for (var i = 1; i < searchWords.length; i++) {
					numOfSearches ++;
					currentSearch += URL_SEPARATOR + 'strong=' + searchWords[i];
					searchJoinsForMultipleStrongs += "o" + numOfSearches;
					step.util.putStrongDetails(searchWord[i], displayText);
				}
				searchJoinsForMultipleStrongs += ")";
			}
		}
		else if (typeof searchType !== "undefined") currentSearch = URL_SEPARATOR + searchType + '=' + searchWord;
		var joins = "";
		if (previousJoinString !== "") {
			joins = URL_SEPARATOR + "srchJoin=";
			if (currentSearch === "") joins += previousJoinString;
			else if (numOfSearches > 1) {
				if (searchJoinsForMultipleStrongs === "") joins += previousJoinString + currentJoin + numOfSearches;
				else joins += previousJoinString + currentJoin + searchJoinsForMultipleStrongs;
			}
		}
		else if (searchJoinsForMultipleStrongs !== "") {
			joins = URL_SEPARATOR + "srchJoin=" + searchJoinsForMultipleStrongs;
		}
		var url = allVersions + range + joins + previousSearch + currentSearch;
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		step.util.closeModal('searchSelectionModal');
		if (selectedDisplayLoc === "new") step.util.createNewColumn();
		step.router.navigateSearch(url, true, true);
	},

	goToPassage: function(osisID) {
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		step.util.closeModal('searchSelectionModal');
		if (selectedDisplayLoc === "new") {
			step.util.createNewColumn();
		}
		step.router.navigatePreserveVersions("reference=" + osisID, false, true);
	},

	removePreviousSearch: function(index) {
		this.previousSearchTokens[index] = "";
		this.numOfPreviousSearchTokens --;
		showPreviousSearch();
		$('#lOPS_' + index).hide();
		var startParenthesis = -1;
		var hasSearchWithinParthensis = false;
		for (var i = 0; i < this.previousSearchTokens.length; i++) {
			if (this.previousSearchTokens[i].substring(0,1) === "(") {
				startParenthesis = i;
				hasSearchWithinParthensis = false;
			}
			else if (startParenthesis > -1) {
				if (this.previousSearchTokens[i].substring(0,1) === ")") {
					if (!hasSearchWithinParthensis) {
						this.previousSearchTokens[startParenthesis] = "";
						this.previousSearchTokens[i] = "";
						$('#lOPS_' + startParenthesis).hide();
						$('#lOPS_' + i).hide();
						this.numOfPreviousSearchTokens -= 2;
					}
					startParenthesis = -1;
					hasSearchWithinParthensis = false;
				}
				else if (this.previousSearchTokens[i] !== "") hasSearchWithinParthensis = true;
			}
		}
		if (this.numOfPreviousSearchTokens == 0) {
			$('#previousSearch').empty();
			$('#updateButton').hide();
		}
	},

	handleAndOrNot: function() {
		this.andOrNotUpdated = true;
		$('#updateButton').show();
	}

};