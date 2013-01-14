step.alternatives = {
        enrichPassage : function(passageId, passageContent) {
            var self = this;
            
            // only do this if we've got a particular parameter set in the URL
            if($.getUrlVar("altTranslations") != "true") {
                return;
            }
            
            
            $.getSafe(ALTERNATIVE_TRANSLATIONS + step.state.passage.reference(passageId), function(data) {
                $.each(data.versionVerses, function(v, verse) {
                    // item has reference and options
                    var scope = $(".verse a[name = '" + verse.reference + "']", passageContent).closest(".verse").get(0);
                    
                    $.each(verse.options, function(o, option) { 
                        if(option.matchingText) {
                            // do the match twice, once with the matchingText
                            // once with the context
                            step.util.ui.highlightPhrase(scope, "alternativePartialMatch", option.matchingText);
                            step.util.ui.highlightPhrase(scope, "alternativeContext", option.context);
                            
                            // now get anything that has both classes:
                            $(".alternativePartialMatch:has(.alternativeContext)", scope).addClass("alternativeVersion av-" + o);
                            
                            // now clean up and remove classes
                            $(".alternativePartialMatch", scope).removeClass("alternativePartialMatch");
                            $('.alternativeContext').contents().filter(function() {
                                return this.nodeType === 3
                            }).unwrap();
                            
                            
                            var text = "";
                            $.each(option.phraseAlternatives, function(pa, alternative) { 
                                text += "<span class='singleAlternative'>" + self.enrichTypeQualifier(alternative.type);
                                text += " <a class='alternative alt-" + o + "' href='#' matching='" + option.matchingText.replace(/'/ig, "\\'") + "'>" + alternative.alternative + "</a>";
                                if(!step.util.isBlank(alternative.specifier)) {
                                    text += " (" + self.enrichTypeQualifier(alternative.specifier) + ")";
                                }
                                text += "</span><br />";
                            });
                            
                            $(".av-" + o, scope).qtip({
                                content: text,
                                show: { 
                                    event : 'mouseenter',
                                    solo: true
                                },
                                hide: { 
                                    event: 'unfocus',
                                },
                                
                                position : {
                                    my: "bottom center",
                                    at: "top center",
                                    viewport: $(window),
                                },
                                events : {
                                    visible : function(event, api) {
                                        $("a.alt-" + o).click(function(event) {
                                            if(step.passage.versions == undefined) {
                                                step.passage.versions = { warningRaised : true};
                                                step.util.raiseInfo(passageId, "The text shown below has been modified and does not show the original ESV text", 'error', true);
                                            }
                                            
                                            $(".av-" + o, scope).first().text($(this).text()).addClass("altered").end().not(":first").remove();
                                            
                                        });
                                    }
                                },
                                style: { 
                                    classes: 'ui-tooltip-default noAlternativeWidth'
                                }
                             });
                        }
                    });
                });
            });
        },
        
        enrichTypeQualifier : function(text) {
            var extraValue = "";
            
            if(text == undefined || text == "") {
                return "";
            }
            
            var compare = text.toLowerCase().trim();
            
            if(compare.startsWith("esv")) {
                compare = compare.substring(3).trim();
            }
            
            if(compare == "") {
                return text;
            }
            
            if(compare.startsWith(":")) {
                compare = compare.substring(1).trim();
            }
            
            if      (compare == "hebrew")              { extraValue = "Leningrad Codex"; } 
            else if (compare == "aramaic")             { extraValue = "Ancient translation (Targum)";} 
            else if (compare == "syriac")              { extraValue = "Ancient translation (Peshitta)";} 
            else if (compare == "greek")               { extraValue = "Ancient translation (Septuagint)";} 
            else if (compare == "greek mss")           { extraValue = "Ancient translation (Old Greek)"; } 
            else if (compare == "latin")               { extraValue = "Ancient translation (Vulgate)";} 
            else if (compare == "samaritan")           { extraValue = "Pentateuch preserved by Samaritans";} 
            else if (compare == "judean Desert mss")   { extraValue = "Hebrew fragments from the Dead Sea and Judean wilderness";}  
            else if (compare == "egyptian mss")        { extraValue = "Hebrew manuscripts from the Cairo Geniza";} 
            else if (compare == "masoretic mss")       { extraValue = "Manuscripts different to Leningrad Codex";} 
            else if (compare == "egyptian")            { extraValue = "?"; } 
            else if (compare == "scribal note" )       { extraValue = "Manuscript margins (Masora incl. Qere)";}  
            else if (compare == "conjecture" )         { extraValue = "No manuscript support";} 
            else if (compare == "prob:" )              { extraValue = "Probable original text";} 
            else if (compare == "poss:" )              { extraValue = "Possible original text";} 
            else if (compare == "or:")                 { extraValue = "Alternative meaning";} 
            else if (compare == "lit:")                { extraValue = "More literal meaning";} 
            else if (compare == "ie:")                 { extraValue = "More idiomatic meaning";} 
            else if (compare == "old eng:")            { extraValue = "King James English";} 
            else if (compare == "sounds like:")        { extraValue = "Pun or similar word";} 
            
            if(extraValue != "") {
                return "<span title='" + extraValue + "'>" + text + "</span>";
            }
            return text;
        },
}