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
      return (strong || "").replace(/[a-zA-Z]$/, "");
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
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
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
            columns.filter(".active").removeClass("active").find(".activeMarker").remove();

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
            step.util.getPassageContainer(val).addClass("active").append('<span class="activeMarker"></span>');
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
        if (exampleContainer.parent().hasClass("column")) {
            if (allRealColumns.length > 1 || hide) {
                exampleContainer.parent().remove();
            }
        }
        this.refreshColumnSize();
    },
    /**
     * Creates a linked column to the current column
     * @param el
     */
    createNewLinkedColumn: function (passageId) {
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

        step.router.navigatePreserveVersions("reference=" + chapterRef, stripCommentaries);

        //we prevent the event from bubbling up to set the passage id, as we expect a new passage to take focus
        ev.stopPropagation();
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
        newColumn.find(".argSummary").remove();
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
        var passageId = passageModel.get("passageId");
        var key = this.getMainLanguage(passageModel);
        var fontClass = this.ui._getFontClassForLanguage(key) || 'defaultfont';

        var fontSize = step.settings.get(fontClass);
        if (fontSize && fontSize != 0) {
            element.css("font-size", fontSize);
        }
    },
    changeFontSize: function (source, increment) {
        var elements = $(".passageContentHolder", step.util.getPassageContainer(source));
        var passageId = step.passage.getPassageId(source);
        var passageModel = step.passages.findWhere({ passageId: passageId});

        var key = this.getMainLanguage(passageModel);
        var fontClass = this.ui._getFontClassForLanguage(key);
        for (var i = 0; i < elements.length; i++) {
            var fontSize = parseInt($(elements[i]).css("font-size"));
            var newFontSize = fontSize + increment;

            //key it to be the default font, unicodeFont or Hebrew font
            var fontKey = fontClass || 'defaultfont';
            var diff = {};
            diff[fontKey] = newFontSize;
            step.settings.save(diff);
            $(elements[i]).css("font-size", newFontSize);
        }
        passageModel.trigger("font:change");
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
            return '<span class="glyphicon glyphicon-ok ' + classes + '"></span>';
        },
        renderArgs: function (searchTokens, container) {
            if (!container) {
                container = $("<span>");
            }

            if (!searchTokens) {
                return container.html();
            }

            var isMasterVersion = _.where(searchTokens, {tokenType: VERSION }) > 1;
            for (var i = 0; i < searchTokens.length; i++) {
                container.append(step.util.ui.renderArg(searchTokens[i], isMasterVersion));
                if (searchTokens[i].itemType == VERSION) {
                    isMasterVersion = false;
                }
            }

            return container.html();
        },
        renderArg: function (searchToken, isMasterVersion) {
            //a search token isn't quite a item, so we need to fudge a few things
            searchToken.itemType = searchToken.tokenType;
            searchToken.item = searchToken.enhancedTokenInfo;

            //rewrite the item type in case it's a strong number
            if (searchToken.itemType == STRONG_NUMBER) {
                //pretend it's a Greek meaning, or a Hebrew meaning
                searchToken.itemType = (searchToken.item.strongNumber || " ")[0] == 'G' ? GREEK_MEANINGS : HEBREW_MEANINGS;
            } else if (searchToken.itemType == NAVE_SEARCH_EXTENDED || searchToken.itemType == NAVE_SEARCH) {
                searchToken.itemType = SUBJECT_SEARCH;
            }

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
            var result;
            var util = step.util;
            var source = this.getSource(entry.itemType, true) + " ";
            switch (entry.itemType) {
                case REFERENCE:
                    if (entry.item.shortName.length > 20) {
                        var lastComma = entry.item.shortName.substr(0, 17).lastIndexOf(",");
                        if (lastComma < 5) lastComma = 17;
                        entry.item.shortName = entry.item.shortName.substr(0, lastComma) + '...';
                    }
                    result = '<div class="referenceItem" title="' + source + util.safeEscapeQuote(entry.item.fullName) + '" ' +
                        'data-item-type="' + entry.itemType + '" ' +
                        'data-select-id="' + util.safeEscapeQuote(entry.item.osisID) + '">' +
                        entry.item.shortName;

                    result = result + '</div>';
                    return result;

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
                    return entry.item.text;
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

            allStrongElements.click(function () {
                if (!that.touchTriggered) {
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
                that.touchstart = new Date().getTime();
                that.touchTriggered = true;

                if (that.lastTapStrong == $(this).attr("strong")) {
                    $(".lexiconFocus, .lexiconRelatedFocus").removeClass("lexiconFocus lexiconRelatedFocus secondaryBackground");
                    $(this).addClass("lexiconFocus");
                    step.util.ui.showDef(this);
                    step.passage.higlightStrongs({
                        passageId: undefined,
                        strong: $(this).attr('strong'),
                        morph: $(this).attr('morph'),
                        classes: "lexiconFocus"
                    });
                } else {
                    step.passage.higlightStrongs({
                        passageId: undefined,
                        strong: $(this).attr('strong'),
                        morph: $(this).attr('morph'),
                        classes: "primaryLightBg"
                    });

                    var hoverContext = this;
                    require(['quick_lexicon'], function () {
                        step.util.ui._displayNewQuickLexicon(hoverContext, ev, passageId, true);
                    });
                }
                that.lastTapStrong = $(this).attr("strong");
            }).hover(function (ev) {
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
                        step.util.ui._displayNewQuickLexicon(hoverContext, ev, passageId, false);
                        step.util.keepQuickLexiconOpen = false;
                    }, MOUSE_PAUSE, 'show-quick-lexicon');
                });
            }, function () {
                step.passage.removeStrongsHighlights(undefined, "primaryLightBg relatedWordEmphasisHover");
                step.util.delay(undefined, 0, 'show-quick-lexicon');
                if (!step.util.keepQuickLexiconOpen) {
                    $("#quickLexicon").remove();
                }
            });
        },
        _displayNewQuickLexicon: function (hoverContext, ev, passageId, touchEvent) {
            var strong = $(hoverContext).attr('strong');
            var morph = $(hoverContext).attr('morph');
            var reference = step.util.ui.getVerseNumber(hoverContext);
            var version = step.passages.findWhere({passageId: passageId}).get("masterVersion");

            var quickLexiconEnabled = step.passages.findWhere({ passageId: passageId}).get("isQuickLexicon");
            if (quickLexiconEnabled == true || quickLexiconEnabled == null) {
                new QuickLexicon({
                    strong: strong, morph: morph,
                    version: version, reference: reference,
                    target: hoverContext, position: ev.pageY / $(window).height(), touchEvent: touchEvent,
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
            return features;
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
                    var qtip = element.qtip({
                        show: { event: 'mouseenter' },
                        hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
                        position: { my: "bottom center", at: "top center", of: element, viewport: $(window), effect: false },
                        style: { classes: "versePopup" },
                        overwrite: false,
                        content: {
                            text: function (event, api) {
                                //otherwise, exciting new strong numbers to apply:
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
                                                if ((currentLang == "zh") && (strongData._zh_Gloss)) strongData.gloss = strongData._zh_Gloss;
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

                                    api.set('content.text', templatedTable);
                                });
                            }
                        }
                    });

                    qtip.qtip("show");
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
    }
}
;
