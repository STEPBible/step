step.state.passage = {
    store : function(passageId, version, reference, options, interlinearVersions, start, end, multiRange) {
        this.startVerseId(passageId, start);
        this.endVerseId(passageId, end);
        this.multiRange(passageId, multiRange);
        this.version(passageId, version, false);
        this.reference(passageId, reference, false);
        this.options(passageId, options, false);
        this.interlinearVersions(passageId, interlinearVersions, false);

        // fire change of state
        step.state._fireStateChanged(passageId);
    },

    hasChanged : function(p, v, r, o, i) {
        return this.version(p) != v || this.reference(p) != r || !compare(this.options(p), o) || this.interlinearVersions(p) != i;
    },

    restore : function(passageId) {
        this._restoreVersion(passageId);
        this._restoreReference(passageId);
        
        // we restore the menu options manually:
        this._restoreMenuOptions(passageId, this.options(passageId));
        this._restoreInterlinearVersions(passageId, this.interlinearVersions(passageId));
        this._restorePassageSync();
        step.state._fireStateChanged(passageId);

        $.shout("application-ready");
    },

    version : function(passageId, version, fireChange) {
        if (version) {
            $(".passageVersion", step.util.getPassageContainer(passageId)).val(version);
            
        }
        var returnVersion = step.state._storeAndRetrieveCookieState(passageId, "version", version, fireChange);
        
        //now that we've updated, alert if we intended a change
        if(version) {
            $.shout("version-changed-" + passageId, version);
        }
        
        return returnVersion;
    },

    reference : function(passageId, reference, fireChange) {
        //if we've called this, then change the active state
        step.state.activeSearch(passageId, 'SEARCH_PASSAGE');
        
        // if we're in sync mode and passageId != 0, then we don't
        // accept any changes, we return reference of passage 0
        if (passageId != 0 && this.syncMode()) {
            if (reference) {
                // ignore if reference passed in + do not fire state changes
                return;
            }

            // if we're asked for a value, return that of passageId=0
            return step.state._storeAndRetrieveCookieState(0, "reference", reference, fireChange);
        }

        // store reference
        var ref = this._storedReference(passageId, reference, fireChange);

        if (this.syncMode() && reference) {
            // we need to alert all passages if reference has changed
            step.state._fireStateChangedAllButFirst();
        }

        return ref;
    },

    _storedReference : function(passageId, reference, fireChange) {
        if (reference) {
            $(".passageReference", step.util.getPassageContainer(passageId)).val(reference);
        }
        return step.state._storeAndRetrieveCookieState(passageId, "reference", reference, fireChange);
    },

    options : function(passageId, options, fireChange) {
        // menus take care of themselves, so no need to do anything here, but
        // call the underlying storage
        return step.state._storeAndRetrieveCookieState(passageId, "options", options, fireChange);
    },

    interlinearVersions : function(passageId, interlinearVersions, fireChange) {
        return step.state._storeAndRetrieveCookieState(passageId, "interlinearVersions", interlinearVersions, fireChange);
    },

    syncMode : function(syncMode, fireChange) {
        // always store syncMode against passage 0
        var mode;
        if (syncMode != null) {
            mode = step.state._storeAndRetrieveCookieState(0, "syncMode", syncMode, false);

            // state changed
            step.state._fireStateChangedAllButFirst();
        } else {
            // check we have something stored...
            mode = step.state._storeAndRetrieveCookieState(0, "syncMode");
            if (isEmpty(mode)) {
                mode = false;
                step.state._storeAndRetrieveCookieState(0, "syncMode", mode, fireChange);
            }
            return mode == true || mode == "true";
        }
    },

    range : function(p, s, e, m) {
        this.startVerseId(p, s);
        this.endVerseId(p, e);
        this.multiRange(p, m);
    },

    startVerseId : function(passageId, startVerseId) {
        return parseInt(step.state._storeAndRetrieveCookieState(passageId, "startVerseId", startVerseId, false));
    },

    endVerseId : function(passageId, endVerseId) {
        return parseInt(step.state._storeAndRetrieveCookieState(passageId, "endVerseId", endVerseId, false));
    },

    multiRange : function(passageId, multiRange) {
        var m = step.state._storeAndRetrieveCookieState(passageId, "multiRange", multiRange, false);
        return m == true || m == "true";
    },

    scrolling : function(passageId, scrolling) {
        if (this.multiRange(passageId)) {
            step.util.raiseError("Continuous scrolling cannot be enabled for mutliple ranges");
            return false;
        }

        var s = step.state._storeAndRetrieveCookieState(passageId, "scrolling", scrolling, scrolling == false || scrolling == "false");
        return s == true || s == "true";
    },

    _restoreMenuOptions : function(passageId, options) {
        var opts = options;
        if (step.util.isBlank(options)) {

            if(options == null) {
                //then first time run, so get defaults
                opts = step.defaults.passages[passageId].options;
            } else {
                opts = step.menu.getSelectedOptionsForMenu(passageId, 'DISPLAY');
            }

            if (opts) {
                this.options(passageId, opts, false);
            }
        }

        var menuOptions = $.isArray(opts) ? opts : opts.split(",");
        $.shout("initialise-passage-display-options", {
            passageId : passageId,
            menuOptions : menuOptions
        });
    },

    _restoreInterlinearVersions : function(passageId, interlinearVersions) {
        $.shout("initialise-interlinear-versions", {
            passageId : passageId
        });
    },

    _restorePassageSync : function() {
        $.shout("initialise-passage-sync", this.syncMode());
    },

    _restoreVersion : function(passageId) {
        var v = this.version(passageId);
        if (!step.util.isBlank(v)) {
            this.version(passageId, v, false);
        } else {
            // use the pre-populated value
            this.version(passageId, step.defaults.passages[passageId].version, false);
        }
    },

    _restoreReference : function(passageId) {
        var r = this._storedReference(passageId);
        if (!step.util.isBlank(r)) {
            this._storedReference(passageId, r, false);
        } else {
            this.reference(passageId, step.defaults.passages[passageId].reference, false);
        }
    }
};
