var ExamplesView = Backbone.View.extend({
	exampleTemplate: _.template(
		'<div id="welcomeExamples" class="passageContainer examplesContainer">' +
			'<a class="closeColumn" title="<%= __s.close %> />" ontouchstart="step.util.showOrHideTutorial(\'true\')">' +
				'<i class="glyphicon glyphicon-remove"></i>' +
			'</a>' +
			'<h3><%= __s.simple_intro_welcome %></h3>' +
			'<span style="background-color:lightyellow;font-size:16px"><b><%= __s.announce_search_ui %></b> </span>' +
			'<a style="background-color:lightyellow" class="videoGuide" href="javascript:step.util.showVideoModal(\'new_search_ui.gif\', 35)">' +
				'<span class="glyphicon glyphicon-play-circle" style="background-color:lightyellow;font-size:16px"></span></a>' +
			'<br><br><p><%= __s.simple_intro %></p>' +
			'<div class="accordion-row" data-row="0">' +
				'<h5 class="accordion-heading"><span id="g1q0" style="float:;">How do I read passages in Bibles?</span>' +
					'<a class="plusminus glyphicon glyphicon-chevron-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold"><span id="g1q1">How do I look up a passage?</span>' +
							'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'Psalm23.gif\', 15)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g1q1a1">Click the Passage button for a chapter or references.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_passage_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g1q2">How do I see three Bibles at once?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'John3.gif\', 27)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g1q2a1">Click the Bible button to select one or several Bibles.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g1q3">How do I find a parallel gospel passage?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g1q3a1">1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g1q3a2">2) Click the resource for parallel gospel passage</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/gospel_harmony_.png\');width:190px;height:164px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g1q4">How do I follow a Bible reading plan?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g1q4a1">1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g1q4a2">2) Plans for 1/2/3 years, chronological, Jewish etc</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_reading_plan_.png\');width:190px;height:286px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g1q5">How do I also see a commentary?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g1q5a1">1) Click the Bible button.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g1q5a2">2) Click on Commentaries</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/commentaries_.png\');width:184px;height:40px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="1">' +
				'<h5 class="accordion-heading"><span id="g2q0">How do I find words and phrases?</span>' +
					'<a class="plusminus glyphicon glyphicon-chevron-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold"><span id="g2q1">How do I find words or topics?</span>' +
							'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'basic_search.gif\', 25)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g2q1a1">1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q1a2">2) Enter word or phrase in search bar and press Return</span>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g2q2">How do I search only some books in the Bible?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'search_range.gif\', 40)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g2q2a1">1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q2a2">2) Click on Range</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_range_.png\');width:176px;height:52px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q2a3">3) Select the books that you wish to search</span>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g2q3">How do I find a Greek or Hebrew word?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'Search_Greek_Hebrew.gif\', 40)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g2q3a1">1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q3a2">2) Click on the Hebrew or Greek tab</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_hebrew_greek.png\');width:200px;height:199px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q3a3">3) Type in the Greek/Hebrew word in the search box, press Return, and wait for the table to fill itself.</span>' +
								'<br><span id="g2q3a4">4) View corresponding row to see Greek/Hebrew translation of the word</span>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g2q4">How do I find a word only where it relates to a topic?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'topic_search.gif\', 35)"><span  class="videoGuide">Video guide  </span>' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g2q4a1">1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span id="g2q4a2">2) Click on the English tab</span>' +
								'<br><span id="g2q4a3">3) Type in the topic in the search box, press Return, and wait for the table to fill itself.</span>' +
								'<br><span id="g2q4a4">4) Click on one of the words or topics listed</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/topic_search.png\');width:200px;height:405px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold"><span id="g2q5">How do I find more about search?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
							'<a href="https://stepbibleguide.blogspot.com/p/finding-words-and-subjects.html" id="g2q5a1">' +
							'Detailed instructions are in the user\'s guide</a>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="2">' +
			'<h5 class="accordion-heading"><span id="g3q0">How do I do a word study?</span>' +
				'<a class="plusminus glyphicon glyphicon-chevron-right"></a>' +
			'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold"><span id="g3q1">What information can I find about a word?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g3q1a1">When you click on a word, the detailed lexicon opens with:</span>' +
								'<ul>' +
								'<li id="g3q1a2">Meaning: how the word is used throughout the Bible</li>' +
								'<li id="g3q1a3">Dictionary: academic details about the word</li>' +
								'<li id="g3q1a4">Related words: similar in meaning or origin</li>' +
								'<li id="g3q1a5">Grammar: (only available for some Bibles)</li>' +
								'</ul>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/info_on_word_.png\');width:190px;height:167px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g3q2">Why do only some Bibles have clickable words?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g3q2a1">\'Vocabulary\' Bibles link the translation to Greek & Hebrew. So far, only some Bibles have this vocabulary feature. They are shown in the Bible select screen with the letter \'V\'.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_with_vocab_.png\');width:190px;height:283px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g3q3">What does “~20x” or “Frequency” mean?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g3q3a1">It is the number of occurrences of a word in the Bible. Click on it to see them all in the selected Bible(s).</span>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g3q4">Why do some words have dropdown next to the frequency number?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g3q4a1">This reveals different forms for some words and names. These details are often interesting to scholars, eg the word \'beginning\' in Genesis.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/dropdown_frequency_.png\');width:190px;height:88px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g3q5">Where do I find the maps?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'map.gif\', 22)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g3q5a1">1st method:</span>' +
								'<br><span id="g3q5a2">Click on a place name then on the Map button in the detailed lexicon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/map_in_lexicon_.png\');width:190px;height:126px;border:3px solid black;display:none"></div>' +
								'<br><span id="g3q5a3">2nd method:</span>' +
								'<br><span id="g3q5a4">1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g3q5a5">2) Click on "Places in the Bible"</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/find_map_.png\');width:190px;height:131px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g3q6">How do I get the word frequency for a chapter or a book?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'1Joh_passage_analysis.gif\', 12)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g3q6a1">1) Click on the analysis icon.</span>' +
								'&nbsp;<span class="glyphicon glyphicon-stats" style="line-height:13px"></span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/analysis_.png\');width:190px;height:116px;border:3px solid black;display:none"></div>' +
								'<br><span id="g3q6a2">2) Click on the "Selected passage" button if no analysis is shown.</span>' +
							'</div>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="3">' +
				'<h5 class="accordion-heading"><span id="g4q0">How do I find more information on original languages?</span>' +
					'<a class="plusminus glyphicon glyphicon-chevron-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold"><span id="g4q1">How do I see Greek/Hebrew vocabulary for my Bible?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'greek_hebrew_vocab.gif\', 53)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g4q1a1">1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q1a2">2) Refer to the legend and select the Bible translations with the Vocab feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/esv_with_vocab_.png\');width:190px;height:306px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q1a3">3) Click on the Option button, then click "Interlinear options”, then select "Greek / Hebrew".  Original language vocab will be shown.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/original_vocab_feature_.png\');width:190px;height:198px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold"><span id="g4q2">How do I see Greek/Hebrew transliteration for my Bible?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'ESV_orig_voc_transliteration.gif\', 35)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g4q2a1">1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q2a2">2) Refer to the legend and select the Bible translations with the Vocab feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/esv_with_vocab_.png\');width:190px;height:306px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q2a3">3) Click on the Option button, then click "Interlinear options”, then select "Transliteration".</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/transliteration_.png\');width:190px;height:230px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold"><span id="g4q3">How do I see Greek/Hebrew vocabulary for a verse?    </span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'verse_vocab.gif\', 18)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g4q3a1">1) Click on the verse number to list the words and meanings</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/verse_vocab_.png\');width:190px;height:250px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q3a2">2) Hover over or click on a word for more details about the word</span>' +
							'</div>' +

						'<li style="font-weight:bold"><span id="g4q4">How can I view multiple Bibles together as an Interlinear?</span><a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'OHB_ESV_Gen1.gif\', 40)">Video guides  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'&nbsp;&nbsp;' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'KJV_THGNT_John1.gif\', 35)">' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g4q4a1">1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q4a2">2) Refer to the legend and select two Bible with the vocabulary feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_two_bibles_.png\');width:190px;height:322px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q4a3">3) Click on the Option button, then click Interlinear”.  Interlinear will be shown.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/interlinear_.png\');width:190px;height:338px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold"><span id="g4q5">How do I see the various versions of the Greek OT?</span><a id="ot-greek-qa" style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span id="g4q5a1">1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q5a2">2) Select “Ancient” for the language</span>' +
								'<br><span id="g4q5a3">3) Scroll down to see the Greek OT translations</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_ancient_.png\');width:190px;height:23px;border:3px solid black;display:none"></div>' +
								'<br><br><a id="otgreekexamples" href="html/additional_examples.html?exampleType=greekot&langFile=<%= step.userLanguageCode %>.<%= step.state.getCurrentVersion() %>.js"><%= __s.examples %></a>' +
								'<br><br>' +
							'</div>' +
						'<li style="font-weight:bold"><span id="g4q6">How do I display the color-coded grammar?</span><a id="color-qa" style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-chevron-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a class="videoGuide" href="javascript:step.util.showVideoModal(\'color_code_grammar.gif\', 50)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span id="g4q6a1">1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q6a2">2) Refer to the legend and select the Bible translations with the grammar feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/grammar_feature_.png\');width:190px;height:221px;border:3px solid black;display:none"></div>' +
								'<br><span id="g4q6a3">3) Click on "G" or "Grammar" at the navigation bar. The text will then be color coded.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/color_code_grammar_.png\');width:190px;height:60px;border:3px solid black;display:none"></div>' +
								// Use https://examples.stepbible.org for color code examples because the examples will change the user's color code configuration
								// and then store it in local storage of the browser.  Using a different DNS name will have a separate copy of the local storage
								'<br><br><a id="colorcodeexamples" target="_blank" href="https://examples.stepbible.org/html/additional_examples.html?exampleType=colorCode&langFile=<%= step.userLanguageCode %>.<%= step.state.getCurrentVersion() %>.js"><%= __s.examples %></a>' +
								'<br>' +
							'</div>' +
					'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row keyboard_shortcut" data-row="4">' +
				'<h5 class="accordion-heading"><span id="g5q0">Additional information</span>' +
					'<a class="plusminus glyphicon glyphicon-chevron-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li class="keyboard_shortcut" style="font-weight:bold">' +
							'<a href="https://www.stepbible.org/html/split.html?/?q=reference=Gen.1&skipwelcome&secondURL=https://docs.google.com/presentation/d/10oUdTW40X3f5y4wmImxRW5_3zTJnRkVUVo4jz4mU9E4/preview" target="_blank" id="g5q1">Site Guide</a>' +
						'</li>' +
						'<li class="keyboard_shortcut" style="font-weight:bold">' +
						'<a href="https://www.stepbible.org/html/split.html?/?q=reference=Gen.1&skipwelcome&secondURL=https://www.stepbible.org/html/keyboard_shortcut.html" target="_blank"><%= __s.keyboard_shortcuts %></a>' +
						'</li>' +
					'</ul>' +
				'</div>' +
			'</div>' +
			'<div class="text-muted step-copyright">' +
				'<span>&copy; <a href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" target="_blank">STEPBible</a> - 2024</span>' +
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
		if (($('#welcomeExamples').length == 0) || (step.touchDevice && !step.touchWideDevice)) {
			if (step.touchDevice && !step.touchWideDevice) {
				step.util.showLongAlert("", "<b>" + __s.welcome_to_step + "</b>", [ this.exampleTemplate() ]);
				$(".closeColumn").click(function (ev) {
					step.util.closeModal("showLongAlertModal");
				});
				var contextOfOriginalExecution = this;
				$(".accordion-heading").click(function (ev) {
					contextOfOriginalExecution.onClickHeading(ev, contextOfOriginalExecution);
				});
				$(".plusminus").click(function (ev) {
					contextOfOriginalExecution.onClickHeading(ev, contextOfOriginalExecution);
				});
				$(".modal-body").find(".closeColumn").hide();
				$(".modal-body").find("h3").hide();
			}
			else
				this.$el.append(this.exampleTemplate());
			$("a.glyphicon.glyphicon-chevron-right.stepExample").click(step.util.expandCollapseExample);

			var $welcomeExamples = this.$el.find('#welcomeExamples');
			var spacing = '6px';

			$welcomeExamples.find('.accordion-heading').css({
				display: 'flex',
				'align-items': 'center'
			});
			$welcomeExamples.find('.accordion-heading .plusminus').css({
				order: 0,
				'margin-right': spacing,
				float: 'none'
			});
			$welcomeExamples.find('.accordion-heading span').css({
				order: 1,
				flex: '1 1 auto'
			});

			var $subLists = $welcomeExamples.find('.accordion-body > ul');
			$subLists.css({
				'list-style': 'none',
				'padding-left': '0',
				'margin': '0'
			});

			$subLists.children('li').each(function () {
				var $li = $(this);
				var $icon = $li.children('a.stepExample');
				if (!$icon.length) {
					return;
				}

				$li.css({
					display: 'flex',
					'align-items': 'center',
					cursor: 'pointer'
				});
				$icon.css({
					order: 0,
					'margin-right': spacing
				});
				$li.children(':not(a.stepExample)').css('order', 1);

				$li.off('click.stepExampleToggle').on('click.stepExampleToggle', function (ev) {
					if ($(ev.target).is('a.stepExample')) {
						return;
					}
					ev.preventDefault();
					$icon.trigger('click');
				});
			});
            var options = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("selectedOptions") || [];
            var availableOptions = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("options") || [];
            if ((options.indexOf("C") > -1) && (availableOptions.indexOf("C") > -1)) cf.initCanvasAndCssForClrCodeGrammar();
		}
		var checkLangCode = step.userLanguageCode.toLowerCase();
		var checkLangCode2Ch = checkLangCode.substring(0,2);
		if ((checkLangCode2Ch === "zh") || (checkLangCode2Ch === "fr") || (checkLangCode2Ch === "ar") || (checkLangCode2Ch === "pt")  || (checkLangCode2Ch === "es")) {
			if (checkLangCode === "zh_hk")
				checkLangCode = "zh_tw";
			fetch("html/faq/" + checkLangCode + ".txt")
            .then(function(response) {
                return response.text();
            })
            .then(function(data) {
				var lines = data.split("\n");
				for (var i = 0; i < lines.length; i++) {
					if (lines[i].length < 4)
						continue;
					var curLine = lines[i].replace("：",":");
					var pos = curLine.indexOf(":");
					if (pos > 1) {
						var idName = lines[i].substring(0,pos).trim();
						var text = lines[i].substring(pos+1).trim();
						var elementName = (idName.substring(0,1) === "_") ? elementName = "." + idName.substring(1) : "#" + idName;
						$(elementName).text(text);
						if (checkLangCode === "ar")
							$(elementName).css("direction", "rtl");
					}
					else
						console.log("Does not recognize foreign lang example line: " + lines[i]);
				}
            });
		}
        var classicalUISetting = step.util.localStorageGetItem("step.classicalUI");
		if (classicalUISetting === "true") $('#classicalUIVideo').hide();
		else $('#classicalUIVideo').show();
		var urlVars = $.getUrlVars();
		if (urlVars.indexOf("otgreekexamples") > -1) {
            this.toggleAccordion(3, 2);
			if ($("#ot-greek-qa").hasClass("glyphicon-chevron-right")) {
				$("#ot-greek-qa").click();
				setTimeout(function() {
					$("#otgreekexamples").get(0).scrollIntoView();
				}, 700);
			}
		}
		else if (urlVars.indexOf("colorexamples") > -1) {
			this.toggleAccordion(3, 2);
			if ($("#color-qa").hasClass("glyphicon-chevron-right")) {
				$("#color-qa").click();
				setTimeout(function() {
					$("#colorcodeexamples").get(0).scrollIntoView();
				}, 700);
			}
		}
        if (step.touchDevice) $(".keyboard_shortcut").hide();
        else $(".keyboard_shortcut").show();
    },
    toggleAccordion: function (index, accordionCount) {
        var query = ".accordion-row[data-row=" + index + "]";
        var $accordionRow = $(query);
        var $accordionBody = $accordionRow.find(".accordion-body");
        var storageKey = "displayQuickTryoutAccordion" + index;
		var displayFlag = false;
		if (typeof accordionCount === "number") {
			displayFlag = true;
			for (var i = 0; i < accordionCount; i++) {
				step.util.localStorageSetItem("displayQuickTryoutAccordion" + i, "false") ;
			}
		}
        if ( (!$accordionBody.is(":visible")) || (displayFlag) ) {
            $accordionRow.find(".accordion-body").slideDown();
			$accordionRow.find(".accordion-heading").addClass('stepPressedButton');
            $accordionRow.find(".plusminus").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down")
			step.util.localStorageSetItem(storageKey, "true");
        }
        else {
            $accordionRow.find(".accordion-body").slideUp();
			$accordionRow.find(".accordion-heading").removeClass('stepPressedButton');
            $accordionRow.find(".plusminus").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right")
            step.util.localStorageSetItem(storageKey, "false");
        }
		$accordionRow.find(".plusminus").css("color", $accordionRow.find(".accordion-heading").css("color"));
    },
    onClickHeading: function (event, contextOfOriginalExecution) {
		event.stopImmediatePropagation();
		event.stopPropagation(); //prevent the bubbling up
        var target = $(event.target);
        var accordionRow = target.parent();
		if ($(accordionRow).find('.accordion-heading').length == 0) accordionRow = $(accordionRow).parent();
        var index = accordionRow.attr("data-row");
		if (contextOfOriginalExecution)
			contextOfOriginalExecution.toggleAccordion(index);
		else
	        this.toggleAccordion(index);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
