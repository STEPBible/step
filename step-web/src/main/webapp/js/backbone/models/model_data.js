var DataModel = Backbone.Model.extend({
    defaults: function () {
        return {
            name: undefined,
            data: undefined,
            remoteUrl: undefined,
            remoteParams: undefined,
            prefetch: false,
            ttl: -1,
            lastFetched: -1,
            postProcess: undefined
        }
    },
    initialize: function() {
        _.bindAll(this);
        
        var dsName = this.get("name");
        var postLoadMethod = this[dsName + "PostLoad"];
        if(postLoadMethod != undefined) {
            Backbone.Events.once("data:" + dsName + ":loaded", postLoadMethod, this);
        }
    },
    fetch: function () {
        //the only time we don't fetch data is if the data is not stale and we have a ttl...
        if (this.get("data") == undefined ||
            new Date().getTime() >= this.get("lastFetched") + this.get("ttl")
            ) {
            //wipe the data and get some more
            this._getData();
        } else {
            Backbone.Events.trigger("data:" + this.get("name") + ":loaded");
        }
    },

    _getData: function () {
        this.save({ data: undefined, lastFetched: -1 });
        $.getSafe(this.get("remoteUrl"), this.remoteParams, this._saveData);
    },
    
    _saveData: function (data) {
        var savedData = data;
        var postProcessMethod = this[this.get("name") + "PostProcess"]; 
        if(postProcessMethod && $.isFunction(postProcessMethod)) {
            savedData = postProcessMethod(data);
        }
        this.save({ data: savedData, lastFetched: new Date().getTime() });
        Backbone.Events.trigger("data:" + this.get("name") + ":loaded");
    },

    allVersionsPostProcess: function(data) {
        var myVersions = [];
        for(var ii = 0; ii < data.length; ii++) {
            myVersions.push({
                item: data[ii],
                itemType : 'version'
            });
        }
        return myVersions;
    },
    /**
     * Exposes all versions and their features to the application
     */
    allVersionsPostLoad : function() {
        var allVersions = this.get("data");
        step.keyedVersions = {};
        for(var ii = 0; ii < allVersions.length; ii++) {
            var item = allVersions[ii].item;
            step.keyedVersions[item.initials] = item;
        }
    }
});

var DataSourceList = Backbone.Collection.extend({
    model: DataModel,
    localStorage: new Backbone.LocalStorage("data-sources"),
    initialize: function () {
    },
    refresh : function() {
        for(var i = 0; i < this.length; i++) {
            this.at(i).fetch();
        }
    }
});