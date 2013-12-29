var StepRouter = Backbone.Router.extend({
    routes : {
        "!search/:query": "doMasterSearch"
    },
    initialize: function() {
    },
    
    navigateSearch : function(args) {
        var activePassageId = 0;
        var options = step.passages.at(activePassageId).get("passage").display
        
        if(step.util.isBlank(args)) {
            var previousUrl = Backbone.history.getFragment() || "";
            previousUrl = previousUrl.replace(/options=[a-zA-Z]*/ig, "").replace(/\|+$/ig, "");
            this.navigate(previousUrl + "|options=" + options, { trigger: true });
        } else {
            this.navigate("!search/" + args + "|options=" + options, { trigger: true});
        }
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
                    } else {
                        passageModel.set("data", text);
                    }
                   
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