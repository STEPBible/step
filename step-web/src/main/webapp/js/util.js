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
	   
    raiseError: function (error) {
        var message = error.message ? error.message : error;
        
        $("#error").text(message);
        $("#error").slideDown(250);
    },
    
	raiseErrorIfBlank: function(s, message) {
	    if(this.isBlank(s)) {
	        this.raiseError(message);
	        return false;
	    }
	    return true;
	},

    ui : {
        autocompleteSearch : function(selector, data, readonly, preChangeHandler) {
            $(selector).autocomplete({
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
        
        searchButton : function(selector, searchType, callback) {
            $(selector).click(function() {
                step.state.activeSearch(step.passage.getPassageId(this), searchType, true);
                
                if(callback) {
                    callback();
                }
            });
        },
        
        trackQuerySyntax : function(selector, namespace) {
            $(selector + " input").keyup(function() {
                $(this).change();
                
                //re-evaluate query
                var passageId = step.passage.getPassageId(this);
                step.search.ui[namespace].evaluateQuerySyntax(passageId);
            });  
        },
        
        resetIfEmpty : function(passageId, force, evalFunction, defaultValue) {
            if(force == true || force == undefined || evalFunction(passageId) == null || evalFunction(passageId) == "") {
                evalFunction(passageId, defaultValue);
            }
        }
    }
};


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
		 */
		getSafe : function(url, args, userFunction) {
		    
		    //args is optional, so we test whether it is a function
		    if($.isFunction(args)) {
		        userFunction = args;
		    } else {
                for(var i = 0; i < args.length; i++) {
                    url += args[i];
                    
                    if(i < args.length -1) {
                        url += "/";
                    }
                }
		    }
		    
		    outstandingRequests++;
            refreshWaitStatus();
            $.get(url, function(data) {
			    outstandingRequests--;
			    refreshWaitStatus();
			    
			    console.log("Received url ", url, " ", data);
				if (data && data.errorMessage) {
					// handle an error message here
					$.shout("caught-error-message", data);
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
					    step.util.raiseError(data.errorMessage);
					}
				} else {
					userFunction(data);
				}
			});
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

function goToPassageArrow(isLeft, ref, classes) {
	if(isLeft) {
		var text = "<a class='ui-icon ui-icon-arrowthick-1-w passage-arrow ";
		
		if(classes) {
			text += classes;
		}
		return text + "' href='#' onclick='step.state.passage.reference(0, \""+ ref + "\");'>&nbsp;</a>";
	} else {
		var text = "<a class='ui-icon ui-icon-arrowthick-1-e passage-arrow ";
		if(classes) {
			text += classes;
		}
		return text + "' href='#' onclick='step.state.passage.reference(1, \""+ ref + "\");'>&nbsp;</a>";
	}
};


function addNotApplicableString(val) {
	if(val == null || val == "") {
		return "<span class='notApplicable'>N/A</span>";
	}
	return val;
}
