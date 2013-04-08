$.widget("custom.pasageButtons",  {
    options : {
        passageId : 0,
        ref : null
    },
    
    /**
     * Creates the passageButtons
     */
    _create : function() {
        var leftLink = $("<a>&nbsp;</a>").attr('href', '#'); 
        var rightLink = $("<a>&nbsp;</a>").attr('href', '#');
        
        
        this.element.addClass("passageButtonsWidget").attr('ref', this.options.ref);
        var isLeft = this.options.passageId == 0 || this.options.passageId == undefined;
        var majorElement = isLeft ? leftLink : rightLink;
        var minorElement = isLeft ? rightLink : leftLink;
        
        majorElement.html(this.options.ref);
        majorElement.css("width", "75%");
        majorElement.html(this.options.ref);
        minorElement.css("width", "25%");

        //icons
        leftLink.button({ icons : { primary : "ui-icon-arrowthick-1-w" }, text : isLeft });
        rightLink.button({ icons : { primary : "ui-icon-arrowthick-1-e" }, text : !isLeft });
        
        //append to containing elements
        this.element.append([leftLink, rightLink]);
        this.element.buttonset();
        
        //add handlers
        var self = this;
        leftLink.click(function() { self._clickHandler(0); });
        rightLink.click(function() { self._clickHandler(1); });
        
        passageArrowHover(leftLink, this.options.ref, true);
        passageArrowHover(rightLink, this.options.ref, false);
    },
    
    _clickHandler : function(passageId) {
        passageArrowTrigger(passageId, this.options.ref);
        $($(".column")[passageId]).removeClass("primaryLightBg");

    }
});

