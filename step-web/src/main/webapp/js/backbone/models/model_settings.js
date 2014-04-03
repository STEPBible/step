var SettingsModel = Backbone.Model.extend({
    defaults: function () {
        return {
            
        }
    }
});

var SettingsModelList = Backbone.Collection.extend({
    model: SettingsModel,
    localStorage: new Backbone.LocalStorage("settings"),
    initialize: function () {
    }
});
