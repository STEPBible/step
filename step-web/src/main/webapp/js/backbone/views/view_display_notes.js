var NotesDisplayView = Backbone.View.extend({
    el: function () {
        return $(".passageContainer").eq(this.model.get("passageId"));
    },
    initialize: function () {
        this.listenTo(NotesModels, "selected", this.changeSelected);

        //initialise editor if not already done.
        //show current note in editor
//        this.listenTo(this.model)
    },

    changeSelected: function (model) {
        //need to warn around losing content?
        console.log("model is", model);

        if (this.editor == undefined) {
            
            $(".passageContent:first").append(this.$el);
            
            //need to initialise editor
            this.$el.append("<textarea class='editor'></textarea>");
            this.editor = this.$el.find(".editor");
            this.editor.tinymce({
                script_url: 'libs/tinymce/tinymce.min.js',
                theme: "modern"
            });
        }
    }
});
