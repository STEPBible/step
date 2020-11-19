var ExamplesView = Backbone.View.extend({
	exampleTemplate: _.template(
		'<div class="passageContainer examplesContainer">' +
			'<a class="closeColumn" title="<%= __s.close %> />">' +
				'<i class="glyphicon glyphicon-remove"></i>' +
			'</a>' +
			'<h3><%= __s.simple_intro_welcome %></h3>' +
			'<h4><%= __s.simple_intro_tyndale_house_project %></h4>' +
			'<p><%= __s.simple_intro %></p>' +
			'<div class="accordion-row" data-row="0">' +
				'<h5 class="accordion-heading"><%= __s.quick_tutorial_header1 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=ESV|reference=Gen.1&options=VHNUG" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">ESV</span><span class="argSelect select-reference">Gen 1</span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.simple_passage_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=NIV|version=ESV|version=KJV|reference=Gen.1&options=HVGUN&display=COLUMN" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">NIV</span><span class="argSelect select-version">ESV</span><span class="argSelect select-version">KJV</span><span class="argSelect select-reference">Gen 1</span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.multiple_versions_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=ESV|strong=G0080&options=HVNGU" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">ESV</span><span class="argSelect select-greekMeanings">brother</span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.simple_search_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=NIV|version=ESV|text=land|strong=H2617a&options=VGUVNH&display=INTERLEAVED" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">NIV</span><span class="argSelect select-version">ESV</span><span class="argSelect select-text">land</span><span class="argSelect select-hebrewMeanings transliteration">he.sed</span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.chained_searches_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=ESV|meanings=throne|subject=david|reference=Isa-Rev&options=HNVUG" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">ESV</span><span class="argSelect select-meanings">throne</span><span class="argSelect select-subject">David</span><span class="argSelect select-reference">Isa-Rev</span></span>' +
					'</a>' +
					'</span>' +

					'<div class="explanationText"><%= __s.chained_searches_explanation_subject %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="/?q=version=KJV|version=THGNT|reference=John.1&options=HVLUNM&display=INTERLINEAR" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">KJV</span><span class="argSelect select-version">THGNT</span><span class="argSelect select-reference">John 1</span></span>' +
					'</a>' +
					'</span>' +
					'<div class="interlinearLinks">' +
					'<a href=\'?q=version=OHB|version=ESV&options=LVUMCHN&display=INTERLINEAR\'><%= __s.hebrew_interlin %></a>' +
					'&amp;' +
					'<a href=\'?q=version=THGNT|version=ESV|reference=John.1&options=HLVGUN&display=INTERLINEAR\'><%= __s.greek_interlin %></a>' +
					'</div>' +
					'<div class="explanationText"><%= __s.interlinear_versions_explanation %></div>' +
				'</div>' +
			'</div>' +
			'<div class="accordion-row" data-row="1">' +
				'<h5 class="accordion-heading"><%= __s.quick_tutorial_header2 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Col.3&options=HVGUNC\', \'verb, imperative mood\', \'kjv_verb_imperative_explanation\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">KJV</span><span class="argSelect select-reference">Col 3</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.kjv_verb_imperative_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Col.1&options=HVGUNC\', \'verb, main vs supporting verbs\', \'kjv_verb_main_supporting_explanation\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">KJV</span><span class="argSelect select-reference">Col 1</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.kjv_verb_main_supporting_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Mat.1&options=HVGUNC\', \'gender and number\', \'kjv_verb_number_and_gender_explanation\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">KJV</span><span class="argSelect select-reference">Mat 1</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.kjv_verb_number_and_gender_explanation %></div>' +
						'<span class="input-group" style="overflow: hidden">' +
						'<a href="javascript:cf.setNextPageURL(\'/?q=version=ESV|reference=1Jo.1&options=HVGUN\', \'function:openStats\', \'esv_word_frequency_explanation\')" title="<%= __s.click_to_try_this %>">' +
							'<span class="form-control input-sm argSummary">' +
							'<span class="argSelect select-version">ESV</span><span class="argSelect select-reference">1Jo 1</span>' +
							'<span class="argSelect select-other hidenarrow">' +
								'<svg width="19px" height="13px" viewBox="0 0 58 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
								'<g fill="white">' +
								'<path d="M0,6.00638655 C0,2.68915086 2.68113741,0 6.00212389,0 L51.9978761,0 C55.3127576,0 58,2.68354127 58,6.00638655 L58,41.9936134 C58,45.3108491 55.3188626,48 51.9978761,48 L6.00212389,48 C2.6872424,48 0,45.3164587 0,41.9936134 L0,6.00638655 Z M5,6.00638655 L5,41.9936134 C5,42.5531699 5.44680121,43 6.00212389,43 L51.9978761,43 C52.5537478,43 53,42.5531169 53,41.9936134 L53,6.00638655 C53,5.44683008 52.5531988,5 51.9978761,5 L6.00212389,5 C5.44625218,5 5,5.44688308 5,6.00638655 Z M33,5 L33,43 L37,43 L37,5 L33,5 Z"></path>' +
									'<g transform="translate(39.000000, 11.000000)">' +
									'<polygon points="0.5 4 11.5 4 11.5 0 0.5 0"></polygon>' +
									'<polygon points="0.5 15 11.5 15 11.5 11 0.5 11"></polygon>' +
									'<polygon points="0.5 26 11.5 26 11.5 22 0.5 22"></polygon>' +
									'</g>' +
								'</g>' +
								'</svg>' +
								'<i>(sidebar)&nbsp;</i>' +
								'<span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span class=\'glyphicon glyphicon-stats\'></span>' +
		'					</span>' +
						'</a>' +
						'</span>' +
					'<div class="explanationText"><%= __s.esv_word_frequency_explanation %></div>' +
				'</div>' +
			'</div>' +
			'<div class="accordion-row" data-row="2">' +
				'<h5 class="accordion-heading"><%= __s.quick_tutorial_header3 %>' +
					'<span class="plusminus">+</span>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<br>' +
					'<span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=KJV|reference=Eph.1&options=HVGUNC\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">KJV</span><span class="argSelect select-reference">Eph 1</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.kjv_verb_colour_explanation %></div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=SBLG|reference=Rom.12&options=CEMVALHUN\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">SBLG</span><span class="argSelect select-reference">Rom 12</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText">Look at Greek New Testament with color code grammar, Greek root word and English vocabulary</div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=THOT|reference=Gen.1&options=HVLUNC\', \'verb, gender and number\', \'\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">THOT</span><span class="argSelect select-reference">Gen 1</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText">Look at Hebrew Testament with color code grammar and morphology information in the lexicon</div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=CUn|reference=Col.1&options=HVGUNC\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">CUn</span><span class="argSelect select-reference">Col 1</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText">Look at Chinese Union New Testament with color highlighted verbs</div><span class="input-group" style="overflow: hidden">' +
					'<a href="javascript:cf.setNextPageURL(\'/?q=version=SBLG|version=KJV|version=CUn|reference=Eph.5&options=CVLHUVNEAM&display=INTERLEAVED\', \'verb, gender and number\', \'look_at_color_table\')" title="<%= __s.click_to_try_this %>">' +
					'<span class="form-control input-sm argSummary">' +
					'<span class="argSelect select-version">SBLG</span><span class="argSelect select-version">KJV</span><span class="argSelect select-version">CUN</span><span class="argSelect select-reference">Eph 5</span><span class="argSelect select-other hidenarrow"><span class=\'glyphicon glyphicon-cog\'>&nbsp;</span><span class=\'glyphicon glyphicon-plus\'>&nbsp;</span><span><%= __s.display_grammarColor %></span></span></span>' +
					'</a>' +
					'</span>' +
					'<div class="explanationText"><%= __s.interlinear_verb_color_explanation %></div><div id=\'colorCodeTableDiv\'></div>' +
				'</div>' +
			'</div>' +
			'<div class="text-muted step-copyright">' +
				'<span>&copy; <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House, Cambridge, UK</a> - 2020</span>' +
			'</div>' +
		'</div>'
	),
    events: {
        'click .closeColumn': 'onClickClose',
        'click .accordion-heading': 'onClickHeading'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        //this.$el.load("/jsps/examples.jsp", null, _.bind(this.initAccordions, this));
        this.$el.append(this.exampleTemplate);
        this.initAccordions();
    },
    initAccordions: function () {
        var count = this.$el.find(".accordion-row").length;
        var i;
        var hasStoredState = false;

        for (i = 0; i < count; i++) {
            if (localStorage.getItem("stepBible-displayQuickTryoutAccordion" + i) === "true") {
                hasStoredState = true;
                this.toggleAccordion(i);
            }
        }

        if (!hasStoredState) {
            this.toggleAccordion(0);
        }
    },
    toggleAccordion: function (index) {
        var query = ".accordion-row[data-row=" + index + "]";
        var $accordionRow = this.$el.find(query);
        var $accordionBody = $accordionRow.find(".accordion-body");
        var storageKey = "stepBible-displayQuickTryoutAccordion" + index;

        if ($accordionBody.is(":visible")) {
            $accordionRow.find(".accordion-body").slideUp(600);
            $accordionRow.find(".plusminus").text("+");
            localStorage.setItem(storageKey, "false");
        }
        else {
            $accordionRow.find(".accordion-body").slideDown(600);
            $accordionRow.find(".plusminus").text("-");
            localStorage.setItem(storageKey, "true");
        }
    },
    onClickHeading: function (event) {
        var $target = $(event.target);
        var $accordionRow = $target.parent();
        var index = $accordionRow.attr("data-row");
        this.toggleAccordion(index);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
