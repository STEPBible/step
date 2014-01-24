var StepRouter = Backbone.Router.extend({
    routes : {
        "search?q=:query": "doMasterSearch"
    },
    initialize: function() {
    },
    
    navigateSearch : function(args, historyOptions) {
        var activePassageId = step.util.activePassageId();
        var passageOptions = step.passages.at(activePassageId).get("data");
        var options = passageOptions.selectedOptions || "";
        var interlinearMode =  passageOptions.interlinearMode || "";
            
        var urlStub = "";
        if(step.util.isBlank(args)) {
            var previousUrl = Backbone.history.fragment || "";
            previousUrl = previousUrl
                .replace(/options=[_a-zA-Z]*/ig, "")
                .replace(/display=[_a-zA-Z]*/ig, "")
                .replace(/&debug/ig, "")
                .replace(/\|+$/ig, "");

            urlStub += previousUrl;
        } else {
            urlStub += "search?q=" + args;
        }
        urlStub += "|options=" + options;
        if(interlinearMode != undefined && interlinearMode != "NONE") {
            urlStub += "|display=" + interlinearMode;
        }
        
        if($.getUrlVars().indexOf("debug") != -1) {
            urlStub += "&debug"
        }
        
        if(!historyOptions) {
            historyOptions = { trigger: true};
        }
        this.navigate(urlStub, historyOptions);
    },
    getShareableColumnUrl : function(element, encodeFragment) {
        return "http://www.stepbible.org/" + encodeURI(Backbone.history.fragment);
    },
    doMasterSearch : function(query) {
            var startTime = new Date().getTime();
            var activePassageId = step.util.activePassageId();
            
            //remove debug if present
            query = query.replace(/&debug/ig, "");
        
            $.getPassageSafe({
                url: SEARCH_MASTER,
                args: [query],
                callback: function (text) {
                    text.startTime = startTime;
                    
                    var passageModel;
                    if(activePassageId < step.passages.length) {
                        passageModel = step.passages.at(activePassageId);
                    }
                    
                    if(passageModel == null) {
                        passageModel = new PassageModel({ passageId: activePassageId, data: text});
                        step.passages.add(passageModel);
                    }
                    
                    passageModel.save({
                        data: text
                    }, { silent: true });
                    
                    //don't trigger a full search, but replace the URL with the one that makes sense
                    step.router.navigateSearch(null, { trigger: false, replace: true});
                    
                    //then trigger the refresh of menu options and such like
                    passageModel.trigger("sync-update", {});
                    
                    
                    //TODO: revisit, using same views?
                    if(!text.searchType) {
                        new PassageDisplayView({
                            model: passageModel
                        });
                    } else {
                        require(["search", "defaults"], function(module) {
                            switch(text.searchType) {
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
                        });
                    }
                },
                passageId: 0,
                level: 'error'
            });

            //now sync changes to model, since we've just requested this
//            PassageModels.at(passageId).save({
//                version: version,
//                reference: reference,
//                options: options.split(""),
//                interlinearMode: interlinearMode,
//                extraVersions: extraVersions,
//                detailLevel: detail
//            });

//            this.fullSearchUrl[passageId] = undefined;
//        }
//        $.getSafe();
    }
});