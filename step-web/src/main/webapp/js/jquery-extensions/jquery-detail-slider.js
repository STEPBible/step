$(function() {
    $.widget("custom.detailSlider", {
    	options : {
    	    scopeSelector : undefined,
    	    key : undefined,
    	    keySelector : undefined
    	},
    	
    	/**
    	 * the constructor
    	 */
    	_create : function() {
    	    this._initKey();
    	    this._initScopeSelector();
    	    
    	    var self = this;
            var slider = $("<span class='detailLevel'>&nbsp;</span>").slider({
                min : 1,
                max : 3,
                slide : function(event, ui) {
                    self._updateSliderImpact(ui.value - 1);
                },
                value : self._getValue() + 1
            });
            
    	    var label = $("<span class='sliderDetailLevelLabel'>Quick view</span>");
            var widgetContent = $("<span class='detailSliderContainer'></span>").append(label).append(slider);
            
    	    this.element.prepend(widgetContent);
    	    this.element.addClass("detailSlider")
    	    
    	    this._updateLabel();
    	    this._updateSliderImpact(this._getValue(), false);
//    	    console.log("Done for " + this.options.key);
    	},
    	
    	value : function(event) {
    	    return this._getValue();
    	},
    	
    	_getValue : function() {
    	    var passageId = step.passage.getPassageId(this.element);
    	    var value = step.state._storeAndRetrieveCookieState(passageId, "slideView-" + this.options.key);
    	    
    	    if(value == undefined) {
    	        value = step.state._storeAndRetrieveCookieState(passageId, "slideView-" +this.options.key, 0);
    	    }
    	    return parseInt(value);
    	},
    
    	_initKey : function() {
    	    if(this.options.key == undefined) {
    	        if(this.options.keySelector == undefined) {
    	            this.options.key = this.element.attr('name');
    	        } else {
    	            this.options.key = this.element.find("this.options.keySelector").text().replace(' ', '-');
    	        }
    	    }
    	},
    	
    	_initScopeSelector : function() {
    	    if(this.options.scopeSelector == undefined) {
                this.options.scopeSelector = this.element;
            }
    	},
    	
    	_updateSliderImpact : function(newLevel, fire) {
    	  //update level
    	    var passageId = step.passage.getPassageId(this.element);
            step.state._storeAndRetrieveCookieState(passageId, "slideView-" + this.options.key, newLevel, false);
    	    this._updateLabel(newLevel);
    
    	    // show all relevant levels
    	    var allElements = $("*", this.options.scopeSelector);
    	    allElements.filter(function() {
    	        return $(this).attr("level") <= newLevel;
    	    }).show();
    	    
    	    allElements.filter(function() {
    	        return $(this).attr("level") > newLevel;
    	    }).hide();
    	    
    	    if(fire == undefined || fire == true) {
    	        $.shout("slideView-" + this.options.key, { passageId : passageId});
    	    }
    	},
    	
    	_updateLabel : function() {
    	    $(".sliderDetailLevelLabel", this.element).html(DETAIL_LEVELS[this._getValue()] + " view");
    	}
    });
});