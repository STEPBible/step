$.widget("custom.lexicalcomplete", $.ui.autocomplete, {
    _renderMenu : function(ul, items) {
        var self = this;
        
        //remove any already existing menu from the dom
        $(document).find(".lexicalOptions").parent().empty();
        
        $.each(items, function(index, item) {
            if (index == 0) {
                var toolbar = "";
                toolbar += '<div class="lexicalOptions">';
                toolbar += 'Include all forms <input type="checkbox" id="includeAllForms" class="includeAllForms" key="includeAllForms" />';
                toolbar += '</div><div class="suggestionHeader"><span class="suggestionColumnTitle">Greek / Hebrew</span><span class="suggestionColumnTitle">Transliteration</span><span class="suggestionColumnTitle">Meaning</span>';
                toolbar += '</div><hr />';
                
                ul.append(toolbar);
            }
            
            self._renderItem(ul, item);
        });

        this._restoreState(ul);

        
        $(ul).addClass("stepComplete").find("input").click(function(event) {
            var passageId = step.passage.getPassageId(self.element[0]);
            step.search.ui.original.allForms[passageId] = $(this).prop('checked');    
            $.shout("lexical-filter-change", { passageId : passageId} );
        });
    },

    _restoreState : function(ul) {
        var passageId = step.passage.getPassageId(this.element[0]);
        $(".includeAllForms", ul).prop('checked', step.search.ui.original.allForms[passageId]);    
     },
        
});
