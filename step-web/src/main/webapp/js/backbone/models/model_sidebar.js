var SidebarModel = Backbone.Model.extend({
    defaults : {
        //mode 0 = lexicon, mode 1 = analysis
        mode: 0,
        strong: 'H0001',
        morph : undefined
    }
});

var SidebarList = Backbone.Collection.extend({
    model: SidebarModel,
    localStorage: new Backbone.LocalStorage("sidebar"),
    initialize: function () {
    }
});