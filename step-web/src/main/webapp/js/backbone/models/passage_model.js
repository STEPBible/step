var PassageModel = Backbone.Model.extend({
    defaults: function () {
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
        step.router.navigateSearch();
    }
});
