var AdvancedSearchView = Backbone.View.extend({
    modalPopupTemplate: _.template('<div class="modal selectModal" id="advancedSearch" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-body">' +
        '<ul class="nav nav-tabs">' +
        '<li class="active"><a href="#subjectByRef" data-toggle="tab"><%= __s.search_subject_by_reference %></a></li>' +
        '</ul>' +
        '<div class="tab-content">' +
        '<div class="tab-pane active" id="subjectByRef">' +
        '<form role="form" data-search-type="<%= TOPIC_BY_REF %>">' +
        '<div class="form-group"><label for="subject_related"><%= __s.subject_related %><input id="subject_related" type="text" /></div>' +
        '<button type="submit" class="btn btn-default closeModal" data-dismiss="modal" ><label><%= __s.add_to_search %></label></button>' +
        '</form></div>' +
        '</div>' + //end body
//        '<div class="modal-footer"><button class="btn btn-default btn-sm closeModal" data-dismiss="modal" ><label><%= __s.ok %></label></button></div>' +
        '</div>' + //end content
        '</div>' + //end dialog
        '</div>' +
        '</div>'),
    el: function () {
        var el = $("<div>");
        $("body").append(el);
        return el;
    },
    initialize: function (opts) {
        _.bindAll(this);
        var self = this;
        this.searchView = opts.searchView;
        
        this.$el.append(this.modalPopupTemplate());

        //make the right button active
        this.searchForms = this.$el.find("#advancedSearch").modal({ show: true});
        
        this.searchForms.find("button").on('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            
            //find form
            var el = $(this);
            var form = el.closest("form");
            var searchByRefVal = form.find("input").val();
            var searchType = form.data("search-type");
            switch(searchType) {
                case TOPIC_BY_REF:
                    Backbone.Events.trigger("search:add", { itemType: TOPIC_BY_REF, value: { text: searchByRefVal } });
                    self.closeModal(ev);
                    break;
            }
        });
    },
    closeModal: function(ev) {
        ev.preventDefault();
        this.searchForms.modal("hide");
        this.remove();
    }
});