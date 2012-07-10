step.state = {
        activeSearch: function(passageId, activeSearch) {
            var newValue = this._storeAndRetrieveCookieState(passageId, "activeSearch", activeSearch, true);
            return newValue;
        },
        
        restore: function() {
            //restore active search
            
            step.state.detail.restore();
            
            var passageIds = step.util.getAllPassageIds();
            for(var i in passageIds) {
                step.menu.tickMenuItem(step.menu.getMenuItem(this.activeSearch(i), i));
                step.state.passage.restore(i);
                step.state.original.restore(i);
            }
        },
        
        _fireStateChanged : function(passageId) {
            var active = this.activeSearch(passageId);
            
            $.shout("refresh-passage-display", passageId);
            
            if(!active || active == 'SEARCH_PASSAGE') {
                $.shout("passage-state-has-changed", {
                    passageId : passageId
                });
            } else if(active == 'SEARCH_ORIGINAL') {
                $.shout("original-search-state-has-changed", {
                    passageId : passageId
                });
            }
        },

        _fireStateChangedAllButFirst : function() {
            var self = this;
            var passageIds = step.util.getAllPassageIds();
            if (passageIds) {
                $.each(passageIds, function(i, item) {
                    if (item != 0) {
                        self._fireStateChanged(item);
                    }
                });
            }
        },
        
        _storeAndRetrieveCookieState : function(passageId, key, obj, fireChange) {
            var originalValue = $.cookie("step.passage." + passageId + "." + key);
            if (obj != null) {
                var newObj = obj;
                if ($.isArray(obj)) {
                    newObj = obj.join();
                }

                if (newObj != originalValue) {
                    // store first
                    $.cookie("step.passage." + passageId + "." + key, obj);
                    if (fireChange == null || fireChange == true) {
                        step.state._fireStateChanged(passageId);
                    }

                    // then return
                    return $.cookie("step.passage." + passageId + "." + key);
                }
            }

            return originalValue;
        }
};

