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
        return (this.match("^" + str) == nonEscapedString);
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

            $.get(url + langParam, function (data, textStatus, jqXHR) {
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
    refreshWaitStatus: function () {
        var passageContainer = step.util.getPassageContainer(step.util.activePassageId());
        if(this.outstandingRequests > 0) {
            passageContainer.addClass("waiting");
        } else {
            $(".passageContainer").removeClass("waiting");
        }
    },
    squashErrors: function() {
        $("#errorContainer").remove();
    },
    raiseInfo: function (message, level, passageId) {
        //no parsing for info and warning
        if(level == 'error') {
            level = 'danger';
        } else if(level == undefined) {
            level = 'info';
        }
        
        var errorContainer = $("#errorContainer");
        if(errorContainer.length > 0) {
            //will recreate
            errorContainer.remove();
        }

        var errorPopup = $(_.template('<div class="alert alert-error fade in alert-<%= level %>" id="errorContainer">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            '<%= message %></div>')({ message: message, level: level}));
        $("body").append(errorPopup);
        errorPopup.click(function() {
            $(this).remove(); 
        });
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
        var activePassageEl = $(".passageContainer.active");
        var currentActivePassageId;
        if(activePassageEl.length == 0) {
            //default to the first passage that is visible on the screen
            activePassageEl = $(".passageContainer:first");
            //force the setter to trigger 
            currentActivePassageId = val = parseInt(activePassageEl.attr("passage-id"));
        } else {
            currentActivePassageId = parseInt(activePassageEl.attr("passage-id"));
        }
        
        if(typeof val == 'string') {
            val = parseInt(val);
        }
        
        //are we going to set a different passage
        if (val !== null && val !== undefined && val != currentActivePassageId) {
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
                newPassageModel.save({ passageId: val, createSilently: true }, { silent: true });

                //create the click handlers for the passage menu
                new PassageMenuView({
                    model: newPassageModel
                });
            } else {
                //swapping to an existing active passage id already, so sync straight away
                existingModel.trigger("sync-update", existingModel);
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
    /**
     * @param linked true to indicate we want to link this column with the current active column
     * @private
     */
    createNewColumn: function (linked) {
        
        //if linked, then make sure we don't already have a linked column - if so, we'll simply use that.
        var activePassageModel = this.activePassage();
        if(linked) {
            if(activePassageModel.get("linked") !== null) {
                step.util.activePassageId(activePassageModel.get("linked"));
                return;
            }
        }
        
        var columnHolder = $("#columnHolder");
        var columns = columnHolder.find(".column");
        var columnsCount = columns.length;
        var activeColumn = columns.has(".passageContainer.active");
        var newColumn = activeColumn.clone();
        var newPassageId = parseInt(step.passages.max(function (p) {
            return parseInt(p.get("passageId"))
        }).get("passageId")) + 1;
        newColumn
            .find(".passageContainer").attr("passage-id", newPassageId)
            .find(".passageContent").remove();

        //change the width all columns
        var classesToRemove = "col-sm-12 col-sm-6 col-sm-4 col-sm-3 col-sm-5columns col-sm-2 col-sm-7columns col-sm-8columns col-sm-9columns col-sm-10columns col-sm-11columns col-sm-1";
        columns.removeClass(classesToRemove);
        newColumn.removeClass(classesToRemove);
        var columnClass;
        switch (columnsCount + 1) {
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
                alert("Not sure what to do here...");
                break;
        }
        columns.addClass(columnClass);
        newColumn.addClass(columnClass);
        
        
        if(linked) {
            //passed in 'true', so we need to append at the right location  
            newColumn.insertAfter(activeColumn);
            var link = $("<span class='glyphicon glyphicon-link'></span>").click(function() {
                //unlink all passages
                step.util.unlink(newPassageId);
            });
            newColumn.find(".passageContainer").append(link);
            activePassageModel.save({ linked: newPassageId }, { silent: true });
        } else {
            columnHolder.append(newColumn);
        }
        
        step.util.activePassageId(newPassageId);
        return newPassageId; 
    },
    unlink: function(newPassageId) {
        var models = step.passages.where({ linked: newPassageId });
        var linkedPassageIds = [];
        for(var i = 0; i < models.length; i++) {
            linkedPassageIds.push(models[i].get("passageId"));
            models[i].save({ linked: null });
        }
        step.util.getPassageContainer(newPassageId).find(".glyphicon-link").remove();
        return linkedPassageIds;
    },
    isSeptuagintVersion: function (item) {
        return $.inArray(item.initials || item, step.util.septuagintVersions) != -1;
    },
    trackAnalytics: function (eventType, eventName, eventValue, numValue) {
        if (window["_gaq"]) {
            _gaq.push(['_trackEvent', eventType, eventName, eventValue, numValue]);
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
        if (this._passageContainers[passageIdOrElement] == null) {
            var container = $(".passageContainer[passage-id = " + passageIdOrElement + "]");
            this._passageContainers[passageIdOrElement] = container;
        }
        return this._passageContainers[passageIdOrElement];
    },
    delay: function () {
        var timer = 0;
        var timers = {};

        return function (callback, ms, timerName) {
            if (timerName) {
                var tn = timers[timerName];
                if (tn == undefined) {
                    timers[timerName] = tn = 0;
                }
                clearTimeout(tn);

                if (callback) {
                    timers[timerName] = setTimeout(callback, ms);
                }
            } else {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            }
        };
    },
    getMainLanguage: function (passageModel) {
        return (passageModel.get("languageCode") || ["en"])[0];
    },
    restoreFontSize: function (passageModel, element) {
        var passageId = passageModel.get("passageId");
        var key = passageId + "-" + this.getMainLanguage(passageModel);
        var fontSize = step.settings.get(key);
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
            var fontKey = passageId + "-" + fontClass;
            var diff = {};
            diff[fontKey] = newFontSize;
            step.settings.save(diff);
            $(elements[i]).css("font-size", newFontSize);
        }
        passageModel.trigger("font:change");
    },
    ui: {
        selectMark: function (classes) {
            return '<span class="glyphicon glyphicon-ok ' +  classes + '"></span>';
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
            }
        },
        /**
         * called when click on a piece of text.
         */
        showDef: function (source) {
            var strong;
            var morph;

            if (typeof source == "string") {
                strong = source;
            } else {
                var s = $(source);
                strong = s.attr("strong");
                morph = s.attr("morph");
            }

            step.util.ui.initSidebar('lexicon', { strong: strong, morph: morph});
            require(["sidebar", "defaults"], function (module) {
                step.util.ui.openStrongNumber(strong, morph);
            });
        },
        initSidebar: function (mode, data) {
            require(["sidebar", "defaults"], function (module) {
                if (!data) {
                    data = {};
                }
                if (!step.sidebar) {
                    step.sidebar = {};
                    step.sidebar = new SidebarModel({
                        strong: data.strong,
                        morph: data.morph,
                        mode: mode
                    });
                    new SidebarList().add(step.sidebar);
                    new SidebarView({
                        model: step.sidebar,
                        el: $("#sidebar")
                    });
                }

                if (step.sidebar.get("mode") != mode) {
                    step.sidebar.save({ mode: mode });
                }
            });
        },
        openStrongNumber: function (strong, morph) {
            step.sidebar.save({
                strong: strong,
                morph: morph,
                mode: 'lexicon'
            });
        },
        openStats: function (focusedPassage) {
            step.sidebar.save({
                mode: 'stats',
                focusedPassage: focusedPassage
            })
        },
        addStrongHandlers: function (passageId, passageContent) {
            var that = this;
            var allStrongElements = $("[strong]", passageContent);

            allStrongElements.click(function () {
                step.util.ui.showDef(this);
            }).hover(function () {
                step.passage.higlightStrongs({
                    passageId: undefined,
                    strong: $(this).attr('strong'),
                    morph: $(this).attr('morph'),
                    classes: "primaryLightBg"
                });

                var hoverContext = this;
                step.util.delay(function () {
                    QuickLexiconModels.at(0).save({
                        strongNumber: $(hoverContext).attr('strong'),
                        morph: $(hoverContext).attr('morph'),
                        element: hoverContext
                    });
                }, 500, 'show-quick-lexicon');
            }, function () {
                step.passage.removeStrongsHighlights(undefined, "primaryLightBg relatedWordEmphasisHover");
                step.util.delay(undefined, 0, 'show-quick-lexicon');
            });
        },
        /**
         * Sets the HTML onto the passageContent holder which contains the passage
         * @param passageHtml the JQuery HTML content
         * @private
         */

        emptyOffDomAndPopulate: function (passageContent, passageHtml) {
            var parent = passageContent.parent();
//            passageContent.detach();
            passageContent.off("scroll");
            passageContent.closest(".column").off("scroll");

            //we garbage collect in the background after the passage has loaded
            passageContent.empty();
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

                if (step.util.isSeptuagintVersion(item)) {
                    features += " " + "<span class='versionFeature' title='" + __s.septuagint_interlinear_available + "'>" + __s.septuagint_interlinear_available_initial + "</span>";
                } else {
                    features += " " + "<span class='versionFeature' title='" + __s.interlinear_available + "'>" + __s.interlinear_available_initial + "</span>";
                }
            }
            return features;
        },
        enhanceVerseNumbers: function (passageId, passageContent, version) {
            $(".verseNumber", passageContent).closest("a").mouseenter(function () {
                step.util.ui._addSubjectAndRelatedWordsPopup(passageId, $(this), version);
            });
        },
        
        _addSubjectAndRelatedWordsPopup: function (passageId, element, version) {
            var reference = element.attr("name");
            var self = this;

            require(["qtip"], function () {
                var qtip = element.qtip({
                    show: { event: 'mouseenter', solo: true },
                    hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
                    position: { my: "bottom center", at: "top center", of: element, viewport: $(window), effect: false },
                    style: { classes: "versePopup" },
                    overwrite: false,
                    content: {
                        text: function (event, api) {
                            //otherwise, exciting new strong numbers to apply:
                            $.getSafe(BIBLE_GET_STRONGS_AND_SUBJECTS, [version, reference], function (data) {
                                var template = '<div>' +
                                    '<div class="col-xs-10 col-sm-4"></div>' +
                                    '<div class="col-xs-1 col-sm-1"><h1><%= __s.bible_book %></h1></div>' +
                                    '<div class="col-xs-1 col-sm-1"><h1><%= ot ? __s.OT : __s.NT %></h1></div>' +
                                    '<div class="hidden-xs col-sm-4"></div>' +
                                    '<div class="hidden-xs col-sm-1"><h1><%= __s.bible_book %></h1></div>' +
                                    '<div class="hidden-xs col-sm-1"><h1><%= ot ? __s.OT : __s.NT %></h1></div>' +
                                    '<% _.each(rows, function(row) { %>' +
                                    '<span data-strong="<%= row.strongData.strongNumber %>">' +
                                    '<a href="javascript:void(0)" class="definition col-xs-10 col-sm-4"><%= row.strongData.gloss %> ' +
                                    '(<%= row.strongData.stepTransliteration %> - <%= row.strongData.matchingForm %>)</a>' +
                                    '<a href="javascript:void(0)" class="bookCount col-xs-1 col-sm-1"><%= sprintf(__s.times, row.counts.book) %></a>' +
                                    '<a href="javascript:void(0)" class="bibleCount col-xs-1 col-sm-1"><%= sprintf(__s.times, row.counts.bible) %></a>' +
                                    '</span><% }); %></div>';

                                var rows = [];
                                for (var key in data.strongData) {
                                    var verseData = data.strongData[key];
                                    for (var strong in verseData) {
                                        var strongData = verseData[strong];
                                        var counts = data.counts[strongData.strongNumber];
                                        rows.push({
                                            strongData: strongData,
                                            counts: counts
                                        });
                                    }
                                }

                                var templatedTable = $(_.template(template)({ 
                                    rows: rows, 
                                    ot: data.ot 
                                }));
                                
                                templatedTable.find(".definition").click(function() { 
                                    self.showDef($(this).parent().data("strong"));
                                });
                                
                                templatedTable.find(".bookCount").click(function() {
                                    var bookKey = key.substring(0, key.indexOf('.'));
                                    var args = "reference=" + encodeURIComponent(bookKey) + "|strong=" + encodeURIComponent($(this).parent().data("strong"));
                                    //make this the active passage
                                    step.router.navigatePreserveVersions(args);
                                });
                                templatedTable.find(".bibleCount").click(function() {
                                    var args = "strong=" + encodeURIComponent($(this).parent().data("strong"));
                                    //make this the active passage
                                    step.router.navigatePreserveVersions(args);
                                });
                                api.set('content.text', templatedTable);
                                
                                

//                                    var strongTable = $("<div>").addClass("verseNumberStrongs");
//                                    there may be multiple values of this kind of format:
//                                    var internalVerseLink = element;

//                                    if (internalVerseLink[0] == undefined) {
                                //no point in continuing here, since we have no verse to attach it to.
//                                        return;
//                                    }


//                                    var row = $("<div></div>");
//                                    $.each(value, function (i, item) {
//
//                                        var searchCell = $("<div>");
//                                        row.append(searchCell);
//
//                                        add search icon
//                                        searchCell.append(self._addLinkToLexicalSearch(rightColumnClasses, passageId, "ui-icon ui-icon-search verseStrongSearch", "sameWordSearch", item.strongNumber, null, __s.search_for_this_word, ""));
//                                        searchCell.append(self._addLinkToLexicalSearch(rightColumnClasses, passageId, "ui-icon ui-icon-zoomin verseStrongSearch", "relatedWordSearch", item.strongNumber, null, __s.search_for_related_words, ""));
//
//                                        var nameLink = $("<a>").addClass(leftColumnClasses);
//                                        nameLink.append(item.gloss);
//                                        nameLink.append(" (");
//                                        nameLink.append(item.stepTransliteration);
//                                        nameLink.append(", ")
//                                        nameLink.append($("<span>").addClass(self.getFontForStrong(item.strongNumber)).append(item.matchingForm));
//                                        nameLink.append(")");
//                                        nameLink.attr("href", "javascript:void(0)");
//                                        nameLink.click(function () {
//                                            showDef(item.strongNumber, passageId);
//                                        });
//                                        searchCell.append(nameLink);
//
//                                        var bookCount = $("<div>");
//                                        bookCount.append(self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch",
//                                            item.strongNumber, bookKey, "", sprintf(__s.times, data.counts[item.strongNumber].book)));
//                                        row.append(bookCount);
//
//                                        var testamentCount = $("<div>");
//                                        testamentCount.append(self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch",
//                                            item.strongNumber, null, "", sprintf(__s.times, data.counts[item.strongNumber].bible)));
//                                        row.append(testamentCount);
//                                    });

//                                    var strongPopup = $("<span>");
//                                    strongPopup.append(strongTable);
//                                    strongPopup.append("<br />");

//                                    if (data.significantlyRelatedVerses[key] && data.significantlyRelatedVerses[key].length != 0) {
//                                        var related = $("<a>").addClass("related").attr("href", "javascript:void(0)").append(__s.see_related_verses).click(function () {
//                                            getRelatedVerses(data.significantlyRelatedVerses[key].join('; '), passageId);
//                                        });
//                                        strongPopup.append(related);
//                                        strongPopup.append("&nbsp;&nbsp;");
//                                    }
//
//                                    if (data.relatedSubjects[key] && data.relatedSubjects[key].total != 0) {
//                                        attach data to internal link (so that it goes when passage goes
//                                        var subjects = data.relatedSubjects[key];
//                                        $.data(internalVerseLink[0], "relatedSubjects", subjects);
//
//                                        var subjectOverview = "";
//                                        var i = 0;
//                                        for (i = 0; i < 5 && i < subjects.results.length; i++) {
//                                            subjectOverview += subjects.results[i].root;
//                                            subjectOverview += ", ";
//                                            subjectOverview += subjects.results[i].heading;
//                                            subjectOverview += " ; ";
//                                        }
//
//                                        if (i < subjects.results.length) {
//                                            subjectOverview += "...";
//                                        }

//                                        var related = $("<a>").addClass("related").attr("href", "javascript:void(0)")
//                                            .append(__s.see_related_subjects)
//                                            .attr("title", subjectOverview.replace(/'/g, "&apos;"))
//                                            .click(function () {
//                                                getRelatedSubjects(key, passageId);
//                                            });
//                                        strongPopup.append(related);
//                                        strongPopup.append("&nbsp;&nbsp;");
//                                    }
//
                                //only expect one entry back.
//                                    break;
//                                }
                            });
                        }
                    }
                });
                qtip.qtip("show");
            });
        },

        _addLinkToLexicalSearch: function (classes, passageId, classes, functionName, strongNumber, bookKey, title, innerText) {
            var text = $("<a>").addClass(classes);
            text.attr("href", "javascript:void(0)");
            text.attr("title", title.replace(/'/g, "&apos;"));
            text.addClass(classes);
            text.append(innerText);
            text.click(function () {
                step.lexicon.setPassageIdInFocus(passageId);
                step.lexicon[functionName](strongNumber, bookKey);
            });

            return text;
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
        addCollapsiblePanel: function(text, classes, href) {
            var wrapper = $("<div class='panel-heading'>");
            var panel = $("<div class='panel panel-default'>").append(wrapper);
            wrapper.append($("<h4 data-toggle='collapse'>").attr("href", href)
                .addClass("panel-title").addClass(classes)
                .append('<span class="glyphicon glyphicon-plus"></span>')
                .append(text));
            
            return panel;
        }
    }
}
;