var PassageCriteriaView;
PassageCriteriaView = Backbone.View.extend({
    el: function() { return $($("fieldset[name='SEARCH_PASSAGE']")[this.model.get("passageId")]); },
    events: {
        "change input.drop": "updateModel",
        "click .searchPassage": "changePassage",
        "click .resetVersions": "resetVersions"
    },

    initialize: function () {
        var self = this;
        this.version = this.$el.find(".passageVersion");
        this.reference = this.$el.find(".passageReference");
        this.extraVersions = this.$el.find(".extraVersions");
        this.interlinearMode = this.$el.find(".extraVersionsDisplayOptions");
        this.detailLevel = this.$el.detailSlider({ changed : function(newValue) {
            self.model.save({ detailLevel : newValue });
        }});

        this.versionInfo = this.$el.find(".infoAboutVersion").button({ icons: { primary: "ui-icon-info" }, text: false});
        this.$el.find(".searchPassage").button({ icons: { primary: "ui-icon-search" }, text: false });
        this.$el.find(".resetVersions").button({ icons: { primary: "ui-icon-close" }, text: false});
        this.$el.find(".interlinearHelp").button({ icons: { primary: "ui-icon-help" }, text: false});
        step.util.ui.autocompleteSearch(this.interlinearMode, step.defaults.passage.interOptions);

        this.version.versions();
        this.extraVersions.versions({ multi: true });
        this.reference.biblebooks({ version : this.model.get("version") });

        //listen to model changes on version to update the version dropdown
        this.listenTo(this.model, 'change:version', this._updateViewWithVersionChange);
        this.listenTo(this.model, 'change', this._resyncModelValues);

        this._resyncModelValues();
        this._updateViewWithVersionChange();
    },

    /**
     * Ensures the links are always up to date - as well as the bible books dropdown (reference)
     * @param event the event that occurred
     * @param args the arguments ot the model change
     * @private
     */
    _updateViewWithVersionChange : function(event, args) {
        var version = this.model.get("version");

        //update version held by biblebooks
        this.reference.biblebooks("option", "version", version);

        //update link to version
        this.versionInfo.prop("href", "version.jsp?version=" + version);
        this.versionInfo.prop("title", sprintf(__s.info_about_bible, version));
    },


/**
     * Similar to #updateModel but only does specified attributes
     * @param attributes
     * @private
     */
    _partialUpdate: function (attributes) {
        this.model.save(attributes);
        this._resyncModelValues();
    },

    /**
     * Updates the model, and resyncs the values in the boxes
     */
    updateModel: function (event) {
        if(event == undefined) {
            console.log("WARNING: calling update model with no event");
        }

             if(event.target == this.version.get(0)) { this.model.save({ version : this.version.val() })}
        else if(event.target == this.reference.get(0)) { this.model.save({ reference : this.reference.val() })}
        else if(event.target == this.extraVersions.get(0)) { this.model.save({ extraVersions : this.extraVersions.val() })}
        else if(event.target == this.interlinearMode.get(0)) { this.model.save({ interlinearMode : this.interlinearMode.val() })}
        else if(event.target == this.detailLevel.get(0)) { this.model.save({ detailLevel : this.detailLevel.detailSlider("value") })}

        //after saving the model, we need to make sure the values in the boxes match up
        //to what's in the model, since there is logic in there
        this._resyncModelValues();
    },

    /**
     * Resyncs all the values from the model
     * @private
     */
    _resyncModelValues: function () {
        var modelDetailValue = this.model.get("detailLevel");
        var detailValue = this.detailLevel.detailSlider("value");
        if(detailValue != modelDetailValue) {
            this.detailLevel.detailSlider("handleSlide", modelDetailValue);
        }

        this._setValIfChanged(this.version, this.model.get("version"));
        this._setValIfChanged(this.reference, this.model.get("reference"));
        this._setValIfChanged(this.extraVersions, this.model.get("extraVersions"));
        this._setValIfChanged(this.interlinearMode, this.model.getInternationalisedInterlinearMode());

        //we also do the interlinear mode dropdown
        this._resyncAvailableInterlinearOption();
    },

    /**
     * Sets up the auto-completion and enabled/disabled properties
     */
    _resyncAvailableInterlinearOption: function () {
        var availableOptions = this.model.getAvailableInterlinearOptions();

        if (availableOptions && availableOptions.length > 0) {
            //enable & set up the autocomplete options
            this.interlinearMode.prop("disabled", false);
            this.interlinearMode.autocomplete("option", "source", availableOptions);
        } else {
            //disable & blank out the value
            this.interlinearMode.prop("disabled", true);
            this.interlinearMode.val("");
        }
    },

    /**
     * Calls the val() method if the value has changed
     * @param input the input on the page
     * @param newValue the new value to be set
     * @private
     */
    _setValIfChanged: function (input, newValue) {
        var previousValue = input.val();
        if (previousValue != newValue) {
            input.val(newValue);
        }
    },

    /**
     * Triggers a change on the model
     */
    changePassage: function () {
        this.model.trigger("change", this.model);
    },

    /**
     * Blanks out the extra versions and updates the model
     */
    resetVersions: function () {
        this.extraVersions.val("");
        this.updateModel({ target : this.extraVersions.get(0) });
    }
});
