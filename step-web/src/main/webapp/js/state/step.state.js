step.state = {
        activeSearch: function(passageId, activeSearch, fireChange) {
            //refresh menu options
            if(activeSearch) {
                //tick the right menu item
                step.menu.tickOneItemInMenuGroup('SEARCH', activeSearch, passageId);
                
                
                //show the correct field set
                this._showRelevantFieldSet(passageId);
            }

            var newValue = this._storeAndRetrieveCookieState(passageId, "activeSearch", activeSearch, fireChange);
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
                this._showRelevantFieldSet(i);
            }
        },
        
        _showRelevantFieldSet: function(passageId) {
            var passageContainer = step.util.getPassageContainer(passageId);

            $(".advancedSearch fieldset", passageContainer).hide();
            var option = $("a[name ^= 'SEARCH_']:has(img.selectingTick)", passageContainer);
            var optionName = option.text();
            $(".advancedSearch legend:contains('" + optionName + "')", passageContainer).parent().show();
        },
        
        _fireStateChanged : function(passageId) {
            var active = this.activeSearch(passageId);
            
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

