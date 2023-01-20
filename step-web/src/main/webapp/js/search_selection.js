window.step = window.step || {};
step.searchSelect = {
	version: "ESV_th",
	userLang: "en",
	searchOnSpecificType: "",
	// Don't change the order of the following. The first 3 search types are non original language
	// searches.  The last two are not displayed in it's own group.  GREEK_MEANINGS are are displayed
	// with GREEK.  HEBREW_MEANINGS are displayed with HEBREW.
	searchTypeCode: [TEXT_SEARCH, SUBJECT_SEARCH, MEANINGS, GREEK, HEBREW, GREEK_MEANINGS, HEBREW_MEANINGS],
	numOfSearchTypesToDisplay: 5, // Not counting GREEK_MEANINGS and HEBREW_MEANINGS from the above line
	displayOptions: ["Strong_number", "Transliteration", "Original_language", "Frequency"],
	searchModalCurrentPage: 1,
	searchUserInput: "",
	searchRange: "Gen-Rev",
	previousSearchTokens: [],
	numOfPreviousSearchTokens: 0,
	includePreviousSearches: false,
	rangeWasUpdated: false,
	andOrNotUpdated: false,
	timer: undefined,
	idx2osisChapterJsword: {
		"Gen": 0,
		"Exo": 1, "Exod": 1,
		"Lev": 2,
		"Num": 3,
		"Deu": 4, "Deut": 4,
		"Jos": 5, "Josh": 5,
		"Judg": 6,
		"Rut": 7, "Ruth": 7,
		"1Sa": 8, "1Sam": 8,
		"2Sa": 9, "2Sam": 9,
		"1Ki": 10, "1Kgs": 10,
		"2Ki": 11, "2Kgs": 11,
		"1Ch": 12, "1Chr": 12,
		"2Ch": 13, "2Chr": 13,
		"Ezr": 14, "Ezra": 14,
		"Neh": 15,
		"Est": 16, "Esth": 16,
		"Job": 17,
		"Psa": 18, "Ps": 18,
		"Pro": 19, "Prov": 19,
		"Ecc": 20, "Eccl": 20,
		"Song": 21,
		"Isa": 22,
		"Jer": 23,
		"Lam": 24,
		"Eze": 25, "Ezek": 25,
		"Dan": 26,
		"Hos": 27,
		"Joe": 28, "Joel": 28,
		"Amo": 29, "Amos": 29,
		"Obd": 30, "Obad": 30,
		"Jon": 31, "Jonah": 31,
		"Mic": 32,
		"Nah": 33,
		"Hab": 34,
		"Zep": 35, "Zeph": 35,
		"Hag": 36,
		"Zec": 37, "Zech": 37,
		"Mal": 38,
		"Mat": 39, "Matt": 39,
		"Mar": 40, "Mark": 40,
		"Luk": 41, "Luke": 41,
		"Joh": 42, "John": 42,
		"Act": 43, "Acts": 43,
		"Rom": 44,
		"1Cor": 45,
		"2Cor": 46,
		"Gal": 47,
		"Eph": 48,
		"Phili": 49, "Phil": 49,
		"Col": 50,
		"1Th": 51, "1Thess": 51,
		"2Th": 52, "2Thess": 52,
		"1Ti": 53, "1Tim": 53,
		"2Ti": 54, "2Tim": 54,
		"Tit": 55, "Titus": 55,
		"Phile": 56, "Phlm": 56,
		"Heb": 57,
		"Jam": 58, "Jas": 58,
		"1Pe": 59, "1Pet": 59,
		"2Pe": 60, "2Pet": 60,
		"1Jo": 61, "1John": 61,
		"2Jo": 62, "2John": 62,
		"3Jo": 63, "3John": 63,
		"Jude": 64,
		"Rev": 65
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
        
		// var ua = navigator.userAgent.toLowerCase();
		$("#searchmodalbody").addClass("scrollPart");
		if ((this.userLang.indexOf('en') != 0) && (this.groupsOT[0].groupName === "Books of Moses") && (this.groupsOT[0].groupName !== "Pentateuch"))
			this.groupsOT[0].groupName = __s.the_pentateuch;
		if ($('.passageContainer.active').width() < 500) $('#displayLocForm').hide();
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
				if (itemType == "srchJoin") {
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
				if (itemType == REFERENCE) {
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
				this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
			});
		});
		step.searchSelect.updateAdvancedSearchElements();
		step.searchSelect._previousSearchesEnteredByUser();
	},
	updateAdvancedSearchElements: function() {
		var advancedSearchInStorage = step.util.localStorageGetItem("advanced_search");
		if ((advancedSearchInStorage != null) && (advancedSearchInStorage === "true")) {
			$(".advanced_search_elements").show();
			$("#select_advanced_search").addClass("checked");
			$("#advancesearchonoffswitch").prop( "checked", true );
		}
		else {
			$(".advanced_search_elements").hide();
			$("#select_advanced_search").removeClass("checked");
			$("#advancesearchonoffswitch").prop( "checked", false );
		}
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
			(optionName !== "strong_number") && (optionName !== "original_language")) {
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
	_previousSearchesEnteredByUser: function() {
		var previousSearches = step.util.localStorageGetItem("step.previousSearches");
		if (previousSearches == null) {
			$("#previousSearchDropDown").hide();
			return;
		}
		var searchWordsHTML = 
			'<h4 style="font-size:14px">Previous searches</h4>' +
			'<ul class="displayModes" style="padding-left:0px" role="presentation">';
		previousSearches = previousSearches.split(";");
		for (var i = 0; i < previousSearches.length; i ++) {
			searchWordsHTML += '<li class="stepModalFgBg dropdown-menu passageOptionsGroup" style="display:block;position:initial;opacity:1;border:0px;padding:0px;box-shadow:none">' +
				'<a class="searchWords" id="searchWords' + i +'">' +
				previousSearches[i] +
				'</a>' +
				'</li><br>';
		}
		searchWordsHTML += '</ul>';
		$("#previousSearchWords").append(searchWordsHTML);
		$(".searchWords").click(step.searchSelect._displayPreviousSearchWord);
	},
	_displayPreviousSearchWord: function(ev) {
		if ((ev == null) || (typeof ev.target.id !== "string") ||
			(ev.target.id.substring(0, 11) !== "searchWords")) return;
		var wordIndex = ev.target.id.substring(11);
        var previousSearches = step.util.localStorageGetItem("step.previousSearches");
		previousSearches = previousSearches.split(";");
		$("textarea#userTextInput").text(previousSearches[wordIndex]);
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
		if (this.searchTypeCode.indexOf(type) > 2) { // The first three search types are not original language search types
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


	_find_href_and_go: function(element) {
		var hrefInfo = $(element).attr("href");
		if (hrefInfo.toLowerCase().indexOf("javascript:") == 0) {
			eval(hrefInfo);
		}
	},

	handleKeyboardInput: function(e) {
		if (e.target.id === "enterRange") {
			$('#userEnterRangeError').text("");
			var userInput =  $('textarea#enterRange').val();
			userInput = userInput.replace(/[\n\r]/g, '').replace(/[\t]/g, ' ').replace(/\s\s+/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '')
			userInput = userInput.replace(/[–—]/g, '-'); // replace n-dash and m-dash with hyphen
			$('textarea#enterRange').val(userInput);
			if (userInput.length > 3) {
				var url = SEARCH_AUTO_SUGGESTIONS + userInput + "/limit%3D" + REFERENCE + "%7C" + VERSION + "%3D" + step.searchSelect.version + "%7C?lang=" + step.searchSelect.userLang;
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
			var userInput = $('textarea#userTextInput').val();
			if ((userInput.slice(-1) === "\n") || (e.originalEvent.inputType === "insertLineBreak")) {
				userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
				$('textarea#userTextInput').val(userInput);
				if (userInput.replace(/\s\s+/, ' ').search(/^\s?[\da-z][a-z]+[\s.]?\d/i) > -1) step.searchSelect._handleEnteredSearchWord(null, null, true); // probably a passage
				var sleep = 50;
				if (step.searchSelect.searchUserInput !== userInput) {
					step.searchSelect._handleEnteredSearchWord();
					sleep = 250;
				}
				setTimeout(function() { // Need to give time for the input to the sent to the server and also time for the response to come back to the browser.
					var textSearchResult = $("#searchResultstext").find("a");
					if (textSearchResult.length > 0) {
						if (textSearchResult.length > 1) {
							for (var i = 0; i < textSearchResult.length; i++) {
								var nextElement = $(textSearchResult[i]).next();
								if ((nextElement.length > 0) && ($(nextElement).prop("tagName").toLowerCase() === "span") &&
									($(nextElement).text() === __s.default_search)) {
									step.searchSelect._find_href_and_go(textSearchResult[i]);
									return;
								}
							}
						}
						step.searchSelect._find_href_and_go(textSearchResult[0]); // Did not find default search text, go with the first link.
						return;
					}
					else {
						$('#warningMessage').text(__s.enter_search_word);
					}
				}, sleep);
			}
			else {
				$('#warningMessage').text("");
				step.searchSelect._handleEnteredSearchWord();
			}
		}
	},

	goBackToPreviousPage: function() {
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
					this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
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
			var arrayOfTyplicalBooksChapters = JSON.parse(__s.list_of_bibles_books);
			while (copyOfRange != "") {
				var separatorChar = "";
				var pos = copyOfRange.search(/[-,]/);
				if (pos > -1) separatorChar = copyOfRange.substr(pos, 1);
				else pos = copyOfRange.length;
				var currentOsisID = copyOfRange.substr(0, pos);
				var posOfBook = this.idx2osisChapterJsword[currentOsisID];
				if ((posOfBook > -1) &&
					(typeof arrayOfTyplicalBooksChapters !== "undefined") &&
					(arrayOfTyplicalBooksChapters[posOfBook].length === 2)) {
						displayRange += arrayOfTyplicalBooksChapters[posOfBook][1];
				}
				else displayRange += currentOsisID;
				displayRange += separatorChar;
				copyOfRange = copyOfRange.substr(pos + 1);
			}
		}
		var backgroundColor = (step.util.isDarkMode()) ? "var(--clrBackground)" : "#f5f5f5";
		var html = '<div class="header">' +
			'<h4 id="hd4">' + __s.enter_search_word + '</h4>' +
			'<button id="searchRangeButton" type="button" class="stepButtonTriangle" style="float:right;" onclick=step.searchSelect._buildRangeHeaderAndTable()><b>' + __s.search_range + ':</b> ' + displayRange + '</button>' +
			'</div><br>' +
			'<span id="warningMessage" style="color: red;"></span>' +
			'<textarea id="userTextInput" rows="1" class="stepFgBg" style="font-size:16px;width:80%" placeholder="' + __s.enter_search_word + '"></textarea>' + // size 16px so the mobile devices will not expand
			'<span id="previousSearchDropDown" class="dropdown advanced_search_elements">' +
				'<a class="dropdown-toggle showSettings" data-toggle="dropdown" title="Previous searches">' +
					'<i class="glyphicon glyphicon-triangle-bottom" style="font-size:14px;background-color:var(--clrBackground);color:var(--clrStrongText)"></i>' +
				'</a>' +
				'<div id="previousSearchWords" class="stepModalFgBg dropdown-menu pull-right" style="opacity:1" role="menu"></div>' +
			'</span>' +
			'<br><br>' +
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
				'<td class="search-type-column select2-result select2-result-selectable select-' + srchCode + '" title="' + 
				__s['search_type_title_' + srchCode] + '" style="font-size:12px;text-align:left;' + (step.state.isLtR()? '">': 'text-align: right;">') + __s['search_type_desc_' + srchCode] + ':</td>' +
				'<td style="text-align:left"><span id="searchResults' + srchCode + '"></span></td></tr>';
		}
		html += '</table>' +
			'</div>';
		return html;
	},

	_buildRangeHeaderAndTable: function(booksToDisplay) {
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
				this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
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
			var url = SEARCH_AUTO_SUGGESTIONS + "%20%20/" + EXAMPLE_DATA + "%3D" + REFERENCE + "%7C" + LIMIT + "%3D" + REFERENCE + "%7C" + VERSION + "%3D" + this.version + "%7C?lang=" + this.userLang;
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
			if (data[i].itemType == VERSION) {
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
		var arrayOfTyplicalBooksChapters;
		if (typeof data === "string") {
			if (data == "OTNT") end = 66;
			else if (data == "OT") end = 39;
			else if (data == "NT") {
				start = 39;
				end = 66;
			}
			data = step.passageSelect.osisChapterJsword;
			typlicalBooksChapters = true;
			arrayOfTyplicalBooksChapters = JSON.parse(__s.list_of_bibles_books);
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
			//var posOfBook = step.util.bookOrderInBible(currentOsisID); // when this is running inside the html files for iFrames, this is no reachable.  
			var posOfBook = this.idx2osisChapterJsword[currentOsisID];
			if (posOfBook > -1) {
				if (typeof step.passageSelect.osisChapterJsword[posOfBook][3] !== "undefined") longID = step.passageSelect.osisChapterJsword[posOfBook][3];
				if (typeof arrayOfTyplicalBooksChapters !== "undefined") {
					longNameToDisplay = arrayOfTyplicalBooksChapters[posOfBook][0];
					shortNameToDisplay = (arrayOfTyplicalBooksChapters[posOfBook].length === 2) ? arrayOfTyplicalBooksChapters[posOfBook][1] : currentOsisID;
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
			if (htmlID.substr(0, 2) == "nt") $("#nt_hdr").show();
			else if (htmlID.substr(0, 2) == "ot") $("#ot_hdr").show();
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
		if (idPrefix == 'ot') numOfGroups = this.groupsOT.length;
		else if (idPrefix == 'nt') numOfGroups = this.groupsNT.length;
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
	_handleEnteredSearchWord: function(limitType, previousUserInput, userPressedEnterKey) {
		if ((typeof limitType === "undefined") || (limitType === null)) limitType = "";
		var userInput = '';
		$('textarea#userTextInput').show();
		$("#hd4").text(__s.enter_search_word);
		$("#column1width").width("30%");
		$(".search-type-column").show();
		$('#warningMessage').text('');
		if ((typeof previousUserInput === "undefined") || (previousUserInput === null))  userInput = $('textarea#userTextInput').val();
		else {
			userInput = previousUserInput;
			$('textarea#userTextInput').text(userInput);
		}
		userInput = userInput.replace(/[\n\r]/g, ' ').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
		if ((userInput.length > 1) || ((step.searchSelect.userLang.toLowerCase().indexOf("zh") == 0) && (userInput.length > 0))) {
			$('#updateButton').hide();
			var url;
			if ((limitType === "") && (step.searchSelect.searchOnSpecificType === ""))
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version + "%7C?lang=" + step.searchSelect.userLang;
			else {
				if (limitType === "") limitType = step.searchSelect.searchOnSpecificType;
				else {
					step.searchSelect.searchOnSpecificType = limitType;
					step.searchSelect.searchModalCurrentPage = 2;
				}
				$('#srchModalBackButton').show();
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version +
					"%7C" + LIMIT + "%3D" + limitType +
					"%7C?lang=" + step.searchSelect.userLang;
			}
			$.ajaxSetup({async: false});
			$.getJSON(url, function (data) {
				var searchSuggestionsToDisplay = [];
				for (var i = 0; i < step.searchSelect.numOfSearchTypesToDisplay; i++) {
					searchSuggestionsToDisplay.push("");
				}
				var alreadyShownStrong = [];
				for (var i = 0; i < data.length; i++) {
					var suggestionType = data[i].itemType;
					var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(suggestionType);
					if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
						searchResultIndex = searchResultIndex - 2;
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
								if (typeof data[i].extraExamples !== "undefined") {
									if ((searchSuggestionsToDisplay[searchResultIndex].match(/<br>/g) || []).length < 4) {
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
										else {
											text2Display = '<b>' + __s.more + '</b>...';
											if (searchSuggestionsToDisplay[searchResultIndex] !== "") searchSuggestionsToDisplay[searchResultIndex] += "<br>";
											searchSuggestionsToDisplay[searchResultIndex] += '<a style="padding:0px;" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' + suggestionType + '\')">' + text2Display + "</a>";
										}
									}
								}
								else {
									if (searchSuggestionsToDisplay[searchResultIndex] !== "") searchSuggestionsToDisplay[searchResultIndex] += "<br>";
									searchSuggestionsToDisplay[searchResultIndex] += 'There are ' + data[i].count + ' more options.  Keep typing to see them.';
								}
							}
							else {
								var str2Search = "";
								var suffixToDisplay = "";
								var suffixTitle = "";
								if (suggestionType === SUBJECT_SEARCH) {
									text2Display = data[i].suggestion.value;
									str2Search = text2Display;
								}
								else if (suggestionType === MEANINGS) {
									text2Display = data[i].suggestion.gloss;
									str2Search = text2Display;
								}
								else if (suggestionType === TEXT_SEARCH) {
									if (data[i].suggestion.text.search(/^[HG]\d/i) == -1) { // Make sure it is not a STRONG number (e.g.: H0001)
										text2Display = data[i].suggestion.text;
										str2Search = text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22');
										if (str2Search.indexOf("%22") == -1) {
											var strings2Search = str2Search.split(" ");
											if (strings2Search.length > 1) {
												step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex, 
													str2Search, suggestionType, strings2Search.join(" <sub>and</sub> "), "", "<b>" + __s.default_search + "</b>", __s.default_search_mouse_over_title,
													limitType, null, false, false);
												step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex, 
													str2Search, suggestionType, strings2Search.join(" <sub>or</sub> "),	"", "", "",
													limitType, null, false, false);
												text2Display = '"' + str2Search + '"';
												str2Search = '%22' + str2Search + '%22';
											}
											else {
												
												if ((str2Search.slice(-1) !== "*") && (!step.searchSelect.wordsWithNoInflection(str2Search))) {
													step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex,
														str2Search, suggestionType, text2Display, "", "", "", limitType, null, false, false);
													text2Display = str2Search + "* (" + __s.words_that_start_with + " " + str2Search + ")";
													str2Search += "*";
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
									suffixToDisplay = data[i].suggestion.gloss;
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
										step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex,
											strongWithoutAugment, suggestionType, text2Display, "", suffixToDisplay, "", limitType, augStrongSameMeaning, hasDetailLexInfo, false, userInput);
										continue;
									}
									else text2Display += '<span class="srchFrequency"> ~' + data[i].suggestion.popularity + ' x</span>';
								}
								step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex,
									str2Search, suggestionType, text2Display, "", suffixToDisplay, suffixTitle, limitType, null, false, false);
							}
							break;
						case REFERENCE:
							if ((data[i].suggestion.sectionType === 'PASSAGE') && (!data[i].suggestion.wholeBook)) {
								pos = step.searchSelect.searchUserInput.replace(/\s\s+/, ' ').search(/^\s?[\da-z][a-z]+[\s.]?\d/i);
								if (pos > -1) {
									if (userPressedEnterKey) step.searchSelect.goToPassage(data[0].suggestion.osisID, 0);
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
				if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
					limitTypeToCompare = step.searchSelect.searchTypeCode[searchResultIndex - 2];
				for (l = 0; l < searchSuggestionsToDisplay.length; l++) {
					$('#searchResults' + step.searchSelect.searchTypeCode[l]).html(searchSuggestionsToDisplay[l]);
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
			$.ajaxSetup({async: true});
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
	_getSuggestedWordsInfo: function(data, strongNum, augStrongSameMeaning, includeHebrewForGreekWords) {
		var augStrongWithMostOccurrence = 0;
		var detailLexSearchStrongs = [];
		var selectedGloss = "";
		var result = 0;
		var frequency = 0;
		var allDStrongNums = [];
		var allOtherStrongNums = [];
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
				}
				str2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag);
				if (detailLexSearchStrongs.includes(str2Search)) continue; // Don't show the same search suggestion twice
				detailLexSearchStrongs.push(str2Search);
				if ((Array.isArray(data[i].suggestion._detailLexicalTag)) && (data[i].suggestion._detailLexicalTag.length > 0)) {
					result += data[i].suggestion._detailLexicalTag.length;
					for (var j = 0; j < data[i].suggestion._detailLexicalTag.length; j ++) {
						if (data[i].suggestion._detailLexicalTag[j][1].indexOf(strongNum) != 0) {
							if (!allOtherStrongNums.includes(data[i].suggestion._detailLexicalTag[j][1])) {
								if ((suggestionType == HEBREW) || 
									((suggestionType == GREEK) && includeHebrewForGreekWords)) {
									allOtherStrongNums.push(data[i].suggestion._detailLexicalTag[j][1]);
									frequency += parseInt(data[i].suggestion._detailLexicalTag[j][3]);
								}
							}
						}
					}
				}
				else {
					result ++;
				}
				var currentWordPopularity = parseInt(data[i].suggestion.popularity);
				if ((selectedGloss === "") || (currentWordPopularity > augStrongWithMostOccurrence)) {
					selectedGloss = data[i].suggestion.gloss;
					augStrongWithMostOccurrence = currentWordPopularity;
				}
			}
			else {
				result ++;
				frequency += parseInt(data[i].suggestion.popularity);
			}
		}
		console.log(strongNum + " gloss: " + selectedGloss + " result: " + result +
			" allDStrongNums: " + allDStrongNums + " allOtherStrongNums: " +
			allOtherStrongNums + " frequency: " + frequency);
		return [selectedGloss, result, allDStrongNums, allOtherStrongNums, frequency];
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
		result['suggestion'] = suggestion;
		return result;
	},

	getVocabInfoFromJson: function (strongNum, limitType) {
        var vocabInfos = [];
		if (step.state.isLocal()) return vocabInfos;
        $.ajaxSetup({async: false});
		var strongWithoutAugment = strongNum;
		if (strongWithoutAugment.search(/^([GH]\d{4,5})[A-Za-z]$/) == 0) {
			strongWithoutAugment = RegExp.$1;
		}
		$.getJSON("/html/lexicon/" + strongWithoutAugment + ".json", function(origJsonVar) {
			for (var i = 0; i < origJsonVar.v.length; i++) {
				var jsonVar = step.searchSelect.unpackVocabJSON(origJsonVar, i);
				jsonVar['itemType'] = limitType;
				vocabInfos.push(jsonVar);
			}
		}).error(function() {
			console.log("getJSon failed strong:"+ strongNum);
		});
        $.ajaxSetup({async: true});
		return vocabInfos;
	},

	_getAdditionalInformationOnStrong: function(strongNum, augStrongSameMeaning, includeHebrewForGreekWords) {
		var limitType = (strongNum.substring(0, 1) === "H") ? HEBREW : GREEK;
		var data = step.searchSelect.getVocabInfoFromJson(strongNum, limitType);
		if (data.length > 1)
			return step.searchSelect._getSuggestedWordsInfo(data, strongNum, augStrongSameMeaning, includeHebrewForGreekWords);
		var url = SEARCH_AUTO_SUGGESTIONS + strongNum + "/" + VERSION + "%3D" + step.searchSelect.version +
				"%7C" + LIMIT + "%3D" + limitType +
				"%7C?lang=" + step.searchSelect.userLang;
		$.ajaxSetup({async: false});
		var result;
		$.getJSON(url, function (data) {
			for (var i = 0; i < data.length; i++) {
				if ((typeof data[i].suggestion._detailLexicalTag === "string") && (data[i].suggestion._detailLexicalTag !== "")) {
					data[i].suggestion._detailLexicalTag = JSON.parse(data[i].suggestion._detailLexicalTag);
				}
			}
			result = step.searchSelect._getSuggestedWordsInfo(data, strongNum, augStrongSameMeaning, includeHebrewForGreekWords);
		});
		$.ajaxSetup({async: true});
		return result;
	},

	createFirstLineForAugmentedStrong: function(data, strongNum, origSuggestionType, userInput, limitType, augStrongToShow, searchSuggestionsToDisplay, allDStrongNums, strongsToInclude) {
		var frequencyTotal = 0;
		var allStrongNumsPlusLexicalGroup = [];
		for (var i = 0; i < data.length; i++) {
			if ((data[i].itemType === GREEK) || (data[i].itemType === HEBREW)) {
				if (!allDStrongNums.includes(data[i].suggestion.strongNumber))
					allDStrongNums.push(data[i].suggestion.strongNumber);
				if ((strongsToInclude.length == 0) ||
					(strongsToInclude.includes(data[i].suggestion.strongNumber))) {
					frequencyTotal += parseInt(data[i].suggestion.popularity);
					augStrongToShow[i] = parseInt(data[i].suggestion.popularity);
					augStrongToShow[i] = step.searchSelect.getFrequencyFromDetailLexicalTag(data[i].suggestion.strongNumber, augStrongToShow[i], data[i].suggestion._detailLexicalTag);
					if (!allStrongNumsPlusLexicalGroup.includes(data[i].suggestion.strongNumber))
						allStrongNumsPlusLexicalGroup.push(data[i].suggestion.strongNumber);
					var otherStrong2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag).split(",");
					for (var count = 0; count < otherStrong2Search.length; count ++) {
						if (!allStrongNumsPlusLexicalGroup.includes(otherStrong2Search[count]))
							allStrongNumsPlusLexicalGroup.push(otherStrong2Search[count]);
					}
				}
			}
		}
		var suggestionType = data[0].itemType;
		var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(suggestionType);
		if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
			searchResultIndex = searchResultIndex - 2;
		var text2Display = '<span>' + strongNum + '*</span>';
		var suffixText = __s.has_various_and_related_forms;
		if ((origSuggestionType === GREEK_MEANINGS) || (origSuggestionType === HEBREW_MEANINGS)) {
			text2Display = '<span>';
			if (strongsToInclude.length > 1)
				text2Display += strongsToInclude.length + ' different ';
			text2Display += strongNum + '* (<i>' + data[0].suggestion.stepTransliteration + '</i>) ' +
				__s.and_synonyms_with_the_meaning + ' ' + userInput + '</span>';
			suffixText = "";
		}
		else text2Display += ' (<i>' + data[0].suggestion.stepTransliteration + '</i>)';
		text2Display += '<span class="srchFrequency"> ~' + frequencyTotal + ' x</span>';
		step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex, 
			allStrongNumsPlusLexicalGroup.toString(), suggestionType, text2Display, "", suffixText, "", limitType, null, false, false);
	},
	createSubsequentLineForAugmentedStrong: function(sorted, data, strongNum, origSuggestionType, limitType, searchSuggestionsToDisplay, strongsToInclude, detailLexSearchStrongs) {
		for (var k = 0; k < sorted.length; k++) {
			var i = parseInt(sorted[k][0]);
			var suggestionType = data[i].itemType;
			var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(suggestionType);
			if (searchResultIndex >= step.searchSelect.numOfSearchTypesToDisplay)
					searchResultIndex = searchResultIndex - 2;
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
				var gloss = data[i].suggestion.gloss;
				var strongPrefix = strongNum[0].toUpperCase();
				text2Display = data[i].suggestion.type + ": ";
				str2Search = step.searchSelect.extractStrongFromDetailLexicalTag(data[i].suggestion.strongNumber, data[i].suggestion._detailLexicalTag);
				if (detailLexSearchStrongs.includes(str2Search)) continue; // Don't show the same search suggestion twice
				detailLexSearchStrongs.push(str2Search);
				var frequency = data[i].suggestion.popularity;
				var curStrong = data[i].suggestion.strongNumber;
				var searchExplaination = "";
				if ((Array.isArray(data[i].suggestion._detailLexicalTag)) && (data[i].suggestion._detailLexicalTag.length > 0)) {
					frequency = step.searchSelect.getFrequencyFromDetailLexicalTag(strongNum, frequency, data[i].suggestion._detailLexicalTag);
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
					text2Display = "All " + frequency + " occurrences";
					gloss = "";
				}
				else {
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
							'<span class="srchFrequency"> ~' + frequency + ' x</span>';
					}
					else text2Display +=
							'<i class="srchTransliteration">' + data[i].suggestion.stepTransliteration + '</i>' +
							'<span class="srchParathesis"> (</span>' +
							'<span class="srchOriginal_Language">' + data[i].suggestion.matchingForm + '</span>' +
							'<span class="srchSpaceStrong"> </span>' +
							'<span class="srchStrong_number">' + curStrong + '</span>' +
							'<span class="srchParathesis">)</span>' +
							'<span class="srchFrequency"> ~' + frequency + ' x</span>';
				}
				//definitions.push({ gloss: data[i].suggestion.gloss, matchingForm: data[i].suggestion.matchingForm,
				//	popularity: frequency, stepTransliteration: data[i].suggestion.stepTransliteration, strongNumber: curStrong,
				//	type: "word" });
				step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex,
					str2Search, suggestionType, text2Display, searchExplaination, gloss, "", limitType, null, false, true);
				var detailLex = step.searchSelect.buildHTMLFromDetailLexicalTag(strongNum, data[i].suggestion._detailLexicalTag, i);
				searchSuggestionsToDisplay[searchResultIndex] += detailLex[0];
	//				definitions = definitions.concat(detailLex[1]);
			}
			else
				console.log("Unknown result: " + suggestionType);
		}
	},

	createDisplayForAugmentedStrong: function(data, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType) {
		var searchSuggestionsToDisplay = [];
		var detailLexSearchStrongs = [];
		for (var i = 0; i < step.searchSelect.numOfSearchTypesToDisplay; i++) {
			searchSuggestionsToDisplay.push("");
		}
		var allDStrongNums = [];
		var strongsToInclude = ((augStrongSameMeaning == null) || (augStrongSameMeaning === "") || (augStrongSameMeaning === "null")) ? [] : augStrongSameMeaning.split(",");
		var augStrongToShow = {};
		var sorted = [];
		if (data.length > 1) {
			step.searchSelect.createFirstLineForAugmentedStrong(data, strongNum, origSuggestionType, userInput, limitType, augStrongToShow, searchSuggestionsToDisplay, allDStrongNums, strongsToInclude);
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
		step.searchSelect.createSubsequentLineForAugmentedStrong(sorted, data, strongNum, origSuggestionType, limitType, searchSuggestionsToDisplay, strongsToInclude, detailLexSearchStrongs);
//		step.def2 = definitions;
		if (isNaN(strongNum.slice(-1))) {
			searchSuggestionsToDisplay[searchResultIndex] += "<br>";
			step.searchSelect.appendSearchSuggestionsToDisplay(searchSuggestionsToDisplay, searchResultIndex, 
				allDStrongNums.toString(), suggestionType, strongNum.substring(0, strongNum.length-1) + "*", 
				"Click here for all words that starts with ", "", "", limitType, null, false, false);
		}
		for (var l = 0; l < searchSuggestionsToDisplay.length; l++) {
			if (step.searchSelect.searchTypeCode[l] === limitType) {
				$('#searchResults' + step.searchSelect.searchTypeCode[l]).html(searchSuggestionsToDisplay[l]);
				$('.select-' + step.searchSelect.searchTypeCode[l]).show();
			}
			else $('.select-' + step.searchSelect.searchTypeCode[l]).hide();
		}
	},

	_showAugmentedStrong: function(strongNum, augStrongSameMeaning, origSuggestionType, userInput) {
		console.log("X: " + strongNum + " " + augStrongSameMeaning + " " + origSuggestionType + " " + userInput);
		$('#warningMessage').text('');
		$('textarea#userTextInput').hide();
		$('#updateButton').hide();
		$("#advancedsearchonoff").hide();
		$("#hd4").text(__s.please_select_following);
		step.searchSelect.searchModalCurrentPage = 3;	
		$('#srchModalBackButton').show();
		var limitType = (strongNum.substring(0, 1) === "H") ? HEBREW : GREEK;
		var data = step.searchSelect.getVocabInfoFromJson(strongNum, limitType);
		if (data.length > 0)
			step.searchSelect.createDisplayForAugmentedStrong(data, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType);
		else {
			var url = SEARCH_AUTO_SUGGESTIONS + strongNum + "/" + VERSION + "%3D" + step.searchSelect.version +
					"%7C" + LIMIT + "%3D" + limitType +
					"%7C?lang=" + step.searchSelect.userLang;
			$.ajaxSetup({async: false});
			$.getJSON(url, function (data) {
				for (var i = 0; i < data.length; i++) {
					if ((typeof data[i].suggestion._detailLexicalTag === "string") && (data[i].suggestion._detailLexicalTag !== "")) {
						data[i].suggestion._detailLexicalTag = JSON.parse(data[i].suggestion._detailLexicalTag);
					}
				}
				step.searchSelect.createDisplayForAugmentedStrong(data, strongNum, augStrongSameMeaning, origSuggestionType, userInput, limitType);
			}).fail(function() {
				changeBaseURL();
			});
			$.ajaxSetup({async: true});
		}
		$(".detailLexTriangle").click(step.searchSelect._handleClickOnTriangle);
		$("#column1width").width("100%");
		$(".search-type-column").hide();
		step.searchSelect._updateDisplayBasedOnOptions();
	},
	buildSuffixTag: function(suffixToDisplay, suffixTitle) {
		//if ((step.touchDevice) || (suffixToDisplay === "")) return "";
		if (suffixToDisplay === "") return "";
		var tag = "<span";
		if (suffixTitle !== "") tag += ' title="' + suffixTitle + '"';
		tag += '>' + suffixToDisplay + '</span>';
		return tag;
	},
	addWithoutDuplicates: function(existingSuggestionsToDisplay, suggestToDisplayIndex, needLineBreak, newSuggestion) {
		var i = newSuggestion.search(/\.goSearch\([^)]+\)/);
		if (i > -1) {
			var search1 = RegExp.lastMatch;
			i = RegExp.rightContext.search(/\._showAugmentedStrong\('[GH]\d{4,5}',/);
			if (i > -1) {
				var search2 = RegExp.lastMatch;
				i = RegExp.rightContext.search(/<span>\((\d{1,3}) forms\)<\/span>/);
				if (i > -1) {
					var search3 = RegExp.lastMatch;
					var existingLines = existingSuggestionsToDisplay[suggestToDisplayIndex].split("<br>");
					for (var j = 0; j < existingLines.length; j++) {
						var k = existingSuggestionsToDisplay[suggestToDisplayIndex].indexOf(search1);
						if (k > -1) {
							k = existingSuggestionsToDisplay[suggestToDisplayIndex].indexOf(search2, k);
							if (k > -1) {
								k = existingSuggestionsToDisplay[suggestToDisplayIndex].indexOf(search3, k);
								if (k > -1) {
									console.log("skip: " + search1 + " " + search2 + " " + search3);
									return;
								}
							}
						}
					}
				}
			}
		}
		existingSuggestionsToDisplay[suggestToDisplayIndex] += needLineBreak + newSuggestion;
	},
	appendSearchSuggestionsToDisplay: function(existingSuggestionsToDisplay, suggestToDisplayIndex, str2Search, suggestionType, text2Display, 
		prefixToDisplay, suffixToDisplay, suffixTitle, limitType, augStrongSameMeaning, hasDetailLexInfo, needIndent, userInput) {
		var brCount = 0;
		var suggestionsToDisplay = 5;
		var needLineBreak = "";
		var isAugStrong = Array.isArray(augStrongSameMeaning);
		if (existingSuggestionsToDisplay[suggestToDisplayIndex] !== "") {
			brCount = (existingSuggestionsToDisplay[suggestToDisplayIndex].match(/<br>/g) || []).length;
			brCount += (existingSuggestionsToDisplay[suggestToDisplayIndex].match(/<\/ol>/g) || []).length;
			if (((brCount < suggestionsToDisplay + 1) || (limitType !== ""))) {
					if (existingSuggestionsToDisplay[suggestToDisplayIndex].slice(-5) !== "</ol>") {
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
				var includeHebrewForGreekWords = needIndent && (hasDetailLexInfo == null);
				var additionalInfoOnStrong = this._getAdditionalInformationOnStrong(str2Search, augStrongSameMeaning, includeHebrewForGreekWords);
				var numOfForm = additionalInfoOnStrong[1];
				var updatedGloss = additionalInfoOnStrong[0];
				var numOfFormMsg = (numOfForm > 0) ? "(" + numOfForm + " forms)" : "";
				var frequency = additionalInfoOnStrong[4];
				text2Display += '<span class="srchFrequency"> ~' + frequency + ' x</span>';

				var str2Search4ShowAugmentedStrong = str2Search;
				if (isAugStrong) {
					str2Search = additionalInfoOnStrong[2].toString();
					if (updatedGloss !== "") suffixToDisplay = updatedGloss;
				}
				if (additionalInfoOnStrong[3].length > 0) {
					str2Search += "," + additionalInfoOnStrong[3].toString();
					titleText = ' title="All forms: ' + str2Search + '" ';
				}
				step.searchSelect.addWithoutDuplicates(existingSuggestionsToDisplay, suggestToDisplayIndex, needLineBreak, 
					prefixToDisplay +
					'<a style="padding:0px"' + titleText + ' href="javascript:step.searchSelect.goSearch(\'' + searchType + '\',\'' + str2Search + '\')">' +
					text2Display + "</a> - " + this.buildSuffixTag(suffixToDisplay, suffixTitle) +
					' <a style="padding:0px" title="Select forms" href="javascript:step.searchSelect._showAugmentedStrong(\'' + str2Search4ShowAugmentedStrong + '\',\'' +
					augStrongSameMeaning + '\',\'' + suggestionType + '\',\'' + userInput + '\')"><span>' + numOfFormMsg + '</span></a>');
			}
			else {
				var aTagStyle = "padding:0px";
				existingSuggestionsToDisplay[suggestToDisplayIndex] += needLineBreak + prefixToDisplay +
					'<a style="' + aTagStyle + '"' + titleText + ' href="javascript:step.searchSelect.goSearch(\'' + searchType + '\',\'' + 
					str2Search + '\',\'' + 
					text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22') +
					'\')">' + text2Display + "</a> " + this.buildSuffixTag(suffixToDisplay, suffixTitle);
			}
			return;
		}
		if (brCount < suggestionsToDisplay) {
			existingSuggestionsToDisplay[suggestToDisplayIndex] += needLineBreak +
				'<a style="padding:0px" title="click to see more suggestions" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' 
				+ suggestionType + '\')"><b>' + __s.more + '...</b></a>';
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

	getFrequencyFromDetailLexicalTag: function(strongNum, frequency, detailLexicalJSON) {
		total = parseInt(frequency);
		if ((Array.isArray(detailLexicalJSON)) && (detailLexicalJSON.length > 0)) {
			detailLexicalJSON.forEach(function (item, index) {
				if (item[1] !== strongNum) {
					total += parseInt(item[3]);
				}
			});
		}
		return total;
	},

	buildHTMLFromDetailLexicalTag: function(strongNum, detailLexicalJSON, count) {
		if ((!detailLexicalJSON) || (!Array.isArray(detailLexicalJSON))) return ["", []];
		var result = "<a id='detailLexSelect" + count + "' class='detailLexTriangle glyphicon glyphicon-triangle-bottom'></a>" +
			"<ol class='detailLex" + count + "' style='margin-bottom:0px;line-height:14px'>";
		var allStrongs = [];
		var definitions = [];
		var aTagStype = "padding:0px;color:var(--clrStrongText)";
		detailLexicalJSON.forEach(function (item, index) {
			if (allStrongs.includes(item[1])) return;
			allStrongs.push(item[1]);
			var spaceWithoutLabel = "&nbsp;&nbsp;&nbsp;";
			result +=  "<li>";
			if (item[1] === strongNum) {
				result += "<span class='detailLex" + count + " glyphicon glyphicon-arrow-right' style='font-size:10px'></span>";
				spaceWithoutLabel = "";
			}
			result += '<a class="detailLex' + count + '" style="' + aTagStype + '" title="' + item[1] + '"' +
				'href="javascript:step.searchSelect.goSearch(\'strong\',\'' + 
				item[1] + '\',\'' + item[1] +	'\')">' + spaceWithoutLabel + "" + item[0] + ": " +
				'<i class="srchTransliteration">' + item[5] + '</i>' +
				'<span class="srchParathesis"> (</span>' +
				'<span class="srchOriginal_Language">' + item[4] + '</span>' +
				'<span class="srchSpaceStrong"> </span>' +
				'<span class="srchStrong_number">' + item[1] + '</span>' +
				'<span class="srchParathesis">)</span>' +
				'<span class="srchFrequency"> ~' + item[3] + ' x</span>' +
				"</a> - " + item[2];
			definitions.push({ gloss: item[2], matchingForm: item[4],
				popularity: item[3], stepTransliteration: item[5], strongNumber: item[1],
				type: "word" });
		});
		result += "</ol>";
		return [result, definitions];
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

	_buildJoinString: function(currentJoin, previousJoins, searchType) {
		var previousJoinString = "";
		if (typeof searchType === "undefined") {
			console.log("dont know why the searchtype is undefined in buildJoinString");
		}
		if ((typeof currentJoin === "string") && (currentJoin.length > 0)) currentJoin = currentJoin.substring(0,1).toLowerCase();
		else currentJoin = "a";
		var previousJoinString = "1";
		var searchCount = 0;
		if (previousJoins.length > 0) {
			for (searchCount = 0; i < previousJoins.length; searchCount++) {
				previousJoinString += previousJoins[searchCount].substring(0,1).toLowerCase();
				previousJoinString += (searchCount + 1);
			}
		}
		else searchCount = 1;
		var newJoinString = "";
		if (previousJoinString !== "") newJoinString = previousJoinString + currentJoin + (searchCount + 1);
		if (newJoinString !== "") newJoinString = "|srchJoin=" + newJoinString;
		return newJoinString;
	},

	addSearchWords: function(searchWord) {
		var current = step.util.localStorageGetItem("step.previousSearches");
		var newSearchLists = searchWord;
		if (current != null) {
			current = current.split(";");
			for (var i = 0; ((i < current.length) && (i < 9)); i++) {
				newSearchLists += ";" + current[i];
			}
		}
		step.util.localStorageSetItem("step.previousSearches", newSearchLists);
	},

	goSearch: function(searchType, searchWord, displayText) {
		step.searchSelect.addSearchWords(step.searchSelect.searchUserInput);
		var activePassageData = step.util.activePassage().get("searchTokens") || [];
		var allVersions = "";
		var range = (this.searchRange === "Gen-Rev") ? "" : "|reference=" + this.searchRange;
		var currentSearch = "";
		for (var i = 0; i < activePassageData.length; i++) {
			var itemType = activePassageData[i].itemType ? activePassageData[i].itemType : activePassageData[i].tokenType
			if (itemType === VERSION) {
				if (allVersions.length > 0) allVersions += '|';
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
				previousSearch += '|' + this.previousSearchTokens[i];
			}
		}
		var searchJoinsForMultipleStrongs = "";
		numOfSearches ++;
		if (searchType === TEXT_SEARCH) {
			var andSearchStrings = displayText.split(" <sub>and</sub> ");
			if (andSearchStrings.length > 1) {
				currentSearch = "";
				for (var i = 0; i < andSearchStrings.length; i++) {
					currentSearch += '|text=' + andSearchStrings[i];	
				}
			}
			else currentSearch = '|text=' + searchWord;
		}
		else if (searchType === STRONG_NUMBER) {
			var searchWords = searchWord.split(",");
			currentSearch = '|strong=' + searchWords[0];
			step.util.putStrongDetails(searchWord[0], displayText);
			if (searchWords.length > 1) {
				searchJoinsForMultipleStrongs = "("  + numOfSearches;
				for (var i = 1; i < searchWords.length; i++) {
					numOfSearches ++;
					currentSearch += '|strong=' + searchWords[i];
					searchJoinsForMultipleStrongs += "o" + numOfSearches;
					step.util.putStrongDetails(searchWord[i], displayText);
				}
				searchJoinsForMultipleStrongs += ")";
			}
		}
		else if (typeof searchType !== "undefined") currentSearch = '|' + searchType + '=' + searchWord;
		var joins = "";
		if (previousJoinString !== "") {
			joins = "|srchJoin="
			if (currentSearch === "") joins += previousJoinString;
			else if (numOfSearches > 1) {
				if (searchJoinsForMultipleStrongs === "") joins += previousJoinString + currentJoin + numOfSearches;
				else joins += previousJoinString + currentJoin + searchJoinsForMultipleStrongs;
			}
		}
		else if (searchJoinsForMultipleStrongs !== "") {
			joins = "|srchJoin=" + searchJoinsForMultipleStrongs;
		}
		var url = allVersions + range + joins + previousSearch + currentSearch;
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		step.util.closeModal('searchSelectionModal');
		if (selectedDisplayLoc === "new") step.util.createNewColumn();
		step.router.navigateSearch(url, true, true);
	},

	goToPassage: function(osisID, chptrOrVrsNum) {
		var bookID = osisID.substring(0, osisID.indexOf("."));
		if (bookID === "") bookID = osisID;
		var activePassageData = step.util.activePassage().get("searchTokens") || [];
		var allVersions = "";
		var existingReferences = "";
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		for (var i = 0; i < activePassageData.length; i++) {
			var itemType = activePassageData[i].itemType ? activePassageData[i].itemType : activePassageData[i].tokenType
			if (itemType == "version") {
				if (allVersions.length > 0) allVersions += "|version=";
				allVersions += activePassageData[i].item.shortInitials;
			}
			else if ((selectedDisplayLoc === "append") && (itemType == "reference")) {
				existingReferences += "|reference=" + activePassageData[i].item.osisID;
			}
		}
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