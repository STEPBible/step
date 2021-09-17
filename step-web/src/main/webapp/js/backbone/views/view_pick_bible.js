var PickBibleView = Backbone.View.extend({
    versionTemplate: _.template('' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<span class="langSpan span_<%= key.replace(/[()\\s,\']/g, "_") %>">' +
        '<button class="langBtn btn_<%= key.replace(/[()\\s,\']/g, "_") %> stepButton">' +
        '<%= key %>&nbsp;<span class="langPlusMinus plusminus_<%= key.replace(/[()\\s,\']/g, "_") %>">+</span></button><br></span>' +
        '<ul class="list-group langUL ul_<%= key.replace(/[()\\s,\']/g, "_") %>" style="display:none">' +
        '<% _.each(languageBibles, function(languageBible) { %>' +
        '<li class="list-group-item" data-initials="<%= languageBible.shortInitials %>">' +
        '<a class="glyphicon glyphicon-info-sign" title="<%= __s.passage_info_about_version %>" target="_blank" href="http://<%= step.state.getDomain() %>/version.jsp?version=<%= languageBible.shortInitials %>"></a>' +
        '<a class="resource" href="javascript:void(0)">' +
        '<%= languageBible.shortInitials %> - <%= languageBible.name %> <span class="pull-right"><%= step.util.ui.getFeaturesLabel(languageBible) %></span></a></li>' +
        '<% }) %>' +
        '</li>' +
        '</ul>' +
        '<% }) %>'),
    versionTemplateAll: _.template('' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<span class="langSpan span_<%= languageBibles[0].languageCode.replace(/[()\\s,\']/g, "_") %>">' +
        '<button class="langBtn btn_<%= languageBibles[0].languageCode.replace(/[()\\s,\']/g, "_") %> stepButton">' +
        '<%= key %>&nbsp;<span class="langPlusMinus plusminus_<%= languageBibles[0].languageCode.replace(/[()\\s,\']/g, "_") %>">+</span></button><br></span>' +
        '<ul class="list-group langUL ul_<%= languageBibles[0].languageCode.replace(/[()\\s,\']/g, "_") %>" style="display:none">' +
        '<% _.each(languageBibles, function(languageBible) { %>' +
        '<li class="list-group-item" data-initials="<%= languageBible.shortInitials %>">' +
        '<a class="glyphicon glyphicon-info-sign" title="<%= __s.passage_info_about_version %>" target="_blank" href="http://<%= step.state.getDomain() %>/version.jsp?version=<%= languageBible.shortInitials %>"></a>' +
        '<a class="resource" href="javascript:void(0)">' +
        '<%= languageBible.shortInitials %> - <%= languageBible.name %> <span class="pull-right"><%= step.util.ui.getFeaturesLabel(languageBible) %></span></a></li>' +
        '<% }) %>' +
        '</li>' +
        '</ul>' +
        '<% }) %>'),
    filtersTemplate: _.template('<form role="form" class="form-inline">' +
        '<span class="form-group btn-group" data-toggle="buttons">' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="_all" /><%= __s.all  %></label>' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="en"  checked="checked" /><%= __s.english %></label>' +
        '<% if(step.userLanguageCode != "en") { %>' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="<%= step.userLanguageCode %>" /><%= step.userLanguage %></label>' +
        '<% } %>' +
        '<label class="btn btn-default btn-sm stepButton"><input type="radio" name="languageFilter" data-lang="_ancient" /><%= __s.ancient %></label>' +
        '</span>' +
		'&nbsp;&nbsp;&nbsp;<button type="button" class="close" data-dismiss="modal">X</button>' +
        '</form>'),
    modalPopupTemplate: _.template('<div class="modal selectModal" id="bibleVersions" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-body">' +
        '<span class="pull-right"><%= view.filtersTemplate({myLanguage: myLanguage}) %></span>' +
        '<ul class="nav nav-tabs">' +
        '<li><a href="#bibleList" data-toggle="tab"><%= __s.bibles %></a></li>' +
        '<li><a href="#commentaryList" data-toggle="tab"><%= __s.commentaries %></a></li>' +
        '</ul>' +
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
        '<p>Features: N=Notes G=Grammar V=Vocab I=Interlinear S=Septuagint interlinear A=Alt verse numbers</p>' +
        '<div class="tab-content">' +
        '<div class="tab-pane" id="bibleList">' +
        '</div>' +
        '<div class="tab-pane" id="commentaryList">' +
        '</div>' +
        '</div>' + //end body
        '<div class="modal-footer">' +
			'<img id="keyboard_icon" class="pull-left" src="/images/keyboard.jpg" alt="Keyboard entry">' +
			'<textarea id="enterYourTranslation" class="pull-left" rows="1" style="font-size:16px; width: 18%;"></textarea>' +
			'<span class="tagLine"></span>' +
			'<button id ="order_button_bible_modal" class="btn btn-default btn-sm stepButton" data-dismiss="modal"><label><%= __s.update_display_order %></label></button>' +
            '<button id ="ok_button_bible_modal" class="btn btn-default btn-sm stepButton" data-dismiss="modal"><label><%= __s.ok %></label></button></div>' +
        '</div>' + //end content
        '</div>' + //end dialog
        '</div>' +
        '</div>'),
    suggestedEnglish: ['ESV', 'NIV', 'NASB_th', 'KJVA', 'NETfull', 'HCSB', 'BSB', 'ASV-TH', 'DRC', 'CPDV'],
    ancientBlackList: ["HebModern"],
    ancientOrder: [
        [__s.widely_used, ['THOT', 'LXX', 'THGNT', 'Byz', 'TR', 'SBLG']],
        [__s.hebrew_ot, ['THOT', "Alep", "OHB", "WLC", "MapM"]],
        [__s.greek_ot, ["LXX_th", "AB", "abpen_th", "abpgk_th"]],
        [__s.greek_nt, ["Ant", "Byz", "Elzevir", "Nestle", "SBLG", "THGNT", "Tisch", "TNT", "TR", "WHNU"]],
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
    initialize: function (opts) {
        _.bindAll(this);
        var self = this;
        this.searchView = opts.searchView;

        this.$el.append(this.modalPopupTemplate({
            view: this,
            myLanguage: "en"
        }));

        //make the right button active
        var language = this._getLanguage();
        userHasUpdated = false;
        this.$el.find(".btn").has("input[data-lang='" + language + "']").addClass("active").addClass("stepPressedButton");

        var navTabsLi = $(".nav-tabs li");
        navTabsLi.has("a[href='" + this._getSelectedTab() + "']").addClass("active");
        navTabsLi.on('shown.bs.tab', function (event) {
            self.model.save({ selectedVersionsTab: $(event.target).attr("href") });
            self._filter();
        });

        this.$el.find(this._getSelectedTab()).addClass("active");
        this.bibleVersions = this.$el.find("#bibleVersions").modal({ show: true});
        // this.$el.find("input[type='text']").focus();
        this.$el.find(".btn").click(this.handleLanguageButton);
        this.$el.find(".closeModal").click(this.closeModal);
        this.$el.find("#order_button_bible_modal").click(this.orderButton);
        this.$el.find("#ok_button_bible_modal").click(this.okButton);
        $('#bibleVersions').on('hidden.bs.modal', function (ev) {
            $('#bibleVersions').remove(); // Need to be removed, if not the next call to this routine will display an empty tab (Bible or Commentary).
        });
        this._filter();
	    $("textarea#enterYourTranslation").keyup(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			self._handleEnteredTranslation(code, self._filter);
		});
		if (!step.touchDevice) $('textarea#enterYourTranslation').focus();
    },
	_handleEnteredTranslation: function (keyCode, filterFunc) {
		var userInput = $('textarea#enterYourTranslation').val();
		userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s+/g, ' ').replace(/^\s+/g, '')
		if (keyCode !== 13) { // 13 is enter key
			if (userInput.length > 0) {
				filterFunc(true);
				$('.langSpan').hide();
				$('.langBtn').hide();
				$('.list-group').show();
				$('.list-group-item').hide();
				$('.list-group-item.active').show();
				$('.ul_selected').hide()
				var regex1 = new RegExp("(^\\w*" + userInput + "|[\\s\\.]" + userInput + ")", "i");
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
			}
			else filterFunc(); // reset back to the modal without keyboard input
		}
		else {
			$('textarea#enterYourTranslation').val(userInput);
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
				'<div class="modal-content">' +
					'<style>' +
						'#nestedVersion div, .nested-1 {' +
							'margin-top: 5px;' +
						'}' +
						'.nested-1 {' +
							'background-color: #e6e6e6;' +
						'}' +
					'</style>' +  
					'<div class="modal-header">' +
						'<button type="button" class="close" data-dismiss="modal" onclick=userCloseVersionOrder()>X</button>' +
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
				'<script src="/js/order_version.' + jsVersion + 'js"></script>' +
				'<script src="/libs/Sortable.min.js"></script>' +
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
    _getSelectedTab: function () {
        var selectedTab = this.model.get("selectedVersionsTab");
        if (selectedTab == null) {
            selectedTab =  "#bibleList";
            this.model.save({
                selectedVersionsTab: selectedTab
            })
        }
        return selectedTab;
    },
    _getLanguage: function () {
        var selectedLanguage = this.model.get("selectedLanguageSet");
        if (selectedLanguage == null) {
            selectedLanguage = step.userLanguageCode;
            this.model.save({ selectedLanguageSet: selectedLanguage });
        }
        return selectedLanguage;
    },
    _filter: function (keyboard) {
        var self = this;
        var selectedTab = this._getSelectedTab();
        var selectedLanguage = (keyboard) ? "_all" : this._getLanguage();
        var origLanguage = selectedLanguage;
		if (selectedLanguage == "zh_TW") selectedLanguage = "zh";

        var filter = (selectedTab == '#commentaryList') ? "COMMENTARY" : "BIBLE";
		$('.form-inline').find('.btn.btn-default.btn-sm.stepButton').removeClass("active");
        this.$el.find(".btn.stepPressedButton").removeClass("stepPressedButton");
        this.$el.find(".btn").has("input[data-lang='" + origLanguage + "']").addClass("stepPressedButton").addClass("active");

        var bibleList = {};

        var versionsSelected = (typeof self.searchView._getCurrentInitials === "undefined") ?
			window.searchView._getCurrentInitials() : self.searchView._getCurrentInitials();
        numberOfVersionsSelected = 0;
        for (i = 0; i < versionsSelected.length; i ++) {
            if (versionsSelected[i] !== undefined) {
				numberOfVersionsSelected ++;
			}
			else {
				versionsSelected.splice(i, 1);
				i --;
			}
        }
		var addedToSelectedGroup = [];
        if (filter == 'BIBLE') {
            for (var v in step.keyedVersions) {
                var version = step.keyedVersions[v];
                var i = versionsSelected.indexOf(version.shortInitials);
                if (version.category == 'BIBLE' && (i > -1) && addedToSelectedGroup.indexOf(version.shortInitials) == -1) {
                    if (!bibleList[__s.selected_bibles]) {
                        bibleList[__s.selected_bibles] = [];
                    }
					var copiedVersion = JSON.parse(JSON.stringify(version)); // Don't want to update the original step.keyedVersions object
                    copiedVersion.languageCode = __s.selected_bibles;
                    bibleList[__s.selected_bibles].push(copiedVersion);
                    addedToSelectedGroup.push(version.shortInitials);
                }
            }
        }

        if (selectedLanguage == "_ancient" && filter == 'BIBLE') {
            var added = this._populateAncientBibles(bibleList);
            //now go through Bibles adding if not already present
            for (var v in step.keyedVersions) {
                var version = step.keyedVersions[v];
                if ((version.languageCode == 'he' || version.languageCode == 'grc') &&
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
                    if (selectedLanguage == "_all") {
                        //now filter by language:
                        this._addGroupingByLanguage(bibleList, v, version);
                    } else if (selectedLanguage == "en") {
                        if (version.languageCode == "en") {
                            this._addGroupingByLanguage(bibleList, v, version);
                        }
                    } else if(selectedLanguage == "_ancient") { 
                        if((version.languageCode == 'he' || version.languageCode == 'grc')) {
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
			if (bibleList[key].length == 0) {
				// console.log("No Bible module for " + key);
				delete bibleList[key];
			}
			else if (selectedLanguage == "_all") {
				if (uniqueBibleList.indexOf(bibleList[key][0].languageCode) > -1) console.log("Same language code shows up in two groups of language: " + bibleList[key][0].languageCode);
				else uniqueBibleList.push(bibleList[key][0].languageCode);
			}
		}
		var templateName = (selectedLanguage === "_all") ? this.versionTemplateAll : this.versionTemplate;
		this.$el.find(selectedTab).append(templateName({
            versions: bibleList
        }));

        this.$el.find(".glyphicon-info-sign").click(function (ev) {
            ev.stopPropagation();
        });
        if (numberOfVersionsSelected > 1) $('#order_button_bible_modal').show();
        else $('#order_button_bible_modal').hide();
        this.$el.find(".list-group-item").click(function () {
            var target = $(this);
            var version = step.keyedVersions[target.data("initials")];

            //also look for the item in the rest of the list and mark that
            self.$el.find("[data-initials='" + version.shortInitials + "']").toggleClass("active");
            var added = target.hasClass("active");
            userHasUpdated = true;
            if (added) {
                Backbone.Events.trigger("search:add", { value: version, itemType: VERSION });
                numberOfVersionsSelected ++;
            } else {
                Backbone.Events.trigger("search:remove", { value: version, itemType: VERSION});
                numberOfVersionsSelected --;
            }
            if (numberOfVersionsSelected > 1) $('#order_button_bible_modal').show();
            else $('#order_button_bible_modal').hide();
        }).each(function (i, item) {
            var el = $(this);
            if (versionsSelected.indexOf(el.data("initials")) != -1) {
                el.addClass("active");
            }
        });
        if ((selectedTab !== '#commentaryList') && (selectedLanguage == "_all")) {
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
			$('textarea#enterYourTranslation').val("");
		}
        this.$el.find(".langBtn").click(this._handleUsrClick);
        this.$el.find(".langPlusMinus").click(this._handleUsrClick);
		if (selectedLanguage === "_all") {
			$(".btn_Selected").click();
		}
		else {
			var listObj = $(".ul_" + __s.widely_used.replace(/[()\s,']/g, "_"));
			for (var i = 0; i < addedToSelectedGroup.length; i++) {
				listObj.find("[data-initials='" + addedToSelectedGroup[i] + "']").hide()
			}
		}
    },
    _isLanguageValid: function (actualLanguage, wantedLanguage) {
        if (wantedLanguage == "_all") {
            return true;
        }
        if (wantedLanguage == "_ancient") {
            return actualLanguage == "he" || actualLanguage == "grc";
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
    }
});