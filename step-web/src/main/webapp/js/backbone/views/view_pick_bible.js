var PickBibleView = Backbone.View.extend({
    versionTemplate: '' +
        '<% _.each(versions, function(languageBibles, key) { %>' +
        '<h1><%= key %></h1>' +
        '<ul class="list-group">' +
        '<% _.each(languageBibles, function(languageBible) { %>' +
        '<li class="list-group-item" data-initials="<%= languageBible.initials %>">' +
        '<a class="glyphicon glyphicon-info-sign" target="_blank" href="http://www.stepbible.org/version.jsp?version=<%= languageBible.initials %>"></a>' +
        '<a class="resource" href="javascript:void(0)">' +
        '<%= languageBible.initials %> - <%= languageBible.name %> <span class="pull-right"><%= step.util.ui.getFeaturesLabel(languageBible) %></span></a></li>' +
        '<% }) %>' +
        '</li>' +
        '</ul>' +
        '<% }) %>',
    filtersTemplate: '<form role="form" class="form-inline">' +
        '<span class="form-group btn-group" data-toggle="buttons">' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="_all" /><%= __s.all  %></label>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="en"  checked="checked" />English</label>' +
        '<% if(step.userLanguageCode != "en") { %>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="<%= step.userLanguageName %>" value="<%= myLanguage.code %>" /><%= myLanguage.name %></label>' +
        '<% } %>' +
        '<label class="btn btn-default btn-sm"><input type="radio" name="languageFilter" data-lang="_ancient" /><%= __s.ancient %></label>' +
        '</span>' +
        '</form>',
    modalPopupTemplate: '<div class="modal" id="bibleVersions" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-body">' +
        '<span class="pull-right"><%= _.template(view.filtersTemplate)({myLanguage: myLanguage}) %></span>' +
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
        '</div>',
    events: {
//        "click a[name]" : "changeView"
    },
    el: function () {
        var el = $("<div>");
        $("body").append(el);
        return el;
    },
    lazyMakeVersions: function (arr, value) {
        if (!arr[value.languageName]) {
            arr[value.languageName] = [];
        }
        arr[value.languageName].push(value);
    },
    initialize: function (opts) {
        _.bindAll(this);
        var self = this;
        this.searchView = opts.searchView;

        this.$el.append(_.template(this.modalPopupTemplate)({
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
            this.model.save({
                selectedVersionsTab: "bibleList"
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

        var filter = "BIBLE"
        if (selectedTab == '#commentaryList') {
            filter = "COMMENTARY";
        }

        var bibleList = {};
        for (var v in step.keyedVersions) {
            var version = step.keyedVersions[v];
            if (version.category == filter && this._isLanguageValid(version.languageCode, selectedLanguage)) {
                //now filter by language:
                this.lazyMakeVersions(bibleList, version);
            }
        }

        this.$el.find(".tab-pane").empty();
        this.$el.find(selectedTab).append(_.template(this.versionTemplate)({
            versions: bibleList
        }));

        this.$el.find(".glyphicon-info-sign").click(function(ev) {
            ev.stopPropagation();
        });

        this.$el.find(".list-group-item").click(function() {
            var target = $(this);
            $(this).toggleClass("active");
            var added = target.hasClass("active");
            var version = step.keyedVersions[target.data("initials")];
            if(added) {
                Backbone.Events.trigger("search:add", { version: version });
            } else {
                Backbone.Events.trigger("search:remove", { version: version} );
            }
        }).each(function(i, item) {
            var el = $(this);
            if(self.searchView._getCurrentInitials().indexOf(el.data("initials")) != -1) {
                el.addClass("active");  
            };
        });
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