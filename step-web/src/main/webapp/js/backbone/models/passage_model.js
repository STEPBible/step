var PassageModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            passage: {
                display: "NHVUG"
            }
//                version: "ESV",
//                reference: "Mat 1",
//                extraVersions: [],
//                interlinearMode: "NONE",
//                detailLevel: 0,
//                options: ["N", "H", "V", "U", "G"],
//                synced : -1
        }
    }
});

var PassageModelList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passages"),
    initialize: function () {
        this.on("change", this.changePassage, this);
    },
    changePassage : function() {
        step.router.navigateSearch();
    }
});
