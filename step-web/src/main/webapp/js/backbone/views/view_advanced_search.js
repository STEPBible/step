var AdvancedSearchView = Backbone.View.extend({
    specificContext: [],
    text: "TEXT",
    sizes: [2, 2, 5, 1, 2],
    textDefaults: step.defaults.search.textual,
    rowToCellTemplate: _.template('<% _.each(row.split("|"), function(cell, i) { %> <span class="col-sm-<%= view.sizes[i] %>"><%= cell %></span> <% }) %><span class="col-sm-2"></span>'),
    extraRow: _.template('<span class="row">' +
        '<%= view.rowToCellTemplate({ row: sprintf(__s.simple_text_search_level_intermediate, ' +
        '  view.getSelect("join", view.textDefaults.simpleTextIncludes, view.textDefaults.simpleTextIncludesReference), ' +
        '  view.getSelect("secondaryType", view.textDefaults.simpleTextSecondaryTypes, view.textDefaults.simpleTextSecondaryTypesReference), view.getInput("secondaryCriteria"), ' +
        'view.getSelect("joinType", view.textDefaults.simpleTextProximities, view.textDefaults.simpleTextProximitiesReference)), view: view }) %>' +
        '</span>'),
    modalPopupTemplate: _.template('<div class="modal selectModal" id="advancedSearch" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-body">' +
        '<ul class="nav nav-tabs">' +
        '<li class="active"><a href="#advancedTextSearch" data-toggle="tab"><%= __s.search_advanced_text %></a></li>' +
        '<li><a href="#subjectByRef" data-toggle="tab"><%= __s.search_subject_by_reference %></a></li>' +
        '<li><a href="#querySyntax" data-toggle="tab"><%= __s.free_search %></a></li>' +
        '</ul>' +
        '<div class="tab-content">' +
        //advanced text search
        '<div class="tab-pane active" id="advancedTextSearch">' +
        '<form role="form" data-search-type="<%= view.text %>"  class="form-inline container-fluid">' +
        '<span class="row">' +
        '<%= view.rowToCellTemplate({ row: sprintf(__s.simple_text_search_level_basic, ' +
        '  view.getSelect("type", view.textDefaults.simpleTextTypes, view.textDefaults.simpleTextTypesReference), view.getInput("criteria"), view.getInput("scope")), view: view }) %>' +
        '</span>' +
        '<span><button id="addRow" class="btn btn-default addRow"><span class="glyphicon glyphicon-plus"></span></button><label for="addRow"><%= __s.add_search_row %></label></span>' +
        '<div class="footerContainer">' +
        '<textarea readonly class="textQuerySyntax form-control input-sm" placeholder="<%= __s.search_query_syntax %>" />' +
        '<button type="submit" class="btn btn-default closeModal" aria-hidden="true"><label><%= __s.close %></label></button>' +
        '<button type="submit" class="btn btn-primary closeAndAdd" data-dismiss="modal" ><label><%= __s.add_to_search %></label></button>' +
        '</div>' +
        '</form>' +
        '</div>' +
        // subject by reference
        '<div class="tab-pane" id="subjectByRef">' +
        '<form role="form" data-search-type="<%= TOPIC_BY_REF %>">' +
        '<div class="dropdown">' +
        '<div class="form-group"><label for="subjectRelated"><%= __s.subject_related %></label>' +
        '<input id="subjectRelated" type="text" data-toggle="dropdown" />' +
        '<ul class="dropdown-menu kolumnyRefs" role="menu" aria-labelledby="dropdownMenu1">' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '<div class="footerContainer">' +
        '<button type="button" class="btn btn-default closeModal" aria-hidden="true"><label><%= __s.close %></label></button>' +
        '<button type="submit" class="btn btn-primary closeAndAdd" data-dismiss="modal" ><label><%= __s.add_to_search %></label></button>' +
        '</div>' +
        '</form></div>' +
        //advanced query syntax search
        '<div class="tab-pane" id="querySyntax">' +
        '<form role="form" data-search-type="<%= SYNTAX %>">' +
        '<textarea class="advancedQuerySyntax" placeholder="<%= __s.search_query_syntax %>" />' +
        '<div class="footerContainer">' +
        '<button type="button" class="btn btn-default closeModal" aria-hidden="true"><label><%= __s.close %></label></button>' +
        '<button type="submit" class="btn btn-primary closeAndAdd" data-dismiss="modal" ><label><%= __s.add_to_search %></label></button>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>' + //end body
//        '<div class="modal-footer"><button class="btn btn-default btn-sm closeAndAdd" data-dismiss="modal" ><label><%= __s.ok %></label></button></div>' +
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
        if (step.util.isBlank(this.masterVersion)) {
            this.masterVersion = REF_VERSION;
        }

        this.searchView = opts.searchView;

        this.$el.append(this.modalPopupTemplate({ view: this }));

        this.$el.find(".addRow").click(function (ev) {
            ev.preventDefault();
            if (!self.maxReached) {
                $(self.extraRow({ view: self })).insertBefore($(this)).find("input, select").on('change keyup', function () {
                    self.evaluateQuerySyntax();
                });
                self.detail = 1;
                self.maxReached = true;
                if (self.maxReached) {
                    $(this).remove();
                }
            }
            return false;
        });
        this.$el.find("#advancedTextSearch").find("input, select").on('change keyup', function () {
            self.evaluateQuerySyntax();
        });

        //make the right button active
        this.searchForms = this.$el.find("#advancedSearch").modal({ show: true});

        this.searchForms.find(".closeAndAdd").on('click', function (ev) {
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
                    break;
                case self.text:
                    Backbone.Events.trigger("search:add", { itemType: SYNTAX, value: { text: "&lt;" + self.$el.find(".criteria").val() + "...&gt;", value: self.$el.find(".textQuerySyntax").val() } });
                    break;
                case SYNTAX:
                {
                    Backbone.Events.trigger("search:add", { itemType: SYNTAX, value: { text: "" + "&lt;...&gt;", value: $(".advancedQuerySyntax").val() } });
                    break;
                }
            }
            self.closeModal(ev);
        });

        this.$el.find(".closeModal").on('click', this.closeModal);
        this.subjectRelated = this.$el.find("#subjectRelated");
        this.subjectRefs = this.searchForms.find("#subjectByRef .dropdown-menu");
        this.subjectRefs.css("left", this.subjectRelated.position().left);
        this._autoCompleteRef(this.subjectRelated, this.subjectRefs);

        //amend the initial view
        if (opts.initialView) {
            this.$el.find(".active").removeClass("active");
            var href = "";
            if (initialView == SYNTAX) {
                href = "#querySyntax";
            } else if (opts.initialView == TOPIC_BY_REF) {
                href = "#subjectByRef";
            } else if (opts.initialView == TEXT_SEARCH) {
                href = "#advancedTextSearch";
            }
            this.$el.find("[href='#'" + href + "]").trigger("click");
        }
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
                if (link.data("whole-book")) {
                    self.refreshRefDropdown(target.val(), dropdown, target);
                    target.focus();
                }
            });
            if (!target.closest(".form-group").hasClass("open")) {
                target.trigger("click");
            }
        });
    },
    _autoCompleteRef: function (target, dropdown) {
        var self = this;
        target.on("keyup", function (ev) {
            var key = ev.keyCode || ev.which;
            if (ev.keyCode == 27) {
                target.dropdown("toggle");
                return;
            }

            step.util.delay(function () {
                self._doKeyLookup(target, dropdown);
            }, KEY_PAUSE, 'show-ref-dropdown');
        }).on('focus', function () {
            self.refreshRefDropdown($(this).val(), dropdown, target);
        });
    },
    _doKeyLookup: function (target, dropdown) {
        var self = this;
        var ref = target.val();
        if (step.util.isBlank(ref)) {
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
    },
    getInput: function (clazz) {
        return '<input type="text" class="' + clazz + ' form-control input-sm" />';
    },
    getSelect: function (clazz, texts, values) {
        var select = '<select class="' + clazz + ' form-control input-sm" >';
        for (var i = 0; i < texts.length; i++) {
            select += '<option value="' + values[i] + '">' + texts[i] + "</option>";
        }
        select += '</select>';
        return select;
    },

    includeProximityChange: function (currentElement, value) {
        var proximity = this.viewElementsByName.simpleTextProximity;
        if (value == 'include') {
            if (proximity.val() == 'the same verse') {
                //reset
                proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
                proximity.attr('disabled', false);
            }
        } else if (value == 'exclude') {
            proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
            proximity.attr('disabled', true);
        }
    },
    /**
     * We pick out the attribute that should be used to evaluate the query syntax
     * @param attributes object containing the properties filled in so far
     * @param the property to add if not present already
     */
    getSafeAttribute: function (propName) {
        return this.$el.find("." + propName).val() || "";
    },
    /**
     * Evaluates the query syntax by delegating the call to the child class, but
     * then adds on the refined searches, such that these are in the URLs
     * @param attributes
     * @private
     */
    evaluateQuerySyntax: function () {
        var querySyntax = this._evaluateQuerySyntaxInternal();

        if (step.util.isBlank(querySyntax)) {
            console.log("ERROR ERROR - empty query syntax - ERROR ERROR");
        }

        //finalise query, then join them
        var finalQuery = $.trim(querySyntax).replace(/ +/g, " ");

        this.$el.find(".textQuerySyntax").val(finalQuery);
        return finalQuery;
    },
    _evaluateQuerySyntaxInternal: function () {
        var query = "";
        var prefix = "t=";
        var level = this.detail || 1;
        var primaryCriteria = this.getSafeAttribute("criteria");
        var primaryType = this.getSafeAttribute("type");
        var secondaryType = this.getSafeAttribute("secondaryType");
        var secondaryCriteria = this.getSafeAttribute("secondaryCriteria");
        var proximity = parseInt(this.getSafeAttribute("joinType") || 0);
        var includeExclude = this.getSafeAttribute("join");
        var restriction = this.getSafeAttribute("scope");

        if (step.util.isBlank(primaryCriteria)) {
            return "";
        }

        if (level == "") {
            level = 1;
        }

        //add the restriction
        var restrictionQuery = this._evalTextRestriction(restriction, query);

        //eval first part of the criteria
        query = this._evalCriteria(primaryType, primaryCriteria, query);

        if (level == 0 || secondaryCriteria == null || $.trim(secondaryCriteria) == "") {
            var finalQuery = prefix + restrictionQuery + query;
            return finalQuery;
        }

        if (includeExclude == this.textDefaults.simpleTextIncludesReference[0]) {
            if (proximity != 0) {
                query += " ~" + proximity + " ";
            } else {
                //add brackets and AND
                query = "(" + $.trim(query) + ") AND ";
            }

            query = this._evalCriteria(secondaryType, secondaryCriteria, query);
        } else if (includeExclude == this.textDefaults.simpleTextIncludesReference[1]) {
            if (secondaryType == this.textDefaults.simpleTextSecondaryTypesReference[0]) {
                //excluding separate words
                query += this._evalExcludeWord(secondaryCriteria);
            } else {
                //excluding a phrase
                query += this._evalExcludePhrase(secondaryCriteria);
            }
        }

        return prefix + restrictionQuery + query;
    },

    _evalCriteria: function (searchType, criteria, query) {
        switch ($.trim(searchType)) {
            case this.textDefaults.simpleTextTypesReference[0] :
                query += this._evalAnyWord(criteria);
                break;
            case this.textDefaults.simpleTextTypesReference[1] :
                query += this._evalAllWords(criteria);
                break;
            case this.textDefaults.simpleTextTypesReference[2] :
                query += this._evalExactPhrase(criteria);
                break;
            case this.textDefaults.simpleTextTypesReference[3] :
                query += this._evalSpellings(criteria);
                break;
            case this.textDefaults.simpleTextTypesReference[4] :
                query += this._evalStarting(criteria);
                break;
        }
        return query;
    },
    _evalExactPhrase: function (text) {
        if (!step.util.isBlank(text)) {
            return ' "' + text + '" ';
        }
        return "";
    },

    _evalAllWords: function (text) {
        if (!step.util.isBlank(text)) {
            var words = "+" + $.trim(text).split(" ").join(" +");
            return words;
        }
        return "";
    },

    _evalAnyWord: function (text) {
        if (!step.util.isBlank(text)) {
            return " +(" + text + ")";
        }
        return "";
    },

    _evalSpellings: function (text) {
        if (!step.util.isBlank(text)) {
            return " " + $.trim(text).split(" ").join("~ ") + "~ ";
        }
        return "";
    },

    _evalStarting: function (text) {
        if (!step.util.isBlank(text)) {
            return " " + $.trim(text).split(' ').join('* ') + '* ';
        }
        return "";
    },

    _evalExcludeWord: function (text) {
        if (!step.util.isBlank(text)) {
            var words = text.split(" ");
            var syntax = "";
            for (var i = 0; i < words.length; i++) {
                syntax += " -" + words[i];
            }
            return syntax;
        }
        return "";
    },

    _evalExcludePhrase: function (text) {
        if (!step.util.isBlank(text)) {
            return ' -"' + text + '"';
        }
        return "";
    },

    _evalWordsWithinRangeOfEachOther: function (text, range) {
        if (!step.util.isBlank(text)) {
            return ' "' + text + '"~' + range;
        }
        return "";
    },

    _evalProximity: function (proximity, query, secondaryQuery) {
        if (!step.util.isBlank(proximity)) {
            //join the two queries up
            query = "(" + query + ") ~" + proximity + " (" + secondaryQuery + ")";
        }
        return query;
    },

    _evalTextRestriction: function (restriction, query) {
        if (!step.util.isBlank(restriction)) {
            //join the two queries up
            query = "+[" + restriction + "] " + query;
        }
        return query;
    },

    _evalTextRestrictionExclude: function (restriction, query) {
        if (!step.util.isBlank(restriction)) {
            //join the two queries up
            query = "-[" + restriction + "] " + query;
        }
        return query;
    }
});