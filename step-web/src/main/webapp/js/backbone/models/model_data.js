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