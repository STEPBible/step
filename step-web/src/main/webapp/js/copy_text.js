window.step = window.step || {};
step.copyText = {
	initVerseSelect: function() {
		step.util.closeModal('searchSelectionModal');
		step.util.closeModal('passageSelectionModal');
		var extraVers = step.util.activePassage().get("extraVersions");
		var hasExtraVersions = extraVers !== "";
		this.selectionState = this._getSelectionState();
		this._displayVerses(hasExtraVersions); // does it have extra versions, more than one Bible version
		if (hasExtraVersions &&
			(step.util.getPassageContainer(step.util.activePassageId()).has(".interlinear").length == 0)) {
			var lastCopyRightsVersions = $.cookie("step.copyRightsVersions");
			var versionsToExclude = [];
			if (typeof lastCopyRightsVersions === "string") {
				var masterVersion = step.util.activePassage().get("masterVersion");
				var versionsString = masterVersion + "," + extraVers;
				var parts = lastCopyRightsVersions.split("@");
				if (parts[0] === versionsString) {
					if (parts.length == 2)
						versionsToExclude = parts[1].split(",");
				}
			}
			var versionsToPreselect = this.selectionState.hasSelection ? this.selectionState.versions : null;
			var allVersions = [step.util.activePassage().get("masterVersion")].concat(extraVers.split(","));
			if (versionsToPreselect) {
				var matchingSelectionVersions = [];
				for (var v = 0; v < versionsToPreselect.length; v++) {
					if (allVersions.indexOf(versionsToPreselect[v]) > -1)
						matchingSelectionVersions.push(versionsToPreselect[v]);
				}
				versionsToPreselect = matchingSelectionVersions.length > 0 ? matchingSelectionVersions : null;
			}
			var checkboxHTML = '';
			for (var i = 0; i < allVersions.length; i++) {
				var checkboxId = 'cpyver' + (i + 1);
				var shouldCheck = versionsToPreselect ? (versionsToPreselect.indexOf(allVersions[i]) > -1) : !versionsToExclude.includes(i.toString());
				checkboxHTML += '<input type="checkbox" ' + (shouldCheck ? 'checked ' : '') + 'id="' + checkboxId + '" name="' + checkboxId + '">' +
					'<label for="' + checkboxId + '">&nbsp;' +  allVersions[i] + '</label>&nbsp;';
			}
			$('#selectversionstocopy').html("<h4>Versions to copy:</h4>&nbsp;" + checkboxHTML);
		}
		else
			$('#selectversionstocopy').remove();
	},

	_getSelectionState: function() {
		var selInfo = step.lastPassageSelection;
		var result = {
			hasSelection: false,
			versions: [],
			startVerse: '',
			endVerse: '',
			startVerseDisplay: '',
			endVerseDisplay: '',
			startIndex: -1,
			endIndex: -1,
			label: ''
		};
		if (!selInfo) return result;
		var now = Date.now();
		var isRecent = (selInfo.deselectedAt === null && (now - selInfo.timestamp < 60000)) ||
			(selInfo.deselectedAt !== null && (now - selInfo.deselectedAt < 5000));
		if (!isRecent) return result;
		if ($.isArray(selInfo.versions) && selInfo.versions.length > 0)
			result.versions = selInfo.versions.slice(0);
		else if (selInfo.version)
			result.versions = [selInfo.version];
		result.startVerse = selInfo.startVerse || '';
		result.endVerse = selInfo.endVerse || selInfo.startVerse || '';
		result.startVerseDisplay = this._formatVerseDisplay(result.startVerse);
		result.endVerseDisplay = this._formatVerseDisplay(result.endVerse);
		result.hasSelection = (result.versions.length > 0 || result.startVerse !== '' || result.endVerse !== '');
		if (result.hasSelection) {
			result.label = result.startVerseDisplay || '';
			if (result.endVerseDisplay && result.endVerseDisplay !== result.startVerseDisplay)
				result.label += ' to ' + result.endVerseDisplay;
			if (result.label === '') result.label = 'your current selection';
		}
		return result;
	},

	_formatVerseDisplay: function(osis) {
		if (!osis) return '';
		return osis.replace(/^([123A-Za-z]+)\.(\d)/, '$1 $2').replace(/\.(\d+)/g, ': $1');
	},

	_normalizeVerseLabel: function(verseLabel) {
		return (verseLabel || '').replace(/\s+/g, '').toLowerCase();
	},

	_findVerseIndex: function(verses, verseDisplay) {
		var normalizedTarget = this._normalizeVerseLabel(verseDisplay);
		for (var i = 0; i < verses.length; i++) {
			if (this._normalizeVerseLabel(verses[i]) === normalizedTarget)
				return i;
		}
		return -1;
	},

	_displayVerses: function(hasExtraVersions) {
	    $('#bookchaptermodalbody').empty();
		var verses = step.copyText._getVerses(step.util.getPassageContainer(step.util.activePassageId()));
		if (this.selectionState && this.selectionState.hasSelection) {
			this.selectionState.startIndex = this._findVerseIndex(verses, this.selectionState.startVerseDisplay);
			this.selectionState.endIndex = this._findVerseIndex(verses, this.selectionState.endVerseDisplay);
			if (this.selectionState.startIndex === -1 && this.selectionState.endIndex > -1)
				this.selectionState.startIndex = this.selectionState.endIndex;
			if (this.selectionState.endIndex === -1 && this.selectionState.startIndex > -1)
				this.selectionState.endIndex = this.selectionState.startIndex;
		}
		$('#bookchaptermodalbody').append(this._buildChapterVerseTable(-1, hasExtraVersions));
	},

	goCopy: function(firstVerseIndex, lastVerseIndex) {
		var passageContainer = step.util.getPassageContainer(step.util.activePassageId());
		var copyOfPassage = $(passageContainer).find(".passageContentHolder").clone();
		if (firstVerseIndex > lastVerseIndex) {
			var temp = firstVerseIndex;
			firstVerseIndex = lastVerseIndex;
			lastVerseIndex = temp;
		}
		var verses = $(copyOfPassage).find('.versenumber');
		if (verses.length == 0) verses = $(copyOfPassage).find('.verselink');
		var versesRemoved = 0;
		if (lastVerseIndex < verses.length - 1) {
			for (var k = verses.length - 1; k > lastVerseIndex; k--) {
				var found = false;
				var count = 0; // The parent to delete should not be more than 6 level up.
				var parent = $(verses[k]).parent();
				while ((!found) && (count < 6)) {
					if ((parent.hasClass("verse")) || (parent.hasClass("row")) || (parent.hasClass("verseGrouping")) || (parent.hasClass("interlinear"))) {
						parent.remove();
						found = true;
						versesRemoved ++;
					}
					else parent = parent.parent();
					count ++;
				}
			}
		}
		if (firstVerseIndex > 0) {
			for (var k = firstVerseIndex - 1; k >= 0; k--) {
				var found = false;
				var count = 0;
				var parent = $(verses[k]).parent();
				while ((!found) && (count < 6)) {
					if ((parent.hasClass("verse")) || (parent.hasClass("row")) || (parent.hasClass("verseGrouping"))|| (parent.hasClass("interlinear"))) {
						parent.remove();
						found = true;
						versesRemoved ++;
					}
					else parent = parent.parent();
					count ++;
				}
			}
		}
		var endNotes = "";
		if ($("#selectnotes").prop("checked")) {
			var notes = $(copyOfPassage).find('.note');
			for (var l = 0; l < notes.length; l++) {
				var aTag = $(notes[l]).find("a");
				if (aTag.length > 1) {
					noteID = "n" + (l + 1); // The notes number will start with 1, not zero.
					refs = $(notes[l]).find(".inlineNote").text().replace(/▼/, "");
					$("<span>(" + noteID + ") </span>").insertAfter(notes[l]);
					endNotes += "\n(" + noteID + ") " + refs;
				}
			}
		}
		var endXrefs = "";
		if ($("#selectxref").prop("checked")) {
			var notes = $(copyOfPassage).find('.note');
			for (var l = 0; l < notes.length; l++) {
				var aTag = $(notes[l]).find("a");
				if (aTag.length == 1) {
					var noteID = $(aTag).text();
					var refs = "";
					var margins = $(".margin");
					if (margins.length > 0) {
						for (var m = 0; m < margins.length; m++) {
							if (noteID === $(margins[m]).find("strong").text()) {
								var linkRefs = $(margins[m]).find(".linkRef");
								for (var n = 0; n < linkRefs.length; n ++) {
									if (n > 0) refs += ", ";
									refs += $(linkRefs[n]).text();
								}
								continue;
							}
						}
					}
				}
				if (refs !== "") {
					$("<span>(" + noteID + ") </span>").insertAfter(notes[l]);
					endXrefs += "\n(" + noteID + ") " + refs;
				}
			}
		}

		$(copyOfPassage).find('.notesPane').remove()
		$(copyOfPassage).find('.note').remove();
		if ($(copyOfPassage).find('.verseGrouping').length == 0)
			$(copyOfPassage).find('.heading').remove();
		else {
			$(copyOfPassage).find('.heading').prepend("\n");
			var singleVerses = $(copyOfPassage).find('.singleVerse');
			for (var i = 0; i < singleVerses.length; i ++) {
				$(singleVerses[i]).html( $(singleVerses[i]).html().replace(/(>\(\w{2,8}\))\n/, "$1") );
			}
			$(singleVerses).prepend("\n");
		}
		$(copyOfPassage).find(".stepButton").remove();
		$(copyOfPassage).find("h3.canonicalHeading.acrostic").remove();
		$(copyOfPassage).find(".level2").text("\t");
		$(copyOfPassage).find(".level3").text("\t\t");
		$(copyOfPassage).find(".level4").text("\t\t\t");
		$(copyOfPassage).find(".level5").text("\t\t\t\t");
		$(copyOfPassage).find('.startLineGroup').replaceWith("\n");
		$(copyOfPassage).find("h2.xgen").prepend("\n");
		$(copyOfPassage).find("h3.psalmHeading").append("\n");
		if ($(copyOfPassage).find('.headingVerseNumber').length > 0)
			$(copyOfPassage).find('.headingVerseNumber').prepend("\n");
		var interlinearClasses = $(copyOfPassage).find('.interlinear');
		for (var j = 0; j < interlinearClasses.length; j++) {
			if ($($(interlinearClasses[j]).find(".interlinear")).length == 0) {
				var text = $(interlinearClasses[j]).text();
				if (text.indexOf("[") > -1) continue;
				text = text.replace(/\s/g, "").replace(/&nbsp;/g, "");
				if (text.length == 0) continue;
				$(interlinearClasses[j]).prepend(" [").append("] ");
			}
			else $(interlinearClasses[j]).prepend("<br>");
		}
		$(copyOfPassage).find(".verseNumber").prepend(" ").append(" ");
		$(copyOfPassage).find(".interVerseNumbers").prepend("<br>");
		$(copyOfPassage).find("p").replaceWith("\n");
		$(copyOfPassage).find("br").replaceWith("\n");
		$(copyOfPassage).find("div").prepend("\n");
		var elementsWithSmallCapsClases = $(copyOfPassage).find(".small-caps");
		for (var n = 0; n < elementsWithSmallCapsClases.length; n ++) {
			$(elementsWithSmallCapsClases[n]).text($(elementsWithSmallCapsClases[n]).text().toUpperCase());
		}
		var versionsString = step.util.activePassage().get("masterVersion");
		var extraVersions = step.util.activePassage().get("extraVersions");
		var options = step.util.activePassage().get("options");
		var versions = versionsString.split(",");
		var versionsToExclude = [];
		var numOfSelected = 0;
		if (extraVersions !== "") {
			versionsString += "," + extraVersions;
			versions = versionsString.split(",");
			for (var n = 0; n < versions.length; n++) {
				if ($('#cpyver' + (n + 1)).prop('checked'))
					numOfSelected ++;
				else {
					$(copyOfPassage).find('span[data-version="' + versions[n] + '"]').next().remove();
					$(copyOfPassage).find('span[data-version="' + versions[n] + '"]').remove();
					versionsToExclude.push(n);
				}
			}
			if ((numOfSelected == 0) && (interlinearClasses.length == 0)) { // error message only apply for non-interlinear mode
				$('#bookchaptermodalbody').empty();
				$('#bookchaptermodalbody').append("<h2>You must select at least one version to copy.");
				$('#copyModalFooter').empty();
				setTimeout( function() { step.util.closeModal("copyModal")}, 3000);
				return;
			}
			else if (numOfSelected == 1)
				$(copyOfPassage).find('span[data-version]').remove();
		}
		var comparingTable = $(copyOfPassage).find('.comparingTable');
		if (comparingTable.length > 0) {
			var rows = $(comparingTable).find("tr.row");
			if (rows.length > 0) {
				for (var k = 0; k < rows.length; k++) {
					var cells = $(rows[k]).find("td.cell");
					if (cells.length == versions.length) {
						for (var l = 0; l < cells.length; l++) {
							if (versionsToExclude.includes(l))
								$(cells[l]).empty();
							else if (numOfSelected > 1)
								$(cells[l]).prepend("\n(" + versions[l] + ") ");
						}
					}
				}
			}
			$(comparingTable).find("tr").not(".row").remove();
		}
		var versesInPanel = $(copyOfPassage).find(".versenumber");
		var verses = [];
		var previousVerseName = "";
		if (versesInPanel.length > 0) {
			for (var i = 0; i < versesInPanel.length; i ++) {
				var origVerseName = $(versesInPanel[i]).text();
				var verseName = step.copyText._shortenVerseName(previousVerseName, origVerseName);
				previousVerseName = origVerseName;
				if (verseName !== origVerseName)
					$(versesInPanel[i]).text(verseName);
			}
		}

		var textToCopy = "";
		for (var m = 0; m < copyOfPassage.length; m++) {
			textToCopy += $(copyOfPassage[m]).text().replace(/    /g, " ")
			.replace(/Read full chapter/, "")
			.replace(/   /g, " ").replace(/  /g, " ").replace(/\t /g, "\t")
			.replace(/\n\s+\n/g, "\n\n").replace(/\n\n\n/g, "\n\n").replace(/\n\n\t/g, "\n\t").replace(/^\n/g, "")
			.replace(/(\n) (\d)/g, "$1$2").replace(/\n $/, "\n").replace(/\n\n$/, "\n");
			if (textToCopy.search(/\n$/) == -1)
				textToCopy += "\n";
		}
		
		if ($(copyOfPassage).find('.verseGrouping').length > 0) {
			textToCopy = textToCopy.replace(/\n\n/g, "\n");
		}
		if (interlinearClasses.length > 0) {
			var updatedText = "";
			var textByLines = textToCopy.split(/\n/);
			for (var n = 0; n < textByLines.length; n ++) {
				var tmp = textByLines[n].replace(/\s+/g, " ");
				if ((tmp === "") || (tmp === " "))
					continue;
				updatedText += tmp + "\n";
			}
			textToCopy = updatedText;
		}
		if (options.indexOf("X") > -1) {
			var lines = textToCopy.split("\n");
			var lastLineIsHeaderOnly = false;
			var maxIndexWithText = lines.length;
			for (var i = maxIndexWithText - 1; i > -1; i--) {
				if (lines[i].trim().length == 0)
					maxIndexWithText = i;
				else
					break;
			}
			for (var i = 0; i < maxIndexWithText; i++) {
				var onlyHeader = false;
				if ((lines[i].substring(0,1) === "(") && (lines[i].slice(-1) === ")") && (lines[i].length < 30)) {
					var lineToCheck = lines[i].substring(1,lines[i].length -1);
					var parts1 = lineToCheck.split(": ");
					if (parts1.length == 2) {
						var parts2 = parts1[1].split(".");
						if ((parts2.length > 1) && (parts2.length < 4)) {
							if ((isNaN(parts2[0])) && (!isNaN(parts2[1]))) {
								if (parts2.length == 3) {
									if (!isNaN(parts2[2]))
										onlyHeader = true;
								}
								else
									onlyHeader = true;
							}
						}
					}
				}
				if (onlyHeader) {
					if (lastLineIsHeaderOnly)
						lines[i-1] = "";
					if (i == maxIndexWithText - 1)
						lines[i] = "";
				}
				lastLineIsHeaderOnly = onlyHeader;
			}
			textToCopy = "";
			for (var i = 0; i < maxIndexWithText; i++) {
				if (lines[i].trim().length > 0)
					textToCopy += lines[i] + "\n";
			}
		}
		if (endNotes !== "") textToCopy += "\nNotes:" + endNotes;
		if (endXrefs !== "") textToCopy += "\nCross references:" + endXrefs;

		
		var currentTimeInSeconds =  Math.floor( new Date().getTime() / 1000 );
		var timeStampForNewCookie = currentTimeInSeconds.toString();
		var lastCopyRightsTimeStamp = $.cookie("step.copyRightsTimeStamps");
		var lastCopyRightsVersions = $.cookie("step.copyRightsVersions");
		var versionStringToCompare = versionsString + '@' + versionsToExclude.join();
		if (!( (typeof lastCopyRightsTimeStamp === "string") && 
			   (typeof lastCopyRightsVersions === "string") &&
			   (lastCopyRightsVersions === versionStringToCompare) && 
			   ((currentTimeInSeconds - parseInt(lastCopyRightsTimeStamp)) < 3600) )) {
			for (var i = 0; i < versions.length; i++) {
				if ((versionsToExclude.length > 0) && (versionsToExclude.includes(i)))
					continue;
				currentVersion = versions[i];
				if (currentVersion === "") continue;
				$.ajaxSetup({async: false});
				$.getJSON("/html/copyrights/" + currentVersion + ".json", function(copyRights) {
					textToCopy += "\n" + currentVersion + ": " + copyRights;
				}).fail(function() {
					textToCopy += "\n" + currentVersion + ": Copyright notice at STEPBible.org/version.jsp?version=" + currentVersion;
				});
				$.ajaxSetup({async: true});
			}
			$.cookie("step.copyRightsTimeStamps", timeStampForNewCookie);
			$.cookie("step.copyRightsVersions", versionStringToCompare);
		}
		else if (extraVersions === "") textToCopy += "\n(" + versionsString + ")";
		var previousCopyTimeStamps = $.cookie("step.copyTimeStamps");
		if (versesRemoved > 1) {
			var gracePeriod = Math.floor(30 * (versesRemoved / verses.length));
			timeStampForNewCookie -= gracePeriod;
		}
		var copiesInLastMinute = 0;
		var longestDifference = 0;
		var previousTimes = [];
		if ((previousCopyTimeStamps != null) && (typeof previousCopyTimeStamps === "string")) {
			previousTimes = previousCopyTimeStamps.split(",");
			for (var j = 0; j < previousTimes.length; j ++) {
				if (previousTimes[j] === "") continue;
				var difference = currentTimeInSeconds - previousTimes[j];
				if (difference > 60) continue;
				if (longestDifference < difference) longestDifference = difference;
				timeStampForNewCookie += "," + previousTimes[j];
				copiesInLastMinute ++;
			}
		}
		var sleepTime = 1000;
		$.cookie("step.copyTimeStamps", timeStampForNewCookie);
		if (copiesInLastMinute > 4) {
			alert("You are copying at a rapid pace.\n\nThe copy function is intended for personal use within the copyrights limitation.  Please review the copyrights requirement for the Bibles (" +
				versionsString +
				") you are using.");
			sleepTime = Math.min((60 - longestDifference) * 1000, 5000);
			$("#copyModal").find('.close').hide();
		}
		else if (previousTimes.length > 0) sleepTime = 600;
		navigator.clipboard.writeText(textToCopy);
		$('#bookchaptermodalbody').empty();
		$('#bookchaptermodalbody').append("<h2>" + __s.text_is_copied);
		$('#copyModalFooter').empty();
		setTimeout( function() { step.util.closeModal("copyModal")}, sleepTime);
	},
	_shortenVerseName: function(previousVerseName, verseName) {
		var verseSplit = verseName.split(/:/);
		if ((verseSplit.length == 2) && (verseSplit[0] === previousVerseName.split(/:/)[0])) return verseSplit[1];
		else {
			verseSplit = verseName.split(/ /);
			if ((verseSplit.length == 2) && (verseSplit[0] === previousVerseName.split(/ /)[0])) return verseSplit[1];
		}
		return verseName;
	},
	_getVerses: function(passageContainer) {
		var versesInPanel = $(passageContainer).find(".versenumber");
		var verses = [];
		if (versesInPanel.length > 0) {
			for (var i = 0; i < versesInPanel.length; i ++) {
				verses.push($(versesInPanel[i]).text());
			}
		}
		else {
			versesInPanel = $(passageContainer).find(".verseLink");
			for (var i = 0; i < versesInPanel.length; i ++) {
				var tmp = $(versesInPanel[i]).attr("name");
				tmp = tmp.replace(/^([123A-Za-z]+)\.(\d)/, "$1 $2").replace(/\./g, ":");
				verses.push(tmp);
			}
		}
		return verses;
	},
	_buildChapterVerseTable: function(firstSelection, hasExtraVersions) {
		var passageContainer = step.util.getPassageContainer(step.util.activePassageId());
		var verses = step.copyText._getVerses(passageContainer);
		var hasXRefs = false;
		var hasNotes = false;
		if (!hasExtraVersions) { // The notes and xrefs from different versions should not be mixed.
			var notes = $(passageContainer).find('.note');
			for (var l = 0; ((l < notes.length) && (!hasXRefs || (!hasNotes))); l++) {
				var aTag = $(notes[l]).find("a");
				if ((aTag.length == 1) && (!hasXRefs)) {
					$("#includeXRefs").show();
					hasXRefs = true;
				}
				else if ((aTag.length > 1) && (!hasNotes)) {
					$("#includeNotes").show();
					hasNotes = true;
				}
			}
		}
		var headerMsg = (firstSelection == -1) ? __s.select_the_first_verse_to_copy + "<br><br><br>" : 
			__s.copy_will_start_from_verse + ": " + verses[firstSelection] + "<br>" + __s.select_last_verse_to_copy;
		var selectionShortcutHTML = '';
		if ((firstSelection == -1) && this.selectionState && this.selectionState.hasSelection &&
			this.selectionState.startIndex > -1 && this.selectionState.endIndex > -1) {
			var selectionLabel = this.selectionState.label;
			var firstVerse = Math.min(this.selectionState.startIndex, this.selectionState.endIndex);
			var lastVerse = Math.max(this.selectionState.startIndex, this.selectionState.endIndex);
			selectionShortcutHTML = '<div class="copySelectionShortcut" style="margin-top:8px">' +
				'<button type="button" class="stepButton" onclick="step.copyText.goCopy(' + firstVerse + ',' + lastVerse + ')">OR select verses ' + _.escape(selectionLabel) + ', your current selection</button>' +
				'</div>';
		}
		this.modalMode = 'verse';
		var tableColumns = 10;
		var widthPercent = 10;
		if (step.touchDevice) {
			var ua = navigator.userAgent.toLowerCase();
			if ( (ua.indexOf("android") > -1) ||
				 ((step.appleTouchDevice) && (ua.indexOf("safari/60") > -1)) ) {
				tableColumns = 7;
				widthPercent = 14;
			}
		}
		var html = '<div class="header">' +
            '<h4>' + headerMsg + '</h4>' + selectionShortcutHTML;
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
		var previousVerseName = "";
		for (var i = 0; i < verses.length; i++) {
			chptrOrVrsNum++;
			var originalVerseName = verses[i];
			var verseName = step.copyText._shortenVerseName(previousVerseName, verses[i]);
			previousVerseName = originalVerseName;
			
			if (firstSelection > -1) {
				if (i == firstSelection) verseName = "<b><i>" + verseName + "</i></b>";
				html += '<td><a href="javascript:step.copyText.goCopy(' + firstSelection + ',' + i + ');"' +
					'>' + verseName + 
					'</a></td>'
			}
			else html += '<td><a href="javascript:step.copyText._buildChapterVerseTable(' + i + ',' + hasExtraVersions + ');"' +
					'>' + verseName + 
					'</a></td>'
			if ((chptrOrVrsNum > (tableColumns - 1)) && ((chptrOrVrsNum % tableColumns) == 0)) {
				html += '</tr><tr>';
			}
		}
		html +=
			'</tr></table></div>' +
			'</div>';
		$('#bookchaptermodalbody').empty();
		$('#bookchaptermodalbody').append(html);
	}
};
