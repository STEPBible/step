var ExamplesView = Backbone.View.extend({
	exampleTemplate: _.template(
		'<div id="welcomeExamples" class="passageContainer examplesContainer">' +
			'<a class="closeColumn" title="<%= __s.close %> />" ontouchstart="step.util.showOrHideTutorial(\'true\')">' +
				'<i class="glyphicon glyphicon-remove"></i>' +
			'</a>' +
			'<h3><%= __s.simple_intro_welcome %></h3>' +
			'<span style="background-color:lightyellow;font-size:16px;font-weight:bold">ESV and NASB2020 now have morphology!    </span>' +
			'<a style="background-color:lightyellow" href="javascript:step.util.showVideoModal(\'esv_morph.gif\', 66)">Video introduction  ' +
				'<span class="glyphicon glyphicon-play-circle" style="background-color:lightyellow;font-size:16px"></span></a>' +
			'<br><br><p><%= __s.simple_intro %></p>' +
			'<div class="accordion-row" data-row="0">' +
				'<h5 class="accordion-heading stepButton">How do I read passages in Bibles?' +
					'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold">How do I look up a passage?' +
							'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'Psalm23.gif\', 15)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>Click the Passage button for a chapter or references.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_passage_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">How do I see three Bibles at once?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'John3.gif\', 27)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>Click the Bible button to select one or several Bibles.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">How do I find a parallel gospel passage?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Click the resource for parallel gospel passage</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/gospel_harmony_.png\');width:190px;height:164px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">How do I follow a Bible reading plan?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Plans for 1/2/3 years, chronological, Jewish etc</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_reading_plan_.png\');width:190px;height:286px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">How do I also see a commentary?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>1) Click the Bible button.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Click on Commentaries</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/commentaries_.png\');width:184px;height:40px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="1">' +
				'<h5 class="accordion-heading stepButton">How do I find words and phrases?' +
					'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold">How do I find words or topics?' +
							'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'basic_search.gif\', 25)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Enter word or phrase in search bar and press Return</span>' +
							'</div>' +
						'<li style="font-weight:bold">How do I search only some books in the Bible?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'search_range.gif\', 40)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Click on Range</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_range_.png\');width:176px;height:52px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Select the books that you wish to search</span>' +
							'</div>' +
						'<li style="font-weight:bold">How do I find a Greek or Hebrew word?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'search_original_language.gif\', 50)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Switch on the Advanced search toggle </span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_advanced_mode_.png\');width:190px;height:199px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Type in the Greek/Hebrew word in the search box, press Return, and wait for the table to fill itself.</span>' +
								'<br><span>4) View corresponding row to see Greek/Hebrew translation of the word</span>' +
							'</div>' +
						'<li style="font-weight:bold">How do I find a word only where it relates to a subject?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'subject_search.gif\', 46)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the search button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_button_.png\');width:176px;height:73px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Switch on the Advanced search toggle </span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/search_advanced_mode_.png\');width:190px;height:199px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Type in the subject in the search box, press Return, and wait for the table to fill itself.</span>' +
								'<br><span>4) View the row: Subject or a person in the Bible</span>' +
							'</div>' +

						'<li style="font-weight:bold">How do I find more about advanced search?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
							'<a href="https://stepbibleguide.blogspot.com/p/finding-words-and-subjects.html">' +
							'Detailed instructions are in the user\'s guide</a>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="2">' +
			'<h5 class="accordion-heading stepButton">How do I do a word study?' +
				'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
			'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold">What information can I find about a word?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>When you click on a word, the detailed lexicon opens with:</span>' +
								'<ul>' +
								'<li>Meaning: how the word is used throughout the Bible</li>' +
								'<li>Dictionary: academic details about the word</li>' +
								'<li>Related words: similar in meaning or origin</li>' +
								'<li>Grammar: (only available for some Bibles)</li>' +
								'</ul>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/info_on_word_.png\');width:190px;height:167px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">Why do only some Bibles have clickable words?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>\'Vocabulary\' Bibles link the translation to Greek & Hebrew. So far, only some Bibles have this vocabulary feature. They are shown in the Bible select screen with the letter \'V\'.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_with_vocab_.png\');width:190px;height:283px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">What does “~20x” or “Frequency” mean?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>It is the number of occurrences of a word in the Bible. Click on it to see them all in the selected Bible(s).</span>' +
							'</div>' +
						'<li style="font-weight:bold">Why do some words have dropdown next to the frequency number?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>This reveals different forms for some words and names. These details are often interesting to scholars, eg the word \'beginning\' in Genesis.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/dropdown_frequency_.png\');width:190px;height:88px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">Where do I find the maps?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'map.gif\', 22)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1st method:</span>' +
								'<br><span>Click on a place name then on the Map button in the detailed lexicon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/map_in_lexicon_.png\');width:190px;height:126px;border:3px solid black;display:none"></div>' +
								'<br><span>2nd method:</span>' +
								'<br><span>1) Click the Resource icon.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Click on "Places in the Bible"</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/find_map_.png\');width:190px;height:131px;border:3px solid black;display:none"></div>' +
							'</div>' +
						'<li style="font-weight:bold">How do I get the word frequency for a chapter or a book?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'1Joh_passage_analysis.gif\', 12)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the analysis icon.</span>' +
								'&nbsp;<span class="glyphicon glyphicon-stats" style="line-height:13px"></span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/analysis_.png\');width:190px;height:116px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Click on the "Selected passage" button if no analysis is shown.</span>' +
							'</div>' +
						'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row" data-row="3">' +
				'<h5 class="accordion-heading stepButton">How do I find more information on original languges?' +
					'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li style="font-weight:bold">How do I see Greek/Hebrew vocabulary for my Bible?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'greek_hebrew_vocab.gif\', 53)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Refer to the legend and select the Bible translations with the Vocab feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/esv_with_vocab_.png\');width:190px;height:306px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Click on the Option button, then click "Interlinear options”, then select "Greek / Hebrew".  Original language vocab will be shown.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/original_vocab_feature_.png\');width:190px;height:198px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold">How do I see Greek/Hebrew transliteration for my Bible?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'ESV_orig_voc_transliteration.gif\', 35)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Refer to the legend and select the Bible translations with the Vocab feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/esv_with_vocab_.png\');width:190px;height:306px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Click on the Option button, then click "Interlinear options”, then select "Transliteration".</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/transliteration_.png\');width:190px;height:230px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold">How do I see Greek/Hebrew vocabulary for a verse?    <a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'verse_vocab.gif\', 18)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the verse number to list the words and meanings</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/verse_vocab_.png\');width:190px;height:250px;border:3px solid black;display:none"></div>' +
								'<br>2) Hover over or click on a word for more details about the word</span>' +
							'</div>' +

						'<li style="font-weight:bold">How can I view multiple Bibles together as an Interlinear?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'OHB_ESV_Gen1.gif\', 40)">Video guides  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'&nbsp;&nbsp;' +
								'<a href="javascript:step.util.showVideoModal(\'KJV_THGNT_John1.gif\', 35)">' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Refer to the legend and select two Bible with the vocabulary feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_two_bibles_.png\');width:190px;height:322px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Click on the Option button, then click Interlinear”.  Interlinear will be shown.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/interlinear_.png\');width:190px;height:338px;border:3px solid black;display:none"></div>' +
							'</div>' +

						'<li style="font-weight:bold">How do I see the various versions of the Greek OT?<a id="ot-greek-qa" style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Select “Ancient” for the language</span>' +
								'<br><span>3) Scroll down to see the Greek OT translations</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/bible_ancient_.png\');width:190px;height:23px;border:3px solid black;display:none"></div>' +
								'<br><br><a id="otgreekexamples" href="html/additional_examples.html?exampleType=greekot&langFile=<%= step.userLanguageCode %>.<%= step.state.getCurrentVersion() %>.js"><%= __s.examples %></a>' +
								'<br><br>' +
							'</div>' +
						'<li style="font-weight:bold">How do I display the color-coded grammar?<a id="color-qa" style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'color_code_grammar.gif\', 50)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span>1) Click on the Bible translation button</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/select_bible_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
								'<br><span>2) Refer to the legend and select the Bible translations with the grammar feature</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/grammar_feature_.png\');width:190px;height:221px;border:3px solid black;display:none"></div>' +
								'<br><span>3) Click on the Option button, then click "Interlinear options", then click “Colour code grammar”. The text will then be colour coded.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/color_code_grammar_.png\');width:190px;height:273px;border:3px solid black;display:none"></div>' +
								'<br><span>4) To understand the colour code, click on the button “Configure colour code grammar”.</span>' +
								'<br><div class="faq_img" style="background-image: url(\'images\/configure_color_code_grammar_.png\');width:170px;height:78px;border:3px solid black;display:none"></div>' +
								'<br><br><a id="colorcodeexamples" href="html/additional_examples.html?exampleType=colorCode&langFile=<%= step.userLanguageCode %>.<%= step.state.getCurrentVersion() %>.js"><%= __s.examples %></a>' +
								'<br>' +
							'</div>' +
					'</ul>' +
				'</div>' +
			'</div>' +

			'<div class="accordion-row keyboard_shortcut" data-row="4">' +
				'<h5 class="accordion-heading stepButton">Additional questions' +
					'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
				'</h5>' +
				'<div class="accordion-body">' +
					'<ul style="padding-inline-start:10px">' +
						'<li class="keyboard_shortcut" style="font-weight:bold">How can I open the tutorial mode?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<span>Click on ' +
									'<a href="https://www.stepbible.org/html/split.html?/?q=reference=Gen.1&skipwelcome&secondURL=https://docs.google.com/presentation/d/10oUdTW40X3f5y4wmImxRW5_3zTJnRkVUVo4jz4mU9E4/preview" target="_blank">tutor mode</a>' +
								'</span>' +
								'<br>' +
							'</div>' +
						'<li class="keyboard_shortcut" style="font-weight:bold"><%= __s.quick_tutorial_header4 %>' +
							'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
							'<div class="stepExample" style="display:none">' +
								'<a href="javascript:step.util.showVideoModal(\'Keyboard.gif\', 85)">Video guide  ' +
									'<span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
								'<br><span><%= __s.keyboard_explain2 %>.</span><br>' +
							'</div>' +
					'</ul>' +
				'</div>' +
			'</div>' +

			// '<div class="accordion-row" data-row="4">' +
			// 	'<h5 class="accordion-heading stepButton">Additional FAQ' +
			// 		'<a class="plusminus glyphicon glyphicon-triangle-right"></a>' +
			// 	'</h5>' +
			// 	'<div class="accordion-body">' +
			// 		'<ul style="padding-inline-start:10px">' +
			// 			// '<li style="font-weight:bold">Where are the documentation on STEPBible?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
			// 			// 	'<div class="stepExample" style="display:none">' +
			// 			// 		'<br><a href="https://drive.google.com/file/d/1YllGKdletxufI_b6n8bOc5GCDBc_VX3x/view" target="_blank">1) Introduction guide</a>' +
			// 			// 		'<br><a href="https://stepbibleguide.blogspot.com/p/home_19.html" target="_blank">2) <%= __s.help_online %></a>' +
			// 			// 	'</div>' +

			// 			// '<li style="font-weight:bold">Where are the videos on STEPBible?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
			// 			// 	'<div class="stepExample" style="display:none">' +
			// 			// 		'<br><a href="https://www.youtube.com/watch?v=PzazvPVYoSg" target="_blank">1) Introduction video</a>' +
			// 			// 		'<br><a href="https://www.youtube.com/watch?v=zOmdjtlNLTg&t=119s" target="_blank">2) Independent review of STEPBible video</a>' +
			// 			// 		'<br><a href="https://www.youtube.com/channel/UCAmOaidZsuuhiW1X78UCaDQ" target="_blank">3) <%= __s.video_help %></a>' +
			// 			// 	'</div>' +

			// 			'<li style="font-weight:bold"><%= __s.display_classical_ui %>' +
			// 				'<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
			// 				'<div class="stepExample" style="display:none">' +
			// 					'<a href="javascript:step.util.showVideoModal(\'ClassicalUI.gif\', 23)">&nbsp;Video guide  <span class="glyphicon glyphicon-play-circle" style="font-size:16px"></span></a>' +
			// 					'<br><span><%= __s.advanced_interface_explain %></span>' +
			// 				'</div>' +
			// 			'<li style="font-weight:bold">How do I write my own notes?<a style="margin-bottom:6px;font-size:14px" class="glyphicon glyphicon-triangle-right stepExample"></a></li>' +
			// 				'<div class="stepExample" style="display:none">' +
			// 					'<span>1) Click the Resource icon.</span>' +
			//					'<br><div class="faq_img" style="background-image: url(\'images\/resource_icon_.png\');width:190px;height:68px;border:3px solid black;display:none"></div>' +
			// 					'<br><span>2) Click on "Create your own notes"</span>' +
			//					'<br><div class="faq_img" style="background-image: url(\'images\/create_notes_.png\');width:190px;height:171px;border:3px solid black;display:none"></div>' +
			// 				'</div>' +
			// 		'</ul>' +
			// 	'</div>' +
			// '</div>' +


			'<div id=\'colorCodeTableDiv\'></div>' +
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
			$("a.glyphicon.glyphicon-triangle-right.stepExample").click(step.util.expandCollapseExample);
            var options = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("selectedOptions") || [];
            var availableOptions = step.passages.findWhere({ passageId: step.util.activePassageId()}).get("options") || [];
            if ((options.indexOf("C") > -1) && (availableOptions.indexOf("C") > -1)) cf.initCanvasAndCssForClrCodeGrammar();
		}
        var classicalUISetting = step.util.localStorageGetItem("step.classicalUI");
		if (classicalUISetting === "true") $('#classicalUIVideo').hide();
		else $('#classicalUIVideo').show();
		var urlVars = $.getUrlVars();
		if (urlVars.indexOf("otgreekexamples") > -1) {
            this.toggleAccordion(3, 2);
			if ($("#ot-greek-qa").hasClass("glyphicon-triangle-right")) {
				$("#ot-greek-qa").click();
				setTimeout(function() {
					$("#otgreekexamples").get(0).scrollIntoView();
				}, 700);
			}
		}
		else if (urlVars.indexOf("colorexamples") > -1) {
			this.toggleAccordion(3, 2);
			if ($("#color-qa").hasClass("glyphicon-triangle-right")) {
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
            $accordionRow.find(".plusminus").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom")
			step.util.localStorageSetItem(storageKey, "true");
        }
        else {
            $accordionRow.find(".accordion-body").slideUp();
			$accordionRow.find(".accordion-heading").removeClass('stepPressedButton');
            $accordionRow.find(".plusminus").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right")
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
