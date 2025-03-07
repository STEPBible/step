var PickBibleView = Backbone.View.extend({
    versionTemplate: _.template('' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<% var keyForClass = key.replace(/[()\\s,\',]/g, "_"); %>' +
        '<span class="langSpan span_<%= keyForClass %>">' +
        '<button class="langBtn btn_<%= keyForClass %> stepButton">' +
        '<%= key.replace("_", " ") %>&nbsp;<span class="langPlusMinus plusminus_<%= key %>">+</span></button><br></span>' +
        '<ul class="list-group langUL ul_<%= keyForClass %>" style="display:none">' +
        '<% _.each(languageBibles, function(languageBible) { %>' +
        '<li class="list-group-item stepModalFgBg" data-initials="<%= languageBible.shortInitials %>" style="' + (step.state.isLtR() ? "padding-left" : "padding-right" ) + ':1.5em;text-indent:-1.5em;">' +
        '<input class="list-group-checkbox" type="checkbox" input-initials="<%= languageBible.shortInitials %>" style="margin-left:3px">&nbsp;' +
        '<% var bibleName = step.util.fineTuneBibleName(languageBible); %>' +
        '<a class="resource" href="javascript:void(0)" ><%= languageBible.shortInitials %> - <%= bibleName %></a>' +
        '&rlm;<a class="glyphicon glyphicon-info-sign" style="display:inline;margin-left:10px" title="<%= __s.passage_info_about_version %>" target="_blank" href="<%= window.location.origin %>/version.jsp?version=<%= languageBible.shortInitials %>"></a>' +
        '<span class="BibleFeatures" style="margin-top:4px;float:' + (step.state.isLtR() ? "right" : "left" ) + '"><%= step.util.ui.getFeaturesLabel(languageBible) %></span>' +
        '</li>' +
        '<% }) %>' +
        '</li>' +
        '</ul>' +
        '<% }) %>'),
    versionTemplateAll: _.template('' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<% var keyForClass = key.replace(/[()\\s,\',]/g, "_"); %>' +
        '<span class="langSpan span_<%= keyForClass %>">' +
        '<button class="langBtn btn_<%= keyForClass %> stepButton">' +
        '<%= key.replace("_", " ") %>&nbsp;<span class="langPlusMinus plusminus_<%= keyForClass %>">+</span></button><br></span>' +
        '<ul class="list-group langUL ul_<%= keyForClass %>" style="display:none">' +
        '<% _.each(languageBibles, function(languageBible) { %>' +
        '<li class="list-group-item stepModalFgBg " data-initials="<%= languageBible.shortInitials %>" style="' + (step.state.isLtR() ? "padding-left" : "padding-right" ) + ':1.5em;text-indent:-1.5em;">' +
        '<input class="list-group-checkbox" type="checkbox" input-initials="<%= languageBible.shortInitials %>" style="margin-left:3px">&nbsp;' +
        '<% var bibleName = step.util.fineTuneBibleName(languageBible); %>' +
        '<a class="resource" href="javascript:void(0)" ><%= languageBible.shortInitials %> - <%= bibleName %></a>' +
        '&rlm;<a class="glyphicon glyphicon-info-sign" style="display:inline;margin-left:10px" title="<%= __s.passage_info_about_version %>" target="_blank" href="<%= window.location.origin %>/version.jsp?version=<%= languageBible.shortInitials %>"></a>' +
        '<span class="BibleFeatures" style="margin-top:4px;float:' + (step.state.isLtR() ? "right" : "left" ) + '"><%= step.util.ui.getFeaturesLabel(languageBible) %></span>' +
        '</li>' +
        '<% }) %>' +
        '</li>' +
        '</ul>' +
        '<% }) %>'),
    filtersTemplate: _.template(
    	'<span class="' + (step.state.isLtR() ? "pull-left" : "pull-right" ) + '" style="font-size:13px;margin-top:9px;font-weight:bold"><%= __s.language %>:&nbsp;</span>' +
    	'<form role="form" class="form-inline" style="margin-top:8px">' +
        '<span class="form-group btn-group" data-toggle="buttons">' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="_all" /><%= __s.all  %></label>' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="en"  checked="checked" /><%= __s.english %></label>' +
        '<% if (Object.keys(myOtherLanguages).length > 3) { %>' +
            '<% for (var key in myOtherLanguages) { %>' +
				'<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="<%=key%>" title="<%= myOtherLanguages[key] %><%= key.toUpperCase() %></label>' +
            '<% } %>' +
        '<% } else { %>' +
            '<% for (var key in myOtherLanguages) { %>' +
            	  '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="<%=key%>" %><%= myOtherLanguages[key] %></label>' +
            '<% } %>' +
        '<% } %>' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="_ancient" /><%= __s.ancient %></label>' +
        '</span>' +
        '</form>'
        ),
    modalPopupTemplate: _.template('<div class="modal selectModal" id="bibleVersions" dir="<%= step.state.isLtR() ? "ltr" : "rtl" %>" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content stepModalFgBg">' +
        '<div class="modal-body">' +
        '<span class="pull-right">' + step.util.modalCloseBtn("bibleVersions") + '</span>' +
        '<ul class="nav nav-tabs bookTypeTabs">' +
        '<span class="' + (step.state.isLtR() ? "pull-left" : "pull-right" ) + '" style="font-size:13px;margin-top:12px;font-weight:bold"><%= __s.book_type %>:&nbsp;</span>' +
        '<li class="' + (step.state.isLtR() ? "pull-left" : "pull-right" ) + '"><a href="#bibleList" data-toggle="tab"><%= __s.bibles %></a></li>' +
        '<li class="' + (step.state.isLtR() ? "pull-left" : "pull-right" ) + '"><a href="#commentaryList" data-toggle="tab"><%= __s.commentaries %></a></li>' +
        '</ul>' +
        '<%= view.filtersTemplate({myOtherLanguages: myOtherLanguages}) %>' +
		'<label class="selectGeo" ' +
        'style="font-size:16px" ' +
        'for="selectGeo">Filter languges by geography:</label>' +
		'<select class="selectGeo" onchange=\'step.util.showByGeo()\'>' +
		  '<option value="all">All</option>' +
		  '<option value="africa">Africa</option>' +
		  '<option value="americas">Americas</option>' +
		  '<option value="east_south_east_asia">East and Southeast Asia</option>' +
		  '<option value="europe">Europe</option>' +
		  '<option value="oceania">Oceania</option>' +
		  '<option value="south_asia">South Asia</option>' +
		  '<option value="western_asia">Western Asia</option>' +
		'</select>' +
        '<div class="tab-content">' +
        '<div class="tab-pane" id="bibleList">' +
        '</div>' +
        '<div class="tab-pane" id="commentaryList">' +
        '</div>' +
        '</div>' + //end body
        '<div class="modal-footer">' +
            '<p><%= __s.bible_version_features %></p>' +
			'<span class="tagLine"></span>' +
            '<input type="text" id="enterYourTranslation" style="font-size:14px;height:24px" placeholder="<%= __s.pick_bible_input_short_placeholder %>"></input>' +
			'<button id ="order_button_bible_modal" class="btn btn-default btn-sm stepButton" data-dismiss="modal"><label><%= __s.update_display_order %></label></button>' +
            '<button id ="ok_button_bible_modal" class="btn btn-default btn-sm stepButton" data-dismiss="modal"><label><%= __s.ok %></label></button></div>' +
        '</div>' + //end content
        '</div>' + //end dialog
        '</div>' +
        '</div>'),
    suggestedEnglish: ['ESV', 'NIV', 'NASB2020', 'KJVA', 'NET2full', 'HCSB', 'BSB', 'ASV-TH', 'DRC', 'CPDV'],
    ancientBlackList: ["HebModern"],
    ancientOrder: [
        [__s.widely_used, ['THOT', 'LXX', 'THGNT', 'Byz', 'TR', 'SBLG']],
        [__s.hebrew_ot, ['THOT', "Alep", "OHB", "WLC", "MapM"]],
        [__s.greek_ot, ["LXX_th", "AB", "abpen_sb", "abpgk_sb"]],
        [__s.greek_nt, ["Ant", "Byz", "Elzevir", "Nestle", "SBLG", "SRGNT", "THGNT", "Tisch", "TNT", "TR", "WHNU"]],
        [__s.coptic_texts, ["CopNT", "CopSahHorner", "CopSahidica", "CopSahidicMSS"]],
        [__s.latin_texts, ["DRC", "Vulgate", "VulgSistine", "VulgHetzenauer", "VulgConte", "VulgClementine"]],
        [__s.coptic_texts, ["CopNT", "CopSahHorner", "CopSahidica", "CopSahidicMSS"]],
        [__s.syriac_texts, ["Peshitta", "Etheridge", "Murdock"]],
        [__s.alternative_samaritan, ["SP", "SPMT", "SPVar", "SPDSS", "SPE"]],
        [__s.uncategorized_resources, []]
    ],
    userHasUpdated: false,
    numberOfVersionsSelected: 0,
    el: function () {
        var el = $("<div>");
        $("body").append(el);
        return el;
    },
    _populateAncientBibles: function (arr) {
        var addedBibles = {};
        // if (_.isEmpty(arr)) {
            //pre-populate the groups in the right order
            for (var i = 0; i < this.ancientOrder.length; i++) {
                var group = arr[this.ancientOrder[i][0]] = [];
                for (var j = 0; j < this.ancientOrder[i][1].length; j++) {
                    var currentVersion = step.keyedVersions[this.ancientOrder[i][1][j]];
                    if (currentVersion) {
						group.push(currentVersion);
						addedBibles[currentVersion.shortInitials] = currentVersion;
                    }
                }
            }
        // }
        return addedBibles;
    },
    _addGroupingByLanguage: function (arr, key, version) {
        //we don't add it if the key isn't the short initials
        if(key != version.shortInitials) {
            return;
        }
        
        if (!arr[version.languageName]) {
            arr[version.languageName] = [];
        }
        arr[version.languageName].push(version);
    },
    getUserOtherLanguages: function() {
        var myOtherLanguages = {};
        if (step.userLanguageCode.indexOf("en") != 0)
            myOtherLanguages[ step.userLanguageCode.split("_")[0].split("-"[0]) ] = step.userLanguage;
        if (typeof step.acceptLanguages === "string") {
            var allAcceptedLanguages = step.acceptLanguages.replace(/\[/g, "").replace(/\]/g, "").replace(/ /g, "").toLowerCase().split(",");
            if (allAcceptedLanguages.length > 0) {
                var intlDisplayNames = null;
                try {
                    intlDisplayNames = new Intl.DisplayNames([step.userLanguageCode.split("_")[0].split("-")[0]], { type: 'language' });
                }
                catch(err) {
                    console.log("Cannot not get Intl.DisplayName for " + step.userLanguageCode + " " + err.message);
                }
                for (var i = 0; i < allAcceptedLanguages.length; i++) {
                    var curCode = allAcceptedLanguages[i].split("_")[0].split("-")[0];
                    if (curCode === "en") continue; // English is a primary language in STEP
                    if (typeof myOtherLanguages[curCode] === "string")
                        continue; // Already took care of this language.
                    myOtherLanguages[curCode] = curCode.toUpperCase();
                    if (intlDisplayNames) {
                        try {
                            myOtherLanguages[curCode] = intlDisplayNames.of(curCode);
                        }
                        catch(err) {
                            console.log("Cannot get name of language code: " + curCode + " " + err.message);
                        }
                    }
                }
            }
        }
        return myOtherLanguages;
    },
    initialize: function (opts) {
        _.bindAll(this);
        var self = this;
        this.searchView = opts.searchView;
         this.$el.append(this.modalPopupTemplate({
            view: this,
            myOtherLanguages: this.getUserOtherLanguages()
        }));

        //make the right button active
        var language = this._getLanguage();
        userHasUpdated = false;
        this.$el.find(".btn").has("input[data-lang='" + language + "']").addClass("active").addClass("stepPressedButton");
        $(".bookTypeTabs li").on('shown.bs.tab', function (event) {
            self.model.save({ selectedVersionsTab: $(event.target).attr("href") });
            self._filter();
        });
        this.$el.find(this._getBookTypeTab()).addClass("active");
        this.bibleVersions = this.$el.find("#bibleVersions").modal({ show: true});
        step.util.blockBackgroundScrolling("bibleVersions");

        this.$el.find(".btn").click(this.handleLanguageButton);
        this.$el.find(".closeModal").click(this.closeModal);
        this.$el.find("#order_button_bible_modal").click(this.orderButton);
        var okButton = this.okButton;
        this.$el.find("#ok_button_bible_modal").click(okButton);
        $('#bibleVersions').on('hidden.bs.modal', function (ev) {
            okButton();
            $('#bibleVersions').remove(); // Need to be removed, if not the next call to this routine will display an empty tab (Bible or Commentary).
        });
        this._filter(false, true); // 1st param not called for Keyboard, 2nd param call from initialize()
	    $("input#enterYourTranslation").keyup(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			self._handleEnteredTranslation(code, self._filter);
		});
		if (!step.touchDevice) $('input#enterYourTranslation').focus();
    },
	_handleEnteredTranslation: function (keyCode, filterFunc) {
		var userInput = $('input#enterYourTranslation').val();
		userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s+/g, ' ').replace(/^\s+/g, '')
		if (keyCode !== 13) { // 13 is enter key
			if (userInput.length > 0) {
				filterFunc(true);
				$('.langSpan').hide();
				$('.langBtn').hide();
				$('.list-group').show();
				$('.list-group-item').hide();
				$('.list-group-item.active').show();
				var regex1 = new RegExp("(^\\w*" + userInput + "|[(\\s\\.]" + userInput + ")", "i");
				$( ".list-group-item").filter(function () { return regex1.test($(this).text());}).show();
				var itemsShown = $("li.list-group-item:visible");
				for (var i = 0; i < itemsShown.length; i++) {
					var classes = $(itemsShown[i]).parent().attr('class').split(' ');
					for (var j = 0; j < classes.length; j++) {
						if (classes[j].substr(0, 3) === "ul_") {
							var langCode = classes[j].substr(3);
							$('.span_' + langCode).show();
							$('.btn_' + langCode).show();
							break;
						}
					}
				}
				step.util.addTagLine();
                var selectedBible = __s.selected_bibles.replace(/[()\s,\']/g, "_");
                $('.btn_' + selectedBible).show();
                $('.span_' + selectedBible).show();
                $('.ul_' + selectedBible).show();
                $('.ul_' + selectedBible).find("li").show();
			}
			else filterFunc(); // reset back to the modal without keyboard input
		}
		else {
			$('input#enterYourTranslation').val(userInput);
			$('.list-group-item:visible')[0].click();
		}
	},
    closeModal: function (ev) {
        if (ev) ev.preventDefault();
        this.bibleVersions.modal("hide");
        this.remove();
    },
    orderButton: function (ev) {
        this.closeModal(ev);
        element = document.getElementById('orderVersionModal');
        if (element) element.parentNode.removeChild(element);

		var jsVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";
		$('<div id="orderVersionModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
			'<div class="modal-dialog">' +
				'<div class="modal-content stepModalFgBg">' +
					'<style>' +
						'#nestedVersion div, .nested-1 {' +
							'margin-top: 5px;' +
						'}' +
						'.nested-1 {' +
							'background-color: #e6e6e6;' +
						'}' +
					'</style>' +  
					'<div class="modal-header">' +
						step.util.modalCloseBtn(null, "userCloseVersionOrder") +
					'</div>' +
					'<div class="modal-body">' +
						'<div id="sortVersionModal"></div>' +
							'<div class="footer">' +
								'<button id="updateVersionOrderButton" class="btn btn-default btn-xs closeModal stepButton pull-right" onclick=saveVersionOrder()><label>Update order</label></button>' +
								'<br>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<script src="js/order_version.' + jsVersion + 'js"></script>' +
				'<script src="libs/Sortable.min.js"></script>' +
				'<script>' +
					'$( document ).ready(function() {' +
						'init_order_version();' +
					'});' +
				'</script>' +
			'</div>' +
		'</div>').modal("show");;
    },
    okButton: function (ev) {
        this.closeModal(ev);
        if (userHasUpdated) {
            userHasUpdated = false;
            window.searchView.search();
            return;
        }
    },
    handleLanguageButton: function (ev) {
    	var target = $(ev.target).find("input");
    	var language = target.data("lang");
        this.model.save({
            selectedLanguageSet: language
        });
        this._filter();
    },
    _getBookTypeTab: function () {
        var bookTypeTab = this.model.get("selectedVersionsTab");
        if (bookTypeTab == null) {
            bookTypeTab =  "#bibleList";
            this.model.save({
                selectedVersionsTab: bookTypeTab
            })
        }
        return bookTypeTab;
    },
    _getLanguage: function () {
        var selectedLanguage = this.model.get("selectedLanguageSet");
        if (selectedLanguage == null) {
            selectedLanguage = step.userLanguageCode;
            this.model.save({ selectedLanguageSet: selectedLanguage });
        }
        return selectedLanguage;
    },
    _filter: function (keyboard, calledFromInitialize) {
        var self = this;
        var selectedLanguage = (keyboard) ? "_all" : this._getLanguage();
        var origLanguage = selectedLanguage;
		if (selectedLanguage === "zh_TW") selectedLanguage = "zh";
        var bookTypeTab = this._getBookTypeTab();
        var filter = (bookTypeTab === '#commentaryList') ? "COMMENTARY" : "BIBLE";
        var bookTypeTabsLi = $(".bookTypeTabs li");
        bookTypeTabsLi.removeClass("active").find("a").css("font-weight","normal").css("font-size","12px");
        bookTypeTabsLi.has("a[href='" + bookTypeTab + "']").addClass("active").find("a").css("font-weight","bold").css("font-size","13px");

		$('.form-inline').find('.btn.btn-default.btn-sm.stepButton').removeClass("active");
        this.$el.find(".btn.stepPressedButton").removeClass("stepPressedButton");
        this.$el.find(".btn").has("input[data-lang='" + origLanguage + "']").addClass("stepPressedButton").addClass("active");

        $('.form-inline').find(".btn").has("input").show()
        if (bookTypeTab === '#commentaryList') {
            var inputFields = $('.form-inline').find('.btn.btn-default.btn-sm.stepButton input');
            for (var i = 0; i < inputFields.length; i ++) {
                var curInputField = $(inputFields[i]);
                var curLangCode = curInputField.data("lang");
                // We currently only have commentaries in English, ancient Greek, Greek, German, Dutch and Latin
                if (" en _ancient _all de grc nl la ".indexOf(" " + curLangCode.toLowerCase() + " ") == -1) {
                    var curButton = this.$el.find(".btn").has("input[data-lang='" + curLangCode + "']");
                	if ((curButton.hasClass("stepPressedButton")) || (curButton.hasClass("active"))) {
                        curButton.removeClass("stepPressedButton").removeClass("active");
                        this.$el.find(".btn").has("input[data-lang='en']").addClass("stepPressedButton").addClass("active");
                        selectedLanguage = "en";
                    }
                    curButton.hide();
                }
            }
        }

        var bibleList = {};

        var versionsSelected = (typeof self.searchView._getCurrentInitials === "undefined") ?
			window.searchView._getCurrentInitials() : self.searchView._getCurrentInitials();
        var numberOfVersionsSelected = 0;
		var currentBiblesOpened = [];
		if (calledFromInitialize) {
			var currentTokens = step.util.activePassage().get("searchTokens") || [];
			for (var i = 0; i < currentTokens.length; i++) {
				if (currentTokens[i].itemType == VERSION)
					currentBiblesOpened.push(currentTokens[i].item.shortInitials);
			}
		}
        for (i = versionsSelected.length - 1; i > -1 ; i --) {
            if (versionsSelected[i] !== undefined) {
                if (((!calledFromInitialize) || (currentBiblesOpened.indexOf(versionsSelected[i]) > -1))) {
                    numberOfVersionsSelected ++;
                }
                else { // Not a Bible which is open. Maybe user selected a Bible without clicking OK and then left the modal (e.g.: without clicking on the close button).
                    if (calledFromInitialize) {
                        Backbone.Events.trigger("search:remove", { value: step.keyedVersions[versionsSelected[i]], itemType: VERSION});
                        console.log("Removed " + versionsSelected[i] + " because it is not open");
                    }
                    versionsSelected.splice(i, 1);
                }
            }
        }
        for (i = 0; i < currentBiblesOpened.length; i ++) {
            if (versionsSelected.indexOf(currentBiblesOpened[i]) == -1) {
                versionsSelected.push(currentBiblesOpened[i]);
                numberOfVersionsSelected ++;
                Backbone.Events.trigger("search:add", { value: step.keyedVersions[currentBiblesOpened[i]], itemType: VERSION});
                console.log("Added " + currentBiblesOpened[i] + " because it is open");
            }
        }
		var addedToSelectedGroup = [];
        if (filter == 'BIBLE') {
            for (var v in step.keyedVersions) {
                var version = step.keyedVersions[v];
                var i = versionsSelected.indexOf(version.shortInitials);
                if (version.category == 'BIBLE' && (i > -1) && addedToSelectedGroup.indexOf(version.shortInitials) == -1) {
                    var selectedBible = __s.selected_bibles.replace(/[()\s,\']/g, "_");
                    if (!bibleList[selectedBible]) {
                        bibleList[selectedBible] = [];
                    }
					var copiedVersion = JSON.parse(JSON.stringify(version)); // Don't want to update the original step.keyedVersions object
                    copiedVersion.languageCode = selectedBible;
                    bibleList[selectedBible].push(copiedVersion);
                    addedToSelectedGroup.push(version.shortInitials);
                }
            }
        }

        if (selectedLanguage === "_ancient" && filter === 'BIBLE') {
            var added = this._populateAncientBibles(bibleList);
            //now go through Bibles adding if not already present
            for (var v in step.keyedVersions) {
                var version = step.keyedVersions[v];
                if ((version.languageCode == 'he' || version.languageCode == 'hbo' || version.languageCode == 'grc') &&
                    version.category == 'BIBLE' && 
                    !added[version.shortInitials] &&
                    this.ancientBlackList.indexOf(version.shortInitials) == -1) {
					bibleList[this.ancientOrder[this.ancientOrder.length - 1][0]].push(version);
                }
            }
        } else {
            if (selectedLanguage == 'en' && filter == 'BIBLE') {
                //if English, add the English Bibles first...
                for (var i = 0; i < this.suggestedEnglish.length; i++) {
                    var v = step.keyedVersions[this.suggestedEnglish[i]];
                    if (v) {
						if (!bibleList[__s.widely_used]) {
							bibleList[__s.widely_used] = [];
						}
						bibleList[__s.widely_used].push(v);
                    }
                }
            }

            for (var v in step.keyedVersions) {
                var version = step.keyedVersions[v];
                if(version.category != filter) {
                    continue;
                }
                if (this._isLanguageValid(version.languageCode, selectedLanguage)) {
                    if (selectedLanguage === "_all") {
                        //now filter by language:
                        this._addGroupingByLanguage(bibleList, v, version);
                    } else if (selectedLanguage === "en") {
                        if (version.languageCode === "en") {
                            this._addGroupingByLanguage(bibleList, v, version);
                        }
                    } else if(selectedLanguage === "_ancient") { 
                        if((version.languageCode == 'he' || version.languageCode == 'hbo' || version.languageCode == 'grc')) {
                            this._addGroupingByLanguage(bibleList, v, version);
                        }  
                    } else {
                        // a single non-English language, so can re-use the group by functionality
                        this._addGroupingByLanguage(bibleList, v, version);
                    }
                }
            }
        }
        this.$el.find(".tab-pane").empty();
		var uniqueBibleList = [];
		for (var key in bibleList) { 
			if (bibleList[key].length == 0)
				delete bibleList[key];
			else if (selectedLanguage === "_all") {
				if (uniqueBibleList.indexOf(bibleList[key][0].languageCode) > -1) console.log("Same language code shows up in two groups of language: " + bibleList[key][0].languageCode);
				else uniqueBibleList.push(bibleList[key][0].languageCode);
			}
		}
		var templateName = (selectedLanguage === "_all") ? this.versionTemplateAll : this.versionTemplate;
		this.$el.find(bookTypeTab).append(templateName({
            versions: bibleList
        }));

        this.$el.find(".glyphicon-info-sign").click(function (ev) {
            ev.stopPropagation();
        });
        if (numberOfVersionsSelected > 1) $('#order_button_bible_modal').show();
        else $('#order_button_bible_modal').hide();
        this.$el.find(".list-group-item").click(function (ev) {
            var target = $(this);
            var version = step.keyedVersions[target.data("initials")];

            //also look for the item in the rest of the list and mark that
            //self.$el.find("[data-initials='" + version.shortInitials + "']").toggleClass("active");
            userHasUpdated = true;
            var checkboxes = self.$el.find("[input-initials='" + version.shortInitials + "']");
            // var added = target.hasClass("active");
            var added = false;
            if (ev.target.type === "checkbox") {
                added = ev.target.checked;
                console.log("ev.target.checked is " + ev.target.checked);
            }
            else added = !checkboxes[0].checked;
            if (added) {
                Backbone.Events.trigger("search:add", { value: version, itemType: VERSION });
                numberOfVersionsSelected ++;
                checkboxes.prop("checked", true);
            } else {
                Backbone.Events.trigger("search:remove", { value: version, itemType: VERSION});
                numberOfVersionsSelected --;
                checkboxes.prop("checked", false);
            }
            if (numberOfVersionsSelected > 1) $('#order_button_bible_modal').show();
            else $('#order_button_bible_modal').hide();
        }).each(function (i, item) {
            var el = $(this);
            var currentInitials = el.data("initials");
            if (versionsSelected.indexOf(currentInitials) != -1) {
                // el.addClass("active");
                self.$el.find("[input-initials='" + currentInitials + "']").prop("checked", true);
            }
        });
        if ((bookTypeTab !== '#commentaryList') && (selectedLanguage === "_all")) {
			if (keyboard) $('.selectGeo').hide();
			else $('.selectGeo').show();
		}
        else {
            $('.selectGeo').hide();
            $('.langSpan').show();
            $('.langBtn').show();
            $('.langBtn').addClass('stepPressedButton');
            $('.langPlusMinus').text('-');
            $('.langUL').show();
        }
		if (!keyboard) {
			step.util.addTagLine();
			$('input#enterYourTranslation').val("");
		}
        this.$el.find(".langBtn").click(this._handleUsrClick);
        this.$el.find(".langPlusMinus").click(this._handleUsrClick);
		if (selectedLanguage === "_all") {
            var selectedBible = __s.selected_bibles.replace(/[()\s,\']/g, "_");
			$(".btn_" + selectedBible).click();
		}
		else {
			var listObj = $(".ul_" + __s.widely_used.replace(/[()\s,']/g, "_"));
			for (var i = 0; i < addedToSelectedGroup.length; i++) {
				listObj.find("[data-initials='" + addedToSelectedGroup[i] + "']").hide()
			}
		}
        step.util.adjustBibleListingHeight();
    },
    _isLanguageValid: function (actualLanguage, wantedLanguage) {
        if (wantedLanguage === "_all") {
            return true;
        }
        if (wantedLanguage === "_ancient") {
            return actualLanguage === "he" || actualLanguage === "hbo" || actualLanguage === "grc";
        }
        if (wantedLanguage === "fil") {
            return ((actualLanguage === "tl") || (actualLanguage === "fil"));
        }
        return actualLanguage == wantedLanguage;
    },
    _handleUsrClick: function (event) {
        event.stopPropagation();
        var btnClassName = "";
        var plusminusClassName = "";
        var ulClassName = "";
        for (var i = 0; i < event.target.classList.length; i++) {
            if (event.target.classList[i].substr(0, 4) === "btn_") {
                btnClassName = '.' + event.target.classList[i];
                plusminusClassName = ".plusminus_" + event.target.classList[i].substr(4);
                ulClassName = ".ul_" + event.target.classList[i].substr(4);
                break;
            }
            else if (event.target.classList[i].substr(0, 10) === "plusminus_") {
                btnClassName = '.btn_' + event.target.classList[i].substr(10);
                plusminusClassName = '.' + event.target.classList[i];
                ulClassName = ".ul_" + event.target.classList[i].substr(10);
                break;
            }
        }
        if (btnClassName !== "") {
            if ($(ulClassName).is(":visible")) {
                $(ulClassName).hide();
                $(btnClassName).removeClass('stepPressedButton');
                $(plusminusClassName).text('+');
            }
            else {
                $(ulClassName).show();
                $(btnClassName).addClass('stepPressedButton');
                $(plusminusClassName).text('-');
            }
        }
		step.util.addTagLine();
        step.util.adjustBibleListingHeight();
    }
});