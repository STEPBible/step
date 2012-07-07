step.passage.navigation = {
    chapter : {
        previous : function(passageId) {
            this._getSiblingReference(passageId, BIBLE_GET_PREVIOUS_CHAPTER, 
                    step.util.getPassageContent(passageId).prop("scrollHeight"));
        },

        next : function(passageId) {
            this._getSiblingReference(passageId, BIBLE_GET_NEXT_CHAPTER, 0);
        },

        _getSiblingReference : function(passageId, backendURL, scroll) {
            $.getSafe(backendURL + step.state.passage.reference(passageId) + "/" + step.state.passage.version(passageId), function(newReference) {
                //push callback
                step.passage.callbacks[passageId].push(function() {
                    var passage = step.util.getPassageContent(passageId);
                    passage.scrollTop(scroll);
                });
                
                step.state.passage.reference(passageId, newReference);
            });
        }
    },

    sync : function() {
        // we then fire changes against all passages, except for passage 0
        step.state.passage.syncMode(true);
    },

    desync : function() {
        step.state.passage.syncMode(false);
    },

    handleContinuousScrolling : function(passageId, isEnabled) {
        try {
            var passage = step.util.getPassageContent(passageId);
            if (step.state.passage.scrolling(passageId, isEnabled)) {
                // simulate a scroll
                this._scrollOccurred(passage, passageId);

                // attach to scroll event
                var self = this;
                passage.scroll(function() {
                    // scrolling occurred, so call handler
                    self._scrollOccurred(passage, passageId);
                });
            } else {
                this.scrolling = false;
                this.forceRefresh = true;

                // remove scrolling handlers
                passage.unbind("scroll");

                // add queue for passage
                step.passage.callbacks[passageId].push(function() {
                    passage.scrollTop(0);
                });
            }
        } catch (err) {
            // could not set scrolling, so do nothing
        }
    },

    getBefore: [false, false],
    getAfter: [false, false],
    minScrollValue: 1500,
    _scrollOccurred : function(passage, passageId) {
        var self = this;
        var startVerseId = step.state.passage.startVerseId(passageId);
        var endVerseId = step.state.passage.endVerseId(passageId);
        
        // capture total height before
        var heightBefore = passage.prop("scrollHeight");
        var currentLocation = passage.scrollTop();
        var leftOver = heightBefore - currentLocation;

        // expand passage both ways, so look for x verses each way
        if (this.getBefore[passageId] == false && currentLocation < this.minScrollValue) {
            this.getBefore[passageId] = true;
            this._getPortion(passageId, startVerseId - CONTINUOUS_SCROLLING_VERSE_GAP, startVerseId - 1, false, function(text) {
                passage.prepend(text.value);
                var heightAfter = passage.prop("scrollHeight");
                passage.scrollTop(heightAfter - heightBefore + currentLocation);
                
                step.state.passage.startVerseId(passageId, text.startRange);
                self.getBefore[passageId] = false;
            });
        }

        if (this.getAfter[passageId] == false && leftOver < this.minScrollValue) {
            this.getAfter[passageId] = true;
            this._getPortion(passageId, endVerseId + 1, endVerseId + CONTINUOUS_SCROLLING_VERSE_GAP, true, function(text) {
                passage.append(text.value);
                step.state.passage.endVerseId(passageId, text.endRange);
                self.getAfter[passageId] = false;
            });
        }
    },
    
    _getPortion: function(passageId, start, end, roundup, callback) {
        var version = step.state.passage.version(passageId);
        var options = step.state.passage.options(passageId);
        var interlinearOptions = step.state.passage.interlinearVersions(passageId);
        
        $.getSafe(BIBLE_GET_BY_NUMBER + 
                version + "/" + 
                start + "/" +
                end + "/" + 
                roundup + "/" + 
                options + "/" + 
                interlinearOptions,
                function(text) {
                    callback(text);
                });
    }
};
