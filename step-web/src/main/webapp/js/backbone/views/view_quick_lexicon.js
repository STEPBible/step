var QuickLexicon = Backbone.View.extend({
    templateHeader: '<div id="quickLexicon" style="position:fixed"><div>' +
        '<div>' +
        '<button type="button" class="close" aria-hidden="true">X</button>',
    templateFooter: '</div>',
    templateDef: '<%= view.templateHeader %>' +
        '<% _.each(data, function(item, data_index) { %>' +
        '<div><h1 style="line-height:1;margin-bottom:0">' +
        '<%= item.stepGloss %>' +
        '<% var urlLang = $.getUrlVar("lang") || ""; %>' +
        '<% urlLang = urlLang.toLowerCase(); %>' +
        // '<% var currentEnWithEsLexiconSetting = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isEnWithEsLexicon"); %>' +
        // '<% if (currentEnWithEsLexiconSetting == undefined) currentEnWithEsLexiconSetting = false; %>' +
		'<% if ((currentLang.indexOf("es") == 0) && (item._es_Gloss != undefined)) { %><span>,&nbsp;[<%= item._es_Gloss %>]</span> <% } %>' +
		'<% if ((currentLang.indexOf("km") == 0) && (item._km_Gloss != undefined)) { %><span>,&nbsp;[<%= item._km_Gloss %>]</span> <% } %>' +
        '<% if (" fr de pt ".indexOf(currentLang) > -1) { %>&nbsp;<span class="quick_gloss_<%= item.strongNumber %>"><%= "&nbsp;".repeat(Math.ceil(item.stepGloss.length*1.5)) %></span> <% } %>' +
        '<% if (urlLang === "zh_tw") { currentLang = "zh_tw"; } else if (urlLang === "zh") { currentLang = "zh"; } %>' +
        '<% var currentEnWithZhLexiconSetting = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("isEnWithZhLexicon"); %>' +
        '<% if (currentEnWithZhLexiconSetting === undefined) currentEnWithZhLexiconSetting = false; %>' +
        '<% if ( (currentLang === "zh_tw") && (item._zh_tw_Gloss != undefined) ) { %><span>&nbsp;[<%= item._zh_tw_Gloss %>]</span> <% } else if ( (currentLang === "zh") && (item._zh_Gloss != undefined) ) { %><span>&nbsp;[<%= item._zh_Gloss %>]</span> <% } %>' +
        '&nbsp;(<span class="transliteration"><%= item.stepTransliteration %></span> - ' +
        '<span class="<%= fontClass %>"><%= item.accentedUnicode %></span>) ' +
        '</h1> ' +
        '<% if ( (currentLang === "es") && (item._es_Definition != undefined) ) { %><div class="mediumDef"><%= item._es_Definition %></div><% } %>' +
        '<% if ( (currentLang === "km") && (item._km_Definition != undefined) ) { %><div class="mediumDef"><%= item._km_Definition %></div><% } %>' +
        '<% if ( (currentLang === "zh_tw") && (item._zh_tw_Definition != undefined) ) { %><div class="mediumDef"><%= item._zh_tw_Definition %></div> <% } else if ( (currentLang == "zh") && (item._zh_Definition != undefined) ) { %><div class="mediumDef"><%= item._zh_Definition %></div> <% } %>' +
        '<% if ( (currentLang === "vi") && (item._vi_Definition != undefined) ) { %><div class="mediumDef"><%= item._vi_Definition %></div> <% } %>' +
        // '<% if ((currentEnWithZhLexiconSetting) || (currentEnWithEsLexiconSetting) || ( (!currentLang.indexOf("zh") == 0) && (!currentLang.indexOf("es") == 0))) { %>' +
        '<% if ((currentEnWithZhLexiconSetting) || (!currentLang.indexOf("zh") == 0)) { %>' +
            '<span class="shortDef"><%= item.shortDef == undefined ? "" : item.shortDef %></span>' +
            '<% if ((item.mediumDef != undefined) && (item.mediumDef !== "")) { %><div class="mediumDef"><%= item.mediumDef %></div> <% } %>' +
        '<% } %>' +
        '<% if (" fr de pt ".indexOf(currentLang) > -1) { %><div class="quick_def_<%= item.strongNumber %>" class="mediumDef"><%= "&nbsp;".repeat(Math.ceil(item.mediumDef.length*3)) %></div> <% } %>' +
        '<% var showClickWord = false; %>' +
        '<% if ((item.versionCountOT != null) && (item.versionCountNT != null)) { showClickWord = true; %><span class="strongCount"> (<%= sprintf(__s.stats_occurs_times_in_specific_ot_nt_bible, item.versionCountOT, item.versionCountNT, view.version) %>.) <% } %>' +
        '<% if ((item.versionCountOT != null) && (!showClickWord)) { showClickWord = true; %><span class="strongCount"> (<%= sprintf(__s.stats_occurs_times_in_specific_bible, item.versionCountOT, view.version) %>.) <% } %>' +
        '<% if ((item.versionCountNT != null) && (!showClickWord)) { showClickWord = true; %><span class="strongCount"> (<%= sprintf(__s.stats_occurs_times_in_specific_bible, item.versionCountNT, view.version) %>.) <% } %>' +
        '<% if ((item.count != null) && (!showClickWord)) { showClickWord = true; %><span class="strongCount"> (<%= sprintf(__s.stats_occurs_times_in_bible, item.count) %>.)<% } %>' +
        '<% if (brief_morph_info[data_index] != null) { %> ' +
		',&nbsp;&nbsp;<span><%= brief_morph_info[data_index] %></span> ' +
        '<% var currentVariant = view.variant[data_index]; %> ' +
        '<% if ((typeof currentVariant !== "string") && (typeof view.variant[0] === "string")) currentVariant = view.variant[0]; %> ' +
        '<% if ((typeof currentVariant === "string") && (currentVariant !== "")) { %> <span>, (in <%= currentVariant %> manuscript)</span> <% } %>' +
        '<% if (showClickWord) { %> - <span class="clickMoreInfo"><%= __s.more_info_on_click_of_word %></span></span> <% } %>' +
        '</div>' +
		'<% } %>' +
        '<% }); %>' +
        '<%= view.templatedFooter %>',
    templateDef2: '<%= view.templateHeader %>' +
		'&nbsp;&nbsp;<span><%= brief_morph_info[0] %></span> ' +
        '<%= view.templatedFooter %>',
    lastMorphCode: '',
    initialize: function (opts) {
        this.text = opts.text;
        this.reference = opts.reference;
        this.version = opts.version;
        this.strong = opts.strong;
        this.morph = opts.morph;
        this.position = opts.position;
        this.height = opts.height;
        this.type = opts.type;
        this.morphCount = opts.morphCount;
        this.touchEvent = opts.touchEvent || false;
        this.passageContainer = step.util.getPassageContainer(opts.target);
        if (typeof opts.variant !== "string")
            opts.variant = "";
        this.variant = opts.variant.split(";");
        if(this.passageContainer.length == 0)
            this.passageContainer = step.util.getPassageContainer(opts.passageId);
        this.render();
    },

    processQuickInfo: function (origData, parameters) {
        var self = parameters[0];
        var strongsNotToDisplay = parameters[1];
        var multipleStrongTextFromSearchModal  = parameters[2];
        var morphCount = parameters[3];
        $("#quickLexicon").remove();
        var morphOnly = false;
        var data = JSON.parse(JSON.stringify(origData));
        var trailerLineForStrongsNotDisplay = "";
        var numOfWordNotDisplayed = 0;
        if (typeof multipleStrongTextFromSearchModal !== "string")
            multipleStrongTextFromSearchModal = "";
        for (counter = origData.vocabInfos.length - 1; counter >= 0; counter --) {
            if (typeof origData.vocabInfos[counter] !== "object")
                continue;
            var item = origData.vocabInfos[counter];
            if ((strongsNotToDisplay.indexOf(item.strongNumber) > -1) || (multipleStrongTextFromSearchModal !== "")) {
                if (data.vocabInfos[counter].accentedUnicode !== "") {
                    if (trailerLineForStrongsNotDisplay !== "")
                        trailerLineForStrongsNotDisplay += ", ";
                    trailerLineForStrongsNotDisplay += "<span style='font-size:12px' class='";
                    if (data.vocabInfos[counter].strongNumber.substring(0,1) === "H")
                        trailerLineForStrongsNotDisplay += "hbFontSmall";
                    else
                        trailerLineForStrongsNotDisplay += "unicodeFont";
                    trailerLineForStrongsNotDisplay += "'>" + data.vocabInfos[counter].accentedUnicode + "</span>";
                    if (data.vocabInfos[counter].stepTransliteration !== "")
                        trailerLineForStrongsNotDisplay += " (<span class='transliteration'>" + data.vocabInfos[counter].stepTransliteration + "</span>)";
                    trailerLineForStrongsNotDisplay += " " + data.vocabInfos[counter].strongNumber;
                }
                data.vocabInfos.splice(counter, 1);
                if (origData.vocabInfos.length == origData.morphInfos.length)
                    data.morphInfos.splice(counter, 1);
                numOfWordNotDisplayed ++;
            }
        }
        if ((data.vocabInfos.length == 0) && (lastMorphCode !== '') && (lastMorphCode !== 'TOS:') && (data.morphInfos.length == 0)) morphOnly = true;
        if ((data.vocabInfos.length > 0) || (morphOnly) || (multipleStrongTextFromSearchModal !== "")) {
            var morph_information = [];
            if ((lastMorphCode != '') && (data.morphInfos.length == 0)) {
                data.morphInfos = cf.getTOSMorphologyInfo(lastMorphCode);
            }
            for (counter = 0; counter < data.morphInfos.length; counter ++) {
                var item = data.morphInfos[counter];
                if (item) morph_information[counter] = self._createBriefMorphInfo(item);
            }
            var lexicon;
            var currentUserLang = step.userLanguageCode.toLowerCase();
            if (morphOnly)
                lexicon = $(_.template(self.templateDef2)({ brief_morph_info: morph_information, view: self }));
            else if (multipleStrongTextFromSearchModal !== "") {
                lexicon = $(_.template(self.templateDef2)({ brief_morph_info: [ "<span class='mediumDef'>" +
                    multipleStrongTextFromSearchModal + ":</span><div class='mediumDef'>&nbsp;&nbsp;" + trailerLineForStrongsNotDisplay + "</div>" ]
                    , view: self }));
                trailerLineForStrongsNotDisplay = "";
            }
            else {
                step.util.getFrequency(self.version, data);
                for (var i = 0; i < data.vocabInfos.length; i++) {
                    if (typeof data.vocabInfos[i].mediumDef === "string") {
                        if ((typeof data.vocabInfos[i].shortDef === "string") && (data.vocabInfos[i].shortDef.length > 2)) {
                            var pos = data.vocabInfos[i].mediumDef.indexOf(data.vocabInfos[i].shortDef);
                            if (pos > -1)
                                data.vocabInfos[i].mediumDef = data.vocabInfos[i].mediumDef.substring(0, pos - 1) + data.vocabInfos[i].mediumDef.substring(pos + data.vocabInfos[i].shortDef.length);
                        }
                        data.vocabInfos[i].mediumDef = data.vocabInfos[i].mediumDef.replace(/<br>/g, "  ").replace(/<br \/>/g, "  ").trim();
                    }
                }
                if (morphCount > 1)
                    morph_information[0] += " - 1st of " + morphCount + " different grammar for this word in this verse.";
                lexicon = $(_.template(self.templateDef)({ data: data.vocabInfos,
                    brief_morph_info: morph_information,
                    fontClass: step.util.ui.getFontForStrong(self.strong),
                    view: self,
                    currentLang: currentUserLang
                }));
            }
            if (step.touchDevice) $(lexicon).find(".clickMoreInfo").text(__s.more_info_on_touch_of_word);
            if ((self.position / self.height) > 0.4)
                lexicon.css({"top": "0", "bottom": "auto"});
            if (trailerLineForStrongsNotDisplay !== "") {
                trailerLineForStrongsNotDisplay = "<br>" + numOfWordNotDisplayed + " words are also tagged here but not displayed: " + 
                   trailerLineForStrongsNotDisplay +
                    ".  Click on the word again for more information."
                $(lexicon).find(".clickMoreInfo").html(trailerLineForStrongsNotDisplay);
            }
            if (step.touchDevice) {
                if ((step.strongOfLastQuickLexicon == self.strong) && (step.touchForQuickLexiconTime > 0)) {
                    var timeToWait = Math.max(0, (TOUCH_CANCELLATION_TIME) - (Date.now() - step.touchForQuickLexiconTime));
                    var previoustouchForQuickLexiconTime = step.touchForQuickLexiconTime;
                    var timer = setTimeout( function( ) { 
                        if ((step.strongOfLastQuickLexicon == self.strong) && // Make sure user has not touched another word after the timeout
                            (previoustouchForQuickLexiconTime == step.touchForQuickLexiconTime)) {
                            step.passage.removeStrongsHighlights(undefined, "primaryLightBg relatedWordEmphasisHover lexiconFocus lexiconRelatedFocus secondaryBackground");
                            step.displayQuickLexiconTime = Date.now();
                            step.passage.higlightStrongs({
                                passageId: undefined,
                                strong: self.strong,
                                morph: self.morph,
                                classes: "primaryLightBg"
                            });
							var augStrongNum = ((data.vocabInfos[0].strongNumber) && (self.strong !== data.vocabInfos[0].strongNumber)) ? data.vocabInfos[0].strongNumber : "";
                            self.displayQuickDef(lexicon, "Quick Lexicon", augStrongNum);
                            for (var i = 0; i < (data.vocabInfos || []).length; i++) {
                                self.showRelatedNumbers(data.vocabInfos[i].rawRelatedNumbers);
                            }
                            if (step.lastTapStrong.substr(0,12) === "notdisplayed") step.lastTapStrong = step.lastTapStrong.substr(12);
                        }
                      },
                      timeToWait);
                }
            }
            else {
                self.displayQuickDef(lexicon, "Quick Lexicon");
                for (var i = 0; i < (data.vocabInfos || []).length; i++) {
                    if (data.vocabInfos[i] == null)
                        continue;
                    self.showRelatedNumbers(data.vocabInfos[i].rawRelatedNumbers);
                }
            }
            if (" fr de pt ".indexOf(currentUserLang) > -1) {
                for (var i = 0; i < (data.vocabInfos || []).length; i++) {
                    var curStrong = data.vocabInfos[i].strongNumber;
                    fetch("https://us.stepbible.org/html/lexicon/" + currentUserLang + "_json/" +
                        curStrong + ".json")
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        var gloss = data.gloss;
                        var pos = gloss.indexOf(":");
                        if (pos > -1)
                            gloss = gloss.substring(pos+1).trim();
                        gloss = "[" + gloss + "]";
                        var quickGlossElm = $(".quick_gloss_" + data.strong);
                        if (quickGlossElm.length > 0)
                            quickGlossElm.text(gloss);
                        else // The HTML element has not been rendered.  Wait
                            step.util.delay(function () {
                                $(".quick_gloss_" + data.strong).text(gloss);
                            }, 500, 'foreign-lang-gloss');
                        var def = data.def.replace(/<\s?br\s?>/g, "  ").replace(/<\s?br \/>/g, "  ").trim();
                        var quickDefElm = $(".quick_def_" + data.strong);
                        if (quickDefElm.length > 0)
                            quickDefElm.html(def);
                        else // The HTML element has not been rendered.  Wait
                            step.util.delay(function () {
                                $(".quick_def_" + data.strong).html(def);
                            }, 500, 'foreign-lang-def');
                    });
                }
            }
        }
    },
    
    loadDefinition: function () {
        var self = this;
        lastMorphCode = '';
        var strongNumbers = this.strong.split(" ");
        if (strongNumbers.length == 1)
            strongNumbers = this.strong.split(",");
//        if ((typeof this.morph !== "undefined") && (this.morph.indexOf('TOS:') == 0)) {
        if ((typeof this.morph === "string") && (strongNumbers.length > 0) && (strongNumbers[0].substring(0, 1) === "H")) {
            if (this.morph.substring(0, 4) !== "TOS:")
                this.morph = "TOS:" + this.morph;
            lastMorphCode = this.morph;
        }
		if ((typeof self.reference === "string") && (typeof self.strong === "string"))
			step.previousSideBarLexiconRef = [self.strong, self.reference];
        var strongsToUse = "";
        var strongsNotToDisplay = "";
        if (strongNumbers.length > 0) {
            strongsToUse = strongNumbers[0];
            for ( var i = 1; i < strongNumbers.length; i++) {
                if (step.util.suppressHighlight(strongNumbers[i]))
                    strongsNotToDisplay += " " + strongNumbers[i];
                strongsToUse += " " + strongNumbers[i];
            }
        }
        if (self.reference !== "") { // The verse vocabulary does not provide a reference so take the provided strong numbers.
		    strongsToUse = step.util.fixStrongNumForVocabInfo(strongsToUse, false);
            strongsNotToDisplay = step.util.fixStrongNumForVocabInfo(strongsNotToDisplay, false);
        }
        var multipleStrongText = (typeof self.options.txtForMultiStrong === "string") ? self.options.txtForMultiStrong : "";
        var callBackCreateDefParams = [ self, strongsNotToDisplay, multipleStrongText, this.morphCount ];
        var callBackLoadDefFromAPIParams = [ this.version, this.reference, strongsToUse, this.morph, step.userLanguageCode, self, strongsNotToDisplay, multipleStrongText, self.processQuickInfo, this.morphCount ];
        step.util.getVocabMorphInfoFromJson(strongsToUse, this.morph, this.version, self.processQuickInfo, callBackCreateDefParams, 
            self.loadDefinitionFromRestAPI, callBackLoadDefFromAPIParams);
    }, 
    loadDefinitionFromRestAPI: function ( paramArray ) {
        var version = paramArray[0];
        var reference = paramArray[1];
        var strongsToUse  = paramArray[2];
        var morph = paramArray[3];
        var userLanguageCode = paramArray[4];
        var callerSelf = paramArray[5];
        var strongsNotToDisplay = paramArray[6];
        var multipleStrongText = paramArray[7];
        var callBackProcessQuickInfo = paramArray[8];
        var morphCount = paramArray[9];
        $.getSafe(MODULE_GET_QUICK_INFO, [version, reference, strongsToUse, morph, userLanguageCode], function (data) {
            callBackProcessQuickInfo(data, [ callerSelf, strongsNotToDisplay, multipleStrongText, morphCount ]);
        }).error(function() {
            if (changeBaseURL())
                $.getSafe(MODULE_GET_QUICK_INFO, [version, reference, strongsToUse, morph, userLanguageCode], function (data) {
                    callBackProcessQuickInfo(data, [ callerSelf, strongsNotToDisplay, multipleStrongText, morphCount ]);
                })
        });
        return false;
    },
    /**
     * Updates the text and shows it
     * @param strongNumbers
     */
    render: function (event) {
        var self = this;
        if(this.text) {
            var note = $(this.templateHeader + this.text.html() + this.templateFooter);
			$("#quickLexicon").remove();
            var header = (this.type === "versesWithWord") ? 'Verses with word' : 'Notes';
            this.displayQuickDef(note, header);
        } else {
            //make request to server
            this.loadDefinition();
        }
        // added for colour code grammar  Should be const instead of var, but older browser does not work
        // This must match the definition in the color_code_grammar.js
        // Do not take away the TBRMBR comment (to be removed by maven replacer)
        var C_numOfAnimationsAlreadyPerformedOnSamePage = 16; // TBRBMR
        if ((cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== undefined) && (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== null))
            cv[C_numOfAnimationsAlreadyPerformedOnSamePage] = 0;
        return this;
    },
    displayQuickDef: function(lexicon, headerText, augStrongNum) {
        var self = this;
		if ((typeof augStrongNum === "string") && (augStrongNum !== "")) self.augStrong = augStrongNum;
        var quickDefPositionAtTop = true; // Try to show it on top first.  Swap to bottom if it overlaps with current mouse/touch position.
        var versePopupLocations = $(".versePopup");
        var hasVersePopup = false;
        for (var i = versePopupLocations.length -1; i >= 0; i --) {
            var versePopupLoc = $(versePopupLocations[i]);
            if (versePopupLoc.is(":visible") && (typeof versePopupLoc.position === "function") && (typeof versePopupLoc.position().top === "number")) {
                self.position = versePopupLoc.position().top;
                hasVersePopup = true;
                break;
            }
        } 
        if ((step.touchDevice) || (hasVersePopup)) // If versePopup is close to the top, the quick lexicon should go to the bottom.
            quickDefPositionAtTop = ((self.position / self.height) > 0.35 ); // 0.35 (touch screen) to put most of the quick lexicon on top
        if (quickDefPositionAtTop)
            lexicon.css({"top": "0", "bottom": "auto"});
        if ($('#sidebar:hover').length > 0)
            $('#columnHolder').append(lexicon);
        else
            $('#wrap').append(lexicon);
        var top = $("#quickLexicon").position().top;
        var bottom = $("#quickLexicon").outerHeight(true) + top;
        if (headerText === "Verses with word") {
            $('#quickLexicon').height('auto');
            $('#quickLexicon').css({'maxHeight':'200px','overflow-y':'auto'});
        }
        else {
            if (step.touchDevice) {
                var quickLexiconHeightForTouchDevices = Math.floor(self.height * .4);
                if (quickLexiconHeightForTouchDevices < (bottom - top)) {
                    $('#quickLexicon').height('auto');
                    quickLexiconHeightForTouchDevices += "px";
                    $('#quickLexicon').css({'maxHeight': quickLexiconHeightForTouchDevices ,'overflow-y':'auto'});    
                }
            }
            else {
                var safetyMargin = 20;
                safetyMargin += (" fr de pt ".indexOf(step.userLanguageCode.toLowerCase()) > -1) ? bottom : 0; // Double the size if there is an additional definition for that langage
                if ((quickDefPositionAtTop) && (bottom + safetyMargin > self.position)) {
                    lexicon.css({"top": "", "bottom": "0"});
                    top = $("#quickLexicon").position().top; // The top position has changed
                    bottom = $("#quickLexicon").outerHeight(true) + top; // The bottom position has changed
                }
                if ((top < -8) || (bottom > self.height + 8) || // The quickLexicon div's top or bottom is not visible
                    ((top < 20) && (bottom > self.position)) || // Quick lexicon is at top. Bottom of quick lexicon overlap mouse pointer
                    ((top > 50) && (top < self.position))) {    // Quick lexicon is at bottom. Top of quick lexicon overlap mouse pointer
                    lexicon.remove();
                    if (headerText === "Notes") {
                        if ($(lexicon).find('strong').text() === '▼')
                            $(lexicon).find('strong').text("");
                    }
                    else {
                        $(lexicon).find('h1').replaceWith(function() {
                            return '<br><h4>' + $(this).text() + '</h4>';
                        });
                        $(lexicon).find(".clickMoreInfo").hide();
                    }
                    $(lexicon).find(".close").hide().html();
                    step.util.showLongAlert(lexicon.html(), headerText);
                    return;
                }
            }
        }

        if (this.touchEvent) {
            lexicon.click(function () {
				var strongToUse = (typeof self.augStrong === "string") ? self.augStrong : self.strong;
                step.util.ui.showDef({ strong: strongToUse, morph: self.morph });
                // lexicon.remove();
            });
        }
        else if (!step.touchDevice) {
            lexicon.mouseover(function() {
                if (!step.util.keepQuickLexiconOpen) {
                    lexicon.remove();
                    step.util.keepQuickLexiconOpen = false;
                }
            });
        }

        lexicon.find(".close").click(function () {
            lexicon.remove();
            step.util.keepQuickLexiconOpen = false;
        });

        var monitorElement = (step.touchDevice && !step.touchWideDevice) ? $(document) : this.passageContainer.find(".passageContent > .passageContentHolder, .passageContent > span");
        monitorElement.one('scroll', function() {
            lexicon.remove();
        })
        step.touchForQuickLexiconTime = 0;
        step.strongOfLastQuickLexicon = "";
    },

    /**
     * @param rawRelatedNumbers the related raw numbers
     */
    showRelatedNumbers: function (rawRelatedNumbers) {
        if (rawRelatedNumbers) {
            //space is not required as rawRelatedNumbers contains spaces, but in case this changes in the future,
            //we replace by ' '
            step.passage.highlightStrong(null, rawRelatedNumbers.replace(/,/ig, " "), "relatedWordEmphasisHover");
        }
    },
	// for one-line morphology
    _createBriefMorphInfo: function (morphInfo) {
		// Added following two lines. Accidentally delected the info["function'] 2019 - PT Sept 2020.
		var grammar_function;
		if (morphInfo["ot_function"] === undefined) grammar_function = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_function, "function");
		else grammar_function = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_function, "ot_function");
		var tense = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_tense, "tense");
		var voice = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_tense, "voice");
		var mood = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_mood, "mood");
        var briefMorph = grammar_function;
		briefMorph += tense + voice + mood;
        var stem = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_stem, "stem");
        var form = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_form, "ot_form");
        var state = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_state, "state");
		briefMorph += stem + form;
        briefMorph += this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_case, "wordCase") +
        	this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_person, "person");
		var number = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_number, "number");
		var gender = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_gender, "gender");
		briefMorph += number;
        briefMorph += gender;
        briefMorph += state;
		briefMorph += this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_suffix, "suffix");
        briefMorph = briefMorph.trim();
		if (briefMorph.length > 0) {
			briefMorph = "(" + briefMorph + ")";
		}
		return briefMorph;
    },
    _renderBriefMorphItem: function (morphInfo, title, param) {
        if(morphInfo && param && morphInfo[param]) {
			var morphValue = morphInfo[param];
			var local_var_name = morphValue.toLowerCase().replace(/ /g, "_");
			if ((typeof __s[local_var_name] !== "undefined") &&
				(morphValue.toLowerCase() !== __s[local_var_name].toLowerCase()))
					morphValue += " (" + __s[local_var_name] + ") ";
			else morphValue += " ";
			return morphValue;
        }
		return '';
    }
});