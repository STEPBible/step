var StepRouter = Backbone.Router.extend({
    fragments: [undefined, undefined],
    routes: {
        /*******************************
         * This fragment is deliberately placed above everything else to trap fragments starting with __
         *******************************/
        "!__*fragment": "entireUnparsedUrl",
        ":passageId/passage/:detail/:version/:reference(/:options)(/:extraVersions)(/:interlinearMode)": "changePassage",
        ":passageId/passage/:detail/:version/:reference/(/:extraVersions)(/:interlinearMode)": "changePassageNoOptions",
        ":passageId/singleColumn" : "changeSingleColumn",
        ":passageId/:searchType/:pageNumber/:pageSize/:querySyntax/:context/:version/:sortOrder/:params": "search"
    },
    lastUrls: [],
    refinedSearches: [[], []],
    fullSearchUrl : [undefined, undefined],
    lastSearch : [undefined, undefined],
    totalResults: [0,0],
    firstSync: false,

    changeSingleColumn : function() {
        $.shout("view-change", {viewName : 'SINGLE_COLUMN_VIEW' });
    },

    getShareableColumnUrl : function(element, encodeFragment) {
        var fragment = stepRouter.getSingleFragment(step.passage.getPassageId(element));
        if(encodeFragment) {
            fragment = encodeURIComponent(fragment);
        }

        //sh=true indicates a sharing url - debug - on local app we won't allow sharing buttons at all.
        var origin = Backbone.history.location.origin;
        if(Backbone.history.location.origin == "http://localhost:8080") {
            origin = "http://www.stepbible.org";
        }

        //if fragment has __1, we're going to put it in the first column instead
        fragment = fragment.replace(/__\/1\//, "__/0/") + "/__/1/singleColumn";

        return Backbone.history.location.origin + "/?" + "sh=true" + "#!" + fragment;
    },

    getSingleFragment : function(passageId) {
        var hash = Backbone.history.getFragment();
        if(hash == null || hash.length == 0) {
            return "";
        }

        var fragments = this.getColumnFragments(hash);
        if(passageId < fragments.length) {
            return fragments[passageId];
        }
        return "";
    },

    /**
     * Navigates for a particular column only.
     * @param fragment
     * @param options
     */
    navigatePassage: function (fragment, options) {
//        console.log("Fragments: ", fragment, options);

        var hash = "";
        try {
            hash = Backbone.history.getFragment();
        } catch (e) {
            console.log("Unable to get fragment, so assuming blank, as history might not be started");
        }

        //if hash is empty then we use the normal mechanism
        if (hash.length == 0 || hash == '#') {
            var prefix = fragment.substring(0, 3);
            if (prefix != "__/") {
                fragment = "!__/" + fragment;
            }

            //we still have the trigger flag as it gets deleted below.
            this.navigate(fragment, options);
            return;
        }

        //trim off the first character if a '#'
        if (hash[0] == '#') {
            hash = hash.substring(0);
        }

        var trigger = options.trigger;
        delete options.trigger;
        var fragments = this.getColumnFragments(hash);
        var passageIdFromInput = parseInt(fragment.substring(0, fragment.indexOf('/')));

        var newFragment = "__/" + fragment;
        if (fragments[passageIdFromInput] != newFragment) {
            fragments[passageIdFromInput] = newFragment;

            //check that the models
            if (fragments[passageIdFromInput].indexOf("/passage/") != -1) {
                //use replace for all non-synced passages if one exists
                var isSyncing = false;
                for (var i = 0; i < PassageModels.length; i++) {
                    if (PassageModels.at(i).get("synced") != -1) {
                        isSyncing = true;
                        break;
                    }
                }

                //master version is always triggered first, so we ensure we use replace=true,
                //since that records what was previously entered in the browser.
                // for all other passages coming next, we don't want to record the master history url,
                // since it would show out of sync
                if (isSyncing && PassageModels.at(passageIdFromInput).get("synced") != -1) {
                    //if it is the first change since synced, the we need to ensure we indeed do change the URL
                    if (this.firstSync) {
                        //don't set the replace flag as we want to record the previous URL.
                    }
                    options.replace = true;
                }
            }

            //join all the fragments up again
            var finalUrl = fragments.join('/');
            this.navigate("!" + finalUrl, options);
            console.log("Final URL: ", finalUrl, options.replace);

            //we trigger the routes manually, for the single individual fragment.
            if (trigger) Backbone.history.loadUrl(fragment);
        }

        refreshLayout();
    },

    /**
     * Retrieves the various fragments from a url.
     *
     * We are going to assume, a __/ fragment indicates the start of a route
     * current url looks like __/passage/....../__/subject/......
     * @param hash the url/hash that should be split up into several pieces.
     */
    getColumnFragments: function (hash) {
        if (hash == undefined) {
            return [];
        }

        //now, we need to find out the location of each fragment
        var fragments = [];

        //remove the leading BANG! since it does not form part of a column fragment
        if(hash.length > 0 && hash[0] == '!') {
            hash = hash.substring(1);
        }

        //we first calculate the new hash...
        var pos = 1;
        var lastPos = 0;
        while ((pos = hash.indexOf("__/", pos + 1)) != -1) {

            //we remove the trailing slash
            fragments.push(hash.substring(lastPos, pos - 1));
            lastPos = pos;
        }

        var passageId = this.getPassageIdFromHash(hash);
        var newHash = hash.substring(lastPos);

        fragments[this.getPassageIdFromHash(newHash)] = newHash;

        //start positions of each fragment
//        console.log(fragments);
        return fragments;
    },

    getPassageIdFromHash: function (hash) {
        return hash.split("/")[1];
    },

    /**
     * Handles anything that wasn't caught previously, and therefore we assume,
     * that we can divide into multiple sections.
     * @param wholeUrl
     */
    entireUnparsedUrl: function (wholeUrl) {
        //divide the url up
        var fragments = this.getColumnFragments(wholeUrl);
        for (var i = 0; i < fragments.length; i++) {
            if (fragments[i] == undefined) {
                continue;
            }

            //prevent infinite recursion
            if (fragments[i][0] == '/') {
                fragments[i] = fragments[i].substring(1);
            }

            if (fragments[i].indexOf("__/") == 0) {
                fragments[i] = fragments[i].substring(3);
            }
//            console.log("loading url: ", fragments[i]);

            if (this.fragments) {
                Backbone.history.loadUrl(fragments[i]);
            }
        }
        refreshLayout();
    },

    /**
     * Resyncs against the `menu model, to ensure we're always displaying the right fieldset.
     * @param passageId the passage Id of interest
     * @param searchType the search type
     */
    updateMenuModel: function (passageId, searchType) {
        var menuModel = MenuModels.at(passageId);
        if (menuModel != null) {
//            if (menuModel.get("selectedSearch") != searchType) {
            menuModel.save({ selectedSearch: searchType });
//            } else {
//                console.log("WARN: Skipping update on model, as already in date");
//            }
        } else {
            console.log("NO MODEL TO TRIGGER SEARCH");
        }
    },

    /**
     * Routes searches to the correct place dependant on the search prefix
     * @param passageId
     * @param pageNumber
     * @param pageSize
     * @param querySyntax
     * @param context
     * @param version
     */
    search: function (passageId, searchType, pageNumber, pageSize, querySyntax, context, version, sortOrder, params) {
        console.log("Restoring params", params);

        if (params) {
            Backbone.Events.trigger(searchType + ":restoreParams:" + passageId, { params: params.split("|") });
        }

        this.updateMenuModel(passageId, searchType);
        var query = step.util.replaceSpecialChars(querySyntax);
        this._validateAndRunSearch(searchType, passageId, query, version, sortOrder, context, pageNumber, pageSize, sortOrder);
    },

    /**
     * Validates the search is correct, then runs it
     * @param passageId
     * @param query
     * @param version
     * @param ranked
     * @param context
     * @param pageNumber
     * @private
     */
    _validateAndRunSearch: function (searchType, passageId, query, version, sortOrder, context, pageNumber, pageSize) {
        if (step.util.isBlank(query) ||
            step.util.isBlank(query.substring(query.indexOf('=')+1)
                .replace(/#plus#/ig, "")
                .replace(/\[[^\]]+\]/ig, "")
                .replace(/\s/ig, ""))
            ) {
            Backbone.Events.trigger(searchType + ":new:" + passageId, {
                searchQueryResults : { query: query , total: 0}, pageNumber : 1});
            return;
        }

        var checkedVersion = version;
        if (version == null || version.trim().length == 0) {
            checkedVersion = PassageModels.at(passageId).get("version");

            if (checkedVersion == undefined || checkedVersion.trim().length == 0) {
                checkedVersion = 'ESV';
            }
        }

        this._doSearch(searchType, passageId, query, checkedVersion, pageNumber, pageSize, sortOrder, context);
    },

    /**
     * True if matches 'in (blah)'
     * @param querySyntax the syntax to be checked
     * @private
     */
    _hasVersionFragment : function(querySyntax) {
        return querySyntax.match(/in \([^)]*\)/);
    },

    _doSearch: function (searchType, passageId, query, version, pageNumber, pageSize, sortOrder, context) {
        var self = this;

        var masterVersion = "ESV";
        if(version) {
            masterVersion = version.split(",")[0];
        }

        //we only ever check the last fragment in a multi query syntax...
        var versionArg = "";
        var refiningStart = query.lastIndexOf("=>");
        versionArg =
            refiningStart == -1 && this._hasVersionFragment(query)
                || this._hasVersionFragment(query.substring(refiningStart + 2)) ?
                "" : " in (" + version.toUpperCase() + ")";

        var pageNumberArg = pageNumber == null ? 1 : pageNumber;
        var sortingArg = sortOrder == undefined ? false : sortOrder;
        var contextArg = context == undefined || isNaN(context) ? 0 : context;
        var pageSizeArg = pageSize == undefined || pageSize < 1 ? step.defaults.pageSize : pageSize;
        var finalInnerQuery = query + versionArg;

        var refinedQuery = finalInnerQuery;
//        this._joinInRefiningSearches(passageId, finalInnerQuery);

        //page number is importantly postioned at -1 from the end - and this is relied upon by the search scroll results
        var args = [encodeURIComponent(refinedQuery), sortingArg, contextArg, pageNumberArg, pageSizeArg];

        var startTime = new Date().getTime();


        //mark the full search URL, so that we don't ever carry it again
        var fullUrl = args.join();
        if(this.fullSearchUrl[passageId] == fullUrl) {
            return;
        }
        this.fullSearchUrl[passageId] = fullUrl;

        $.getSafe(SEARCH_DEFAULT, args, function (searchQueryResults) {
            step.util.trackAnalyticsSearch(startTime, searchQueryResults, versionArg, args[0]);
            Backbone.Events.trigger(searchType + ":new:" + passageId,
                {
                    searchQueryResults: searchQueryResults,
                    pageNumber: pageNumberArg,
                    masterVersion : masterVersion,
                    searchArgs : args,
                    versionArg : versionArg
                });

            self.lastSearch[passageId] = refinedQuery;
        });
    },

    addRefinedSearch : function(passageId) {
        this.refinedSearches[passageId].push(this.lastSearch[passageId]);
    },

    clearRefinedSearch : function(passageId) {
        this.refinedSearches[passageId] = [];
        Backbone.Events.trigger("search:refined:closed:" + passageId, {} );
    },

    changePassageNoOptions: function (passageId, detail, version, reference, extraVersions, interlinearMode) {
        return this.changePassage(passageId, detail, version, reference, undefined, extraVersions, interlinearMode);
    },

    /**
     * Changes the passage
     * @param passageId the passageId (0 for left, 1 for right)
     * @param detail used, because we need it in the URL, but that's all for now
     * @param version the selected bible or commentary
     * @param reference the reference
     * @param options the list of options
     * @param interlinearMode the interlinear mode selected
     * @param extraVersions the versions with which to see this.
     */
    changePassage: function (passageId, detail, version, reference, options, extraVersions, interlinearMode) {
//        console.log("Changing passage to", version, reference, options, extraVersions, interlinearMode);

        this.updateMenuModel(passageId, "SEARCH_PASSAGE");

        options = options || "";
        interlinearMode = interlinearMode || "";
        extraVersions = extraVersions || "";

        var self = this;
        if (!step.util.raiseErrorIfBlank(version, __s.error_version_missing)
            || !step.util.raiseErrorIfBlank(reference, __s.error_reference_missing)) {
            return;
        }

        var url = BIBLE_GET_BIBLE_TEXT + [version, reference, options, extraVersions, interlinearMode].join("/");

        if (this.lastUrls[passageId] == url) {
            //execute all callbacks only
//            step.passage.executeCallbacks(passageId);
            return;
        }
        this.lastUrls[passageId] = url;


        // send to server
        var startTime = new Date().getTime();

        $.getPassageSafe({
            url: url,
            callback: function (text) {
                text.startTime = startTime;
                text.version = version;
                Backbone.Events.trigger("passage:new:" + passageId, text);
            },
            passageId: passageId,
            level: 'error'
        });

        //now sync changes to model, since we've just requested this
        PassageModels.at(passageId).save({
            version: version,
            reference: reference,
            options: options.split(""),
            interlinearMode: interlinearMode,
            extraVersions: extraVersions,
            detailLevel: detail
        });

        this.fullSearchUrl[passageId] = undefined;
    }
});
