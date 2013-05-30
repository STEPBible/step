var SearchCriteria = Backbone.View.extend({
    events: {
        "keyup input[type='text']:not(.drop)" : "updateModel",
        "keyup .querySyntax": "updateQuerySyntaxInModel",
        "change input.drop" : "updateModel",
        "change input[type='hidden']" : "updateModel",
        "click .resetSearch": "resetSearch",
        "click .doSearch": "doSearch"
    },

    initialize: function () {
        var self = this;

        //we have marked fields as _m if they are in the model. The first class indicates the field name
        var viewElements = this.$el.find("._m");
        var changed = false;
        this.viewElementsByName = {};

        for(var i = 0; i < viewElements.length; i++) {
            var jqElement = $(viewElements[i]);
            var classes = jqElement.attr("class").split(" ");
            if (classes[0] == "_m") {
                console.log("ERROR: Element marked with _m but first class is _m. Should be a unique id");
                continue;
            }

            if (this.viewElementsByName[classes[0]]) {
                console.log("ERROR: Element uses class that has already been defined", classes[0]);
                continue;
            }

            this.viewElementsByName[classes[0]] = jqElement;
            changed |= this.doDropdowns(jqElement, classes);
            this.doQtips(jqElement);
        }

        var syncRestored = this.syncValuesWithModel();
        if(!syncRestored && changed) {
            //save to the model
            this.saveAllToModel();
        }

        this.querySyntax = this.$el.find(".querySyntax");
        this.pageNumber = this.$el.find(".pageNumber");
        this.searchVersions = this.$el.find(".searchVersions");
        this.searchVersions.versions({ multi: true });
//        this.context = this.$el.find(".searchContext");

        this.detailLevel = this.$el.detailSlider({ changed : function(newValue) {
            self.model.save({ detail : newValue });
        }});
        this.searchButton = this.$el.find(".doSearch").button();
        this.resetButton = this.$el.find(".resetSearch").button();

        this.model.on("change", this._updateQuerySyntaxFromModel, this);
        this.model.on("resync", this.syncValuesWithModel, this);
        step.util.ui.initSearchToolbar(this.$el);
    },

    /**
     * Sets up the dropdowns
     * @param jqElement the jquery element
     * @param classes the classes
     * @returns {boolean}
     */
    doDropdowns: function (jqElement, classes) {
        var changed = false;
        //if view is a dropdown, then we'll also add the autocomplete side of things
        if (jqElement.hasClass("drop")) {
            var source = jqElement.attr("source");

            if (source) {
                var readOnly = jqElement.attr("ro");
                var sourceData = step.util.getPointer(source);
                var callback = this[classes[0] + "Changed"];
                if (callback) {
                    callback = _.bind(callback, this);
                }

                changed |= step.util.ui.autocompleteSearch(
                    jqElement,
                    sourceData,
                    readOnly == "true",
                    callback);
            }
        }
        return changed;
    },

    /**
     * Sets up the qtips of any element that has a title!
     * @param jqElement
     */
    doQtips: function (jqElement) {
        if (jqElement.attr("title")) {
            //also add a qtip
            jqElement.qtip({
                show: { event: 'focus' }, hide: { event: 'blur' },
                position: { at: "right center", my: "left center", viewport: $(window) },
                style: { classes: "primaryLightBg primaryLightBorder" }
            });
        }
    },

    /**
     * Syncs the values in the view from the model values
     * @return true if any of the values has been changed.
     */
    syncValuesWithModel : function() {
        var changed = false;
        var keyValuePairs = this.model.pairs();
        for(var i = 0; i < keyValuePairs.length; i++) {
            if(this.viewElementsByName[keyValuePairs[i][0]]) {
                //get previous value
                var previousValue = this.viewElementsByName[keyValuePairs[i][0]].val();
                if(previousValue != this.viewElementsByName[keyValuePairs[i][1]]) {
                    changed |= this.viewElementsByName[keyValuePairs[i][0]].val(keyValuePairs[i][1]);
                }
            }
        }
        return changed;
    },

    /**
     * Saves all elements that have changed to the model. For dropdowns, we either take the same value,
     * or its equivalent value
     */
    saveAllToModel : function() {
        var attributes = {};
        for(var propName in this.viewElementsByName) {
            var element = this.viewElementsByName[propName];

            attributes[propName] = this._getValue(element);
        }

        this.model.save(attributes);
    },

    /**
     * Updates the model, then updates the view of the query syntax
     */
    updateModel: function (event) {
        if(event == undefined) {
            console.log("WARNING: calling update model with no event");
        }

        //we'll get the target, iterate through its classes, looking for a field
        //that is declared that exactly matches what we're after...
        var targetElement = $(event.target);
        var classes = targetElement.attr("class");
        if(!classes) {
            return;
        }

        var individualClasses = classes.split(' ');
        for(var i = 0; i < individualClasses.length; i++) {
            if(this.viewElementsByName[individualClasses[i]]) {
                //we've got the right class
                var fieldName = individualClasses[i];
                var attributes = {};
                attributes[fieldName] = this._getValue(targetElement);
                this.model.save(attributes);
                return;
            }
        }
    },

    /**
     * Updates only the query syntax part
     */
    updateQuerySyntaxInModel: function () {
        this.model.save({ querySyntax: this.querySyntax.val() });
    },

    /**
     * Updates the query syntax from the model
     * @private
     */
    _updateQuerySyntaxFromModel: function () {
        //now get the updated query syntax
        var oldQuerySyntax = this.querySyntax.val();
        var newQuerySyntax = this.model.get("querySyntax");
        if (oldQuerySyntax != newQuerySyntax) {
            this.querySyntax.val(newQuerySyntax);
        }
    },

    /**
     * Gets the value, whether that be from a textfield or a dropdown
     * @param element the element in question
     * @returns {*} the value stored in the field.
     * @private
     */
    _getValue : function(element) {
        var value = element.val();
        var source = element.attr("source");

        //resolve the value from the dropdown...
        if(source) {
            //then switch out the value for its equivalent
            var values = step.util.getPointer(source);
            for(var i = 0; i < values; i++) {
                if(values[i] == value) {
                    break;
                }

                if(values[i].label == value) {
                    value = values[i].value;
                    break;
                }
            }
        }
        return value;
    },

    /**
     * Blanks the search
     * @param event the event originating the trigger
     */
    resetSearch: function (event) {
        for(var propName in this.viewElementsByName) {
            var element = this.viewElementsByName[propName];
            if(element.hasClass("drop")) {
                var source = element.attr("source");
                var sourceData = step.util.getPointer(source);
                if(sourceData) {
                    element.val(sourceData[0].value ? sourceData[0].value : sourceData[0]);
                    continue;
                }
            }

            element.val("");
        }

        this.querySyntax.val("");
        this.saveAllToModel();
    },

    /**
     * Do the search
     */
    doSearch: function () {
        //reset the page number
        this.model.save({ pageNumber: 1 });
        this.pageNumber.val(this.model.get("pageNumber"));
        this.model.trigger("search", this.model);
    }
});
