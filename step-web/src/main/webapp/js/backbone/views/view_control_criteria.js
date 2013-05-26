var CriteriaControlView;

var fragmentsLoading = {};
CriteriaControlView = Backbone.View.extend({
    el: function () {
        return $(".advancedSearch").eq(this.model.get("passageId"));
    },
    defaultPageSize : 50,

    initialize: function () {
        console.log(step.passage.getPassageId(this.$el));

        this.listenTo(this.model, "change", this._changeVisibleCriteria);
        this.passageToolbarContainer = this.$el.find(".passageToolbarContainer");

        //show the right fieldset
        this._changeVisibleCriteria();
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
                    self.deferredChangeVisibleCriteria(fieldsets, selectedSearch);
                });
            }
        } else {
            this.deferredChangeVisibleCriteria(fieldsets, selectedSearch);
        }
    },

    /**
     * Creates a view, and potentially a model as well for the selected search
     * @param selectedSearch the type of search that was just loaded
     * @param fieldsets the fieldsets that we pass to the view
     */
    createViewFor: function (selectedSearch, fieldsets) {
        switch (selectedSearch) {
            case "subject":
                //if models are empty, then fetch, if still empty after that then create one
                //subject search
                this._fetch(selectedSearch, fieldsets, SubjectModels, SubjectSearchModel, SearchCriteria, SubjectDisplayView, false);
                break;
            case "text":
                this._fetch(selectedSearch, fieldsets, SimpleTextModels, SimpleTextSearchModel, TextCriteria, TextDisplayView);
                break;
            case "original":
                this._fetch(selectedSearch, fieldsets, WordSearchModels, WordSearchModel , WordCriteria, WordDisplayView);
                break;
            case "advanced":
                this._fetch(selectedSearch, fieldsets, AdvancedSearchModels, AdvancedSearchModel, AdvancedCriteria, TextDisplayView);
                break;
            default :
                console.log("ERROR: Unable to work out which search was desired.", selectedSearch);
        }
    },

    /**
     * Creates the models for those that are missing
     * @param models the model list
     * @param passageIds the total number of passage ids that we support
     * @param modelClass the class of the model to be created
     * @param searchType the type of search, e.g. subject, text, original, advanced
     */
    createModelsIfRequired: function (models, passageIds, modelClass, searchType) {
        if (models.length < passageIds) {
            var orderedModels = [undefined, undefined];
            for (var i = 0; i < models.length; i++) {
                var savedModel = models.at(i);
                orderedModels[savedModel.get("passageId")] = savedModel;
            }

            for (var i = 0; i < orderedModels.length; i++) {
                if (orderedModels[i] == undefined) {
                    models.add(new modelClass({ passageId: i, searchType : searchType }));
                }
            }
        }
    }, /**
     * Fetch models, and creates 2 if they don't exist...
     * @param models the models list
     * @param fieldsets the fieldsets, in the right order
     * @paged true to indicate the results that are retrieved support paging. Defaults to !paged, so !undefined=true
     * @private
     */
    _fetch: function (searchType, fieldsets, models, modelClass, criteriaClass, displayClass, paged) {
        var passageIds = 2;
        if (models.length < passageIds) {
            models.fetch();
            this.createModelsIfRequired(models, passageIds, modelClass, searchType);
            for(var i = 0; i < passageIds; i++) {
                new criteriaClass({ model: models.at(i), searchType: searchType, el : fieldsets[i] });
                new displayClass({ model: models.at(i), searchType: searchType, paged : !paged});
            }
        }
    },

    /**
     * Operations to do, after loading and inserting new fieldset into the DOM
     * @param fieldsets
     * @param selectedSearch
     */
    deferredChangeVisibleCriteria: function (fieldsets, selectedSearch) {
        this.passageToolbarContainer.toggle(selectedSearch == "SEARCH_PASSAGE");
        fieldsets.hide().filter("[name='" + selectedSearch + "']").show();

        this.trigger("change");
    }
});
