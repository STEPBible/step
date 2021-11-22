var ExamplesView = Backbone.View.extend({
	exampleTemplate: _.template(
		'<div id="welcomeExamples" class="passageContainer examplesContainer">' +
			'<a class="closeColumn" title="<%= __s.close %> />" ontouchstart="step.util.showOrHideTutorial(\'true\')">' +
				'<i class="glyphicon glyphicon-remove"></i>' +
			'</a>' +
			'<h3><%= __s.simple_intro_welcome %></h3>' +
			'<p><%= __s.simple_intro %></p>' +
			'<div class="accordion-row" data-row="0">' +
				'<h5 class="accordion-heading stepButton"><%= __s.quick_tutorial_header1 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<div id="classicalUIVideo" style="margin-left:3px"><span style="font-size:14px;font-weight:bold"><%= __s.display_classical_ui %></span>' +
					'<br><span class="explanationText"><%= __s.advanced_interface_explain %></span>' +
					'<a href="javascript:step.util.showVideoModal(\'ClassicalUI.gif\', 23, 580)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<br><div style="overflow:hidden">' +
						'<a href="/?q=version=ESV|reference=Ps.23&options=VHNUG" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">ESV</span><span class="stepButton">Psalm 23</span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.simple_passage_explanation %>' +
						'<a id="firstVideoLink" href="javascript:step.util.showVideoModal(\'Psalm23.gif\', 15, 434)">&nbsp;' +
						'<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
					'<a href="/?q=version=NIV|version=ESV|version=KJV|reference=Joh.3&options=HVGUN&display=COLUMN" title="<%= __s.click_to_try_this %>">' +
					'<span>' +
					'<span class="stepButton">NIV, ESV, KJV</span><span class="stepButton">John 3</span></span>' +
					'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.multiple_versions_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'John3.gif\', 27, 434)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +
					
					'<div style="overflow:hidden">' +
					'<a href="/?q=version=ESV|strong=G0080&options=HVNGU" title="<%= __s.click_to_try_this %>">' +
					'<span>' +
					'<span class="stepButton">ESV</span><span class="stepButton"><span class="glyphicon glyphicon-search" style="font-size:12px"></span><span> brother</span></span></span>' +
					'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.simple_search_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'ESV_brother.gif\', 39, 467)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="/?q=version=NIV|version=ESV|text=land|strong=H2617a&options=VGUVNH&display=INTERLEAVED" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">NIV, ESV</span><span class="stepButton"><span class="glyphicon glyphicon-search" style="font-size:12px"></span><span> land,&nbsp;</span><span class="transliteration" style="line-height:13px">he.sed</span></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.chained_searches_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'ESV_NIV_land_chesed.gif\', 65, 452)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
					'<a href="/?q=version=ESV|meanings=throne|subject=david|reference=Isa-Rev&options=HNVUG" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
							'<span class="stepButton">ESV</span>' +
							'<span class="stepButton">' +
								'<span class="glyphicon glyphicon-search" style="font-size:12px"></span>' +
								'<span> throne, David (Isa-Rev)</span>' +
							'</span>' +
						'</span>' +
					'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.chained_searches_explanation_subject %>' +
						'<a href="javascript:step.util.showVideoModal(\'ESV_Isa_Rev_throne_david.gif\', 63, 452)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=ESV|reference=1Jo.1&options=HVGUN\', \'function:openStats\', \'esv_word_frequency_explanation\')" title="<%= __s.click_to_try_this %>">' +
							'<span>' +
							'<span class="stepButton">ESV</span><span class="stepButton">1Jo 1</span>' +
							'&nbsp;<span class=\'glyphicon glyphicon-stats\' style="line-height:13px"></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.esv_word_frequency_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'1Joh_passage_analysis.gif\', 12, 480)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<a href="javascript:step.util.showIntro(true)">' +
					'<span id="quickTour"><span style="font-size:14px;font-weight:bold"><%= __s.quick_tour %></span>' +
					'<br><span class="explanationText"><%= __s.quick_tour_explain %></span>' +
					'</span>' +
					'</a>' +
                    '<div class="explanationText">  Or see a quick introduction in the ' +
						'<a href="https://drive.google.com/drive/folders/19OgRWS8Rbk92V5zAETpJ14QFSNjf76um">' +
						'user guide.</a>' +
					'</div>' +

				'</div>' +
			'</div>' +
			'<div class="accordion-row" data-row="1">' +
				'<h5 class="accordion-heading stepButton"><%= __s.quick_tutorial_header2 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					
					'<div style="overflow:hidden">' +
						'<a href="/?q=version=KJV|version=THGNT|reference=John.1&options=HVLUNM&display=INTERLINEAR" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">KJV, THGNT</span><span class="stepButton">John 1</span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.interlinear_grammar_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'KJV_THGNT_John1.gif\', 35, 480)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="/?q=version=OHB|version=ESV&options=LVUMCHN&display=INTERLINEAR" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">OHB, ESV</span><span class="stepButton">Gen 1</span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.interlinear_ot_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'OHB_ESV_Gen1.gif\', 40, 480)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="/?q=version=ESV|reference=John.1&options=TLHVAGUN" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">ESV</span><span class="stepButton">John 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_greekVocab %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.vocab_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'ESV_orig_voc_transliteration.gif\', 35, 480)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="?q=version=LXX|version=AB|version=ABGk|version=ABEn|reference=Exod.31&options=VLGUHVNAT&display=INTERLEAVED" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">LXX, AB, ABGk, ABEn</span><span class="stepButton">Exo 31</span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.lxx_ab %></div>' +

					'<div style="overflow:hidden">' +
						'<a href="?q=version=ESV|version=THOT|version=ABGk|version=ABEn|reference=Isa.53.1 John.12.38&options=VVNH&display=COLUMN&pos=1" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">ESV, THOT, ABGk, ABEn</span><span class="stepButton">Isa 53:1, Joh 12:38</span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.cmp_greek_hebrew %></div>' +
				'</div>' +
			'</div>' +
			'<div class="accordion-row" data-row="2">' +
				'<h5 class="accordion-heading stepButton"><%= __s.quick_tutorial_header3 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Col.3&options=HVGUNC\', \'verb, imperative mood\', \'kjv_verb_imperative_explanation\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">KJV</span><span class="stepButton">Col 3</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.kjv_verb_imperative_explanation %>' +
						'<a href="javascript:step.util.showVideoModal(\'color_code_1.gif\', 93, 480)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'</div>' +

					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Col.1&options=HVGUNC\', \'verb, main vs supporting verbs\', \'kjv_verb_main_supporting_explanation\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton" style="line-height:13px">KJV</span>' +
						'<span class="stepButton" style="line-height:13px">Col 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.kjv_verb_main_supporting_explanation %></div>' +
					
					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Mat.1&options=HVGUNC\', \'gender and number\', \'kjv_verb_number_and_gender_explanation\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">KJV</span><span class="stepButton">Mat 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.kjv_verb_number_and_gender_explanation %></div>' +

					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Eph.1&options=HVGUNC\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">KJV</span><span class="stepButton">Eph 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.kjv_verb_colour_explanation %></div>' +
					
					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=SBLG|reference=Rom.12&options=CEMVALHUN\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">SBLG</span><span class="stepButton">Rom 12</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText">Look at Greek New Testament with color code grammar, Greek root word and English vocabulary</div>' +

					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=THOT|reference=Gen.1&options=HVLUNC\', \'verb, gender and number\', \'\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">THOT</span><span class="stepButton">Gen 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText">Look at Hebrew Testament with color code grammar and morphology information in the lexicon</div>' +
					
					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=CUn|reference=Col.1&options=HVGUNC\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">CUn</span><span class="stepButton">Col 1</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText">Look at Chinese Union New Testament with color highlighted verbs</div>' +
					
					'<div style="overflow:hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=SBLG|version=KJV|version=CUn|reference=Eph.5&options=CVLHUVNEAM&display=INTERLEAVED\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
						'<span>' +
						'<span class="stepButton">SBLG, KJV, CUn</span><span class="stepButton">Eph 5</span>' +
						'&nbsp;<span class=\'glyphicon glyphicon-cog\' style="line-height:13px">&nbsp;</span><span style="line-height:13px"><%= __s.display_grammarColor %></span></span>' +
						'</a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.interlinear_verb_color_explanation %></div>' +
				'</div>' +
			'</div>' +
            '<div id="keyboard_shortcut" class="accordion-row" data-row="3" style="display:none">' +
				'<h5 class="accordion-heading stepButton"><%= __s.quick_tutorial_header4 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<div><span style="font-size:14px;font-weight:bold"><%= __s.keyboard_explain1 %></span>' +
                    '<a href="javascript:step.util.showVideoModal(\'Keyboard.gif\', 85, 1153)">&nbsp;<span class="glyphicon glyphicon-film" style="font-size:16px"></span></a>' +
					'<ul><%= __s.keyboard_explain2 %></ul>' +
					'</div>' +
				'</div>' +
			'</div>' +
            
			'<div id=\'colorCodeTableDiv\'></div>' +
			'<div class="text-muted step-copyright">' +
				'<span>&copy; <a href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" target="_blank">STEPBible</a> - 2021</span>' +
			'</div>' +
		'</div>'
	),
    events: {
        'click .closeColumn': 'onClickClose',
        'click .accordion-heading': 'onClickHeading',
		'click .plusminus': 'onClickHeading'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
		if ($('#welcomeExamples').length == 0) {
			this.$el.append(this.exampleTemplate);
			this.initAccordions();
            var options = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("selectedOptions") || [];
            var availableOptions = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("options") || [];
            if ((options.indexOf("C") > -1) && (availableOptions.indexOf("C") > -1)) cf.initCanvasAndCssForClrCodeGrammar();
		}
        var classicalUISetting = (window.localStorage) ? window.localStorage.getItem("step.classicalUI") : $.cookie('step.classicalUI');
		if (classicalUISetting === "true") $('#classicalUIVideo').hide();
		else $('#classicalUIVideo').show();
        if (step.touchDevice) $("#keyboard_shortcut").hide();
        else $("#keyboard_shortcut").show();
    },
    initAccordions: function () {
        var count = this.$el.find(".accordion-row").length - 1; // Don't need to highlight keyboard shortcut
        var hasStoredState = false;
        var timesDisplayedKey = "accordionTimesDisplayed";
		var timesDisplayed = localStorage.getItem(timesDisplayedKey);
		if (timesDisplayed == null) timesDisplayed = 1;
		else timesDisplayed ++;
		
        for (var i = 0; i < count; i++) {
            if (localStorage.getItem("displayQuickTryoutAccordion" + i) === "true") {
                hasStoredState = true;
				var index = i;
				if (timesDisplayed > 4) {
					index = (i + 1) % count;
					timesDisplayed = 1;
				}
                this.toggleAccordion(index, count);
            }
        }
        if (!hasStoredState) this.toggleAccordion(0, count);
		localStorage.setItem(timesDisplayedKey, timesDisplayed);
    },
    toggleAccordion: function (index, accordionCount) {
        var query = ".accordion-row[data-row=" + index + "]";
        var $accordionRow = this.$el.find(query);
        var $accordionBody = $accordionRow.find(".accordion-body");
        var storageKey = "displayQuickTryoutAccordion" + index;
		var displayFlag = false;
		if (typeof accordionCount === "number") {
			displayFlag = true;
			for (var i = 0; i < accordionCount; i++) {
				localStorage.setItem("displayQuickTryoutAccordion" + i, "false") ;
			}
		}
        if ( (!$accordionBody.is(":visible")) || (displayFlag) ) {
            $accordionRow.find(".accordion-body").slideDown();
			$accordionRow.find(".accordion-heading").addClass('stepPressedButton');
            $accordionRow.find(".plusminus").text("-");
            localStorage.setItem(storageKey, "true");
        }
        else {
            $accordionRow.find(".accordion-body").slideUp();
			$accordionRow.find(".accordion-heading").removeClass('stepPressedButton');
            $accordionRow.find(".plusminus").text("+");
            localStorage.setItem(storageKey, "false");
        }
    },
    onClickHeading: function (event) {
		event.stopImmediatePropagation();
		event.stopPropagation(); //prevent the bubbling up
        var target = $(event.target);
        var accordionRow = target.parent();
		if ($(accordionRow).find('.accordion-heading').length == 0) accordionRow = $(accordionRow).parent();
        var index = accordionRow.attr("data-row");
        this.toggleAccordion(index);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
