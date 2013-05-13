var SubjectSearchModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            subject : "",
            pageNumber : 1,
            querySyntax : ""
        }
    },

    /**
     * we ensure that, A- we save the correct format of parameters, and B- that we save options that are valid
     * @param attributes the set of attributes to be stored
     * @param options the options to be saved
     * @returns {Function|o.save}
     */
    save: function (attributes, options) {
        //if we have no query syntax, then evaluate it
        if (!attributes.querySyntax && attributes.subject) {
            attributes.querySyntax = this._evaluateQuerySyntax(attributes.subject);
        }

        console.log("Saving subject search model", attributes);
        return Backbone.Model.prototype.save.call(this, attributes, options);
    },

    /**
     * Evaluates what the corresponding query syntax should be.
     * @param subject the subject itself
     * @returns {string}
     * @private
     */
    _evaluateQuerySyntax : function(subject) {
        return "s=" + subject;
    },

    /**
     * Returns the location for this search can be bookmarked
     * @returns {string}
     */
    getLocation : function() {
        return [
            this.get("passageId"),
            "subject",
            this.get("pageNumber"),
            this.get("querySyntax")].join("/");
    }
});
