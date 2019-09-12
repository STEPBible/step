var PassageModel = Backbone.Model.extend({
    defaults: function () {
        if (step.util.problematicChromeVersion()) 
            return {
                passageId: 0,
                pageNumber: 1,
                options: "NHVUG",
                isVerseVocab: false,
                interlinearMode: ""
            }
        else
            return {
                passageId: 0,
                pageNumber: 1,
                options: "NHVUG",
                interlinearMode: ""
            }
    }
});

var PassageModelList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passage-searches"),
    initialize: function () {
        this.on("change", this.changePassage, this);
    },
    changePassage : function(a,b,c) {
        //hack for backbone as models don't get created silently
        if(a.get("createSilently")) {
            a.save({createSilently: null}, {silent: true});
            return;
        }
        step.router.navigateSearch();
    }
});
