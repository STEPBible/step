window.step = window.step || {};
step.searchSelect = {
	version: "ESV_th",
	userLang: "en",
	searchOnSpecificType: "",
	searchTypeCode: [TEXT_SEARCH, SUBJECT_SEARCH, MEANINGS, GREEK_MEANINGS, GREEK, HEBREW_MEANINGS, HEBREW],
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
        
		var ua = navigator.userAgent.toLowerCase();
		$("#searchmodalbody").addClass("scrollPart");
		if ((this.userLang.indexOf('en') != 0) && (this.groupsOT[0].groupName === "Books of Moses") && (this.groupsOT[0].groupName !== "Pentateuch"))
			this.groupsOT[0].groupName = __s.the_pentateuch;
		if ($('.passageContainer.active').width() < 500) $('#displayLocForm').hide();
		if (step.util.getPassageContainer(step.util.activePassageId()).find(".resultsLabel").text() !== "") {
			var activePassageData = step.util.activePassage().get("searchTokens") || [];
			var existingReferences = "";
			$('#previousSearch').empty();
			var listOfPreviousSearch = [];
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
						var searchRelationship = "";
						for (var j = 0; j < syntaxWords.length; j++) {
							if (syntaxWords[j] == "") continue;
							if ((j > 0) && (searchRelationship === "") &&
								((syntaxWords[j] === "AND") || (syntaxWords[j] === "OR") || (syntaxWords[j] === "NOT"))) {
								searchRelationship = syntaxWords[j];
								continue;
							}
							if (syntaxWords[j].substr(0, 7) === STRONG_NUMBER + ":") {
								var strongNum = syntaxWords[j].substr(7);
								if (strongNum.substr(0, 1).toUpperCase() === "G") itemType = GREEK;
								else if (strongNum.substr(0, 1).toUpperCase() === "H") itemType = HEBREW;
								var result = step.util.getDetailsOfStrong(strongNum, this.version);
								currWord = {token: syntaxWords[j], item: {gloss: result[0], stepTransliteration: result[1], matchingForm: result[2]} };
							}
							else {
								itemType = TEXT_SEARCH;
								currWord = {token: syntaxWords[j], item: {} };
							}
							this.numOfPreviousSearchTokens = this.createPreviousSearchList(itemType, currWord, listOfPreviousSearch, this.previousSearchTokens, this.numOfPreviousSearchTokens, searchRelationship);
							searchRelationship = "";
						}
					}
					else this.numOfPreviousSearchTokens = this.createPreviousSearchList(itemType, actPsgeDataElm, listOfPreviousSearch, this.previousSearchTokens, this.numOfPreviousSearchTokens);
				}
			}
			if (listOfPreviousSearch.length > 0) {
				var previousSearchHTML =
				'<div id="modalonoffswitch">' +
					'<span class="pull-left" style="font-size:18px" id="search_with_previous">' + __s.search_with_previous + '&nbsp;&nbsp;</span>' +
					'<span class="pull-left">' +
						'<select id="searchAndOrNot" style="display:none;font-size:16px" class="stepButton" type="text" onchange="javascript:step.searchSelect.handlePreviousSearchAndOrNot()">' +
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
				'<ul id="listofprevioussearchs" style="display:none">';
				for (var j = 0; j < listOfPreviousSearch.length; j++) {
					previousSearchHTML += "<li id='lOPS_" + j + "'>" + listOfPreviousSearch[j] + 
					"<span class='closeMark' onclick=step.searchSelect.removePreviousSearch(" + j + ")>X</span></li>";
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
		$('#searchHdrTable').append(this._buildSearchHeaderAndTable());
		$('#srchModalBackButton').hide();
		$(function(){
			$('textarea#userTextInput').on('input', function(e){
				this.timer && clearTimeout(this.timer);
				this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
			});
		});
	},

	createPreviousSearchList: function(itemType, actPsgeDataElm, listOfPreviousSearch, previousSearchTokensArg, numOfPreviousSearchTokensArg, previousSearchRelationship) {
		if (typeof previousSearchRelationship === "undefined") previousSearchRelationship = "";
		else if (previousSearchRelationship !== "") {
			var andSelected = (previousSearchRelationship === "AND") ? " selected" : "";
			var orSelected = (previousSearchRelationship === "OR") ? " selected" : "";
			var notSelected = (previousSearchRelationship === "NOT") ? " selected" : "";
			previousSearchRelationship = 
				' <select id="searchAndOrNot' + numOfPreviousSearchTokensArg + '" class="stepButton" style="font-size:16px" type="text" onchange="javascript:step.searchSelect.handleAndOrNot()">' +
					'<option id="and_search" value="AND"' + andSelected + '>' + __s.and + '</option>' +
					'<option id="or_search" value="OR"' + orSelected + '>' + __s.or + '</option>' +
					'<option id="not_search" value="NOT"' + notSelected + '>' + __s.not + '</option>' +
				'</select> ';
		}
		var type = itemType.toLowerCase();
		if (this.searchTypeCode.indexOf(itemType) > 2) {
			if (type.indexOf("greek") == 0) type = "greek";
			else if (type.indexOf("hebrew") == 0) type = "hebrew";
			if (typeof __s[type] !== "undefined") type = __s[type];
			var htmlOfTerm = actPsgeDataElm.item.gloss;
			if (actPsgeDataElm.item.stepTransliteration !== "")
				htmlOfTerm += ' (<i>' + actPsgeDataElm.item.stepTransliteration + '</i> - ' + actPsgeDataElm.item.matchingForm + ')';
			html = "<span style='font-size:16px'>" + previousSearchRelationship + type + "</span> = " + htmlOfTerm;
			listOfPreviousSearch.push(html);
			var strongNum = (actPsgeDataElm.token.toLowerCase().indexOf("strong:") == 0) ? actPsgeDataElm.token.substr(7) : actPsgeDataElm.token;
			if (strongNum.search(/([GH]\d{1,5})[A-Za-z]$/) > -1) strongNum = RegExp.$1; // remove the last character if it is an a-g character
			previousSearchTokensArg.push("strong=" + strongNum);
			if (actPsgeDataElm.item.stepTransliteration !== "") step.util.putStrongDetails(strongNum, htmlOfTerm);
		}
		else {
			if (typeof __s[type] !== "undefined") type = __s[type];
			listOfPreviousSearch.push("<span style='font-size:16px'>" + previousSearchRelationship + type + "</span> = " + actPsgeDataElm.token);
			previousSearchTokensArg.push(itemType + "=" + actPsgeDataElm.token);
		}
		return numOfPreviousSearchTokensArg + 1;
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
			var userInput =  $('textarea#userTextInput').val();
			if ((userInput.slice(-1) === "\n") || (e.originalEvent.inputType === "insertLineBreak")) {
				$('#warningMessage').text(__s.click_to_select_search);
				userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
				$('textarea#userTextInput').val(userInput);
				if (userInput.replace(/\s\s+/, ' ').search(/^\s?[\da-z][a-z]+[\s.]?\d/i) > -1) step.searchSelect._handleEnteredSearchWord(null, null, true);
				if ($("#searchResultstext").find("a").text() != userInput) step.searchSelect._handleEnteredSearchWord();
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
		showPreviousSearch(); // The function will determine if it need to show previous search
		if (typeof $('textarea#userTextInput').val() == "undefined") { // Must be in the search range modal because search range does not have ID userTextInput
			$('#searchHdrTable').empty().append(this._buildSearchHeaderAndTable());
			$('#previousSearch').show();
			if (this.searchModalCurrentPage == 1) $('#srchModalBackButton').hide();
			$(function(){
				$('textarea#userTextInput').on('input', function(e){
					this.timer && clearTimeout(this.timer);
					this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
				});
				// .keyup(function(e){
					// this.timer && clearTimeout(this.timer);
					// this.timer = setTimeout(step.searchSelect.handleKeyboardInput, 300, e);
				// });
			});
			$('textarea#userTextInput').focus();
			this._handleEnteredSearchWord(null, this.searchUserInput);
		}
		else if (this.searchModalCurrentPage == 2) {
			this.searchOnSpecificType = "";
			this.searchModalCurrentPage = 1;
			$('#srchModalBackButton').hide();
			this._handleEnteredSearchWord();
		}
		else console.log('Unknown state goBackToPreviousPage');
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

		var html = '<div class="header">' +
			'<h4>' + __s.enter_search_word + '</h4>' +
			'<button id="searchRangeButton" type="button" class="stepButtonTriangle" style="float:right;" onclick=step.searchSelect._buildRangeHeaderAndTable()><b>' + __s.search_range + ':</b> ' + displayRange + '</button>' +
			'</div><br>' +
			'<span id="warningMessage" style="color: red;"></span>' +
			'<textarea id="userTextInput" rows="1" class="stepFgBg" style="font-size:16px;width:80%"></textarea><br><br>' + // size 16px so the mobile devices will not expand
			'<div id="search_table">' +
			'<table border="1">' +
			'<colgroup>' +
			'<col span="1" style="width:39%;">' +
			'<col span="1" style="width:61%;">' +
			'</colgroup>' +
			'<tr>' +
			'<th scope="col">' + __s.type_of_search + '</th>' +
			'<th scope="col">' + __s.suggested_search_words + '</th>' +
			'</tr>';
		for (var i = 0; i < this.searchTypeCode.length; i ++) {
			var srchCode = this.searchTypeCode[i];
			var warnMsgForOrNotSearch = ((srchCode === MEANINGS) || (srchCode === SUBJECT_SEARCH)) ?
				'<span id="searchResults' + srchCode + 'Warn" style="display:none">' + __s.incompatible_search + '</span>' :
				"";
			html += '<tr style="height:40px;" class="select2-results-dept-0 select2-result select2-result-selectable select-' + srchCode + '">' +
				'<td class="select2-results-dept-0 select2-result select2-result-selectable select-' + srchCode + '" title="' + 
				__s['search_type_title_' + srchCode] + '" style="font-size:12px;text-align:left">' + __s['search_type_desc_' + srchCode] + ':</td>' +
				'<td style="text-align:left"><span id="searchResults' + srchCode + '"></span>' + warnMsgForOrNotSearch + '</td>' +
				'</tr>';
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
			if ((!onlyDisplaySpecifiedBooks) && (!step.touchDevice)) {
				$('.footer').prepend('<a id="keyboardEntry" href="javascript:step.searchSelect._buildRangeKeyboard();"><img src="/images/keyboard.jpg" alt="Keyboard entry"></a>');
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
		var translationsWithPopularBooksChapters = " niv esv nasb nasb_th nav sparv sparv1909 cun cuns chincvs abp abpgrk acv akjv alb arasvd asmulb asv bbe benulb bsb bulprotrev burjudson ccb clarke cro cym czebkr dan dan1871 darby dtn dutkant dutsvv esperanto fcb finbiblia finpr frebbb frecrl fremartin frepgr gen gerelb1871 gerelb1905 gergruenewald gersch gujulb haitian hcsb hinulb hnv hrvcb hunkar icelandic itadio itarive jfb jub kanulb kjv korhkjv korrv lbla luther mal1865 malulb maori marulb mhc mhcc nbla ndebele neno netfull nhe nhj nhm norsk norsmb ntlr nvi oriulb panulb pnvi polgdanska porar romcor roth rskj rwebs scofield serdke shona sparvg spasev swe1917 swekarlxii1873 tagangbiblia tamulb telulb tglulb tsk ukjv ukrainian umgreek urdulb viet vulgj web webb webm webs ylt ";
		var translationsWithPopularNTBooksChapters = ' 20c abbott ant armwestern barnes bashautin burkitt bwe byz cebulb che1860 comm copsahhorner copsahidica copsahidicmss diag ee elz eth family godb hauulb indulb khmkcb latvian leb lo mont murd nepulb nestle pesh pltulb pnt portb rkjn rwp sblg sblgntapp spavnt swahili swaulb thgnt tisch tnt tr ukrkulish uma varapp weym whnu wors ';
		var translationsWithPopularOTBooksChapters = ' ab gertextbibel kd wlc lees lxx rusmakarij ';
		var lowerCaseVersion = ' ' + this.version.toLowerCase() + ' ';
		versionAltName = ' ' + versionAltName.toLowerCase() + ' ';
		var translationType = "";
		if ((translationsWithPopularBooksChapters.indexOf(lowerCaseVersion) > -1) || (translationsWithPopularBooksChapters.indexOf(versionAltName) > -1)) translationType = "OTNT";
		else if ((translationsWithPopularNTBooksChapters.indexOf(lowerCaseVersion) > -1) || (translationsWithPopularNTBooksChapters.indexOf(versionAltName) > -1)) translationType = "NT";
		else if ((translationsWithPopularOTBooksChapters.indexOf(lowerCaseVersion) > -1) || (translationsWithPopularOTBooksChapters.indexOf(versionAltName) > -1)) translationType = "OT";
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
		var additionalBooks = false;
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

	_handleEnteredSearchWord: function(limitType, previousUserInput, userPressedEnterKey) {
		var userInput = '';
		$('#warningMessage').text('');
		if ((typeof previousUserInput === "undefined") || (previousUserInput === null))  userInput =  $('textarea#userTextInput').val();
		else {
			userInput = previousUserInput;
			$('textarea#userTextInput').text(userInput);
		}
		userInput = userInput.replace(/[\n\r]/g, ' ').replace(/\t/g, ' ').replace(/\s\s/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '');
		step.searchSelect.searchUserInput = userInput;
		if ((userInput.length > 1) || ((step.searchSelect.userLang.toLowerCase().indexOf("zh") == 0) && (userInput.length > 0))) {
			$('#updateButton').hide();
			var url;
			if (((typeof limitType === "undefined") || (limitType === null)) && (step.searchSelect.searchOnSpecificType == ""))
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version + "%7C?lang=" + step.searchSelect.userLang;
			else {
				if ((typeof limitType === "undefined") || (limitType === null)) limitType = step.searchSelect.searchOnSpecificType;
				else {
					step.searchSelect.searchOnSpecificType = limitType;
					step.searchSelect.searchModalCurrentPage = 2;
				}
				$('#srchModalBackButton').show();
				url = SEARCH_AUTO_SUGGESTIONS + userInput + "/" + VERSION + "%3D" + step.searchSelect.version + "%7C" + LIMIT + "%3D" + limitType + "%7C?lang=" + step.searchSelect.userLang;
			}
			$.ajaxSetup({async: false});
			$.getJSON(url, function (data) {
				var searchResultsToDisplay = [];
				for (var i = 0; i < step.searchSelect.searchTypeCode.length; i++) {
					searchResultsToDisplay.push("");
				}
				for (var i = 0; i < data.length; i++) {
					var searchType = data[i].itemType;
					var searchResultIndex = step.searchSelect.searchTypeCode.indexOf(searchType);
					switch(searchType) {
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
									for (var k = 0; k < data[i].extraExamples.length; k++) {
										if (k > 0) text2Display += ", ";
										if ((searchType === GREEK) || (searchType === HEBREW))
											text2Display += '<i>' + data[i].extraExamples[k].stepTransliteration + '</i>';
										else if ((searchType === GREEK_MEANINGS) || (searchType === HEBREW_MEANINGS) || (searchType === MEANINGS))
											text2Display += data[i].extraExamples[k].gloss;
										else if (searchType === SUBJECT_SEARCH)
											text2Display += data[i].extraExamples[k].value;
									}
									if (text2Display.length == 0) console.log('group, but no examples');
									else {
										text2Display += ', ' + __s.etc + '<i style="font-size:12px" class="glyphicon glyphicon-arrow-right"></i>';
										if (searchResultsToDisplay[searchResultIndex] !== "") searchResultsToDisplay[searchResultIndex] += "<br>";
										searchResultsToDisplay[searchResultIndex] += '<a style="padding:0px;" href="javascript:step.searchSelect._handleEnteredSearchWord(\'' + searchType + '\')">' + text2Display + "</a>";
									}
								}
								else {
									if (searchResultsToDisplay[searchResultIndex] !== "") searchResultsToDisplay[searchResultIndex] += "<br>";
									searchResultsToDisplay[searchResultIndex] += 'There are ' + data[i].count + ' more options.  Keep typing to see them.';
								}
							}
							else {
								var str2Search = "";
								if (searchType === SUBJECT_SEARCH) {
									text2Display = data[i].suggestion.value;
									str2Search = text2Display;
								}
								else if (searchType === MEANINGS) {
									text2Display = data[i].suggestion.gloss;
									str2Search = text2Display;
								}
								else if (searchType === TEXT_SEARCH) {
									if (data[i].suggestion.text.search(/^[HG]\d/i) == -1) { // Make sure it is not a STRONG number (e.g.: H0001)
										text2Display = data[i].suggestion.text;
										str2Search = text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22');
									}
								}
								else {
									text2Display = data[i].suggestion.gloss + ' (<i>' + data[i].suggestion.stepTransliteration +
										'</i> - ' + data[i].suggestion.matchingForm + ')';
									str2Search = data[i].suggestion.strongNumber;
									searchType = 'strong';
								}
								if (searchResultsToDisplay[searchResultIndex] !== "") searchResultsToDisplay[searchResultIndex] += "<br>";
								searchResultsToDisplay[searchResultIndex] += '<a style="padding:0px;" href="javascript:step.searchSelect.goSearch(\'' + searchType + '\',\'' + 
									str2Search + '\',\'' + 
									text2Display.replace(/["'\u201C\u201D\u2018\u2019]/g, '%22') +
									'\')">' + text2Display + "</a>";
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
							alert("Unknown result: " + searchType);
							break;
					}
				}
				for (l = 0; l < searchResultsToDisplay.length; l++) {
					$('#searchResults' + step.searchSelect.searchTypeCode[l]).html(searchResultsToDisplay[l]);
					if ((typeof limitType === "undefined") || (limitType === null)) $('.select-' + step.searchSelect.searchTypeCode[l]).show()
					else if (searchResultsToDisplay[l].length > 0) $('.select-' + step.searchSelect.searchTypeCode[l]).show()
					else $('.select-' + step.searchSelect.searchTypeCode[l]).hide()
				}
			}).fail(function() {
                changeBaseURL();
            });
			$.ajaxSetup({async: true});
		}
		else {
			for (l = 0; l < step.searchSelect.searchTypeCode.length; l++) {
				$('#searchResults' + step.searchSelect.searchTypeCode[l]).text("");
			}
			showPreviousSearch(); // The update previous search button might need to be displayed if user has includes previous search 
		}
	},

	goSearch: function(searchType, searchWord, displayText) {
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
		if (searchType === TEXT_SEARCH) currentSearch = '|syntax=t=' + searchWord;
		else if (searchType === STRONG_NUMBER) {
			if (!this.includePreviousSearches) currentSearch = '|strong=' + searchWord;
			else {
				if (searchWord.search(/([GH]\d{1,5})[A-Za-z]$/) > -1) searchWord = RegExp.$1; // remove the last character if it is an a, b, c, d, e, f, g, ...
				currentSearch = '|syntax=t=strong:' + searchWord;
			}
			step.util.putStrongDetails(searchWord, displayText);
		}
		else if (typeof searchType !== "undefined") currentSearch = '|' + searchType + '=' + searchWord;
		var previousSearch = "";
		if (this.includePreviousSearches) {
			var searchAndOrNot = $("#searchAndOrNot option:selected").val();
			var existingSyntaxSearch = (currentSearch.substr(0, 8) === "|syntax=") ? currentSearch.substr(8) : "";
			if (existingSyntaxSearch.substr(0, 2) === "t=") existingSyntaxSearch = existingSyntaxSearch.substr(2);
			var previousSyntaxSearch = "";
			var numOfPreviousSyntaxSearch = 0;
			for (var i = 0; i < this.previousSearchTokens.length; i++) {
				if (this.previousSearchTokens[i] !== "") {
					var previousSearchRelationship = $("#searchAndOrNot" + i + " option:selected").val();
					if (typeof previousSearchRelationship !== "undefined")
						previousSearchRelationship = " " + previousSearchRelationship + " ";
					else
						previousSearchRelationship = " ";
					var curSearchWord = "";
					if (this.previousSearchTokens[i].substr(0, 5) === "text=") curSearchWord = this.previousSearchTokens[i].substr(5);
					else if (this.previousSearchTokens[i].substr(0, 7) === "strong=") {
						if (searchWord.search(/([GH])\d{4,5}/) > -1) {
							if (RegExp.$1 !== this.previousSearchTokens[i].substr(7, 1)) {
								var msg = "You are trying to search Greek and Hebrew words together. If you do not intend to perform this type of search, just don't search Hebrew and Greek words together in a single search.  This is only supported by the \"Classical Interface\" when you have opened a Bible with Old Testament tagged with Hebrew words and another Bible with Old Testament tagged with Greek words.  To open the \"Classical Interface\" ";
								msg += (window.innerWidth <= 767) ? "click on the three horizontal bars at the upper right, click on \"More\" and then click on \"Classical interface\"." :
																	"click on \"More\" in the upper right and then click on \"Classical interface\".";
								alert(msg);
							}
						}
						curSearchWord = "strong:" + this.previousSearchTokens[i].substr(7);
					}
					if (curSearchWord !== "") {
						numOfPreviousSyntaxSearch ++;
						if (numOfPreviousSyntaxSearch == 1) previousSyntaxSearch =  "|syntax=t=";
						else {
							if (numOfPreviousSyntaxSearch > 2)
								previousSyntaxSearch = previousSyntaxSearch.substr(0, 10) + "(" + previousSyntaxSearch.substr(10) + ")";
							previousSyntaxSearch += previousSearchRelationship;
						}
						previousSyntaxSearch += curSearchWord;
					}
					else previousSearch += '|' + this.previousSearchTokens[i];
				}
			}
			if (previousSyntaxSearch.length > 0) {
				if (existingSyntaxSearch.length > 0) {
					if (numOfPreviousSyntaxSearch >= 2) 
						previousSyntaxSearch = previousSyntaxSearch.substr(0, 10) + "(" + previousSyntaxSearch.substr(10) + ")";
					currentSearch = previousSyntaxSearch + " " + searchAndOrNot + " " + existingSyntaxSearch;
				}
				else currentSearch = previousSyntaxSearch + currentSearch;
			}
		}
		var url = allVersions + range + previousSearch + currentSearch;
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		step.util.closeModal('searchSelectionModal');
		if (selectedDisplayLoc === "new") step.util.createNewColumn();
		step.router.navigateSearch(url, true, true);
	},

	goToPassage: function(osisID, chptrOrVrsNum) {
		var modalMode = "";
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
	//  console.log("navigatePreserveVersions from passage_selection.html: " + osisID);
		step.router.navigatePreserveVersions("reference=" + osisID, false, true);
	},

	removePreviousSearch: function(index) {
		this.previousSearchTokens[index] = "";
		this.numOfPreviousSearchTokens --;
		showPreviousSearch();
		$('#lOPS_' + index).hide();
		if (this.numOfPreviousSearchTokens == 0) {
			$('#previousSearch').empty();
		}
	},

	handleAndOrNot: function() {
		this.andOrNotUpdated = true;
		$('#updateButton').show();
	},

	handlePreviousSearchAndOrNot: function() {
		var searchAndOrNot = $("#searchAndOrNot option:selected").val();
		if (searchAndOrNot === "AND") {
			$("#searchResultssubject").show();
			$("#searchResultsmeanings").show();
			$("#searchResultssubjectWarn").hide();
			$("#searchResultsmeaningsWarn").hide();
		}
		else {
			$("#searchResultssubject").hide();
			$("#searchResultsmeanings").hide();
			$("#searchResultssubjectWarn").show();
			$("#searchResultsmeaningsWarn").show();

		}
	}
};