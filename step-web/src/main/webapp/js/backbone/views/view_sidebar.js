var SidebarView = Backbone.View.extend({
    initialize: function() {
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
    changeMode: function(e) {
        var mode = null;
        var targetTab = $(e.target);
        if(targetTab.data("target") == '#lexicon') {
            mode = 'lexicon';
        } else if(targetTab.data("target") == '#analysis') {
            mode = 'analysis';
        }
        this.model.save({
            mode: mode
        });    
    },
    activate : function() {
        var self = this;
        //make sidebar visible
        this.$el.closest('.row-offcanvas').addClass('active');

        //show the right tab
        this.$el.find("[data-target='#" + this.model.get("mode") + "']").tab("show");
        
        if(this.model.get("mode") == 'lexicon') {
            this.lexicon.addClass("active");
            //load content
            $.getSafe(MODULE_GET_INFO, [this.model.get("strong"), this.model.get("morph")], function(data) {
                self.createDefinition(data, 0);
            });   
        } else {
            self.createAnalysis(undefined);
        }  
    },
    _createBaseTabs: function() {
        var tabContent = $("<div class='tab-content'></div>");

        this.lexicon = $("<div id='lexicon' class='tab-pane'></div>");
        this.analysis = $("<div id='analysis' class='tab-pane'></div>");
        tabContent.append(this.lexicon);
        tabContent.append(this.analysis);
        this.$el.append(tabContent);
        return tabContent;
    },
    createAnalysis: function(data) {
        if(!this.analysisView) {
            this.analysisView = new ViewLexiconWordle({
                el: this.analysis
            });            
        } else {
            this.analysisView.refresh();
        }     
    },
    createDefinition : function(data, activeWord) {
        //get definition tab
        this.lexicon.detach();
        this.lexicon.empty();

        var alternativeEntries = $("<div id='vocabEntries'>");
        this.lexicon.append(alternativeEntries);
        this.lexicon.append($("<h1>").append(__s.lexicon_vocab));
        
        if(data.vocabInfos.length > 1) {
            //multiple entries
            this.lexicon.append($("<div>").append("### Multiple entries go here ###"));   
        }
        
        if(data.vocabInfos.length > 0) {
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
            if(mainWord.mediumDef) {
                this.lexicon.append($("<h2>").append(__s.lexicon_meaning));
                this.lexicon.append(mainWord.mediumDef);
            }
            
            //longer definitions
            if(mainWord.lsjDefs) {
                this.lexicon.append($("<h2>").append(mainWord.strongNumber[0].toLowerCase() == 'g' ? __s.lexicon_lsj_definition : __s.lexicon_bdb_definition));
                this.lexicon.append(mainWord.lsjDefs);
            }
            
            if(mainWord.relatedNos) {
                this.lexicon.append($("<h2>").append(__s.lexicon_related_words));
                this.lexicon.append(mainWord.relatedNos);
            }
        }
        this.tabContainer.append(this.lexicon);
    },
    _createTabHeadersContainer: function() {
        var tabContainer = $("<ul>").addClass("nav nav-tabs")
            .append("<li>").append("<li>").children().first().addClass("active")
            .append($("<a>").addClass("glyphicon glyphicon-info-sign")
                .attr("title", __s.original_word).attr("href", "javascript:void(0)").attr("data-toggle","tab").attr("data-target", "#lexicon")).end().next()
                .append($("<a>").attr("href", "javascript:void(0)").addClass("glyphicon glyphicon-stats").attr("title", __s.passage_stats).attr("data-toggle","tab").attr("data-target", "#analysis")).end().end();
        
        //add close button
        tabContainer.append(
            $("<li class='closeSidebar'><a class='glyphicon glyphicon-remove' /></li>")
                .click(this.closeSidebar));
        
        return tabContainer;
    },
    closeSidebar: function() {
        this.$el.closest('.row-offcanvas').removeClass('active');   
    }
});
