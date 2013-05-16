$(function() {
    $.widget("custom.detailSlider", {
    	options : {
    	    scopeSelector : undefined,
    	    key : undefined,
    	    keySelector : undefined,
    	    title : undefined
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
            
    	    var label = $("<span class='sliderDetailLevelLabel'>" + DETAIL_LEVELS[0] + "</span>");
            var widgetContent = $("<span class='detailSliderContainer'></span>").append(label).append(slider);
            
            if(this.options.title) {
                slider.attr("title", this.options.title);
            }
            this.slider = slider;
    	    this.element.prepend(widgetContent);
    	    this.element.addClass("detailSlider")
    	    
    	    this._updateLabel();
    	    this._updateSliderImpact(this._getValue(), false, true);
//    	    console.log("Done for " + this.options.key);
    	},
    	
    	update : function(event) {
    	    this.slider.slider("value", event.value +1);
    	    this._updateSliderImpact(event.value);
    	},
    	
    	value : function(event) {
    	    if(event) {
    	        this.update(event);
    	    }
    	    
    	    return this._getValue();
    	},
    	
    	_getValue : function() {
    	    var passageId = step.passage.getPassageId(this.element);
    	    var value = step.state._storeAndRetrieveCookieState(passageId, "slideView-" + this.options.key);
    	    
    	    if(value == undefined) {
    	        value = step.state._storeAndRetrieveCookieState(passageId, "slideView-" +this.options.key, 0, false);
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
    	
    	/**
    	 * isInitialising indicates that we are in the process of initialising the components 
    	 * and therefore may require to do extra/or different things
    	 */
    	_updateSliderImpact : function(newLevel, fire, isInitialising) {
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

    	        //fire change for hash browser          
                var optionName = $(this.element).closest("fieldset").attr('name');
                if(!isInitialising && optionName) {
                    console.log("Triggering hash change", newLevel, step.passage.getPassageId(this.element));
                    step.state.browser.changeTrackedSearch(passageId, optionName);
                }
    	    }
    	},
    	
    	_updateLabel : function() {
    	    $(".sliderDetailLevelLabel", this.element).html(DETAIL_LEVELS[this._getValue()]);
    	}
    });
});