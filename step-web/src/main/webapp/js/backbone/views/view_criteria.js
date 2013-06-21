var SearchCriteria = Backbone.View.extend({
    events: {
        "keyup input[type='text']:not(.drop)": "updateModel",
        "keyup .querySyntax": "updateQuerySyntaxInModel",
        "change input.drop": "updateModel",
        "change input[type='hidden']": "updateModel",
        "click .resetSearch": "resetSearch",
        "click .doSearch": "doSearch"
    },

    initialize: function () {
        var self = this;

        //always run the following methods in the context of the view
        _.bindAll(this);

        //we have marked fields as _m if they are in the model. The first class indicates the field name
        var viewElements = this.$el.find("._m");
        var changed = false;
        this.viewElementsByName = {};

        for (var i = 0; i < viewElements.length; i++) {
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
        if (!syncRestored && changed) {
            //save to the model
            this.saveAllToModel();
        }

        this.querySyntax = this.$el.find(".querySyntax");
        this.pageNumber = this.$el.find(".pageNumber");
        this.searchVersions = this.$el.find(".searchVersions");
        this.searchVersions.versions({ multi: true });

        this.detailLevel = this.$el.detailSlider({
            changed: function (newValue) {
                self.model.save({ detail: newValue });
            },
            model: self.model});
        this.searchButton = this.$el.find(".doSearch").button();
        this.resetButton = this.$el.find(".resetSearch").button();

        this.model.on("change", this._updateQuerySyntaxFromModel, this);
        this.model.on("resync", this.syncValuesWithModel, this);
        this.initSearchToolbar();
        Backbone.Events.on("search:rendered:" + this.model.get("passageId"), this.evaluatePageNumberState);
    },

    initSearchButton: function (clazz, icon, modelAttribute, increment, uiStatusFunction, validateFunction) {
        var self = this;
        $(clazz, this.$el).button({ text: false, icons: { primary: icon }})
            .click(function (e) {
                e.preventDefault();

                var currentContext = self.model.get(modelAttribute);
                var currentContextValue = parseInt(currentContext);
                var newContext = currentContextValue + increment;

                //check new value:
                if(validateFunction(newContext)) {
                    var newAttributes = {};
                    newAttributes[modelAttribute] = newContext;
                    self.model.save(newAttributes);
                    self.model.trigger("search", self.model);
                    if(uiStatusFunction) {
                        uiStatusFunction();
                    }
                }
            });
    },

    initContextButtons: function () {
        this.initSearchButton(".moreSearchContext", "ui-icon-plusthick", "context", 1, this.evaluateContextButtonState, this.isValidContext);
        this.initSearchButton(".lessSearchContext", "ui-icon-minusthick", "context", -1, this.evaluateContextButtonState, this.isValidContext);
        this.evaluateContextButtonState();
    },

    previousNextPageButtons: function () {
        this.initSearchButton(".nextPage", "ui-icon-arrowreturnthick-1-w", "pageNumber", 1, undefined, this.isValidPageNumber);
        this.initSearchButton(".previousPage", "ui-icon-arrowreturnthick-1-w", "pageNumber", -1, undefined, this.isValidPageNumber);
        this.evaluatePageNumberState();
    },

    isValidContext : function(value) {
        return value >= 0;
    },

    isValidPageNumber : function(value) {
        return value > 0 && this.isPageWithinResults(value);
    },

    isPageWithinResults : function(newValue) {
        //validate page is within the right scope
        var approxPages = stepRouter.totalResults[this.model.get("passageId")] / this.model.get("pageSize");

        //we might have an exact number of pages, if we don't, we need to add 1
        var fullPages = Math.floor(approxPages);
        var leftOver = approxPages - fullPages;
        var numPages = leftOver == 0 ? approxPages : fullPages + 1;
        return newValue <= numPages;
    },

    adjustPageSizeButtons: function () {
        var self = this;
        $(".adjustPageSize", this.$el).button({ icons: { primary: "ui-icon-arrowstop-1-s" }, text: false })
            .click(function (e) {
                e.preventDefault();
                var passageId = self.model.get("passageId");
                var windowHeight = $(window).height();
                var targetPageSize = 1;
                var pageSize = self.model.get("pageSize");

                var container = step.util.getPassageContainer(self.$el);
                if (pageSize != step.defaults.pageSize) {
                    targetPageSize = step.defaults.pageSize;
                } else {
                    //find the one that extends beyond the window height
                    var rows = $("tr.searchResultRow", container);
                    for (var i = 0; i < rows.size(); i++) {
                        if (rows.eq(i).offset().top + rows.eq(i).height() > windowHeight) {
                            targetPageSize = i - 1;
                            break;
                        }
                    }
                }

                var ref = container.find(".searchResultRow:first [ref]").attr("ref");
                //now that we have adjusted the page size, we need to work out if
                //we need to work out the corresponding page number
                var oldPageNumber = self.model.get("pageNumber");
                var firstResultOnOldPageIndex = (oldPageNumber -1) * pageSize + 1;
                var newApproxPageNumber = firstResultOnOldPageIndex / targetPageSize;
                var newWholePage = Math.floor(newApproxPageNumber);
                var newDecimal = newApproxPageNumber - newWholePage;
                var newPageNumber = newDecimal == 0 ? newApproxPageNumber : newWholePage + 1;

                Backbone.Events.once("search:rendered:" + self.model.get("passageId"), function() {
                    var searchResult = $(".searchResultRow [ref='" + ref + "']", container);
                    var passageContent = container.find(".passageContent");
                    var linkOffset = searchResult.offset();
                    var scroll = linkOffset == undefined ? 0 : linkOffset.top - passageContent.height();

                    var originalScrollTop = passageContent.scrollTop();
                    passageContent.animate({
                        scrollTop: originalScrollTop + scroll
                    }, 500, 'swing', function() {
                        var resultRowParent = $(".searchResultRow [ref='" + ref + "']", container).parent();
                        resultRowParent.animate({ 'background-color' : '#EBEBF1'}, 600, 'swing', function() {
                            resultRowParent.animate({ "background-color": 'transparent'}, 600);
                        });
                    });
                });

                self.model.save({ pageSize : targetPageSize, pageNumber: newPageNumber });
                self.model.trigger("search", self.model);
            });
    },



    refineSearchButton: function () {
        var self = this;
        $(".refineSearch", this.$el).button({ text: false, icons: { primary: "ui-icon-pencil" } })
            .click(function () {
                stepRouter.addRefinedSearch(self.model.get("passageId"));

                var container = step.util.getPassageContainer(self.$el);
                var refinedSearchBox = container.find(".refinedSearch");
                refinedSearchBox.find(".refinedSearchLabel")
                         .html(__s.refine_search_results + " " +
                        step.util.undoReplaceSpecialChars(self.model.getBaseSearch()));

                //blank the results
                self.$el.find(".resultEstimates").html("");

                //trigger the reset button
                self.resetSearch();
                refinedSearchBox.show();
            });
    },

    showHideCriteria: function () {
        $(".showSearchCriteria", this.$el).button({ text: false, icons: { primary: "ui-icon-circle-triangle-s" }})
            .click(function () {
                $(this).parent().find(".hideSearchCriteria").show();
                $(this).hide();
                $(this).closest(".searchToolbar").closest("fieldset").children().not(".searchToolbar").show();
                refreshLayout();
            }).hide();


        $(".hideSearchCriteria", this.$el).button({ text: false, icons: { primary: "ui-icon-circle-triangle-n" }})
            .click(function () {
                $(this).parent().find(".showSearchCriteria").show();
                $(this).hide();
                $(this).closest(".searchToolbar").closest("fieldset").children().not(".searchToolbar").hide();
                refreshLayout();
            });
    },

    initSearchToolbar: function () {
        this.initContextButtons();
        this.adjustPageSizeButtons();
        this.previousNextPageButtons();
        this.refineSearchButton();
        this.showHideCriteria();
        step.fonts.fontButtons(this.$el);

        $(".searchToolbarButtonSets", this.$el).buttonset();
        $(step.util).hear("versions-initialisation-completed", function () {
            $.each($(".searchVersions"), function (i, item) {
                $(item).versions({
                    multi: true
                });
            });
        });
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

    evaluateContextButtonState: function () {
        var currentContext = this.model.get("context");
        $(".lessSearchContext", this.$el).button("option", "disabled", currentContext == 0);
    },

    evaluatePageNumberState: function () {
        var currentPage = this.model.get("pageNumber");
        $(".previousPage", this.$el).button("option", "disabled", currentPage == 1);
        $(".nextPage", this.$el).button("option", "disabled", !this.isPageWithinResults(currentPage+1) );
    },

    /**
     * Syncs the values in the view from the model values
     * @return true if any of the values has been changed.
     */
    syncValuesWithModel: function () {
        var changed = false;
        var keyValuePairs = this.model.pairs();
        for (var i = 0; i < keyValuePairs.length; i++) {
            if (this.viewElementsByName[keyValuePairs[i][0]]) {
                //get previous value
                var previousValue = this.viewElementsByName[keyValuePairs[i][0]].val();
                if (previousValue != this.viewElementsByName[keyValuePairs[i][1]]) {
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
    saveAllToModel: function () {
        var attributes = {};
        for (var propName in this.viewElementsByName) {
            var element = this.viewElementsByName[propName];

            attributes[propName] = this._getValue(element);
        }

        this.model.save(attributes);
    },

    /**
     * Updates the model, then updates the view of the query syntax
     */
    updateModel: function (event) {
        if (event == undefined) {
            console.log("WARNING: calling update model with no event");
        }

        //we'll get the target, iterate through its classes, looking for a field
        //that is declared that exactly matches what we're after...
        var targetElement = $(event.target);
        var classes = targetElement.attr("class");
        if (!classes) {
            return;
        }

        var individualClasses = classes.split(' ');
        for (var i = 0; i < individualClasses.length; i++) {
            if (this.viewElementsByName[individualClasses[i]]) {
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
    _getValue: function (element) {
        var value = element.val();
        var source = element.attr("source");

        //resolve the value from the dropdown...
        if (source) {
            //then switch out the value for its equivalent
            var values = step.util.getPointer(source);
            for (var i = 0; i < values; i++) {
                if (values[i] == value) {
                    break;
                }

                if (values[i].label == value) {
                    value = values[i].value;
                    break;
                }
            }
        }
        return value;
    },

    /**
     * Blanks the search
     */
    resetSearch: function () {
        for (var propName in this.viewElementsByName) {
            var element = this.viewElementsByName[propName];
            if (element.hasClass("drop")) {
                var source = element.attr("source");
                var sourceData = step.util.getPointer(source);
                if (sourceData) {
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
