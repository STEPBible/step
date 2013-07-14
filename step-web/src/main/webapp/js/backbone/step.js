var PassageCriteriaList = Backbone.Collection.extend({
    model: PassageModel,
    localStorage: new Backbone.LocalStorage("passage-criteria"),
    initialize: function () {
        this.on("search", this.changePassage, this);
        this.on("change", this.changePassage, this);
    },

    changePassage: function (model, val, options) {
//        console.log("Change to model", model)
        if (model != null) {
            //we make one exception, and that is if were previous syncing
            var previousSyncValue = model.previousAttributes().synced;
            var currentSyncValue = model.get("synced");

            if(previousSyncValue == currentSyncValue || currentSyncValue != -1) {
                stepRouter.navigatePassage(model.getLocation(), {trigger: true});
            }
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
//        console.log("Change to model", model)
        if (model != null) {
            var currentSearch = model.get("selectedSearch");

            //need to get the right model and trigger a navigatePassage
            var passageId = model.get("passageId");
            var passageColumnModel;
            switch (currentSearch) {
                case "SEARCH_PASSAGE":
                case "passage" :
                    passageColumnModel = PassageModels.at(passageId)
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
            if (passageColumnModel != null) {
                if(currentSearch != 'passage') {
                    stepRouter.lastUrls[passageId] = undefined;
                }

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
    },

    triggerSearch: function (model, val, options) {
        console.log("Trigger ORIGINAL WORD search");
        stepRouter.navigatePassage(model.getLocation(), {trigger: true});
    }
});

var QuickLexiconList = Backbone.Collection.extend({
    model: QuickLexiconModel,
    localStorage: new Backbone.LocalStorage("quick-lexicon")
});


var BookmarkList = Backbone.Collection.extend({
    model: BookmarkModel,
    localStorage: new Backbone.LocalStorage("bookmarks")
});


var HistoryList = Backbone.Collection.extend({
    model: BookmarkModel,
    localStorage: new Backbone.LocalStorage("history")
});

var stepRouter;
var PassageModels;
var MenuModels;
var SubjectModels;
var SimpleTextModels;
var WordSearchModels;
var AdvancedSearchModels;
var QuickLexiconModels;
var BookmarkModels;
var HistoryModels;

/**
 * Creates the models for those that are missing
 * @param models the model list
 * @param passageIds the total number of passage ids that we support
 * @param modelClass the class of the model to be created
 * @param searchType the type of search, e.g. subject, text, original, advanced
 */
function createModelsIfRequired(models, modelClass, searchType) {
    models.fetch();
    if (models.length < PASSAGE_IDS) {
        for (var i = 0; i < PASSAGE_IDS; i++) {
            if (models.at(i) == undefined) {
                models.add(new modelClass({ passageId: i, searchType: searchType }));
            }
        }
    }

    for (var i = PASSAGE_IDS; i < models.length; i++) {
        var model = models.at(i);
        model.destroy();
    }

    // if the passage ids are the wrong way round then swap them - this is a counter-measure,
    // as it should never happen in practice.
    if(models.at(0).get("passageId") == 1) {
        var firstModel = models.at(0);
        models.remove(firstModel);
        models.add(firstModel);
    }
}

/**
 * Checks the right menu option in the menu
 */
function doSyncMenu() {
    var passageId = undefined;
    for(var i = 0; i < PassageModels.length; i++) {
        if(PassageModels.at(i).get("synced") != -1) {
            passageId = PassageModels.at(i).get("passageId");
        }
    }

    var syncMode = undefined;

    //the non-master passage has the flag.
    if(passageId == undefined) {
        syncMode = "NO_SYNC";
    } else if(passageId == 0) {
        syncMode = "SYNC_RIGHT";
    } else if(passageId == 1) {
        syncMode = "SYNC_LEFT";
    }
    $.shout("MENU-SYNC", { menu : { element: $("[menu-name='SYNC']") },
        menuItem : { name : syncMode, element: $("[name='" + syncMode + "']") }})
}


var PASSAGE_IDS = 2;
function initApp() {
    PassageModels = new PassageCriteriaList;
    MenuModels = new MenuList;
    SubjectModels = new SubjectList;
    SimpleTextModels = new SimpleTextList;
    WordSearchModels = new WordSearchList;
    AdvancedSearchModels = new AdvancedSearchList;
    QuickLexiconModels = new QuickLexiconList;
    BookmarkModels = new BookmarkList;
    HistoryModels = new HistoryList;

    PassageModels.fetch();
    MenuModels.fetch();
    HistoryModels.fetch();
    BookmarkModels.fetch();
    QuickLexiconModels.fetch();

    step.util.destroyCollection(QuickLexiconModels);
    QuickLexiconModels.add(new QuickLexiconModel);
    new QuickLexicon({ model: QuickLexiconModels.at(0) });

    new BookmarkHistory({ model : { history : HistoryModels, bookmarks: BookmarkModels}} );

    createModelsIfRequired(SubjectModels, SubjectSearchModel, "subject");
    createModelsIfRequired(SimpleTextModels, SimpleTextSearchModel, "text");
    createModelsIfRequired(WordSearchModels, WordSearchModel, "original");
    createModelsIfRequired(AdvancedSearchModels, AdvancedSearchModel, "advanced");

    //create new router
    stepRouter = new StepRouter();

    //check if we've got any models yet...
    var passageModels = [];
    for (var i = 0; i < PASSAGE_IDS; i++) {
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

    doSyncMenu();


    Backbone.history.start();

    //now some events may not have been triggered yet, so we'll be looking to trigger them ourselves.
    //this only affects fieldsets that are not loaded dynamically, i.e. passage.
    //since others are triggered after this thread of execution is completed, and when a XHR request is
    //come back - see forceSearch in view_critieria_control.js
    var columnFragments = stepRouter.getColumnFragments(Backbone.history.getFragment());
    for(var i = 0; i < PASSAGE_IDS; i++) {
        if(columnFragments[i] == undefined) {
            //then we're missing stuff
            console.log("missing passage id: ", i);
            MenuModels.at(i).trigger("change", MenuModels.at(i));
        }
    }
}
