step.state = {
    responseLanguage : undefined,
    language : function(numParts) {
        if(this.responseLanguage != undefined) {
            return this.responseLanguage;
        }

        //first take from URL var
        var lang = $.getUrlVar("lang");

        if(lang == null) {
            //take from cookie
            lang = $.cookie("lang");
        }

        if(lang == null) {
            lang = window.navigator.userLanguage || window.navigator.language;
        }

        if(numParts == 1) {
            return lang.split("-")[0];
        } 
        return lang;
    },
    
    restore : function() {
        //restore active language
        this._restoreLanguage();
     },


    isLocal : function() {
        if(this.local == undefined) {
            this.local = $("meta[step-local]").attr("content") == "true";
        }
        return this.local;
    },
    getDomain : function() {
        if(this.domain == undefined) {
            this.domain = $("meta[step-domain]").attr("content");
        }
        return this.domain;
    },
    getIncompleteLanguage : function() {
        if(this.incomplete == undefined) {
            var incomplete = $("meta[step-incomplete-language]");
            this.incomplete = incomplete.attr("content") == "true";
        }
        return this.incomplete;
    },
    isLtR: function() {
        if(this.direction == undefined) {
            this.direction = $("meta[step-direction]").attr("content") == "true";
        }
        return this.direction;
    },
    getCurrentVersion : function() {
        if(this.version == undefined) {
            this.version = $("meta[name='step.version']").attr("content");
        }
        return this.version;
    }
};
