var PassageModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            data: {
                options: "NHVUG",
                interlinearMode: ""
                
            }
        }
    }
});

var PassageModelList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passages"),
    initialize: function () {
        this.on("change", this.changePassage, this);
    },
    changePassage : function(a,b,c) {
        step.router.navigateSearch();
    }
});
