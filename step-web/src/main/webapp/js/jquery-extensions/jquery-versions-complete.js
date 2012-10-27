var hearingFilteredComplete = false;

step.autoVersions = {
    currentElement : undefined
};

$.widget("custom.versions",  {
    _rendered : false,
    options : {
        multi : false
    },
    
    _create : function() {
        var self = this;
        this.intentToHide = false;
        this.currentElement = this.element;
        this.element.addClass("versionsComplete");
                
        this.element.bind('focus click', function() {
            step.autoVersions.currentElement = $(this);
            
            self.dropdownVersionMenu.show();
            self.dropdownVersionMenu.css('position', 'absolute').position({
                my:  "left bottom",
                at : "left top",
                of: self.element
            });
        });
        
        
        this.element.bind("keyup", function() {
           self._filter($(this).val()); 
        });
        
        
        if(!$.data(document, 'versions-rendered')) {
            //render menu
            this.dropdownVersionMenu = $("<div class='versionsAutoComplete ui-widget-content ui-corner-all'></div>");
            this._renderFilterOptions();
            this._renderVersions();
            this._filter();
          
            $("body").append(this.dropdownVersionMenu);
            
            this.dropdownVersionMenu.hide();
            $.data(document, 'dropdownVersionMenu', this.dropdownVersionMenu);
        } else {
            this.dropdownVersionMenu = $.data(document, 'dropdownVersionMenu');
        }
                
        $.data(document, 'versions-rendered', true);
        
        this.element.hover(function() {
            self.intentToHide = false;
        }, function() {
            self.intentToHide = true;
            delay(function() {
                if(self.intentToHide) {
                    self.dropdownVersionMenu.hide();
                }
            }, 400);
            this.intentToHide = true; 
        });

        this.dropdownVersionMenu.hover(function() {
            self.intentToHide = false;
        }, function() {
            self.intentToHide = true;
            delay(function() {
                if(self.intentToHide) {
                    self.dropdownVersionMenu.hide();
                }
            }, 400);
        });
        
        this._bindHandlers(this);
    },

    
    _bindHandlers : function(that) {
        var self = that;
        $(".versionsListMenu", this.dropdownVersionMenu).menu({
            selected: function(event, item) {
             
             var isMulti = step.autoVersions.currentElement.versions("option", "multi");
             if(!isMulti) {
                 step.autoVersions.currentElement.val(item.item.attr('initials'));
                 step.autoVersions.currentElement.trigger('change');
                 self.dropdownVersionMenu.hide();
             } else {
                 var currentValue = step.autoVersions.currentElement.val();
                 if(currentValue.trim() == "") {
                     step.autoVersions.currentElement.val(item.item.attr('initials'));
                 } else {
                     step.autoVersions.currentElement.val(currentValue + "," + item.item.attr('initials'));
                 }
                 
                 step.autoVersions.currentElement.trigger('change');
                 self.dropdownVersionMenu.hide();
             }
            }
        }).removeClass("ui-widget-content ui-corner-all");

    },
    
    _filter : function(val) {
        var versions = this._filteredVersions(val);
        
        var listItems = $("[initials]", this.dropdownVersionMenu);
        
        //on ancient, we only keep the versions once.
        var language = this.dropdownVersionMenu.find("input:checkbox[name=language]:checked").val();
        var kept = {};
        $.each(listItems, function(i, item) {
            var jqItem = $(item);
            var initials = jqItem.attr('initials');
            if(versions[initials] == undefined || (language == 'langAncient' && kept[initials])) {
                //hide element
                jqItem.hide();
            } else {
                //show element
                jqItem.show();
                kept[initials] = true;
            }
        });
    },
    
    _filteredVersions : function(val) {
        var widget = this.dropdownVersionMenu;
        
        var resource = widget.find("input:checkbox[name=textType]:checked").val();
        var language = widget.find("input:checkbox[name=language]:checked").val();
       
       var filteredVersionResult = {};
       var ancientAlreadyIn = {};
       
       $.each(step.versions, function(index, item) {
           if(val) {
               var lv = val.toLowerCase();
               if(item.initials.toLowerCase().indexOf(lv) == -1 && item.name.toLowerCase().indexOf(lv) == -1) {
                   //reject
                   return;
               } else {
                   filteredVersionResult[item.initials] = 'keep';
                   return;
               }
           }
           
           
            if(resource == 'commentaries' && item.category != 'COMMENTARY' ||
               resource == undefined && item.category == 'COMMENTARY') {
                //we ignore commentaries outright for now
                return;
            } else if(resource == 'bibles' && item.category != 'BIBLE') {
                return;
            }
            
  
            var lang = item.languageCode;
            if(language == "langAncient" && lang != 'grc' && lang != 'la' && lang != 'he') {
                return;
            }

            var currentLang = step.state.language(1);
            
            //if we've got those buttons, i.e. currentLang != English
            if( currentLang != 'en' &&       
                    language == "langMyAndEnglish" && lang != currentLang && lang != 'en') {
                return;
            }
            
            
            if((language == "langMy" || language == undefined) && lang != currentLang) {
                return;
            }
            
            filteredVersionResult[item.initials] = 'keep';
            return;
        });
       return filteredVersionResult;
    },
    
    _renderFilterOptions : function() {
        var self = this;
        var languageName = step.user.language.name;
        var languageCode =  step.user.language.code;
        
        var toolbarContainer = $("<div class='filterOptions'></div>");
        
        var toolbar = "";
        toolbar += '<table width="100%">';
        
        toolbar += '<tr class=""><td class="filterHeader">Resource type</td><td>';
        toolbar += '<span class="filterButtonSet"><input type="checkbox" id="bibles" value="bibles" name="textType" key="bibles" checked="checked" /><label for="bibles">Bibles</label>';
        toolbar += '<input type="checkbox" id="commentaries" value="commentaries" name="textType"  key="commentaries" /><label for="commentaries">Commentaries</label></span>';
        toolbar += '</td>';    
        toolbar += '</tr>';

        toolbar += '<tr class="filterButtonSet languageFilters"><td class="filterHeader">Languages</td><td>';
        toolbar += '<span ><input type="checkbox" id="languageAll" value="langAll" name="language" key="langAll" /><label for="languageAll">All</label></span>';

        toolbar += '<input type="checkbox" id="languageMy" value="langMy" name="language"  key="langMy" ';
        if(languageCode == 'en') {
            //default to english
            toolbar += 'checked="checked"';
        }
        toolbar += '/><label for="languageMy">' + languageName + '</label>';
        
        if(languageCode != 'en') {
            toolbar += '<input type="checkbox" id="languageMyAndEnglish" value="langMyAndEnglish"  key="langMyEnglish" name="language" checked="checked" /><label for="languageMyAndEnglish">' + languageName + ' + English</label>';
        }
        
        toolbar += '<span ><input type="checkbox" id="languageAncient" value="langAncient"  key="langAncient" name="language" /><label for="languageAncient">Ancient</label></span>';
        
        toolbar += '</td></tr>';
            
        
        toolbar += '</table>';
        toolbar += '<div class="filterTagLine">Filtering ' + step.versions.length + ' Bibles &amp; Commentaries</div><hr />';
        
        
        toolbarContainer.append($(toolbar));
        $(toolbarContainer).find("input").button().click(function() {
            var group = $(this).attr('name');
        
            if(group) {
                var groupOfInputs = $(this).closest('.filterButtonSet').find("input[name='" + group + "']");
                groupOfInputs.not($(this)).prop('checked', false).button("refresh");
                
                //check that we have at least something ticked..
                if($("input:checked", groupOfInputs).size() == 0) {
                    $(this).prop('checked', true).button("refresh");;
                }
            }
            
            self._filter();
        });

        $(".filterButtonSet", toolbarContainer).buttonset();

        this.dropdownVersionMenu.append(toolbarContainer);
    },
    
    _renderVersions : function() {
        var self = this;
        var menu = $("<ul class='versionsListMenu'></ul>");
        
        if(step.strongVersions) {
            $.each(step.strongVersions, function(i, version) {
                menu.append(self._renderItem(version));
            });

            menu.append(self._renderItem(step.keyedVersions["ESV"]));
            
            //get last item, and mark it out
            var items = menu.find("li");
            var lastItem = items[items.length - 1];
            $(lastItem).addClass("versionBreakMenuItem");
        }
        
        
        if(step.versions) {
            $.each(step.versions, function(i, version) {
                menu.append(self._renderItem(version));
            });
            
            this._rendered = true;
            this.dropdownVersionMenu.append(menu);
        }
    },
    
    _renderItem : function(item) {
        var name = item.name;
        var overName = step.version.names[item.initials.toLowerCase()];
        if(overName != undefined && overName.name != undefined) {
            name = overName.name;
        }
        
        var showingText = 
            "<span class='versionKey' >" + item.initials + "</span><span style='font-size: larger'>&rArr;</span>&nbsp;" +
            "<span class='versionName'>" + name + "</span>";
        var features = "";
        // add to Strongs if applicable, and therefore interlinear
        if (item.hasStrongs) {
            features += " " + "<span class='versionFeature' title='Vocabulary available'>V</span>";
            features += " " + "<span class='versionFeature' title='Interlinear available'>I</span>";
        }

        // add morphology
        if (item.hasMorphology) {
            features += " " + "<span class='versionFeature' title='Grammar available'>G</span>";
        }
        
        if(item.hasRedLetter) {
            features += " " + '<span class="versionFeature" title="Able to show Jesus\' words in red">R</span>';
        }
        
        // return response for dropdowns
        var itemHtml = "<li title='" + item.name + " (" + item.languageName.replace("'", "&quot;")  + ")' initials='" + item.initials +  "'><a><span class='features'>" + features + "</span>" + showingText + "</a></li>";
        return $(itemHtml);
    }
});
