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
        quickEnglish : ["ASV", "BBE", "DRC", "ESV", "KJV", "NETtext", "RWebster", "WEB"],
        deeperEnglish : ["JPS", "LEB", "Rotherham", "AB", "YLT"],
        names : {
            asv         : {name : "American Standard Version ", level : 0},
            bbe         : {name : "Bible in Basic English ", level : 0},
            drc         : {name : "Douay-Rheims Catholic Bible ", level : 0},
            esv         : {name : "English Standard Version", level : 0},
            kjv         : {name : "King James Version (\"Authorised\") ", level : 0},
            nasb        : {name : "New American Standard Bible ", level : 0},
            nettext     : {name : "New English Translation ", level : 0},
            rwebster    : {level : 0},
            web         : {name : "World English Bible ", level : 0},
            jps         : {name : "Jewish Publication Society (OT)", level : 1},
            leb         : {name : "Lexham English Bible ", level : 1},
            rotherham   : {name : "Emphasized Bible ", level : 1},
            ab          : {name : "Translation of Greek Septuagint (OT)", level : 1},
            ylt         : {name : "Young's over-literal translation of Hebrew & Greek", level : 1},
            
            abp         : {name : "Interlinear for Greek Septuagint (OT)", level : 2 }, 
            etheridge   : {name : "Translation of Syriac Peshitta (NT)", level : 2}, 

            abpgrk      : {name : "Orthodox Greek Septuagint (Grk, OT)", level : 2},
            lxx         : {name : "Septuagint from Rahlf+Goettingen (Grk, OT)", level : 2},
            peshitta    : {name : "Syriac version (Syriac, NT)", level : 2},
            tnt         : {name : "Greek edition of Tregelles (Grk. NT)", level : 2},
            vulgate     : {name : "Latin Bible by Jerome (Lat. +Ap)", level : 2},
            whnu        : {name : "Westcott & Hort + NA27/UBS3 (Grk. NT)", level : 2},
            wlc         : {name : "BHS corrected to Leningrad codex (Heb. OT)", level : 2},
            
            //            DRC = Translation of Latin Vulgate (Eng. OT+Ap+NT)
            chiuns      : {name: "和合本圣经 （简体版）" },
            chincvs     : {name: "新译本 （简体版）" },
            chincvt     : {name: "新譯本 (繁體版)"}
        },
        
        updateInfoLink : function(passageId) {
            var version = step.state.passage.version(passageId);
            $(".infoAboutVersion", step.util.getPassageContainer(passageId)).attr("href", "version.jsp?version=" + version).attr("title", "Information about the " + version + " Bible / Commentary");
        },
        
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
//                    console.log("closing");
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
            
            this.refreshVersions(target, step.version.filteredVersions(target));
        },
        
        
        filteredVersions : function(target) {
            var widget = target.filteredcomplete("widget");
            
            var resource = widget.find("input:checkbox[name=textType]:checked").val();
            var language = widget.find("input:checkbox[name=language]:checked").val();
            var vocab = widget.find("input.vocabFeature").prop('checked');
            var interlinear = widget.find("input.interlinearFeature").prop('checked');
            var grammar = widget.find("input.grammarFeature").prop('checked');

            
            var level = $.localStore("step.slideView-versionsDetail");
            if(level == undefined) {
                level = 0;
            }
            
           return $.grep(step.versions, function(item, index) {
                if(resource == 'commentaries' && item.category != 'COMMENTARY' ||
                   resource == undefined && item.category == 'COMMENTARY') {
                    //we ignore commentaries outright for now
                    return false;
                } else if(resource == 'bibles' && item.category != 'BIBLE') {
                    return false;
                }
                
                //skip over feature filtering, if level is Quick or Deeper
                if(level == 2) {
                    //exclude if vocab and no strongs
                    if((vocab == true || interlinear == true) && !item.hasStrongs) {
                        return false;
                    }
                    
                    if(grammar == true && !item.hasMorphology) {
                        return false;
                    }
                }

                var lang = item.languageCode;
                if(level == 2 && language == "langAncient" && lang != 'grc' && lang != 'la' && lang != 'he') {
                    return false;
                }

                var currentLang = step.state.language(1);
                //if English and quick, buttons are not available, and we show only english language
                if(currentLang == 'en' && level == 0 && lang != 'en') {
                    //then exclude
                    return false;
                } 
                
                //if we've got those buttons, i.e. currentLang != English
                if( currentLang != 'en' &&       
                        language == "langMyAndEnglish" && lang != currentLang && lang != 'en') {
                    return false;
                }
                
                
                if((language == "langMy" || language == undefined) && lang != currentLang) {
                    return false;
                }
                
                //finally, if level is 0 or 1 we restrict what we see...
                var versionName = step.version.names[item.initials.toLowerCase()];
                if(level == 0) {
                    return versionName != undefined && versionName.level == 0;
                } else if (level == 1) {
                    versionName != undefined && versionName.level < 2;
                }
                
                return true;
            });
        },
        
        refreshVersions : function(target, versions) {
            // need to make server response adequate for autocomplete:
            var parsedVersions = $.map(versions, function(item) {
                
                var name = item.name;
                var overName = step.version.names[item.initials.toLowerCase()];
                if(overName != undefined && overName.name != undefined) {
                    name = overName.name;
                }
                
                var languageName = step.languages[item.lang2];
                var showingText = 
                    "<span class='versionInfo' title='" + item.name + " (" + item.languageName.replace("'", "&quot;")  + ")'>&#x24d8;</span>&nbsp;&nbsp;" +
                    "<span class='versionKey'>" +item.initials + "</span><span style='font-size: larger'>&rArr;</span>&nbsp;" +
                    "<span class='versionName'>" + name + "</span>";
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
                    features += " " + "<span class='versionFeature questionableFeature' title='Questionable material'>?</span>";
                }
                
                // return response for dropdowns
                return {
                    label : showingText,
                    value : item.initials,
                    features : features
                };
            });

            $(target).filteredcomplete("option", "source", parsedVersions);
            
            delay(function() {
                $(".versionInfo").click(function(event) {
                    event.preventDefault();
                }, 300);
            });
        }
};


$(step.version).hear("version-changed-0", function(source, data) {
   step.version.updateInfoLink(0);
});

$(step.version).hear("version-changed-1", function(source, data) {
    step.version.updateInfoLink(1); 
 });


$(step.version).hear("filter-versions", function(source, data) {
    var element = data;
    var target = $(element);
    
//    var versionsToKeep = step.version.filteredVersions(target);
//    $.map(versionsToKeep, function(n, i) {
//       return i.initials;
//    });
//    
//    $(".filteredCompleteVersions .versionKey").filter(function() {
//        return $.inArray($(this).html()) == -1;
//    }).hide();
    
    
    step.version.refreshVersions(target, step.version.filteredVersions(target));
//    target.filteredcomplete("search", "");
    
    //hack for IE.
    element.focus();
});


