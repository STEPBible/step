var hearingFilteredComplete = false;

step.autoVersions = {
    currentElement : undefined,
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
        
        if(!$.data(document, 'versions-rendered')) {
            //render menu
            this.dropdownVersionMenu = $("<div class='versionsAutoComplete ui-widget-content ui-corner-all'></div>");
            this._renderFilterOptions();
            this._renderVersions();
            this._filter();
          
            $("body").append(this.dropdownVersionMenu);
            
            //need to render slider after attaching to document for impact to affect everything properly
            this._renderSlider();
            
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
                 step.autoVersions.currentElement.val(step.autoVersions.currentElement.val() + "," + item.item.attr('initials'));
                 step.autoVersions.currentElement.trigger('change');
             }
            }
        }).removeClass("ui-widget-content ui-corner-all");

    },
    
    _filter : function() {
        var versions = this._filteredVersions();
        
        var listItems = $("[initials]", this.dropdownVersionMenu);
        $.each(listItems, function(i, item) {
            var jqItem = $(item);
            if(versions[jqItem.attr('initials')] == undefined) {
                //hide element
                jqItem.hide();
            } else {
                //show element
                jqItem.show();
            }
        });
    },
    
    _filteredVersions : function() {
        var widget = this.dropdownVersionMenu;
        
        var resource = widget.find("input:checkbox[name=textType]:checked").val();
        var language = widget.find("input:checkbox[name=language]:checked").val();
        var vocab = widget.find("input.vocabFeature").prop('checked');
        var interlinear = widget.find("input.interlinearFeature").prop('checked');
        var grammar = widget.find("input.grammarFeature").prop('checked');
        
        
        var level = $.localStore("step.slideView-versionsDetail");
        if(level == undefined) {
            level = 0;
        }
       
       var filteredVersionResult = {};
       $.each(step.versions, function(index, item) {
            if(resource == 'commentaries' && item.category != 'COMMENTARY' ||
               resource == undefined && item.category == 'COMMENTARY') {
                //we ignore commentaries outright for now
                return;
            } else if(resource == 'bibles' && item.category != 'BIBLE') {
                return;
            }
            
            //skip over feature filtering, if level is Quick or Deeper
            if(level == 2) {
                //exclude if vocab and no strongs
                if((vocab == true || interlinear == true) && !item.hasStrongs) {
                    return;
                }
                
                if(grammar == true && !item.hasMorphology) {
                    return;
                }
            }

            var lang = item.languageCode;
            if(level == 2 && language == "langAncient" && lang != 'grc' && lang != 'la' && lang != 'he') {
                return;
            }

            var currentLang = step.state.language(1);
            //if English and quick, buttons are not available, and we show only english language
            if(currentLang == 'en' && level == 0 && lang != 'en') {
                //then exclude
                return;
            } 
            
            //if we've got those buttons, i.e. currentLang != English
            if( currentLang != 'en' &&       
                    language == "langMyAndEnglish" && lang != currentLang && lang != 'en') {
                return;
            }
            
            
            if((language == "langMy" || language == undefined) && lang != currentLang) {
                return;
            }
            
            //finally, if level is 0 or 1 we restrict what we see...
            var versionName = step.version.names[item.initials.toLowerCase()];
            if(level == 0) {
                if(versionName != undefined && versionName.level == 0) {
                    //continue
                } else {
                    return;
                };
            } else if (level == 1) {
                if(versionName != undefined && versionName.level < 2) {
                    //accept and continue
                } else {
                    return;
                };
            }
            
            filteredVersionResult[item.initials] = 'keep';
            return;
        });
       return filteredVersionResult;
    },
    
    _renderSlider : function() {
        var self = this;
        var languageCode =  step.user.language.code;
        
      //do detail slider
        var toolbarContainer = $(".filterOptions", this.dropdownVersionMenu);
        $("[name='versionsDetail']", toolbarContainer).detailSlider({ scopeSelector : ".filterOptions" });
        var currentLevel = $.localStore("step.slideView-versionsDetail");
        if(currentLevel == undefined) {
            currentLevel = 0;
        }
        
        if(currentLevel < 1 && languageCode == "en") {
            $(".languageFilters", toolbarContainer).hide();
        } else {
            $(".languageFilters", toolbarContainer).show();
        }
        
        $(this).hear("slideView-versionsDetail", function(data) {
            var level = $("[name='versionsDetail']", toolbarContainer).detailSlider("value");

            var levelElement = $("[name='versionsDetail']:visible", toolbarContainer);
            if(levelElement.length != 0) {
                if(level == 0) {
                    $(".languageFilters", toolbarContainer).hide();
                } else {
                    $(".languageFilters", toolbarContainer).show();    
                }
                self._filter();
            }
        });
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
        toolbar += '<span name="versionsDetail"></span></td>';    
        toolbar += '</tr>';

        toolbar += '<tr class="filterButtonSet languageFilters"><td class="filterHeader">Languages</td><td>';
        toolbar += '<span level=1><input type="checkbox" level=2 id="languageAll" value="langAll" name="language" key="langAll" /><label for="languageAll">All</label></span>';

        toolbar += '<input type="checkbox" id="languageMy" value="langMy" name="language"  key="langMy" ';
        if(languageCode == 'en') {
            //default to english
            toolbar += 'checked="checked"';
        }
        toolbar += '/><label for="languageMy">' + languageName + '</label>';
        
        if(languageCode != 'en') {
            toolbar += '<input type="checkbox" id="languageMyAndEnglish" value="langMyAndEnglish"  key="langMyEnglish" name="language" checked="checked" /><label for="languageMyAndEnglish">' + languageName + ' + English</label>';
        }
        
        toolbar += '<span level=2><input type="checkbox" id="languageAncient" value="langAncient"  key="langAncient" name="language" /><label for="languageAncient">Ancient</label></span>';
        
        toolbar += '</td></tr>';
            toolbar += '<tr class="filterButtonSet" level=2><td class="filterHeader">Features available</td><td>';
            toolbar += '<input type="checkbox" id="vocabFeature" class="vocabFeature" key="vocab" /><label for="vocabFeature"><span class="versionFeature">V</span>ocabulary</label>';
            toolbar += '<input type="checkbox" id="interlinearFeature" class="interlinearFeature" key="interlinear" /><label for="interlinearFeature"><span class="versionFeature">I</span>nterlinear</label>';
            toolbar += '<input type="checkbox" id="grammarFeature" class="grammarFeature" key="grammar" /><label for="grammarFeature"><span class="versionFeature">G</span>rammar</label>';
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
        
        var languageName = step.languages[item.lang2];
        var showingText = 
            "<span class='versionInfo' title='" + item.name + " (" + item.languageName.replace("'", "&quot;")  + ")'>&#x24d8;</span>&nbsp;&nbsp;" +
            "<span class='versionKey'>" + item.initials + "</span><span style='font-size: larger'>&rArr;</span>&nbsp;" +
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
        
        // return response for dropdowns
        var itemHtml = "<li initials='" + item.initials +  "'><a><span class='features'>" + features + "</span>" + showingText + "</a></li>";
        return $(itemHtml);
    }
});
