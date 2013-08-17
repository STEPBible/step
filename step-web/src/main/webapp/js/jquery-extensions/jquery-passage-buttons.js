$.widget("custom.passageButtons",  {
    options : {
        passageId : 0,
        ref : null,
        version : null,
        //whether to expand to chapter when the button is clicked
        showChapter : false,
        display : null,
        //whether to show the reference on the buttons themselves
        showReference : true,
        clickHandler : undefined,
        selectable : false
    },
    
    /**
     * Creates the passageButtons
     */
    _create : function() {
        if(this.options.selectable) {
            var leftGuid = step.util.guid();
            var rightGuid = step.util.guid();
            var groupGuid = step.util.guid();
            this.leftLink = $("<input type='radio' />").prop("id", leftGuid).prop('name', groupGuid).prop("passageId", 0);
            this.rightLink = $("<input type='radio' />").prop("id", rightGuid).prop('name', groupGuid).prop("passageId", 1);
            this.element.append($("<label>").prop("for", leftGuid).append("&nbsp;"));
            this.element.append($("<label>").prop("for", rightGuid).append("&nbsp;"));

            //set the selected one
            (this.options.passageId == 0 ? this.leftLink : this.rightLink).prop("checked", true);
        } else {
            this.leftLink = $("<a>&nbsp;</a>").attr('href', 'javascript:void(0)');
            this.rightLink = $("<a>&nbsp;</a>").attr('href', 'javascript:void(0)');
        }

        //add css style
        if(this.options.display == "inline") {
            this.element.addClass("passageButtonsWidgetInline");
        }

        var isLeft = false;
        if(this.options.showReference) {
            this.element.addClass("passageButtonsWidget").attr('ref', this.options.ref);
            isLeft = this.options.passageId == 0 || this.options.passageId == undefined;
            var majorElement = isLeft ? this.leftLink : this.rightLink;
            var minorElement = isLeft ? this.rightLink : this.leftLink;

            majorElement.html(this.options.ref);
            majorElement.css("width", "75%");
            majorElement.html(this.options.ref);
            minorElement.css("width", "25%");
        }

        //icons
        this.element.append([this.leftLink, this.rightLink]);
        this.leftLink.button({ icons : { primary : "ui-icon-arrowthick-1-w" }, text : !this.options.selectable || isLeft });
        this.rightLink.button({ icons : { primary : undefined, secondary : "ui-icon-arrowthick-1-e" }, text : !this.options.selectable && !isLeft });

        //append to containing elements
        this.element.buttonset();
        

        //add handlers
        if(this.options.clickHandler == undefined) {
        var self = this;
            this.leftLink.click(function() { self._clickHandler(0); });
            this.rightLink.click(function() { self._clickHandler(1); });
        } else {
            this.leftLink.click(this.options.clickHandler);
            this.rightLink.click(this.options.clickHandler);
        }

        passageArrowHover(this.leftLink, true);
        passageArrowHover(this.rightLink, false);
    },
    
    _clickHandler : function(passageId) {
        passageArrowTrigger(passageId, this.options.version, this.options.ref, this.options.showChapter, true);
        $($(".column")[passageId]).removeClass("primaryLightBg");
    },
    
    select : function(passageId) {
        (passageId == 0 ? this.leftLink : this.rightLink).prop('checked', true).button("refresh");
    }
});

