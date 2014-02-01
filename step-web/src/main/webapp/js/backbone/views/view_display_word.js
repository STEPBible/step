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
        if (this.model.get("definitions")) {
            //add a toolbar in there for each word
            results.prepend(this._createToolbar($("<div>").addClass("originalWordSearchToolbar")));
            return results;
        }
        return results;
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
    _createToolbar : function(element) {
        //render bar
        var header = $("<h4>").addClass("lexicalGrouping").html(__s.search_lexical_forms);
        var wrapper = $("<div>").append(header).append(this._renderToolbar()).append("<hr>");
        element.append(wrapper);
        
        //allow for chaining
        return element;
    },

    _renderToolbar : function() {
        var definitions = this.model.get("definitions");
        var values = this.options.model.get("filter") || [];
        var toolbar = $("<div>").addClass("btn-group").attr("data-toggle", "buttons");

        var self = this;
        $.each(definitions, function(i, item) {
            var id = "ows_" + self.model.get("passageId") + "_" + i;

            var span = $("<button>").addClass("sortable btn btn-xs btn-primary")
                .attr("strong", item.strongNumber == undefined ? "" : item.strongNumber)
                .attr("id", id)
                .click(function() {
                    //get all selected checkboxes
                    var options = $(this).closest(".originalWordSearchToolbar").find("button.active");
                    var filter = [];
                    var thisEl = $(this);
                    var activated = thisEl.hasClass("active");
                    var thisStrong = thisEl.attr("strong");
                    $.each(options, function(i, item) {
                        var chosenStrong = $(this).attr("strong");
                        if(chosenStrong != thisStrong || !activated) {
                            filter.push(chosenStrong);
                        }
                    });
                    
                    //also put the current button which hasn't yet been made active
                    if(!activated) {
                        filter.push(thisStrong);
                    }
                    
                    //bypass URL
                    self.model.save({filter: filter, pageNumber: 1}, { silent: true });
                    step.router.doMasterSearch(self.model.get("args"), null, null, 1, filter.join(" "), 
                        this.model.get("context"),true);
                });

            var label = span.append("<label>").find(":last-child").attr("for", id);
            label.append(item.stepTransliteration)
                 .append($('<span>')
                 .append("<br />")
                 .append(item.matchingForm).addClass("ancientSearchButton"))
                 .append("<br />");

            if(item.gloss) {
                label.append(item.gloss);
            }

            toolbar.append(span);
        });

        //set up all the right filters
        var filterValues = self.model.get("filter") || [];
        for(var i = 0; i < filterValues.length; i++) {
            toolbar.find("[strong='" + filterValues[i] + "']").button('toggle');
        }
        
        //now that it is attached to the dom, sort the elements
        var sortables = $(toolbar).find(".sortable");
        sortables.sortElements(function(a, b) {
            //push hebrew first..
            var aText = $(a).find("input").val() || " ";
            var bText = $(b).find("input").val() || " ";

            if(bText[0] == 'H' && aText[0] == 'G') {
                return 1;
            } else if(bText[0] == 'G' && aText[0] == 'H') {
                return -1;
            }

            return aText < bText ? -1 : 1;
        });

        //add hovers
        sortables.hover(
            function() {
                step.passage.higlightStrongs({
                    passageId: step.passage.getPassageId(this),
                    strong: $(this).find("input[type='checkbox']").val()
                });
            }, function() {
                step.passage.removeStrongsHighlights(step.passage.getPassageId(this));
            });

        return toolbar;
    }
});
