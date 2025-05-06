var StepRouter = Backbone.Router.extend({
    routes: {
        "search(?:query)": "doMasterSearch",
        "(?:query)": "doMasterSearch"
    },
    initialize: function () {
    },
    _addArg: function (url, argName, argValue) {
        if (url === "") {
            url += '?';
        } else if (url[url.length - 1] !== '?') {
            url += '&';
        }
        url += argName;
        if (argValue != null) {
            url = url + "=" + argValue;
        }
        return url;
    },
    overwriteUrl: function (inputUrl) {
        var url = inputUrl || Backbone.history.fragment || "";
        this.navigate(url, { trigger: false, replace: true});
    },

    navigatePreserveVersions: function (partial, stripCommentaries, skipPage, skipQFilter, startNewPageForPhone) {
        //get versions of current active passage
        //add versions from current active passage
        var activePassage = step.util.activePassage();

        var searchParameters = partial;
        var mainVersion = activePassage.get("masterVersion");
        var allVersions = "";
        var otherVersions = [];
        if (mainVersion !== "") {
            if (!stripCommentaries || step.keyedVersions[mainVersion].category == 'BIBLE') {
                allVersions = "version=" + mainVersion;
            }
            var extraVersions = (activePassage.get("extraVersions") || "").split(",");
            for (var i = 0; i < extraVersions.length; i++) {
                if ((extraVersions[i] || "") !== "") {
                    if (!stripCommentaries || step.keyedVersions[extraVersions[i]].category == 'BIBLE') {
                        if (allVersions !== "") allVersions += URL_SEPARATOR;
                        allVersions += "version=" + extraVersions[i];
                        otherVersions.push(extraVersions[i]);
                    }
                }
            }
        }
        var osisIDs = partial.substring( partial.indexOf("reference=") + 10).split(" ");
        if (!step.util.checkFirstBibleHasPassage(mainVersion, osisIDs, otherVersions, false, true)) return;
		skipPage = (skipPage) ? true : false;
		skipQFilter = (skipQFilter) ? true : false;
        if ((allVersions !== "") && (searchParameters !== "")) searchParameters = allVersions + URL_SEPARATOR + searchParameters;
        if (step.touchDevice && !step.touchWideDevice && startNewPageForPhone)
            window.open("/?q=" + searchParameters.split(" ")[0], "_blank");
        else
            this.navigateSearch(searchParameters, skipQFilter, skipPage);
    },
    navigateSearch: function (args, skipQFilter, skipPage) {
        var activePassageId = step.util.activePassageId();
        var activePassageModel = step.passages.findWhere({ passageId: activePassageId});
        var options = activePassageModel.get("selectedOptions") || "";
        var interlinearMode = activePassageModel.get("interlinearMode") || "";
        var pageNumber = activePassageModel.get("pageNumber");
        var context = activePassageModel.get("context");
        var filter = activePassageModel.get("strongHighlights");
        var sort = activePassageModel.get("order");
        var position = activePassageModel.get("passageId");

        if (step.util.isBlank(context)) {
            activePassageModel.set({context: 0 }, { silent: true });
            context = 0;
        }
        var urlStub = "";

        if (step.util.isBlank(args)) {
            var modelArgs = activePassageModel.get("args") || "";
            urlStub = this._addArg(urlStub, "q", modelArgs);
        } else {
            urlStub = this._addArg(urlStub, "q", args);
        }

        if (!step.util.isBlank(options)) {
            if ((options.indexOf("M") > -1) || (options.indexOf("C") > -1)) {
                var versions = urlStub.split("version=");
                var hasMorphology = (versions.length == 1) ? true : false; // No version so it is ESV. 
                for (var i = 1; i < versions.length; i++) { // skip the first element is q= or things before version=
                    var curVersion = versions[i].split(URL_SEPARATOR)[0].split("&")[0];
                    if ((typeof step.keyedVersions[curVersion] === "object") &&
                        (step.keyedVersions[curVersion].hasMorphology)) {
                            hasMorphology = true;
                            break;
                        }
                }
                var C_Greek = 0;
                var C_enableVerbClr = 0;
                var C_enableGenderNumberClr = 3;
                var C_OT = 1;
                if ((typeof c4 === "object") && !c4[C_Greek][C_enableVerbClr] && !c4[C_enableGenderNumberClr] && !c4[C_OT][C_enableVerbClr])
                    options = options.replace("C", ""); // Don't color code to server if user disabled it.
                if (!hasMorphology) // If there is no morphology, the grammar and color code grammar are not relevant
                    options = options.replace("M", "").replace("C", "");
            }
            var optionWithoutDups = "";
            var freq = {};
            for (var i=0; i < options.length; i++) {
                var oneChar = options[i];
                if (typeof freq[oneChar] === "undefined") {
                    freq[oneChar] = 1;
                    optionWithoutDups += oneChar;
                }
            }
            urlStub = this._addArg(urlStub, "options", optionWithoutDups);
        }
        if (!step.util.isBlank(interlinearMode) && interlinearMode != "NONE") {
            urlStub = this._addArg(urlStub, "display", interlinearMode);
        }
        if (!step.util.isBlank(pageNumber) && (pageNumber != "1") && (!skipPage)) {
            urlStub = this._addArg(urlStub, "page", pageNumber);
        }
        if (context != 0) {
            urlStub = this._addArg(urlStub, "context", context);
        }
        if (!step.util.isBlank(filter) && (!skipQFilter)) {
            urlStub = this._addArg(urlStub, "qFilter", filter);
        }
        if (!step.util.isBlank(sort)) {
            urlStub = this._addArg(urlStub, "sort", sort);
        }

        if (position != 0) {
            urlStub = this._addArg(urlStub, "pos", position);
        }

        if ($.getUrlVars().indexOf("debug") != -1) {
            urlStub = this._addArg(urlStub, "debug");
        }

        //we will get a null-arg as part of the replacing of the URL with the correct URL
        //call back from after the routing call to rest backend call. So need
        //to avoid writing over 'args'
        if (args != null) {
            activePassageModel.save({ args: decodeURIComponent(args) }, { silent: true });
        }

        //code copied from bootstraps navigate - bringing up to work out if anything will be triggered.
        var currentFragment = Backbone.history.fragment;
        var targetFragment = Backbone.history.getFragment(urlStub);
        if(currentFragment === targetFragment) {
            activePassageModel.trigger("afterRender");
        } else {
        	var historyOptions = { trigger: true};
            this.navigate(urlStub, historyOptions);
        }
    },
    getShareableColumnUrl: function (passageId) {
        var shareableUrl = "http://" + step.state.getDomain() + "/";
        if (passageId == null) {
            return shareableUrl;
        }

        var passageModel = step.passages.findWhere({passageId: passageId});
        if (!passageModel) {
            return shareableUrl;
        }

        var fragment = passageModel.get("urlFragment");
        var url = shareableUrl + fragment;

        $("link[rel='canonical']").attr("href", url);
        return url;
    },
    handleSearchResults: function (passageModel, partRendered) {
        require(["search"], function (module) {
            if (passageModel.get("pageNumber") > 1) {
                passageModel.trigger("newPage");
            } else {
                passageModel.trigger("destroyViews");
                switch (passageModel.get("searchType")) {
                    case "TEXT":
                    case "RELATED_VERSES":
                        new TextDisplayView({
                            model: passageModel,
                            partRendered: partRendered
                        });
                        break;
                    case "SUBJECT_SIMPLE" :
                    case "SUBJECT_EXTENDED" :
                    case "SUBJECT_FULL" :
                    case "SUBJECT_RELATED" :
                        new SubjectDisplayView({
                            model: passageModel,
                            partRendered: partRendered
                        });
                        break;
                    case "ORIGINAL_MEANING" :
                    case "EXACT_FORM" :
                    case "ORIGINAL_GREEK_FORMS" :
                    case "ORIGINAL_GREEK_RELATED" :
                    case "ORIGINAL_HEBREW_EXACT" :
                    case "ORIGINAL_HEBREW_FORMS" :
                    case "ORIGINAL_HEBREW_RELATED":
                        new WordDisplayView({
                            model: passageModel,
                            partRendered: partRendered
                        });
                        break;
                }
            }
        });
    },
    handleRenderModel: function (passageModel, partRendered, queryArgs, doNotScroll) {
        passageModel.save({
                args: queryArgs != null ? decodeURIComponent(queryArgs) : "",
                urlFragment: Backbone.history.getFragment()
            },
            {
                silent: true
            }
        );

        //then trigger the refresh of menu options and such like
        passageModel.trigger("sync-update", passageModel);

        var searchType = passageModel.get("searchType");
        if (searchType == 'PASSAGE') {
            //destroy all views for this column
            passageModel.trigger("destroyViews");
            new PassageDisplayView({
                model: passageModel,
                partRendered: partRendered
            });
        } else {
            this.handleSearchResults(passageModel, partRendered);
        }
        this._renderSummary(passageModel);
        step.util.hideNavBarOnPhones(doNotScroll);
    },

    _renderSummary: function (passageModel) {
        var searchTokens = passageModel.get("searchTokens");

        var currentPassageID = passageModel.get("passageId");
        var passageContainer = step.util.getPassageContainer(currentPassageID);
        var passageOptions = passageContainer.find(".passageOptionsGroup");
			
		passageOptions.find(".argSummary").remove();
		var container = $("<span></span>").addClass("argSummary argSumSpan");
		step.util.ui.renderArgs(searchTokens, container, "button");
		passageOptions.append(container);
        if ((container.find("button.select-search").text().trim() === "") &&
            (container.find("button.select-reference").text().indexOf(":") > 0)) {
            var refs = container.find("button.select-reference").text().trim().split(" ");
            if (refs.length == 2) {
                if (refs[1].indexOf(":")) {
                    var interlinear = passageContainer.find('span.interlinear.ltr');
                    if (interlinear.length == 0)
                        interlinear = passageContainer.find('span.interlinear.rtl');
                    if (interlinear.length > 0)
                        $(interlinear[interlinear.length - 1]).after('<br><span class="interlinear"><span style="clear:left;padding:16px;text-decoration:underline"><a href="javascript:step.util.gotoCurrentChapter()">Read full chapter</a></span></span>');
                    else
                        passageContainer.find("div.passageContentHolder").append('<br><div style="padding:16px;text-decoration:underline"><a href="javascript:step.util.gotoCurrentChapter()">Read full chapter</a></div>');
                }
            }
        }
    },
    doMasterSearch: function (query, options, display, pageNumber, filter, sort, context, quiet) {
        var self = this;
        if (step.util.isBlank(query)) {
            //assume URL parameters
            query = $.getUrlVar("q") || "";
            options = $.getUrlVar("options");
            display = $.getUrlVar("display");
            filter = $.getUrlVar("qFilter");
            context = $.getUrlVar("context");
            sort = $.getUrlVar("sort");
        }

        var args = query.split("&");
        if (args == null || args.length == 0) {
            return;
        }

        for (var i = 0; i < args.length; i++) {
            var myArgs = args[i];
            var splitElement = myArgs.split("=");
            if (splitElement.length < 2) {
                continue;
            }

            var key = splitElement[0];
            var value = splitElement.slice(1).join("=");
            switch (key) {
                case 'q':
                    query = value;
                    break;
                case 'options':
                    options = value;
                    break;
                case 'page':
                    pageNumber = value;
                    break;
                case 'display':
                    display = value;
                    break;
                case 'context':
                    context = value;
                    break;
                case 'qFilter':
                    filter = value;
                    break;
                case 'sort':
                    sort = value;
                    break;
            }
        }


        var startTime = new Date().getTime();
        var activePassageId = step.util.activePassageId();

        //remove debug if present
        query = encodeURIComponent(query.replace(/&debug/ig, ""));
        $.getPassageSafe({
            url: SEARCH_MASTER,
            args: [query, options, display, pageNumber, filter, sort, context, step.userLanguageCode],
            callback: function (text) {
                text.startTime = startTime;

                step.util.unlinkThis(activePassageId);
                var passageModel = step.passages.findWhere({ passageId: activePassageId});
                if (passageModel == null) {
                    console.error("No passages defined for ", activePassageId);
                }

                passageModel.save(text, { silent: true });
                self._addBookmark({ args: query, searchTokens: text.searchTokens, options: options, display: display });
                step.util.squashErrors(passageModel);

                //don't trigger a full search, but replace the URL with the one that makes sense
                if (!quiet) {
                    step.router.overwriteUrl();
                }
                $("#newLineWordle").text(text.reference);
                $("#nextChapterWordle").hide();
                $("#newLineWordle").show();
                $("#nextChapterInputLine").show();
                var doNotScroll = false;
                if ( ((typeof pageNumber === "string") && (!isNaN(pageNumber))) ||
                      (typeof pageNumber === "number") ) {
                    if (parseInt(pageNumber) > 1)
                    	doNotScroll = true;
                }
                self.handleRenderModel(passageModel, false, query, doNotScroll);
            },
            passageId: activePassageId,
            level: 'error'
        });
    },
    _addBookmark: function (query) {
        var normalizedArgs = this._normalizeArgs(query.args);
        var existingModel = step.bookmarks.findWhere({ args: normalizedArgs });
        if (existingModel) {
            existingModel.save({ options: query.options, display: query.display, lastAccessed: new Date().getTime() });
            return;
        }

        var historyModel = new HistoryModel({
            args: normalizedArgs,
            lastAccessed: new Date().getTime(),
            searchTokens: query.searchTokens,
            options: query.options,
            display: query.display,
            id: step.util.guid()
        });
        step.bookmarks.add(historyModel);
        historyModel.save();
    },
    _normalizeArgs: function (args) {
        var tokens = (args || "").split(URL_SEPARATOR) || [];
        tokens.sort(function (a, b) {
            var aTokens = a.split("=");
            var bTokens = b.split("=");
            var aKey = aTokens[0];
            var bKey = bTokens[0];

            if (aKey == bKey) {
                if (aKey == VERSION) {
                    return aTokens[1] < bTokens[1] ? -1 : 1;
                }
                return 0;
            } else if (aKey == VERSION) {
                return -1;
            } else if (bKey == VERSION) {
                return 1;
            } else if (aKey == REFERENCE) {
                return -1;
            } else if (bKey == REFERENCE) {
                return 1
            } else {
                //preserve the order so equal
                return 0;
            }
        });
        return tokens.join(URL_SEPARATOR);
    }
});
