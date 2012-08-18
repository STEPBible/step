/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
step.state = {
     trackState : function(selector, namespace, defaultHandler) {
         if($.isArray(selector)) {
             for(var i = 0; i < selector.length; i++) {
                 this.trackState(selector[i], namespace, defaultHandler);
             }
             
             //add handlers for all defaults too
             if(defaultHandler) {
                 this.trackedDefaults.push(defaultHandler);             
             }
             return;
         }
         
         var selected = $(selector);
         var key = selector.substring(1);
         selected.change(function(){
             var controlValue = this.type == 'checkbox' ? $(this).prop('checked') : $(this).val();
             step.state[namespace][key](step.passage.getPassageId(this), controlValue);
         });
         
         
         if(step.state[namespace] == undefined) {
             step.state[namespace] = {};
         }
         
         step.state[namespace][key] = function(passageId, value) {
             var specificSelector = $(selector, step.util.getPassageContainer(passageId));
             if(specificSelector.get(0).type == 'checkbox') {
                     if (value != null) { 
                         specificSelector.prop('checked', value == "true" || value == true); 
                     }
                     
                     var checkboxValue = step.state._storeAndRetrieveCookieState(passageId, key, value, false);
                     if(checkboxValue == undefined || checkboxValue == "") {
                         checkboxValue = step.state._storeAndRetrieveCookieState(passageId, key, "false", false);
                     }
                     return checkboxValue;
             } else {
                 if (value != null) { 
                     specificSelector.val(value); 
                 }
                 return step.state._storeAndRetrieveCookieState(passageId, key, value, false);
             }
         };
         
         //add to list of tracked elements
         this.trackedKeys.push([namespace, key, selected.length]);
         
     }, 

     trackedKeys : [],
     trackedDefaults : [],
     
     restoreTrackedKeys : function() {
         for(var i = 0; i < this.trackedKeys.length; i++) {
             var keyId = this.trackedKeys[i];
             
             if(keyId[2].length == 1) {
                 var func = step.state[keyId[0]][keyId[1]];
                 func(func());
             } else {
                 //assume within a passage container
                 for(var j = 0; j < keyId[2]; j++) {
                     var func = step.state[keyId[0]][keyId[1]];
                     func(j, func(j));
                 }
             }
         }
     },
     
     restoreTrackedDefaults : function() {
         for(var i = 0; i < this.trackedDefaults.length; i++) {
             if($.isArray(this.trackedDefaults[i])) {
                 for(var j = 0; j < this.trackedDefaults[i].length; j++) {
                     this.trackedDefaults[i][j](0, false);
                     this.trackedDefaults[i][j](1, false);
                 }
             } else {
                 this.trackedDefaults[i](0, false);
                 this.trackedDefaults[i](1, false);
             }
         }
     },
        
    activeSearch : function(passageId, activeSearch, fireChange) {
        // refresh menu options
        if (activeSearch) {
            // tick the right menu item
            step.menu.tickOneItemInMenuGroup('SEARCH', activeSearch, passageId);

            // show the correct field set
            this._showRelevantFieldSet(passageId);
        }

        var newValue = this._storeAndRetrieveCookieState(passageId, "activeSearch", activeSearch, fireChange);
        return newValue;
    },

    restore : function() {
        this.restoreTrackedKeys();
        this.restoreTrackedDefaults();
        
        // restore active search
        step.state.detail.restore();
        

        
        var passageIds = step.util.getAllPassageIds();
        for ( var i in passageIds) {
            step.menu.tickMenuItem(step.menu.getMenuItem(this.activeSearch(i), i));
            step.state.passage.restore(i);
            step.state.original.restore(i);
            this._showRelevantFieldSet(i);
        }
        
        step.util.ui.initSearchToolbar();
    },

    _showRelevantFieldSet : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        $(".advancedSearch fieldset", passageContainer).hide();

        var option = $("a[name ^= 'SEARCH_']:has(img.selectingTick)", passageContainer);
        var optionName = option.text();
        this._showFieldSet(passageContainer, optionName);
    },
    
    _showFieldSet : function(passageContainer, optionName) {
        var targetFieldset = $(".advancedSearch legend:contains('" + optionName + "')", passageContainer).parent();
        targetFieldset.show();
    },

    _fireStateChanged : function(passageId) {
        var active = this.activeSearch(passageId);

        if (!active || active == 'SEARCH_PASSAGE') {
            $.shout("passage-state-has-changed", { passageId : passageId });
        } else if (active == 'SEARCH_ORIGINAL') {
            $.shout("original-search-state-has-changed", { passageId : passageId });
        } else if (active == 'SEARCH_TIMELINE') {
            $.shout("timeline-search-state-has-changed", { passageId : passageId });
        } else if (active == 'SEARCH_TEXT') {
            $.shout("textual-search-state-has-changed", { passageId : passageId });
        } else if(active == 'SEARCH_SIMPLE_TEXT') {
            $.shout("simpleText-search-state-has-changed", { passageId : passageId });
        } else if(active == 'SEARCH_SUBJECT') {
            $.shout("subject-search-state-has-changed", { passageId : passageId });
        }
    },

    _fireStateChangedAll : function(excludingFilter) {
        var self = this;
        var passageIds = step.util.getAllPassageIds();
        if (passageIds) {
            $.each(passageIds, function(i, item) {
                if(excludingFilter == null || !excludingFilter(item)) {
                    self._fireStateChanged(item);
                }
            });
        }
    },
    
    _fireStateChangedAllBut : function(skipPassageId) {
        this._fireStateChangedAll(function(item) {
            return item == skipPassageId;
        });
    },

    _fireStateChangedAllButFirst : function() {
        this._fireStateChangedAllButFirst(0);
    },

    _storeAndRetrieveCookieState : function(passageId, key, obj, fireChange, changeHandler) {
        var originalValue = $.cookie("step.passage." + passageId + "." + key);
        var fired = false;
        
        if (obj != null) {
            var newObj = obj;
            if ($.isArray(obj)) {
                newObj = obj.join();
            }

            if (newObj != originalValue || fireChange == true) {
                // store first
                $.cookie("step.passage." + passageId + "." + key, obj);
                if (fireChange == null || fireChange == true) {
                    step.state._fireStateChanged(passageId);
                    fired = true;
                }

                // then return
                var storedValue = $.cookie("step.passage." + passageId + "." + key);
                if(changeHandler) { 
                    changeHandler(fired);
                }
                return storedValue;
            }
        }

        return originalValue;
    }
};
