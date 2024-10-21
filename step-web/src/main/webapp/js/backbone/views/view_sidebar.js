var SidebarView = Backbone.View.extend({
    lastMorphCode: '',
    initialize: function () {
        //hide the help
        step.util.showOrHideTutorial(true);
        _.bindAll(this);
        //create tab container
        // var container = this.$el.find(">div");
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
        if (!step.touchDevice || step.touchWideDevice)
            this.openSidebar();

        //show the correct tab
        this.$el.find("[data-target='#" + this.model.get("mode") + "']").tab("show");

        if (this.model.get("mode") == 'lexicon') {
            this.lexicon.addClass("active");
            //load content
            lastMorphCode = '';
            var strong = this.model.get("strong");
            var currentMorph = this.model.get("morph");
            if ((strong.substring(0,1) === "H") && (typeof currentMorph === "string") && (currentMorph.substring(0,4) !== "TOS:"))
                currentMorph = "TOS:" + currentMorph;
            var curMorphs = step.util.convertMorphOSHM2TOS( currentMorph );
            if (curMorphs != undefined)
                lastMorphCode = curMorphs;
            var morphCount = this.model.get("morphCount");
			var ref = this.model.get("ref");
			var version = this.model.get("version");
			var allVersions = this.model.get("allVersions");
            var variant = this.model.get("variant") || "";
            variant = variant.split(";");
            if (typeof allVersions !== "string") {
                if (typeof version === "string")
                    allVersions = version;
                else {
                    allVersions = step.util.activePassage().get("masterVersion");
                    var extraVersions = step.util.activePassage().get("extraVersions");
                    if ((typeof extraVersions === "string") && (extraVersions !== ""))
                        allVersions += "," + extraVersions;
                }
            }
            if ((typeof version === "undefined") &&
				(typeof ref === "undefined") &&
				(typeof currentMorph === "undefined") &&
				(strong === "H0001")) {
				console.log("MODULE_GET_INFO undefined H0001");
				return;
			}
            strong = step.util.fixStrongNumForVocabInfo(strong, false);
            var callBackCreateDefParams = [ ref, allVersions, variant, morphCount ];
            var callBackLoadDefFromAPIParams = [ version, ref, strong, curMorphs, allVersions, variant, self.createDefinition, morphCount ]; 
            step.util.getVocabMorphInfoFromJson(strong, curMorphs, version, self.createDefinition, callBackCreateDefParams, self.loadDefinitionFromRestAPI, callBackLoadDefFromAPIParams);
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
        return false; // Return false so this will not be called 2 times.s
    },
    loadDefinitionFromRestAPI: function (parameters) {
        var version = parameters[0];
        var ref = parameters[1];
        var strong = parameters[2];
        var morph = parameters[3];
        var allVersions = parameters[4];
        var variant = parameters[5];
        var callBackCreateDef = parameters[6];
        var morphCount = parameters[7];
        $.getSafe(MODULE_GET_INFO, [version, ref, strong, morph, step.userLanguageCode], function (data) {
            callBackCreateDef(data, [ ref, allVersions, variant, morphCount ]);
            //return false;
        }).error(function() {
            if (changeBaseURL())
                $.getSafe(MODULE_GET_INFO, [version, ref, strong, morph, step.userLanguageCode], function (data) {
                    callBackCreateDef(data, [ ref, allVersions, variant, morphCount ]);
                })
        });
        //return false;
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
        if (step.touchDevice && !step.touchWideDevice) {
            this.closeSidebar()
            step.sidebar = null;
        }
    },
    createHelp: function () {
        this.helpView = new ExamplesView({el: this.help});
    },
    createDefinition: function (data, parameters) {
        var ref = parameters[0];
        var allVersions = parameters[1];
        var variant = parameters[2];
        var morphCount = parameters[3];
        var allMorphsForBackButton;
        var allStrongsForBackButton;
        if (!Array.isArray(variant)) variant = [""]; // Initialize in case it is not.
        //get definition tab

        if (this.lexicon.length == 1) {
            if (!Array.isArray(step.historyMorph))
                step.historyMorph = [];
            else if (step.historyMorph.length > 0)
                allMorphsForBackButton = step.historyMorph[step.historyMorph.length - 1];
            if (!Array.isArray(step.historyStrong))
                step.historyStrong = [];
            else if (step.historyStrong.length > 0)
                allStrongsForBackButton = step.historyStrong[step.historyStrong.length - 1];
        }
        else console.log("this lexicon "+this.lexicon.length);

        this.lexicon.detach();
        this.lexicon.empty();
        $('#quickLexicon').remove();
        var headerType = "h4";
        if (!step.touchDevice || step.touchWideDevice) { 
            this.lexicon.append("<h1>");
            headerType = "h2";
        }
        if (data.vocabInfos.length == 0)
            return;
        var urlLang = $.getUrlVar("lang");
        if (urlLang == null) urlLang = "";
        else urlLang = urlLang.toLowerCase();
        var currentUserLang = step.userLanguageCode.toLowerCase();
        if (urlLang == "zh_tw") currentUserLang = "zh_tw";
        else if (urlLang == "zh") currentUserLang = "zh";
        var isOTorNT = "";
        if (typeof ref === "string") {
            if (step.util.getTestamentAndPassagesOfTheReferences([ ref ])[1])
                isOTorNT = "OT";
            else
                isOTorNT = "NT";
        }
        var panelBodies = [];
        var allStrongsForNextBackButton = "";
        // need to handle multiple morphInfo (array)
        if ((lastMorphCode != '') && (data.morphInfos.length == 0) && (lastMorphCode.indexOf('TOS:') == 0))
            data.morphInfos = cf.getTOSMorphologyInfo(lastMorphCode);
        if (data.vocabInfos.length > 1) {
            //multiple entries
            var panelGroup = $('<div class="panel-group" id="collapsedLexicon"></div>');
            for (var i = data.vocabInfos.length - 1; i > -1 ; i--) {
                var item = data.vocabInfos[i];
                var strong = item.strongNumber;
                var isHebrew = strong.substring(0,1) === 'H';
                var panelId = "lexicon-" + strong;
                if (allStrongsForNextBackButton !== "")
                    allStrongsForNextBackButton += " ";
                allStrongsForNextBackButton += strong;
				var currentGloss = item.stepGloss;
				if (currentUserLang === "es") currentGloss += " " + item._es_Gloss;
				else if (currentUserLang === "zh") currentGloss += " " + item._zh_Gloss;
				else if (currentUserLang === "zh_tw") currentGloss += " " + item._zh_tw_Gloss;
				else if (currentUserLang === "km") currentGloss += " " + item._km_Gloss;
                var panelTitle = "<span>" + currentGloss + " (<span class='transliteration'>" + item.stepTransliteration +
                    "</span> - " + '<span class="' + (isHebrew ? 'hbFontSmall' : 'unicodeFont') + '">' + item.accentedUnicode + "</span>)</span>";
                var isIn = (i == 0) ? " in" : "";
                var panelContentContainer = $('<div class="panel-collapse lexmodal ' + panelId + isIn + ' collapse">');
                var panelBody = $('<div class="panel-body"></div>');
                if (!step.touchDevice || step.touchWideDevice)
                	panelContentContainer.append(panelBody);
                this._createBriefWordPanel(panelBody, item, currentUserLang, allVersions);
                var currentVariant = variant[i];
                if ((typeof currentVariant !== "string") && (typeof variant[0] === "string"))
                    currentVariant = variant[0];
                if ((typeof currentVariant === "string") && (currentVariant !== ""))
                    panelBody.append("<div>in " + currentVariant + " manuscript</div>");
                if (i < data.morphInfos.length)
                    this._createBriefMorphInfo(panelBody, data.morphInfos[i]);
                this._createWordPanel(panelBody, item, currentUserLang, allVersions, isOTorNT, headerType, data.morphInfos[i]);
                if (i < data.morphInfos.length)
                    this._createMorphInfo(panelBody, data.morphInfos[i], headerType);
                panelBodies.push(panelBody);
                var panelHeading = '<div class="panel-heading"><h4 class="panel-title" data-toggle="collapse" data-parent="#collapsedLexicon" data-target=".' + panelId +
                    '"><a>' + panelTitle;
                if (i > 0)
                    panelHeading += '<span class="clicktoview"> (click to view)</span>';
                panelHeading += '</a></h4></div>';
                var panel = $('<div class="panel panel-default"></div>').append(panelHeading).append(panelContentContainer);
                panelGroup.append(panel);
            }
            this.lexicon.append(panelGroup);
            var sleepTime = 6000;
            if (typeof step.shownClick === "number") {
                step.shownClick ++;
                sleepTime = Math.max(( sleepTime - (step.shownClick * 300) ), 1500);
            }
            else
                step.shownClick = 1;

            setTimeout(function() { // Need to give time for the input to the sent to the server and also time for the response to come back to the browser.
                $('.clicktoview').remove();
            }, sleepTime);
        }
        else {
            allStrongsForNextBackButton += data.vocabInfos[0].strongNumber;
            var panelBody = $('<div class="panel-body"></div>');
            this._createBriefWordPanel(panelBody, data.vocabInfos[0], currentUserLang, allVersions);
            if (variant[0] !== "")
                panelBody.append("<div>Only in " + variant[0] + " manuscript</div>");
            // need to handle multiple morphInfo (array)
            if (data.morphInfos.length > 0) {
                this._createBriefMorphInfo(panelBody, data.morphInfos[0], morphCount, ref, data.vocabInfos[0].strongNumber);
            }
            this._createWordPanel(panelBody, data.vocabInfos[0], currentUserLang, allVersions, isOTorNT, headerType, data.morphInfos[0]);
            if (data.morphInfos.length > 0) {
                this._createMorphInfo(panelBody, data.morphInfos[0], headerType);
            }
            if ((step.touchDevice) && (!step.touchWideDevice))
	            panelBodies.push(panelBody);
	        else
	        	this.lexicon.append(panelBody);
        }
        if (this.lexicon.length == 1) {
            step.historyMorph.push(lastMorphCode);
            step.historyStrong.push(allStrongsForNextBackButton);
        }
        else console.log("this.lexicon length is " + this.lexicon.length);

		if ((typeof allStrongsForBackButton === "string") && (allStrongsForBackButton !== allStrongsForNextBackButton)) {
            var lexiconElement = $(this.lexicon[0]);
            lexiconElement.prepend("<button id='lexicon-back-button' class='glyphicon glyphicon-arrow-left' title='Back to the definition of the previous word, " + allStrongsForBackButton + "'></button>");
        }

        if (step.touchDevice && !step.touchWideDevice) {
            step.util.showLongAlert(this.lexicon.html(), "<b>" + __s.lexicon_vocab + "</b>", panelBodies);
            this.closeSidebar();
            step.sidebar = null;
        }
        else {
            this.lexicon.find("h1").text(__s.lexicon_vocab);
            this.tabContainer.append(this.lexicon);
        }
        this._initExpandCollapse("detailLex");
        this._initExpandCollapse("LSJLexicon");
        this._initExpandCollapse("GeneralRelatedWords");
        this._initExpandCollapse("GrammarInfo");
        this._isItALocation(data.vocabInfos[0], ref);
        var lexiconBackButtonElement = $("#lexicon-back-button");
        if (lexiconBackButtonElement.length != 1)
            return;
        lexiconBackButtonElement.click(function () {
            if (step.historyMorph.length > 2) {
                step.historyMorph.pop();
                step.historyMorph.pop();
            }
            else step.historyMorph = [];
            if (step.historyStrong.length > 2) {
                step.historyStrong.pop();
                step.historyStrong.pop();
            }
            else step.historyStrong = [];
            // When more than one Strong number, reverse the order.  For example, "H1234 H2345" will be "H2345 H1234"
            var reservedOrderOfStrongs = allStrongsForBackButton.split(" ").reverse().join(" ");
            step.util.ui.showDef(
            {   strong: reservedOrderOfStrongs,
                morph: allMorphsForBackButton,
                version: allVersions.split(" ")[0] } );
        });

    },
    _initExpandCollapse: function (name) {
        if (($("." + name + ":visible").length > 0) || (step.util.localStorageGetItem("sidebar." + name) === "true")) {
            $("." + name).show();
            $("." + name + "Select").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
        }
    },
    _createBriefWordPanel: function (panel, mainWord, currentUserLang) {
        var userLangGloss = "";
        if ((currentUserLang == "es") && (mainWord._es_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._es_Gloss + "&nbsp;";
        else if ((currentUserLang == "zh") && (mainWord._zh_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._zh_Gloss + "&nbsp;";
        else if ((currentUserLang == "zh_tw") && (mainWord._zh_tw_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._zh_tw_Gloss + "&nbsp;";
        else if ((currentUserLang == "km") && (mainWord._km_Gloss != undefined)) userLangGloss = "&nbsp;" + mainWord._km_Gloss + "&nbsp;";
        var strong = mainWord.strongNumber;
        panel.append(
            $("<div>").append($("<span>").addClass(strong[0] === 'H' ? "hbFontSmall" : "unicodeFont")
                .append(mainWord.accentedUnicode))
                .append(" (")
                .append("<span class='transliteration'>" + mainWord.stepTransliteration + "</span>")
                .append(") ")
                .append(mainWord.stepGloss)
                .append(" ")
                .append("<span class='side_gloss_" + strong + "'>" + userLangGloss + "</span> ")
                .append($(" <span title='" + __s.strong_number + "'>").append(" (" + mainWord.strongNumber + ")").addClass("strongNumberTagLine"))
				.append('<span class="possibleMap' + mainWord.strongNumber + '"></span>')
        );
    },

    _addLinkAndAppend: function (panel, textToAdd, currentWordLangCode, bibleVersion, changeBreakToList) {
        // Find all ref tag and change
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
        if (changeBreakToList) {
            var partsBetweenBreak = textToAdd2.split("<br>");
            var orderList = $("<ul>");
            for (var kk = 0; kk < partsBetweenBreak.length; kk ++) {
                var listElmt = $("<li>");
                this._addLinkToStrongWord(listElmt, partsBetweenBreak[kk], currentWordLangCode);
                orderList.append(listElmt);
            }
            panel.append(orderList);
        }
        else
            this._addLinkToStrongWord(panel, textToAdd2, currentWordLangCode);
    },

    _addLinkToStrongWord: function(htmlObj, remainingText, currentWordLangCode) {
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
                htmlObj.append(remainingText.substr(0, pos));  // text before the 4 character code
                htmlObj.append($('<a sbstrong href="javascript:void(0)">')
                    .append(currentMatch)
                    .data("strongNumber", currentStrongNumber));
                remainingText = remainingText.substr(pos + matchLength);
            }
        }
        htmlObj.append(remainingText).append("<br />");
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
                        refURLString += URL_SEPARATOR + "reference=" + refArray2[k];
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
                            step.util.closeModal("showLongAlertModal");
                    }));
                }
                ul.append(li);
            }
            panel.append(ul);
        });
        $.ajaxSetup({async: true});
        return foundChineseJSON;
    },

    _addDetailLexicalWords: function (detailLex, panel, isCurrentWord, totalOT, totalNT, hasBothTestaments, allVersions, bibleVersion) {
        var frequency = parseInt(detailLex[3]); // Just in case it is provided in String instead of number
        panel.append($("<br class='detailLex' style='display:none'>"));
        var spaceWithoutLabel = "&nbsp;&nbsp;&nbsp;";
        if (isCurrentWord) {
            panel.append($("<span class='detailLex glyphicon glyphicon-arrow-right' style='font-size:10px;display:none' ></span>"));
            spaceWithoutLabel = "";
        }
        var aTagElement = $("<a class='detailLex' style='display:none'>" + spaceWithoutLabel + detailLex[0] + " </a>");
        step.searchSelect.addMouseOverEvent("strong", detailLex[1], "", bibleVersion, aTagElement);
        aTagElement.data("strongNumber", detailLex[1]).click(function () {
            step.util.ui.showDef($(this).data("strongNumber"), bibleVersion);
        })
        panel.append(aTagElement);
        panel.append($("<span class='detailLex' style='display:none' title='" + detailLex[1] + " " + detailLex[4] + "'>" + detailLex[2] + "</span>"));
        panel.append($('<span class="detailLex" style="display:none">&nbsp;&nbsp;</span>'));
        var statsOccursMsg = step.util.formatFrequency({versionCountOT: totalOT, versionCountNT: totalNT}, frequency, hasBothTestaments);
        var isHebrew = detailLex[1].substring(0,1) === 'H';
        var vocabTitle = detailLex[2] + " (<span class='transliteration'>" + detailLex[5] + "</span> - " + '<span class="' + (isHebrew ? 'hbFontSmall' : 'unicodeFont') + '">' + detailLex[4] + "</span>)"
        panel.append($("<a title='" + __s.click_to_show_all + "'></a>").attr("onclick", "javascript:void(0)").
              data("strongNumber", detailLex[1]).
              data("vocabTitle", vocabTitle).
              append('<span class="strongCount detailLex" style="unicode-bidi:normal;display:none">~' + statsOccursMsg + '</span>').
              click(function () {
                var strongNumber = $(this).data("strongNumber");
                var args = "strong=" + encodeURIComponent(strongNumber);
                step.util.activePassage().save({strongHighlights: strongNumber}, {silent: true});
                step.router.navigatePreserveVersions(args, false, true);
                step.util.closeModal("showLongAlertModal");
                return false;
              }).
              hover(function (ev) {
                if (step.touchDevice) return;
                var strong = $(this).data("strongNumber");
                var wordInfo = $(this).data("vocabTitle");
                fetch("https://www.stepbible.org/rest/search/masterSearch/version=ESV|" +
                    "strong=" + strong + "/HNVUG///" +
                    strong + "///en?lang=en")
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    step.util.ui.showListOfVersesInQLexArea(data, ev.pageY, wordInfo, $('#columHolder'));
                });
            }, function () { // mouse pointer ends hover (leave)
                if (step.touchDevice) return;
                $("#quickLexicon").remove();
            })
        );
        if (!step.state.isLocal()) {
            panel.append("&nbsp;&nbsp;");
            var freqListElm = step.util.freqListQTip(detailLex[1], detailLex[6], allVersions, detailLex[4], detailLex[5], "detailLex");
            panel.append(freqListElm);
        }
    },

    _composeDescriptionOfOccurrences: function(stepType) {
        if ((typeof stepType !== "string") || (stepType === "") ||
            (stepType === "word") || (stepType === "verb") || (stepType === "name") ||
            ((step.userLanguage !== "English") &                                     // If user language is not English, but it is using the English message,
             ((__s.lexicon_search_for_person === "This person occurs about") || // there is no translation for these two new messages.  Therefore use the original message which is
              (__s.lexicon_search_for_place === "This place occurs about"))) )   // lexicon_search_for_this_word.  That has been translated for many years.
             return __s.lexicon_search_for_this_word;
        if (stepType === "place") return __s.lexicon_search_for_this_place;
        return __s.lexicon_search_for_this_person;
    },

    _appendLexiconSearch: function (panel, mainWord, detailLex, allVersions, bibleVersion) {
        var total = mainWord.count;
        var totalOT = 0;
        var totalNT = 0;
        var totalOTs = [];
        var totalNTs = [];
        var allStrongs = [];
        panel.append("<br />").append(this._composeDescriptionOfOccurrences(mainWord._step_Type));
        if ((detailLex) && (detailLex.length > 0)) {
			allStrongs.push(mainWord.strongNumber);
            for (var i = 0; i < detailLex.length; i++) {
                total += parseInt(detailLex[i][3]); // Just in case it is provided in String instead of number
                if (detailLex[i][1] !== mainWord.strongNumber) {
                    allStrongs.push(detailLex[i][1]);
                    var vocabMorphFromJson = {vocabInfos: [{ strongNumber: detailLex[i][1], freqList: detailLex[i][6]}] };
                }
                else {
                    vocabMorphFromJson = { vocabInfos: [ mainWord ] };
                }
                step.util.lookUpFrequencyFromMultiVersions(vocabMorphFromJson, allVersions);
                var curOT = (typeof vocabMorphFromJson.vocabInfos[0].versionCountOT === "number") ? vocabMorphFromJson.vocabInfos[0].versionCountOT : 0;
                var curNT = (typeof vocabMorphFromJson.vocabInfos[0].versionCountNT === "number") ? vocabMorphFromJson.vocabInfos[0].versionCountNT : 0;
                totalOT += curOT;
                totalNT += curNT;
                totalOTs.push(curOT);
                totalNTs.push(curNT);
            }
            var hasBothTestaments = ((totalOT > 0) && (totalNT > 0));
            var statsOccursMsg = step.util.formatFrequency({versionCountOT: totalOT, versionCountNT: totalNT}, total, hasBothTestaments);
			panel.append($("<a></a>").attr("href", "javascript:void(0)").data("strongNumber", allStrongs).append('<span class="strongCount" style="unicode-bidi:normal"> ' +
               statsOccursMsg + '</span>').click(function () {
				var args = $(this).data("strongNumber");
                    var currentSearch = "strong=" + encodeURIComponent(args[0]);
                    var searchJoins = "";
                    for (var i = 1; i < allStrongs.length; i++) {
                        currentSearch += URL_SEPARATOR + 'strong=' + encodeURIComponent(args[i]);
                        if (i == 1) searchJoins = "srchJoin=(1o2";
                        else searchJoins += "o" + (i+1);
                    }
                    if (allStrongs.length > 1) currentSearch = searchJoins + ")|" + currentSearch;
                    step.router.navigatePreserveVersions(currentSearch, false, true, true);
                    step.util.closeModal("showLongAlertModal");
                    return false;
			    }).
                hover(function() {
                    $('#quickLexicon').remove();
                })           
            );
            panel.append($("<a class='glyphicon glyphicon-triangle-right detailLexSelect'></a>")
                .click(step.util.expandCollapse)
            );
			for (var i = 0; i < detailLex.length; i++) {
                this._addDetailLexicalWords(detailLex[i], panel, (detailLex[i][1] === mainWord.strongNumber), totalOTs[i], totalNTs[i], hasBothTestaments, allVersions, bibleVersion);
			}
        }
        else {
            var data = {vocabInfos: [mainWord]};
            step.util.lookUpFrequencyFromMultiVersions(data, allVersions);
            var countDisplay = step.util.formatFrequency(mainWord, total, false);
            if (countDisplay !== "") {
                var isHebrew = mainWord.strongNumber.substring(0,1) == 'H';
                var vocabTitle = mainWord.stepGloss + " (<span class='transliteration'>" + mainWord.stepTransliteration + "</span> - " + '<span class="' + (isHebrew ? 'hbFontSmall' : 'unicodeFont') + '">' + mainWord.accentedUnicode + "</span>)"
                panel.append($("<a></a>").attr("href", "javascript:void(0)").data("strongNumber", mainWord.strongNumber).data("vocabTitle", vocabTitle).
                    append('<span class="strongCount"> ' + countDisplay + '</span>').click(function () {
                    var strongNumber = $(this).data("strongNumber");
                    var args = "strong=" + encodeURIComponent(strongNumber);
                    step.util.activePassage().save({strongHighlights: strongNumber}, {silent: true});
                    step.router.navigatePreserveVersions(args, false, true);
                    step.util.closeModal("showLongAlertModal");
                    return false;
                }).hover(function (ev) {
                    if (step.touchDevice) return;
                    var strong = $(this).data("strongNumber");
                    var wordInfo = $(this).data("vocabTitle");
                    fetch("https://www.stepbible.org/rest/search/masterSearch/version=ESV|" +
                        "strong=" + strong + "/HNVUG///" +
                        strong + "///en?lang=en")
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        step.util.ui.showListOfVersesInQLexArea(data, ev.pageY, wordInfo, $('#columHolder'));
                    });
                }, function () { // mouse pointer ends hover (leave)
                    if (step.touchDevice) return;
                    $("#quickLexicon").remove();
                })              
                );
                if (!step.state.isLocal()) {
                    panel.append("&nbsp;&nbsp;");
                    var freqListElm = step.util.freqListQTip(mainWord.strongNumber, mainWord.freqList, allVersions, "", "");
                    panel.append(freqListElm);
                }
            }
        }
        panel.append().append('<br />');
        return false;
    },

	_lookUpGeoInfo: function(mainWord, bookName, coordinates) {
		bookName = bookName.substring(0, bookName.length - 1);
		var possibleMapElement = $(".possibleMap" + mainWord.strongNumber);
		if (possibleMapElement.length == 0) {
			console.log ("cannot find possible Map ID in html");
			// add a sleep here
			possibleMapElement = $(".possibleMap" + mainWord.strongNumber);
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

    _prepIndentNTDef: function(mediumDef) {
        var parts = mediumDef.split(/<ref/i);
        var pos = parts[0].indexOf(";");
        var addedLineBreaks = false;
        if (pos > -1) {
            parts[0] = parts[0].replace(/;/g, ";<br>");
            addedLineBreaks = true;
        }
        for (var ii = 1; ii < parts.length; ii++ ) {
            partsInRef = parts[ii].split("</ref>");
            if (partsInRef.length > 2) {
                console.log("more than 2 parts " + ii + " " + parts[ii] + " " + mainWord.mediumDef);
                continue;
            }
            if (partsInRef.length == 2) {
                var pos = partsInRef[1].indexOf(";");
                if (pos > -1) {
                    if (partsInRef[1].trim().length > 1) {
                        parts[ii] = partsInRef[0] + "</ref>" + partsInRef[1].replace(/;/g, ";<br>");
                        addedLineBreaks = true;
                    }
                }
            }
        }
        if (addedLineBreaks) {
            var result = "";
            for (var jj = 0; jj < parts.length; jj++ ) {
                if (jj > 0) 
                    result += "<ref";
                result += parts[jj]
            }
            return [ addedLineBreaks, 
                result.replace(/<br \/>/gi, "<br>").replace(/<br>\s*<br>/gi, "<br>").replace(/<br>\s*<br>/gi, "<br>") ];
        }
        return [ addedLineBreaks, mediumDef ];
    },

    _indentOTDefinition: function(origMediumDef, stem) {
        var lines = origMediumDef.split(/<br>/i);
        var updtMedDef = "";
        var foundNumOfStem = "";
        for (var i = 0; i < lines.length; i ++ ) {
            var foundStem = false;
            if ((stem !== "") && (lines[i].indexOf(stem) > -1)) { 
                foundStem = true;
            }
            var pos = lines[i].indexOf(")");
            var highlightLinesOnSameStem = false;
            var left = 0;
            if ((pos > 1) && (pos < 6) && (!isNaN(lines[i].charAt(0))) && (lines[i].substring(0, pos).indexOf("(") == -1)) {
                if (foundStem)
                    foundNumOfStem = lines[i].substring(0, pos);
                else if ((foundNumOfStem !== "") && (lines[i].indexOf(foundNumOfStem) == 0))
                    highlightLinesOnSameStem = true;
                left = (pos - 1) * 8;
            }
            if (foundStem || highlightLinesOnSameStem)
                lines[i] = "<b>" + lines[i] + "</b>";
            updtMedDef += '<p style="margin-bottom:0px;margin-left:' + left + 'px">' + lines[i] + '</p>';
        }
        return updtMedDef;
    },
	
    _createWordPanel: function (panel, mainWord, currentUserLang, allVersions, isOTorNT, headerType, morphInfo) {
        var currentWordLanguageCode = mainWord.strongNumber[0];
        var bibleVersion = this.model.get("version") || "ESV";
        if (typeof mainWord.shortDef === "string") {
            if ((typeof mainWord.mediumDef !== "string") ||
                (mainWord.shortDef.length < 3) ||
                (mainWord.mediumDef.indexOf(mainWord.shortDef) == -1) )
                this._addLinkAndAppend(panel.append($("<div>")), mainWord.shortDef, currentWordLanguageCode, bibleVersion);
        }
		var detailLex = [];
		if (mainWord._stepDetailLexicalTag) {
			detailLex = (typeof mainWord._stepDetailLexicalTag === "string") ? 
                JSON.parse(mainWord._stepDetailLexicalTag) : mainWord._stepDetailLexicalTag;
		}
        this._appendLexiconSearch(panel, mainWord, detailLex, allVersions, bibleVersion);
        var displayEnglishLexicon = true;
        var foundChineseJSON = false;

        if (currentUserLang.indexOf("es") == 0) {
            // displayEnglishLexicon = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isEnWithEsLexicon") ||
									// false;
            var spanishDef = mainWord._es_Definition;
            if (spanishDef) {
                panel.append($("<" + headerType + " style='margin-top:8px'>").append(__s.es_lexicon_meaning));
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
                panel.append($("<" + headerType + " style='margin-top:8px'>").append(__s.zh_lexicon_meaning_fhl));
                this._addLinkAndAppend(panel, chineseDef, currentWordLanguageCode, bibleVersion);
            }
            var useSecondZhLexicon = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isSecondZhLexicon");
            if (useSecondZhLexicon)
                foundChineseJSON = this._addChineseDefinitions(panel, mainWord, currentUserLang, bibleVersion, this._addLinkAndAppend);
        }
		else if (currentUserLang == "vi") {
			var vietnameseDef = mainWord._vi_Definition;
			if (vietnameseDef) {
				panel.append($("<" + headerType + " style='margin-top:8px'>").append("Từ điển Hy Lạp-Việt"));
                this._addLinkAndAppend(panel, vietnameseDef, currentWordLanguageCode, bibleVersion);
            }
		}
		else if (currentUserLang == "km") {
			var khmerDef = mainWord._km_Definition;
			if (khmerDef) {
				panel.append($("<" + headerType + " style='margin-top:8px'>").append("និយមន័យ"));
                this._addLinkAndAppend(panel, khmerDef, currentWordLanguageCode, bibleVersion);
            }
		}
        var firstLetterOfStrong = mainWord.strongNumber.charAt(0);
        if (step.defaults.langWithTranslatedLex.indexOf(currentUserLang) > -1) {
            var function1ToCall = this._addLinkAndAppend;
            var function2ToCall = (firstLetterOfStrong === "G") ? this._prepIndentNTDef : this._indentOTDefinition;
            fetch("https://us.stepbible.org/html/lexicon/" + currentUserLang + "_json/" +
                mainWord.strongNumber + ".json")
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var gloss = data.gloss;
                var pos = gloss.indexOf(":");
                if (pos > -1)
                    gloss = gloss.substring(pos+1);
                step.util.updateWhenRendered(".side_gloss_" + data.strong, "[" + gloss.trim() + "]", 0);
                if (!isNaN(data.page)) {
                    var newPage = data.page + 14;
                    panel.append('<a href="https://gallica.bnf.fr/ark:/12148/bpt6k6507608z/f' + newPage + 
                                '.item" target="_blank">Dictionnaire hébreu-français...</a>')
                        .append('&nbsp;&nbsp;')
                        .append('<a style="font-size:14px" class="glyphicon glyphicon-picture" href="https://gallica.bnf.fr/ark:/12148/bpt6k6507608z/f' + newPage + 
                    '.highres" target="_blank"></a>')
                        .append('<br>');
                }
                panel.append($("<" + headerType + " style='margin-top:8px'>").append(__s.meaning + " (Google translate)"));
                var def = function2ToCall(data.def);
                var addLineBreaks = false;
                if (data.strong.charAt(0) === "G") {
                    def = def[1];
                    addLineBreaks = def[0];
                }
                function1ToCall(panel, def, currentWordLanguageCode, bibleVersion, addLineBreaks);
            });
        }
        if (displayEnglishLexicon) { // This might be false if Chinese lexicon is displayed and isEnWithZhLexicon is false append the meanings
            if (mainWord.mediumDef) {
                var message = "";
                if (isOTorNT === "OT")
                    message = "based on abridged Brown-Driver-Briggs";
                else if (isOTorNT === "NT")
                    message = "based on Teknia Greek";
                panel.append($("<" + headerType + " style='margin-top:8px' title='" + message + "'>").append(__s.lexicon_meaning));
                var addedLineBreaks = false;
                if (firstLetterOfStrong === "H") {
                    var stem = "";
                    if ((typeof morphInfo === "object") && (typeof morphInfo.stem === "string")) {
                        stem = "(" + morphInfo.stem.charAt(0).toUpperCase() + morphInfo.stem.substring(1) + ")";
                    }
                    mainWord.mediumDef = this._indentOTDefinition(mainWord.mediumDef, stem);
                }
                else if (firstLetterOfStrong === "G") {
                    var results = this._prepIndentNTDef(mainWord.mediumDef);
                    addedLineBreaks = results[0];
                    mainWord.mediumDef = results[1];
                }
                this._addLinkAndAppend(panel, mainWord.mediumDef, currentWordLanguageCode, bibleVersion, addedLineBreaks);
            }
            //longer definitions
            if (mainWord.lsjDefs) {
                panel.append($("<" + headerType + " style='margin-top:8px' title='based on Liddell-Scott-Jones Greek Lexicon, 9th ed'>")
                    .append(currentWordLanguageCode.toLowerCase() === 'g' ? __s.lexicon_lsj_definition : __s.lexicon_bdb_definition)
                    .append($("<a style='font-size:14px' class='glyphicon glyphicon-triangle-right LSJLexiconSelect'></a>")
                        .click(step.util.expandCollapse)
                    )
                );
                panel.append('<span class="LSJLexicon unicodefont" style="display:none">' + mainWord.lsjDefs + '</span>');
            }
        }
		
		relatedNosToDisplay = this._relatedNosNotDisplayed(mainWord.relatedNos, detailLex);
        if (relatedNosToDisplay.length > 0) {
            panel.append($("<" + headerType + " style='margin-top:8px'>").append(__s.lexicon_related_words)
                .append($("<a style='font-size:14px' class='glyphicon glyphicon-triangle-right GeneralRelatedWordsSelect'></a>")
                    .click(step.util.expandCollapse)
                )
            );
            var ul = $('<ul class="GeneralRelatedWords" style="display:none">');
            var matchingExpression = "";
            for (var i = 0; i < relatedNosToDisplay.length; i++) {
                var curStrong = relatedNosToDisplay[i].strongNumber;
                if (curStrong != mainWord.strongNumber) {
                    var userLangGloss = "";
                    var englishGloss = relatedNosToDisplay[i].gloss;
                    if ((currentUserLang == "es") && (relatedNosToDisplay[i]._es_Gloss != undefined)) userLangGloss = " [" + relatedNosToDisplay[i]._es_Gloss + "]";
                    else if ((currentUserLang == "zh") && (relatedNosToDisplay[i]._zh_Gloss != undefined)) userLangGloss = " [" + relatedNosToDisplay[i]._zh_Gloss + "]";
                    else if ((currentUserLang == "zh_tw") && (relatedNosToDisplay[i]._zh_tw_Gloss != undefined)) userLangGloss = " [" + relatedNosToDisplay[i]._zh_tw_Gloss + "]";
                    else if ((currentUserLang == "km") && (relatedNosToDisplay[i]._km_Gloss != undefined)) userLangGloss = " [" + relatedNosToDisplay[i]._km_Gloss + "]";
                    else if (step.defaults.langWithTranslatedLex.indexOf(currentUserLang) > -1) userLangGloss = " <span class='rel_gloss_" + relatedNosToDisplay[i].strongNumber + "'></span>";
                    var li = "";
                    if ((!relatedNosToDisplay[i]._searchResultRange) || (relatedNosToDisplay[i]._searchResultRange === "")) {
                        var fontClass = "";
                        var firstChar = curStrong.substr(0, 1).toLowerCase();
                        if (firstChar === "h") fontClass = "hbFontMini";
                        else if (firstChar === "g") fontClass = "unicodeFont";
                        li = $("<li title='" + curStrong + "'></li>").append($('<a sbstrong onclick="javascript:void(0)">')
                            .append(englishGloss)
                            .append(userLangGloss)
                            .append(" (")
                            .append("<span class='transliteration'>" + relatedNosToDisplay[i].stepTransliteration + "</span>")
                            .append(" - ")
                            .append("<span class='" + fontClass + "'>" +
                                relatedNosToDisplay[i].matchingForm +
                                '</span>')
                            .append(")")
                            .data("strongNumber", curStrong));
                    }
                    else {
                        li = $("<li title='" + relatedNosToDisplay[i].strongNumber + " " +
                                relatedNosToDisplay[i].stepTransliteration + " " +
                                relatedNosToDisplay[i].matchingForm +
                                "'></li>").append($('<a sbstrong onclick="javascript:void(0)">')
							.append(englishGloss)
                            .append(userLangGloss)
                            .append(step.util.formatSearchResultRange(relatedNosToDisplay[i]._searchResultRange, false))
                            .data("strongNumber", curStrong));                        
                    }
                    ul.append(li);
                    matchingExpression += relatedNosToDisplay[i].strongNumber + " ";
                    if (step.defaults.langWithTranslatedLex.indexOf(currentUserLang) > -1) {
	                    fetch("https://us.stepbible.org/html/lexicon/" + currentUserLang + "_json/" +
	                        curStrong + ".json")
	                    .then(function(response) {
	                        return response.json();
	                    })
	                    .then(function(data) {
	                        var gloss = data.gloss;
	                        var pos = gloss.indexOf(":");
	                        if (pos > -1)
	                            gloss = gloss.substring(pos+1);
	                        step.util.updateWhenRendered(".rel_gloss_" + data.strong, "[" + gloss.trim() + "]", 0);
	                    });
                    }
                }
            }
            step.passage.highlightStrong(null, matchingExpression, "lexiconRelatedFocus");
            panel.append(ul);
        }
        panel.find("[sbstrong]").click(function () {
            step.util.ui.showDef($(this).data("strongNumber"), bibleVersion);
        });
        if (!step.touchDevice) {
            panel.find("[sbstrong]").hover(function (ev) {
                if (ev.type === "mouseleave") {
                    $('#quickLexicon').remove();
                    return;
                }
                var searchString = $(this).data("strongNumber");
                require(['quick_lexicon'], function () {
                    step.util.delay(function () {
                        // do the quick lexicon
                        step.util.ui.displayNewQuickLexiconForVerseVocab(searchString, '', '', bibleVersion, step.util.activePassageId(), ev, ev.pageY, null, "");
                    }, MOUSE_PAUSE, 'show-quick-lexicon');
                });
            },
            function () { // mouse pointer ends hover (leave)
                step.util.delay(undefined, 0, 'show-quick-lexicon');
                $("#quickLexicon").remove();
            });
        }
        if ((foundChineseJSON) && (!step.state.isLocal())) 
            panel.append("<br><a href=\"lexicon/additionalinfo/" + mainWord.strongNumber + ".html" +
                "\" target=\"_blank\">" +
                __s.zh_additional_zh_lexicon_info + "</a>");
        this._doSideNotes(panel, bibleVersion);
    },
    // for one-line morphology
    _createBriefMorphInfo: function (panel, info, morphCount, ref, strongNum) {
        if ((typeof info === "undefined") || (Object.keys(info).length === 0)) {
            // panel.append("<br />");
            return;
        }
        panel.append("(");
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
        panel.append(")");
        if (morphCount > 1) {
            if ((typeof ref === "string") && (ref !== "") && (typeof strongNum === "string") &&
                ((strongNum.substring(0,1) === "G") || (strongNum.substring(0,1) === "H"))) {
                panel.append(" - 1st of ");
                var version = (strongNum.substring(0,1) === "G") ? "THGNT" : "OHB";
                strongNum = step.util.fixStrongNumForVocabInfo(strongNum, true);
                panel.append("<a href='https://www.stepbible.org/?q=version=" + version + URL_SEPARATOR + "reference=" + ref + 
                    URL_SEPARATOR + "strong=" + strongNum + "&clickStrong' target='_blank'>" + morphCount + " different grammars</a>");
            }
            else
                panel.append(" - 1st of " + morphCount + "  different grammars");
            panel.append(" for this word in this verse.");
        }
        panel.append("<br />");
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
    _createMorphInfo: function (panel, info, headerType) {
        if (typeof info === "undefined") {
            panel.append("<br />");
            return;
        }
        // Updated the order of the display so that it matches the order of the robinson code
        panel.append($("<" + headerType + " style='margin-top:8px'>").append(__s.display_grammar)
            .append($("<a style='font-size:14px' class='glyphicon glyphicon-triangle-right GrammarInfoSelect'></a>")
                .click(step.util.expandCollapse)
            )
        );
        this.renderMorphItem(panel, info, __s.lexicon_grammar_language, "language");
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
        panel.append("<br class='GrammarInfo' style='display:none;line-height:4px'/>"); // Adding a full line is too much so a shorter line.
        if (info["explanation"] != undefined) {
            panel.append($("<span class='GrammarInfo' style='font-weight:bold;display:none'>").append(__s.lexicon_ie + ": "))
                .append($("<span class='GrammarInfo' style='display:none'>").append(this.replaceEmphasis(info["explanation"])))
                .append("<br class='GrammarInfo'/>");
        }
        if (info["description"] != undefined)
            panel.append($("<span class='GrammarInfo' style='font-weight:bold;display:none'>").append(__s.lexicon_eg + ": "))
                .append($("<span class='GrammarInfo' style='display:none'>").append(this.replaceEmphasis(info["description"])));
    },
    renderMorphItem: function (panel, morphInfo, title, param) {
        if (morphInfo && param && morphInfo[param]) {
			var morphValue = this.replaceEmphasis(morphInfo[param]);
			var local_var_name = morphValue.toLowerCase().replace(/ /g, "_");
            if ((typeof __s[local_var_name] === "string") && (__s[local_var_name].trim().toLowerCase() !== morphValue.trim().toLowerCase()))
			    morphValue += " (" + __s[local_var_name] + ")"; // If the international language definition has that name/value defined, use it
            var htmlValue = $("<span class='GrammarInfo' style='display:none'>" + morphValue + "</span>");
            panel.append($("<span class='GrammarInfo' style='font-weight:bold;display:none'>").append(title + ": ")).append(htmlValue);
            if (morphInfo[param + "Explained"] || param == 'wordCase' && morphInfo["caseExplained"]) {
                var explanation = morphInfo[param + "Explained"] || param == 'wordCase' && morphInfo["caseExplained"];
                htmlValue.attr("title", this.stripEmphasis(explanation));
            }
            panel.append("<br class='GrammarInfo' style='display:none'/>");
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
            '<li><a class="stepglyph-help glyphicon glyphicon-question-sign" title="<%= __s.frequently_asked_questions %>" data-toggle="tab" data-target="#help"></li>' +
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
