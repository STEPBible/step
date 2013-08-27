var NotesCriteria = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this);

        //load list of notes
        this.notesList = this.$el.find(".personalNotesSearch");
//        this.listenTo(NotesModels, "add", this.populateNotesList);
        NotesModels.fetch({ data : $.param({ partial: true }), success : this.populateNotesList});
        
    },
    
    populateNotesList : function() {
        console.log("hi");
        var titles = NotesModels.map(function(model) { return {value : model.get("title"), label : model.get("title") }});
        step.util.ui.autocompleteSearch(this.notesList, titles, false, function(element, value, label) {
            var newModel = NotesModels.findWhere({ title : value });
            newModel.trigger("selected", newModel);
        });
    }
});
