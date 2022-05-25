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
(function ($) {
    //some extensions (perhaps should go in another file)
    String.prototype.startsWith = function (nonEscapedString) {
        var str = nonEscapedString.replace('+', '\\+');
        return (this.match("^" + step.util.escapeRegExp(str)) == nonEscapedString);
    };
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
        getSafe: function (url, args, userFunction, passageId, level, errorHandler) {

            //args is optional, so we test whether it is a function
            if ($.isFunction(args)) {
                userFunction = args;
            } else {
                if (args == undefined) {
                    args = [];
                } else {
                    for (var i = 0; i < args.length; i++) {
                        if (args[i] != undefined) {
                            url += args[i];
                        }

                        if (i < args.length - 1) {
                            url += "/";
                        }
                    }
                }
            }

            step.util.outstandingRequests++;
            step.util.refreshWaitStatus();

            var lang = step.state.language();
            var langParam = step.util.isBlank(lang) ? "" : "?lang=" + lang;

            return $.get(url + langParam, function (data, textStatus, jqXHR) {
                if (step.state.responseLanguage == undefined) {
                    //set the language
                    var lang = jqXHR.getResponseHeader("step-language");
                    if (!step.util.isBlank(lang)) {
                        step.state.responseLanguage = lang;
                    }
                }

                step.util.outstandingRequests--;
                step.util.refreshWaitStatus();

//			    console.log("Received url ", url, " ", data);
                if (data && data.errorMessage) {
                    if (errorHandler) {
                        errorHandler();
                    }
                    // handle an error message here
                    if (data.operation) {
                        // so we now have an operation to perform before we
                        // continue with the user
                        // function if at all... the userFunction if what should
                        // be called if we have
                        // succeeded, but here we have no data, so we need to
                        // call ourselve recursively
                        $.shout(data.operation.replace(/_/g, "-")
                            .toLowerCase(), {
                            message: data.errorMessage,
                            callback: function () {
                                $.getSafe(url, userFunction);
                            }
                        });
                    } else {
                        if (passageId != undefined) {
                            step.util.raiseInfo(data.errorMessage, level, passageId);
                        } else {
                            step.util.raiseError(data.errorMessage);
                        }
                    }
                } else {
                    if (userFunction) {
                        userFunction(data);
                    }
                }
            }).error(function() {
                changeBaseURL();
            });
        },

        /**
         * @param getCall.url, getCall.args, getCall.userFunction, getCall.passageId, getCall.level
         *
         *
         */
        getPassageSafe: function (call) {
            return this.getSafe(call.url, call.args, call.callback, call.passageId, call.level);
        },
        getUrlVars: function () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                if (hash[1]) {
                    vars[hash[0]] = hash.slice(1).join("=").split('#')[0];
                }
            }
            return vars;
        },

        getUrlVar: function (name) {
            return $.getUrlVars()[name];
        },
        isChrome: function () {
            return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
        }
    });
})(jQuery);

