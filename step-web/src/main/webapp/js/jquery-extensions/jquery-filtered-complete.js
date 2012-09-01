$.widget("custom.filteredcomplete", $.ui.autocomplete, {
    _renderMenu : function(ul, items) {
        var self = this;
        
        //remove any already existing menu from the dom
        $(document).find(".filterOptions").parent().empty();
        
        $.each(items, function(index, item) {
            if (index == 0) {
                var toolbar = "";
                toolbar += '<div class="filterOptions">';
                toolbar += '<table width="100%">';
                
                toolbar += '<tr class="filterButtonSet"><td class="filterHeader">Resource type</td><td>';
                toolbar += '<input type="checkbox" id="bibles" value="bibles" name="textType" key="bibles" /><label for="bibles">Bibles</label>';
                toolbar += '<input type="checkbox" id="commentaries" value="commentaries" name="textType"  key="commentaries" /><label for="commentaries">Commentaries</label>';
                toolbar += '</td></tr>';

                toolbar += '<tr class="filterButtonSet"><td class="filterHeader">Languages</td><td>';
                toolbar += '<input type="checkbox" id="languageAll" value="langAll" name="language" key="langAll" /><label for="languageAll">All</label>';
                toolbar += '<input type="checkbox" id="languageMy" value="langMy" name="language"  key="langMy" /><label for="languageMy">Local</label>';
                toolbar += '<input type="checkbox" id="languageMyAndEnglish" value="langMyAndEnglish"  key="langMyEnglish" name="language" /><label for="languageMyAndEnglish">Local + English</label>';
                toolbar += '<input type="checkbox" id="languageAncient" value="langAncient"  key="langAncient" name="language" /><label for="languageAncient">Ancient</label>';
                toolbar += '</td></tr>';

                toolbar += '<tr class="filterButtonSet"><td class="filterHeader">Features available</td><td>';
                toolbar += '<input type="checkbox" id="vocabFeature" class="vocabFeature" key="vocab" /><label for="vocabFeature"><span class="versionFeature">V</span>ocabulary</label>';
                toolbar += '<input type="checkbox" id="interlinearFeature" class="interlinearFeature" key="interlinear" /><label for="interlinearFeature"><span class="versionFeature">I</span>nterlinear</label>';
                toolbar += '<input type="checkbox" id="grammarFeature" class="grammarFeature" key="grammar" /><label for="grammarFeature"><span class="versionFeature">G</span>rammar</label>';
                toolbar += '</td></tr>';
                
                toolbar += '</table>';
                toolbar += '</div><hr />';
                
//                console.log(toolbar);
                ul.append(toolbar);
            }
            
            self._renderItem(ul, item);
        });

        this._restoreState(ul);  

        
        $(ul).find("input").button();
//        $(ul).find("input[value = 'bibles']").prop("checked", true);
        $(".filterButtonSet", ul).buttonset();

        $(ul).find("input").click(function(event) {
            $.data(self, $(this).attr('key'), $(this).prop('checked'));
            
            if($(this).attr('name') == 'language') {
                //uncheck all but this.
                var otherBoxes = $(ul).find("input[name='language']").not(this);
                otherBoxes.prop('checked', false).button("refresh");
                otherBoxes.each(function(i, item) {
                    $.data(self, $(item).attr('key'), $(item).prop('checked'));
                });
            } else if($(this).attr('name') == 'textType') {
                var otherBoxes = $(ul).find("input[name='textType']").not(this);
                otherBoxes.prop('checked', false).button("refresh");
                otherBoxes.each(function(i, item) {
                    $.data(self, $(item).attr('key'), $(item).prop('checked'));
                });
            }
            
            $.shout("filter-versions", self.element[0]);
        });
    },

    _restoreState : function(ul) {
        console.log("Restoring state");
        this._restoreCheckedState(ul, "vocab", ".vocabFeature");
        this._restoreCheckedState(ul, "interlinear", ".interlinearFeature"); 
        this._restoreCheckedState(ul, "grammar", ".grammarFeature");
        
        this._restoreCheckedState(ul, "langAll", "input[value='langAll']");
        this._restoreCheckedState(ul, "langMy", "input[value='langMy']");
        this._restoreCheckedState(ul, "langAncient", "input[value='langAncient']");
        this._restoreCheckedState(ul, "langMyEnglish", "input[value='langMyAndEnglish']");

        this._restoreCheckedState(ul, "bibles", "input[value='bibles']");
        this._restoreCheckedState(ul, "commentaries", "input[value='commentaries']");

        //default option for all
        if($(ul).find("input[name='language']:checked").length == 0) {
            $(ul).find("input[value = 'langAll']").prop("checked", true);
        }
        
        
        if($(ul).find("input[name='textType']:checked").length == 0) {
            var biblesOption = $(ul).find("input[value = 'bibles']");
            biblesOption.prop("checked", true);
            $.data(this, 'bibles', true);
        }
     },
        
      _restoreCheckedState : function(ul, key, selector) {
            if($.data(this, key) == true) { $(ul).find(selector).prop("checked", true); }
      }
});
