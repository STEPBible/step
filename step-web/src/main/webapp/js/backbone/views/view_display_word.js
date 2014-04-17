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
        
        toolbarContainer.find("a").click(function () {
            var thisEl = $(this).closest("li");
            var okIcon = thisEl.find(".glyphicon-ok");
            if (okIcon.hasClass("active")) {
                okIcon.removeClass("active");
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
     */
    doGroupHeader: function (table, item, sortOrder, lastHeader) {
        if (item.accentedUnicode && item.accentedUnicode != lastHeader) {
            var header = $("<th>").addClass("searchResultStrongHeader").prop("colspan", "2");

            //add a new row
            table.append($("<tr>").append(header));

            if (sortOrder == VOCABULARY) {
                header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
                header.append($("<em>").addClass("stepTransliteration").append(item.stepTransliteration));
                header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
            } else {
                header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                header.append("(");
                header.append($("<em>").addClass("stepTransliteration").append(item.stepTransliteration));
                header.append("): ");
                header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
            }

            return item.accentedUnicode;
        }
    },

    /**
     * Creates the passageButtons
     */
    _createToolbar: function (element) {
        //render bar
        var passageId = this.model.get("passageId");
        var panel = step.util.ui.addCollapsiblePanel(__s.lexicon_related_words, "lexicalGrouping", "#relatedWords-" + passageId);
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
            span.append(item.stepTransliteration).append(" (")
                .append($('<span>')
                    .append(item.matchingForm).addClass(item.strongNumber[0] == 'H' ? 'hbFontSmallMini' : "unicodeFontMini"));

            if (item.gloss) {
                span.append(" - " + item.gloss);
            }

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
