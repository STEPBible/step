var SidebarView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this);

        //create tab container
        var container = this.$el.find(">div");
        this.tabContainer = this._createBaseTabs();
        this.$el.append(this._createTabHeadersContainer());
        this.$el.append(this.tabContainer);

        this.$el.on("show.bs.tab", this.changeMode);
        this.listenTo(this.model, "change", this.activate);

        this.activate();
    },
    changeMode: function (e) {
        var mode = null;
        var targetTab = $(e.target);
        var data = targetTab.data("target");
        if (data == '#lexicon') {
            mode = 'lexicon';
        } else if (data == '#analysis') {
            mode = 'analysis';
        } else if (data == '#history') {
            mode = 'history';
        }

        this.model.save({
            mode: mode
        });
    },
    activate: function () {
        var self = this;
        //make sidebar visible
        this.$el.closest('.row-offcanvas').addClass('active');

        //show the right tab
        this.$el.find("[data-target='#" + this.model.get("mode") + "']").tab("show");

        if (this.model.get("mode") == 'lexicon') {
            this.lexicon.addClass("active");
            //load content
            var requestTime = new Date().getTime();
            $.getSafe(MODULE_GET_INFO, [this.model.get("strong"), this.model.get("morph")], function (data) {
                step.util.trackAnalytics("lexicon", "loaded", "time", new Date().getTime() - requestTime);
                step.util.trackAnalytics("passage", "strong", self.model.get("strong"));
                self.createDefinition(data, 0);
            });
        } else if (this.model.get("mode") == 'analysis') {
            self.createAnalysis();
        } else {
            self.createHistory();
        }
    },
    _createBaseTabs: function () {
        var tabContent = $("<div class='tab-content'></div>");

        this.lexicon = $("<div id='lexicon' class='tab-pane'></div>");
        this.analysis = $("<div id='analysis' class='tab-pane'></div>");
        this.history = $("<div id='history' class='tab-pane'></div>");
        tabContent.append(this.lexicon);
        tabContent.append(this.analysis);
        tabContent.append(this.history);
        this.$el.append(tabContent);
        return tabContent;
    },
    createHistory: function () {
        if (!this.historyView) {
            this.historyView = new ViewHistory({
                el: this.history
            });
        } else {
            this.historyView.refresh();
        }
    },
    createAnalysis: function () {
        if (!this.analysisView) {
            this.analysisView = new ViewLexiconWordle({
                el: this.analysis
            });
        } else {
            this.analysisView.refresh();
        }
    },
    createDefinition: function (data, activeWord) {
        //get definition tab
        this.lexicon.detach();
        this.lexicon.empty();

        var alternativeEntries = $("<div id='vocabEntries'>");
        this.lexicon.append(alternativeEntries);
        this.lexicon.append($("<h1>").append(__s.lexicon_vocab));

        if (data.vocabInfos.length > 1) {
            //multiple entries
            this.lexicon.append($("<div>").append("### Multiple entries go here ###"));
        }

        if (data.vocabInfos.length > 0) {
            var mainWord = data.vocabInfos[activeWord];
            this.lexicon.append(
                $("<div>").append($("<span>").addClass(mainWord.strongNumber[0] == 'H' ? "hbFontSmall" : "unicodeFont")
                        .append(mainWord.accentedUnicode))
                    .append(" (")
                    .append(mainWord.stepTransliteration)
                    .append("): ")
                    .append(mainWord.shortDef || "")
                    .append(" ")
                    .append(mainWord.stepGloss)
            );

            // append the meanings
            if (mainWord.mediumDef) {
                this.lexicon.append($("<h2>").append(__s.lexicon_meaning));
                this.lexicon.append(mainWord.mediumDef);
            }

            //longer definitions
            if (mainWord.lsjDefs) {
                this.lexicon.append($("<h2>").append(mainWord.strongNumber[0].toLowerCase() == 'g' ? __s.lexicon_lsj_definition : __s.lexicon_bdb_definition));
                this.lexicon.append(mainWord.lsjDefs);
            }

            if (mainWord.relatedNos) {
                this.lexicon.append($("<h2>").append(__s.lexicon_related_words));
                this.lexicon.append(mainWord.relatedNos);
            }
        }
        this.tabContainer.append(this.lexicon);
    },
    _createTabHeadersContainer: function () {
        var template = '<ul class="nav nav-tabs">' + 
            '<li class="active"><a href="javascript:void(0)" class="glyphicon glyphicon-info-sign" title="<%= __s.original_word %>" data-toggle="tab" data-target="#lexicon"></li>' +
            '<li><a href="javascript:void(0)" class="glyphicon glyphicon-stats" title="<%= __s.passage_stats %>" data-toggle="tab" data-target="#analysis"></li>' +
            '<li><a href="javascript:void(0)" class="glyphicon glyphicon-bookmark" title="<%= __s.bookmarks_and_recent_texts %>" data-toggle="tab" data-target="#history"></li>' +
            '</ul>';
        
        var tabContainer = $(_.template(template)());

        //add close button
        tabContainer.append(
            $("<li class='closeSidebar'><a class='glyphicon glyphicon-remove' /></li>")
                .click(this.closeSidebar));

        return tabContainer;
    },
    closeSidebar: function () {
        this.$el.closest('.row-offcanvas').removeClass('active');
    }
});
