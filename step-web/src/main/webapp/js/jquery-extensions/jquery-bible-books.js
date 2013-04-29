$.widget("custom.biblebooks", $.ui.autocomplete, {
    options: {
        version : undefined,
        minLength : 0,
        delay : 0,
        model : undefined

    },

    /**
     * Constructs the widget
     * @private
     */
    _create: function () {
        var self = this;
        this._super();
        this.minLength = 0;
        this.source = function (request, response) { self.getBibleBooks(request, response); };
        this.element.click(function () {
            self.search($(this).val());

            //if no results, then re-run search with nothing
            if(self.element.attr("autocomplete") == "off") {
                //search for nothing, to re-open the box
                self.search("");
            }
        });
        this.options.select = function (event, ui) { self.selectItem(event, ui); };
        this.element.blur(function () { $(this).trigger('change'); });
        this._renderItem = function (ul, item) {
            ul.addClass("stepComplete");
            return $("<li></li>")
                .data("ui-autocomplete-item", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        };

        this._on( this.menu.element, {
            menuselect : function() {
                //force menu back open
                if(self.forceMenuOpen) {
                    self.search(self.forceValue);
                    self.forceMenuOpen = undefined;
                    self.forceValue = undefined;
                }
            }
        });
    },

    /**
     * Handler for when an item in the list is selected
     * @param event the event object
     * @param ui the arguments, including label, value and wholeBook
     */
    selectItem: function (event, ui) {
        var self = this;

        //if a whole book, we carry out another search
        if(ui.item.wholeBook) {
            self.forceMenuOpen = true;
            self.forceValue = ui.item.value;
        } else {
            //we trigger a change, to signal the passage has changed...
            this.element.val(ui.item.value);
            this.element.trigger('change');
        }
    },

    /**
     * Obtains bible books from the server
     * @param request the request
     * @param response the response object
     */
    getBibleBooks: function (request, response) {
        $.getPassageSafe({
            url: BIBLE_GET_BIBLE_BOOK_NAMES,
            args: [request.term, this.options.version],
            callback: function (text) {
                response($.map(text, function (item) {
                    var label = $("<span>").append(item.shortName)
                        .append($("<span style='font-size: larger'>&rArr;</span>"))
                        .append(item.fullName);

                    return {
                        label: label.html(),
                        value: item.shortName,
                        wholeBook: item.wholeBook
                    };
                }));
            },
            passageId: self.passageId,
            level: 'error'
        });
    }
});
