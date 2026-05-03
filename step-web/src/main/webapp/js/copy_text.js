window.step = window.step || {};
step.copyText = {
	// UI sink — the copy dropdown (view_menu_copy.js) installs a sink for the
	// duration of a copy so goCopy's status-producing calls route into the
	// dropdown. If nothing is installed, sink calls are no-ops — goCopy still
	// writes to the clipboard, but success/error reporting is silently dropped.
	_sink: function () {
		return this._uiSink || {
			showSuccess: function () {},
			showRapidWarning: function () {},
			showNoVersionsSelected: function () {},
			showCopyError: function () {},
			showClipboardDenied: function () {}
		};
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
			if (result.endVerseDisplay && result.endVerseDisplay !== result.startVerseDisplay) {
				var sep = ' ' + (__s.selection_range_separator || 'to') + ' ';
				result.label += sep + result.endVerseDisplay;
			}
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
		// Verse grid may contain short labels like "1" while verseDisplay
		// is fully qualified like "Gen 1: 1" — try matching just the verse number
		var verseNumMatch = verseDisplay.match(/:?\s*(\d+)\s*$/);
		if (verseNumMatch) {
			var verseNum = verseNumMatch[1];
			for (var i = 0; i < verses.length; i++) {
				if (verses[i].trim() === verseNum)
					return i;
			}
		}
		return -1;
	},

	_getOsisIdsForRange: function(passageContainer, firstVerseIndex, lastVerseIndex) {
		// Use versenumber/verselink elements (same as goCopy's clone trimming) to find
		// the verse containers, then extract OSIS from the nearest verseLink
		var verses = $(passageContainer).find('.versenumber');
		if (verses.length == 0) verses = $(passageContainer).find('.verselink');
		var firstOsis = '';
		var lastOsis = '';
		if (verses.length > firstVerseIndex) {
			var container = $(verses[firstVerseIndex]).closest('.verseGrouping, .verse, .interlinear');
			var link = container.find('.verseLink').first();
			firstOsis = (link.attr('name') || '').split(' ')[0];
		}
		if (verses.length > lastVerseIndex) {
			var container = $(verses[lastVerseIndex]).closest('.verseGrouping, .verse, .interlinear');
			var link = container.find('.verseLink').first();
			lastOsis = (link.attr('name') || '').split(' ')[0];
		}
		return { first: firstOsis, last: lastOsis };
	},

	_extractNotesFromClone: function(copyOfPassage, wantNotes, wantXrefs) {
		var endNotes = "";
		var endXrefs = "";
		var notes = $(copyOfPassage).find('.note');
		var noteCounter = 0;
		for (var l = 0; l < notes.length; l++) {
			var aTag = $(notes[l]).find("a");
			if (wantNotes && aTag.length > 1) {
				noteCounter++;
				var noteID = "n" + noteCounter;
				var refs = $(notes[l]).find(".inlineNote").text().replace(/▼/, "");
				$("<span>(" + noteID + ") </span>").insertAfter(notes[l]);
				if (refs) endNotes += "\n(" + noteID + ") " + refs;
			}
			if (wantXrefs && aTag.length == 1) {
				var noteID = $(aTag).text();
				var refs = "";
				var margins = $(copyOfPassage).find('.margin');
				for (var m = 0; m < margins.length; m++) {
					if (noteID === $(margins[m]).find("strong").text()) {
						var linkRefs = $(margins[m]).find(".linkRef");
						for (var n = 0; n < linkRefs.length; n++) {
							if (n > 0) refs += ", ";
							refs += $(linkRefs[n]).text();
						}
						break;
					}
				}
				if (refs !== "") {
					$("<span>(" + noteID + ") </span>").insertAfter(notes[l]);
					endXrefs += "\n(" + noteID + ") " + refs;
				}
			}
		}
		return { endNotes: endNotes, endXrefs: endXrefs };
	},

	_extractNotesFromHTML: function(html, firstOsis, lastOsis) {
		var $html = $(html);
		var endNotes = "";
		var endXrefs = "";

		// Build set of OSIS IDs within the copied range
		var verseLinks = $html.find('.verseLink');
		var inRange = false;
		var osisIdsInRange = {};
		for (var i = 0; i < verseLinks.length; i++) {
			var name = ($(verseLinks[i]).attr('name') || '').split(' ')[0];
			if (name === firstOsis) inRange = true;
			if (inRange) osisIdsInRange[name] = true;
			if (name === lastOsis) break;
		}

		var notes = $html.find('.note');
		var noteCounter = 0;
		var xrefCounter = 0;
		for (var l = 0; l < notes.length; l++) {
			var noteEl = $(notes[l]);
			// Walk up to find the verse container, then its verseLink
			var verseContainer = noteEl.closest('.verse, .verseGrouping, .interlinear, .commentaryVerse');
			var verseLink = verseContainer.find('.verseLink').first();
			var osisId = (verseLink.attr('name') || '').split(' ')[0];

			// Skip notes outside the copied range
			if (osisId && !osisIdsInRange[osisId]) continue;

			var aTag = noteEl.find("a");
			if (aTag.length > 1) {
				// Footnote
				noteCounter++;
				var noteID = "n" + noteCounter;
				var refs = noteEl.find(".inlineNote").text().replace(/▼/, "");
				if (refs) endNotes += "\n(" + noteID + ") " + refs;
			} else if (aTag.length == 1) {
				// Cross-reference — use sequential letter matching _injectMarkersIntoClone
				var nativeID = $(aTag).text();
				var seqID = step.copyText._xrefLetter(xrefCounter);
				xrefCounter++;
				var refs = "";
				var margins = $html.find('.margin');
				for (var m = 0; m < margins.length; m++) {
					if (nativeID === $(margins[m]).find("strong").text()) {
						var linkRefs = $(margins[m]).find(".linkRef");
						for (var n = 0; n < linkRefs.length; n++) {
							if (n > 0) refs += ", ";
							refs += $(linkRefs[n]).text();
						}
						break;
					}
				}
				if (refs !== "") endXrefs += "\n(" + seqID + ") " + refs;
			}
		}
		return { endNotes: endNotes, endXrefs: endXrefs };
	},

	_xrefLetter: function(n) {
		// 0->a, 1->b, ..., 25->z, 26->aa, etc.
		var s = "";
		do {
			s = String.fromCharCode(97 + (n % 26)) + s;
			n = Math.floor(n / 26) - 1;
		} while (n >= 0);
		return s;
	},

	_injectMarkersIntoClone: function(copyOfPassage, checkedVersions, wantNotes, wantXrefs) {
		var noteCounterByVersion = {};
		var xrefCounterByVersion = {};
		var labelVersions = checkedVersions.length > 1;
		var notes = $(copyOfPassage).find('.note');
		for (var l = 0; l < notes.length; l++) {
			var noteEl = $(notes[l]);
			// In multi-version DOM, structure is: span.singleVerse > span[data-version] + div.verse
			// Notes are inside div.verse, so find the parent singleVerse and its data-version child
			var singleVerse = noteEl.closest('.singleVerse');
			var versionSpan = singleVerse.find('span[data-version]').first();
			var version = versionSpan.attr('data-version');
			if (!version || checkedVersions.indexOf(version) === -1) continue;
			var vInfo = step.keyedVersions[version];
			if (!vInfo || !vInfo.hasNotes || vInfo.category === "COMMENTARY") continue;
			var aTag = noteEl.find("a");
			if (wantNotes && aTag.length > 1) {
				if (!noteCounterByVersion[version]) noteCounterByVersion[version] = 0;
				noteCounterByVersion[version]++;
				var noteID = "n" + noteCounterByVersion[version];
				var marker = labelVersions ? "(" + noteID + "-" + version + ") " : "(" + noteID + ") ";
				$("<span>" + marker + "</span>").insertAfter(noteEl);
			}
			if (wantXrefs && aTag.length == 1) {
				if (!xrefCounterByVersion[version]) xrefCounterByVersion[version] = 0;
				var noteID = step.copyText._xrefLetter(xrefCounterByVersion[version]);
				xrefCounterByVersion[version]++;
				var marker = labelVersions ? "(" + noteID + "-" + version + ") " : "(" + noteID + ") ";
				$("<span>" + marker + "</span>").insertAfter(noteEl);
			}
		}
	},

	_fetchNotesForVersions: function(versions, reference, firstOsis, lastOsis, wantNotes, wantXrefs) {
		var result = { notesByVersion: {}, errors: [] };
		for (var i = 0; i < versions.length; i++) {
			var version = versions[i];
			var vInfo = step.keyedVersions[version];
			if (!vInfo || !vInfo.hasNotes || vInfo.category === "COMMENTARY") continue;
			var fetchedHTML = null;
			try {
				$.ajaxSetup({async: false});
				$.getJSON(BIBLE_GET_BIBLE_TEXT + version + "/" + encodeURIComponent(reference) + "/NHV//", function(data) {
					fetchedHTML = data.value;
				});
				$.ajaxSetup({async: true});
			} catch (e) {
				$.ajaxSetup({async: true});
				result.errors.push(version);
				continue;
			}
			if (fetchedHTML && firstOsis) {
				var noteData = step.copyText._extractNotesFromHTML(fetchedHTML, firstOsis, lastOsis);
				if ((wantNotes && noteData.endNotes) || (wantXrefs && noteData.endXrefs))
					result.notesByVersion[version] = noteData;
			} else if (!fetchedHTML) {
				result.errors.push(version);
			}
		}
		return result;
	},

	// Helper used by both the modal's DOM-driven path and the dropdown's
	// options-driven path. Returns true iff the caller wants version N (0-based).
	_isVersionChecked: function(opts, n) {
		if (opts && $.isArray(opts.checkedVersionIndices))
			return opts.checkedVersionIndices.indexOf(n) > -1;
		return $('#cpyver' + (n + 1)).prop('checked');
	},

	// goCopy(firstVerseIndex, lastVerseIndex, opts?)
	//   opts.wantNotes (bool)          — overrides the #selectnotes checkbox
	//   opts.wantXrefs (bool)          — overrides the #selectxref checkbox
	//   opts.checkedVersionIndices (int[]) — overrides #cpyver1..N probes
	goCopy: function(firstVerseIndex, lastVerseIndex, opts) {
		opts = opts || {};
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
		var masterVersion = step.util.activePassage().get("masterVersion");
		var extraVersions = step.util.activePassage().get("extraVersions");
		var hasExtraVersions = (extraVersions !== "");
		var isInterlinear = $(passageContainer).has(".interlinear").length > 0;
		var endNotes = "";
		var endXrefs = "";
		var wantNotes = (opts.wantNotes !== undefined) ? !!opts.wantNotes : $("#selectnotes").prop("checked");
		var wantXrefs = (opts.wantXrefs !== undefined) ? !!opts.wantXrefs : $("#selectxref").prop("checked");
		if (wantNotes || wantXrefs) {
			var reference = step.util.activePassage().get("reference");
			var osisRange = step.copyText._getOsisIdsForRange(passageContainer, firstVerseIndex, lastVerseIndex);
			// Single-version panels may already have .note elements rendered
			// inline, so we can extract from the clone without a fresh fetch.
			var notesInDOM = !hasExtraVersions && !isInterlinear &&
				$(passageContainer).find('.note').length > 0;
			if (!hasExtraVersions && notesInDOM) {
				// Single version fast path: notes already in DOM clone
				var noteData = step.copyText._extractNotesFromClone(copyOfPassage, wantNotes, wantXrefs);
				if (wantNotes && noteData.endNotes) endNotes = "\nNotes:" + noteData.endNotes;
				if (wantXrefs && noteData.endXrefs) endXrefs = "\nCross references:" + noteData.endXrefs;
			} else {
				// API path: single version without DOM notes, or multi-version
				var versionsForNotes;
				if (!hasExtraVersions || isInterlinear) {
					versionsForNotes = [masterVersion];
				} else {
					var allVersions = [masterVersion].concat(extraVersions.split(","));
					versionsForNotes = [];
					for (var n = 0; n < allVersions.length; n++) {
						if (step.copyText._isVersionChecked(opts, n))
							versionsForNotes.push(allVersions[n]);
					}
				}
				var noteResult = step.copyText._fetchNotesForVersions(
					versionsForNotes, reference, osisRange.first, osisRange.last, wantNotes, wantXrefs
				);
				var versionKeys = [];
				for (var key in noteResult.notesByVersion) {
					if (noteResult.notesByVersion.hasOwnProperty(key))
						versionKeys.push(key);
				}
				var labelVersions = versionKeys.length > 1;
				for (var v = 0; v < versionKeys.length; v++) {
					var ver = versionKeys[v];
					var nd = noteResult.notesByVersion[ver];
					if (wantNotes && nd.endNotes)
						endNotes += "\n" + (labelVersions ? "Notes (" + ver + "):" : "Notes:") + nd.endNotes;
					if (wantXrefs && nd.endXrefs)
						endXrefs += "\n" + (labelVersions ? "Cross references (" + ver + "):" : "Cross references:") + nd.endXrefs;
				}
				// Inject inline markers into clone before notes are stripped
				step.copyText._injectMarkersIntoClone(copyOfPassage, versionsForNotes, wantNotes, wantXrefs);
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
		var versionsString = masterVersion;
		var options = step.util.activePassage().get("options");
		var versions = versionsString.split(",");
		var versionsToExclude = [];
		var numOfSelected = 0;
		if (extraVersions !== "") {
			versionsString += "," + extraVersions;
			versions = versionsString.split(",");
			for (var n = 0; n < versions.length; n++) {
				if (step.copyText._isVersionChecked(opts, n))
					numOfSelected ++;
				else {
					$(copyOfPassage).find('span[data-version="' + versions[n] + '"]').next().remove();
					$(copyOfPassage).find('span[data-version="' + versions[n] + '"]').remove();
					versionsToExclude.push(n);
				}
			}
			if ((numOfSelected == 0) && (interlinearClasses.length == 0)) { // error message only apply for non-interlinear mode
				step.copyText._sink().showNoVersionsSelected();
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
		if (endNotes !== "") textToCopy += endNotes;
		if (endXrefs !== "") textToCopy += endXrefs;

		
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
		var rapidCopy = copiesInLastMinute > 4;
		if (rapidCopy) {
			sleepTime = Math.min((60 - longestDifference) * 1000, 5000);
		}
		else if (previousTimes.length > 0) sleepTime = 600;

		// Clipboard write — guarded so dropdown sink can surface clipboard errors.
		try {
			var writeResult = navigator.clipboard && navigator.clipboard.writeText
				? navigator.clipboard.writeText(textToCopy) : null;
			if (writeResult && typeof writeResult.then === "function") {
				writeResult["catch"](function () {
					step.copyText._sink().showClipboardDenied();
				});
			} else if (!navigator.clipboard || !navigator.clipboard.writeText) {
				// Insecure-context fallback: hidden textarea + execCommand
				var ta = document.createElement("textarea");
				ta.value = textToCopy;
				ta.setAttribute("readonly", "");
				ta.style.position = "absolute";
				ta.style.left = "-9999px";
				document.body.appendChild(ta);
				var prevSel = document.getSelection();
				var prevRanges = [];
				if (prevSel && prevSel.rangeCount) {
					for (var r = 0; r < prevSel.rangeCount; r++) prevRanges.push(prevSel.getRangeAt(r));
				}
				ta.select();
				try { document.execCommand("copy"); }
				catch (e) { step.copyText._sink().showClipboardDenied(); }
				document.body.removeChild(ta);
				// Restore any previous ranges
				if (prevSel) {
					prevSel.removeAllRanges();
					for (var r = 0; r < prevRanges.length; r++) prevSel.addRange(prevRanges[r]);
				}
			}
		} catch (e) {
			step.copyText._sink().showCopyError(e);
			return;
		}

		if (rapidCopy) {
			step.copyText._sink().showRapidWarning(versionsString, sleepTime);
		} else {
			step.copyText._sink().showSuccess();
		}
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
	}
};
