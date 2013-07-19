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
    septuagintVersions : ["LXX", "ABPGRK", "ABP"],
        
    // Generate four random hex digits.
    S4 : function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    guid : function() {
        return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
    },

    destroyCollection : function(collection) {
        while(collection.length > 0) {
            collection.at(0).destroy();
        }
    },

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
        return $(".passageContainer").map(function () {
            return $(this).attr("passage-id");
        }).get();
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
	
	getOtherPassageId : function(passageId) {
	    if(parseInt(passageId) == 1) {
	        return 0;
	    } else if(step.state.view.getView() == 'SINGLE_COLUMN_VIEW') {
	        //passageId = 0, so need to work out the column layout
	        return 0;
	    }
	    return 1;
	},
	
	isBlank: function(s) {
	    if(s == null) {
	        return true;
	    }

        if(!_.isString(s)) {
            //we assume that all non-strings are not blank - since they presumably contain a value of some kind.
            return false;
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
        if(element.text || element.innerText) {
            var el = $(element);
            var children = el.contents();
            if(children.length != 0) {
                text = children.not("sup,a").text();
            } else {
                text = el.text()
            }
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
	
    getPointer: function (functionName, context) {
        if (functionName == null || functionName == "") {
            return undefined;
        }

        if (!context) {
            context = window;
        }

        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func];
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
	    var passageContainer = step.util.getPassageContainer(passageId);
	    var infoBar = $(".infoBar", passageContainer);
	    var icon = $(".innerInfoBar .ui-icon", infoBar).addClass("ui-icon");
	    
	    $(".closeInfoBar", infoBar).button({
	       icons : {
	           primary : "ui-icon-close"
	       },
	       text : false
	    });
	    
	    icon.removeClass();

	    if(level == 'error') {
            icon.addClass("ui-icon-alert");
	    } else {
	        icon.addClass("ui-icon-info");
	    }
	    
	    infoBar.toggle(true).data('numPassageChanges', eraseOnNextPassage ? 1 : 0).find(".infoLabel").html(message);
        refreshLayout();
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
                refreshLayout();
            } else {
                infoBar.data('numPassageChanges', 1);
            }
        }	    
	},
	
	/**
     * Creates bookmark
     * @param passageId the passage id containing the passage we want to bookmark
     */
    createBookmark : function(passageId) {
        var model = PassageModels.at(passageId);
        Backbone.Events.trigger("bookmark:new", {
            reference: model.get("reference"),
            version : model.get("version")
        });
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
        appleKey : false,

        doMenu : function(id) {
            ddsmoothmenu.init({
                mainmenuid: id,        //menu DIV id
                zIndexStart: 100,
                orientation: 'h',               //Horizontal or vertical menu: Set to "h" or "v"
                classname: 'ddsmoothmenu innerMenu', //class added to menu's outer DIV
                //customtheme: ["#1c5a80", "#18374a"],
                contentsource: "markup"
            });
        },

        doSocialButtons : function(element) {
            var sharingBar = element.find(".sharingBar");
            //remove twitter and google+
            sharingBar.find("div:last").remove();
            sharingBar.find("iframe:last").remove();
            sharingBar.find("[class*='twitter']").remove();

            var url = stepRouter.getShareableColumnUrl(element, true);

            //do google plus
            var gPlusOne = $('<div class="g-plusone" data-size="medium" data-annotation="none"></div>');
            gPlusOne.attr("data-href", url);
            sharingBar.append(gPlusOne);
            if (typeof(gapi) != 'undefined') {
                gapi.plusone.go(sharingBar.get(0));
            }

            //do twitter
            var twitter = $('<a href="https://twitter.com/share" class="twitter-share-button" data-via="Tyndale_House" data-count="none">Tweet</a>');
            twitter.attr("data-url", url);
            sharingBar.append(twitter);
            if (typeof(twttr) != 'undefined') {
                twttr.widgets.load();
            }
        },

        /**
         * Sets the HTML onto the passageContent holder which contains the passage
         * @param passageHtml the JQuery HTML content
         * @private
         */

        emptyOffDomAndPopulate: function (passageContent, passageHtml) {
            var parent = passageContent.parent();
            passageContent.detach();

            //we garbage collect in the background after the passage has loaded
            var children = passageContent.children().detach();
            setTimeout(function () {
                children.remove();
            }, 5000);

            passageContent.append(passageHtml);
            parent.append(passageContent);
        },

        /**
         * Takes in the selector for identifying each group element. Then selects children(), and iterates
         * through each child apply the right CSS class from the array.
         *
         * @param passageContent the html jquery object
         * @param groupSelector the group selector, a w, or a row, each containing a number of children
         * @param cssClasses the set of css classes to use
         * @param exclude the exclude function if we want to skip over some items
         * @param offset the offset, which gets added to be able to ignore say the first item always.
         * @private
         */
        _applyCssClassesRepeatByGroup: function (passageContent, groupSelector, cssClasses, exclude, offset) {
            if (offset == undefined) {
                offset = 0;
            }

            var words = $(groupSelector, passageContent);
            for (var j = 0; j < words.length; j++) {
                var jqItem = words.eq(j);
                var children = jqItem.children();
                for (var i = offset; i < children.length; i++) {
                    var child = children.eq(i);
                    if (exclude == undefined || !exclude(child)) {
                        child.addClass(cssClasses[i - offset]);
                    }
                }
            }
        },

        /**
         * Given an array of languages, returns an array of fonts
         * @param languages the array of languages
         * @private
         */
        _getFontClasses: function (languages) {
            var fonts = [];
            for (var i = 0; i < languages.length; i++) {
                fonts.push(this._getFontClassForLanguage(languages[i]));
            }
            return fonts;
        },

        /**
         * Eventually, we probably want to do something clever around dynamically loading fonts.
         * We also cope for strong numbers, taking the first character.
         * @param language the language code as returned by JSword
         * @returns {string} the class of the font, or undefined if none is required
         * @private
         */
        _getFontClassForLanguage: function (language) {
            //currently hard-coded
            if (language == "he") {
                return "hbFont";
            } else if (language == "grc") {
                return "unicodeFont";
            } else if (language == "cop"){
                return "copticFont";
            }
        },


        getFeaturesLabel : function(item) {
            var features = "";
            

            // add to Strongs if applicable, and therefore interlinear
            if(item.hasRedLetter) {
                features += " " + '<span class="versionFeature" title="' + __s.jesus_words_in_red_available + '">' + __s.jesus_words_in_red_available_initial + '</span>';
            }
            
            // add morphology
            if (item.hasMorphology) {
                features += " " + "<span class='versionFeature' title='" + __s.grammar_available + "'>" + __s.grammar_available_initial + "</span>";
            }
            
            if (item.hasStrongs) {
                features += " " + "<span class='versionFeature' title='" + __s.vocabulary_available + "'>" + __s.vocabulary_available_initial + "</span>";
                
                if($.inArray(item.initials, step.util.septuagintVersions) != -1) {
                    features += " " + "<span class='versionFeature' title='" + __s.septuagint_interlinear_available + "'>" + __s.septuagint_interlinear_available_initial + "</span>";
                } else {
                    features += " " + "<span class='versionFeature' title='" + __s.interlinear_available + "'>" + __s.interlinear_available_initial + "</span>";
                }
            }


            return features;
        },
        
        getVisibleVersions : function(passageId) {
            return $("fieldset:visible", step.util.getPassageContainer(passageId)).find(".searchVersions, .passageVersion, .extraVersions");
        },
        
        addStrongHandlers : function(passageId, passageContent) {
            var that = this;
            var allStrongElements = $("[strong]", passageContent);
            
            allStrongElements.click(function() { 
                showDef(this);
            }).hover(function() { 
                step.passage.higlightStrongs({
                    passageId : undefined,
                    strong: $(this).attr('strong'),
                    morph : $(this).attr('morph'),
                    classes : "primaryLightBg"
                });

                    var hoverContext = this;
                    delay(function () {
                        QuickLexiconModels.at(0).save({
                            strongNumber: $(hoverContext).attr('strong'),
                            morph: $(hoverContext).attr('morph'),
                            element: hoverContext
                        });

                    }, 500, 'show-quick-lexicon');
            }, function() { 
                step.passage.removeStrongsHighlights(undefined, "primaryLightBg");
                    delay(undefined, 0, 'show-quick-lexicon');
            });
        },
        autocompleteSearch: function (selector, data, readonly, preChangeHandler) {
            var jqSelector = $(selector);
            var changed = false;
            var previousValue = jqSelector.val();
            if (previousValue == "") {
                var defaultValue = jqSelector.attr("default");
            
                var value = defaultValue != null ? defaultValue : (data[0].label ? data[0].value : data[0]);
                jqSelector.val(value);
    
                changed = previousValue != value;
                                }
                                
            jqSelector.autocomplete({
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

            return changed;
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
        
            
        /** Marks up a element containing a STEP transliteration by doing the following things:
         * '*' makes a syllable uppercase - small caps
         * '.' followed by aeiou makes the vowel superscript
         * ' followed by e is superscript 
         */
        markUpTransliteration : function(translit) {
            var translitHtml = translit.html ? translit.html() : translit;
            if(!step.util.isBlank(translitHtml)) {
                translitHtml = translitHtml.replace(/'e/g, "<span class='superTranslit'>e</span>");
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
                doHighlight(nonJqElement, cssClasses, regex);
        }
    }
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

            if (callback) {
            timers[timerName] = setTimeout(callback, ms);
            }
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
			__s.show_all_bible_versions).insertAfter(textbox).button({
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

function goToPassageArrowButton(isLeft, version, ref, classes, goToChapter, handler) {
    return passageArrowHover($("<a>&nbsp;</a>").button({
        icons : {
            primary : isLeft ? "ui-icon-arrowthick-1-e" : "ui-icon-arrowthick-1-w"
        }
    }).click(function() {
        $($(".column")[isLeft ? 0 : 1]).removeClass("primaryLightBg");
        if(handler) {
            handler();
        }
        passageArrowTrigger(isLeft ? 0 : 1, version, ref, goToChapter);
    }).addClass(classes), ref, isLeft);
};

function passageArrowHover(element, ref, isLeft) {
    return element.hover(
        function() {
            $($(".column")[isLeft ? 0 : 1]).addClass("primaryLightBg") ;
        }, function() { 
            $($(".column")[isLeft ? 0 : 1]).removeClass("primaryLightBg");
        });
};

/**
 *
 * @param passageId the particular column we're interested in
 * @param sourceVersion the source version that we will be displaying
 * @param ref the reference
 * @param goToChapter the chapter
 * @param followSync the sync flag, defaults to false. If true & sync is on, we update both passages.
 */
function passageArrowTrigger(passageId, sourceVersion, ref, goToChapter, followSync) {
    if(passageId == 1) {
        step.state.view.ensureTwoColumnView();
    }

    var targetModel = PassageModels.at(passageId);
    var synced = targetModel.get("synced");
    if(synced != -1) {
        if(followSync) {
            passageId = synced;
            targetModel = PassageModels.at(synced);
        } else {
            step.menu.options.tickSyncMode("NO_SYNC");
        }
    }

    //so long as we are "goToChapter" and have only one chapter (i.e. just one instance of ':'), then we go to the chapter
    var indexOfColon = ref.indexOf(':');
    var multiColons = ref.indexOf(':', indexOfColon + 1) != -1;

    var version = targetModel.get("version");
    if(goToChapter && !multiColons) {
        //true value, so get the next reference

        Backbone.Events.once("passage:rendered:" + passageId, function () {
            $.getSafe(BIBLE_GET_KEY_INFO, [ref, sourceVersion, version], function(newRef) {
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

        $.getSafe(BIBLE_EXPAND_TO_CHAPTER, [sourceVersion, version, ref], function(newChapterRef) {
            if(step.util.isBlank(newChapterRef.name)) {
                step.util.raiseInfo(passageId, sprintf(__s.error_bible_doesn_t_have_passage, ref), 'error', true);
                Backbone.Events.trigger("passage:rendered:" + passageId);
                return;
            }

            //reset the URL to force a passage lookup
            PassageModels.at(passageId).save({ reference: newChapterRef.name });
        });
    } else {
        $.getSafe(BIBLE_CONVERT_VERSIFICATION, [ref, sourceVersion, version], function(newChapterRef) {
            if(step.util.isBlank(newChapterRef.name)) {
                step.util.raiseInfo(passageId, sprintf(__s.error_bible_doesn_t_have_passage, ref), 'error', true);
                Backbone.Events.trigger("passage:rendered:" + passageId);
                return;
            }

            PassageModels.at(passageId).save({ reference: newChapterRef.name });
        });
    }
};


function addNotApplicableString(val) {
	if(val == null || val == "") {
		return "<span class='notApplicable'>" + __s.not_applicable + "</span>";
	}
	return val;
}

function debugElement(selector) {
    var cssStyles = getComputedStyle($(selector).get(0));
//    console.log("##############################");
//    console.log("##############################")
//    console.log($(this).attr('class'), $(this).attr('name'), $(this).attr('menu-name'));
//    for(var x in cssStyles) {
//        console.log(x + " " + cssStyles[x]);
//    }
//    console.log("##############################");
//
    $.each($(selector).find("*"), function() {
        var cssStyles = getComputedStyle($(this).get(0));
        console.log("##############################");
        console.log("##############################")
        console.log($(this).attr('class'), $(this).attr('name'), $(this).attr('menu-name'));
        for(var x in cssStyles) {
            console.log(x + " " + cssStyles[x]);
        }
        console.log("##############################");
    });
}