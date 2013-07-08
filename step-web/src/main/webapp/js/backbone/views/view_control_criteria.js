var CriteriaControlView;

var fragmentsLoading = {};
CriteriaControlView = Backbone.View.extend({
    el: function () {
        return $(".advancedSearch").eq(this.model.get("passageId"));
    },

    initialize: function () {
        this.listenTo(this.model, "change", this._changeVisibleCriteria);
        Backbone.Events.on("search:refined:closed:" + this.model.get("passageId"), this.forceResyncOfQuerySyntax, this);
        this.passageToolbarContainer = this.$el.parent().find(".passageToolbarContainer");

        //show the right fieldset
        this._changeVisibleCriteria();
    },

    /**
     * Forces a resync of the query syntax and then a search.
     */
    forceResyncOfQuerySyntax : function() {
        var modelDescription = this.getClassesForModelType(this.model.get("selectedSearch"));
        var searchModel = modelDescription.models.at(this.model.get("passageId"));
        searchModel.save({ querySyntax : searchModel.evaluateQuerySyntax() });
        searchModel.trigger("search", searchModel);

    },

    /**
     * Changes the field set that is current showing
     */
    _changeVisibleCriteria: function () {
        var selectedSearch = this.model.get("selectedSearch");

        //check if criteria is present on the page, otherwise load it dynamically! Woohoo!
        var fieldsets = this.$el.find("fieldset");
        var criteria = fieldsets.filter("[name='" + selectedSearch + "']");
        if (criteria.length == 0) {
            //not yet loaded
            var self = this;

            if (!fragmentsLoading[selectedSearch]) {
                fragmentsLoading[selectedSearch] = true;
//                console.log("Loading ", selectedSearch, "from server", new Error().stack);
                $.getSafe("js/search/fragments/" + selectedSearch + ".jsp", function (dataFragment) {
                    var fieldset = $($("<span>").html(dataFragment).children()[0]).unwrap();
                    fieldset.insertAfter(fieldsets[fieldsets.length - 1]);

                    //append to the other fieldset as well
                    var passageId = self.model.get("passageId");
                    var lastInOtherColumn = $("fieldset:last", step.util.getPassageContainer(self.model.get("passageId") + 1 % 2));
                    var othercolumnFieldset = fieldset.clone().hide();
                    othercolumnFieldset.insertAfter(lastInOtherColumn);

                    var allFieldsets = passageId == 0 ? [fieldset, othercolumnFieldset] : [othercolumnFieldset, fieldset];

                    //now need to create a view/model object for the fieldset... of the right type...
                    self.createViewFor(selectedSearch, allFieldsets);
                    self.deferredChangeVisibleCriteria();

                    //since we have manually loaded up the view & models, we need to trigger a change
                    //to force a change update.
                    self.model.trigger("forceSearch", self.model);
                });
            }
        } else {
            //first time, we kick off the forceSearch
            if(!fragmentsLoading[selectedSearch]) {
                fragmentsLoading[selectedSearch] = true;
                this.model.trigger("forceSearch", this.model);
            }

            this.deferredChangeVisibleCriteria();
        }
    },

    /**
     * Creates a view, and potentially a model as well for the selected search
     * @param selectedSearch the type of search that was just loaded
     * @param fieldsets the fieldsets that we pass to the view
     */
    createViewFor: function (selectedSearch, fieldsets) {
        var modelDescription = this.getClassesForModelType(selectedSearch);
        this._fetch(selectedSearch, fieldsets,
            modelDescription.models, modelDescription.modelType,
            modelDescription.criteriaType, modelDescription.viewType,
            modelDescription.paged);
    },

    /**
     * Returns a {} of the relevant classes for a particular type
     * @param modelType
     */
    getClassesForModelType : function(modelType) {
        switch (modelType) {
            case "subject":
                return {
                    models : SubjectModels, modelType: SubjectSearchModel,
                    criteriaType: SubjectCriteria, viewType: SubjectDisplayView, paged : false
                };
            case "text":
                return {
                    models : SimpleTextModels, modelType: SimpleTextSearchModel,
                    criteriaType: TextCriteria, viewType: TextDisplayView, paged : true
                };
            case "original":
                return {
                    models : WordSearchModels, modelType: WordSearchModel,
                    criteriaType: WordCriteria, viewType: WordDisplayView, paged : true
                };
            case "advanced":
                return {
                    models : AdvancedSearchModels, modelType: AdvancedSearchModel,
                    criteriaType: AdvancedCriteria, viewType: TextDisplayView, paged : true
                };
            default :
                console.log("ERROR: Unable to work out which search was desired.", modelType);
                return undefined;
        }
    },

    /**
     * Fetch models, and creates 2 if they don't exist...
     * @param models the models list
     * @param fieldsets the fieldsets, in the right order
     * @paged true to indicate the results that are retrieved support paging. Defaults to !paged, so !undefined=true
     * @private
     */
    _fetch: function (searchType, fieldsets, models, modelClass, criteriaClass, displayClass, paged) {
        for (var i = 0; i < PASSAGE_IDS; i++) {
            new criteriaClass({ model: models.at(i), searchType: searchType, el: fieldsets[i] });
            new displayClass({ model: models.at(i), searchType: searchType, paged: paged});
        }
    },

    /**
     * Operations to do, after loading and inserting new fieldset into the DOM.
     * By this time, we may have more fieldsets, or the selected search might be different,
     * so we always take the latest values from the model.
     */
    deferredChangeVisibleCriteria: function () {
        var passageId = this.model.get("passageId");
        if(passageId == 1) {
            step.state.view.ensureTwoColumnView();
        }

        var selectedSearch = this.model.get("selectedSearch");
        var fieldsets = this.$el.find("fieldset");
        this.passageToolbarContainer.toggle(selectedSearch == "SEARCH_PASSAGE");
        fieldsets.hide().filter("[name='" + selectedSearch + "']").show();

        //always empty the passage content
        step.util.ui.emptyOffDomAndPopulate(step.util.getPassageContent(passageId), $("<div>"))
    }
});
