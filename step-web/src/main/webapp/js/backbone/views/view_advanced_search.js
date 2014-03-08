var AdvancedSearchView = Backbone.View.extend({
    specificContext: [],
    modalPopupTemplate: _.template('<div class="modal selectModal" id="advancedSearch" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-body">' +
        '<button type="button" class="close" aria-hidden="true">&times;</button>' +
        '<ul class="nav nav-tabs">' +
        '<li class="active"><a href="#subjectByRef" data-toggle="tab"><%= __s.search_subject_by_reference %></a></li>' +
        '</ul>' + 
        '<div class="tab-content">' +
        '<div class="tab-pane active" id="subjectByRef">' +
        '<form role="form" data-search-type="<%= TOPIC_BY_REF %>">' +
        '<div class="dropdown">' +
        '<div class="form-group"><label for="subjectRelated"><%= __s.subject_related %></label>' +
        '<input id="subjectRelated" type="text" data-toggle="dropdown" />' +
        '<ul class="dropdown-menu kolumnyRefs" role="menu" aria-labelledby="dropdownMenu1">' +
        '</ul>' +
        '</div>' +
        '' +
        '</div>' +
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
        this.masterVersion = opts.masterVersion;
        if(step.util.isBlank(this.masterVersion)) {
            this.masterVersion = REF_VERSION;
        }
        
        this.searchView = opts.searchView;

        this.$el.append(this.modalPopupTemplate());

        //make the right button active
        this.searchForms = this.$el.find("#advancedSearch").modal({ show: true});

        this.searchForms.find("button").on('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            //find form
            var el = $(this);
            var form = el.closest("form");
            var searchByRefVal = form.find("input").val();
            var searchType = form.data("search-type");
            switch (searchType) {
                case TOPIC_BY_REF:
                    Backbone.Events.trigger("search:add", { itemType: TOPIC_BY_REF, value: { text: searchByRefVal } });
                    self.closeModal(ev);
                    break;
            }
        });

        this.$el.find(".close").on('click', this.closeModal);
        this.subjectRelated = this.$el.find("#subjectRelated");
        this.subjectRefs = this.searchForms.find("#subjectByRef .dropdown-menu");
        this.subjectRefs.css("left", this.subjectRelated.position().left);
        this._autoCompleteRef(this.subjectRelated, this.subjectRefs);
    },
    refreshRefDropdown: function (ref, dropdown, target) {
        var self = this;
        $.getSafe(BIBLE_GET_BIBLE_BOOK_NAMES, [ref, self.masterVersion], function (data) {
            dropdown.empty();
            var returnedData = data || [];
            for (var i = 0; i < returnedData.length; i++) {
                dropdown.append($('<li role="presentation">' +
                    '<a role="menuitem" href="javascript:void(0)" data-whole-book="' + returnedData[i].wholeBook + '" data-ref="' + returnedData[i].shortName + '">' + returnedData[i].shortName +
                    ' <span class="glyphicon glyphicon-arrow-right"></span> ' +
                    ' ' + returnedData[i].fullName +
                    '</a>' +
                    '</li>'));
            }
            dropdown.find("a").on('click', function () {
                var link = $(this);
                target.val(link.data("ref"));
                if(link.data("whole-book")) {
                    self.refreshRefDropdown(target.val(), dropdown, target);
                    target.focus();
                }
            });
            if(!target.closest(".form-group").hasClass("open")) {
                target.trigger("click");
            }
        });
    }, 
    _autoCompleteRef: function(target, dropdown) {
        var self = this;
        target.on("keyup", function(ev) {
            var key = ev.keyCode || ev.which;
            if(ev.keyCode == 27) {
                target.dropdown("toggle");
                return;
            }
            
            step.util.delay(function () {
                self._doKeyLookup(target, dropdown);
            }, KEY_PAUSE, 'show-ref-dropdown');
        }).on('focus', function() {
            self.refreshRefDropdown($(this).val(), dropdown, target);
        });
    },
    _doKeyLookup: function(target, dropdown) {
        var self = this;
        var ref = target.val();
        if(step.util.isBlank(ref)) {
            ref = "";
        }
        self.refreshRefDropdown(ref, dropdown, target);
    },
    closeModal: function (ev) {
        ev.preventDefault();
        this.searchForms.modal("hide");
        this.remove();
    },
    _addSpecificContext: function (itemType, value) {
        this._removeSpecificContext(itemType);
        this.specificContext.push({ itemType: itemType, value: value });
    },
    _removeSpecificContext: function (itemType) {
        for (var i = 0; i < this.specificContext.length; i++) {
            if (this.specificContext[i].itemType == itemType) {
                this.specificContext.splice(i, 1);
                //i will be incremented, so keep it in sync with for loop increment
                i--;
            }
        }
    }
});