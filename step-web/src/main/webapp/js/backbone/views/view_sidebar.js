var SidebarView = Backbone.View.extend({
    lastMorphCode: '',
    initialize: function () {
        //hide the help
        step.util.showOrHideTutorial(true);

        _.bindAll(this);

        //create tab container
        var container = this.$el.find(">div");
        this.sidebarButton = $(".navbar-brand .showSidebar");
        this.sidebarButtonIcon = this.sidebarButton.find(".glyphicon");
        this.tabContainer = this._createBaseTabs();
        this.tabHeaders = this._createTabHeadersContainer();
        this.$el.append(this.tabHeaders);
        this.$el.append(this.tabContainer);

        this.$el.on("show.bs.tab", this.changeMode);
        this.listenTo(this.model, "change", this.activate);
        this.listenTo(this.model, "toggleOpen", this.toggleOpen);
        this.listenTo(this.model, "forceOpen", this.openSidebar);

        this.activate();
        this.$el.find('a[data-toggle="tab"]').on("shown.bs.tab", this._notifyTabPanes);
    },
    _notifyTabPanes: function (ev) {
        ev.stopPropagation();
        this.$el.find(".tab-pane").trigger("tab-change", {newTab: ev.target});
    },
    changeMode: function (e) {
        var mode = null;
        var targetTab = $(e.target);
        var data = targetTab.data("target");
        if (data == '#lexicon') {
            mode = 'lexicon';
        }
        else if (data == '#analysis') {
            mode = 'analysis';
        }
        else if (data == '#history') {
            mode = 'history';
        }
        else if (data == '#help') {
            mode = 'help';
        }

        this.model.save({
            mode: mode
        });
    },
    activate: function () {
        var self = this;
        //make sidebar visible
        this.openSidebar();

        //show the correct tab
        this.$el.find("[data-target='#" + this.model.get("mode") + "']").tab("show");

        if (this.model.get("mode") == 'lexicon') {
            this.lexicon.addClass("active");
            //load content
            var requestTime = new Date().getTime();
            lastMorphCode = '';
            if ((this.model.get("morph") != undefined) && (this.model.get("morph").indexOf('TOS:') == 0)) {
                lastMorphCode = this.model.get("morph");
            }
			if ((typeof this.model.get("version") === "undefined") &&
				(typeof this.model.get("ref") === "undefined") &&
				(typeof this.model.get("morph") === "undefined") &&
				(this.model.get("strong") === "H0001")) {
				console.log("MODULE_GET_INFO undefined H0001");
				return;
			}
			var ref = this.model.get("ref");
			var strongCode = this.model.get("strong");
			if (strongCode.search(/([GH])(\d{1,3})(![A-Za-z])$/) > -1) {
				strongCode = RegExp.$1 + ("000" + RegExp.$2).slice(-4) + RegExp.$3;
			}
            var vocabMorphFromJson = step.util.getVocabMorphInfoFromJson(strongCode, this.model.get("morph"), ref, this.model.get("version"));
            if (vocabMorphFromJson.vocabInfos.length > 0) {
                self.createDefinition(vocabMorphFromJson, ref);
                return;
            }
            $.getSafe(MODULE_GET_INFO, [this.model.get("version"), ref, strongCode, this.model.get("morph"), step.userLanguageCode], function (data) {
                //step.util.trackAnalyticsTime("lexicon", "loaded", new Date().getTime() - requestTime);
                //step.util.trackAnalytics("lexicon", "strong", strongCode); // self.model.get("strong"));
                self.createDefinition(data, ref);
            }).error(function() {
                if (changeBaseURL())
                    $.getSafe(MODULE_GET_INFO, [this.model.get("version"), ref, strongCode, this.model.get("morph"), step.userLanguageCode], function (data) {
                        self.createDefinition(data, ref);
                    })
            });
        }
        else if (this.model.get("mode") == 'analysis') {
            self.createAnalysis();
        }
        else if (this.model.get("mode") == 'history') {
            self.createHistory();
        }
        else {
            self.createHelp();
        }
        // added for colour code grammar.  Should be const instead of var, but does not work with older browser
        // This must match the definition in the color_code_grammar.js
        // Do not take away the TBRMBR comment (to be removed by maven replacer)
        var C_numOfAnimationsAlreadyPerformedOnSamePage = 16; // TBRBMR
        if ((cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== undefined) && (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== null))
            cv[C_numOfAnimationsAlreadyPerformedOnSamePage] = 0;
    },
    _createBaseTabs: function () {
        var tabContent = $("<div class='tab-content'></div>");
        var heightToSet = $('.passageContainer.active').height();
        if (typeof heightToSet === "number") {
            heightToSet -= 60;
            heightToSet += "px";
        }
        else heightToSet = "85vh";
        this.lexicon = $("<div id='lexicon' class='tab-pane' style='overflow-y:scroll;height:" + heightToSet + "'></div>");
        this.analysis = $("<div id='analysis' class='tab-pane' style='overflow-y:scroll;height:" + heightToSet + "'></div>");
        this.history = $("<div id='history' class='tab-pane' style='overflow-y:scroll;height:" + heightToSet + "'></div>");
        this.help = $("<div id='help' class='tab-pane' style='overflow-y:scroll;height:" + heightToSet + "'></div>");
        tabContent.append(this.lexicon);
        tabContent.append(this.analysis);
        tabContent.append(this.history);
        tabContent.append(this.help);
        this.$el.append(tabContent);
        return tabContent;
    },
    createHistory: function () {
        if (!this.historyView) {
            this.historyView = new ViewHistory({
                el: this.history
            });
        }
        else {
            this.historyView.refresh();
        }
    },
    createAnalysis: function () {
        if (!this.analysisView) {
            this.analysisView = new ViewLexiconWordle({
                el: this.analysis
            });
        }
        else {
            this.analysisView.refresh();
        }
    },
    createHelp: function () {
        this.helpView = new ExamplesView({el: this.help});
    },
    createDefinition: function (data, ref) {
        var displayLexicalRelatedWords = $(".detailLex:visible").length > 0;
        //get definition tab
        this.lexicon.detach();
        this.lexicon.empty();

        var alternativeEntries = $("<div id='vocabEntries'>");
        this.lexicon.append(alternativeEntries);
        this.lexicon.append($("<h1>").append(__s.lexicon_vocab));

        if (data.vocabInfos.length == 0) {
            return;
        }
        var urlLang = $.getUrlVar("lang");
        if (urlLang == null) urlLang = "";
        else urlLang = urlLang.toLowerCase();
        var currentUserLang = step.userLanguageCode.toLowerCase();
        if (urlLang == "zh_tw") currentUserLang = "zh_tw";
        else if (urlLang == "zh") currentUserLang = "zh";
        if (data.vocabInfos.length > 1) {
            //multiple entries
            var panelGroup = $('<div class="panel-group" id="collapsedLexicon"></div>');
            var openDef = _.min(data.vocabInfos, function (def) {
                return def.count;
            });
            for (var i = 0; i < data.vocabInfos.length; i++) {
                var item = data.vocabInfos[i];
                var hebrew = data.vocabInfos[i].strongNumber == 'H';
                var panelId = "lexicon-" + data.vocabInfos[i].strongNumber;
				var currentGloss = item.stepGloss;
				if (currentUserLang =="es") currentGloss += " " + item._es_Gloss;
				else if (currentUserLang =="zh") currentGloss += " " + item._zh_Gloss;
				else if (currentUserLang =="zh_tw") currentGloss += " " + item._zh_tw_Gloss;
                var panelTitle = currentGloss + " (<span class='transliteration'>" + item.stepTransliteration + "</span> - " + '<span class="' + (hebrew ? 'hbFontSmall' : 'unicodeFont') + '">' + item.accentedUnicode + "</span>)";
                var panelContentContainer = $('<div class="panel-collapse collapse">').attr("id", panelId);
                var panelBody = $('<div class="panel-body"></div>');
                panelContentContainer.append(panelBody);

                if (openDef == data.vocabInfos[i]) {
                    panelContentContainer.addClass("in");
                }

                this._createBriefWordPanel(panelBody, item, currentUserLang);
// need to handle multiple morphInfo (array)
                if ((lastMorphCode != '') && (data.morphInfos.length == 0)) {
                    data.morphInfos = cf.getTOSMorphologyInfo(lastMorphCode);
                } 
                if (i < data.morphInfos.length) {
                    this._createBriefMorphInfo(panelBody, data.morphInfos[i]);
                }
                this._createWordPanel(panelBody, item, currentUserLang);
                if (i < data.morphInfos.length) {
                    this._createMorphInfo(panelBody, data.morphInfos[i]);
                }

                var panelHeading = '<div class="panel-heading"><h4 class="panel-title" data-toggle="collapse" data-parent="#collapsedLexicon" data-target="#' + panelId + '"><a>' +
                    panelTitle + '</a></h4></div>';

                var panel = $('<div class="panel panel-default"></div>').append(panelHeading).append(panelContentContainer);
                panelGroup.append(panel);
            }
            this.lexicon.append(panelGroup);

        }
        else {
            this._createBriefWordPanel(this.lexicon, data.vocabInfos[0], currentUserLang);
            // need to handle multiple morphInfo (array)
            if ((lastMorphCode != '') && (data.morphInfos.length == 0)) {
                data.morphInfos = cf.getTOSMorphologyInfo(lastMorphCode);
            }
            if (data.morphInfos.length > 0) {
                this._createBriefMorphInfo(this.lexicon, data.morphInfos[0]);
            }
            this._createWordPanel(this.lexicon, data.vocabInfos[0], currentUserLang);
            if (data.morphInfos.length > 0) {
                this._createMorphInfo(this.lexicon, data.morphInfos[0]);
            }
        }
        this.tabContainer.append(this.lexicon);
        if (displayLexicalRelatedWords) {
            $(".detailLex").show();
            $("#detailLexSelect").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
        }
		this._isItALocation(data.vocabInfos[0], ref);
    },
    _createBriefWordPanel: function (panel, mainWord, currentUserLang) {
        var userLangGloss = "";
        if ((currentUserLang == "es") && (mainWord._es_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._es_Gloss + "&nbsp;";
        else if ((currentUserLang == "zh") && (mainWord._zh_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._zh_Gloss + "&nbsp;";
        else if ((currentUserLang == "zh_tw") && (mainWord._zh_tw_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._zh_tw_Gloss + "&nbsp;";
        panel.append(
            $("<div>").append($("<span>").addClass(mainWord.strongNumber[0] == 'H' ? "hbFontSmall" : "unicodeFont")
                .append(mainWord.accentedUnicode))
                .append(" (")
                .append("<span class='transliteration'>" + mainWord.stepTransliteration + "</span>")
                .append(") " + userLangGloss + "'")
                .append(mainWord.stepGloss)
                .append("' ")
                .append($(" <span title='" + __s.strong_number + "'>").append(" (" + mainWord.strongNumber + ")").addClass("strongNumberTagLine"))
				.append('<span id="possibleMap"></span>')
        );
    },

    _addLinkAndAppend: function (panel, textToAdd, currentWordLangCode, bibleVersion) {
        // Find all ref tang and change
        //        panel.append('<a sbRef=" PASSAGE1 " class="linkRef" href="?q=version= VERSION &amp;reference= PASSAGE1 "> PASSAGE2 </a>');
        //        '<ref=\'' . PASSAGE1 . '\'>' . PASSAGE2 . '</ref>';
        var remainingText = textToAdd;
        var textToAdd2 = remainingText;
        var pos1 = remainingText.search("<ref=['\"]");
        if (pos1 > -1) {
            textToAdd2 = "";
            while (pos1 > -1) {
                textToAdd2 += remainingText.substr(0, pos1);
                var typeOfQuoteChar = remainingText.substr(pos1 + 5, 1);
                remainingText = remainingText.substr(pos1 + 6);
                var pos2 = remainingText.search(typeOfQuoteChar + ">");
                if (pos2 > 2) {
                    var passageRef = remainingText.substr(0, pos2);
                    remainingText = remainingText.substr(pos2 + 2);
                    var pos3 = remainingText.indexOf("</ref>");
                    if (pos3 > -1) {
                        textToAdd2 += '<a sbRef=' + typeOfQuoteChar + passageRef + typeOfQuoteChar +
                            ' class="linkRef" href="?q=version=' + bibleVersion +
                            '&amp;reference=' + passageRef + '">' + remainingText.substr(0, pos3) +
                            '</a>';
                        remainingText = remainingText.substr(pos3 + 6);
                        pos1 = remainingText.search("<ref=['\"]"); // Search for the next iteration of while loop.
                    }
                    else {
                        textToAdd2 += "<ref=" + typeOfQuoteChar + passageRef + typeOfQuoteChar + ">" + remainingText;
                        remainingText = "";
                        pos1 = -1; // Incomplete ref tag
                    }
                }
                else {
                    textToAdd2 += "<ref=" + typeOfQuoteChar + remainingText;
                    remainingText = "";
                    pos1 = -1; // Incomplete <ref=' tag.  Cannot find the '> after that.
                }
            }
            textToAdd2 += remainingText;
        }
        remainingText = textToAdd2;
        var matchExpression = new RegExp(/[GH]\d{4,5}[a-zA-Z]?/g);
        var matchResult = remainingText.match(matchExpression);
        if (matchResult != null) {
            for (var i = 0; i < matchResult.length; i++) {
                var pos = remainingText.search(matchResult[i]);
                var matchLength = matchResult[i].length;
                var currentMatch = remainingText.substr(pos, matchLength);
                var currentStrongNumber = currentMatch;
                if ((currentStrongNumber.substr(0,1) != "G") && (currentStrongNumber.substr(0,1) != "H"))
                    currentStrongNumber = currentWordLangCode + currentMatch;
                if ((currentStrongNumber.length == 6) && (currentStrongNumber.substr(1,1) == "0") && (!isNaN(currentStrongNumber.substr(2,5)))) // G0nnnn -> Gnnnn or H0nnnn -> Hnnnn
                    currentStrongNumber = currentStrongNumber.substr(0,1) + currentStrongNumber.substr(2);
                panel.append(remainingText.substr(0, pos));  // text before the 4 character code
                panel.append($('<a sbstrong href="javascript:void(0)">')
                    .append(currentMatch)
                    .data("strongNumber", currentStrongNumber));
                remainingText = remainingText.substr(pos + matchLength);
            }
        }
        panel.append(remainingText).append("<br />");        
    },

    _addChineseDefinitions: function (panel, mainWord, currentUserLang, bibleVersion, addLinkAndAppendFunction) {
        var currentWordLangCode = mainWord.strongNumber.substr(0, 1);
        var foundChineseJSON = false;
        $.ajaxSetup({async: false});
        var strongWithoutAugment = mainWord.strongNumber;
        if (strongWithoutAugment.search(/([GH])(\d{1,4})[A-Za-z]?$/) > -1) {
            strongWithoutAugment = RegExp.$1 + ("000" + RegExp.$2).slice(-4); // if strong is not 4 digit, make it 4 digit
        }                                                                     // remove the last alpha character 
        $.getJSON("/lexicon/" + currentUserLang + "/" + strongWithoutAugment + ".json", function(chineseVars) {
            foundChineseJSON = true;
            panel.append($("<h2>").append(__s.zh_lexicon_chinese_name + ':'));
            panel.append($("<h2>").append(__s.lexicon_part_of_speech_for_zh + ':&nbsp;<span style="font-weight:normal;font-size:14px">' + chineseVars.partOfSpeech + '</span>'));
            panel.append($("<h2>").append(__s.lexicon_definition_for_zh + ":"));

            addLinkAndAppendFunction(panel, chineseVars.definition, currentWordLangCode, bibleVersion);

            panel.append($("<h2>").append(__s.lexicon_usage_for_zh + ":"));
            var ul = $('<ul>');
            for (var i = 0; i < chineseVars.usage.length; i = i+2) {
                var li = $("<li></li>");
                var displayTextOnUsage = chineseVars.usage[i];
                var refArray1 = chineseVars.usage[i+1];
                if (refArray1.length > 1) li.append("<span><abbr title=\"Over 100 usage of this word.  Each of the following link will display about 100 usage.\">" + displayTextOnUsage + "</abbr></span>");
                for (var j = 0; j < refArray1.length; j++) {
                    var refURLString = "";
                    var refArray2 = refArray1[j];
                    for (var k = 0; k < refArray2.length; k++) {
                        refURLString += "|reference=" + refArray2[k];
                    }
                    if (refArray1.length > 1) {
                        var displayGroupText = "";
                        if ((j/26) >= 1) displayGroupText = String.fromCharCode(97 + Math.floor(j/26) - 1);
                        displayGroupText += String.fromCharCode(97 + (j % 26));
                        displayTextOnUsage = "&nbsp;<span title=\"Usage " + 
                            (1 + (j * 100)) + " to " + 
                            (100 + (j * 100)) + "\">(" + displayGroupText + ")</span>";
                    }
                    li.append($("<a sbstrong></a>").attr("href", "javascript:void(0)")
                        .data("strongNumber", strongWithoutAugment)
                        .data("refURLStr", refURLString)
                        .append(displayTextOnUsage).click(function () {
                            var strongNumber = $(this).data("strongNumber");
                            var refURLStr = $(this).data("refURLStr");
                            var args = "strong=" + encodeURIComponent(strongNumber) + refURLStr;
                            step.util.activePassage().save({ strongHighlights: strongNumber }, {silent: true});
                            step.router.navigatePreserveVersions(args, false, true);
                    }));
                }
                ul.append(li);
            }
            panel.append(ul);
        });
        $.ajaxSetup({async: true});
        return foundChineseJSON;
    },

    _addDetailLexicalWords: function (detailLex, panel, isCurrentWord) {
        var frequency = parseInt(detailLex[3]); // Just in case it is provided in String instead of number
        panel.append($("<br class='detailLex' style='display:none'>"));
        var spaceWithoutLabel = "&nbsp;&nbsp;&nbsp;";
        if (isCurrentWord) {
            panel.append($("<span class='detailLex glyphicon glyphicon-arrow-right' style='font-size:10px;display:none' ></span>"));
            spaceWithoutLabel = "";
        }
        panel.append($("<a title='" + detailLex[1] + " " + detailLex[4] + "'></a>").attr("href", "javascript:void(0)").data("strongNumber", detailLex[1]).
            append($("<span class='detailLex' style='display:none'>" + spaceWithoutLabel + detailLex[0] + " </span>")).click(function () {
            step.util.ui.showDef($(this).data("strongNumber"));
        }));
        panel.append($("<span class='detailLex' style='display:none' title='" + detailLex[1] + " " + detailLex[4] + "'>" + detailLex[2] + "</span>"));
        panel.append($('<span class="detailLex" style="display:none">&nbsp;&nbsp;</span>'));
        panel.append($("<a title='click to show all occurences of this word'></a>").attr("href", "javascript:void(0)").data("strongNumber", detailLex[1]).
              append('<span class="strongCount detailLex" style="unicode-bidi:isolate-override;display:none">~' + sprintf(__s.stats_occurs, frequency) + '</span>').
              click(function () {
            var strongNumber = $(this).data("strongNumber");
            var args = "strong=" + encodeURIComponent(strongNumber);
            step.util.activePassage().save({strongHighlights: strongNumber}, {silent: true});
            step.router.navigatePreserveVersions(args, false, true);
            return false;
        }));
    },

    _composeDescriptionOfOccurences: function(stepType) {
        if ((typeof stepType !== "string") || (stepType === "") ||
            (stepType === "word") || (stepType === "verb") || (stepType === "name") ||
            ((step.userLanguage !== "English") &                                     // If user language is not English, but it is using the English message,
             ((__s.lexicon_search_for_this_person === "This person occurs about") || // there is no translation for these two new messages.  Therefore use the original message which is
              (__s.lexicon_search_for_this_place === "This place occurs about"))) )   // lexicon_search_for_this_word.  That has been translated for many years.
             return __s.lexicon_search_for_this_word;
        if (stepType === "place") return __s.lexicon_search_for_this_place;
        return __s.lexicon_search_for_this_person;
    },

    _appendLexiconSearch: function (panel, mainWord, detailLex) {
        var total = mainWord.count;
        var allStrongs = [];
        panel.append("<br />").append(this._composeDescriptionOfOccurences(mainWord._step_Type));
        if ((detailLex) && (detailLex.length > 0)) {
			allStrongs.push(mainWord.strongNumber);
			for (var i = 0; i < detailLex.length; i++) {
                if (detailLex[i][1] !== mainWord.strongNumber) {
				    total += parseInt(detailLex[i][3]); // Just in case it is provided in String instead of number
                    allStrongs.push(detailLex[i][1]);
                }
            }
			panel.append($("<a></a>").attr("href", "javascript:void(0)").data("strongNumber", allStrongs).append('<span class="strongCount" style="unicode-bidi:isolate-override"> ' +
               sprintf(__s.stats_occurs, total) + '</span>').click(function () {
				var args = $(this).data("strongNumber");
				console.log("args " + args);
				var currentSearch = "strong=" + encodeURIComponent(args[0]);

				var searchJoins = "";
				for (var i = 1; i < allStrongs.length; i++) {
					currentSearch += '|strong=' + encodeURIComponent(args[i]);
					if (i == 1) searchJoins = "searchJoins=OR";
					else searchJoins += ",OR"
				}
				currentSearch = searchJoins + "|" + currentSearch;
								
				step.router.navigatePreserveVersions(currentSearch, false, true, true);
				return false;
			}));
            panel.append($("<a id='detailLexSelect' class='glyphicon glyphicon-triangle-right'></a>").attr("href", "javascript:void(0)").click(function (ev) {
				if (ev.target.id === "detailLexSelect") {
					if ($(".detailLex:visible").length > 0) {
						$(".detailLex").hide();
						$("#detailLexSelect").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");
					}
					else {
						$(".detailLex").show();
						$("#detailLexSelect").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
					}
				}
				return false;
			}));
			for (var i = 0; i < detailLex.length; i++) {
                this._addDetailLexicalWords(detailLex[i], panel, (detailLex[i][1] === mainWord.strongNumber));
			}
        }
        else {
            if (total) {
                panel.append($("<a></a>").attr("href", "javascript:void(0)").data("strongNumber", mainWord.strongNumber).append('<span class="strongCount"> ' + sprintf(__s.stats_occurs, total) + '</span>').click(function () {
                    var strongNumber = $(this).data("strongNumber");
                    var args = "strong=" + encodeURIComponent(strongNumber);
                    step.util.activePassage().save({strongHighlights: strongNumber}, {silent: true});
                    step.router.navigatePreserveVersions(args, false, true);
			    	return false;
                }));
            }
        }
        panel.append().append('<br />');
		return false;
    },

	_lookUpGeoInfo: function(mainWord, bookName, coordinates) {
		bookName = bookName.substring(0, bookName.length - 1);
		var possibleMapElement = $("#possibleMap");
		if (possibleMapElement.length == 0) {
			console.log ("cannot find possible Map ID in html");
			// add a sleep here
			possibleMapElement = $("#possibleMap");
		}
		possibleMapElement.empty().html("<a href='/html/multimap.html?coord=" + coordinates + 
			"&strong=" + mainWord.strongNumber + "&gloss=" + mainWord.stepGloss +
			"&book=" + bookName +
			"' target='_new'>" +
			"<button type='button' class='stepButton' ><b>Map</b></button>" +
			"</a>");
	},

	_relatedNosNotDisplayed: function(relatedNos, detailLex) {
        if (typeof relatedNos === "string")
            relatedNos=JSON.parse(relatedNos.replaceAll("'", '"'));
		var relatedNosToDisplay = [];
		if (relatedNos) {
			for (var i = 0; i < relatedNos.length; i++) {
				var found = false;
				for (var j = 0; ((j < detailLex.length) && (!found)); j++) {
					if (relatedNos[i].strongNumber === detailLex[j][1]) {
						found = true;
					}
				}
				if (!found) {
					relatedNosToDisplay.push(relatedNos[i]);
				}
			}
		}
		return relatedNosToDisplay;
	},
	
	_isItALocation: function(mainWord, ref) {
		var strongNum = mainWord.strongNumber.trim();
        var stepLink = mainWord._step_Link;
        if (typeof stepLink !== "string") return;
        var stepLink = stepLink.trim();
        if ((stepLink.length < 3) || (isNaN(stepLink.substring(0,1)))) return;
        var posOfComma = stepLink.indexOf(",");
        if (posOfComma == -1) return;
        if ((isNaN(stepLink.substring(0, posOfComma - 1))) || (isNaN(stepLink.substring(posOfComma + 1)))) return;
		if (typeof ref === "undefined") {
			if ((typeof step.previousSideBarLexiconRef === "object") && 
					((strongNum === step.previousSideBarLexiconRef[0]) ||
					 (strongNum.substring(0,strongNum.length-1) === step.previousSideBarLexiconRef[0]))) {
				ref = step.previousSideBarLexiconRef[1];
			}
			else ref = "";
		}
		else step.previousSideBarLexiconRef = [strongNum, ref];
		var posOfDot1 = ref.indexOf(".");
		var bookName = (posOfDot1 > 2) ? ref.substr(0, posOfDot1 + 1) : ""; // Include the "." (dot)
		this._lookUpGeoInfo(mainWord, bookName, stepLink);
	},
	
    _createWordPanel: function (panel, mainWord, currentUserLang) {
        var currentWordLanguageCode = mainWord.strongNumber[0];
        var bibleVersion = this.model.get("version") || "ESV";
        if (mainWord.shortDef) {
            this._addLinkAndAppend(panel.append($("<div>")), mainWord.shortDef, currentWordLanguageCode, bibleVersion);
        }
		var detailLex = [];
		if (mainWord._stepDetailLexicalTag) {
			detailLex = (typeof mainWord._stepDetailLexicalTag === "string") ? 
                JSON.parse(mainWord._stepDetailLexicalTag) : mainWord._stepDetailLexicalTag;
		}
        this._appendLexiconSearch(panel, mainWord, detailLex);
        var displayEnglishLexicon = true;
        var foundChineseJSON = false;

        if (currentUserLang.indexOf("es") == 0) {
            // displayEnglishLexicon = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isEnWithEsLexicon") ||
									// false;
            var spanishDef = mainWord._es_Definition;
            if (spanishDef) {
                panel.append($("<h2>").append(__s.es_lexicon_meaning));
                this._addLinkAndAppend(panel, spanishDef, currentWordLanguageCode, bibleVersion);
            }
        }
        else if (currentUserLang.indexOf("zh") == 0) {
            displayEnglishLexicon = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isEnWithZhLexicon") ||
									false;
            var chineseDef;
            if ((currentUserLang == "zh_tw") && (mainWord._zh_tw_Definition != undefined)) chineseDef = mainWord._zh_tw_Definition;
            else if (mainWord._zh_Definition != undefined) chineseDef =  mainWord._zh_Definition;
            if (chineseDef) {
                panel.append($("<h2>").append(__s.zh_lexicon_meaning_fhl));
                this._addLinkAndAppend(panel, chineseDef, currentWordLanguageCode, bibleVersion);
            }
            var useSecondZhLexicon = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isSecondZhLexicon");
            if ((useSecondZhLexicon == null) || (useSecondZhLexicon))
                foundChineseJSON = this._addChineseDefinitions(panel, mainWord, currentUserLang, bibleVersion, this._addLinkAndAppend);
        }
		else if (currentUserLang == "vi") {
			var vietnameseDef = mainWord._vi_Definition;
			if (vietnameseDef) {
				panel.append($("<h2>").append("Từ điển Hy Lạp-Việt"));
                this._addLinkAndAppend(panel, vietnameseDef, currentWordLanguageCode, bibleVersion);
            }

		}
        if (displayEnglishLexicon) { // This might be false if Chinese lexicon is displayed and isEnWithZhLexicon is false append the meanings
            if (mainWord.mediumDef) {
                panel.append($("<h2>").append(__s.lexicon_meaning));
                this._addLinkAndAppend(panel, mainWord.mediumDef, currentWordLanguageCode, bibleVersion);
            }
            //longer definitions
            if (mainWord.lsjDefs) {
                panel.append($("<h2>").append(currentWordLanguageCode.toLowerCase() === 'g' ? __s.lexicon_lsj_definition : __s.lexicon_bdb_definition));
                panel.append('<span class="unicodefont">' + mainWord.lsjDefs + '</span>');
            }
        }
		
		relatedNosToDisplay = this._relatedNosNotDisplayed(mainWord.relatedNos, detailLex);
        if (relatedNosToDisplay.length > 0) {
            panel.append($("<h2>").append(__s.lexicon_related_words));
            var ul = $('<ul>');
            var matchingExpression = "";
            for (var i = 0; i < relatedNosToDisplay.length; i++) {
                if (relatedNosToDisplay[i].strongNumber != mainWord.strongNumber) {
                    var userLangGloss = "";
                    if ((currentUserLang == "es") && (relatedNosToDisplay[i]._es_Gloss != undefined)) userLangGloss = relatedNosToDisplay[i]._es_Gloss + "&nbsp;";
                    else if ((currentUserLang == "zh") && (relatedNosToDisplay[i]._zh_Gloss != undefined)) userLangGloss =  relatedNosToDisplay[i]._zh_Gloss + "&nbsp;";
                    else if ((currentUserLang == "zh_tw") && (relatedNosToDisplay[i]._zh_tw_Gloss != undefined)) userLangGloss = relatedNosToDisplay[i]._zh_tw_Gloss + "&nbsp;";
                    var li = "";
                    if ((!relatedNosToDisplay[i]._searchResultRange) || (relatedNosToDisplay[i]._searchResultRange === "")) {
                        var fontClass = "";
                        var firstChar = relatedNosToDisplay[i].strongNumber.substr(0, 1).toLowerCase();
                        if (firstChar === "h") fontClass = "hbFontMini";
                        else if (firstChar === "g") fontClass = "unicodeFont";
                        li = $("<li title='" + relatedNosToDisplay[i].strongNumber + "'></li>").append($('<a sbstrong href="javascript:void(0)">')
                            .append(userLangGloss)
                            .append(relatedNosToDisplay[i].gloss)
                            .append(" (")
                            .append("<span class='transliteration'>" + relatedNosToDisplay[i].stepTransliteration + "</span>")
                            .append(" - ")
                            .append("<span class='" + fontClass + "'>" +
                                relatedNosToDisplay[i].matchingForm +
                                '</span>')
                            .append(")")
                            .data("strongNumber", relatedNosToDisplay[i].strongNumber));
                    }
                    else {
                        li = $("<li title='" + relatedNosToDisplay[i].strongNumber + " " +
                                relatedNosToDisplay[i].stepTransliteration + " " +
                                relatedNosToDisplay[i].matchingForm +
                                "'></li>").append($('<a sbstrong href="javascript:void(0)">')
                            .append(userLangGloss)
							.append(relatedNosToDisplay[i].gloss)
                            .append(step.util.formatSearchResultRange(relatedNosToDisplay[i]._searchResultRange, false))
                            .data("strongNumber", relatedNosToDisplay[i].strongNumber));                        
                    }
                    ul.append(li);

                    matchingExpression += relatedNosToDisplay[i].strongNumber + " ";
                }
            }
            step.passage.highlightStrong(null, matchingExpression, "lexiconRelatedFocus");
            panel.append(ul);
        }
        panel.find("[sbstrong]").click(function () {
            step.util.ui.showDef($(this).data("strongNumber"));
        });
        if ((foundChineseJSON) && (!step.state.isLocal())) 
            panel.append("<br><a href=\"lexicon/additionalinfo/" + mainWord.strongNumber + ".html" +
                "\" target=\"_blank\">" +
                __s.zh_additional_zh_lexicon_info + "</a>");
        this._doSideNotes(panel, bibleVersion);
    },
    // for one-line morphology
    _createBriefMorphInfo: function (panel, info) {
        panel.append("(");
		// Added following two lines. Accidentally delected the info["function'] 2019 - PT Sept 2020.
		if (info["ot_function"] === undefined) this.renderBriefMorphItem(panel, info, "function");
		else this.renderBriefMorphItem(panel, info, "ot_function");
        // Updated the order of the display so that it matches the order of the robinson code - PT June 2019
        this.renderBriefMorphItem(panel, info, "tense");
        this.renderBriefMorphItem(panel, info, "voice");
        this.renderBriefMorphItem(panel, info, "mood");
        this.renderBriefMorphItem(panel, info, "stem");
        this.renderBriefMorphItem(panel, info, "ot_form");
        this.renderBriefMorphItem(panel, info, "wordCase");
        this.renderBriefMorphItem(panel, info, "person");
        this.renderBriefMorphItem(panel, info, "number");
        this.renderBriefMorphItem(panel, info, "gender");
        this.renderBriefMorphItem(panel, info, "state");
        this.renderBriefMorphItem(panel, info, "suffix");
        panel.append(")<br />");
    },
    renderBriefMorphItem: function (panel, morphInfo, param) {
        if(morphInfo && param && morphInfo[param]) {
            var morphValue = this.replaceEmphasis(morphInfo[param]);
			var local_var_name = morphValue.toLowerCase().replace(/ /g, "_");
			if ((typeof __s[local_var_name] !== "undefined") &&
				(morphValue.toLowerCase() !== __s[local_var_name].toLowerCase()))
				morphValue += " (" + __s[local_var_name] + ") ";
            var htmlValue = $("<span>" + morphValue + "</span>");
            panel.append(htmlValue);
            panel.append(" ");
        }
    },
    _createMorphInfo: function (panel, info) {
        // Updated the order of the display so that it matches the order of the robinson code - PT June 2019
        panel.append($("<h2>").append(__s.display_grammar));
        this.renderMorphItem(panel, info, __s.lexicon_grammar_language, "language");
		// Added following two lines. Accidentally delected the info["function'] 2019 - PT Sept 2020.
		if (info["ot_function"] === undefined) this.renderMorphItem(panel, info, __s.lexicon_grammar_function, "function");
		else this.renderMorphItem(panel, info, __s.lexicon_grammar_function, "ot_function");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_tense, "tense");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_voice, "voice");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_mood, "mood");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_stem, "stem");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_ot_action, "ot_action");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_ot_voice, "ot_voice");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_form, "ot_form");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_ot_tense, "ot_tense");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_ot_mood, "ot_mood");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_case, "wordCase");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_person, "person");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_number, "number");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_gender, "gender");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_state, "state");
        this.renderMorphItem(panel, info, __s.lexicon_grammar_suffix, "suffix");
        panel.append("<br />");

        if (info["explanation"] != undefined) {
            panel.append($("<h3>").append(__s.lexicon_ie)).append(this.replaceEmphasis(info["explanation"]));
            panel.append("<br />");
        }
        if (info["description"] != undefined)
            panel.append($("<h3>").append(__s.lexicon_eg)).append(this.replaceEmphasis(info["description"]));
    },
    renderMorphItem: function (panel, morphInfo, title, param) {
        if (morphInfo && param && morphInfo[param]) {
			var morphValue = this.replaceEmphasis(morphInfo[param]);
			var local_var_name = morphValue.toLowerCase().replace(/ /g, "_");
			morphValue += (__s[local_var_name]) ? " (" + __s[local_var_name] + ")" : "";
            var htmlValue = $("<span>" + morphValue + "</span>");
            panel.append($("<h3>").append(title)).append(htmlValue);
            if (morphInfo[param + "Explained"] || param == 'wordCase' && morphInfo["caseExplained"]) {
                var explanation = morphInfo[param + "Explained"] || param == 'wordCase' && morphInfo["caseExplained"];
                htmlValue.attr("title", this.stripEmphasis(explanation));
            }
            panel.append("<br />");
        }
    },
    replaceEmphasis: function (str) {
        return (str || "").replace(/_([^_]*)_/g, "<em>$1</em>");
    },
    stripEmphasis: function (str) {
        return (str || "").replace(/_([^_]*)_/g, "");
    },
    _createTabHeadersContainer: function () {
        var template = '<ul class="nav nav-tabs">' +
            '<li class="active"><a class="glyphicon glyphicon-info-sign" title="<%= __s.original_word %>" data-toggle="tab" data-target="#lexicon"></li>' +
            '<li><a class="glyphicon glyphicon-stats" title="<%= __s.passage_stats %>" data-toggle="tab" data-target="#analysis"></li>' +
            '<li><a class="glyphicon glyphicon-bookmark" title="<%= __s.bookmarks_and_recent_texts %>" data-toggle="tab" data-target="#history"></li>' +
            '<li><a class="stepglyph-help" title="<%= __s.quick_tutorial %>" data-toggle="tab" data-target="#help">?</li>' +
            '</ul>';

        var tabContainer = $(_.template(template)());

        //add close buttonx
        tabContainer.append(
            $("<li class='closeSidebar'><a class='glyphicon glyphicon-remove' /></li>")
                .click(this.closeSidebar));

        return tabContainer;
    },
    toggleOpen: function () {
        if (!this.$el.closest('.row-offcanvas').hasClass("active")) {
            this.openSidebar();
        }
        else {
            this.closeSidebar();
        }
    },
    openSidebar: function () {
        this.sidebarButtonIcon.addClass("active");
        this.$el.closest('.row-offcanvas').addClass("active");
    },
    closeSidebar: function () {
        this.sidebarButtonIcon.removeClass("active");
        this.$el.closest('.row-offcanvas').removeClass('active');
		$(".lexiconFocus, .lexiconRelatedFocus").removeClass("lexiconFocus lexiconRelatedFocus");
    },
    /**
     * Creates a QTIP for a particular xref
     * @param item the item which is targetted in the side note bar
     * @param xref the actual cross-reference
     * @param version the version to be used for lookups
     * @private
     */
    _makeSideNoteQtip: function (item, xref, version) {
        var self = this;
        item.on("mouseover", function () {
            self._makeSideNoteQtipHandler(item, xref, version, false);
        }).on("touchstart", function () {
            self._makeSideNoteQtipHandler(item, xref, version, true);
        });
    },

    /**
     * Sets up qtip on all side notes
     * @param passageContent the html content
     * @param version the current version
     * @private
     */
    _doSideNotes: function (passageContent, version) {
        var self = this;

        //remove click functionality from verse headers...
        $("[sbRef]", passageContent).click(function(e) { e.preventDefault(); })

        var xrefs = $("[sbRef]", passageContent);
        for (var i = 0; i < xrefs.length; i++) {
            var item = xrefs.eq(i);
            var xref = item.attr("sbRef");

            item.click(function (e) {
                e.preventDefault();
            });

            this._makeSideNoteQtip(item, xref, version);
        }
    },

    _makeSideNoteQtipHandler: function (item, xref, version, touch) {
        var self = this;
        if (!$.data(item, "initialised")) {
            require(["qtip", "drag"], function () {
                item.qtip({
                    position: { my: "top right", at: "top left", viewport: $(window) },
                    style: { tip: false, classes: 'draggable-tooltip xrefPopup', width: { min: 800, max: 800} },
                    show: { event: 'click' }, hide: { event: 'click' },
                    content: {
                        text: function (event, api) {
                            var chosenVersion = version;
                            if (step.keyedVersions[version] && step.keyedVersions[version].category != 'BIBLE') {
                                //get the first version in the current search that is non-commentary
                                var allVersions = _.where(self.model.get("searchTokens"), {itemType: VERSION });
                                chosenVersion = 'ESV';
                                for (var i = 0; i < allVersions.length; i++) {
                                    var keyedVersion = step.keyedVersions[(allVersions[i].item || {}).initials];
                                    if (keyedVersion != null && keyedVersion.category == 'BIBLE') {
                                        chosenVersion = keyedVersion.initials;
                                    }
                                }
                            }

                            $.getSafe(BIBLE_GET_BIBLE_TEXT + chosenVersion + "/" + encodeURIComponent(xref), function (data) {
                                api.set('content.title.text', data.longName);
                                api.set('content.text', data.value.replace(/ strong=['"][GH]\d{1,5}[A-Za-z]?\s?['"]/g, "")); // Strip the strong tag
                                api.set('content.osisId', data.osisId)
                            }).error(function() {
                                changeBaseURL();
                            });
                        },
                        title: { text: xref, button: false }
                    },
                    events: {
                        render: function (event, api) {
                            $(api.elements.titlebar).css("padding-right", "0px");
                            $(api.elements.titlebar)
                                .prepend($('<span class="glyphicon glyphicon-new-window openRefInColumn"></span>')
                                    .click(function () {
                                        step.util.createNewLinkedColumnWithScroll(self.model.get("passageId"), api.get("content.osisId"), true, null, event);
                                    })).prepend($('<button type="button" class="close" aria-hidden="true">X</button>').on('click touchstart', (function () {
										api.hide();
									})));
                        },
                        visible: function (event, api) {
                            var tooltip = api.elements.tooltip;
                            var selector = touch ? ".qtip-title" : ".qtip-titlebar";
                            if (touch) {
                                tooltip.find(".qtip-title").css("width", "90%");
                            }
                            new Draggabilly($(tooltip).get(0), {
                                containment: 'body',
                                handle: selector
                            });
                        }
                    }
                });
                //set to initialized
                $.data(item, "initialised", true);

            });
        }
    }
});
