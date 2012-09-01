/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
step.version = {
        autocomplete : function(target, selectHandler, changeHandler, blurHandler, additive) {
            // set up autocomplete
            target.filteredcomplete({
                minLength : 0,
                delay : 0,
                select : function(event, ui) {
                    //manually change the text, so that the change() method can fire against the right version
                    if(selectHandler) {
                        selectHandler(ui.item.value);
                    }

                    if(additive) {
                        var terms = split( this.value );
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push( ui.item.value );
                        // add placeholder to get the comma-and-space at the end
                        terms.push( "" );
                        this.value = terms.join( ", " );
                        
                        var that = this;
                        
                        delay(function() {
                            $(that).filteredcomplete("search", "");
                            }, 50);
                        
                        $(this).trigger('change');
                        return false;
                    }
                    
                    $(this).change();
                },
                open: function(event, ui) {
                    //check we've got the right size
                    $(".ui-autocomplete").map(function() {
                        //check if 'this' has a child containing the text of the first option
                            $(this).css('width', '400px').css("overflow-x", "hidden");
                            
                    });
                },
                
                close : function(event, ui) {
                    console.log("closing");
                }
            }).focus(function() {
                $(target).filteredcomplete("search", "");
            }).change(function() {
                if(changeHandler) {
                    changeHandler(this.value, target);
                }
                
                if(additive != true) {
                    $(this).blur();
                }
            }).blur(function() {
                if(blurHandler) {
                    blurHandler(target);
                }
            });

            target.data("filteredcomplete")._renderItem = function(ul, item) {
                return $("<li></li>").data("item.autocomplete", item).append("<a><span class='features'>" + item.features + "</span>" + item.label + "</a>").appendTo(
                        ul);
            };

//            $(target).filteredcomplete("option", "source", []);
            
            this.refreshVersions(target, step.versions);
        },
        
        
        filteredVersions : function(target) {
            var widget = target.filteredcomplete("widget");
            
            var resource = widget.find("input:radio[name=textType]:checked").val();
            var language = widget.find("input:checkbox[name=language]:checked").val();
            var vocab = widget.find("input.vocabFeature").prop('checked');
            var interlinear = widget.find("input.interlinearFeature").prop('checked');
            var grammar = widget.find("input.grammarFeature").prop('checked');

            console.log("language is ", language);
            
           return $.grep(step.versions, function(item, index) {
                if(resource == 'commentaries') {
                    //we ignore commentaries outright for now
                    return false;
                }
                
                //exclude if vocab and no strongs
                if((vocab == true || interlinear == true) && !item.hasStrongs) {
                    return false;
                }
                
                if(grammar == true && !item.hasMorphology) {
                    return false;
                }
                
                var lang = item.languageCode;
                if(language == "langAncient" && lang != 'grc' && lang != 'la' && lang != 'he') {
                    return false;
                }
                
                var currentLang = step.state.language(1);
                if(language == "langMyAndEnglish" && lang != currentLang && lang != 'en') {
                    return false;
                }
                
                if(language == "langMy" && lang != currentLang) {
                    return false;
                }
                
                
                return true;
            });
        },
        
        refreshVersions : function(target, versions) {
            // need to make server response adequate for autocomplete:
            var parsedVersions = $.map(versions, function(item) {
                var showingText = "<span class='versionKey'>" +item.initials + "</span><span style='font-size: larger'>&rArr;</span>&nbsp;<span class='versionName'>" + item.name + "</span>";
                var features = "";
                // add to Strongs if applicable, and therefore interlinear
                if (item.hasStrongs) {
                    features += " " + "<span class='versionFeature' title='Vocabulary available'>V<input type='checkbox' /></span>";
                    features += " " + "<span class='versionFeature' title='Interlinear available'>I</span>";
                }

                // add morphology
                if (item.hasMorphology) {
                    features += " " + "<span class='versionFeature' title='Grammar available'>G</span>";
                }

                if (item.isQuestionable) {
                    features += " " + "<span class='versioNFeature questionableFeature' title='Questionable material'>?</span>";
                }
                
                // return response for dropdowns
                return {
                    label : showingText,
                    value : item.initials,
                    features : features
                };
            });

            $(target).filteredcomplete("option", "source", parsedVersions);
        }
};



$(step.version).hear("filter-versions", function(source, data) {
    var element = data;
    var target = $(element);
//    var passageId = step.passage.getPassageId(element);
//    var passageContainer = step.util.getPassageContainer(passageId);
//    var passageVersion = $(".passageVersion", passageContainer);
    
    
    
    step.version.refreshVersions(target, step.version.filteredVersions(target));
    
    target.filteredcomplete("search", "");
    
    //hack for IE.
    element.focus();
});

