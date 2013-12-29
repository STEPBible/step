var OptionsModel = Backbone.Model.extend({
    defaults: {
        passage : {
            display: "HNV",
            interlinearMode: "NONE"
        }  
    }
});

var OptionsList = Backbone.Collection.extend({
    model: OptionsModel,
    localStorage: new Backbone.LocalStorage("options"),
    getPassageOptions: function(passageId) {
        var option;
        for(var i = 0; i < this.length; i++) {
            option = this.at(i);
            if(option.get("passageId") == passageId) {
                return option;
            }
        }
        
        //not found, so create new
        var option = new OptionsModel;
        this.add(option);
        option.save({ passageId: passageId});
        return option;
    },
    initialize: function() {
        this.on("change", this.triggerPassage, this);
    },
    triggerPassage : function() {
        if(step.router) {
            step.router.navigateSearch();
        }
    }
});

