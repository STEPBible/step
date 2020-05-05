var PickBibleView = Backbone.View.extend({
    versionTemplate: _.template('' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<h1><%= key %></h1>' +
        '<ul class="list-group">' +
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
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="_all" /><%= __s.all  %></label>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="en"  checked="checked" />English</label>' +
        '<% if(step.userLanguageCode != "en") { %>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="<%= step.userLanguageCode %>" /><%= step.userLanguage %></label>' +
        '<% } %>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="_ancient" /><%= __s.ancient %></label>' +
        '</span>' +
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
        '<div class="tab-content">' +
        '<div class="tab-pane" id="bibleList">' +
        '</div>' +
        '<div class="tab-pane" id="commentaryList">' +
        '</div>' +
        '</div>' + //end body
        '<div class="modal-footer"><button class="btn btn-default btn-sm closeModal" data-dismiss="modal" ><label><%= __s.ok %></label></button></div>' +
        '</div>' + //end content
        '</div>' + //end dialog
        '</div>' +
        '</div>'),
    suggestedEnglish: ['ESV', 'NIV', 'NASB', 'KJV', 'ASV', 'WEB', 'DRC', 'CPDV'],
    ancientBlackList: ["HebModern"],
    ancientOrder: [
        [__s.widely_used, ['OSMHB', 'LXX', 'Byz', 'TR', 'SBLG']],
        [__s.hebrew_ot, ["Aleppo", "OSMHB", "SP", "WLC", "MapM"]],
        [__s.greek_ot, ["LXX", "LXX_th", "ABPGRK", "ABP", "ABpGk_th", "ABpEn_th"]],
        [__s.greek_nt, ["Antoniades", "Byz", "Elzevir", "SBLGNT", "Nestle", "Tisch", "TNT", "TR", "WHNU"]],
        [__s.coptic_texts, ["CopNT", "CopSahHorner", "CopSahidica", "CopSahidicMSS"]],
        [__s.latin_texts, ["DRC", "Vulgate", "VulgSistine", "VulgHetzenauer", "VulgConte", "VulgClementine"]],
        [__s.coptic_texts, ["CopNT", "CopSahHorner", "CopSahidica", "CopSahidicMSS"]],
        [__s.syriac_texts, ["Peshitta", "Etheridge", "Murdock"]],
        [__s.alternative_samaritan, ["SP", "SPMT", "SPVar", "SPDSS", "SPE"]],
        [__s.uncategorized_resources, []]
    ],
    el: function () {
        var el = $("<div>");
        $("body").append(el);
        return el;
    },
    _populateAncientBibles: function (arr) {
        var addedBibles = {};
        if (_.isEmpty(arr)) {
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
        }
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
        this.$el.find(".btn").has("input[data-lang='" + language + "']").addClass("active");

        var navTabsLi = $(".nav-tabs li");
        navTabsLi.has("a[href='" + this._getSelectedTab() + "']").addClass("active");
        navTabsLi.on('shown.bs.tab', function (event) {
            self.model.save({ selectedVersionsTab: $(event.target).attr("href") });
            self._filter();
        });

        this.$el.find(this._getSelectedTab()).addClass("active");
        this.bibleVersions = this.$el.find("#bibleVersions").modal({ show: true});
        this.$el.find("input[type='text']").focus();
        this.$el.find(".btn").click(this.handleLanguageButton);
        this.$el.find(".closeModal").click(this.closeModal);
        this._filter();
    },
    closeModal: function (ev) {
        ev.preventDefault();
        this.bibleVersions.modal("hide");
        this.remove();
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
    _filter: function () {
        var self = this;
        var selectedTab = this._getSelectedTab();
        var selectedLanguage = this._getLanguage();
		if (selectedLanguage == "zh_TW") selectedLanguage = "zh";

        var filter = "BIBLE"
        if (selectedTab == '#commentaryList') {
            filter = "COMMENTARY";
        }

        var bibleList = {};
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
        this.$el.find(selectedTab).append(this.versionTemplate({
            versions: bibleList
        }));

        this.$el.find(".glyphicon-info-sign").click(function (ev) {
            ev.stopPropagation();
        });

        this.$el.find(".list-group-item").click(function () {
            var target = $(this);
            var version = step.keyedVersions[target.data("initials")];

            //also look for the item in the rest of the list and mark that
            self.$el.find("[data-initials='" + version.shortInitials + "']").toggleClass("active");
            var added = target.hasClass("active");
            
            if (added) {
                Backbone.Events.trigger("search:add", { value: version, itemType: VERSION });
            } else {
                Backbone.Events.trigger("search:remove", { value: version, itemType: VERSION});
            }
        }).each(function (i, item) {
            var el = $(this);
            if (self.searchView._getCurrentInitials().indexOf(el.data("initials")) != -1) {
                el.addClass("active");
            }
        });
        this._addTagLine();
    },
    _addTagLine: function(){
        var bibleVersions = $("#bibleVersions");
        var length = bibleVersions.find(".list-group-item").length;
        var total = step.itemisedVersions.length;
        var message = '<span class="tagLine">' + sprintf(__s.filtering_total_bibles_and_commentaries, length, total) + "</span>";
        this.bibleVersions.find(".modal-footer").find(".tagLine").remove().end().prepend(message);
        
    },
    _isLanguageValid: function (actualLanguage, wantedLanguage) {
        if (wantedLanguage == "_all") {
            return true;
        }
        if (wantedLanguage == "_ancient") {
            return actualLanguage == "he" || actualLanguage == "grc";
        }
        return actualLanguage == wantedLanguage;
    }
});