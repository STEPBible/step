var HistoryModel = Backbone.Model.extend({
    defaults: function () {
        return {
            args: undefined,
            favourite: false,
            lastAccessed: undefined,
            options: undefined,
            display: undefined
        }
    }
});

var HistoryModelList = Backbone.Collection.extend({
    model: HistoryModel,
    localStorage: new Backbone.LocalStorage("history-searches"),
    comparator: function(a, b) {
        var isAFavourite = a.get("favourite");
        var isBFavourite = b.get("favourite");
        var aLastAccessed = a.get("lastAccessed");
        var bLastAccessed = b.get("lastAccessed");
        
        //if they are both favourites, or neither, then 
        //most recent wins
        if(isAFavourite == isBFavourite) {
            return aLastAccessed > bLastAccessed ? -1 : 1;
        }
        
        if(isAFavourite) {
            return -1;
        }
        
        if(isBFavourite) {
            return 1;
        }
        
        //should never happen
        return 0;
    }
});
