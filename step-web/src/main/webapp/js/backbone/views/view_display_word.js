var WordDisplayView = TextDisplayView.extend({
    titleFragment: __s.search_word,
    /**
     * Allows a search to add in headers, footers, etc. In this case
     * we add in a header with the buttons to filter the results
     * @param query the query
     * @param results the results HTML jqObject that been created so far
     * @param resultsWrapper the results wrapper, containing all meta information
     * and results
     * @private
     */
    _doSpecificSearchRequirements: function (query, results, masterVersion) {
        if ((this.model.get("definitions") || []).length > 1) {
            //add a toolbar in there for each word
            results.prepend(this._createToolbar($("<div>").addClass("originalWordSearchToolbar")));
            return results;
        }
        return results;
    },
    _doSpecificSearchHandlers: function () {
        var self = this;
        var toolbarContainer = this.$el.find(".originalWordSearchToolbar");

        toolbarContainer.find(".sortOptions a").on('click', function (ev) {
            //need to trigger new search after setting value of model
            var orderCode = $(this).attr("data-value");
            self.model.save({ order: orderCode, pageNumber: 1 });
            ev.stopImmediatePropagation();
        });

        toolbarContainer.find("li").hover(
            function(){
                var $this = $(this);
                var includeWord = $("<span class='untick' href='javascript:void(0)'>&nbsp;&nbsp;" + ($this.find(".active").length > 0 ?  __s.this_entry_untick : __s.this_entry_tick) + "</span> ");
                $this.append(includeWord);

                var untickAll = $("<a class='thisOnly' href='javascript:void(0)'>" + __s.this_entry_only + "</a>");
                untickAll.on('click', function() {
                    toolbarContainer.find(".active").removeClass("active");
                    $(this).closest("li").find("a:first").trigger("click");
                });
                $this.append(untickAll);
            },
            function() {
                $(this).find(".thisOnly, .untick").remove();
            }
        );

        toolbarContainer.find("li > a").click(function (ev) {
            var thisEl = $(this).closest("li");
            var okIcon = thisEl.find(".glyphicon-ok");
            if (okIcon.hasClass("active")) {
                okIcon.removeClass("active");
                ev.stopImmediatePropagation();
            } else {
                okIcon.addClass("active");
            }

            //get all selected checkboxes
            var options = thisEl.closest("ul").find("li");
            var filter = [];
            $.each(options, function (i, item) {
                if ($(this).find(".glyphicon").hasClass("active")) {
                    filter.push($(this).attr("strongNumber"));
                }
            });

            self.model.save({strongHighlights: filter, pageNumber: 1}, { silent: true });
            step.router.navigateSearch();
        });

        var expandableToolbar = toolbarContainer.find(".panel-body");
        expandableToolbar.on("show.bs.collapse", function () {
            step.settings.save({ relatedWordsOpen: true});
        }).on("hide.bs.collapse", function () {
            step.settings.save({ relatedWordsOpen: false});
        });

        //now that it is attached to the dom, sort the elements
        var sortables = $(expandableToolbar).find(".sortable");
        //add hovers
        sortables.find("a").hover(
            function () {
                step.passage.higlightStrongs({
                    passageId: step.passage.getPassageId(this),
                    strong: $(this).attr("strong"),
                    classes: 'primaryLightBg'
                });
            }, function () {
                step.passage.removeStrongsHighlights(step.passage.getPassageId(this), 'primaryLightBg');
            });
    },
    /**
     * Adds a header for groups of verses, in this case a header indicating the various
     * different words
     * @param item
     * @param sortOrder the type of sort
     * @param lastHeader the last seen header that was output
     * @param existingResults the existing results, if we're part through appending something, this represents the previous pages
     */
    doGroupHeader: function (table, item, sortOrder, lastHeader, existingResults) {
        if(lastHeader == null && existingResults != null) {
            //then let's take it from the last set of results
            lastHeader = existingResults.find(".searchResultStrongHeader:last").attr("strongNumber");
        }

        if (item.strongNumber && item.strongNumber != lastHeader) {
            var header = $("<h4>").addClass("searchResultStrongHeader").attr("strongNumber", item.strongNumber);

            //add a new row
            table.append(header);

            if (sortOrder != SCRIPTURE_SORT) {
                header.append(item.stepGloss == undefined ? " - " : item.stepGloss);
                header.append(" (");
                header.append($("<em>").addClass("transliteration").append(item.stepTransliteration));
                header.append(" - ");
                header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                header.append(")");
            }

            return item.strongNumber;
        }
    },

    /**
     * Creates the passageButtons
     */
    _createToolbar: function (element) {
        //render bar
        var passageId = this.model.get("passageId");
        var panel = step.util.ui.addCollapsiblePanel(__s.lexicon_related_words, "lexicalGrouping", "#relatedWords-" + passageId);

        //add sort to toolbar
        var vocabActive = this.model.get("order") == VOCAB_SORT;
        var sortBar = $('<span class="sortOptions pull-right">' +
            '<span>' + __s.word_search_sort_options + '</span>' +
            '<a href="javascript:void(0)" data-value="' + SCRIPTURE_SORT + ' title="' + __s.scripture_help +  '" class="' + (vocabActive ? "" : "active") +'">' + __s.scripture + '</a> | ' +
            '<a href="javascript:void(0)" data-value="'+ VOCAB_SORT + '" title="' + __s.vocabulary_help + '" class="' + (vocabActive ? "active" : "") +  '">' + __s.vocabulary + '</a>' +
            '</span>');

        panel.find("h4").append(sortBar);

        panel.append(this._renderToolbar())
        element.append(panel);
        //allow for chaining
        return element;
    },
    _renderToolbar: function () {
        var passageId = this.model.get("passageId");
        var definitions = this.model.get("definitions");
        var values = this.options.model.get("strongHighlights") || [];
        var toolbar = $("<ul>");
        var toolbarContainer = $("<div class='panel-body panel-collapse collapse'></div>").attr("id", "relatedWords-" + passageId);


        var self = this;
        $.each(definitions, function (i, item) {
            var id = "ows_" + self.model.get("passageId") + "_" + i;

            var span = $("<a class='' href='javascript:void(0)'>")
                .attr("id", id);

            span.append('<span class="glyphicon glyphicon-ok"></span>');
            if (item.gloss) {
                var tmpGloss = item.gloss;
                if ((step.userLanguageCode.toLowerCase() == "es") && (item._es_Gloss)) tmpGloss = item._es_Gloss;
                else if ((step.userLanguageCode.toLowerCase() == "zh") && (item._zh_Gloss)) tmpGloss = item._zh_Gloss;
                else if ((step.userLanguageCode.toLowerCase() == "zh_tw") && (item._zh_tw_Gloss)) tmpGloss = item._zh_tw_Gloss;
                span.append(tmpGloss + " ");
            }

            span.append(" (<span class='transliteration'>" + item.stepTransliteration + "</span>").append(" - ")
                .append($('<span>')
                    .append(item.matchingForm).addClass(item.strongNumber[0] == 'H' ? 'hbFontSmallMini' : "unicodeFontMini"));

            span.append(")");
            var safeStrongNumber = item.strongNumber == undefined ? "" : item.strongNumber;
            span.attr("strong", safeStrongNumber);
            toolbar.append($("<li></li>")
                .addClass("sortable")
                .attr("strongNumber", safeStrongNumber).append(span));
        });

        //set up all the right filters
        for (var i = 0; i < values.length; i++) {
            toolbar.find("[strong='" + values[i] + "']").find(".glyphicon-ok").addClass("active");
        }

        toolbarContainer.append(toolbar);

        if (step.settings.get("relatedWordsOpen")) {
            toolbarContainer.addClass("in");
        }

        return toolbarContainer;
    }
});
