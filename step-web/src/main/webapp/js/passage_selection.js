step.passageSelect = {
	version: "ESV_th",
	userLang: "en",
	hasEnglishBible: false,
	addVerseSelection: false,
	modalMode: 'book',
	lastOsisID: '',
	lastNumOfChapters: '',
	arrayOfTyplicalBooksChapters: [],
	osisChapterJsword: [ // Array of OSIS id, number of chapters in the book and the JSword name (if it is different from OSIS id
		["Gen", 50, [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13]],
		["Exo", 40, [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38], "Exod"],
		["Lev", 27, [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34]],
		["Num", 36, [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13]],
		["Deu", 34, [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12], "Deut"],
		["Jos", 24, [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33], "Josh"],
		["Judg", 21, [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25]],
		["Rut", 4,  [22,23,18,22], "Ruth"],
		["1Sa", 31, [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13], "1Sam"],
		["2Sa", 24, [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25], "2Sam"],
		["1Ki", 22, [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53], "1Kgs"],
		["2Ki", 25, [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30], "2Kgs"],
		["1Ch", 29, [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30], "1Chr"],
		["2Ch", 36, [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23], "2Chr"],
		["Ezr", 10, [11,70,13,24,17,22,28,36,15,44], "Ezra"],
		["Neh", 13, [11,20,32,23,19,19,73,18,38,39,36,47,31]],
		["Est", 10, [22,23,15,17,14,14,10,17,32,3], "Esth"],
		["Job", 42, [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17]],
		["Psa", 150, [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6], "Ps"],
		["Pro", 31, [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31], "Prov"],
		["Ecc", 12, [18,26,22,16,20,12,29,17,18,20,10,14], "Eccl"],
		["Song", 8, [17,17,11,16,16,13,13,14]],
		["Isa", 66, [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24]],
		["Jer", 52, [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34]],
		["Lam", 5, [22,22,66,22,22]],
		["Eze", 48, [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35], "Ezek"],
		["Dan", 12, [21,49,30,37,31,28,28,27,27,21,45,13]],
		["Hos", 14, [11,23,5,19,15,11,16,14,17,15,12,14,16,9]],
		["Joe", 3, [20,32,21], "Joel"],
		["Amo", 9, [15,16,15,13,27,14,17,14,15], "Amos"],
		["Obd", 1, [21], "Obad"],
		["Jon", 4, [17,10,10,11], "Jonah"],
		["Mic", 7, [16,13,12,13,15,16,20]],
		["Nah", 3, [15,13,19]],
		["Hab", 3, [17,20,19]],
		["Zep", 3, [18,15,20], "Zeph"],
		["Hag", 2, [15,23]],
		["Zec", 14, [21,13,10,14,11,15,14,23,17,12,17,14,9,21], "Zech"],
		["Mal", 4, [14,17,18,6]],
		["Mat", 28, [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20], "Matt"],
		["Mar", 16, [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20], "Mark"],
		["Luk", 24, [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53], "Luke"],
		["Joh", 21, [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25], "John"],
		["Act", 28, [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31], "Acts"],
		["Rom", 16, [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27]],
		["1Cor", 16, [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24]],
		["2Cor", 13, [24,17,18,18,21,18,16,24,15,18,33,21,14]],
		["Gal", 6, [24,21,29,31,26,18]],
		["Eph", 6, [23,22,21,32,33,24]],
		["Phili", 4, [30,30,21,23], "Phil"],
		["Col", 4, [29,23,25,18]],
		["1Th", 5, [10,20,13,18,28], "1Thess"],
		["2Th", 3, [12,17,18], "2Thess"],
		["1Ti", 6, [20,15,16,16,25,21], "1Tim"],
		["2Ti", 4, [18,26,17,22], "2Tim"],
		["Tit", 3, [16,15,15], "Titus"],
		["Phile", 1, [25], "Phlm"],
		["Heb", 13, [14,18,19,16,14,20,28,13,28,39,40,29,25]],
		["Jam", 5, [27,26,18,17,20], "Jas"],
		["1Pe", 5, [25,25,22,19,14], "1Pet"],
		["2Pe", 3, [21,22,18], "2Pet"],
		["1Jo", 5, [10,29,24,21,21], "1John"],
		["2Jo", 1, [13], "2John"],
		["3Jo", 1, [15], "3John"],
		["Jude", 1, [25]],
		["Rev", 22, [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21]]
	],

	initPassageSelect: function(summaryMode) {
        this.version = "ESV_th";
		this.userLang = step.state.language() || "en-US";
		this.addVerseSelection = false;
		this.modalMode = 'book';
		this.lastOsisID = '';
		this.lastNumOfChapters = '';
		this.arrayOfTyplicalBooksChapters = JSON.parse(__s.list_of_bibles_books);
		step.util.closeModal('searchSelectionModal');
		var hideAppend = false;
		if (step.util.getPassageContainer(step.util.activePassageId()).find(".resultsLabel").text() !== "") {
			$('#append_to_panel').hide();
			hideAppend = true;
		}
		if ($('.passageContainer.active').width() < 500) $('#displayLocForm').hide();
		this._displayListOfBooks(summaryMode);
		$("textarea#enterYourPassage").on('input', function(e){
			step.passageSelect._handleKeyboardEntry(e);
		});
	},

	_handleKeyboardEntry: function(e) {
		var input = $('textarea#enterYourPassage').val();
		var returnKey = (input.slice(-1) === "\n") || (e.originalEvent.inputType === "insertLineBreak");
		input = input.replace(/[\n\r]/g, '').replace(/[\t]/g, ' ').replace(/\s\s+/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '')
		input = input.replace(/[–—]/g, '-'); // replace n-dash and m-dash with hyphen
		$("td").css("background-color", "var(--clrBackground)");
		var lastPassageEntered  = input.replace(/\s+$/g, '').split(/,|;/);
		lastPassageEntered  = lastPassageEntered[lastPassageEntered.length -1].replace(/^\s+/g, '').replace(/\s+$/g, '');
		var firstWord = lastPassageEntered.split(/\.|:|\s/)[0].toLowerCase();
		if (firstWord.length > 0) {
			if (firstWord == "jas") firstWord = "jam";
			else if (firstWord == "obd") firstWord = "obad";
			else if ((firstWord == "phi") || (firstWord == "phil")) firstWord = "ph(il|lm)"; // Can be either Philippians or Philemon
			else if (firstWord.length > 3) {
				for (var i = 0; i < this.arrayOfTyplicalBooksChapters.length; i ++) {
					var checkString = this.arrayOfTyplicalBooksChapters[i][0].toLowerCase();
					var first2Char = checkString.substr(0, 2);
					if ((first2Char === "1 ") || (first2Char === "2 ") || (first2Char === "3 "))
						checkString = checkString.substr(0,1) + checkString.substr(2);
					if (checkString.indexOf(firstWord) == 0) {
						firstWord = (this.osisChapterJsword[i].length === 4) ? this.osisChapterJsword[i][3] : this.osisChapterJsword[i][0];
						firstWord = firstWord.toLowerCase();
						break;
					}
				}
			}
			var regex1 = RegExp("^" + firstWord, "i")
			$("td").filter(function () { return regex1.test($(this).text());}).css("background-color", "fafad2");
		}
		if (returnKey) this._handleEnteredPassage(false, input); // 13 is return
		else if ((e.originalEvent.inputType === "insertText") && (e.originalEvent.data === ",")) this._handleEnteredPassage(true, input); // user entered a comma
		else if ( (e.originalEvent.inputType === "deleteContentBackward") ||
			((e.originalEvent.inputType === "insertText") && (e.originalEvent.data === ".")) ) $('#userEnterPassageError').text(""); // 8 is backspace, 46 is .
	},

	_displayListOfBooks: function(summaryMode) {
        $('#bookchaptermodalbody').empty();
		translationType = this._getTranslationType();
		var html = this._buildBookHeaderAndSkeleton(summaryMode);
		$('#bookchaptermodalbody').append(html);
		$('#keyboardEntry').show();
		this._buildBookTable(summaryMode, translationType);
		$('#pssgModalBackButton').hide();
	},

	_buildBookTable: function(summaryMode, translationType) {
		$('#enterYourPassage').show();
		$('#keyboard_icon').show();
		if (((this.userLang.toLowerCase().indexOf("en") == 0) || (this.userLang.toLowerCase().indexOf("es") == 0) || (this.userLang.toLowerCase().indexOf("zh") == 0)) &&
			(translationType !== "")) {
			this._buildBookHTMLTable(translationType, summaryMode);
		}
		else {
			var url = SEARCH_AUTO_SUGGESTIONS + "%20%20/" + EXAMPLE_DATA + "%3D" + REFERENCE + "%7C" + LIMIT + "%3D" + REFERENCE + "%7C" + VERSION + "%3D" + this.version + "%7C?lang=" + this.userLang;
			$.getJSON(url, function (data) {
				step.passageSelect._buildBookHTMLTable(data, summaryMode);
			}).fail(function() {
                changeBaseURL();
            });
		}	
	},

	_getTranslationType: function() {
		var versionAltName = '';
		var atLeastOneEnglishBible = false;
		var data = step.util.activePassage().get("searchTokens") || [];
		var foundFirstVersion = false;
		for (var i = 0; i < data.length; i++) {
			if (data[i].itemType == VERSION) {
				if (!foundFirstVersion) {
					this.version = data[i].item.initials;
					versionAltName = data[i].item.shortInitials;
					foundFirstVersion = true;
				}
				if (!atLeastOneEnglishBible)
					atLeastOneEnglishBible = ((typeof step.keyedVersions[data[i].item.initials] === "object") &&
									  (step.keyedVersions[data[i].item.initials].languageCode === "en"));
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
		this.hasEnglishBible = atLeastOneEnglishBible;
		return translationType;
	},

	_buildBookHTMLTable: function(data, summaryMode) {
		var ot = "Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal";
		var nt = "Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph ﻿Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev";
		var counter = 0;
		var notSeenNT = true;
		var browserWidth = $(window).width();
		var columns = 7;
		var maxLength = 5;
		var bookDescription = {};
        if (!summaryMode) {
            if (browserWidth < 1100) {
                columns = 6;
                maxLength = 4;
                if (browserWidth < 735) {
                    columns = 5;
                    maxLength = 3;
                    if ((browserWidth < 370) && (this.userLang.toLowerCase().indexOf("zh") == 0))
                        maxLength = 2;
                }
            }
		}
        else {
            columns = 1;
			bookDescription = {gen:"", exod:"", lev:"", num:"", deut:"", josh:"", judg:"", ruth:"", "1sam":"", "2sam":"", "1kgs":"", "2kgs":"", "1chr":"", "2chr":"", ezra:"", neh:"", esth:"", job:"", ps:"", prov:"", eccl:"", song:"", isa:"", jer:"", lam:"", ezek:"", dan:"", hos:"", joel:"", amos:"", obad:"", jonah:"", mic:"", nah:"", hab:"", zeph:"", hag:"", zech:"", mal:"", matt:"", mark:"", luke:"", john:"", acts:"", rom:"", "1cor":"", "2cor":"", gal:"", eph:"", phil:"", col:"", "1thess":"", "2thess":"", "1tim":"", "2tim":"", titus:"", phlm:"", heb:"", jas:"", "1pet":"", "2pet":"", "1john":"", "2john":"", "3jo":"", jude:"", rev:""};
            $.ajaxSetup({async: false});
            $.getJSON("/html/json/book_description.json", function(desc) {
                for (key in desc) {
                    bookDescription[key] = desc[key];
                }
            });
            $.ajaxSetup({async: true});
        }
		var tableHTML = this._buildBookTableHeader(columns, summaryMode);
		var typlicalBooksChapters = false;
		var start = 0;
		var end = 0;
		if (typeof data === "string") {
			if (data == "OTNT") end = 66;
			else if (data == "OT") end = 39;
			else if (data == "NT") {
				start = 39;
				end = 66;
			}
			typlicalBooksChapters = true;
		}
		else {
			end = data.length;
		}
		var additionalBooks = false;
		var chineseSuffix1ForBooks = "書記歌錄书记歌录"; // suffix for book, record, song, ...
		var chineseSuffix2ForBooks = "福音"; // suffix for gospel (e.g.: John gospel)
		for (var i = start; i < end; i++) {
			var currentOsisID;
			var shortNameToDisplay;
			var longNameToDisplay;
			var numOfChapters;
			var jSwordName;
			if (typlicalBooksChapters) {
				currentOsisID = (this.osisChapterJsword[i].length === 4) ? this.osisChapterJsword[i][3] : this.osisChapterJsword[i][0];
				numOfChapters = this.osisChapterJsword[i][1];
				longNameToDisplay = this.arrayOfTyplicalBooksChapters[i][0];
				shortNameToDisplay = (this.arrayOfTyplicalBooksChapters[i].length === 2) ? this.arrayOfTyplicalBooksChapters[i][1] : currentOsisID;
			}
			else {
				currentOsisID = data[i].suggestion.osisID;
				numOfChapters = 0; // don't know yet, need to find out
				longNameToDisplay = data[i].suggestion.fullName;
				shortNameToDisplay = (this.userLang.toLowerCase().indexOf("en") == 0) ? currentOsisID : data[i].suggestion.shortName.replace(/ /g, "").substr(0, 6);
			}
			var oldTestment = false;
			var newTestament = (nt.indexOf(currentOsisID) > -1);
			if (!newTestament) oldTestament = (ot.indexOf(currentOsisID) > -1);
			if ((newTestament) && (notSeenNT)) {
				notSeenNT = false;
				counter = 0; // reset counter for NT table
				tableHTML += '</tr></table>';
				$('#ot_table').append(tableHTML);
				tableHTML = this._buildBookTableHeader(columns, summaryMode);
			}
			var bookDisplayName = longNameToDisplay;
			if (this.userLang.toLowerCase().indexOf("zh") == 0) {
				if (((bookDisplayName.length == maxLength) || (bookDisplayName.length == maxLength + 1)) &&
					(chineseSuffix1ForBooks.indexOf(bookDisplayName.substr(-1)) > -1)) // If it is one character too long. Remove the last word 書記歌书记歌 (book, record or song)
					bookDisplayName = bookDisplayName.substr(0, bookDisplayName.length - 1);
				else if ( 	(	(bookDisplayName.length == maxLength + 1) || // If it is one or two characters too long. Remove the last two words 福音 (gospel)
								(bookDisplayName.length == maxLength + 2)) &&
							(chineseSuffix2ForBooks.indexOf(bookDisplayName.substr(-2)) > -1)) 
					bookDisplayName = bookDisplayName.substr(0, bookDisplayName.length - 2);
			}
			if ((bookDisplayName.length > 0) && (bookDisplayName.length <= maxLength))
				shortNameToDisplay = bookDisplayName;
			if (!newTestament && !oldTestament) {
				shortNameToDisplay += '<span style="color:brown">*</span>';
				additionalBooks = true;
			}
            if ((summaryMode) &&
                (typeof bookDescription[currentOsisID.toLowerCase() + "_header"] === "string")) {
                tableHTML += '<td style="font-size:18px;text-align:left;padding:0"><b>' +
                    bookDescription[currentOsisID.toLowerCase() + "_header"] +
                '</b></td></tr><tr>';
            }
			var curBookDescription = ""
			if (summaryMode) {
				if (!newTestament && !oldTestament) curBookDescription = '<span style="color:brown">*</span>';
				if (typeof bookDescription[currentOsisID.toLowerCase()] === "string")
					curBookDescription += " - " + bookDescription[currentOsisID.toLowerCase()];
			}
			tableHTML += '<td title="' + longNameToDisplay + '">' +
				'<a href="javascript:step.passageSelect.getChapters(\'' + currentOsisID + '\', \'' + this.version + '\', \'' + this.userLang + '\', ' + numOfChapters + ');"' +
                ((summaryMode) ? ' style="text-align:left;padding:0" ' : "") + '>' +
                ((summaryMode) ? longNameToDisplay + curBookDescription : shortNameToDisplay) +
                '</a></td>';
			counter++;
			if ((counter % columns) == 0) {
				tableHTML += '</tr><tr>';
			}
		}
		tableHTML += '</tr></table>';
		if (additionalBooks) tableHTML += '<p style="color:brown">* Deuterocanonical or other books</p>';
		if (notSeenNT) $('#ot_table').append(tableHTML);
		else $('#nt_table').append(tableHTML);
	},

	_buildBookHeaderAndSkeleton: function(summaryMode) {
		var html = '<div class="header" style="overflow-y:auto">' +
			'<h4>' + __s.please_select_book + '</h4>';
		if ((this.userLang.toLowerCase().indexOf("en") == 0) || (this.hasEnglishBible))
			html +=
				'<button style="font-size:10px;line-height:10px;" type="button" onclick="step.passageSelect.initPassageSelect(' +
				((summaryMode) ? 'false' : 'true') +
				')" title="Show summary information" class="select-version stepButton' +
				((summaryMode) ? ' stepPressedButton">Summary -' : '">Summary +') +
				'</button>';
		html +=
			'</div>' +
			'<span class="stepFgBg" style="font-size:18px"><b>' + __s.old_testament + '</b></span>' +
			'<div id="ot_table"/>' +
			'<span class="stepFgBg" style="font-size:18px"><b>' + __s.new_testament + '</b></span>' +
			'<div id="nt_table"/>' +
			'</div>';
		return html;
	},

	_buildBookTableHeader: function(columns, summaryMode) {
		var columnPercent = Math.floor(100 / columns);
		html = '<table>' +
			'<colgroup>';
		for (var i = 0; i < columns; i++) {
			html += '<col span="1" style="width:' + columnPercent + '%;">';
		}
		html += '</colgroup>';
		html += '<tr>';
		return html;
	},

	goToPassage: function(osisID, chptrOrVrsNum) {
		var bookID = osisID.substring(0, osisID.indexOf("."));
		if (bookID === "") bookID = osisID;
		if ((chptrOrVrsNum != 0) && (this.addVerseSelection) && (this.modalMode === "chapter")) {
			var numOfVerse = 0;
			for (var i = 0; i < this.osisChapterJsword.length; i++) {
				var currentOsisID = (this.osisChapterJsword[i].length === 4) ? this.osisChapterJsword[i][3] : this.osisChapterJsword[i][0];
				if (bookID === currentOsisID) {
					numOfVerse = this.osisChapterJsword[i][2][Math.abs(chptrOrVrsNum)-1] || 0; // -1 is used for books with 1 chapter (e.g.: Jude)
					break;
				}
			}
			if (numOfVerse > 0) {
				this._buildChptrVrsTbl(null, osisID, numOfVerse, false);
				return;
			}
			else alert('Cannot determine the number of verse in ' + osisID + '.  Will proceed to display the chapter.');
		}
		var activePassageData = step.util.activePassage().get("searchTokens") || [];
		var allVersions = "";
		var existingReferences = "";
		var selectedDisplayLoc = $( "#displayLocation option:selected" ).val();
		for (var i = 0; i < activePassageData.length; i++) {
			if (activePassageData[i].itemType == "version") {
				if (allVersions.length > 0) allVersions += "|version=";
				allVersions += activePassageData[i].item.shortInitials;
			}
			else if ((selectedDisplayLoc === "append") && (activePassageData[i].itemType == "reference")) {
				existingReferences += "|reference=" + activePassageData[i].item.osisID;
			}
		}
		step.util.closeModal('passageSelectionModal');
		if (selectedDisplayLoc === "append") {
			var url = VERSION + '=' + allVersions + existingReferences + '%7C' + REFERENCE + '=' + osisID;
			step.router.navigateSearch(url, true, true); // skip QFilter
		}
		else {
			if (selectedDisplayLoc === "new") {
				step.util.createNewColumn();
			}
			if (this.modalMode === "verse") {
				ap=step.util.activePassage();
				var numOfChaptersInBook = this.getNumOfChapters(bookID);
				if (numOfChaptersInBook === 1) {
					var tmpOsisID = osisID.substring(0, osisID.indexOf(".")) + '.1.' + osisID.substring(osisID.indexOf(".") + 1);
					ap.save({targetLocation: tmpOsisID}, {silent: true});
				}
				else ap.save({targetLocation: osisID}, {silent: true});
				osisID = osisID.substring(0, osisID.lastIndexOf('.'));
			}
	//        console.log("navigatePreserveVersions from passage_selection.html: " + osisID);
			step.router.navigatePreserveVersions("reference=" + osisID, false, true);
		}
	},

	getNumOfChapters: function(bookID) {
		for (var i = 0; i < this.osisChapterJsword.length; i++) {
			var currentOsisID = (this.osisChapterJsword[i].length === 4) ? this.osisChapterJsword[i][3] : this.osisChapterJsword[i][0];
			if (bookID === currentOsisID) {
				return this.osisChapterJsword[i][1];
			}
		}
	},

	getChapters: function(bookOsisID, version, userLang, numOfChptrsOrVrs, summaryMode) {
		$('#pssgModalBackButton').show();
		if (numOfChptrsOrVrs > 0) {
			this._buildChptrVrsTbl(null, bookOsisID, numOfChptrsOrVrs, true, version, userLang, summaryMode);
		}
		else {
            var url = SEARCH_AUTO_SUGGESTIONS + bookOsisID + "/limit%3D" + REFERENCE + "%7C" + VERSION + "%3D" + version + "%7C" + REFERENCE + "%3D" + bookOsisID + "%7C?lang=" + userLang;
			$.getJSON(url, function (data) {
				step.passageSelect._buildChptrVrsTbl(data, bookOsisID, numOfChptrsOrVrs, true, version, userLang, summaryMode);
			}).fail(function() {
                changeBaseURL();
            });
		}
	},
	_handleEnteredPassage: function(verifyOnly, input) {
		if (input !== null) userInput = input;
		else {
			userInput = $('textarea#enterYourPassage').val();
			userInput = userInput.replace(/[\n\r]/g, '').replace(/[\t]/g, ' ').replace(/\s\s+/g, ' ').replace(/,,/g, ',').replace(/^\s+/g, '')
			userInput = userInput.replace(/[–—]/g, '-'); // replace n-dash and m-dash with hyphen
		}
		var url = SEARCH_AUTO_SUGGESTIONS + userInput + "/limit%3D" + REFERENCE + "%7C" + VERSION + "%3D" + this.version + "%7C?lang=" + this.userLang;
		$.getJSON(url, function (data) {
			if (data.length > 0) {
				if (data[0].suggestion.passage) {
					console.log(data);
					$('#userEnterPassageError').text("Program error: unexpend result from SEARCH_AUTO_SUGGESTIONS");
				}
				else if (!verifyOnly) step.passageSelect.goToPassage(data[0].suggestion.osisID, 0); // 0 is ready to go to passage
			}
			else {
				var errorText = (userInput != "") ? ' for "' + userInput + '"' : "";
				$('#userEnterPassageError').text("No match" + errorText + ", please update the passage you entered.");
				$('textarea#enterYourPassage').focus();
				if (!verifyOnly) $('textarea#enterYourPassage').val(userInput);
			}
		}).fail(function() {
            changeBaseURL();
        });
	},

	_buildChptrVrsTbl: function(data, bookOsisID, numOfChptrsOrVrs, isChapter, version, userLang, summaryMode) {
		var headerMsg;
		$('#enterYourPassage').hide();
		$('#keyboard_icon').hide();
		if (isChapter) {
			headerMsg = __s.please_select_chapter;
			this.modalMode = 'chapter';
		}
		else {
			headerMsg = __s.please_select_verse;
			this.modalMode = 'verse';
		}
		var tableColumns = 10;
		var widthPercent = 10;
		if (step.touchDevice) {
			var ua = navigator.userAgent.toLowerCase();
			if ( (ua.indexOf("android") > -1) ||
				 (((ua.indexOf("ipad") > -1) || (ua.indexOf("iphone") > -1)) &&
					(ua.indexOf("safari/60") > -1)) ) {
				tableColumns = 7;
				widthPercent = 14;
			}
		}
        var chapterDescription = [];
        var chapterHeader = [];
        if (summaryMode) {
            tableColumns = 1;
            for (var i = 0; i <= numOfChptrsOrVrs; i++) {
                chapterDescription.push("");
            }
            $.ajaxSetup({async: false});
            $.getJSON("/html/json/" + bookOsisID.toLowerCase() + ".json", function(desc) {
                for (key in desc) {
                    if (key.indexOf("chapter_") == 0) {
                        var pos = key.indexOf("_description");
                        if (pos > -1) {
                            var chapter = key.substr(8, pos - 8);
                            if ((desc[key] === "*") || (desc[key] === "**"))
                                chapterDescription[chapter] = desc["chapter_" + chapter + "_overview"];
                            else chapterDescription[chapter] = desc[key];
                        }
                        else if (key.indexOf("_header") > 8)
                            chapterDescription[key] = desc[key];
                    }
                }
            });
            $.ajaxSetup({async: true});
        }
        
		var html = '<div class="header">' +
            '<h4>' + headerMsg + '</h4>';
        if ((isChapter) && 
			 ((userLang.toLowerCase().indexOf("en") == 0) || (this.hasEnglishBible)) &&
			 (PassageDisplayView.prototype.bookIsOTorNT(bookOsisID)) )
			html +=
				'<button style="font-size:10px;line-height:10px;" type="button" onclick="step.passageSelect.getChapters(\'' +
					bookOsisID + '\',\'' + version + '\',\'' + userLang + '\',' + numOfChptrsOrVrs + ',' +
					((summaryMode) ? 'false' : 'true') +
					')" title="Show summary information" class="select-version stepButton' +
					((summaryMode) ? ' stepPressedButton">Summary -' : '">Summary +') +
					'</button>';
        html +=
            '</div>' +
			'<div style="overflow-y:auto">' +
			'<table>' +
			'<colgroup>';
		for (var c = 0; c < tableColumns; c++) {
			html += '<col span="1" style="width:' + widthPercent + '%">';
		}
		html += '</colgroup>' +
			'<tr>';

		var chptrOrVrsNum = 0;
		var osisIDLink = "";
		if (numOfChptrsOrVrs > 0) {
			if (isChapter) {
				this.lastNumOfChapters = numOfChptrsOrVrs;
				this.lastOsisID = bookOsisID;
			}
			for (var i = 0; i < numOfChptrsOrVrs; i++) {
				chptrOrVrsNum++;
				osisIDLink = (numOfChptrsOrVrs === 1) ? bookOsisID : bookOsisID + '.' + chptrOrVrsNum;
                if ((summaryMode) &&
                    (typeof chapterDescription["chapter_" + chptrOrVrsNum + "_header"] === "string")) {
                    html += '<td style="font-size:18px;text-align:left;padding:0"><b>' +
                        chapterDescription["chapter_" + chptrOrVrsNum + "_header"] +
                    '</b></td></tr><tr>';
                }
				var curChptrDesc = "";
				if (typeof chapterDescription[chptrOrVrsNum] === "string")
					curChptrDesc = " - " + chapterDescription[chptrOrVrsNum];
				html += '<td><a href="javascript:step.passageSelect.goToPassage(\'' + osisIDLink + '\', \'' + chptrOrVrsNum + '\');"' +
                    ((summaryMode) ? ' style="text-align:left;padding:0px 0px 0px 22px;text-indent: -22px;" ' : "") +
                    '>' + chptrOrVrsNum + 
                    ((summaryMode) ? curChptrDesc : "") +
                    '</a></td>'
				if ((chptrOrVrsNum > (tableColumns - 1)) && ((chptrOrVrsNum % tableColumns) == 0)) {
					html += '</tr><tr>';
				}
			}
		}
		else {
			for (var i = 0; i < data.length; i++) {
				if (data[i].suggestion.sectionType == "PASSAGE") {
					chptrOrVrsNum++;
					osisIDLink = data[i].suggestion.osisID;
					var curChptrDesc = "";
					if (typeof chapterDescription[chptrOrVrsNum] === "string")
						curChptrDesc = " - " + chapterDescription[chptrOrVrsNum];
					html += '<td><a href="javascript:step.passageSelect.goToPassage(\'' + osisIDLink + '\', \'' + chptrOrVrsNum + '\');"' +
                        ((summaryMode) ? ' style="text-align:left;padding:0" ' : "") +
                        '>' + chptrOrVrsNum +
                        ((summaryMode) ? curChptrDesc : "") +
                        '</a></td>'
					if ((chptrOrVrsNum > (tableColumns - 1)) && ((chptrOrVrsNum % tableColumns) == 0)) {
						html += '</tr><tr>';
					}
				}
			}
			if (isChapter) {
				this.lastOsisID = osisIDLink.substring(0, osisIDLink.indexOf('.'));
				this.lastNumOfChapters = chptrOrVrsNum;
			}
		}
		if (chptrOrVrsNum === 1) {
			this.goToPassage(osisIDLink, -1); // If there is only one chapter, just go to it.
			return;
		}
		html +=
			'</tr></table></div>' +
			'</div>';
		$('#bookchaptermodalbody').empty();
		$('#bookchaptermodalbody').append(html);
	},

	goBackToPreviousPage: function() {
		if (this.modalMode === 'verse') {
			this._buildChptrVrsTbl(null, this.lastOsisID, this.lastNumOfChapters, true);
			this.modalMode = "chapter";
		}
		else {
			$('#bookchaptermodalbody').empty();
			this.modalMode = "book";
			this._displayListOfBooks();
		}
	}
};