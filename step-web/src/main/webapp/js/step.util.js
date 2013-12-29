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
                        url += args[i];

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
                            step.util.raiseInfo(passageId, data.errorMessage, level, url.startsWith(BIBLE_GET_BIBLE_TEXT));
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
                    vars[hash[0]] = hash[1].split('#')[0];
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
        //TODO
    },

    raiseInfo: function () {

    },

    raiseError: function () {

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
    isSeptuagintVersion: function (item) {
        return $.inArray(item.initials || item, step.util.septuagintVersions) != -1;
    },
    trackAnalytics: function (eventType, eventName, eventValue, numValue) {
        if (window["_gaq"]) {
            _gaq.push(['_trackEvent', eventType, eventName, eventValue, numValue]);
        }
    },
    getPassageContainer: function (passageIdOrElement) {
        //check if we have a number
        if (isNaN(parseInt(passageIdOrElement))) {
            //assume jquery selector or element
            return $(passageIdOrElement).closest(".passageContainer");
        }

        //check if we're storing it
        if (this.passageContainers[passageIdOrElement] == null) {
            var container = $(".passageContainer[passage-id = " + passageIdOrElement + "]");
            this.passageContainers[passageIdOrElement] = container;
        }
        return this.passageContainers[passageIdOrElement];
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
    ui: {
//        createButton: function (options) {
//            var button = $("<button></button>").addClass("btn btn-default btn-sm").attr("type", "button");
//            if(options.icon) {
//                var icon = $("<span>").addClass("glyphicon " + options.icon);
//                button.append(icon)
//            }
//            
//            if(options.addCaret) {
//                button.append('<span class="caret"></span>');
//            }
//            
//            button.on('click', options.handler);
//            return button;
//        },

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
        showDef: function (source, passage) {
            var strong;
            var morph;
            var passageId;

            if (typeof source == "string") {
                strong = source;
                passageId = passage;
            } else {
                var s = $(source);
                strong = s.attr("strong");
                morph = s.attr("morph");
                passageId = step.passage.getPassageId(s);
            }

            require(["sidebar"], function(module) {
                if (!step.sidebar) {
                    step.sidebar = {};
                    step.sidebar = new SidebarModel({
                        strong: strong,
                        morph: morph
                    });
                    new SidebarList().add(step.sidebar);
                    new SidebarView({
                        model: step.sidebar,
                        el: $("#sidebar")
                    });
                }
                step.sidebar.save({
                    strong: strong,
                    morph: morph
                });
            });
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
            passageContent.detach();
            passageContent.off("scroll");

            //we garbage collect in the background after the passage has loaded
            var children = passageContent.children().detach();
            children.remove();

            passageContent.append(passageHtml);
            parent.append(passageContent);
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

            var qtip = element.qtip({
                show: { event: 'mouseenter', solo: true },
                hide: { event: 'unfocus mouseleave', fixed: true, delay: 200 },
                position: { my: "bottom center", at: "top center", of: element, viewport: $(window), effect: false },
                style: { classes: "versePopup noQtipWidth" },
                overwrite: false,
                content: {
                    text: function (event, api) {
                        //otherwise, exciting new strong numbers to apply:
                        $.getSafe(BIBLE_GET_STRONGS_AND_SUBJECTS, [version, reference], function (data) {
                            for (var key in data.strongData) {
                                var value = data.strongData[key];

                                var strongTable = $("<table>").addClass("verseNumberStrongs");
                                //there may be multiple values of this kind of format:
                                var bookKey = key.substring(0, key.indexOf('.'));
                                var internalVerseLink = element;

                                if (internalVerseLink[0] == undefined) {
                                    //no point in continuing here, since we have no verse to attach it to.
                                    return;
                                }

                                var header = $("<tr>");
                                header.append("<th>");
                                header.append($("<th>").append(__s.bible_book));
                                header.append($("<th>").append(data.ot ? __s.OT : __s.NT));
                                strongTable.append(header);

                                var row;
                                $.each(value, function (i, item) {
                                    var even = (i % 2) == 0;

                                    if (even) {
                                        row = $("<tr>");
                                        strongTable.append(row);
                                    }

                                    var searchCell = $("<td>");
                                    row.append(searchCell);

                                    //add search icon
                                    searchCell.append(self._addLinkToLexicalSearch(passageId, "ui-icon ui-icon-search verseStrongSearch", "sameWordSearch", item.strongNumber, null, __s.search_for_this_word, ""));
                                    searchCell.append(self._addLinkToLexicalSearch(passageId, "ui-icon ui-icon-zoomin verseStrongSearch", "relatedWordSearch", item.strongNumber, null, __s.search_for_related_words, ""));

                                    var nameLink = $("<a>");
                                    nameLink.append(item.gloss);
                                    nameLink.append(" (");
                                    nameLink.append(item.stepTransliteration);
                                    nameLink.append(", ")
                                    nameLink.append($("<span>").addClass(self._getFontForStrong(item.strongNumber)).append(item.matchingForm));
                                    nameLink.append(")");
                                    nameLink.attr("href", "javascript:void(0)");
                                    nameLink.click(function () {
                                        showDef(item.strongNumber, passageId);
                                    });
                                    searchCell.append(nameLink);

                                    var bookCount = $("<td>");
                                    bookCount.append(self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch",
                                        item.strongNumber, bookKey, "", sprintf(__s.times, data.counts[item.strongNumber].book)));
                                    row.append(bookCount);

                                    var testamentCount = $("<td>");
                                    if (even) {
                                        testamentCount.addClass("even");
                                    }
                                    testamentCount.append(self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch",
                                        item.strongNumber, null, "", sprintf(__s.times, data.counts[item.strongNumber].bible)));
                                    row.append(testamentCount);
                                });

                                var strongPopup = $("<span>");
                                strongPopup.append(strongTable);
                                strongPopup.append("<br />");

                                if (data.significantlyRelatedVerses[key] && data.significantlyRelatedVerses[key].length != 0) {
                                    var related = $("<a>").addClass("related").attr("href", "javascript:void(0)").append(__s.see_related_verses).click(function () {
                                        getRelatedVerses(data.significantlyRelatedVerses[key].join('; '), passageId);
                                    });
                                    strongPopup.append(related);
                                    strongPopup.append("&nbsp;&nbsp;");
                                }

                                if (data.relatedSubjects[key] && data.relatedSubjects[key].total != 0) {
                                    //attach data to internal link (so that it goes when passage goes
                                    var subjects = data.relatedSubjects[key];
                                    $.data(internalVerseLink[0], "relatedSubjects", subjects);

                                    var subjectOverview = "";
                                    var i = 0;
                                    for (i = 0; i < 5 && i < subjects.results.length; i++) {
                                        subjectOverview += subjects.results[i].root;
                                        subjectOverview += ", ";
                                        subjectOverview += subjects.results[i].heading;
                                        subjectOverview += " ; ";
                                    }

                                    if (i < subjects.results.length) {
                                        subjectOverview += "...";
                                    }

                                    var related = $("<a>").addClass("related").attr("href", "javascript:void(0)")
                                        .append(__s.see_related_subjects)
                                        .attr("title", subjectOverview.replace(/'/g, "&apos;"))
                                        .click(function () {
                                            getRelatedSubjects(key, passageId);
                                        });
                                    strongPopup.append(related);
                                    strongPopup.append("&nbsp;&nbsp;");
                                }

                                api.set('content.text', strongPopup);
                                //only expect one entry back.
                                break;
                            }
                        });
                    }
                }
            });
            qtip.qtip("show");
        },

        _addLinkToLexicalSearch: function (passageId, classes, functionName, strongNumber, bookKey, title, innerText) {
            var text = $("<a>");
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
        _getFontForStrong: function (strong) {
            if (strong[0] == 'H') {
                return "hbFontSmall";
            } else {
                return "unicodeFont";
            }
        }
    }
}
;