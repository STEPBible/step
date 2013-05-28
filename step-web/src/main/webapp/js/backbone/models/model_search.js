var SearchModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            pageNumber: 1,
            querySyntax: "",
            detail: 0,
            searchType: undefined
        }
    },

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
    updateModel : function(params) {
        for(var i = 0; i < params; i++) {
            console.log(params[i]);
        }
    },

    /**
     * We pick out the attribute that should be used to evaluate the query syntax
     * @param attributes object containing the properties filled in so far
     * @param the property to add if not present already
     */
    getSafeAttribute: function (attributes, propName) {
        if (attributes[propName] == null) {
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
            attributes.querySyntax = this._evaluateQuerySyntax(attributes);
        }

        console.log("Saving search model", attributes);
        return Backbone.Model.prototype.save.call(this, attributes, options);
    },

    /**
     * Returns the location for this search can be bookmarked
     * @returns {string}
     */
    getLocation: function () {
        var urlParts = [
            this.get("passageId"),
            this.get("searchType"),
            this.get("pageNumber"),
            this.get("querySyntax"),
            this.getDefaultedValue("context"),
            this.getDefaultedValue("searchVersions"),
            this.getDefaultedValue("sortOrder")
        ];

        //now calculate the field values...
        var params = "";
        for (var name in this.attributes) {
            if (name != "passageId" && name != "searchType" && name != "pageNumber"
                && name != "querySyntax" && name != "id" && name != "detail") {
                if (params != "") {
                    params += ",";
                }
                params += name + '=' + this.attributes[name];
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
            case "searchVersions":
                return "ESV";
            case "sortOrder":
                return "NONE";
            default:
                return;
        }

    },

    /**
     * Trims and removes extra spaces
     * @param querySyntax the query syntax built in its almost final form
     * @private
     */
    _getFinalQuerySyntax: function (querySyntax) {
        return $.trim(querySyntax).replace(/ +/g, " ");
    }
});
