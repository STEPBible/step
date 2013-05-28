var PassageCriteriaList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passage-criteria"),
    initialize: function () {
        this.on("search", this.changePassage, this);
        this.on("change", this.changePassage, this);
    },
    changePassage: function (model, val, options) {
        console.log("Change to model", model)
        if (model != null) {
            stepRouter.navigatePassage(model.getLocation(), {trigger: true});
        } else {
            console.log("Model was null so can't route to a passage location")
        }
    }
});

var MenuList = Backbone.Collection.extend({
    model: SearchMenuModel,
    localStorage: new Backbone.LocalStorage("menu-criteria"),
    initialize: function () {
        this.on("change forceSearch", this.triggerModelChange, this);
    },

    triggerModelChange: function (model, val, options) {
        console.log("Change to model", model)
        if (model != null) {
            var currentSearch = model.get("selectedSearch");

            //need to get the right model and trigger a navigatePassage
            var passageId = model.get("passageId");
            var passageColumnModel;
            switch (currentSearch) {
                case "SEARCH_PASSAGE":
                case "passage" :
                    passageColumnModel = PassageModels.at(passageId);
                    break;
                case "subject":
                    passageColumnModel = SubjectModels.at(passageId);
                    break;
                case "original":
                    passageColumnModel = WordSearchModels.at(passageId);
                    break;
                case "text":
                    passageColumnModel = SimpleTextModels.at(passageId);
                    break;
                case "advanced":
                    passageColumnModel = AdvancedSearchModels.at(passageId);
                    break;
            }
            if(passageColumnModel != null) {
                passageColumnModel.trigger("search", passageColumnModel);
            } else {
                console.log("ERROR: passageColumnModel was null.");
            }
        } else {
            console.log("Model was null so can't route to a passage location")
        }
    }
});

var SubjectList = Backbone.Collection.extend({
    model: SubjectSearchModel,
    localStorage: new Backbone.LocalStorage("subject-criteria"),

    initialize: function () {
        this.on("search", this.triggerSearch, this);
        this.on("change", this.triggerModelChange, this);
    },

    triggerModelChange: function (model, val, options) {
        //estimate search
        console.log("Estimate search");
    },

    triggerSearch: function (model, val, options) {
        console.log("Trigger SUBJECT search");
        stepRouter.navigatePassage(model.getLocation(), {trigger: true});
    }

});


var SimpleTextList = Backbone.Collection.extend({
    model: SimpleTextSearchModel,
    localStorage: new Backbone.LocalStorage("simple-text-criteria"),

    initialize: function () {
        this.on("search", this.triggerSearch, this);
        this.on("change", this.triggerModelChange, this);
    },

    triggerModelChange: function (model, val, options) {
        //estimate search
        console.log("Estimate search");
    },

    triggerSearch: function (model, val, options) {
        console.log("Trigger SIMPLE TEXT search");
        stepRouter.navigatePassage(model.getLocation(), {trigger: true});
    }

});


var WordSearchList = Backbone.Collection.extend({
    model: WordSearchModel,
    localStorage: new Backbone.LocalStorage("word-search-criteria"),

    initialize: function () {
        this.on("search", this.triggerSearch, this);
        this.on("change", this.triggerModelChange, this);
    },

    triggerModelChange: function (model, val, options) {
        //estimate search
        console.log("Estimate search");
    },

    triggerSearch: function (model, val, options) {
        console.log("Trigger ORIGINAL WORD search");
        stepRouter.navigatePassage(model.getLocation(), {trigger: true});
    }
});

var AdvancedSearchList = Backbone.Collection.extend({
    model: AdvancedSearchModel,
    localStorage: new Backbone.LocalStorage("advanced-search-criteria"),

    initialize: function () {
        this.on("search", this.triggerSearch, this);
        this.on("change", this.triggerModelChange, this);
    },

    triggerModelChange: function (model, val, options) {
        //estimate search
        console.log("Estimate search");
    },

    triggerSearch: function (model, val, options) {
        console.log("Trigger ORIGINAL WORD search");
        stepRouter.navigatePassage(model.getLocation(), {trigger: true});
    }
});

var stepRouter;
var PassageModels;
var MenuModels;
var SubjectModels;
var SimpleTextModels;
var WordSearchModels;
var AdvancedSearchModels;

//var PassageCriterias = new PassageCriteriaList;
function initApp() {
    PassageModels = new PassageCriteriaList;
    MenuModels = new MenuList;
    SubjectModels = new SubjectList;
    SimpleTextModels = new SimpleTextList;
    WordSearchModels = new WordSearchList;
    AdvancedSearchModels = new AdvancedSearchList;

    PassageModels.fetch();
    MenuModels.fetch();

    //create new router
    stepRouter = new StepRouter();

    //check if we've got any models yet...
    var passageIds = 2;
    var passageModels = [];
    for (var i = 0; i < passageIds; i++) {
        //if i is less than the length of the stored models, then it means we already have a model
        var passageModel = i < PassageModels.length ? PassageModels.at(i) : new PassageModel({ passageId: i });
        var searchModel = i < MenuModels.length ? MenuModels.at(i) : new SearchMenuModel({ passageId: i});

        //add to collections to store state locally
        PassageModels.add(passageModel);
        MenuModels.add(searchModel);

        var passageCriteria = new PassageCriteriaView({ model: passageModel });
        var passageDisplay = new PassageDisplayView({ model: passageModel });

        //menus
        var menu = new PassageMenuView({ model: passageModel });
        var searchMenu = new SearchMenuView({ model: searchModel});

        //control of layout
        var criteriaControlView = new CriteriaControlView({ model: searchModel });
        passageModels.push(passageModel);
    }

    Backbone.history.start();

//    //trigger changes
//    for(var i = PassageModels.length -1; i >= 0 ; i--) {
//        var model = PassageModels.at(i);
//        model.trigger("change", model);
//    }
}
