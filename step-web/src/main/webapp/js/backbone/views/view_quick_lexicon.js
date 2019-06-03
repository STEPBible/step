/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

var QuickLexicon = Backbone.View.extend({
    templateHeader: '<div id="quickLexicon"><div>' +
        '<div>' +
        '<button type="button" class="close" aria-hidden="true">&times;</button>',
    templateFooter: '</div>',
    templateDef: '<%= view.templateHeader %>' +
        '<% _.each(data, function(item, data_index) { %>' +
        '<div><h1>' +
        '<%= item.stepGloss %> (<span class="transliteration"><%= item.stepTransliteration %></span> - ' +
        '<span class="<%= fontClass %>"><%= item.accentedUnicode %></span>) ' +
        '</h1> ' +
        '<span class="shortDef"><%= item.shortDef == undefined ? "" : item.shortDef %></span>' +
        '<% if (item.shortDef == null || item.shortDef.length < 150) { %><div class="mediumDef"><%= item.mediumDef == undefined ? "" : item.mediumDef %></div> <% } %>' +
        '<% if (item.count != null) { %><span class="strongCount"> (<%= sprintf(__s.stats_occurs_times_in_bible, item.count) %>.) - <%= __s.more_info_on_click_of_word %></span><% } %>' +
        '</div>' +
        '<% if (brief_morph_info[data_index] != null) { %> ' +
		'&nbsp;&nbsp;<span><%= brief_morph_info[data_index] %></span> ' + 
		'<% } %>' +
        '<% }); %>' +
        '<%= view.templatedFooter %>',
    initialize: function (opts) {
        this.text = opts.text;
        this.reference = opts.reference;
        this.version = opts.version;
        this.strong = opts.strong;
        this.morph = opts.morph;
        this.position = opts.position;
        this.touchEvent = opts.touchEvent || false;
        this.passageContainer = step.util.getPassageContainer(opts.target);
        if(this.passageContainer.length == 0) {
            this.passageContainer = step.util.getPassageContainer(opts.passageId);
        }
        this.render();
    },

    loadDefinition: function (time) {
        var self = this;
        $.getSafe(MODULE_GET_QUICK_INFO, [this.version, this.reference, this.strong, this.morph], function (data) {
            step.util.trackAnalyticsTime("quickLexicon", "loaded", new Date().getTime() - time);
            step.util.trackAnalytics("quickLexicon", "strong", self.strong);
            $("#quickLexicon").remove();
            if (data.vocabInfos) {
				var morph_information = [];
				for (counter = 0; counter < data.morphInfos.length; counter ++) {
					var item = data.morphInfos[counter];
					if (item) morph_information[counter] = self._createBriefMorphInfo(item);
				}
                var lexicon = $(_.template(self.templateDef)({ data: data.vocabInfos, 
					brief_morph_info: morph_information,
					fontClass: step.util.ui.getFontForStrong(self.strong), 
					view: self }));
                if (self.position > 0.66) {
                    lexicon.css("padding-top", "2px");
                    lexicon.css("height", "1px");
                    lexicon.css("top", "0");
                }
                self.displayQuickDef(lexicon);
            }

            for (var i = 0; i < (data.vocabInfos || []).length; i++) {
                self.showRelatedNumbers(data.vocabInfos[i].rawRelatedNumbers);
            }
        });
    }, /**
     * Updates the text and shows it
     * @param strongNumbers
     */
    render: function (event) {
        var self = this;
        if(this.text) {
            var note = $(this.templateHeader + this.text.html() + this.templateFooter);
            this.displayQuickDef(note);
        } else {
            //remove all quick lexicons
            //make request to server
            var time = new Date().getTime();
            this.loadDefinition(time);
        }
        // added for colour code grammar
        if ((numOfAnimationsAlreadyPerformedOnSamePage !== undefined) && (numOfAnimationsAlreadyPerformedOnSamePage !== null)) 
            numOfAnimationsAlreadyPerformedOnSamePage = 0;
    },
    displayQuickDef: function(lexicon) {
        var self = this;
        this.passageContainer.append(lexicon);
        if (this.touchEvent) {
            lexicon.click(function () {
                step.util.ui.showDef({ strong: self.strong, morph: self.morph });
                lexicon.remove();
            });
        }

        lexicon.find(".close").click(function () {
            lexicon.remove();
            step.util.keepQuickLexiconOpen = false;
        });

        this.passageContainer.find(".passageContent > .passageContentHolder, .passageContent > span").one('scroll', function() {
            lexicon.remove();
        })
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
		var morph_css_class = "";
		var grammar_function = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_function, "function");
		var tense = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_tense, "tense");
		var voice = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_tense, "voice");
		var mood = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_mood, "mood");
        var briefMorph = grammar_function;
		briefMorph += tense + voice + mood;
		briefMorph += this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_case, "wordCase") +
		this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_person, "person");
		var number = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_number, "number");
		var gender = this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_gender, "gender");
		briefMorph += number;
		briefMorph += gender;
		briefMorph += this._renderBriefMorphItem(morphInfo, __s.lexicon_grammar_suffix, "suffix");
        briefMorph = briefMorph.trim();
		if (briefMorph.length > 0) {
			briefMorph = "(" + briefMorph + ")";
		}
		return briefMorph;
    },
    _renderBriefMorphItem: function (morphInfo, title, param) {
        if(morphInfo && param && morphInfo[param]) {
			return morphInfo[param] + ' ';
        }
		return '';
    },
	_getShortCodeTense: function (tense) {
		temp_compare_string = tense.toLowerCase();
		if (temp_compare_string == "aorist") return "a";
		else if (temp_compare_string == "present") return "p";
		else if ((temp_compare_string == "perfect") || (temp_compare_string == "pluperfect")) return "r";
		else if (temp_compare_string == "future") return "f";
		else if (temp_compare_string == "imperfect") return "i";
		else if (temp_compare_string == "indefinite") return "x";
		else {
			console.log("view_quick_lexicon: Cannot find the matching tense: " + temp_compare_string);
		}
		return "";
    },
	_getShortCodeMood: function (mood) {
		temp_compare_string = mood.toLowerCase();
		if (temp_compare_string == "indicative") return "i";
		else if (temp_compare_string == "imperative") return "m";
		else if (temp_compare_string == "participle") return "p";
		else if (temp_compare_string == "infinitive") return "n";
		else if (temp_compare_string == "subjunctive") return "s";
		else if (temp_compare_string == "optative") return "o";
		else {
			console.log("view_quick_lexicon: Cannot find the matching mood: " + temp_compare_string);
		}
		return "";
    },
	_getShortCodeVoice: function (voice) {
		temp_compare_string = voice.toLowerCase();
		if (temp_compare_string.startsWith("passive")) return "p";
		else return "a";
    }
});