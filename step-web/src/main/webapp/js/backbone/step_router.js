var StepRouter = Backbone.Router.extend({
    routes: {
        "search?q=:query": "doMasterSearch"
    },
    initialize: function () {
    },

    navigateSearch: function (args, historyOptions) {
        var activePassageId = step.util.activePassageId();
        var activePassageModel = step.passages.findWhere({ passageId: activePassageId});
        var options = activePassageModel.get("selectedOptions") || "";
        var interlinearMode = activePassageModel.get("interlinearMode") || "";
        var pageNumber = activePassageModel.get("pageNumber");
        var context = activePassageModel.get("context");
        
        if(step.util.isBlank(context)) {
            activePassageModel.set({context: 0 }, { silent: true });
            context = 0;
        }

        var urlStub = "";
        if (step.util.isBlank(args)) {
            var previousUrl = Backbone.history.fragment || "";
            previousUrl = previousUrl
                .replace(/options=[_a-zA-Z]*/ig, "")
                .replace(/display=[_a-zA-Z]*/ig, "")
                .replace(/page=[0-9]*/ig, "")
                .replace(/context=[0-9]*/ig, "")
                .replace(/&debug/ig, "")
                .replace(/\|+$/ig, "")
                .replace (/&&+/ig, "")
                .replace(/&$/ig, "");

            urlStub += previousUrl;
        } else {
            urlStub += "search?q=" + args;
        }
        if (!step.util.isBlank(options)) {
            urlStub += "&options=" + options;
        }
        if (!step.util.isBlank(interlinearMode) && interlinearMode != "NONE") {
            urlStub += "&display=" + interlinearMode;
        }
        if (!step.util.isBlank(pageNumber) && pageNumber != "1") {
            urlStub += "&page=" + pageNumber;
        }
        if(context != 0) {
            urlStub += "&context=" + context;
        }
        if ($.getUrlVars().indexOf("debug") != -1) {
            urlStub += "&debug"
        }

        if (!historyOptions) {
            historyOptions = { trigger: true};
        }

        //we will get a null-arg as part of the replacing of the URL with the correct URL
        //call back from after the routing call to rest backend call. So need
        //to avoid writing over 'args'
        if (args != null) {
            activePassageModel.save({ args: decodeURIComponent(args) }, { silent: true });
        }
        this.navigate(urlStub, historyOptions);
    },
    getShareableColumnUrl: function (element, encodeFragment) {
        return "http://www.stepbible.org/" + encodeURI(Backbone.history.fragment);
    },
    handleSearchResults: function (text, passageModel) {
        require(["search", "defaults"], function (module) {
            if (text.pageNumber > 1) {
                passageModel.trigger("newPage");
            } else {
                passageModel.trigger("destroyViews");
                switch (text.searchType) {
                    case "TEXT":
                        new TextDisplayView({
                            model: passageModel
                        });
                        break;
                    case "SUBJECT_SIMPLE" :
                    case "SUBJECT_EXTENDED" :
                    case "SUBJECT_FULL" :
                    case "SUBJECT_RELATED" :
                        new SubjectDisplayView({
                            model: passageModel
                        });
                        break;
                    case "ORIGINAL_MEANING" :
                    case "ORIGINAL_GREEK_EXACT" :
                    case "ORIGINAL_GREEK_FORMS" :
                    case "ORIGINAL_GREEK_RELATED" :
                    case "ORIGINAL_HEBREW_EXACT" :
                    case "ORIGINAL_HEBREW_FORMS" :
                    case "ORIGINAL_HEBREW_RELATED":
                        new WordDisplayView({
                            model: passageModel
                        });
                        break;
                }
            }
        });
    }, doMasterSearch: function (query, options, display, pageNumber, filter, context, quiet) {
        var self = this;
        if (step.util.isBlank(query)) {
            return;
        }

        var args = query.split("&");
        if (args == null || args.length == 0) {
            return;
        }

        query = args[0];

        for (var i = 1; i < args.length; i++) {
            var myArgs = args[i];
            var splitElement = myArgs.split("=");
            if (splitElement.length < 2) {
                continue;
            }

            switch (splitElement[0]) {
                case 'options':
                    options = splitElement[1];
                    break;
                case 'page':
                    pageNumber = splitElement[1];
                    break;
                case 'display':
                    display = splitElement[1];
                    break;
                case 'context':
                    context = splitElement[1];
            }
        }


        var startTime = new Date().getTime();
        var activePassageId = step.util.activePassageId();

        //remove debug if present
        query = query.replace(/&debug/ig, "");

        $.getPassageSafe({
            url: SEARCH_MASTER,
            args: [query, options, display, pageNumber, filter, context],
            callback: function (text) {
                text.startTime = startTime;

                var passageModel = step.passages.findWhere({ passageId: activePassageId});
                if(passageModel == null) {
                    console.error("No passages defined for ", activePassageId);
                }

                passageModel.save(text, { silent: true });

                //don't trigger a full search, but replace the URL with the one that makes sense
                if(!quiet) {
                    step.router.navigateSearch(null, { trigger: false, replace: true});
                }

                //then trigger the refresh of menu options and such like
                passageModel.trigger("sync-update", {});


                //TODO: revisit, using same views?
                if (text.searchType == 'PASSAGE') {
                    //destroy all views for this column
                    passageModel.trigger("destroyViews");
                    new PassageDisplayView({
                        model: passageModel
                    });
                } else {
                    self.handleSearchResults(text, passageModel);
                }
            },
            passageId: 0,
            level: 'error'
        });
    }
});