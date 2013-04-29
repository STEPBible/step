var PassageDisplayView = Backbone.View.extend({
    el : ".passageContainer",
    initialize : function() {
//        _.bindAll(this);
        Backbone.Events.on("passage:new:" + this.model.get("passageId"), this.render, this);
    },

    render : function(newPassage) {
        console.log("Rendering change to SCREEN");

        step.util.trackAnalytics("passage", "loaded", "time", new Date().getTime() - newPassage.startTime);
        step.util.trackAnalytics("passage", "version", this.model.get("version"));
        step.util.trackAnalytics("passage", "reference", newPassage.reference);

        //set the range attributes, silently, so as not to cause events
        this.model.set("startRange", newPassage.startRange, {silent : true });
        this.model.set("endRange", newPassage.endRange, {silent : true });
        this.model.set("multipleRanges", newPassage.multipleRanges, {silent : true });

        this._setPassageContent(newPassage);

        // execute all callbacks
//        step.passage.executeCallbacks(passageId);

//
//        //finally add handlers to elements containing xref
//        this._doVerseNumbers(passageId, passageContent, options, interlinearMode, text.reference);
////                self._doStats(passageId, passageContent, lookupVersion, text.reference);
//        this._doFonts(passageId, passageContent, interlinearMode, interlinearVersion);
//        this.doInterlinearVerseNumbers(passageId);
//        this._doInlineNotes(passageId, passageContent);
//        this._doNonInlineNotes(passageContent);
//        this._doSideNotes(passageId, passageContent);
//        this._doHideEmptyNotesPane(passageContent);
//        this._adjustTextAlignment(passageContent);
//        this._redoTextSize(passageId, passageContent);
//        this._addStrongHandlers(passageId, passageContent);
//        this._updatePageTitle(passageId, passageContent, lookupVersion, lookupReference);
//        this._doTransliterations(passageId, passageContent);
//        this._doInterlinearDividers(passageContent);
//        step.util.closeInfoErrors(passageId);
//        step.state.passage.reference(passageId, text.reference, false);
//        this._doVersions(passageId, passageContent);
//        this._doHash(passageId, text.reference, lookupVersion, options, interlinearMode, interlinearVersion);
    },

    _setPassageContent : function(serverResponse) {
        //first check that we have non-xgen elements
        if($(serverResponse.value).children().not(".xgen").size() == 0) {
            var reference = this.model.get("reference");

            step.util.raiseInfo(this.model.get("passageId"), sprintf(__s.error_bible_doesn_t_have_passage, reference), 'info', true);
            this.$el.find(".passageContent").html("");
        } else {
            this.$el.find(".passageContent").html(serverResponse.value);
        }
    }

});