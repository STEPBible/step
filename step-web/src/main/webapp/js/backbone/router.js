var StepRouter = Backbone.Router.extend({
    fragments: [undefined, undefined],
    fragmentPrefix: /[0-9]+\/__[a-zA-Z]+\//,
    routes: {
        /*******************************
         * This fragment is deliberately placed above everything else to trap fragments starting with __
         *******************************/
        "__*fragment": "entireUnparsedUrl",
        ":passageId/passage/:detail/:version/:reference(/:options)(/:extraVersions)(/:interlinearMode)": "changePassage",
        ":passageId/passage/:detail/:version/:reference/(/:extraVersions)(/:interlinearMode)": "changePassageNoOptions",
        ":passageId/:searchType/:pageNumber/:querySyntax(/:context)(/:version)(/:sortOrder)": "search"
    },
    lastUrls: [],
    refinedSearch: [],
    pageSize: step.defaults.pageSize,

    /**
     * Navigates for a particular column only.
     * @param fragment
     * @param options
     */
    navigatePassage: function (fragment, options) {
        var trigger = options.trigger;
        delete options.trigger;

        var hash = "";
        try {
            hash = Backbone.history.getFragment();
        } catch (e) {
            console.log("Unable to get fragment, so assuming blank, as history might not be started");
        }

        //if hash is empty then we use the normal mechanism
        if (hash.length == 0 || hash == '#') {
            this.navigate(fragment, options);
            return;
        }

        //trim off the first character if a '#'
        if (hash[0] == '#') {
            hash = hash.substring(0);
        }

        var fragments = this._getColumnFragments(hash);

        var passageIdFromInput = parseInt(fragment.substring(0, fragment.indexOf('/')));

        var newFragment = "__/" + fragment;
        if (fragments[passageIdFromInput] != newFragment) {
            fragments[passageIdFromInput] = newFragment;

            //join all the fragments up again
            this.navigate(fragments.join('/'), options);

            //we trigger the routes manually, for the single individual fragment.
            if (trigger) Backbone.history.loadUrl(fragment);
        }
    },

    /**
     * Retrieves the various fragments from a url.
     *
     * We are going to assume, a __/ fragment indicates the start of a route
     * current url looks like __/passage/....../__/subject/......
     * @param hash the url/hash that should be split up into several pieces.
     */
    _getColumnFragments: function (hash) {
        if (hash == undefined) {
            return [];
        }

        //now, we need to find out the location of each fragment
        var fragments = [];

        //we first calculate the new hash...
        var pos = 1;
        var lastPos = 0;
        while ((pos = hash.indexOf("__/", pos + 1)) != -1) {

            //we remove the trailing slash
            fragments.push(hash.substring(lastPos, pos - 1));
            lastPos = pos;
        }
        fragments.push(hash.substring(lastPos));

        //start positions of each fragment
        console.log(fragments);
        return fragments;
    },

    /**
     * Handles anything that wasn't caught previously, and therefore we assume,
     * that we can divide into multiple sections.
     * @param wholeUrl
     */
    entireUnparsedUrl: function (wholeUrl) {
        console.log("Entire URL was passed in: ", wholeUrl);

        //divide the url up
        var fragments = this._getColumnFragments(wholeUrl);
        for (var i = 0; i < fragments.length; i++) {
            //prevent infinite recursion
            if (fragments[i] != wholeUrl) {
                //also, need to remove the __/ from each fragment
                if (fragments[i].indexOf("__/") == 0) {
                    Backbone.history.loadUrl(fragments[i].substring("__/".length));
                }
                console.log("Unable to route as fragment doesn't start with __/");
            }
        }
    },

    /**
     * Routes searches to the correct place dependant on the search prefix
     * @param passageId
     * @param pageNumber
     * @param querySyntax
     * @param context
     * @param version
     */
    search: function (passageId, searchType, pageNumber, querySyntax, context, version, sortOrder) {

        console.log("TRIGGER SEARCH: ", searchType, querySyntax, new Error().stack);


        var query = step.util.replaceSpecialChars(querySyntax);
        this._validateAndRunSearch(searchType, passageId, query, version, sortOrder, context, pageNumber, sortOrder);
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
    _validateAndRunSearch: function (searchType, passageId, query, version, sortOrder, context, pageNumber) {
        if (step.util.isBlank(query)) {
            step.search._displayResults({}, passageId);
            return;
        }

        var checkedVersion = version;
        if (version == null || version.trim().length == 0) {
            checkedVersion = PassageModels.at(passageId).get("version");

            if (checkedVersion == undefined || checkedVersion.trim().length == 0) {
                checkedVersion = 'ESV';
            }
        }

        this._doSearch(searchType, passageId, query, checkedVersion, pageNumber, sortOrder, context);
    },

    _doSearch: function (searchType, passageId, query, version, pageNumber, sortOrder, context) {
        var self = this;


        //TODO: this adds a version, if not already present, but we don't need to do the above if we already have it!
        var versionArg = query.match(/in \([^)]*\)/) != null ? "" : " in (" + version.toUpperCase() + ")";
        var pageNumberArg = pageNumber == null ? 1 : pageNumber;
        var sortingArg = sortOrder == undefined ? false : sortOrder;
        var contextArg = context == undefined || isNaN(context) ? 0 : context;
        var pageSizeArg = this.pageSize;
        var finalInnerQuery = query + versionArg;

        var refinedQuery = this._joinInRefiningSearches(finalInnerQuery);

        var args = [encodeURIComponent(refinedQuery), sortingArg, contextArg, pageNumberArg, pageSizeArg];

        var startTime = new Date().getTime();
        $.getSafe(SEARCH_DEFAULT, args, function (searchQueryResults) {
            step.util.trackAnalytics("search", "loaded", "time", new Date().getTime() - startTime);
            step.util.trackAnalytics("search", "loaded", "results", searchQueryResults.total);
            step.util.trackAnalytics("search", "version", versionArg.toUpperCase());
            step.util.trackAnalytics("search", "query", query);

            Backbone.Events.trigger(searchType + ":new:" + passageId,
                {
                    searchQueryResults: searchQueryResults,
                    pageNumber: pageNumberArg
                });
        });
    },

    _joinInRefiningSearches: function (query) {
        if (this.refinedSearch.length != 0) {
            return this.refinedSearch.join("=>") + "=>" + query;
        }

        return query;
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
        console.log("Changing passage to", version, reference, options, extraVersions, interlinearMode);

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
            step.passage.executeCallbacks(passageId);
            return;
        }
        this.lastUrls[passageId] = url;


        // send to server
        var startTime = new Date().getTime();

        $.getPassageSafe({
            url: url,
            callback: function (text) {
                text.startTime = startTime;
                Backbone.Events.trigger("passage:new:" + passageId, text);
            },
            passageId: passageId,
            level: 'error'
        });

        //now sync changes to model, since we've just requested this
        PassageModels.at(passageId).save({
            version: version,
            reference: reference,
            options: options.split(),
            interlinearMode: interlinearMode,
            extraVersions: extraVersions,
            detailLevel: detail
        });
    }
});
