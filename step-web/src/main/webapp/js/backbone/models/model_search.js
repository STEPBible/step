var SearchModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            pageNumber: 1,
            pageSize : step.defaults.pageSize,
            querySyntax: "",
            detail: 0,
            searchType: undefined,
            context: 0,
            searchVersions : "ESV"

        }
    },
    /**
     * A map of keys to references used to resolve the values in the various fields.
     */
    referenceKeys : {},

    /**
     * sets up the listening capabilities
     */
    initialize : function() {
        Backbone.Events.on(this.get("searchType") + ":restoreParams:" + this.get("passageId"), this.updateModel, this);
    },

    /**
     * Takes in a set of parameters and checks they are the ones stored in the model. If not overwrites them.
     * @param params an array of fields that should be set
     */
    updateModel : function(options) {
        var attributes = {};
        for(var i = 0; i < options.params.length; i++) {
            //split into the key/value
            var keyValuePair = options.params[i].split("=");
            attributes[keyValuePair[0]] = this.resolveFromReference(keyValuePair[0], keyValuePair[1]);
        }
        this.set(attributes);

        this.trigger("resync", this.model);
    },

    /**
     * We pick out the attribute that should be used to evaluate the query syntax
     * @param attributes object containing the properties filled in so far
     * @param the property to add if not present already
     */
    getSafeAttribute: function (attributes, propName) {
        if (attributes == null || attributes[propName] == null) {
            return this.get(propName) || "";
        }

        return attributes[propName];
    },

    /**
     * we ensure that, A- we save the correct format of parameters, and B- that we save options that are valid
     * @param attributes the set of attributes to be stored
     * @param options the options to be saved
     * @returns {Function|o.save}
     */
    save: function (attributes, options) {
        //if we have no query syntax, then evaluate it
        if (!attributes.querySyntax && _.size(attributes) != 0) {
            attributes.querySyntax = this.evaluateQuerySyntax(attributes);
        }

        var saveReturn = Backbone.Model.prototype.save.call(this, attributes, options);
        this.trigger("resync", this.model);
        return saveReturn;
    },

    /**
     * Evaluates the query syntax by delegating the call to the child class, but
     * then adds on the refined searches, such that these are in the URLs
     * @param attributes
     * @private
     */
    evaluateQuerySyntax : function(attributes) {
        var querySyntax = this._evaluateQuerySyntaxInternal(attributes);

        if(step.util.isBlank(querySyntax)) {
            console.log("ERROR ERROR - empty query syntax - ERROR ERROR");
        }

        //finalise query, then join them
        querySyntax = this._getFinalQuerySyntax(querySyntax);

        return this._joinInRefiningSearches(querySyntax);
    },

    getBaseSearch : function() {
        if (stepRouter.refinedSearches[this.get("passageId")].length == 0) {
            return "";
        }

        return stepRouter.refinedSearches[this.get("passageId")].join("=>");
    },

    _joinInRefiningSearches: function (query) {
        if (stepRouter.refinedSearches[this.get("passageId")].length != 0) {
            return step.util.undoReplaceSpecialChars(this.getBaseSearch()) + "=>" + query;
        }

        return query;
    },

    /**
     * Returns the location for this search can be bookmarked
     * @returns {string}
     */
    getLocation: function () {
        var urlParts = [
            encodeURIComponent(this.get("passageId")),
            encodeURIComponent(this.get("searchType")),
            encodeURIComponent(this.get("pageNumber")),
            encodeURIComponent(this.getDefaultedValue("pageSize")),
            encodeURIComponent(this.get("querySyntax")),
            encodeURIComponent(this.getDefaultedValue("context")),
            encodeURIComponent(this.getDefaultedValue("searchVersions")),
            encodeURIComponent(this.getDefaultedValue("sortOrder"))
        ];

        //now calculate the field values...
        var params = "";
        for (var name in this.attributes) {
            if (name != "passageId" && name != "searchType" && name != "pageNumber"
                && name != "querySyntax" && name != "id") {
                if (params != "") {
                    params += "|";
                }
                params += name + '=' + encodeURIComponent(this.resolveToReference(name, this.attributes[name]));
            }
        }
        urlParts.push(params);

        //remove the empty values from the end going backwards...
        for (var i = urlParts.length - 1; i >= 0; i--) {
            if (step.util.isBlank(urlParts[i])) {
                urlParts.pop();
            } else {
                break;
            }
        }

        //add an argument if any one argument following
        //the current item is non-null, since we will need it in the URL
        return urlParts.join("/");
    },

    /**
     * By default, it simply returns the value, however, for any keys specified in a map (referenceKeys), it returns
     * the equivalent value matching the key. For example, "Original spelling" would return ORIGINAL SPELLING
     * @param key the field key
     * @param value the current value
     */
    resolveToReference : function(key, value){
        return this.resolve(key, value, "textValues", "referenceValues");
    },

    /**
     * From a reference value, gets the text equivalent
     * @param key the key to the field
     * @param value the value to be looked up
     * @returns {*}
     */
    resolveFromReference : function(key, value){
        return this.resolve(key, value, "referenceValues", "textValues");
    },

    /**
     * By default, it simply returns the value, however, for any keys specified in a map (referenceKeys), it returns
     * the equivalent value matching the key. For example, "Original spelling" would return ORIGINAL SPELLING,
     * or vice-versa depending on the order in which the lookup and corresponding lists are specified.
     * @param key the field key
     * @param value the current value
     */
    resolve : function(key, value, lookupList, correspondingList){
        if(this.referenceKeys[key]) {
            var textValues = this.referenceKeys[key][lookupList];
            var i = 0;
            for(var i = 0; i < textValues.length; i++) {
                if(textValues[i] == value) {
                    break;
                }
            }

            if(i < textValues.length) {
                return this.referenceKeys[key][correspondingList][i];
            }
        }

        return value;
    },

    /**
     * Gets the defaults
     */
    getDefaultedValue: function (attributeName) {
        var value = this.get(attributeName);
        if (!step.util.isBlank(value)) {
            return value;
        }
        return this.getDefault(attributeName);
    },

    getDefault: function (attributeName) {
        switch (attributeName) {
            case "context":
                return 0;
            case "pageNumber":
                return 1;
            case "searchVersions":
                return "ESV";
            case "sortOrder":
                return "NONE";
            case "pageSize":
                return step.defaults.pageSize;
            default:
                return;
        }

    },

    /**
     * Trims and removes extra spaces, and adds the versions in
     * @param querySyntax the query syntax built in its almost final form
     * @private
     */
    _getFinalQuerySyntax: function (querySyntax) {
        var newSyntax = $.trim(querySyntax).replace(/ +/g, " ");
        if(newSyntax != "") {
            newSyntax += " in (" + this.getDefaultedValue("searchVersions") + ")"
        }

        return newSyntax;
    }
});
