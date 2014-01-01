var StepRouter = Backbone.Router.extend({
    routes : {
        "!search/:query": "doMasterSearch"
    },
    initialize: function() {
    },
    
    navigateSearch : function(args, historyOptions) {
        var activePassageId = 0;
        var passageOptions = step.passages.at(activePassageId).get("data");
        var options = passageOptions.selectedOptions || "";
        var interlinearMode =  passageOptions.interlinearMode || "";
            
        var urlStub = "";
        if(step.util.isBlank(args)) {
            var previousUrl = Backbone.history.getFragment() || "";
            previousUrl = previousUrl
                .replace(/options=[_a-zA-Z]*/ig, "")
                .replace(/display=[_a-zA-Z]*/ig, "")
                .replace(/\|+$/ig, "");

            urlStub += previousUrl;
        } else {
            urlStub += "!search/" + args;
        }
        urlStub += "|options=" + options;
        if(interlinearMode != undefined && interlinearMode != "NONE") {
            urlStub += "|display=" + interlinearMode;
        }
        
        if(!historyOptions) {
            historyOptions = { trigger: true};
        }
        this.navigate(urlStub, historyOptions);
    },
    
    doMasterSearch : function(query) {
            var startTime = new Date().getTime();
            var activePassageId = 0;
            
            $.getPassageSafe({
                url: SEARCH_MASTER,
                args: [query],
                callback: function (text) {
                    text.startTime = startTime;
                    
                    var passageModel;
                    if(activePassageId < step.passages.length) {
                        for(var i = 0; i < step.passages.length; i++) {
                            passageModel = step.passages.at(activePassageId);
                            if(passageModel.get("passageId") == activePassageId) {
                                break;
                            } else {
                                passageModel = undefined;
                            }
                        }
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
                    new PassageDisplayView({
                        model: passageModel
                    });
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