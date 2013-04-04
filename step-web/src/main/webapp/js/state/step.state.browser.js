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
//aims to deal with browser event changes such as history
step.state.browser = {
    ignoreHash : false,
        
    hashChange : function() {
        if(this.ignoreHash) {
            this.ignoreHash = false;
            return;
        }
        
        this._restorePassageId(0);
        if(step.state.view.getView() == 'TWO_COLUMN_VIEW') {
            this._restorePassageId(1);
        }
    },
    
    changeHash : function(hash) {
        this.ignoreHash = true;
        window.location.hash = hash;
    },

    changePassageHash : function(passageId, newValue) {
        //remove previous value
        var regex = this._getPassageKeyRegex(passageId);

        var hash = window.location.hash;
        var previousValue = regex.exec(hash);
        
        //check that a change is due
        if(previousValue && previousValue.length > 1 && previousValue[1] == newValue) {
            return;
        }

        hash = hash.replace(regex, "").replace(/\|\|/g, "|");
        if(hash.length > 0 && hash[hash.length -1] != '|') {
            hash += '|';
        }
        
        step.state.browser.changeHash(hash + "passageId" + passageId + "=" + newValue);
    },
    
    changeTrackedSearch : function(passageId, searchType) {
        var namespace = "";

        if(searchType == 'SEARCH_PASSAGE') {
            //this is handled directly by the passage change.
            return;
        } else if(searchType == 'SEARCH_ORIGINAL') {
            namespace = "original";
        } else if(searchType == 'SEARCH_SIMPLE_TEXT') {
            namespace = "simpleText";
        } else if(searchType == 'SEARCH_TEXT') {
            namespace = 'textual';
        } else if(searchType == 'SEARCH_SUBJECT') {
            namespace = 'subject';
        } else if(searchType == 'SEARCH_TIMELINE') {
            namespace = 'timeline';
        }
        
        var passageContainer = step.util.getPassageContainer(passageId);
        var key = searchType;
        $.each(step.state.trackedKeys, function(i, item) {
           if(item[0] == namespace) {
               //then we're going to attempt to track the field
               var matchedElementValue = $("." + item[1], passageContainer).val();
               key += "@" + item[1] + "=" + matchedElementValue;
           }
        });
        
        this.changePassageHash(passageId, key);
    },
    
    changePassage : function(passageId, reference, version, options, interlinearMode, interlinearVersion) {
        //store it in the form passageId-osisId
        var hash = window.location.hash;
        var detail = "detail=" + $("fieldset[name='SEARCH_PASSAGE']", step.util.getPassageContainer(passageId)).detailSlider("value");
        var newValue = this._getNonNullKey(['SEARCH_PASSAGE', detail, reference, version, options, interlinearMode, interlinearVersion]);
        
        this.changePassageHash(passageId, newValue);
    },
    
    updateDetail : function(passageId) {
        var hash = window.location.hash;
        var detail = "detail=" + $("fieldset[name='SEARCH_PASSAGE']", step.util.getPassageContainer(passageId)).detailSlider("value");
        
        var parts = hash.split("|");
        if(parts == undefined || parts.length == 0) {
            return;
        }
        
        for(var ii = 0; ii < parts.length; ii++) {
            if(parts[ii].indexOf("passageId" + passageId + "=") == 0) {
                //this is the fragment we want to rewrite
                parts[ii] = parts[ii].replace(/detail=\d+/ig, detail);
            }
        }
        
        var newValue = parts.join("|");
        if(window.location.hash != newValue) {
            window.location.hash = newValue;
        }
    },
    
    _restorePassageId : function(passageId) {
        //obtain the passage key for passageId n
        var hash = window.location.hash;
        
        var matchingRegex = this._getPassageKeyRegex(passageId);
        
        var matches = matchingRegex.exec(hash);
        if(matches && matches.length > 1) {
            var passageReference = matches[1];
            
            var passageArgs = passageReference.split('@');
            
            if(passageArgs[0] == 'SEARCH_PASSAGE') {
                this._restorePassage(passageId, passageArgs);
            } else {
                this._restoreTrackedKeys(passageId, passageArgs);
            }
            step.state.activeSearch(passageArgs[0]);
        }
    },
    
    _restorePassage : function(passageId, passageArgs) {
        $("fieldset[name='SEARCH_PASSAGE']", step.util.getPassageContainer(passageId)).detailSlider("value", 
                { value: parseInt((passageArgs[1] || "").replace("detail=", "")) }
        );
        
        step.state.passage.reference(passageId, passageArgs[2]);
        step.state.passage.version(passageId, passageArgs[3]);
        step.state.passage.options(passageId, passageArgs[4]);
        
        var value = this.translateCollectionOption(passageArgs[5], step.defaults.passage.interNamedOptions, step.defaults.passage.interOptions);
        if(value != 'NONE') {
            step.state.passage.extraVersionsDisplayOptions(passageId, value);
        } else {
            step.state.passage.extraVersionsDisplayOptions(passageId, "");
        }
        step.state.passage.extraVersions(passageId, passageArgs[6]);
        step.passage.ui.updateDisplayOptions(passageId);
    },
    
    _restoreTrackedKeys : function(passageId, formArgs) {
        var passageContainer = step.util.getPassageContainer(passageId);
        
        for(var ii = 0; ii < formArgs.length; ii++) {
            var parts = formArgs[ii].split('=');
            
            if(parts.length < 2) {
                //no key/value pair
                continue;
            }
            
            var key = parts.shift();
            console.log("key", key);
            var value = "";
            if(parts.length > 0) {
                value = parts.join('=');
            } 
            
            $("." + key, passageContainer).val(value);
        }
    },
    
    _getPassageKeyRegex : function(passageId) {
        return new RegExp("passageId" + passageId + "=([^|]*)", "ig");
    },
    
    _getNonNullKey : function(args) {
        var key = "";
        for(var ii = 0; ii < args.length; ii++) {
            if(args[ii]) {
                key += args[ii];
            }
            key += '@';
        }
        
        return key;
    },
    
    translateCollectionOption : function(value, valueOptions, textOptions) {
        if(value == null || value == "") {
            return "";
        }
        
        //do a simple search through the collection
         for(var i = 0; i < valueOptions.length; i++) {
            if(value == valueOptions[i]) {
                return textOptions[i];
            }
        }
        return value;
    }
};
