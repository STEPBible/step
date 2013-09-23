var hearingFilteredComplete = false;

step.autoVersions = {
    currentElement : undefined
};

$.widget("custom.versions",  {
    _rendered : false,
    options : {
        multi : false,
        suggestedEnglish : ['ESV', 'KJV', 'ASV', 'DRC'],
        suggestedAncient : ['OSMHB', 'LXX', 'Byz', 'TR', 'WHNU'],
        ancientOrder : [
                        [__s.hebrew_ot, ["Aleppo", "OSMHB", "SP", "WLC"]],
                        [__s.greek_ot, ["LXX", "ABPGRK", "ABP"]],
                        [__s.greek_nt, ["Antoniades", "Byz", "Elzevir", "SBLGNT", "TNT", "TR", "WHNU"]], 
                        [__s.latin_texts, ["Vulgate", "VulgSistine", "VulgHetzenauer", "VulgConte", "VulgClementine", "DRC"]],
                        [__s.syriac_texts, ["Peshitta", "Etheridge", "Murdock"]],
                        [__s.alternative_samaritan, ["SP", "SPMT", "SPVar", "SPDSS", "SPE"]]
                       ]
    },
    
    _create : function() {
        var self = this;
        this.intentToHide = false;
        this.currentElement = this.element;
        this.element.addClass("versionsComplete");
                
        this.element.bind('focus click', function() {
            step.autoVersions.currentElement = $(this);
            
            self.dropdownVersionMenu.show();
            
            self._filter(self._wasFullToken($(this).val()));
            self.dropdownVersionMenu.css('position', 'absolute').position({
                my:  "left bottom",
                at : "left top",
                of: self.element,
                collision: "flip"
            });
            self.ensureInWindow();
        });
        
        
        this.element.bind("keyup", function(event) {
            var kc = event.keyCode;

            //48 to 90 = 0-9A-z
            //96 to 111 = num pad keys
            //188 to 222 = punctuation
            //8 = backspace
            if(kc >= 48 && kc <= 90 || kc >= 96 && kc <= 111 || kc >= 188 && kc <= 222 || kc == 8) {
                self._filter($(this).val());
                return;
            }
            
            if(kc == 27 || kc == 9 || kc == 13) {
                self.dropdownVersionMenu.hide();
            }
        });
        
        
        if(!$.data(document, 'versions-rendered')) {
            //render menu
            this.dropdownVersionMenu = $("<div class='versionsAutoComplete stepComplete ui-widget-content ui-corner-all'></div>");
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

    ensureInWindow : function() {
        var windowHeight = $(window).height();
        var dropdownHeight = $(this.dropdownVersionMenu).height();
        var dropdownTop = $(this.dropdownVersionMenu).position().top;
        
        if(dropdownHeight + dropdownTop > windowHeight) {
            //it's off screen.
            // console.log("Dropdown is off screen");
            //our best attempt is going to be to move it up a bit 
            this.dropdownVersionMenu.css('top', dropdownTop - (dropdownHeight + dropdownTop - windowHeight));
        }
    },
    
    _wasFullToken : function(val) {
        //if val is already a selected module, then show everything, not just the filtered value
        var lastToken = val;
        if(!step.util.isBlank(lastToken)) {
            //check we are not already selecting a module:
            lastToken = lastToken.split(",").pop();
            if(step.keyedVersions[lastToken.toUpperCase()]) {
                lastToken = "";
            }
        }
        return lastToken;
    },
    
    _bindHandlers : function(that) {
        var self = that;
        $(".versionsListMenu", this.dropdownVersionMenu).menu({
            select: function(event, item) {
             
             var isMulti = step.autoVersions.currentElement.versions("option", "multi");
             if(!isMulti) {
                 step.autoVersions.currentElement.val(item.item.attr('initials'));
                 step.autoVersions.currentElement.trigger('change');
                 self.dropdownVersionMenu.hide();
             } else {
                 var currentValue = step.autoVersions.currentElement.val();
                 if(currentValue.trim() == "") {
                     step.autoVersions.currentElement.val(self.sanitizeVersions(item.item.attr('initials')));
                     step.autoVersions.currentElement.trigger('change');
                 } else {
                     var selectedVersion = item.item.attr('initials');
                     var currentEntries = currentValue.split(',');

                     // The entry currently being edited by the user
                     var editPos = step.autoVersions.currentElement.context.selectionStart;
                     var editVersion = "";
                     var editIndex = 0;

                     // Let's find the text the user entered
                     var entryPos = 0;
                     for(var i = 0; i < currentEntries.length; i++) {
                         entryPos += currentEntries[i].length + 1;
                         if(editPos < entryPos) {
                             editVersion = currentEntries[i];
                             editIndex = i;
                             break;
                         }
                     }

                     // Replace what the user typed with what he picked
                     currentEntries[editIndex] = selectedVersion
                     var newValue = currentEntries.join(',') + ",";

                     step.autoVersions.currentElement.val(self.sanitizeVersions(newValue));
                     step.autoVersions.currentElement.trigger('change');
                 }
                 
                 self.dropdownVersionMenu.hide();
             }
            }
        }).removeClass("ui-widget-content ui-corner-all");

    },
    
    sanitizeVersions : function(item) {
        return item.replace(/,,+/g, ',');
    },
    
    _filter : function(val) {
        var lastToken = val;
        if(!step.util.isBlank(val)) {
            //obtain the last token
            lastToken = lastToken.split(",").pop();
        }
        
        var versions = this._filteredVersions(lastToken);
        var listItems = $("[initials]", this.dropdownVersionMenu);
        $("li.header", this.dropdownVersionMenu).show();


        $.each(listItems, function(i, item) {
            var jqItem = $(item);
            var initials = jqItem.attr('initials');
            //look up the normalized version, as initials may be the short form
            if(versions[step.keyedVersions[initials.toUpperCase()].initials] == undefined) {
                //hide element
                jqItem.hide();
            } else {
                //show element
                jqItem.show();
            }
        });

        //hide sibling headers
        var allElements = $("li:visible", this.dropdownVersionMenu);
        var wasHeader = allElements.first().hasClass("header");
        for(var i = 1; i < allElements.length; i++) {
            var newHeader = allElements.eq(i).hasClass("header");

//            console.log(allElements.eq(i).text(), wasHeader, newHeader);
            if(wasHeader && newHeader) {
                allElements.eq(i-1).hide();
            }
            wasHeader = newHeader;
        }

        var lastHeader = allElements.last();
        if(lastHeader.hasClass("header")) {
            lastHeader.hide();
        }

        this.dropdownVersionMenu.show();
    },
    
    _filteredVersions : function(val) {
        var widget = this.dropdownVersionMenu;
        if(val !== undefined)
            val = val.trim();
        
        var resource = widget.find("input:checkbox[name=textType]:checked").val();
        var language = widget.find("input:checkbox[name=language]:checked").val();
       
       var filteredVersionResult = {};
       var ancientAlreadyIn = {};
       var regex = new RegExp("\\b" + val, "ig");

        for(var key in step.versions.name) {
            if(key.match(regex) || step.versions.name[key].match(regex)) {
                filteredVersionResult[item.initials] = 'keep';
            }
        }

       $.each(step.versions, function(index, item) {
           if(val) {
               if(item.shortInitials.match(regex) != null ||
                       item.initials.match(regex) != null ||
                       item.name.match(regex) != null
                   ) {
                   filteredVersionResult[item.initials] = 'keep';
                   return;
               } else {
                   //reject
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
            if(language == "langAncient" && lang != 'grc' && lang != 'la' && lang != 'he' && lang != 'syr') {
                if(item.initials != 'DRC' && item.initials != 'SPE' && item.initials != 'Murdock' && item.initials != 'ABP' && item.initials != 'Etheridge') {
                    return;
                }
            }

            var currentLang = step.state.language(1);
            
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
        
        toolbar += '<tr class=""><td class="filterHeader">' + __s.resource_type + '</td><td>';
        toolbar += '<span class="filterButtonSet"><input type="checkbox" id="bibles" value="bibles" name="textType" key="bibles" checked="checked" /><label for="bibles">' + __s.bibles + '</label>';
        toolbar += '<input type="checkbox" id="commentaries" value="commentaries" name="textType"  key="commentaries" /><label for="commentaries">' + __s.commentaries + '</label></span>';
        toolbar += '</td>';    
        toolbar += '</tr>';

        toolbar += '<tr class="filterButtonSet languageFilters"><td class="filterHeader">' + __s.languages + '</td><td>';
        toolbar += '<span ><input type="checkbox" id="languageAll" value="langAll" name="language" key="langAll" /><label for="languageAll">' + __s.all + '</label></span>';

        toolbar += '<input type="checkbox" id="languageMy" value="langMy" name="language"  key="langMy" ';
        toolbar += 'checked="checked" ';
        toolbar += '/><label for="languageMy">' + languageName + '</label>';
        
        toolbar += '<span ><input type="checkbox" id="languageAncient" value="langAncient"  key="langAncient" name="language" /><label for="languageAncient">' + __s.ancient + '</label></span>';
        
        toolbar += '</td></tr>';
            
        
        toolbar += '</table>';
        toolbar += '<div class="filterTagLine">' +
            "<a href='https://stepweb.atlassian.net/wiki/x/GYCV' target='_blank'>" +
            sprintf(__s.filtering_bibles_and_commentaries, step.versions.length) +
            "<a/>" +
            '</div><hr />';
        
        
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
            
            if(group == "language") {
                self._reRenderVersions();
            }
            
            self._filter();
        });

        $(".filterButtonSet", toolbarContainer).buttonset();

        this.dropdownVersionMenu.append(toolbarContainer);
    },
    
    _reRenderVersions : function() {
        $(".versionsListMenu", this.dropdownVersionMenu).remove();
        this._renderVersions();
        this._bindHandlers(this);
    },
    
    _renderVersions : function() {
        var self = this;
        var menu = $("<ul class='versionsListMenu'></ul>");
        
        //check language button
        var selectedView = this.dropdownVersionMenu.find("input:checkbox[name=language]:checked").val();
        if(selectedView == "langMy" && step.state.language(1) == "en" ) {
            this._renderList(menu, this.options.suggestedEnglish);
        } else if(selectedView == "langAncient") {
            this._renderList(menu, this.options.suggestedAncient);  
            this._drawLineBelowLastItem(menu);
            
            //render each part of ancientOrder separately
            $.each(this.options.ancientOrder, function(i, arrayOfVersions) {
                //we add a header from the first element, and the list of versions
                //from the second
                var header = $("<li>").addClass("header").append(arrayOfVersions[0]);
                menu.append(header);
                
                menu.append(self._renderList(menu, arrayOfVersions[1]));
            });
            this._attachBuiltMenu(menu);
            return;
        } else if (selectedView == "langAll" && step.strongVersions) {
            this._renderStrongVersions(menu);
        }

        //get last item, and mark it out
        this._drawLineBelowLastItem(menu);

        
        if(step.versions) {
            if(selectedView == 'langAll') {
                var sortedVersions = step.versions.slice(0);
                sortedVersions.sort(function(a,b) {
                    if(a == undefined) {
                        return 1;
                    }

                    if (b == undefined) {
                        return -1;
                    }

                    if(a.languageName < b.languageName) {
                        return -1;
                    }

                    if(a.languageName > b.languageName) {
                        return 1;
                    }

                    return 0;
                });

                var lastLanguage = null;
                $.each(sortedVersions, function(i, version) {
                    if(lastLanguage != version.languageName) {
                        var header = $("<li>").addClass("header").append(version.languageName);
                        menu.append(header);
                    }

                    menu.append(self._renderItem(version));
                    lastLanguage = version.languageName;
                });

            } else {
                $.each(step.versions, function(i, version) {
                    menu.append(self._renderItem(version));
                });
            }
        }
        this._attachBuiltMenu(menu);
    },
    
    _attachBuiltMenu : function(menu) {
        this._rendered = true;
        this.dropdownVersionMenu.append(menu);
    },
    
    _drawLineBelowLastItem : function(menu) {
        menu.find("li:last").addClass("versionBreakMenuItem");
    },

    _renderList : function(menu, list) {
        if(list == undefined) {
            return;
        }
        
        for(var ii = 0; ii < list.length; ii++) {
            var version = step.keyedVersions[list[ii].toUpperCase()];
            //the version may not be installed and we're now listing the versions client side
            if(version != undefined) {
                menu.append(this._renderItem(version));
            }
        }
    },
    
    _renderStrongVersions : function(menu) {
        var self = this;
        menu.append(this._renderItem(step.keyedVersions["ESV"]));
        var renderedVersion = {};
        
        $.each(step.strongVersions, function(i, version) {
            if(renderedVersion[version.initials] == undefined) {
                menu.append(self._renderItem(version));
                renderedVersion[version.initials] = true;
            }
        });

    },
    
    _renderItem : function(item) {
        var name = item.name;
        var overName = step.version.names[item.initials.toLowerCase()];
        if(overName != undefined && overName.name != undefined) {
            name = overName.name;
        }
        
        var showingText = 
            "<span class='versionKey' >" + item.shortInitials + "</span><span style='font-size: larger'>&rArr;</span>&nbsp;" +
            "<span class='versionName'>" + name + "</span>";

        
        var features = step.util.ui.getFeaturesLabel(item);
        
        // return response for dropdowns
        var itemHtml = "<li title='" + item.name + " (" + item.languageName.replace("'", "&quot;")  + ")' initials='" + item.shortInitials +  "'><a><span class='features'>" + features + "</span>" + showingText + "</a></li>";
        return $(itemHtml);
    }
});
