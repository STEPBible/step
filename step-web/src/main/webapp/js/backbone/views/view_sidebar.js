var SidebarView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this);
        this.listenTo(this.model, "change", this.activate);
    },
    activate : function() {
        var self = this;
        this.$el.closest('.row-offcanvas').toggleClass('active');

        //load content
        $.getSafe(MODULE_GET_INFO, [this.model.get("strong"), this.model.get("morph")], function(data) {
            self.createDefinition(data, 0);
            console.log("Got info for: ", data.vocabInfos[0].accentedUnicode);
        });        
    },
    createDefinition : function(data, activeWord) {
        this.$el.empty();
        
        var sidebarContainer = $("<div>");
        var tabContainer = $("<ul>").addClass("nav nav-tabs")
            .append("<li>").append("<li>").children().first().addClass("active")
            .append($("<a>").addClass("glyphicon glyphicon-info-sign").attr("title", __s.original_word).attr("data-toggle","tab").attr("data-target", "#lexicon")).end().next()
            .append($("<a>").addClass("glyphicon glyphicon-stats").attr("title", __s.passage_stats).attr("data-toggle","tab").attr("data-target", "#analysis")).end().end();
        
        
        var vocabContainer = $("<div id='lexicon'>");
        var alternativeEntries = $("<div id='vocabEntries'>");
        vocabContainer.append(alternativeEntries);
        vocabContainer.append($("<h1>").append(__s.lexicon_vocab));
        
        if(data.vocabInfos.length > 1) {
            //multiple entries
            vocabContainer.append($("<div>").append("Multiple entries go here"));   
        }
        
        if(data.vocabInfos.length > 0) {
            var mainWord = data.vocabInfos[activeWord];
            vocabContainer.append(
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
                vocabContainer.append($("<h2>").append(__s.lexicon_meaning));
                vocabContainer.append(mainWord.mediumDef);
            }
            
            //longer definitions
            if(mainWord.lsjDefs) {
                vocabContainer.append($("<h2>").append(mainWord.strongNumber[0].toLowerCase() == 'g' ? __s.lexicon_lsj_definition : __s.lexicon_bdb_definition));
                vocabContainer.append(mainWord.lsjDefs);
            }
            
            if(mainWord.relatedNos) {
                vocabContainer.append($("<h2>").append(__s.lexicon_related_words));
                vocabContainer.append(mainWord.relatedNos);
            }
        }


        sidebarContainer.append(tabContainer);
        sidebarContainer.append(vocabContainer);
        this.$el.append(sidebarContainer);
    }
});
