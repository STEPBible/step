var PassageCriteriaList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passage-criteria"),
    initialize: function () {
        this.on("change", this.changePassage, this);
    },
    changePassage: function (model, val, options) {
        console.log("Change to model", model)
        if(model != null) {
            stepRouter.navigate(model.getPassageLocation(), {trigger: true});
        } else {
            console.log("Model was null so can't route to a passage location")
        }

    }
});

//var eventBus = _.extend({}, Backbone.Events);


var stepRouter;

//var PassageCriterias = new PassageCriteriaList;
function initApp() {
    var PassageModels = new PassageCriteriaList;

    //check if we've got any models yet...
//    PassageModels.fetch();



    var LeftPassageModel = new PassageModel({
        passageId: 0
    });


    PassageModels.add(LeftPassageModel);

    //create new router
    stepRouter = new StepRouter({
        passageModels : [LeftPassageModel]
    });

    var pcv = new PassageCriteriaView({
        model: LeftPassageModel
    });

    var display = new PassageDisplayView({
        model: LeftPassageModel
    });

    var menu = new PassageMenuView({
        model : LeftPassageModel
    });

    Backbone.history.start();
}
