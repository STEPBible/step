var NotesModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId : 0,
            references : [],
            noteContent : "",
            title : "New document"
        }
    }
});