window.step = window.step || {};
step.util = {
    outstandingRequests: 0,
    timers: {},
    unaugmentStrong : function(strong) {
        var result = (strong || "");
        if (!result.search(/\![a-zA-Z]$/)) result.replace(/[a-zA-Z]$/, "");
        return result;
    },
    refreshWaitStatus: function () {
        var passageContainer = step.util.getPassageContainer(step.util.activePassageId());
        if (this.outstandingRequests > 0) {
            passageContainer.addClass("waiting");
        } else {
            $(".passageContainer").removeClass("waiting");
        }
    },
    escapeRegExp: function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    guid: function () {
        return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4());
    },
    squashErrors: function (model) {
        $("#errorContainer").remove();
        if (model) {
            model.trigger("squashErrors");
        }
    },
    getErrorPopup: function (message, level) {
        var errorPopup = $(_.template('<div class="alert alert-error fade in alert-<%= level %>" id="errorContainer">' +
			step.util.modalCloseBtn(null, "") +
            '<%= message %></div>')({ message: message, level: level}));
        return errorPopup;
    },
    raiseOneTimeOnly: function (key, level) {
        var k = step.settings.get(key);
        if (!k) {
            var obj = {};
            obj[key] = true;
            step.settings.save(obj);
            this.raiseInfo(__s[key], level);
        }
    },
    raiseInfo: function (message, level, passageId, progress, silent) {
        //no parsing for info and warning
        if (level == 'error') {
            level = 'danger';
        } else if (level == undefined) {
            level = 'info';
        }

        if (passageId == null) {
            passageId = step.passages.at(0).get("passageId");
        }
        step.passages.findWhere({ passageId: passageId }).trigger("raiseMessage", { message: message, level: level, silent: silent });
    },

    raiseError: function (message) {
        this.raiseInfo(message, 'danger');
    },
    isBlank: function (s) {
        if (s == null) {
            return true;
        }

        if (!_.isString(s)) {
            //we assume that all non-strings are not blank - since they presumably contain a value of some kind.
            return false;
        }

        return s.match(/^\s*$/g) != null;
    },
    activePassageId: function (val) {
        var force = false;
        var activePassageEl = $(".passageContainer.active");
        var currentActivePassageId;
        if (activePassageEl.length == 0) {
            //default to the first passage that is visible on the screen
            activePassageEl = $(".passageContainer:first");
            //force the setter to trigger
            currentActivePassageId = val = parseInt(activePassageEl.attr("passage-id"));
            force = true;
        } else {
            currentActivePassageId = parseInt(activePassageEl.attr("passage-id"));
        }

        if (typeof val == 'string') {
            val = parseInt(val);
        }

        //are we going to set a different passage
        if ((val !== null && val !== undefined && val != currentActivePassageId) || force) {
            var columns = $(".passageContainer");
            columns.filter(".active").removeClass("active");

            //do we need to create a new passage model? only if no others exists with the same passageId.
            var existingModel = step.passages.findWhere({ passageId: val });
            if (existingModel == null) {
                //create brand new model and view to manage it.
                var newPassageModel = step.passages.findWhere({ passageId: currentActivePassageId }).clone();

                //override id to make sure it looks like it's new and gets persisted in local storage
                newPassageModel.id = null;

                step.passages.add(newPassageModel);
                newPassageModel.save({ passageId: val, createSilently: true, linked: null }, { silent: true });
            } else {
                //swapping to an existing active passage id already, so sync straight away
                existingModel.trigger("sync-update", existingModel);

                //overwrite the URL with the correct URL fragment
                step.router.overwriteUrl(existingModel.get("urlFragment"));
            }


            //make the new panel active
            step.util.getPassageContainer(val).addClass("active");
            return val;
        }

        return currentActivePassageId;
    },
    activePassage: function () {
        return step.passages.findWhere({ passageId: this.activePassageId() });
    },
    /*
     * @description        Uploads a file via multipart/form-data, via a Canvas elt
     * @param url  String: Url to post the data
     * @param name String: name of form element
     * @param fn   String: Name of file
     * @param canvas HTMLCanvasElement: The canvas element.
     * @param type String: Content-Type, eg image/png
     ***/
    postCanvasToURL: function (url, name, fn, canvas, type, formData, callback) {
        var data = canvas.toDataURL(type);
        data = data.replace('data:' + type + ';base64,', '');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        var boundary = '--step-form-data123456';
        var startTokenBoundary = '--' + boundary;
        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
        var dataToBeSent = [];
        for (var i = 0; i < formData.length; i++) {
            dataToBeSent.push(startTokenBoundary);
            dataToBeSent.push('Content-Disposition: form-data; name="' + formData[i].key + '"');
            dataToBeSent.push('');
            dataToBeSent.push(formData[i].value);
        }

        dataToBeSent.push(startTokenBoundary);
        dataToBeSent.push('Content-Disposition: form-data; name="' + name + '"; filename="' + fn + '"');
        dataToBeSent.push('');
        dataToBeSent.push(atob(data));
        dataToBeSent.push(startTokenBoundary + '--');
        dataToBeSent.push('');

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 && xhr.response == "") {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        };
        xhr.sendAsBinary(dataToBeSent.join('\r\n'));
    },
    refreshColumnSize: function (columns) {
        if (!columns) {
            columns = $(".column");
        }

        //change the width all columns
        var classesToRemove = "col-sm-12 col-sm-6 col-sm-4 col-sm-3 col-sm-5columns col-sm-2 col-sm-7columns col-sm-8columns col-sm-9columns col-sm-10columns col-sm-11columns col-sm-1";
        columns.removeClass(classesToRemove);
        var columnClass;
        switch (columns.size()) {
            case 1:
                columnClass = "col-sm-12";
                break;
            case 2:
                columnClass = "col-sm-6";
                break;
            case 3:
                columnClass = "col-sm-4";
                break;
            case 4:
                columnClass = "col-sm-3";
                break;
            case 5:
                columnClass = "col-sm-5columns";
                break;
            case 6:
                columnClass = "col-sm-2";
                break;
            case 7:
                columnClass = "col-sm-7columns";
                break;
            case 8:
                columnClass = "col-sm-8columns";
                break;
            case 9:
                columnClass = "col-sm-9columns";
                break;
            case 10:
                columnClass = "col-sm-10columns";
                break;
            case 11:
                columnClass = "col-sm-11columns";
                break;
            case 12:
                columnClass = "col-sm-1";
                break;
            default:
                columnClass = "col-sm-1";
                if (!step.settings.get("tooManyPanelsWarning")) {
                    step.util.raiseInfo(__s.too_many_panels_notice);
                    step.settings.save({ tooManyPanelsWarning: true }, { silent: true });
                }
                break;
        }
        columns.addClass(columnClass);
        var heightToSet = $('.passageContainer.active').height();
        if (typeof heightToSet === "number") {
            heightToSet -= 60;
            heightToSet += "px";
        }
        else heightToSet = "85vh";
		$("#lexicon").height(heightToSet);
		$("#analysis").height(heightToSet);
		$("#history").height(heightToSet);
		$("#help").height(heightToSet);
    },
    findSearchTermsInQuotesAndRemovePrefix: function(syntaxWords) {
        var indxNeedConcatenate = -1;
        var quoteChar = "";
        for (var j = 0; j < syntaxWords.length; j++) {
            if (indxNeedConcatenate == -1) {
				if (syntaxWords[j].substr(0, 2) === "t=") syntaxWords[j] = syntaxWords[j].substr(2);
                if ((syntaxWords[j].substr(0, 1) === '"') ||
                    (syntaxWords[j].substr(0, 1) === "'")) {
                    indxNeedConcatenate = j;
                    quoteChar = syntaxWords[j].substr(0, 1);
                }
            }
            else {
                if (syntaxWords[j].substr(-1) == quoteChar) {
                    for (var k = indxNeedConcatenate + 1; k <= j; k++) {
                        syntaxWords[indxNeedConcatenate] += " " + syntaxWords[k];
                        syntaxWords[k] = "";
                    }
                    indxNeedConcatenate = -1;
                    quoteChar = "";
                }
            }
        }
    },
    /**
     * Renumbers the models from 0, so that we can track where things are.
     * @private
     */
    reNumberModels: function () {
        $(".passageContainer[passage-id]").each(function () {
            var passageModel = step.passages.findWhere({ passageId: parseInt($(this).attr('passage-id'))});

            if (passageModel) {
                passageModel.save({ position: $(this).parent().index() }, {silent: true });
            }
        });
    },

    /**
     * show or hide tutorial, when there is more than 1 column
     */
    showOrHideTutorial: function (hide) {
        var allRealColumns = $(".column").not(".examplesColumn");
        var exampleContainer = $(".examplesContainer");
        if ((exampleContainer.parent().hasClass("column")) &&
			(allRealColumns.length > 0)) exampleContainer.parent().remove();
		else if (hide) $(".examplescolumn").remove();
        this.refreshColumnSize();
    },
    /**
     * Creates a linked column to the current column
     * @param el
     */
    createNewLinkedColumn: function (passageId) {
		if ($(window).width() < 768) {
			var msg = "Your screen is not wide enough to open another panel.";
			if ((step.touchDevice) && ($(window).height() > 768))
				msg += " Rotate your screen to horizontal mode if available.";
			alert(msg);
		}
        this.activePassageId(passageId);
        this.createNewColumn(true);
    },
    createNewLinkedColumnWithScroll: function (passageId, verseRef, stripCommentaries, postProcessModelCallback, ev) {
        this.createNewLinkedColumn(passageId);

        //call the post processor
        var activePassage = step.util.activePassage();
        if (postProcessModelCallback) {
            postProcessModelCallback(activePassage);
        }

        //next target can be set on the active model
        activePassage.save({ targetLocation: verseRef }, { silent: true });

        var chapterRef = verseRef.substr(0, verseRef.lastIndexOf("."));
        if (step.util.isBlank(chapterRef)) {
            chapterRef = verseRef;
        }
		if (chapterRef.substr(chapterRef.indexOf(".")+1) === "1") { // if chapter number is 1
			var bookName = chapterRef.substr(0, chapterRef.indexOf("."));
			var numOfChaptersInBook = step.passageSelect.getNumOfChapters(bookName);
			if (numOfChaptersInBook == 1) chapterRef = bookName;
		}
        step.router.navigatePreserveVersions("reference=" + chapterRef, stripCommentaries);

        //we prevent the event from bubbling up to set the passage id, as we expect a new passage to take focus
        if (ev) ev.stopPropagation();
    },

    /**
     * @param linked true to indicate we want to link this column with the current active column
     * @private
     */
    createNewColumn: function (linked, model) {
        //if linked, then make sure we don't already have a linked column - if so, we'll simply use that.
        var activePassageModel = this.activePassage();
        if (linked) {
            if (activePassageModel.get("linked") !== null) {
                step.util.activePassageId(activePassageModel.get("linked"));
                return;
            }
        } else {
            //if the panel is not required to be linked, then unlink any panel that is currently linked
            var linkedModelId = activePassageModel.get("linked")
            if (linkedModelId) {
                step.util.unlink(linkedModelId);
            }
        }

        var columnHolder = $("#columnHolder");
        var columns = columnHolder.find(".column").not(".examplesColumn");
        var activeColumn = columns.has(".passageContainer.active");
        var newColumn = activeColumn.clone();

        var passageId;
        var newPassageId;
        if (!model) {
            //create new
            newPassageId = parseInt(step.passages.max(function (p) {
                return parseInt(p.get("passageId"))
            }).get("passageId")) + 1;
        } else {
            //use existing
            newPassageId = model.get("passageId");
        }

        newColumn
            .find(".passageContainer").attr("passage-id", newPassageId)
            .find(".passageContent").remove();
        newColumn.find(".argSelect").remove();
        newColumn.find(".select-reference").text(__s.short_title_for_ref + ":");
		newColumn.find('.select-reference').attr("onclick", "step.util.passageSelectionModal(" + newPassageId + ")");
		newColumn.find(".select-search").html('<i style="font-size:12px" class="find glyphicon glyphicon-search"></i>');
        newColumn.find(".resultsLabel").html("");
        newColumn.find(".infoIcon").attr("title", "").data("content", "").hide();
        newColumn.find(".popover").remove();

        var allColumns = columns.add(newColumn);
        this.refreshColumnSize(allColumns);
        newColumn.insertAfter(activeColumn);
        if (linked) {
            //add a link
            var link = $("<span class='glyphicon glyphicon-arrow-right linkPanel'></span>").attr("title", __s.panels_linked).click(function () {
                //unlink all passages
                step.util.unlink(newPassageId);
            });
            newColumn.find(".passageContainer").append(link);
            activePassageModel.save({ linked: newPassageId }, { silent: true });
        }
        this.showOrHideTutorial();
        step.util.activePassageId(newPassageId);

        //create the click handlers for the passage menu
        new PassageMenuView({
            model: step.util.activePassage()
        });

        Backbone.Events.trigger("columnsChanged", {});
        return newPassageId;
    },
    unlinkThis: function (newPassageId) {
        var model = step.passages.findWhere({ passageId: newPassageId });
        var linked = model.get("linked");
        model.save({ linked: null }, { silent: true });

        if (linked != null) {
            var linkContainer = step.passages.findWhere({ passageId: linked });
            if (linkContainer != null) {
                step.util.getPassageContainer(linkContainer.get("passageId")).find(".linkPanel").remove();
            }
        }
    },
    unlink: function (newPassageId) {
        var models = step.passages.where({ linked: newPassageId });
        var linkedPassageIds = [];
        for (var i = 0; i < models.length; i++) {
            linkedPassageIds.push(models[i].get("passageId"));
            models[i].save({ linked: null }, {silent: true });
        }
        step.util.getPassageContainer(newPassageId).find(".linkPanel").remove();
        return linkedPassageIds;
    },
    isSeptuagintVersion: function (item) {
        return $.inArray(item.initials || item, step.util.septuagintVersions) != -1;
    },
    trackAnalytics: function (eventType, eventName, eventValue, numValue) {
        if (window["ga"]) {
            ga('send', 'event', eventType, eventName, eventValue, numValue);
        }
    },
    trackAnalyticsTime: function (eventType, eventName, timeTaken) {
        if (window["ga"]) {
            ga('send', 'timing', eventType, eventName, timeTaken);
        }
    },
    getPassageContainer: function (passageIdOrElement) {
        if (!this._passageContainers) {
            this._passageContainers = {};
        }

        //check if we have a number
        if (isNaN(parseInt(passageIdOrElement))) {
            //assume jquery selector or element
            return $(passageIdOrElement).closest(".passageContainer");
        }

        //check if we're storing it
        var container = $(".passageContainer[passage-id = " + passageIdOrElement + "]");
        return container;
    },
    clearTimeout: function (timerName) {
        var tn = this.timers[timerName];
        if (tn == undefined) {
            this.timers[timerName] = tn = 0;
        }
        clearTimeout(tn);
    },
    delay: function (callback, ms, timerName) {
        var timer = 0;
        if (timerName) {
            this.clearTimeout(timerName);
            if (callback) {
                this.timers[timerName] = setTimeout(callback, ms);
            }
        } else {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        }
    },
    getMainLanguage: function (passageModel) {
        return (passageModel.get("languageCode") || ["en"])[0];
    },
    restoreFontSize: function (passageModel, element) {
		var fontArray = ["defaultfont", "hbFont", "unicodeFont", "arabicFont", "burmeseFont", "chineseFont", "copticFont", "farsiFont", "khmerFont", "syriacFont"];
        var passageId = passageModel.get("passageId");
		var passageModel = step.passages.findWhere({ passageId: passageId});
		var id = passageModel.attributes.id;
		var processedAlready = false;
		for (var j = 0; j < fontArray.length; j++) {
			var fontKey = "panel_" + id + "_font_" + fontArray[j];
			var fontSize = step[fontKey];
			if (fontSize && fontSize != 0) {
				processedAlready = true;
				if ((fontArray[j] === "defaultfont") || ($(element).hasClass(fontArray[j])))
					element.css("font-size", fontSize);
				var fontInElements = element.find("." + fontArray[j]);
				if (fontInElements.length > 0) 
					fontInElements.css("font-size", fontSize);
			}
		}
		if (!processedAlready) { // Have to verify that there is no specific font size for the panel in step.settings before processing the items below.
			for (var j = 0; j < fontArray.length; j++) {
				var fontSize = step.settings.get(fontArray[j]);
				if (fontSize && fontSize != 0) {
					if ((fontArray[j] === "defaultfont") || ($(element).hasClass(fontArray[j])))
						element.css("font-size", fontSize);
					var fontInElements = element.find("." + fontArray[j]);
					if (fontInElements.length > 0)
						fontInElements.css("font-size", fontSize);
				}
			}
		}
    },
    changeSpecificFontSize: function (fontName, increment, panelNumber) {
		var key = fontName;
		var currentFontSize = 0;
		var panelId = "";
		var elements;
		if (typeof panelNumber === "number") {
			var passageModel = step.passages.findWhere({ passageId: panelNumber});
			panelId = passageModel.attributes.id;
			key = "panel_" + panelId + "_font_" + fontName;
			elements = $(".passageContentHolder", step.util.getPassageContainer(panelNumber));
		}
		else elements = $(".passageContentHolder", step.util.getPassageContainer(".passageOptionsGroup"));

		var fontArray = ["hbFont", "unicodeFont", "arabicFont", "burmeseFont", "chineseFont", "copticFont", "farsiFont", "khmerFont", "syriacFont"];
		currentFontSize = step.util.getFontSize(fontName, panelNumber, elements);
		if (currentFontSize > 0) {
			for (var i = 0; i < elements.length; i++) {
				var fontNeedToRestoreSize = {};
				if (fontName === "defaultfont") {
					for (var j = 0; j < fontArray.length; j++) {
						var tmpFontSize = step.util.getFontSizeByName(fontArray[j], elements[i]);
						if (tmpFontSize > 0)
							fontNeedToRestoreSize[fontArray[j]] = tmpFontSize;
					}
				}
				if (currentFontSize > 0) {
					var newFontSize = currentFontSize + increment;
					if (typeof panelNumber === "number") {
						step[key] = newFontSize;
					}
					else {
						var diff = {};
						diff[key] = newFontSize;
						step.settings.save(diff);
					}
					if (fontName === "defaultfont") {
						$(elements[i]).css("font-size", newFontSize);
						// restore font size of other fonts which are not defaultfont
						// When the defaultfont size change, the other font size can be affected because 
						// some font size (e.g. hbFont is 150%) of the default size.
						for (var nameOfFont in fontNeedToRestoreSize) {
							if (typeof panelNumber === "number")
								step["panel_" + panelId + "_font_" + nameOfFont] = fontNeedToRestoreSize[nameOfFont];
							$(elements[i]).find("." + nameOfFont).css("font-size", fontNeedToRestoreSize[nameOfFont]);
						}
					}
					else {
						if ($(elements[i]).hasClass(fontName)) $(elements[i]).css("font-size", newFontSize);
						$(elements[i]).find("." + fontName).css("font-size", newFontSize);
					}
					$("#" + fontName + "Btn").find("." + fontName).css("font-size", newFontSize); // change the size of the example font in the modal
					$("#" + fontName + "Size").text("(" + newFontSize + "px)");
					if (typeof panelNumber === "undefined") {
						for (var tmpKey in step) {
							if ((tmpKey.startsWith("panel_")) && (tmpKey.indexOf("_font_" + fontName) > -1))
								delete step[tmpKey]; // Global font has changed so the panel specific font will not be kept.
						}
					}
					var passageId = step.passage.getPassageId(elements[i]);
					var passageModel = step.passages.findWhere({ passageId: passageId});
					passageModel.trigger("font:change");
				}
			}
		}
		else console.log("cannot find current font size so cannot change the font size");
    },
	getFontSizeByName: function(fontName, element) {
		if (fontName === "defaultfont") {
			var classes = $(element).attr('class').split(' '); // verify that there is no other font (e.g. hbFont, unicodeFont, ... classes 
			for (var j = 0; j < classes.length; j++) {
				var pos = classes[j].indexOf("Font");
				if ((pos >= 2) && ((pos + 4) == classes[j].length)) // Font is at the end of the class name
					return 0;
			}
			return parseInt($(element).css("font-size"));
		}
		else {
			var fontInElements = $(element).find("." + fontName);
			if (fontInElements.length > 0)
				return parseInt(fontInElements.css("font-size"));
			else if ($(element).hasClass(fontName))
				return parseInt($(element).css("font-size"));
		}
		return 0;
	},
    getFontSize: function (fontName, panelNumber, elements) {
		var currentFontSize = 0;
		if (typeof elements === "undefined")
			elements = (typeof panelNumber === "number") ? $(".passageContentHolder", step.util.getPassageContainer(panelNumber)) : 
														   $(".passageContentHolder", step.util.getPassageContainer(".passageOptionsGroup"));
		if (typeof panelNumber === "number") {
			currentFontSize = step.util.getFontSizeByName(fontName, elements[0]);
		}
		else {
			var allPanelsWithSpecificFontChange = [];
			for (var tmpKey in step) {
				if (tmpKey.startsWith("panel_")) {
					var pos = tmpKey.indexOf("_font_" + fontName);
					if (pos > -1) {
						tmpPanelId = tmpKey.substr(6, pos - 6);
						console.log("panel " + tmpKey + " " + tmpPanelId);
						allPanelsWithSpecificFontChange.push(tmpPanelId);
					}
				}
			}
			var sizeAffectedByPanelFontChange = 0;
			for (var i = 0; i < elements.length; i++) {
				var panelId = step.passages.findWhere({ passageId: step.passage.getPassageId(elements[i]) }).attributes.id;
				var panelHasSpecificFontChange = (allPanelsWithSpecificFontChange.indexOf(panelId) > -1);
				var fontSize = step.util.getFontSizeByName(fontName, elements[i]);
				if (fontSize > 0) {
					if (panelHasSpecificFontChange) sizeAffectedByPanelFontChange = fontSize;
					else {
						currentFontSize = fontSize;
						break; // Got the answer, leave loop
					}
				}
			}
			if (currentFontSize == 0) currentFontSize = sizeAffectedByPanelFontChange;
		}
		return currentFontSize;
	},
    getKeyValues: function (args) {
        var tokens = (args || "").split("|");
        var data = [];
        for (var i = 0; i < tokens.length; i++) {
            var tokenParts = tokens[i].split("=");
            if (tokenParts.length > 1) {
                var key = tokenParts[0];
                var value = tokenParts.slice(1).join("=");
                data.push({ key: key, value: value });
            }
        }
        return data;
    },
    safeEscapeQuote: function (term) {
        if (term == null) {
            return "";
        }
        return term.replace(/"/g, '\\\"');
    },
    swapMasterVersion: function (newMasterVersion, passageModel, silent) {
        var replacePattern = new RegExp("version=" + newMasterVersion, "ig");
        var originalArgs = passageModel.get("args");
        var newArgs = originalArgs.replace(replacePattern, "");
        newArgs = "version=" + newMasterVersion + "|" + newArgs;
        newArgs = newArgs.replace(/\|\|/ig, "|").replace(/\|$/ig, "");

        //now get the versions in the right order and overwrite the stored master version and extraVersions
        var versions = (newArgs || "").match(/version=[a-zA-Z0-9]+/ig) || [];
        var allVersions = [];
        for (var i = 0; i < versions.length; i++) {
            var versionName = versions[i].substring("version=".length);
            allVersions.push(versionName);
        }

        var masterVersion = allVersions[0];
        var otherVersions = allVersions.slice(1).join(",");

        passageModel.save({ args: newArgs, masterVersion: masterVersion, otherVersions: otherVersions }, { silent: silent });
    },
    ui: {
        selectMark: function (classes) {
            return '<span" class="glyphicon glyphicon-ok ' + classes + '" style="color:var(--clrText);background:var(--clrBackground)"></span>';
        },
        shortenDisplayText: function (text, maxLength) {
			if (text.length <= maxLength) return text;
            var lastSeparator = text.substr(0, maxLength).lastIndexOf(",");
			lastSeparator = Math.max(lastSeparator, text.substr(0, maxLength).lastIndexOf(" AND "));
			lastSeparator = Math.max(lastSeparator, text.substr(0, maxLength).lastIndexOf(" OR "));
			lastSeparator = Math.max(lastSeparator, text.substr(0, maxLength).lastIndexOf(" NOT "));
            if (lastSeparator < 5) lastSeparator = maxLength;
            return text.substr(0, lastSeparator) + '...';
		},
        renderArgs: function (searchTokens, container, outputMode) {
			if ((outputMode !== "button") && (outputMode !== "span")) {
				console.log("called renderArgs with wrong outputMode: " + outputMode);
				return;
			}
            if (!container) {
                container = $("<span>");
				if (!searchTokens) return container.html();
            }

            var isMasterVersion = _.where(searchTokens, {tokenType: VERSION }) > 1;
            var firstVersion = "";
            var allSelectedBibleVersions = "";
            var allSelectedReferences = "";
			var foundSearch = false;
			var searchWords = "";
			var searchJoins = [];
            for (var i = 0; i < searchTokens.length; i++) { // get the searchJoins first
				if (!searchTokens[i].itemType) searchTokens[i].itemType = searchTokens[i].tokenType;  // This is needed for syntax search.  Don't know why.  PT 5/26/2021
                if (searchTokens[i].itemType == "searchJoins") {
					searchJoins = searchTokens[i].token.split(",");
				}
			}
			var numOfSearchWords = 0;
            for (var i = 0; i < searchTokens.length; i++) { // process all the VERSION and REFERENCE first so that the buttons will always show up first at the top of the panel
				if (!searchTokens[i].itemType) searchTokens[i].itemType = searchTokens[i].tokenType; // This is needed for syntax search.  Don't know why.  PT 5/26/2021
				var itemType = searchTokens[i].itemType;
                if (itemType == VERSION) {
                    searchTokens[i].item = searchTokens[i].enhancedTokenInfo;
                    if (allSelectedBibleVersions.length > 0) allSelectedBibleVersions += ", ";
					allSelectedBibleVersions += (searchTokens[i].item.shortInitials.length > 0) ?
						step.util.safeEscapeQuote(searchTokens[i].item.shortInitials) : step.util.safeEscapeQuote(searchTokens[i].token);
                    if (firstVersion == "") firstVersion = allSelectedBibleVersions;
                    isMasterVersion = false;
                }
                else if (itemType === REFERENCE) {
                    searchTokens[i].item = searchTokens[i].enhancedTokenInfo;
                    if (allSelectedReferences.length > 0) allSelectedReferences += ", ";
                    allSelectedReferences += (searchTokens[i].item.shortName.length > 0) ?
                        step.util.safeEscapeQuote(searchTokens[i].item.shortName) : step.util.safeEscapeQuote(searchTokens[i].token);
                }
				else if ((itemType === SYNTAX) ||
                         (itemType === STRONG_NUMBER) ||
						 (itemType === TEXT_SEARCH) ||
						 (itemType === SUBJECT_SEARCH) ||
						 (itemType === GREEK) ||
						 (itemType === HEBREW) ||
						 (itemType === GREEK_MEANINGS) ||
						 (itemType === HEBREW_MEANINGS) ||
						 (itemType === MEANINGS)) {
                    foundSearch = true;
					var word = $(step.util.ui.renderArg(searchTokens[i], isMasterVersion)).text();
					if (word.length > 0) {
						numOfSearchWords ++;
						if ((numOfSearchWords > 1) && (searchWords.length > 0)) {
							if (searchJoins.length >= (numOfSearchWords - 1)) searchWords += ' ' + searchJoins[numOfSearchWords - 2] + ' ';
							else searchWords += ', ';
						}
                        if (itemType === SYNTAX) {
                            var syntaxWords = searchTokens[i].token.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').split(" ");
                            step.util.findSearchTermsInQuotesAndRemovePrefix(syntaxWords);
   							var searchRelationship = "";
                            for (var j = 0; j < syntaxWords.length; j++) {
                                if (syntaxWords[j] == "") continue;
								if ((j > 0) && (searchRelationship === "") &&
									((syntaxWords[j] === "AND") || (syntaxWords[j] === "OR") || (syntaxWords[j] === "NOT"))) {
									searchRelationship = syntaxWords[j];
									continue;
								}
                                if ((j > 0) && (searchWords.length > 0)) {
									if ((searchRelationship === "AND") || (searchRelationship === "OR") || (searchRelationship === "NOT")) searchWords += " " + searchRelationship + " ";
									else searchWords += ', ';
								}
                                if (syntaxWords[j].search(/\s*(\(*)\s*strong:([GH]\d{1,5}[A-Za-z]?)\s*(\)*)/) > -1) {
                                    // RegExp.$1 is prefix of open parathesis, RegExp.$2 is the strong number, RegExp.$2 is the suffix of close parathesis
                                    var prefix = RegExp.$1;
                                    var strongNum = RegExp.$2;
                                    var suffix = RegExp.$3;
                                    var stepTransliteration = step.util.getDetailsOfStrong(strongNum, firstVersion)[1];
                                    if (stepTransliteration === "") stepTransliteration = strongNum;
                                    searchWords += prefix + "<i>" + stepTransliteration + "</i>" + suffix;
                                }
                                else searchWords += syntaxWords[j];
								searchRelationship = "";
                            }
                        }
                        else if ((itemType === GREEK_MEANINGS) ||
							(itemType === HEBREW_MEANINGS)) searchWords += "<i>" + word + "</i>";
						else if (itemType === SUBJECT_SEARCH) searchWords += word.toUpperCase();
						else if (itemType === MEANINGS) searchWords += "~" + word;
						else searchWords += word;
					}
                }
            }

			var widthAvailable = $(".passageContainer.active").width();
			if (foundSearch) widthAvailable -= 45; // space to show the number of occurance.  eg: 105x
			if (widthAvailable < 400) $("#thumbsup").hide(); // Not enough space to show the thumbs up icon (Facebook or Tweeter)
			var charAvailable = Math.floor((Math.max(0, (widthAvailable - 220)) / 9)) + 5; // + 12; Twelve might be too much
			if (!foundSearch) {
				if (((allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length) <= (charAvailable - 9)) &&
					(allSelectedReferences === 'Gen 1')) allSelectedReferences = __s.short_title_for_ref + ": " + allSelectedReferences;
				else if (allSelectedReferences.length == 0) allSelectedReferences = __s.short_title_for_ref + ":";
			}
			else if (allSelectedReferences.length == 0) charAvailable -= 10; // save space for "Passage:"
			if (outputMode === "span") {
				allSelectedBibleVersions = step.util.ui.shortenDisplayText(allSelectedBibleVersions, 16);
				allSelectedReferences = step.util.ui.shortenDisplayText(allSelectedReferences, 24);
				searchWords = step.util.ui.shortenDisplayText(searchWords, 24);
			}
			else if ((allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length) > charAvailable) { // outputMode should be button
				allSelectedBibleVersions = step.util.ui.shortenDisplayText(allSelectedBibleVersions, 16);
				if ((allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length) > charAvailable) {
					allSelectedReferences = step.util.ui.shortenDisplayText(allSelectedReferences, 24);
					if ((allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length) > charAvailable) {
						searchWords = step.util.ui.shortenDisplayText(searchWords, 24);
						var charUsed = allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length;
						if (charUsed > charAvailable) {
							allSelectedBibleVersions = step.util.ui.shortenDisplayText(allSelectedBibleVersions, Math.max(4, allSelectedBibleVersions.length - (charUsed - charAvailable)));
							charUsed = allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length;
							if (charUsed > charAvailable) {
								allSelectedReferences = step.util.ui.shortenDisplayText(allSelectedReferences, Math.max(6, allSelectedReferences.length - (charAvailable - charUsed)));
								charUsed = allSelectedBibleVersions.length + allSelectedReferences.length + searchWords.length;
								if (charUsed > charAvailable)
									searchWords = step.util.ui.shortenDisplayText(searchWords, Math.max(6, searchWords.length - (charAvailable - charUsed)));
							}
						}
					}
				}
			}
			if (foundSearch) {
				searchWords = searchWords.replace(/ AND /g, "<sub> and </sub>");
				searchWords = searchWords.replace(/ OR /g, "<sub> or </sub>");
				searchWords = searchWords.replace(/ NOT /g, "<sub> not </sub>");
				if (allSelectedReferences.length > 0) {
					searchWords += " (" + allSelectedReferences + ")";
					allSelectedReferences = "";
				}
			}
			if (allSelectedReferences.length == 0) allSelectedReferences = __s.short_title_for_ref + ":";

			if (outputMode === "button") {
				if (allSelectedBibleVersions.length > 0)
					container.append(
						'<button type="button" ' +
							'onclick="step.util.startPickBible()" ' +
							'title="' + __s.click_translation + '" class="select-' + VERSION + ' stepButtonTriangle">' +
							allSelectedBibleVersions +
						'</button>' +
						'<span class="separator-' + VERSION + '">&nbsp;</span>');

				container.append(
					'<button type="button" ' +
						'onclick="step.util.passageSelectionModal(' + step.util.activePassageId() + ')" ' +
						'title="' + __s.click_passage + '" class="select-' + REFERENCE + ' stepButtonTriangle">' +
						allSelectedReferences +
					'</button>' +
					'<span class="separator-' + REFERENCE + '">&nbsp;</span>');

				container.append(
					'<button type="button" ' +
						'onclick="step.util.searchSelectionModal()" ' +
						'title="' + __s.click_search + '" class="select-search stepButtonTriangle">' +
						'<i style="font-size:10px" class="find glyphicon glyphicon-search"></i>' +
						'&nbsp;' + searchWords +
					'</button>' );
				return container.html();
			}
			else if (outputMode === "span") {
				if (allSelectedBibleVersions.length > 0)
					container.append(
						'<span ' +
							'title="' + __s.click_translation + '" class="' + 'argSumSpan">' +
							allSelectedBibleVersions +
						'</span>' );

				if (allSelectedReferences !== "Passage:") {
					if (allSelectedReferences === "Passage: Gen 1") allSelectedReferences = "Gen 1";
					container.append(
						'<span ' +
							'title="' + __s.click_passage + '" class="' + 'argSumSpan">|&nbsp;' +
							allSelectedReferences +
						'</span>' );
				}

				if (searchWords !== '')
					container.append(
						'|' +
						'<span ' +
							'title="' + __s.click_search + '" class="argSumSpan">' +
							'<i style="font-size:12px" class="find glyphicon glyphicon-search"></i>' +
							'&nbsp;' + searchWords +
						'</span>' );
				return container.html();
			}
        },
        renderArg: function (searchToken, isMasterVersion) {
            //a search token isn't quite a item, so we need to fudge a few things
            searchToken.itemType = searchToken.tokenType;
            searchToken.item = searchToken.enhancedTokenInfo;

            //rewrite the item type in case it's a strong number
            if (searchToken.itemType == STRONG_NUMBER) { //pretend it's a Greek meaning, or a Hebrew meaning
				if (searchToken.item)
					searchToken.itemType = (searchToken.item.strongNumber || " ")[0] == 'G' ? GREEK_MEANINGS : HEBREW_MEANINGS;
			}
            else if (searchToken.itemType == NAVE_SEARCH_EXTENDED || searchToken.itemType == NAVE_SEARCH)
                searchToken.itemType = SUBJECT_SEARCH;
            return '<span class="argSelect select-' + searchToken.itemType + '">' +
                this.renderEnhancedToken(searchToken, isMasterVersion) +
                '</span>';
        },
        getSource: function (itemType, nowrap) {
            var source;
            switch (itemType) {
                case VERSION:
                    source = __s.translation_commentary;
                    break;
                case GREEK:
                    source = __s.search_greek;
                    break;
                case GREEK_MEANINGS:
                    source = row = __s.search_greek_meaning;
                    break;
                case HEBREW:
                    source = __s.search_hebrew;
                    break;
                case HEBREW_MEANINGS:
                    source = __s.search_hebrew_meaning;
                    break;
                case REFERENCE:
                    source = __s.bible_reference;
                    break;
                case SUBJECT_SEARCH:
                    source = __s.search_topic;
                    break;
                case MEANINGS:
                    source = __s.search_meaning;
                    break;
                case SYNTAX:
                    source = __s.query_syntax;
                    break;
                case EXACT_FORM:
                    source = __s.exact_form;
                    break;
                case TEXT_SEARCH:
                    source = __s.search_text;
                    break;
                case RELATED_VERSES:
                    source = __s.verse_related;
                    break;
                case TOPIC_BY_REF:
                    source = __s.related_by_topic;
                    break;
            }
            return nowrap ? '[' + source + ']' : '<span class="source">[' + source + ']</span>';
        },
        renderEnhancedToken: function (entry, isMasterVersion) {
			if (!entry.item) return "";
            var result;
            var util = step.util;
            var source = this.getSource(entry.itemType, true) + " ";
            switch (entry.itemType) {
                case REFERENCE:
                    return '<div class="referenceItem" title="' + source + util.safeEscapeQuote(entry.item.fullName) + '" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.osisID) + '">' +
                        entry.item.shortName + '</div>';
                case VERSION:
                    // I have seen the code crashed at this point when entry.item.shortInitials is not defined.  It might be caused by an old installation of the Bible modules.
                    // I added the following code to reduce the chance of crash.
					var shortInitialsOfTranslation = ''; // added so it does not crash at startup
					var nameOfTranslation = '';          //  added so it does not crash at startup
					if (entry.item != undefined) {       // added so it does not crash at startup
                        if (entry.item.shortInitials !== undefined) {
                            shortInitialsOfTranslation = entry.item.shortInitials;
                            var temp = entry.item.initials; // Sometimes the crash is caused by a mismatch upper and lower case
                            if (step.keyedVersions[temp] === undefined) temp = temp.toUpperCase();
                            if (step.keyedVersions[temp] === undefined)
                                nameOfTranslation = step.keyedVersions[temp].name;
                            else if (step.keyedVersions[shortInitialsOfTranslation] !== undefined) nameOfTranslation = step.keyedVersions[shortInitialsOfTranslation].name;
                        }
					}
					result = '<div class="versionItem ' + (isMasterVersion ? "masterVersion" : "") +
                      '" title="' + source + util.safeEscapeQuote(shortInitialsOfTranslation + ' - ' + nameOfTranslation) + // added so it does not crash at startup
                      (isMasterVersion ? "\n" + __s.master_version_info : "") + '" ' +
                      'data-item-type="' + entry.itemType + '" ' +
                      'data-select-id="' + util.safeEscapeQuote(shortInitialsOfTranslation) + '">' + shortInitialsOfTranslation;  // added so it does not crash at startup
					result = result + "</div>";
                    return result;
                case GREEK:
                case HEBREW:
                case GREEK_MEANINGS:
                case HEBREW_MEANINGS:
                    return "<div class='" + entry.itemType + "Item' " +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.stepTransliteration) + '" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.gloss + ", " + entry.item.matchingForm) + '">' +
                        '<span class="transliteration">' + entry.item.stepTransliteration + "</span></div>";
                case MEANINGS:
                    return '<div class="meaningsItem" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.gloss) + '" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.gloss) + '">' + entry.item.gloss + "<div>";
                case SUBJECT_SEARCH:
                    return '<div class="subjectItem" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.value) + '" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.value) + '">' + entry.item.value + "<div>";
                case TEXT_SEARCH:
                    return '<div class="textItem" data-select-id="' + util.safeEscapeQuote(entry.item.text) + '"' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.text) + '">' + entry.item.text + "</div>";
                case EXACT_FORM:
                    return '<div class="exactFormItem" data-select-id="' + util.safeEscapeQuote(entry.item.text) + '"' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.text) + '">' + '"' + entry.item.text + '"' + "</div>";
                case SYNTAX:
                    return '<div class="syntaxItem"' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.value) + '" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.value) + '">' + entry.item.text + "</div>";
                case TOPIC_BY_REF:
                    return '<div class="topicByRefItem" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.text) + '" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.text) + '" ' +
                        '>' + __s.related_prefix + " " +
                        entry.item.text + '</div>';
                case RELATED_VERSES:
                    return '<div class="relatedVersesItem" ' +
                        'title="' + source + util.safeEscapeQuote(entry.item.text) + '" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.text) + '" ' +
                        '>' + __s.related_prefix + " " +
                        entry.item.text + '</div>';

                    break;
                default:
					var returnVal = "";
					if ((entry.item) && (entry.item.text === "string"))
						returnVal = entry.item.text;
					return returnVal;
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
            } else if (language == "cop") {
                return "copticFont";
            } else if (language == "my") {
                return "burmeseFont";
            } else if (language == "syr") {
                return "syriacFont";
            } else if (language == "ar") {
                return "arabicFont";
            } else if (language == "zh") {
                return "chineseFont";
            } else if (language == "khm" || language == "km") {
                return "khmerFont";
            } else if (language == "far" || language == "fa" || language == "per") {
                return "farsiFont";
            }
        },
        /**
         * called when click on a piece of text.
         */
        showTutorial: function () {
            step.util.ui.initSidebar('help', { });
            require(["sidebar"], function (module) {
                step.sidebar.save({
                    mode: 'help'
                });
            });
        },
        /**
         * called when click on a piece of text.
         */
        showDef: function (source) {
            var strong, morph, ref, version;

            if (typeof source == "string") {
                strong = source;
            } else if (source.strong) {
                strong = source.strong;
                ref = source.ref;
                morph = source.morph;
                version = source.version;
            } else {
                var s = $(source);
                strong = s.attr("strong");
                morph = s.attr("morph");
                ref = step.util.ui.getVerseNumber(s);
                version = step.passages.findWhere({ passageId: step.passage.getPassageId(s) }).get("masterVersion");
            }

            step.util.ui.initSidebar('lexicon', { strong: strong, morph: morph, ref: ref, version: version });
            require(["sidebar"], function (module) {
                step.util.ui.openStrongNumber(strong, morph, ref, version);
            });
        },
        initSidebar: function (mode, data) {
            require(["sidebar"], function (module) {
                if (!data) {
                    data = {};
                }

                //need to initialise sidebar, which will open it.
                if (!step.sidebar) {
                    step.sidebar = {};
                    step.sidebar = new SidebarModel({
                        strong: data.strong,
                        morph: data.morph,
                        ref: data.ref,
                        version: data.version,
                        mode: mode == null ? 'analysis' : mode
                    });
                    new SidebarList().add(step.sidebar);
                    new SidebarView({
                        model: step.sidebar,
                        el: $("#sidebar")
                    });
                } else if (mode == null) {
                    //simply toggle it
                    step.sidebar.trigger("toggleOpen");
                } else if (step.sidebar.get("mode") != mode) {
                    step.sidebar.save({ mode: mode });
                } else {
                    //there is a mode, which is non null, but the save wouldn't do anything, to force open
                    step.sidebar.trigger("forceOpen");
                }
            });
        },
        openStrongNumber: function (strong, morph, reference, version) {
            step.sidebar.save({
                strong: strong,
                morph: morph,
                mode: 'lexicon',
                ref: reference,
                version: version
            });
        },
        openStats: function (focusedPassage) {
            this.initSidebar("analysis", { ref: focusedPassage });
            require(["sidebar"], function (module) {
                step.sidebar.save({
                    mode: 'analysis',
                    focusedPassage: focusedPassage
                });
            });
        },
        doQuickLexicon: function (target) {

        },
        addStrongHandlers: function (passageId, passageContent) {
            var that = this;
            var allStrongElements = $("[strong]", passageContent);
			step.touchForQuickLexiconTime = 0; // only use for touch screen
			step.displayQuickLexiconTime = 0;  // only use for touch screen
			step.strongOfLastQuickLexicon = "";  // only use for touch screen
			step.lastTapStrong = ""  // only use for touch screen
			that.pageY = 0;
            allStrongElements.click(function () {
                if (!step.touchDevice) {
                    $(".lexiconFocus, .lexiconRelatedFocus").removeClass("lexiconFocus lexiconRelatedFocus");
                    $(this).addClass("lexiconFocus");
                    step.util.ui.showDef(this);
					step.passage.higlightStrongs({
						passageId: undefined,
						strong: $(this).attr('strong'),
						morph: $(this).attr('morph'),
						classes: "lexiconFocus"
					});
                }
			}).on("touchstart", function (ev) {
				if ((typeof ev.originalEvent == "object") &&
					(typeof ev.originalEvent.touches == "object") &&
					(typeof ev.originalEvent.touches[0] == "object") &&
					(typeof ev.originalEvent.touches[0].pageY == "number")) 
					that.pageY = ev.originalEvent.touches[0].pageY;
				step.touchForQuickLexiconTime = Date.now();
				var strongStringAndPrevHTML = step.util.ui._getStrongStringAndPrevHTML(this); // Try to get something unique on the word touch by the user to compare if it is the 2nd touch
				var userTouchedSameWord = (strongStringAndPrevHTML == step.lastTapStrong);
				step.lastTapStrong = "notdisplayed" + strongStringAndPrevHTML;
				step.util.ui._processTouchOnStrong(this, passageId, userTouchedSameWord, that.pageY); 
			}).on("touchend", function (ev) {
				var diff = Date.now() - step.touchForQuickLexiconTime;
				if (diff < TOUCH_DURATION) {
					step.touchForQuickLexiconTime = 0; // If the quick lexicon has not been rendered, the quick lexicon code will see the change in this variable and not proceed
					step.strongOfLastQuickLexicon = "";
				}
			}).on("touchcancel", function (ev) {
				step.touchForQuickLexiconTime = 0; // If the quick lexicon has not been rendered, the quick lexicon code will see the change in this variable and not proceed
				step.strongOfLastQuickLexicon = "";
			}).on("touchmove", function (ev) {
				step.touchForQuickLexiconTime = 0;
				step.strongOfLastQuickLexicon = "";
				var diff = Date.now() - step.displayQuickLexiconTime;
				if ((diff) < 900) { // Cancel the quick lexicon and highlight of words because touch move detected less than 900 ms later.  The user probably want to scroll instead of quick lexicon.
					$("#quickLexicon").remove();
					step.passage.removeStrongsHighlights(undefined, "primaryLightBg relatedWordEmphasisHover");
					step.lastTapStrong = "";
				}
			}).hover(function (ev) { // mouse pointer starts hover (enter)
				if (!step.touchDevice) {
					step.passage.higlightStrongs({
						passageId: undefined,
						strong: $(this).attr('strong'),
						morph: $(this).attr('morph'),
						classes: "primaryLightBg"
					});
					var hoverContext = this;
					require(['quick_lexicon'], function () {
						step.util.delay(function () {
							// do the quick lexicon
							step.util.ui._displayNewQuickLexicon(hoverContext, passageId, false, ev.pageY);
							step.util.keepQuickLexiconOpen = false;
						}, MOUSE_PAUSE, 'show-quick-lexicon');
					});
				}
            }, function () { // mouse pointer ends hover (leave)
				if (!step.touchDevice) {
					step.passage.removeStrongsHighlights(undefined, "primaryLightBg relatedWordEmphasisHover");
					step.util.delay(undefined, 0, 'show-quick-lexicon');
					if (!step.util.keepQuickLexiconOpen) {
						$("#quickLexicon").remove();
					}
				}
            });
        },
        _getStrongStringAndPrevHTML: function (touchedObject) {
			var result = "";
			if (typeof $(touchedObject).attr("strong") === "string") {
				result = $(touchedObject).attr("strong");
				if ((typeof $(touchedObject).prev()[0] === "object") &&
					(typeof $(touchedObject).prev()[0].outerHTML === "string"))
					result += $(touchedObject).prev()[0].outerHTML.replace(/\s?primaryLightBg\s?/g, "")
														   .replace(/\s?relatedWordEmphasisHover\s?/g, "")
														   .replace(/\s?lexiconFocus\s?/g, "")
														   .replace(/\s?lexiconRelatedFocus\s?/g, "")
														   .replace(/\s?secondaryBackground\s?/g, "");
			}
			return result;
		},
        _processTouchOnStrong: function (touchedObject, passageId, touchSameWord, pageY) {
			if (touchSameWord) { // touched 2nd time
				step.strongOfLastQuickLexicon = "";
				step.touchForQuickLexiconTime = 0;
				$(".lexiconFocus, .lexiconRelatedFocus").removeClass("lexiconFocus lexiconRelatedFocus secondaryBackground");
				$(touchedObject).addClass("lexiconFocus");
				step.util.ui.showDef(touchedObject);
				step.passage.higlightStrongs({
					passageId: undefined,
					strong: $(touchedObject).attr('strong'),
					morph: $(touchedObject).attr('morph'),
					classes: "lexiconFocus"
				});
			}
			else {
				step.strongOfLastQuickLexicon = $(touchedObject).attr('strong');
				require(['quick_lexicon'], function () {
					step.util.ui._displayNewQuickLexicon(touchedObject, passageId, true, pageY);
				});
			}
		},
        _displayNewQuickLexicon: function (hoverContext, passageId, touchEvent, pageYParam) {
            var strong = $(hoverContext).attr('strong');
            var morph = $(hoverContext).attr('morph');
            var reference = step.util.ui.getVerseNumber(hoverContext);
            var version = step.passages.findWhere({passageId: passageId}).get("masterVersion");
            var quickLexiconEnabled = step.passages.findWhere({ passageId: passageId}).get("isQuickLexicon");
			var pageY = (typeof pageYParam == "number") ? pageYParam : 0;
            if (quickLexiconEnabled == true || quickLexiconEnabled == null) {
                new QuickLexicon({
                    strong: strong, morph: morph,
                    version: version, reference: reference,
                    target: hoverContext, position: pageY / $(window).height(), touchEvent: touchEvent,
                    passageId: passageId
                });
            }
        },
        /**
         * Sets the HTML onto the passageContent holder which contains the passage
         * @param passageHtml the JQuery HTML content
         * @private
         */
        getVerseNumber: function (el) {
            return $(el).closest(".verseGrouping").find(".heading .verseLink").attr("name") ||
                $(el).closest(".verse, .interlinear").find(".verseLink").attr("name");
        },
        emptyOffDomAndPopulate: function (passageContent, passageHtml) {
            var parent = passageContent.parent();
//            passageContent.detach();
            passageContent.off("scroll");
            passageContent.closest(".column").off("scroll");

            //we garbage collect in the background after the passage has loaded
            passageContent.empty();
            passageContent.append(passageHtml);
            parent.append(passageContent);
            passageContent.append(this.getCopyrightInfo());
        },
        getCopyrightInfo: function () {
            var model = step.util.activePassage();
            var message = __s.copyright_information_list;
            if (model.get("masterVersion") != null) {
                message += " " + this._getCopyrightLink(model.get("masterVersion"));
            }

            if (!step.util.isBlank(model.get("extraVersions"))) {
                var v = (model.get("extraVersions").split(",")) || [];
                for (var version in v) {
                    if (!step.util.isBlank(v[version])) {
                        message += ", ";
                        message += this._getCopyrightLink(v[version]);
                    }
                }
            }
            return "<div class='copyrightInfo'>" + message + "<div>";
        },
        _getCopyrightLink: function (v) {
            return "<a href='/version.jsp?version=" + v + "' target='_new'>" + v + "</a>";
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
         * @param subFilter the filter to use on the children
         * @private
         */
        _applyCssClassesRepeatByGroup: function (passageContent, groupSelector, cssClasses, exclude, offset, subFilter) {
            if (offset == undefined) {
                offset = 0;
            }

            var words = $(groupSelector, passageContent);
            for (var j = 0; j < words.length; j++) {
                var jqItem = words.eq(j);
                var children = jqItem.children(subFilter);
                for (var i = offset; i < children.length; i++) {
                    var child = children.eq(i);
                    if (exclude == undefined || !exclude(child)) {
                        child.addClass(cssClasses[i - offset]);
                    }
                }
            }
        },
        getFeaturesLabel: function (item) {
            var features = "";

            // add to Strongs if applicable, and therefore interlinear
            if (item.hasRedLetter) {
                features += " " + '<span class="versionFeature" title="' + __s.jesus_words_in_red_available + '">' + __s.jesus_words_in_red_available_initial + '</span>';
            }

            if (item.hasNotes) {
                features += " " + '<span class="versionFeature" title="' + __s.notes_available + '">' + __s.notes_available_initials + '</span>';
            }

            // add morphology
            if (item.hasMorphology) {
                features += " " + "<span class='versionFeature' title='" + __s.grammar_available + "'>" + __s.grammar_available_initial + "</span>";
            }

            if (item.hasStrongs) {
                features += " " + "<span class='versionFeature' title='" + __s.vocabulary_available + "'>" + __s.vocabulary_available_initial + "</span>";

                if (item.hasSeptuagintTagging) {
                    features += " " + "<span class='versionFeature' title='" + __s.septuagint_interlinear_available + "'>" + __s.septuagint_interlinear_available_initial + "</span>";
                } else {
                    features += " " + "<span class='versionFeature' title='" + __s.interlinear_available + "'>" + __s.interlinear_available_initial + "</span>";
                }
            }
            return features + "&nbsp;";
        },
        enhanceVerseNumbers: function (passageId, passageContent, version, isSearch) {
            $(".verseNumber", passageContent).closest("a").mouseenter(function () {
                var isVerseVocab = step.passages.findWhere({ passageId: passageId }).get("isVerseVocab");
                if (isVerseVocab || isVerseVocab == null) {
                    step.util.ui._addSubjectAndRelatedWordsPopup(passageId, $(this), version, isSearch);
                }
            });
        },

        _addSubjectAndRelatedWordsPopup: function (passageId, element, version, isSearch) {
            var reference = element.attr("name");
            var self = this;

            require(["qtip"], function () {
                var delay = step.passages.findWhere({ passageId: passageId }).get("interlinearMode") == 'INTERLINEAR' ? 650 : 50;
                step.util.delay(function () {
                    $.getSafe(BIBLE_GET_STRONGS_AND_SUBJECTS, [version, reference, step.userLanguageCode], function (data) {
                        var template = '<div class="vocabTable">' +
                            '<div class="col-xs-8 col-sm-4 heading"><h1><%= (data.multipleVerses ? sprintf(__s.vocab_for_verse, data.verse) : "") %></h1></div>' +
                            '<div class="col-xs-2 col-sm-1 heading"><h1><%= __s.bible_book %></h1></div>' +
                            '<div class="col-xs-2 col-sm-1 heading"><h1><%= ot ? __s.OT : __s.NT %></h1></div>' +
                            '<div class="hidden-xs col-sm-4 heading even"><h1><%= __s.vocab_for_verse_continued %></h1></div>' +
                            '<div class="hidden-xs col-sm-1 heading"><h1><%= __s.bible_book %></h1></div>' +
                            '<div class="hidden-xs col-sm-1 heading"><h1><%= ot ? __s.OT : __s.NT %></h1></div>' +
                            '<% _.each(rows, function(row, i) { %>' +
                            '<span data-strong="<%= row.strongData.strongNumber %>">' +
                            '<a href="javascript:void(0)" class="definition col-xs-8 col-sm-4 <%= i % 2 == 1 ? "even" : "" %>"><%= row.strongData.gloss %> ' +
                            '(<span class="transliteration"><%= row.strongData.stepTransliteration %></span> - <%= row.strongData.matchingForm %>)</a>' +
                            '<a href="javascript:void(0)" class="bookCount col-xs-2 col-sm-1"><%= sprintf("%d&times;", row.counts.book) %></a>' +
                            '<a href="javascript:void(0)" class="bibleCount col-xs-2 col-sm-1"><%= sprintf("%d&times;", row.counts.bible) %></a>' +
                            '</span><% }); %>' +
                            '<% if(rows.length % 2 == 1) { %>' +
                            // The "&nbsp;" in the following line has caused the Chrome browser to run into an infinite loop.  This issued was discovered in September 2019.
                            //                                        '<span class="even">&nbsp;</span>' +
                            // Removed the "&nbsp;" to resolve the Chrome browser issue
                            '<span class="even"></span>' +
                            '<% } %>' +
                            '</div>' +
                            '<div class="verseVocabLinks"><a href="javascript:void(0)" class="relatedVerses"><%= __s.see_related_verses %></a> ' +
                            '<a href="javascript:void(0)" class="relatedSubjects"><%= __s.see_related_subjects%></a> ' +
                            '<% if(isSearch) { %><a href="javascript:void(0)" class="verseInContext"><%= __s.see_verse_in_context %></a><% } %></div>';

                        var rows = [];

                        // Check step.userLanguageCode and $.getURlvar
                        var urlLang = $.getUrlVar("lang");
                        if (urlLang == null) urlLang = "";
                        else urlLang = urlLang.toLowerCase();
                        var currentLang = step.userLanguageCode.toLowerCase();
                        if (urlLang == "zh_tw") currentLang = "zh_tw";
                        else if (urlLang == "zh") currentLang = "zh";
                        for (var key in data.strongData) {
                            var verseData = data.strongData[key];
                            for (var strong in verseData) {
                                var strongData = verseData[strong];
                                if (strongData && strongData.strongNumber) {
                                    var counts = data.counts[strongData.strongNumber];
                                    if ((currentLang == "es") && (strongData._es_Gloss)) strongData.gloss = strongData._es_Gloss;
                                    else if ((currentLang == "zh") && (strongData._zh_Gloss)) strongData.gloss = strongData._zh_Gloss;
                                    else if ((currentLang == "zh_tw") && (strongData._zh_tw_Gloss)) strongData.gloss = strongData._zh_tw_Gloss;
                                    rows.push({
                                        strongData: strongData,
                                        counts: counts
                                    });
                                }
                            }
                        }

                        var templatedTable = $(_.template(template)({
                            rows: rows,
                            ot: data.ot,
                            data: data,
                            isSearch: isSearch
                        }));

                        templatedTable.find(".definition").click(function () {
                            step.util.trackAnalytics('verseVocab', 'definition');
                            self.showDef({strong: $(this).parent().data("strong"), ref: reference, version: version });
                        });

                        templatedTable.find(".bookCount").click(function () {
                            step.util.trackAnalytics('verseVocab', 'bookCount');
                            var bookKey = key.substring(0, key.indexOf('.'));
                            var strong = $(this).parent().data("strong");
                            var args = "reference=" + encodeURIComponent(bookKey) + "|strong=" + encodeURIComponent(strong);
                            //make this the active passage
                            step.util.createNewLinkedColumn(passageId);
                            step.util.activePassage().save({ strongHighlights: strong }, { silent: true });
                            step.router.navigatePreserveVersions(args);
                        });
                        templatedTable.find(".bibleCount").click(function () {
                            step.util.trackAnalytics('verseVocab', 'bibleCount');
                            var strong = $(this).parent().data("strong");
                            var args = "strong=" + encodeURIComponent(strong);
                            //make this the active passage
                            step.util.createNewLinkedColumn(passageId);
                            step.util.activePassage().save({ strongHighlights: strong }, { silent: true });
                            step.router.navigatePreserveVersions(args);
                        });

                        templatedTable.find(".relatedVerses").click(function () {
                            step.util.trackAnalytics('verseVocab', 'relatedVerses');
                            step.util.createNewLinkedColumn(passageId);
                            step.router.navigatePreserveVersions(RELATED_VERSES + "=" + encodeURIComponent(key));
                        });

                        templatedTable.find(".relatedSubjects").click(function () {
                            step.util.trackAnalytics('verseVocab', 'relatedSubjects');
                            step.util.createNewLinkedColumn(passageId);
                            step.router.navigatePreserveVersions(TOPIC_BY_REF + "=" + encodeURIComponent(key));
                        });

                        templatedTable.find(".verseInContext").click(function () {
                            step.util.trackAnalytics('verseVocab', 'verseInContext');
                            element.trigger("click");
                        });

                        var qtip = element.qtip({
                            show: { event: 'mouseenter' },
                            hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
                            position: { my: "bottom center", at: "top center", of: element, viewport: $(window), effect: false },
                            style: { classes: "versePopup" },
                            overwrite: false,
                            content: {
                                text: templatedTable
                            }
                        });

                        qtip.qtip("show");
                    }).error(function() {
                        changeBaseURL();
                    });
                }, delay, 'delay-strong-popup');
                element.one('mouseleave', function () {
                    step.util.clearTimeout('delay-strong-popup');
                });
            });
        },
        /**
         * If the strong starts with an 'h' then we're looking at Hebrew.
         * @param strong
         * @returns {string}
         * @private
         */
        getFontForStrong: function (strong) {
            if (strong[0] == 'H') {
                return "hbFontSmall";
            } else {
                return "unicodeFont";
            }
        },
        addCollapsiblePanel: function (text, classes, href) {
            var wrapper = $("<div class='panel-heading'>");
            var panel = $("<div class='panel panel-default'>").append(wrapper);
            wrapper.append($("<h4 data-toggle='collapse'>").attr("href", href)
                .addClass("panel-title").addClass(classes)
                .append('<span class="glyphicon glyphicon-plus"></span>')
                .append(text));

            return panel;
        },
        highlightPhrase: function (nonJqElement, cssClasses, phrase) {
            var regexPattern = phrase.replace(/ /g, ' +').replace(/"/g, '["\u201d]');
            var regex = new RegExp(regexPattern, "ig");
            doHighlight(nonJqElement, cssClasses, regex);
        }
    },
	showConfigGrammarColor: function (e) {
        if (e) e.preventDefault();
        // var temp = document.getElementById("grammarClrModal");
        // if (!temp) grammarColorConfigPage.appendTo("body");
        var element = document.getElementById('grammarClrModal');
        if (element) element.parentNode.removeChild(element);
		var jsVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";
        $('<div id="grammarClrModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog">' +
				'<div class="modal-content stepModalFgBg"">' +
					'<link href="css/color_code_grammar.' + jsVersion + 'css" rel="stylesheet"/>' +
					'<link rel="stylesheet" href="css/spectrum.css"/>' +
					'<script src="js/color_code_config.' + jsVersion + 'js"></script>' +
					'<script src="libs/spectrum.js"></script>' +
					'<div class="modal-header">' +
						step.util.modalCloseBtn(null, "closeClrConfig") +
					'</div>' +
					'<div class="modal-body">' +
						'<div id="colortabs">' +
							'<ul class="nav nav-tabs">' +
								'<li class="active"><a href="#nounClrs" data-toggle="tab">Number & Gender</a></li>' +
								'<li><a href="#verbClrs" data-toggle="tab">Greek Verbs</a></li>' +
								'<li><a href="#hVerbClrs" data-toggle="tab">OT Verbs</a></li>' +
							'</ul>' +
							'<div class="tab-content">' +
								'<div class="tab-pane fade in active" id="nounClrs"></div>' +
								'<div class="tab-pane fade" id="verbClrs"></div>' +
								'<div class="tab-pane fade" id="hVerbClrs"></div>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div class="footer">' +
						'<br>' +
						'<button id="openButton" class="stepButton" onclick=openClrConfig()><label>Open</label></button>' +
						'<button id="saveButton" class="stepButton" onclick=saveClrConfig()><label>Save</label></button>' +
						'<button id="cancelButton" class="stepButton" onclick=cancelClrChanges()><label>Cancel</label></button>' +
						'<button id="resetButton" class="stepButton" onclick=resetClrConfig()><label>Reset</label></button>' +
						'<button class="stepButton" data-dismiss="modal" onclick=closeClrConfig()><label>Exit</label></button>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<script>' +
				'$( document ).ready(function() {' +
					'initializeClrCodeHtmlModalPage();' +
				'});' +
			'</script>' +
		'</div>').modal("show");
    },
    passageSelectionModal: function (activePassageNumber) {
        var element = document.getElementById('passageSelectionModal');
        if (element) element.parentNode.removeChild(element);
        $("div.modal-backdrop.in").remove();
		if ((activePassageNumber !== -1) && (step.util.activePassageId() !== activePassageNumber))
			step.util.activePassageId(activePassageNumber); // make the passage active
		var modalHTML = '<div id="passageSelectionModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
			'<div class="modal-dialog">' +
				'<div class="modal-content stepModalFgBg" style="width:95%;max-width:100%;top:0;right:0;bottom:0;left:0;-webkit-overflow-scrolling:touch">' +
					'<div class="modal-header">' +
						'<button id="pssgModalBackButton" type="button" style="border:none;float:left;font-size:16px" onclick=step.passageSelect.goBackToPreviousPage()><i class="glyphicon glyphicon-arrow-left"></i></button>' +
						'<span class="pull-right">' +
							step.util.modalCloseBtn("passageSelectionModal") +
							'<span class="pull-right">&nbsp;&nbsp;&nbsp;</span>' +
							'<div id="modalonoffswitch" class="pull-right">' +
								'<span id="select_verse_number">&nbsp;<b><%= __s.select_verse_number %></b></span>' +
								'<div class="onoffswitch2 append pull-right">' +
									'<input type="checkbox" name="onoffswitch2" class="onoffswitch2-checkbox" id="selectverseonoffswitch" onchange="addSelectVerse()"/>' +
									'<label class="onoffswitch2-label" for="selectverseonoffswitch">' +
									'<span class="onoffswitch2-inner"></span>' +
									'<span class="onoffswitch2-switch"></span>' +
									'</label>' +
								'</div>' +
							'</div>' +
						'</span>' +
						'<br>' +
						'<div id="displayLocForm" class="form-group" style="clear:both;float:right;font-size:16px">' +
							'<label for="displayLocation"><%= __s.display_passage_at %></label>' +
							'<select class="stepFgBg" type="text" id="displayLocation">' +
								'<option value="replace"> <%= __s.current_panel %></option>' +
								'<option class="hidden-xs" value="new"><%= __s.new_panel %></option>' +
								'<option id="append_to_panel" value="append"><%= __s.append_to_panel %></option>' +
							'</select>' +
						'</div><br>' +
					'</div>' ;
		if (!step.touchDevice) modalHTML +=
						'<textarea id="enterYourPassage" rows="1" class="stepFgBg" style="font-size:13px;width:95%;margin-left:5;resize=none;height:24px" title="<%= __s.type_in_your_passage %>"' +
						' placeholder="<%= __s.select_passage_input_placeholder %>"></textarea>';
		modalHTML +=
					'<div id="bookchaptermodalbody" class="modal-body"></div>' +
					'<div class="footer">';
		if (step.touchDevice) modalHTML +=
						'<textarea id="enterYourPassage" rows="1"  class="stepFgBg" style="font-size:16px;width:80%;margin-left:5;margin-bottom:5;resize=none;height:24px"' +
						' placeholder="<%= __s.select_passage_input_short_placeholder %>"></textarea>';
		modalHTML +=
						'<br>' +
						'<span id="userEnterPassageError" style="color: red"></span>' +
					'</div>' +
					'<script>' +
						'$(document).ready(function () {' +
							'step.passageSelect.initPassageSelect();' +
						'});' +
						'function addSelectVerse() {' +
							'if (document.getElementById("selectverseonoffswitch").checked) {' +
								'$("#select_verse_number").addClass("checked");' +
							'}' +
							'else {' +
								'$("#select_verse_number").removeClass("checked");' +
							'}' +
						'}' +
					'</script>' +
				'</div>' +
			'</div>' +
		'</div>';
		$(_.template(modalHTML)()).modal("show");
		if (!step.touchDevice) {
			$('textarea#enterYourPassage').focus().val(step.tempKeyInput);
			step.tempKeyInput = "";
		}
    },

	searchSelectionModal: function () {
        var element = document.getElementById('searchSelectionModal');
        if (element) element.parentNode.removeChild(element);
        $(_.template('<div id="searchSelectionModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog">' +
				'<div class="modal-content stepModalFgBg" style="width:95%;max-width:100%;top:0;right:0;bottom:0;left:0;-webkit-overflow-scrolling:touch">' +
					'<script>' +
						'$(document).ready(function () {' +
							'step.searchSelect.initSearchSelection();' +
						'});' +
						'function showPreviousSearch() {' +
							'var element = document.getElementById("showprevioussearchonoff");' +
							'if ((element) && (element.checked)) {' +
								'step.searchSelect.includePreviousSearches = true;' +
								'$("#listofprevioussearchs").show();' +
								'var onlyFoundSubjectOrMeaningsSearch = true;' +
								'for (var i = 0; i < step.searchSelect.previousSearchTokens.length; i++) {' +
									'if ((step.searchSelect.previousSearchTokens[i] !== "") &&' +
										'(!step.searchSelect.previousSearchTokens[i].startsWith(MEANINGS)) &&' +
										'(!step.searchSelect.previousSearchTokens[i].startsWith(SUBJECT_SEARCH)))' +
										'onlyFoundSubjectOrMeaningsSearch = false;' +
								'}' +
//								'if (onlyFoundSubjectOrMeaningsSearch) $("#searchAndOrNot").hide();' +
//								'else $("#searchAndOrNot").show();' +
								'$("#searchAndOrNot").show();' +
								'if (step.searchSelect.searchUserInput.length == 0) {' +
									'if ((step.searchSelect.rangeWasUpdated) || (step.searchSelect.andOrNotUpdated) ||' +
										'(step.searchSelect.numOfPreviousSearchTokens != step.searchSelect.previousSearchTokens.length)) $("#updateButton").show();' +
								'}' +
//								'step.searchSelect.handlePreviousSearchAndOrNot();' +
							'}' +
							'else {' +
								'step.searchSelect.includePreviousSearches = false;' +
								'$("#listofprevioussearchs").hide();' +
								'$("#searchAndOrNot").hide();' +
								'$("#updateButton").hide();' +
								'$("#searchResultssubject").show();' +
								'$("#searchResultsmeanings").show();' +
								'$("#searchResultssubjectWarn").hide();' +
								'$("#searchResultsmeaningsWarn").hide();' +
							'}' +
						'}' +
					'</script>' +

					'<div class="modal-header">' +
						'<button id="srchModalBackButton" type="button" style="border:none;float:left;font-size:16px" onclick=step.searchSelect.goBackToPreviousPage()><i class="glyphicon glyphicon-arrow-left"></i></button>' +
						'<span class="pull-right">' +
							step.util.modalCloseBtn("searchSelectionModal") +
							'<span class="pull-right">&nbsp;&nbsp;&nbsp;</span>' +
							'<span id="displayLocForm" class="form-group pull-right hidden-xs" style="font-size:16px">' +
								'<label for="displayLocation"><%= __s.display_result_in %>:</label>' +
								'<select type="text" id="displayLocation" class="stepFgBg">' +
									'<option value="replace"><%= __s.current_panel %></option>' +
									'<option class="hidden-xs" value="new"><%= __s.new_panel %></option>' +
								'</select>' +
							'</span>' +
						'</span><br>' +
					'</div>' +
					'<div id="searchmodalbody" class="modal-body">' +
						'<div id="searchHdrTable"></div>' +
						'<br>' +
						'<div id="previousSearch"></div>' +
					'</div>' +
					'<div class="footer">' +
						'<br>' +
						'<span id="searchSelectError"></span>' +
						'<button id="updateRangeButton" style="display:none;float:right" type="button" class="stepButton"' +
						'onclick=step.searchSelect._updateRange()></button>' +
						'<button id="updateButton" style="display:none;float:right" type="button" class="stepButton"' +
						'onclick=step.searchSelect.goSearch()><%= __s.update_search %></button><br><br><br>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>')()).modal("show");
		$('textarea#userTextInput').focus();
    },
	showVideoModal: function (videoFile, seconds, width) {
        var element = document.getElementById('videoModal');
        if (element) element.parentNode.removeChild(element);
        $(_.template(
			'<div id="videoModal" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-videofile="' + videoFile + '" data-videotime="' + seconds + '">' +
				'<div class="modal-dialog">' +
					'<div class="modal-content stepModalFgBg">' +
						'<script>' +
							'$(document).ready(function () {' +
								'var file = $("#videoModal").data("videofile");' +
								'var time = $("#videoModal").data("videotime") * 1000;' +
								'var gifElement = document.createElement("img");' +
								'var randomString = "";' +
								'if ((typeof performance === "object") && (typeof performance.now() === "number")) {' +
									'randomString = "?" + performance.now();' +  // GIF file in some browser gets stuck in the last frame after it has played once.
								'}' +
								'else randomString = "?" + Math.floor(Math.random() * 10000); ' +
								'gifElement.src = "images/" + file + randomString;' +
								'gifElement.onload = function() {' +
									'$("#pleasewait").remove();' +
									'$("#videomodalbody").append(gifElement);' +
									'setTimeout(function(){ step.util.closeModal("videoModal") }, time);' +
								'}' +
							'})' +
						'</script>' +
						'<div class="modal-header">' +
							step.util.modalCloseBtn("videoModal") +
						'</div>' +
						'<div id="videomodalbody" class="modal-body" style="text-align:center;background-color:grey">' +
							'<p id="pleasewait">Loading video, please wait...</p>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>'
		)()).modal("show");
    },
    showSummary: function (reference) {
        element = document.getElementById('showBookOrChapterSummaryModal');
        if (element) element.parentNode.removeChild(element);
        $(".modal-backdrop.in").remove();
        var tmpArray = reference.split(".");
        var osisID = tmpArray[0]; // get the string before the "." character
        var longBookName = osisID;
		var posOfBook = step.searchSelect.idx2osisChapterJsword[osisID];
        var arrayOfTyplicalBooksChapters = JSON.parse(__s.list_of_bibles_books);
		if ((posOfBook > -1) &&
			(typeof arrayOfTyplicalBooksChapters !== "undefined"))
			longBookName = arrayOfTyplicalBooksChapters[posOfBook][0];
        var chapterNum = (tmpArray.length > 1) ? parseInt(tmpArray[1].split(":")[0].split("-")[0].split(";")[0]) : 1;
        if (typeof chapterNum !== "number") chapterNum = 1;
        var bibleSummary = 
            '<br><span class="stepFgBg" style="font-size:16px"><b>Old Testament</b></span>' +
            '<div>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>From Eden to wilderness</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Genesis - Beginnings</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Exodus - Escape from Egypt</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Leviticus - Ceremonial laws</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Numbers - Wilderness years</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Deuteronomy - Moses\' farewell</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>From conquest to King Saul</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Joshua - Taking the land</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Judges - Living among enemies</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Ruth - David\'s ancestors\' love story</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Samuel - Prophets versus Kings</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>From King David to exile</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Samuel - Uniting the Kingdom</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Kings - Dividing the kingdom</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Kings - End of Israel &amp; Judah</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Chronicles - Retelling 1 &amp; 2 Samuel</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Chronicles - Retelling Judah\'s Kings</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Return and faith on trial</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Ezra - Return from exile</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Nehemiah - Rebuilding Jerusalem</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Esther - Surviving in exile</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Job - Understanding suffering</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Worship and wisdom</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Psalms - Songs of worship</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Proverbs - Understanding society</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Ecclesiastes - Understanding life</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Song of Solomon - Understanding love</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Major Prophets</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Isaiah - Judgement brings hope</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Jeremiah - Warnings of Judgement</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Lamentations - Jerusalem\'s destruction</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Ezekiel - Judgement brings new life</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Daniel - Witnessing in exile</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Minor (brief) Prophets</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Hosea - Acting out God\'s love</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Joel - Day of the Lord</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Amos - Judgement is inescapable</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Obadiah - Judgement on Edom</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Jonah - Anyone can repent</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Micah - Judgement\'s restoration</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Nahum - Judgement on Nineveh</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Habakkuk - Judgement on evil</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Zephaniah - Judgement\'s remnant</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Haggai - Rebuilding the temple</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Zechariah - Repentance after exile</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Malachi - God is coming</p>' +
            '</div>' +
            '<br><span class="stepFgBg" style="font-size:16px"><b>New Testament</b></span>' +
            '<div>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Life of Jesus</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Matthew - Jesus the Messiah</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Mark - Jesus the Man</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Luke - Jesus the Saviour</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">John - Jesus is God</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Acts - Church growth</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Pauline letters to churches</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Romans - Paul\'s theology</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Corinthians - Church problems</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Corinthians - Leadership problems</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Galatians - Freedom from Law</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Ephesians - Church unity</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Philippians - Encouragement</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Colossians - Christian lifestyle</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Thessalonians - Expecting the End</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Thessalonians - The End delayed</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Pauline letters to individuals</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Timothy - False teachings</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Timothy - Paul\'s farewell</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Titus - A difficult ministry</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Philemon - Slaves as brothers</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Letters from others</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Hebrews - Jewish Christianity</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">James - Trials of faith</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 Peter - Life among unbelievers</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 Peter - Peter\'s farewell</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">1 John - God loves us</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">2 John - Love each other</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">3 John - Practical love</p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px">Jude - Deserters</p>' +
            '<p style="margin-left:5%;font-size:14px;text-align:left;padding:0"><b>Prophecies for the future</b></p>' +
            '<p style="margin-left:10%;height:14px;font-size:14px"">Revelation of John - Visions of the End</p>' +
            '<tr></tr></tbody></table>' +
            '</div>';

        $.ajaxSetup({async: false});
        $.getJSON("html/json/" + osisID.toLowerCase() + ".json", function(summary) {
            var bookSummary =
                '<br><span style="font-size:18px"><b>Book summary of ' + longBookName + '</b></span><br>' +
                '<span style="font-size:16px">' +
                    '<p style="border:2px solid grey;padding:5px">' + summary.book_description + '<br><br>' +
                    summary.book_overview + '</p>' +
					'<p style="margin:8px">ESV Introduction:<br>' + summary.ESV_introduction + '</p>' +
                    '<p style="margin:8px">ESV Summary:<br>' + summary.ESV_summary + '</p>' +
                '</span>' +
                '<div class="copyrightInfo">' +
                    'Copyright information for <a href="/version.jsp?version=ESV" target="_new">ESV</a>' +
                '</div>';
            var chptSummary =
                '<br><span style="font-size:18px"><b>Chapter summary of ' + longBookName + ' ' + chapterNum + '</b></span><br>' +
                '<span style="font-size:16px">' +
                    '<p style="border:2px solid grey;padding:5px">' + summary["chapter_" + chapterNum + "_description"] + '<br><br>' +
                    summary["chapter_" + chapterNum + "_overview"] + '</p>' +
                    '<p style="margin:8px">' + summary["chapter_" + chapterNum + "_summary"] + '</p>' +
                '</span><br><br><br>' +
                '<span class="nextPreviousChapterGroup">';
            if (chapterNum > 1) chptSummary +=
                    '<a class="previousChapter" href="javascript:step.util.showSummary(\'' + osisID + '.' + (chapterNum - 1) + '\')">' +
                        '<i class="glyphicon glyphicon-arrow-left"></i>' +
                    '</a>';
            if (chapterNum < step.passageSelect.osisChapterJsword[posOfBook][1]) chptSummary +=
                    '<a class="nextChapter" href="javascript:step.util.showSummary(\'' + osisID + '.' + (chapterNum + 1) + '\')">' +
                        '<i class="glyphicon glyphicon-arrow-right"></i>' +
                    '</a>';
            chptSummary += 
                '</span>';

            $(_.template(
                '<div id="showBookOrChapterSummaryModal" class="modal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content stepModalFgBg"">' +
                            '<script>' +
                            '$(document).keydown(function(event) {' +
                              'if (event.keyCode == 27) {' +
                                'step.util.closeModal("showBookOrChapterSummaryModal");' +
                              '}' +
                            '});' +
                            '</script>' +
                            '<div class="modal-header">' +
								step.util.modalCloseBtn("showBookOrChapterSummaryModal") + '<br>' +
                            '</div>' +
                            '<div class="modal-body" style="text-align:left font-size:16px">' +
                                '<div>' +
                                    '<ul class="nav nav-tabs">' +
                                        '<li class="active"><a href="#chptSummary" data-toggle="tab">Chapter summary</a></li>' +
                                        '<li><a href="#bookSummary" data-toggle="tab">Book summary</a></li>' +
                                        '<li><a href="#bibleSummary" data-toggle="tab">Bible summary</a></li>' +
                                    '</ul>' +
                                    '<div class="tab-content">' +
                                        '<div class="tab-pane fade in active" id="chptSummary">' + chptSummary + '</div>' +
                                        '<div class="tab-pane fade" id="bookSummary">' + bookSummary + '</div>' +
                                        '<div class="tab-pane fade" id="bibleSummary">' + bibleSummary + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            )()).modal("show");
        });
        $.ajaxSetup({async: true});
    },
    setDefaultColor: function(option) {
        var newBtnText;
		var setToDarkMode = false;
		if (option === "flip") {
			if (!step.util.isDarkMode()) setToDarkMode = true;
		}
		else setToDarkMode = step.util.isDarkMode();
   		var rootVar = document.querySelector(':root');
        if (setToDarkMode) {
            rootVar.style.setProperty('--clrText',"#BCC0C3");
            step.settings.save({"clrText":"#BCC0C3"});
            rootVar.style.setProperty('--clrStrongText',"#8ab4f8");
            step.settings.save({"clrStrongText":"#8ab4f8"});
            rootVar.style.setProperty('--clrBackground',"#202124");
            step.settings.save({"clrBackground":"#202124"});
            rootVar.style.setProperty('--clrHighlight',"#c58af9");
            step.settings.save({"clrHighlight":"#c58af9"});
            rootVar.style.setProperty('--clrHighlightBg',"#800080");
            step.settings.save({"clrHighlightBg":"#800080"});
            rootVar.style.setProperty('--clr2ndHover',"#c5d0fb");
            step.settings.save({"clr2ndHover":"#c5d0fb"});
            $('body,html').css('color-scheme','dark');
            newBtnText = "Disable";
        }
        else {
            rootVar.style.setProperty('--clrText',"#5d5d5d");
            step.settings.save({"clrText":"#5d5d5d"});
            rootVar.style.setProperty('--clrStrongText',"#498090");
            step.settings.save({"clrStrongText":"#498090"});
            rootVar.style.setProperty('--clrBackground',"#ffffff");
            step.settings.save({"clrBackground":"#ffffff"});
            rootVar.style.setProperty('--clrHighlight',"#17758F");
            step.settings.save({"clrHighlight":"#17758F"});
            rootVar.style.setProperty('--clrHighlightBg',"#17758F");
            step.settings.save({"clrHighlightBg":"#17758F"});
            rootVar.style.setProperty('--clr2ndHover',"#d3d3d3");
            step.settings.save({"clr2ndHover":"#d3d3d3"});
            $('body,html').css('color-scheme','normal');
            newBtnText = "Enable";
        }
        rootVar.style.setProperty('--clrLexiconFocusBG',"#c8d8dc");
        step.settings.save({"clrLexiconFocusBG":"#c8d8dc"});
        rootVar.style.setProperty('--clrRelatedWordBg',"#b2e5f3");
        step.settings.save({"clrRelatedWordBg":"#b2e5f3"});
        $('#darkModeBtn').text(newBtnText);
		if (option !== "close") step.util.showFontSettings();
    },
	switchColorMode: function () {
		if (step.colorUpdateMode) step.colorUpdateMode = false;
		else step.colorUpdateMode = true;
		step.util.showFontSettings();
	},
    showFontSettings: function (panelNumber) {
        var element = document.getElementById('fontSettings');
        if (element) element.parentNode.removeChild(element);
		$(".modal-backdrop.in").remove();
        var colorReady = !(false || !!document.documentMode); // not Internet Explorer are not compatible with out color code
		var darkModeReady = colorReady; // Internet Explorer is not ready for dark mode
		var ua = navigator.userAgent.toLowerCase();
		var pos = Math.max(ua.indexOf("ipad"), ua.indexOf("iphone"));
		if ((pos > -1) && (ua.substr(pos + 4).search(/ cpu os [345678]_/) > -1)) { // older versions of iOS are not compatible with out color code
			colorReady = false;
			darkModeReady = false;
		}
		if ((pos > -1) && (ua.substr(pos + 4).search(/ cpu os 9_/) > -1)) { // older versions of iOS 9 can run in dark mode, but not the best with displaying updated colors in the font modal.
			colorReady = false;
		}
		else if (ua.search(/android [1234]\./) > -1) { // older versions of Android are not compatible with out color code, but compatible with dark mode
			colorReady = false;
		}
		var panelNumArg = "";
		var styleForColorExamples = "";
		if (typeof panelNumber === "number") {
			panelNumArg =  ", " + panelNumber;
			styleForColorExamples = 'display:none';
		}
        var darkModeEnabled = step.util.isDarkMode();

		var modalHTML = '<div id="fontSettings" class="modal selectModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
			'<div class="modal-dialog" style="width:350px">' +
				'<div class="modal-content stepModalFgBg">';
		if (colorReady) modalHTML +=
					'<link rel="stylesheet" href="css/spectrum.css">' +
					'<script src="libs/spectrum.js"></script>' +
					'<script src="libs/tinycolor-min.js"></script>';
		modalHTML +=
					'<script>' +
						'$(document).ready(function () {' +
							'showFontSizeBtns("defaultfont"' + panelNumArg + ');' +
							'showFontSizeBtns("hbFont"' + panelNumArg + ');' +
							'showFontSizeBtns("unicodeFont"' + panelNumArg + ');' +
							'showFontSizeBtns("arabicFont"' + panelNumArg + ');' +
							'showFontSizeBtns("burmeseFont"' + panelNumArg + ');' +
							'showFontSizeBtns("chineseFont"' + panelNumArg + ');' +
							'showFontSizeBtns("copticFont"' + panelNumArg + ');' +
							'showFontSizeBtns("farsiFont"' + panelNumArg + ');' +
							'showFontSizeBtns("khmerFont"' + panelNumArg + ');' +
							'showFontSizeBtns("syriacFont"' + panelNumArg + ');';

		if (colorReady) modalHTML +=
							'var color = step.settings.get("clrHighlight");' +
							'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
							'var closeButton = $("#fontSettings").find("button.close");' +
							'if (closeButton.length == 1) $(closeButton[0]).attr("onclick", "closeFontSetting(\'" + color + "\')");' +
							'color = step.settings.get("clrText");' +
							'$("#clrText").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrText").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrText");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrText").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrText");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#5D5D5D";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrText");' +
								'}' +
							'});' +
							'color = step.settings.get("clrBackground");' +
							'$("#clrBackground").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrBackground").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrBackground");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrBackground").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrBackground");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#ffffff";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrBackground");' +
								'}' +
							'});' +
							'color = step.settings.get("clrStrongText");' +
							'$("#clrStrongText").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrStrongText").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrStrongText");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrStrongText").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrStrongText");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrStrongText");' +
								'}' +
							'});' +
							'color = step.settings.get("clrHighlight");' +
							'$("#clrHighlight").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'showPalette: true,' +
								'palette: [' +
									'["rgb(23, 117, 143);", "green"],' +
									'["rgb(172, 9, 35);", "rgb(110, 11, 116);"]' +
								'],' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrHighlight").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrHighlight");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrHighlight").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrHighlight");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrHighlight");' +
								'}' +
							'});' +
							'color = step.settings.get("clrHighlightBg");' +
							'$("#clrHighlightBg").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrHighlightBg").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrHighlightBg");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrHighlightBg").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrHighlightBg");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrHighlightBg");' +
								'}' +
							'});' +
							'color = step.settings.get("clr2ndHover");' +
							'$("#clr2ndHover").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clr2ndHover").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clr2ndHover");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clr2ndHover").spectrum("get").toHexString();' +
									'var color = step.settings.get("clr2ndHover");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#d3d3d3";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clr2ndHover");' +
								'}' +
							'});' +
							'color = step.settings.get("clrLexiconFocusBG");' +
							'$("#clrLexiconFocusBG").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrLexiconFocusBG").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrLexiconFocusBG");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrLexiconFocusBG").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrLexiconFocusBG");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrLexiconFocusBG");' +
								'}' +
							'});' +
							'color = step.settings.get("clrRelatedWordBg");' +
							'$("#clrRelatedWordBg").spectrum({' +
								'color: color,' +
								'clickoutFiresChange: false,' +
								'change: function(color) {' +
									'var currentClrPicker = $("#clrRelatedWordBg").spectrum("get").toHexString();' +
									'setColor(currentClrPicker, "clrRelatedWordBg");' +
								'},' +
								'show: function(color) {' +
									'var currentClrPicker = $("#clrRelatedWordBg").spectrum("get").toHexString();' +
									'var color = step.settings.get("clrRelatedWordBg");' +
									'if (!((typeof color === "string") && (color.length == 7))) color = "#17758F";' +
									'if (color != currentClrPicker) setColor(currentClrPicker, "clrRelatedWordBg");' +
								'}' +
							'});' +
							'if (step.colorUpdateMode) $(".adClr").show();' +
							'else $(".adClr").hide();';

		modalHTML +=	'}); ' +
						'function showFontSizeBtns(fontName, panelNumber) {' +
							'var currentFontSize = step.util.getFontSize(fontName, panelNumber);' +
							'if (currentFontSize > 0) {' +
								'$("#" + fontName + "Btn").find("." + fontName).css("font-size", currentFontSize);' +
								'$("#" + fontName + "Size").text("(" + currentFontSize + "px)");' +
								'$("#" + fontName + "Btn").show();' +
							'}' +
						'}';

		if (colorReady) modalHTML +=
						'function setColor(baseColor, colorName) {' +
							'if (!((typeof baseColor === "string") && (baseColor.length == 7) && (baseColor.substr(0,1) === "#"))) baseColor = "#17758F";' +
                            'var darkMode = step.util.isDarkMode();' +
							'colorVarName = colorName;' +
							// 'if (step.colorUpdateMode) {' +
								// 'if (darkMode) {' +
									// 'if (tinycolor(baseColor).getLuminance() < 0.14) {' +
										// 'alert("Color selected does not provide enough contrast and can be difficult to read.  Please select a brighter color.");' +
										// 'return;' +
									// '}' +
								// '}' +
								// 'else {' +
									// 'if (tinycolor(baseColor).getLuminance() > 0.3) {' +
										// 'alert("Color selected does not provide enough contrast and can be difficult to read.  Please select a darker color.");' +
										// 'return;' +
									// '}' +
								// '}' +
							// '}' +

							'var rootVar = document.querySelector(":root");' +
							'rootVar.style.setProperty("--" + colorVarName, baseColor);' +
				            'var obj = {};' +
							'obj[colorVarName] = baseColor;' +
							'step.settings.save(obj);' +

							'if ((colorVarName === "clrHighlightBg") && (!step.colorUpdateMode)) {' +
								'rootVar.style.setProperty("--clrHighlightBg",baseColor);' +
								'step.settings.save({"clrHighlightBg":baseColor});' +

								'var t = tinycolor(baseColor);' +
								'var hsl = t.toHsl();' +
								'var colorH = hsl["h"];' +
								'var colorS = hsl["s"] * 100;' +
								'var colorL = hsl["l"] * 100;' +

								'var desaturate = colorS - 40;' +
								'var desColor = tinycolor("hsl(" + colorH + ", " + desaturate + "%, " + colorL + "%)");' +
								'var desHsl = desColor.toHsl();' +
								'var desColorH = desHsl["h"];' +
								'var desColorS = desHsl["s"] * 100;' +
								'var desColorL = desHsl["l"] * 100;' +

								'var lightHex = baseColor;' +
								'if (!darkMode) {' +
									'var lighten = desColorL + 10;' +
									'var lightColor = tinycolor("hsl(" + desColorH + ", " + desColorS + "%, " + lighten + "%)");' +
									'var lightHex = lightColor.toHexString();' +
								'}' +
								'rootVar.style.setProperty("--clrStrongText",lightHex);' +
								'step.settings.save({"clrStrongText":lightHex});' +

								'desaturate = colorS - 50;' +
								'desColor = tinycolor("hsl(" + colorH + ", " + desaturate + "%, " + colorL + "%)");' +
								'desHsl = desColor.toHsl();' +
								'desColorH = desHsl["h"];' +
								'desColorS = desHsl["s"] * 100;' +
								'desColorL = desHsl["l"] * 100;' +

								'lighten = desColorL + 50;' +
								'lightColor = tinycolor("hsl(" + desColorH + ", " + desColorS + "%, " + lighten + "%)");' +
								'lightHex = lightColor.toHexString();' +
								'rootVar.style.setProperty("--clrLexiconFocusBG",lightHex);' +
								'step.settings.save({"clrLexiconFocusBG":lightHex});' +

								'lighten = colorL + 55;' +
								'lightColor = tinycolor("hsl(" + colorH + ", " + colorS + "%, " + lighten + "%)");' +
								'lightHex = lightColor.toHexString();' +
								'rootVar.style.setProperty("--clrRelatedWordBg",lightHex);' +
								'step.settings.save({"clrRelatedWordBg":lightHex});' +
							'}' +
							'step.util.showFontSettings();' +
						'}';

		modalHTML +=	'function closeFontSetting(baseColor) {' +
							'if ((typeof baseColor === "string") && (baseColor.length == 7)) {' +
								'if ((baseColor === "#17758F") || (baseColor === "#c58af9")) step.util.setDefaultColor("close");' +
								'else setColor(baseColor);' +
							'}' +
							'$(".sp-container").remove();' + // The color selection tool is not totally removed so manually remove it. 08/19/2019
							'step.util.closeModal("fontSettings");' +
							'$(".modal-backdrop.in").remove();' + // The color selection tool is not totally removed so manually remove it. 05/15/2021
						'}' +
					'</script>' +
					'<div class="modal-header">' +
						'<span><b>' + 
                            ((typeof panelNumber === "number") ? __s.update_font_in_current_panels : __s.update_font_in_all_panels) +
                        '</b></span>' +
						step.util.modalCloseBtn(null, "closeFontSetting") +
					'</div>' +
					'<div class="modal-body" style="text-align:center">' +
						'<table style="height:auto;width:95%">' +
							'<tr>' +
								'<th style="width:70%">' +
								'<th style="width:30%">' +
							'</tr>' +
                            '<tr id="defaultfontBtn" style="display:none">' +
								'<td class="passageContent defaultfont">' + __s.default_font + ' <span id="defaultfontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'defaultfont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'defaultfont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="hbFontBtn" style="display:none">' +
								'<td class="passageContent hbFont">' + __s.hebrew + ': חֶ֫סֶד <span id="hbFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'hbFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'hbFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="unicodeFontBtn" style="display:none">' +
								'<td class="passageContent unicodeFont">' + __s.greek + ': Ἀγαπητοί <span id="unicodeFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'unicodeFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'unicodeFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="arabicFontBtn" style="display:none">' +
								'<td class="passageContent arabicFont">Arabic: أَيُّهَا الأَحِبَّاءُ، <span id="arabicFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'arabicFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'arabicFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="burmeseFontBtn" style="display:none">' +
								'<td class="passageContent burmeseFont">(ချစ်သူတို့၊) မြန်မာ <span id="burmeseFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'burmeseFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'burmeseFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="chineseFontBtn" style="display:none">' +
								'<td class="passageContent chineseFont">Chinese: 亲爱的弟兄 <span id="chineseFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'chineseFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'chineseFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="copticFontBtn" style="display:none">' +
								'<td class="passageContent copticFont">Coptic: ϯⲡⲁⲣⲁⲕⲁⲗⲉⲓ <span id="copticFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'copticFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'copticFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="farsiFontBtn" style="display:none">' +
								'<td class="passageContent farsiFont">Farsi: برادران‌ عزيز <span id="farsiFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'farsiFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'farsiFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="khmerFontBtn" style="display:none">' +
								'<td class="passageContent khmerFont">Khmer: ​ទី​ស្រលាញ់ <span id="khmerFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'khmerFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'khmerFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr id="syriacFontBtn" style="display:none">' +
								'<td class="passageContent syriacFont">Syriac: ܚܒܝܒܝ ܒܥܐ <span id="syriacFontSize"></span></td>' +
								'<td class="pull-right">' +
									'<button class="btn btn-default btn-sm" type="button" title="Decrease font size" onclick="step.util.changeSpecificFontSize(\'syriacFont\', -1' + panelNumArg + ')" title="' + __s.passage_smaller_fonts + '"><span style="font-size:8px;line-height:12px">A -</span></button>' +
									'<button class="btn btn-default btn-sm" type="button" title="Increase font size" onclick="step.util.changeSpecificFontSize(\'syriacFont\', 1' + panelNumArg + ')" title="' + __s.passage_larger_fonts + '"><span style="font-size:10px;line-height:12px;font-weight:bold">A +</span></button>' +
								'</td>' +
							'</tr>';

		if ((darkModeReady) && ((typeof panelNumber !== "number")))
			modalHTML +=
							'<tr>' +
								'<td class="passageContent defaultfont">' + __s.dark_mode + '</td>' +
								'<td class="pull-right">' +
									'<button id="darkModeBtn" class="btn btn-default btn-sm' +
                                        ((darkModeEnabled) ? ' stepPressedButton' : '') +
                                        '" type="button" title="Dark mode" onclick="step.util.setDefaultColor(\'flip\')"><span style="font-size:10px;line-height:12px;font-weight:bold">' +
                                        ((darkModeEnabled) ? 'Disable' : 'Enable') +
                                        '</span></button>' +
								'</td>' +
							'</tr>';
		if ((colorReady) && ((typeof panelNumber !== "number")))
			modalHTML +=
							'<tr>' +
								'<td class="passageContent defaultfont">Advanced color update:</td>' +
								'<td class="pull-right">' +
									'<button id="colorUpdateMode" class="btn btn-default btn-sm' +
                                        ((step.colorUpdateMode) ? ' stepPressedButton' : '') +
                                        '" type="button" title="Color mode" onclick="step.util.switchColorMode()"><span style="font-size:10px;line-height:12px;font-weight:bold">' +
                                        ((step.colorUpdateMode) ? 'Disable' : 'Enable') +
                                        '</span></button>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.text_with_no_highlight + '</td>' +
								'<td class="pull-right">' +
									'<input id="clrText" type="color" value="#5D5D5D"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.background_color + '</td>' +
								'<td class="pull-right">' +
									'<input id="clrBackground" type="color" value="#ffffff"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_text + ' 1</td>' +
								'<td class="pull-right">' +
									'<input id="clrStrongText" type="color" value="#17758f"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_text + ' 2</td>' +
								'<td class="pull-right">' +
									'<input id="clrHighlight" type="color" value="#498090"/>' +
								'</td>' +
							'</tr>' +
							'<tr style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_background + ' 1</td>' +
								'<td class="pull-right">' +
									'<input id="clrHighlightBg" type="color" value="#498090"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_background + ' 2</td>' +
								'<td class="pull-right">' +
									'<input id="clr2ndHover" type="color" value="#d3d3d3"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_for_lexicon + '</td>' +
								'<td class="pull-right">' +
									'<input id="clrLexiconFocusBG" type="color" value="#C8D8DC"/>' +
								'</td>' +
							'</tr>' +
							'<tr class="adClr" style="' + styleForColorExamples + '">' +
								'<td>' + __s.highlighted_for_related_text + '</td>' +
								'<td class="pull-right">' +
									'<input id="clrRelatedWordBg" type="color" value="#B2E5F3"/>' +
								'</td>' +
							'</tr>';

		modalHTML +=
						'</table>' +
						'<br>';

		if (colorReady) modalHTML +=
						'<span>' +
							'<p style="text-align:left;font-size:18px;' + styleForColorExamples + '">' + __s.examples_for_the_selected_color + '</p>' +
							'<p class="passageContent" style="' + styleForColorExamples + '">' + __s.text_with_no_highlight + '</p>' +
							'<p class="passageContent" style="color:var(--clrStrongText);' + styleForColorExamples + '">' + __s.highlighted_text + ' 1</p>' +
							'<p class="passageContent" style="color:var(--clrHighlight);' + styleForColorExamples + '">' + __s.highlighted_text + ' 2</p>' +
							'<p class="passageContent primaryLightBg" style="' + styleForColorExamples + '">' + __s.highlighted_background + ' 1</p>' +
							'<p class="passageContent secondaryBackground" style="' + styleForColorExamples + '">' + __s.highlighted_background + ' 2</p>' +
							'<p class="passageContent lexiconFocus" style="' + styleForColorExamples + '">' + __s.highlighted_for_lexicon + '</p>' +
							'<p class="passageContent relatedWordEmphasisHover" style="' + styleForColorExamples + '">' + __s.highlighted_for_related_text + '</p>' +
						'</span>';

		modalHTML +=
						'<div class="footer">' +
							'<button class="stepButton pull-right" data-dismiss="modal" onclick=closeFontSetting()><label>' + __s.ok + '</label></button>';
		if (colorReady) modalHTML +=
							'<button class="stepButton pull-right" style="' + styleForColorExamples + '" onclick=step.util.setDefaultColor()><label>' + __s.original_color + '</label></button>';
		modalHTML +=
						'</div>' +
						'<br>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
        $(_.template(modalHTML)()).modal("show");
    },
    startPickBible: function () {
        require(["menu_extras"], function () {
            new PickBibleView({model: step.settings, searchView: self});
        });
    },
	setClassicalUI: function (classicalUI) {
		if (classicalUI) {
			$('#top_input_area').show();
			// $('#s2id_masterSearch').show();
			// $('.findButton').show();
			$('span.tmp-rm-hidden-xs.title').removeClass('tmp-rm-hidden-xs').addClass('hidden-xs');
			$('.navbarIconDesc').hide();
			$('.quick_tutorial').show();
			$('#classicalUICheck').show();
		}
		else {
			$('#top_input_area').hide();
			$('span.hidden-xs.title').removeClass('hidden-xs').addClass('tmp-rm-hidden-xs');
			$('.navbarIconDesc').show();
			$('.quick_tutorial').hide();
			$('#classicalUICheck').hide();
		}
	},
	// adjustPassageOptionHeight: function (passageContainer) {
		// var passageContainerHeight = passageContainer.height();
		// var passageOptionHeight = passageContainer.find(".passageOptionsGroup").height();
		// if (passageOptionHeight === null) return;
		// var passageContentHeight = passageContainer.find(".passageContent").height();
		// var totalHeight = passageOptionHeight + passageContentHeight;
		// var diff = passageContainerHeight - totalHeight;
		// if (Math.abs(diff) > 10) {
			// var heightForPassage = passageContainerHeight + diff;
			// console.log("passageContent h: " + heightForPassage + " diff " + diff);
			// var passContent = passageContainer.find(".passageContent");
			// $(passContent).css({'height':heightForPassage + 'px'});
		// }
	// },
	showIntro: function (showAnyway) {
		if ((!showAnyway) && (($.getUrlVars().indexOf("skipwelcome") > -1) || (step.state.isLocal()))) return;
	    var introCountFromStorageOrCookie = (window.localStorage) ? window.localStorage.getItem("step.usageCount") : $.cookie('step.usageCount');
		var introCount = parseInt(introCountFromStorageOrCookie, 10);
		if (isNaN(introCount)) introCount = 0;
		if ((introCount <= 1) || (showAnyway)) {
			var introJsSteps = [
				{
					intro: __s.introjs_intro
				},
				{
					element: document.querySelector('.passageContainer.active').querySelector('.select-version.stepButtonTriangle'),
					intro: __s.introjs_bible,
					position: 'bottom'
				},
				{
					element: document.querySelector('.passageContainer.active').querySelector('.select-reference.stepButtonTriangle'),
					intro: __s.introjs_passage,
					position: 'bottom'
				}
			];
			if (window.innerWidth > 499) introJsSteps.push(
				{
					element: document.querySelector('.passageContainer.active').querySelector('.select-search.stepButtonTriangle'),
					intro: __s.introjs_search,
					position: 'bottom'
				});
			introJs().setOptions({
				steps: introJsSteps, nextLabel: " > ", prevLabel: " < ", doneLabel: __s.done
			}).start();
		}
	},
    showIntroOfMultiVersion: function () {
		if ($.getUrlVars().indexOf("skipwelcome") > -1) return;
	    var introCountFromStorageOrCookie = (window.localStorage) ? window.localStorage.getItem("step.multiVersionCount") : $.cookie('step.multiVersionCount');
		var introCount = parseInt(introCountFromStorageOrCookie, 10);
		if (isNaN(introCount)) introCount = 0;
		if ((window.innerWidth > 499) && (introCount < 1)) {
			var introJsSteps = [
				{
					element: document.querySelector('.passageContainer.active').querySelector('.dropdown.settingsDropdown'),
					intro: __s.introjs_multi_version,
					position: 'left'
				}
            ];
			introJs().setOptions({
				steps: introJsSteps
			}).start();
       		introCount ++;
            if (window.localStorage) window.localStorage.setItem("step.multiVersionCount", introCount);
            else $.cookie('step.multiVersionCount', introCount);
		}
	},
	closeModal: function (modalID) {
        var element = document.getElementById(modalID);
		if (element) {	
			$('#' + modalID).modal('hide');
			$('#' + modalID).modal({
				show: false
			});
			if ((element.parentNode) && (modalID !== "raiseSupport")) element.parentNode.removeChild(element);
		}
    },
	addTagLine: function(){
		var numOfBibleDisplayed = $('.list-group-item:visible').length;
		var numOfBibleInMostWidelyUsed = $('.ul_Most_widely_used').find('.list-group-item:visible').length;
		if (numOfBibleDisplayed > numOfBibleInMostWidelyUsed)
			numOfBibleDisplayed -= numOfBibleInMostWidelyUsed; // The most widely used can be included in other language groups 
		$(".tagLine").text(sprintf(__s.filtering_total_bibles_and_commentaries, numOfBibleDisplayed, step.itemisedVersions.length));
    },
	showByGeo: function(testMode) { // The following arrays need to be updated when new Bible with additional language codes are added.
		var africa_lang = [
			"af",  // Afrikaans
			"am",  // Amharic
			"ar",  // Arabic
			"ee",  // Ewe
			"ewe", // Ewe *
			"lg",  // Ganda
			"gbr", // Gbagyi
			"gez", // Geez
			"ha",  // Hausa
			"hau", // Hausa
			"ig",  // Igbo
			"kpo", // Ikposo
			"ki",  // Kikuyu
			"las", // Lama (Togo)
			"ln",  // Lingala
			"lpx", // Lopit
			"mg",  // Malagasy
			"plt", // Malagasy, Plateau
			"hna", // Mina (Cameroon)
			"nhr", // Naro
			"nd",  // North Ndebele
			"ny",  // Nyanja
			"pt",  // Portuguese
			"sn",  // Shona
			"so",  // Somali
			"sw",  // Swahili
			"swa", // Swahili *
			"swh", // Swahili (individual language) *
			"tn",  // Tswana
			"tw",  // Twi
			"twi", // Twi *
			"yom", // Yombe
			"yor", // Yoruba
			"en",  // English
			"fr",  // French
			"fre", // French *
			"es"   // Spanish
		];
		var americas_lang = [
			"acr", // Achi
			"rmq", // Caló
			"chr", // Cherokee
			"en",  // English
			"ht",  // Haitian
			"kek", // Kekchí
			"pt",  // Portuguese
			"pot", // Potawatomi
			"ser", // Serrano
			"es",  // Spanish
			"fr",  // French
			"fre"  // French *
		];
		var east_asia_lang = [
			"zh", // Chinese
			"ko", // Korean
			"mn", // Mongolian
			"en"  // English
		];
		var europe_lang = [
			"sq",  // Albanian
			"eu",  // Basque
			"br",  // Breton
			"bg",  // Bulgarian
			"bul", // Bulgarian
			"cu",  // Church Slavic
			"hr",  // Croatian
			"hrv", // Croatian *
			"cs",  // Czech
			"da",  // Danish
			"nl",  // Dutch
			"en",  // English
			"enm", // English Middle
			"eo",  // Esperanto
			"et",  // Estonian
			"fo",  // Faroese
			"fi",  // Finnish
			"fr",  // French
			"fre", // French *
			"de",  // German
			"got", // Gothic
			"el",  // Greek
			"grc", // Greek, Ancient (to 1453)
			"hu",  // Hungarian
			"hun", // Hungarian *
			"is",  // Icelandic
			"ga",  // Irish
			"it",  // Italian
			"la",  // Latin
			"lv",  // Latvian
			"lt",  // Lithuanian
			"gv",  // Manx
			"nb",  // Norwegian Bokmål
			"nn",  // Norwegian Nynorsk
			"pl",  // Polish
			"pt",  // Portuguese
			"ro",  // Romanian
			"ru",  // Russian
			"gd",  // Scottish Gaelic
			"sr",  // Serbian
			"sl",  // Slovenian
			"es",  // Spanish
			"sv",  // Swedish
			"uk",  // Ukrainian
			"cy"   // Welsh
		];
		var oceania_lang = [
			"aau", // Abau
			"adz", // Adzera
			"agd", // Agarabi
			"amp", // Alamblak
			"gah", // Alekano
			"amm", // Ama (Papua New Guinea)
			"amn", // Amanab
			"tvk", // Ambrym, Southeast
			"abt", // Ambulas
			"aey", // Amele
			"aby", // Aneme Wake
			"agm", // Angaataha
			"akh", // Angal Heneng
			"agg", // Angor
			"boj", // Anjam
			"aak", // Ankave
			"aui", // Anuki
			"aon", // Arapesh, Bumbita
			"mwc", // Are
			"aai", // Arifama-Miniafia
			"msy", // Aruamu
			"avt", // Au
			"kud", // 'Auhelawa
			"awb", // Awa (Papua New Guinea)
			"awx", // Awara
			"auy", // Awiyaana
			"ptu", // Bambam
			"bbb", // Barai
			"mlp", // Bargam
			"bch", // Bariai
			"byr", // Baruya
			"bef", // Benabena
			"big", // Biangai
			"bhl", // Bimin
			"bon", // Bine
			"bjr", // Binumarien
			"bnp", // Bola
			"ksr", // Borong
			"mux", // Bo-Ung
			"mmo", // Buang, Mangga
			"bzh", // Buang, Mapos
			"buk", // Bugawac
			"ape", // Bukiyip
			"bdd", // Bunama
			"tte", // Bwanabwana
			"ch",  // Chamorro
			"caa", // Chortí
			"cjv", // Chuave
			"mps", // Dadibi
			"dgz", // Daga
			"aso", // Dano
			"dww", // Dawawa
			"ded", // Dedua
			"dob", // Dobu
			"kqc", // Doromu-Koki
			"etr", // Edolo
			"enq", // Enga
			"pwg", // Gapapaiwa
			"bmk", // Ghayavi
			"bbr", // Girawa
			"gvf", // Golin
			"ghs", // Guhu-Samane
			"dah", // Gwahatike
			"hla", // Halia
			"wos", // Hanga Hundi
			"hmo", // Hiri Motu
			"hot", // Hote
			"hui", // Huli
			"yml", // Iamalele
			"ian", // Iatmul
			"viv", // Iduna
			"imo", // Imbongu
			"ino", // Inoke-Yate
			"ipi", // Ipili
			"kbm", // Iwal
			"iws", // Iwam, Sepik
			"nca", // Iyo
			"kqf", // Kakabai
			"kmh", // Kalam
			"bco", // Kaluli
			"kms", // Kamasau
			"xla", // Kamula
			"soq", // Kanasi
			"kqw", // Kandas
			"gam", // Kandawo
			"kmu", // Kanite
			"kpg", // Kapingamarangi
			"leu", // Kara (Papua New Guinea)
			"yuj", // Karkar-Yuri
			"kmg", // Kâte
			"khz", // Keapara
			"bmh", // Kein
			"kjs", // Kewa, East
			"kew", // Kewa, West
			"kyg", // Keyagana
			"kpw", // Kobon
			"kpx", // Koiali, Mountain
			"kpf", // Komba
			"xbi", // Kombio
			"kpr", // Korafe-Yegha
			"kze", // Kosena
			"ksd", // Kuanua
			"kgf", // Kube
			"kue", // Kuman
			"kup", // Kunimaipa
			"kto", // Kuot
			"tnk", // Kwamera
			"kwj", // Kwanga
			"kmo", // Kwoma
			"kyc", // Kyaka
			"lbb", // Label
			"uvl", // Lote
			"mmx", // Madak
			"mzz", // Maiadomu
			"mti", // Maiwa (Papua New Guinea)
			"mva", // Manam
			"mbh", // Mangseng
			"mi",  // Maori
			"mlh", // Mape
			"dad", // Marik
			"klv", // Maskelynes
			"mhl", // Mauwake
			"mna", // Mbula
			"mek", // Mekeo
			"med", // Melpa
			"sim", // Mende (Papua New Guinea)
			"mee", // Mengen
			"mpt", // Mian
			"mpp", // Migabac
			"mpx", // Misima-Panaeati
			"mox", // Molima
			"meu", // Motu
			"aoj", // Mufian
			"emi", // Mussau-Emira
			"tuc", // Mutu
			"myw", // Muyuw
			"nas", // Naasioi
			"naf", // Nabak
			"nak", // Nakanai
			"nss", // Nali
			"nvm", // Namiae
			"nsn", // Nehan
			"nif", // Nek
			"nbq", // Nggem
			"nii", // Nii
			"gaw", // Nobonob
			"nop", // Numanggang
			"lid", // Nyindrou
			"kkc", // Odoodee
			"opm", // Oksapmin
			"ong", // Olo
			"aom", // Ömie
			"okv", // Orokaiva
			"pma", // Paama
			"ptp", // Patep
			"gfk", // Patpatar
			"ata", // Pele-Ata
			"pon", // Pohnpeian
			"byx", // Qaqet
			"rai", // Ramoaaina
			"rwo", // Rawa
			"roo", // Rotokas
			"apz", // Safeyoka
			"sbe", // Saliba
			"sll", // Salt-Yui
			"ssx", // Samberigi
			"sny", // Saniyo-Hiyewe
			"sps", // Saposa
			"ssg", // Seimat
			"spl", // Selepet
			"snp", // Siane
			"snc", // Sinaugoro
			"xsi", // Sio
			"ssd", // Siroi
			"bmu", // Somba-Siawari
			"swp", // Suau
			"sue", // Suena
			"sua", // Sulka
			"sgz", // Sursurunga
			"knv", // Tabo
			"tbg", // Tairora, North
			"omw", // Tairora, South
			"tbc", // Takia
			"tgg", // Tangga
			"tgp", // Tangoa
			"tnn", // Tanna, North
			"nwi", // Tanna, Southwest
			"tpa", // Taupota
			"tbo", // Tawala
			"tlf", // Telefol
			"tim", // Timbe
			"tpz", // Tinputz
			"tpi", // Tok Pisin
			"iou", // Tuma-Irumu
			"lcm", // Tungag
			"ubr", // Ubir
			"gdn", // Umanakaina
			"ubu", // Umbu-Ungu
			"wnu", // Usan
			"usa", // Usarufa
			"waj", // Waffa
			"rro", // Waima
			"wnc", // Wantoat
			"wrs", // Waris
			"wsk", // Waskia
			"wed", // Wedau
			"wer", // Weri
			"gdr", // Wipi
			"wiu", // Wiru
			"wuv", // Wuvulu-Aua
			"jae", // Yabem
			"yrb", // Yareba
			"yuw", // Yau (Morobe Province)
			"yby", // Yaweyuha
			"yle", // Yele
			"yss", // Yessan-Mayo
			"yon", // Yongkom
			"yut", // Yopno
			"zia", // Zia
			"en",  // English
			"fr",  // French
			"fre"  // French *
		];
		var south_asia_lang = [
			"asm", // Assamese
			"ben", // Bengali
			"hne", // Chhattisgarhi
			"guj", // Gujarati
			"hi",  // Hindi
			"kan", // Kannada
			"ckb", // Kurdish, Central
			"kpb", // Kurumba, Mullu
			"mar", // Marathi
			"nep", // Nepali
			"ori", // Oriya
			"pan", // Panjabi
			"fa",  // Persian
			"pes", // Persian, Iranian
			"tam", // Tamil
			"tel", // Telugu
			"ur",  // Urdu
			"urd", // Urdu *
			"en"   // English
		];
		var southeast_asia_lang = [
			"my",  // Burmese
			"ceb", // Cebuano
			"khm", // Central Khmer
			"hil", // Hiligaynon
			"ilo", // Iloko
			"id",  // Indonesian
			"ind", // Indonesian *
			"ml",  // Malayalam
			"mal", // Malayalam *
			"ury", // Orya
			"sml", // Sama, Central
			"tl",  // Tagalog
			"tgl", // Tagalog *
			"th",  // Thai
			"ppk", // Uma
			"vi",  // Vietnamese
			"vie", // Vietnamese *
			"zom", // Zou
			"en",  // English
			"fr",  // French
			"fre", // French *
			"es",  // Spanish
			"zh"   // Chinese
		];
		var western_asia_lang = [
			"ar",  // Arabic
			"hy",  // Armenian
			"az",  // Azerbaijani
			"azb", // Azerbaijani, South
			"cop", // Coptic
			"fa",  // Persian
			"pes", // Persian, Iranian
			"he",  // Hebrew
			"heb", // Hebrew *
			"syr", // Syriac
			"tr",  // Turkish
			"en"   // English
		];
        var arrayToProcess = [];
        if (testMode) { // This has to be called inside the debugger when the modal is showing "All" the languages and they type in, "step.util.showByGeo(true)" in the debugger's console.
						// If the above language codes covers all the Bibles on the web server, it should hide everything.
            $('.langSpan').show();
            $('.langBtn').show();
            $('.langUL').show();
			var tmp = confirm("Make sure you run this in the All languages tab.");
            arrayToProcess = africa_lang.concat(americas_lang).concat(east_asia_lang).concat(europe_lang).concat(oceania_lang)
                .concat(south_asia_lang).concat(southeast_asia_lang).concat(western_asia_lang);
            for (var i = 0; i < arrayToProcess.length; i++) {
                $('.btn_' + arrayToProcess[i]).hide();
                $('.ul_' + arrayToProcess[i]).hide();
            }
			tmp = confirm("All buttons for the different languages and Bibles should be hidden");
        }
        else {
       		var geo = $( ".selectGeo option:selected" ).val();
            if (geo === "all") {
                $('.langSpan').show();
                $('.langBtn').show();
                $('.langUL').hide();
            }
            else {
                if (geo === "africa") arrayToProcess = africa_lang;
                else if (geo === "americas") arrayToProcess = americas_lang;
                else if (geo === "east_south_east_asia") arrayToProcess = east_asia_lang.concat(southeast_asia_lang);
                else if (geo === "europe") arrayToProcess = europe_lang;
                else if (geo === "oceania") arrayToProcess = oceania_lang;
                else if (geo === "south_asia") arrayToProcess = south_asia_lang;
                else if (geo === "western_asia") arrayToProcess = western_asia_lang;
                $('.langSpan').hide();
                $('.langBtn').hide();
                $('.langUL').hide();
                for (var i = 0; i < arrayToProcess.length; i++) {
                    $('.btn_' + arrayToProcess[i]).show();
					$('.span_' + arrayToProcess[i]).show();
                    $('.plusminus_' + arrayToProcess[i]).text('+');
                }
            }
			$('.langBtn').removeClass('stepPressedButton');
        }
		step.util.addTagLine();
	},
  	getDetailsOfStrong: function(strongNum, version) {
        var gloss = strongNum;
        var stepTransliteration = "";
        var matchingForm = "";
        if ((typeof step.srchTxt !== "undefined") &&
            (typeof step.srchTxt[strongNum] !== "undefined") &&
            (step.srchTxt[strongNum].search(/(.+)\s\(<i>(.+)<\/i>\s-\s(.+)\)/) > -1)) {
            gloss = RegExp.$1;
            stepTransliteration = RegExp.$2;
            matchingForm = RegExp.$3;
        }
        else { // get the info from server
            var limitType = "";
            var firstChar = strongNum.substr(0, 1);
            if (firstChar === "G") limitType = GREEK;
            else if (firstChar === "H") limitType = HEBREW;
            if (limitType !== "") {
                var url = SEARCH_AUTO_SUGGESTIONS + strongNum + "/" + VERSION + "%3D" + version + "%7C" + LIMIT + "%3D" + limitType + "%7C?lang=" + step.userLanguageCode;
                var value = $.ajax({ 
                    url: url,
                    async: false
                }).responseText;
                if (value.length > 10) {
                    var data = JSON.parse(value);
                    if ((data.length > 0) && (typeof data[0] !== "undefined") &&
                        (typeof data[0].suggestion !== "undefined")) {
                        if (typeof data[0].suggestion.gloss !== "undefined") 
                            gloss = data[0].suggestion.gloss;
                        if (typeof data[0].suggestion.stepTransliteration !== "undefined") 
                            stepTransliteration = data[0].suggestion.stepTransliteration;
                        if (typeof data[0].suggestion.matchingForm !== "undefined") 
                            matchingForm = data[0].suggestion.matchingForm;
                    }
                }
            }
        }
        return [gloss, stepTransliteration, matchingForm];
    },
    putStrongDetails: function(strongNum, details) {
        if (typeof step.srchTxt === "undefined") step.srchTxt = {};
        if (strongNum.search(/([GH]\d{1,5})[A-Za-z]$/) > -1) strongNum = RegExp.$1; // remove the last character if it is an a-g character
        if ((typeof step.srchTxt[strongNum] === "undefined") || (step.srchTxt[strongNum].length < 7))
            step.srchTxt[strongNum] = details;
    },
	modalCloseBtn: function(modalElementID, closeFunction) {
		// The dark mode color needs to be brighter for X.  The default opacity of 0.2 is too low.
        var opacity = (step.util.isDarkMode()) ? "opacity:0.8" : "";
		var functionForOnClick = 'onclick=step.util.closeModal("' + modalElementID + '")';
		if (typeof closeFunction === "string") {
			if (closeFunction.length > 0) functionForOnClick = 'onclick=' + closeFunction + '()';
			else functionForOnClick = '';
		}
		// the close button could not pickup the stepFgBg class so it has to be added in the style
		return '<button type="button" style="background:var(--clrBackground);color:var(--clrText);' + opacity + '" class="close" ' +
			'data-dismiss="modal" ' + functionForOnClick + '>X</button>';
	},
	isDarkMode: function() {
		var stepBgColor = document.querySelector(':root').style.getPropertyValue("--clrBackground");
		if ((typeof stepBgColor !== "string") || ((stepBgColor.length !== 7) && (stepBgColor.length !== 15))) {
			if ((typeof step.settings === "object") && (typeof step.settings.get === "function")) {
				var color = step.settings.get("clrBackground");
				if (((typeof color === "string") && (color.length == 7) && (color.substr(0,1) === "#")))
					stepBgColor = color;
			}
		}
		if ((stepBgColor === "#202124") || (stepBgColor === "rgb(32, 33, 36)")) return true; // old iPad would return the rgb value
		return false;
	}
}
;
