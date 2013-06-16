$.widget("custom.lexicalcomplete", $.ui.autocomplete, {
    options : {
        allForms : false
    },

    _renderMenu : function(ul, items) {
        var self = this;
        
        //remove any already existing menu from the dom
        $(document).find(".lexicalOptions").parent().empty();
        
        $.each(items, function(index, item) {
            if (index == 0) {
                var toolbar = "";
                toolbar += '<div class="lexicalOptions">';
                toolbar += __s.include_all_forms + ' <input type="checkbox" id="includeAllForms" class="includeAllForms" key="includeAllForms" />';
                toolbar += '</div><div class="suggestionHeader"><span class="suggestionColumnTitle">';
                toolbar += __s.greek_hebrew;
                toolbar += '</span><span class="suggestionColumnTitle">';
                toolbar += __s.transliteration;
                toolbar += '</span><span class="suggestionColumnTitle">'
                toolbar += __s.meaning;
                toolbar += '</span>';
                toolbar += '</div><hr />';
                
                ul.append(toolbar);
            }
            
            self._renderItem(ul, item);
        });

        this._restoreState(ul);

        
        $(ul).addClass("stepComplete").find("input").click(function(event) {
            var passageId = step.passage.getPassageId(self.element[0]);
            self.options.allForms = $(this).prop('checked');
            $.shout("lexical-filter-change-" + passageId );
        });
    },

    _restoreState : function(ul) {
        var passageId = step.passage.getPassageId(this.element[0]);
        $(".includeAllForms", ul).prop('checked', this.options.allForms);
     }
});
