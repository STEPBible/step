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

step.util = {
    passageContainers: [null, null],
    passageContents: [null, null],
        
	getPassageContainer: function(passageIdOrElement) {
	    //check if we have a number
	    if(isNaN(parseInt(passageIdOrElement))) {
	        //assume jquery selector or element
	        return $(passageIdOrElement).closest(".passageContainer");
	    }
	    
	    //check if we're storing it
	    if(this.passageContainers[passageIdOrElement] == null) {
	        var container = $(".passageContainer[passage-id = " + passageIdOrElement + "]");
	        this.passageContainers[passageIdOrElement] = container;
	    } 
        return this.passageContainers[passageIdOrElement];
	},

	getAllPassageIds: function() {
		return $(".passageContainer").map(function() { return $(this).attr("passage-id"); }).get();
	},
	
	getPassageContent: function(passageIdOrElement) {
	    if(isNaN(parseInt(passageIdOrElement))) {
	        return $(".passageContent", this.getPassageContainer(passageIdOrElement));
	    }
	    
	    if(this.passageContents[passageIdOrElement] == null) {
	        var content = $(".passageContent", step.util.getPassageContainer(passageIdOrElement));
	        this.passageContents[passageIdOrElement] = content;
	    } 
	    return this.passageContents[passageIdOrElement];
	},
	
	
	isBlank: function(s) {
	    if(s == null) {
	        return true;
	    }
	    return s.match(/^\s*$/g) != null;
	},
	
	isUnicode : function(element) {
	    return this.isClassOfUnicode(element, function(c) {
	        return c > 255; 
	    });
	},
	
	isHebrew : function(element) {
	    return this.isClassOfUnicode(element, function(c) {
	        return (c > 0x590 && c < 0x600) || (c > 0xFB10 && c < 0xFB50);
	    });
	},
	
	isClassOfUnicode : function(element, limiter) {
	    var text = "";
        if(element.text) {
            text = element.text();
        } else if(element.innerText) {
            text = element.innerText;
        } else if(element.charCodeAt) {
            text = element;
        }
        
        text = text.replace(/[0-9\s,.;:'“”]/g, "").trim();
        
        try {
            return limiter(text.charCodeAt(0));
        } catch(err) {
            return false;
        } 
	},
	
    raiseError: function (error) {
        var message = error.message ? error.message : error;
        
        $("#errorText").text(message);
        $("#error").data('numPassageChanges', 0).slideDown(250);
    },
    
	raiseErrorIfBlank: function(s, message) {
	    if(this.isBlank(s)) {
	        this.raiseError(message);
	        return false;
	    }
	    return true;
	},

	raiseInfo : function (passageId, message, level, eraseOnNextPassage) {
	    var infoBar = $(".infoBar", step.util.getPassageContainer(passageId));
	    var icon = $(".innerInfoBar .ui-icon", infoBar).addClass("ui-icon");
	    icon.removeClass();

	    if(level == 'error') {
            icon.addClass("ui-icon-alert");
	    } else {
	        icon.addClass("ui-icon-info");
	    }
	    
	    infoBar.toggle(true).data('numPassageChanges', eraseOnNextPassage ? 1 : 0).find(".infoLabel").html(message);
	    step.passage.ui.resize();
	},
	
	closeInfoErrors : function(passageId) {
	    var infoBar = $(".infoBar:visible", step.util.getPassageContainer(passageId));
	    this.hideIfPassageHasAlreadyChanged(infoBar);
	    this.hideIfPassageHasAlreadyChanged($("#error:visible"));
	},
	
	hideIfPassageHasAlreadyChanged : function(infoBar) {
        if(infoBar.length != 0) {
            var passageChanges = infoBar.data('numPassageChanges');
            if(passageChanges >= 1) {
                //hide the bar
                infoBar.toggle(false);
                step.passage.ui.resize();
            } else {
                infoBar.data('numPassageChanges', 1);
            }
        }	    
	},
	
	/**
	 * used in the search, to ensure apache/tomcat doesn't decode or dismiss special characters
	 */
	replaceSpecialChars : function(query) {
	    if(this.isBlank(query)) {
	        return "";
	    }
	    
        var str = query;
        var newStr;
        while(str != newStr) {
            newStr = str;
            str = str.replace('+', '#plus#').replace('/', "#slash#");
        }
        
        return str;	    
	},
	
	undoReplaceSpecialChars : function(query) {
	    if(this.isBlank(query)) {
	        return "";
	    }
    
	    var str = query;
	    var newStr;
	    while(str != newStr) {
	        newStr = str;
	        str = str.replace('~plus~', '+').replace("~slash~", '/').replace('#plus#', '+').replace("#slash#", '/');
	    }
	    
	    return str;
	},
	
    trackAnalytics : function(eventType, eventName, eventValue, numValue) {
        if(window["_gaq"]) {
            _gaq.push(['_trackEvent', eventType, eventName, eventValue, numValue]);
        }
    },
	
    ui : {
        getFeaturesLabel : function(item) {
            var features = "";
            
            // add to Strongs if applicable, and therefore interlinear
            if(item.hasRedLetter) {
                features += " " + '<span class="versionFeature" title="Able to show Jesus\' words in red">R</span>';
            }

            if (item.hasStrongs) {
                features += " " + "<span class='versionFeature' title='Vocabulary available'>V</span>";
                features += " " + "<span class='versionFeature' title='Interlinear available'>I</span>";
            }

            // add morphology
            if (item.hasMorphology) {
                features += " " + "<span class='versionFeature' title='Grammar available'>G</span>";
            }
            

            return features;
        },
        
        getVisibleVersions : function(passageId) {
            return $("fieldset:visible", step.util.getPassageContainer(passageId)).find(".searchVersions, .passageVersion, .extraVersions");
        },
        
        addStrongHandlers : function(passageId, passageContent) {
            var that = this;
            $("[strong]", passageContent).click(function() { 
                showDef(this);
            }).hover(function() {
                var self = this;
                delay(function() {
                    var strong = $(self).attr('strong');
                    var morph = $(self).attr('morph');
                    
                    $.getSafe(MODULE_GET_QUICK_INFO + strong + "/" + morph + "/", function(data) {
                        var vocabInfo = "";
                        if(data.vocabInfos) {
                            $.each(data.vocabInfos, function(i, item) {
                                vocabInfo +=    "<h1>" +
                                                "<span class='unicodeFont'>" +
                                                item.accentedUnicode + 
                                                "</span> (<span class='stepTransliteration'>" +
                                                that.markUpTransliteration(item.stepTransliteration) +
                                                "): " +
                                                item.stepGloss +
                                                "</h1>" +
                                                "<span>" + 
                                                (item.shortDef == undefined ? "" : item.shortDef) +
                                                "</span></p>";
                            });
                        }
                        
                        vocabInfo += "<span class='infoTagLine'>" +
                        "More information can be found by clicking on the word in the verse." +
                        "</span>";
                        
                        //"<span class='ancientSearch'>" + item.accentedUnicode + "</span> (<em>" + item.stepTransliteration + "</em>): " + (item.stepGloss == undefined ? "-" : item.stepGloss);
                        
                        $(".quickLexiconDefinition").remove();
                        var infoContent = "<div class='quickLexiconDefinition ui-state-highlight'>" +
                                    vocabInfo +
                                    "</div>";
                        var infoBox = $(infoContent);
                        
                        $("body").append(infoBox);
                        infoBox.css('right', "0px");
    
                    });
                }
             , 600);
            }, function() {
                var self = this;
                delay(function() {
                    $(".quickLexiconDefinition").remove();
                }, 150);
            });
        },
        autocompleteSearch : function(selector, data, readonly, preChangeHandler) {
            return $(selector).autocomplete({
                minLength: 0,
                delay : 0,
                source: data,
                select: function(event, ui) {
                    $(this).val(ui.item.value);
                    
                    if(preChangeHandler) {
                        preChangeHandler(this, ui.item.value);
                    }
                    
                    $(this).change();
                    $(this).trigger('keyup');
            }})
            .click(function() {
                $(this).autocomplete("search", "");
            }).attr("readonly", readonly == true);
        },

        searchButton : function(selector, searchType, callback, preClickHandler) {
            var self = this;
            $(selector).click(function() {
                var passageId = step.passage.getPassageId(this);
                if(preClickHandler) {
                    preClickHandler(passageId);
                }
                
                //clicking on search button resets page number to 1:
                self.resetPageNumber();
                
                step.state.activeSearch(passageId, searchType, true);
                
                if(callback) {
                    callback();
                }
            });
        },
        
        resetPageNumber : function() {
            $("fieldset:visible .pageNumber").val(1).trigger('change');
        },
        
        trackQuerySyntax : function(selector, namespace) {
            $(selector + " input").keyup(function(ev) {
                if(ev.which < 48 && ev.which != 8 && ev.which != 46) {
                    return true;
                }
                
                $(this).change();
                
                //re-evaluate query
                var passageId = step.passage.getPassageId(this);
                var syntax = step.search.ui[namespace].evaluateQuerySyntax(passageId);

                
                //also write it up the top
                if(syntax) {
                    $(".searchQuerySyntax", step.util.getPassageContainer(passageId)).val(syntax); 
                }
                
                if(syntax == undefined || syntax.startsWith("o") || syntax.startsWith("s")) {
                    //no estimate for original word search
                    return;
                }
                
                //finally attempt a search estimation
                delay(function() {
                    var versions = $("fieldset:visible .searchVersions", step.util.getPassageContainer(passageId)).val();
                    if(versions == undefined || versions.trim().length == 0) {
                        versions = "ESV";
                    }
                    
                    
                    if(step.search.refinedSearch.length == 0) {
                        $.getSafe(SEARCH_ESTIMATES, [encodeURIComponent(step.util.replaceSpecialChars(syntax)) + " in (" + versions + ")"], function(estimate) {
                            $("fieldset:visible .resultEstimates", step.util.getPassageContainer(passageId))
                                .html("~ <em>" + estimate + "</em> results")
                                .css("color", "#" + step.util.ui._calculateEstimateBackgroundColour(estimate));
                            
                        });
                    }
                }, 500);
                return true;
            });
        },
        
        testColor : function() {
            var i = 0;
            for(i = 0; i < 100; i++) {
                $("fieldset:visible .resultEstimates").prev().css("background-color", "#" + this._calculateEstimateBackgroundColour(i));
                
            }
        },
        
        _calculateEstimateBackgroundColour : function(numResults) {
            var red = 0x66;
            var green = 0x99;
            var blue = 0x66;
            
            var maxRed = 0xFF;
            var minGreen = 0x77;

            var redStep = Math.round((maxRed - red) / 50);
            var greenStep = Math.round((green - minGreen) / 50);    

            
            if(numResults <= 50) {
                return "009966";
            }
            
            var stepsRemaining = numResults;
            while(red < maxRed && stepsRemaining > 0) {
                red += redStep;
                stepsRemaining--;
            }
            
            while(green > minGreen && stepsRemaining > 0) {
                green -= greenStep;
                stepsRemaining--;
            }
            
            if(red > maxRed) {
                red = maxRed;
            }
            
            if(green < minGreen) {
                green = minGreen;
            }
            
            var color = this.pad2(red.toString(16)) + this.pad2(green.toString(16)) + this.pad2(blue.toString(16));
//            console.log("estimate color: ", color, " for ", numResults, " results");
            return color;
        },
        
        pad2 : function(s) {
            if(s.length < 2) {
                return "0" + s;
            }
            return s;
        },
        
        resetIfEmpty : function(passageId, force, evalFunction, defaultValue) {
            if(force == true || force == undefined || evalFunction(passageId) == null || evalFunction(passageId) == "") {
                evalFunction(passageId, defaultValue);
            }
        },
        
        initSearchToolbar : function() {
//            var toolbar = $(".searchToolbar");
            
            $(".moreSearchContext").button({
                text: false,
                icons: {
                    primary: "ui-icon-plusthick"
                }
            }).click(function() {
                var currentContext = $(this).siblings(".searchContext", this);
                var currentContextValue = parseInt(currentContext.val());
                var newContext = currentContextValue + 1;
                currentContext.val(newContext);
                
                currentContext.trigger('change');
                
                if(newContext != currentContextValue) {
                    step.state._fireStateChanged(step.passage.getPassageId(this));
                }
            });
            
            $(".lessSearchContext").button({
                text: false,
                icons: {
                    primary: "ui-icon-minusthick"
                }
            }).click(function() {
                var currentContext = $(this).siblings(".searchContext", this);
                var currentContextValue = parseInt(currentContext.val());
                var newContext = currentContextValue - 1;
                currentContext.val(newContext > 0 ? newContext : 0);
                
                currentContext.trigger('change');
                if(newContext != currentContextValue) {
                    step.state._fireStateChanged(step.passage.getPassageId(this));
                }
            });

            
            $(".adjustPageSize").button({
                icons : {
                    primary : "ui-icon-arrowstop-1-s"
                },
                text : false
            }).click(function(e) {
                e.preventDefault();
                var passageContainer = step.util.getPassageContainer(this);
                var windowHeight = $(window).height();
                var targetPageSize = 1;
                
                if(step.search.pageSize != step.defaults.pageSize) {
                    step.search.pageSize = step.defaults.pageSize;
                } else {
                    //find the one that extends beyond the window height
                    var rows = $("tr.searchResultRow");
                    for(var i = 0; i < rows.size(); i++) {
                        if(rows.eq(i).offset().top + rows.eq(i).height() > windowHeight) {
                            targetPageSize = i - 1;
                            break;
                        }
                    }
                    
//                    console.log("Target window size is " + targetPageSize);
                    step.search.pageSize = targetPageSize;
                }
                step.state._fireStateChanged(step.passage.getPassageId(this));
            });
            
            $(".previousPage").button({
                icons : {
                    primary : "ui-icon-arrowreturnthick-1-w"
                },
                text : false
            }).click(function(e) {
                e.preventDefault();
                
                //decrement the page number if visible fieldset:
                var pageNumber = $("fieldset:visible .pageNumber", step.util.getPassageContainer(this));
                var oldPageNumber = parseInt(pageNumber.val());
                
                if(oldPageNumber > 1) {
                    pageNumber.val(oldPageNumber - 1);
                    pageNumber.trigger("change");
                    step.state._fireStateChanged(step.passage.getPassageId(this));
                }
            });
            
            $(".nextPage").button({
                icons : {
                    primary : "ui-icon-arrowreturnthick-1-w"
                },
                text : false
            }).click(function(e) {
                e.preventDefault();
                
                var totalPages = Math.round((step.search.totalResults / step.search.pageSize) + 0.5);
                var pageNumber = $("fieldset:visible .pageNumber", step.util.getPassageContainer(this));
                
                
                var oldPageNumber = parseInt(pageNumber.val());
                if(oldPageNumber == undefined || oldPageNumber == 0 || oldPageNumber == Number.NaN) {
                    oldPageNumber = 1;
                }
                
                if(oldPageNumber < totalPages) {
                    pageNumber.val(oldPageNumber + 1);
                    pageNumber.trigger("change");
                    step.state._fireStateChanged(step.passage.getPassageId(this));
                }
            });
            
//            $(".concordanceFormat").button({
//                text: false,
//                icons: {
//                    primary: "ui-icon-grip-dotted-vertical"
//                }
//            }).click(function() {
//                var terms = step.search.highlightTerms;
//                if(terms.length != 1) {
//                    step.util.raiseError("Concordance style is only available for single-term searches");
//                }
//                
////                var term = step.search.highlightTerms[0];
////                var searchResults = $(".searchResults", step.util.getPassageContainer(this));
////                $(".searchResultRow", searchResults).each(function(i, item) {
////                    var textValue = $(item).text();
////                    
////                    
////                    //find the highlights
////                    var concordanceMiddle = $("<span class='concordanceMiddleColumn'></span>").add($(".highlight", item));
////                    
////                    var row = $(item).html(concordanceMiddle);
////                });
//            });
//            
            $(".refineSearch").button({
                text: false,
                icons: {
                    primary: "ui-icon-pencil"
                }
            }).click(function() {
                var passageContainer = step.util.getPassageContainer(this);
                step.search.refinedSearch.push(step.search.lastSearch);

                $(".refinedSearch .refinedSearchLabel", passageContainer).html("Refining results from last search: " + step.search.refinedSearch.join("=>"));
                
                //blank the results
                $("fieldset:visible .resultEstimates", passageContainer).html("");
                
                //trigger the reset button
                $("fieldset:visible .resetSearch").trigger("click");
                
                $(".refinedSearch", passageContainer).show();
            });
            

            
            $(".showSearchCriteria").button({
                text: false,
                icons: {
                    primary: "ui-icon-circle-triangle-s"
                }
            }).click(function() {
                $(this).parent().find(".hideSearchCriteria").show();
                $(this).hide();
                $(this).closest(".searchToolbar").closest("fieldset").children().not(".searchToolbar").show();
                refreshLayout();
            }).hide();
            
            

            $(".hideSearchCriteria").button({
                text : false,
                icons : {
                    primary : "ui-icon-circle-triangle-n"
                }
            }).click(function() {
                $(this).parent().find(".showSearchCriteria").show();
                $(this).hide();
                $(this).closest(".searchToolbar").closest("fieldset").children().not(".searchToolbar").hide();
                refreshLayout();
            });
            
            $(".searchToolbarButtonSets").buttonset();
            
            
            $(step.util).hear("versions-initialisation-completed", function() {
                $.each($(".searchVersions"), function(i, item) {
                    $(item).versions({
                        multi : true
                    });
                });
            });
        },
        
        /** Marks up a element containing a STEP transliteration by doing the following things:
         * '*' makes a syllable uppercase - small caps
         * '.' followed by aeiou makes the vowel superscript
         * ' followed by e is superscript 
         */
        markUpTransliteration : function(translit) {
            var translitHtml = translit.html ? translit.html() : translit;
            if(!step.util.isBlank(translitHtml)) {
                translitHtml = translitHtml.replace(/'e/g, "<span class='superTranslit'>e</span>");
                translitHtml = translitHtml.replace(/\.([aeiou])/g, "<span class='superTranslit'>$1</span>");
                translitHtml = translitHtml.replace(/([^*-]*)\*([^*-]*)/g, "<span class='stressTranslit'>$1$2</span>")

                //look for any stars in the word and highlight before and after
                
                if(translit.html) {
                    translit.html(translitHtml);
                }
            }
            return translitHtml;
        },
        
        highlightPhrase : function(nonJqElement, cssClasses, phrase) {
            var regexPattern = phrase.replace(/ /g,' +').replace(/"/g, '["\u201d]'); 
            var regex = new RegExp(regexPattern, "ig");
//            try {
                doHighlight(nonJqElement, cssClasses, regex);
//            } catch(e) {
                //not sure what to do with this... TODO: need to investigate
//                console.log(e);
//            }
        }
    },
};

var delay = (function(){
    var timer = 0;
    var timers = {};
    
    return function(callback, ms, timerName){
        if(timerName) {
            var tn = timers[timerName];
            if(tn == undefined) {
                timers[timerName] = tn = 0;
            }
            clearTimeout(tn);
            timers[timerName] = setTimeout(callback, ms);
        } else {
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        }        
    };
  })();

/**
 * array comparison
 */
function compare(s, t) {
	if (s == null || t == null) {
		return t == s;
	}

	if (s.length != t.length) {
		return false;
	}
	var a = s.sort(), b = t.sort();
	for ( var i = 0; t[i]; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
};

function isEmpty(s) {
	return !s || s.length == 0;
}

/**
 * adds a button next to a specified element
 * 
 * @param textbox
 *            the box to which to add the dropdown button
 * @param icon
 *            the icon to stylise the button
 */
function addButtonToAutoComplete(textbox, icon) {
	$("<button>&nbsp;</button>").attr("tabIndex", -1).attr("title",
			"Show all Bible versions").insertAfter(textbox).button({
		icons : {
			primary : icon
		},
		text : false
	}).removeClass("ui-corner-all").addClass(
			"ui-corner-right ui-button-icon no-left-border").click(function() {
		// close if already visible
		if (textbox.autocomplete("widget").is(":visible")) {
			textbox.autocomplete("close");
			return;
		}

		// pass empty string as value to search for, displaying all results
		textbox.autocomplete("search", "");
		textbox.focus();
	});
};

function extractLast(term) {
	return split(term).pop();
};

function split( val ) {
    return val.split( /,\s*/ );
}

function isAlpha(val) {
	var regEx = /^[a-zA-Z]+$/; 
	return val.match(regEx);  
};

/**
 * looks for the next space in the name provided and returns the shortest name
 * available
 * 
 * @param longName
 *            the long name to be shortened
 * @param minLength
 *            the min length from which to start
 */
function shortenName(longName, minLength) {
	var ii = longName.indexOf(' ', minLength);
	if (ii > 0) {
		return longName.substring(0, ii) + "...";
	}

	// unable to shorten
	return longName;
};

var outstandingRequests = 0;
function refreshWaitStatus() {
    var coords = $("#topLogo").position();
    $("#waiting").css('top', coords.top + 300);
    $("#waiting").css('left', coords.left + $("#topLogo").width() / 2 - $("#waiting").width() / 2);
    $("#waiting").css("display", outstandingRequests > 0 ? "block" : "none");
};

// some jquery extensions
(function($) {
	$.extend({
		/**
		 * an extension to jquery to do Ajax calls safely, with error
		 * handling...
		 * 
		 * @param the
		 *            url
		 * @param the
		 *            userFunction to call on success of the query
		 * @deprecated
		 */
		getSafe : function(url, args, userFunction, passageId, level) {
		    
		    //args is optional, so we test whether it is a function
		    if($.isFunction(args)) {
		        userFunction = args;
		    } else {
		        if(args == undefined) {
		            args = [];
		        } else {
                    for(var i = 0; i < args.length; i++) {
                        url += args[i];
                        
                        if(i < args.length -1) {
                            url += "/";
                        }
                    }
		        }
		    }
		    
		    outstandingRequests++;
            refreshWaitStatus();
            $.get(url, function(data) {
			    outstandingRequests--;
			    refreshWaitStatus();
			    
//			    console.log("Received url ", url, " ", data);
				if (data && data.errorMessage) {
					// handle an error message here
//					$.shout("caught-error-message", data);
					if (data.operation) {
						// so we now have an operation to perform before we
						// continue with the user
						// function if at all... the userFunction if what should
						// be called if we have
						// succeeded, but here we have no data, so we need to
						// call ourselve recursively
						$.shout(data.operation.replace(/_/g, "-")
										.toLowerCase(), {
									message : data.errorMessage,
									callback : function() {
										$.getSafe(url, userFunction);
									}
						});
					} else {
					    if(passageId != undefined) {
					        step.util.raiseInfo(passageId, data.errorMessage, level, url.startsWith(BIBLE_GET_BIBLE_TEXT));					        
					    } else {
		                    step.util.raiseError(data.errorMessage);
					    }
					}
				} else {
				    if(userFunction) {
				        userFunction(data);
				    }
				}
			});
		},
		
		/**
		 * @param getCall.url, getCall.args, getCall.userFunction, getCall.passageId, getCall.level
		 *  
		 * 
		 */
		getPassageSafe : function(call) {
		    return this.getSafe(call.url, call.args, call.callback, call.passageId, call.level);
		},
		
        getUrlVars: function(){
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                if(hash[1]) {
                    vars[hash[0]] = hash[1].split('#')[0];
                }
                
            }
            return vars;
        },
            
        getUrlVar: function(name){
          return $.getUrlVars()[name];
        }
	});

	$.fn.disableSelection = function() {
		return $(this).attr('unselectable', 'on').css('-moz-user-select',
				'none').each(function() {
			this.onselectstart = function() {
				return false;
			};
		});
	};
})(jQuery);



/**
 * a short version of endsWith
 */
String.prototype.endsWith = function(pattern) {
	var d = this.length - pattern.length;
	return d >= 0 && this.lastIndexOf(pattern) === d;
};

function getWordAtPoint(elem, x, y) {
	if (elem.nodeType == elem.TEXT_NODE) {
		var range = elem.ownerDocument.createRange();
		range.selectNodeContents(elem);
		var currentPos = 0;
		var endPos = range.endOffset;
		while (currentPos + 1 < endPos) {
			range.setStart(elem, currentPos);
			range.setEnd(elem, currentPos + 1);
			if (range.getBoundingClientRect().left <= x
					&& range.getBoundingClientRect().right >= x
					&& range.getBoundingClientRect().top <= y
					&& range.getBoundingClientRect().bottom >= y) {

					return expandSelection(range);
			}
			currentPos += 1;
		}
	} else {
		for ( var i = 0; i < elem.childNodes.length; i++) {
			var range = elem.childNodes[i].ownerDocument.createRange();
			range.selectNodeContents(elem.childNodes[i]);
			if (range.getBoundingClientRect().left <= x
					&& range.getBoundingClientRect().right >= x
					&& range.getBoundingClientRect().top <= y
					&& range.getBoundingClientRect().bottom >= y) {
				range.detach();
				
				var selected = getWordAtPoint(elem.childNodes[i], x, y);
				if(selected) {
					return selected;
				}
			} else {
				range.detach();
			}
		}
	}
	return (null);
};


function expandSelection(range) {
	if(range.expand) {
		//chrome comes in here
		range.expand("word");
		var ret = range.toString();
		range.detach();
		return (ret);
	} else if (window.getSelection && window.getSelection().modify) {
		//firefox comes here
		var sel = window.getSelection();
		sel.modify("move", "backward", "word");
		sel.modify("extend", "forward", "word");

		//get text and unselect
		var text = sel.toString();
		sel.removeAllRanges();
		
		return text;
	} else if (document.selection && document.selection.type == "Text") {
		//IE ends up here
		
		var range = document.selection.createRange();

		//move to the end of the selection
		range.moveEnd("word", 1);
		range.moveStart("word", -1);
		
		var text = range.text;
		
		if(range.detach) {
			range.detach();
		}
		return text;
	} 
};

function goToPassageArrow(isLeft, ref, classes, goToChapter) {
    if(goToChapter != true) {
        goToChapter = false;
    }
    
    if(isLeft) {
		var text = "<a class='ui-icon ui-icon-arrowthick-1-w passage-arrow ";
		
		if(classes) {
			text += classes;
		}
		return text + "' href='#' onclick='passageArrowTrigger(0, \""+ ref + "\", " + goToChapter +");'>&nbsp;</a>";
	} else {
		var text = "<a class='ui-icon ui-icon-arrowthick-1-e passage-arrow ";
		if(classes) {
			text += classes;
		}
		return text + "' href='#' onclick='passageArrowTrigger(1, \""+ ref + "\", " + goToChapter +");'>&nbsp;</a>";
	}
};


function passageArrowTrigger(passageId, ref, goToChapter) {
    if(passageId == 1) {
        step.state.view.ensureTwoColumnView();
    }
    
    //so long as we are "goToChapter" and have only one chapter (i.e. just one instance of ':'), then we go to the chapter
    var indexOfColon = ref.indexOf(':');
    var multiColons = ref.indexOf(':', indexOfColon + 1) != -1;
    
    if(goToChapter && !multiColons) {
        //true value, so get the next reference
        var version = step.state.passage.version(passageId);
        

        step.passage.callbacks[passageId].push(function() {
            $.getSafe(BIBLE_GET_KEY_INFO, [ref, version], function(newRef) {
                var passageContent = step.util.getPassageContent(passageId);

                var scrolled = false;
                var osisRefs = newRef.osisKeyId.split(" ");
                $("*", passageContent).removeClass("ui-state-highlight");
                for(var i = 0; i < osisRefs.length; i++) {
                    var link = $("a[name = '" + osisRefs[i] + "']", passageContent);
                    
                    if(link) {
                        if(!scrolled) {
                            var linkOffset =  link.offset();
                            var scroll = linkOffset == undefined ? 0 : linkOffset.top - passageContent.height();
                            
                            var originalScrollTop = passageContent.scrollTop();
                            passageContent.animate({
                                scrollTop : originalScrollTop + scroll
                            }, 500);
                            scrolled = true;
                        }                        
                        //window.location.hash = newRef.osisKeyId;
                        $(link).closest(".verse").addClass("ui-state-highlight");
                        
                        //also do so if we are looking at an interlinear-ed version
                        $(link).closest(".interlinear").find("*").addClass("ui-state-highlight");
                    }
                }
            });            
        });

        
        $.getSafe(BIBLE_EXPAND_TO_CHAPTER, [version, ref], function(newChapterRef) {
            step.state.passage.reference(passageId, newChapterRef.name);
        });
        
    } else {
        step.state.passage.reference(passageId, ref);
    }
};


function addNotApplicableString(val) {
	if(val == null || val == "") {
		return "<span class='notApplicable'>N/A</span>";
	}
	return val;
}
