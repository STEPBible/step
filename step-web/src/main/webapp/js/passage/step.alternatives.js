step.alternatives = {
        enrichPassage : function(passageId, passageContent, version, reference) {
            var self = this;
            
            // only do this if we've got a particular parameter set in the URL
            if($.getUrlVar("altMeanings") != "true") {
                return;
            }
            
            //check version next
            if(!version || (version.toLowerCase() != "esv" && version.toLowerCase() != "esvex")) {
                return;
            }
            
            
            $.getSafe(ALTERNATIVE_TRANSLATIONS + reference, function(data) {
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
                                var isEsvOption = alternative.type.indexOf("ESV:") >= 0;
                                
                                text += "<span class='singleAlternative'>" + self.enrichTypeQualifier(alternative.type);
                                text += " <a class='alternative alt-" + o + "' href='#' matching='" + option.matchingText.replace(/'/ig, "\\'") + "' esv='" + isEsvOption + "'>" + alternative.alternative + "</a>";
                                if(!step.util.isBlank(alternative.specifier)) {
                                    text += " (" + self.enrichTypeQualifier(alternative.specifier) + ")";
                                }
                                text += "</span><br />";
                            });
                            
                            $(".av-" + o, scope).qtip({
                                content: text,
                                show: { event : 'mouseenter', solo: true },
                                hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
                                position : { my: "bottom center", at: "top center", viewport: $(window) },
                                events : {
                                    visible : function(event, api) {
                                        $("a.alt-" + o).click(function(event) {
                                            if(step.passage.versions == undefined) {
                                                step.passage.versions = { warningRaised : true};
                                                step.util.raiseInfo(__s.alternatives_esv_warning, 'warning', passageId, true);
                                            }
                                            
                                            var all = $(".av-" + o, scope);
                                            var first = all.first();
                                            var others = first.text($(this).text()).end().not(":first");
                                            
                                            var firstParent = first.parent();
                                            $.each(others, function(i, element) {
                                                var item = $(element);
                                                var parent = item.parent();
                                                
                                                $(item).remove();
                                                
                                                if(parent.children().length == 0) {
                                                    //add strongs and morphs
                                                    firstParent.attr('morph', firstParent.attr('morph') + " " + parent.attr('morph'));
                                                    firstParent.attr('strong', firstParent.attr('strong') + " " + parent.attr('strong'));
                                                    parent.remove();
                                                }
                                            })
                                            
                                            if($(this).attr('esv') != 'true') {
                                                first.addClass("altered ui-state-highlight");
                                            } else {
                                                first.removeClass("altered ui-state-highlight");
                                            }
                                            
                                        });
                                    }
                                },
                                style: { 
                                    classes: 'ui-tooltip-default noQtipWidth ui-state-highlight'
                                }
                             });
                        }
                    });
                });
            }).error(function() {
                changeBaseURL();
            });
        },
        
        enrichTypeQualifier : function(text) {
            var extraValue = "";
            
            if(text == undefined || text == "") {
                return "";
            }
            
            var compare = text.toLowerCase().trim();
            var esvPrefix = "";
            
            if(compare.indexOf("esv") == 0) {
                esvPrefix = "<span title=\"" + __s.alternatives_esv_source + "\">ESV: </span>";
                compare = compare.substring(3).trim();
            }
            
            if(compare == "") {
                return esvPrefix;
            }
            
            
            var internationalKey = compare.trim().replace(/:+/ig, '').trim().replace(/\s+/ig, '_').trim();
            if(internationalKey == "") {
                return esvPrefix;
            }
            
            var longInternationalKey  = "alternative_long_" + internationalKey;
            var shortInternationalKey = "alternative_" + internationalKey;
            
            
            var fullText = sprintf("%1$s%2$s", esvPrefix, __s[shortInternationalKey]);
            var extraValue = __s[longInternationalKey];
            if(extraValue != "") {
                return "<span title=\"" + extraValue + "\">" + fullText + "</span>";
            }
            return fullText;
        }
}