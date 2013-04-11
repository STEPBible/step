$.widget("custom.originalWordToolbar",  {
    options : {
        passageId : 0,
        definitions : undefined
    },
    
    /**
     * Creates the passageButtons
     */
    _create : function() {

        //render bar
        this._renderToolbar();
        
        var header = $("<h4>").addClass("lexicalGrouping").html(__s.search_lexical_forms);
        var wrapper = $("<div>").append(header).append(this._renderToolbar()).append("<hr>");
        this.element.append(wrapper);
    },
    
    _renderToolbar : function() {
        var values = step.search.original.filters[this.options.passageId] || [];
        var detailLevel = $("fieldset:visible", step.util.getPassageContainer(this.options.passageId)).detailSlider("value");
        var toolbar = $("<div>");
        
        var self = this;
        $.each(this.options.definitions, function(i, item) {
            var id = "ows_" + self.options.passageId + "_" + i;
            
            var span = $("<span>").addClass("sortable");
            var input = span.append("<input>").find(":last-child")
                    .attr("type", "checkbox")
                    .attr("value", item.strongNumber == undefined ? "" : item.strongNumber)
                    .attr("id", id)
                    .prop("checked", $.inArray(item.strongNumber, values) != -1)
                    .click(function() {
                        //get all selected checkboxes
                        var options = $(this).closest(".originalWordSearchToolbar").find("input[type='checkbox']:checked");
                        var filter = [];
                        $.each(options, function(i, item) {
                          filter.push($(this).val());  
                        });
                        
                        step.search.original.filters[self.options.passageId] = filter;
                        step.search.original.search(self.options.passageId);
                    });
            
            var label = span.append("<label>").find(":last-child").attr("for", id);
            
            if(detailLevel == 2) {
                label.append("<span>").find(":last-child")
                    .addClass("ancientSearchButton")
                    .html(item.matchingForm);
            } else {
                label.append(item.stepTransliteration);
            }
            
            label.append("<br />");
            
            if(item.gloss) {
                label.append(item.gloss);
            }
            
            input.button();
            toolbar.append(span);
        });
        
        //now that it is attached to the dom, sort the elements
        var sortables = $(toolbar).find(".sortable");
        sortables.sortElements(function(a, b) { 
            return $(a).find("label").text() < $(b).find("label").text() ? -1 : 1; 
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
        
        toolbar.buttonset();
        return toolbar;
    }
});

