var StepRouter = Backbone.Router.extend({
    routes: {
        "passage/:passageId/:detail/:version/:reference(/:options)(/:extraVersions)(/:interlinearMode)": "changePassage"
    },
    lastUrls: [],
    passageModels : [],

    initialize : function(options) {
        this.passageModels = options.passageModels;
    },

    /**
     * Changes the passage
     * @param passageId the passageId (0 for left, 1 for right)
     * @param detail used, because we need it in the URL, but that's all for now
     * @param version the selected bible or commentary
     * @param reference the reference
     * @param options the list of options
     * @param interlinearMode the interlinear mode selected
     * @param extraVersions the versions with which to see this.
     */
    changePassage: function (passageId, detail, version, reference, options, interlinearMode, extraVersions) {
        console.log("Changing passage to", version, reference, options, interlinearMode, extraVersions);

        var self = this;
        if (!step.util.raiseErrorIfBlank(version, __s.error_version_missing)
            || !step.util.raiseErrorIfBlank(reference, __s.error_reference_missing)) {
            return;
        }

        var url = [BIBLE_GET_BIBLE_TEXT, version, reference, options, interlinearMode, extraVersions].join("/");

        if (this.lastUrls[passageId] == url) {
            //execute all callbacks only
            step.passage.executeCallbacks(passageId);
            return;
        }
        this.lastUrls[passageId] = url;


        // send to server
        var startTime = new Date().getTime();

        $.getPassageSafe({
            url: url,
            callback: function (text) {
                text.startTime = startTime;
                Backbone.Events.trigger("passage:new:" + passageId, text);
            },
            passageId: passageId,
            level: 'error'
        });

        //now sync changes to model, since we've just requested this
        this.passageModels[passageId].save({
            version : version,
            reference : reference,
            options : options,
            interlinearMode : interlinearMode,
            extraVersions: extraVersions,
            detailLevel: detail
        });
    }
});
