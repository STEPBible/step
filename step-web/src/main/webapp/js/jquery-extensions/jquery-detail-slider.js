$(function() {
    $.widget("custom.detailSlider", {
    	options : {
            value : 0,
            changed : undefined
        },

        /**
    	 * the constructor which creates the widget
    	 */
    	_create : function() {
    	    var self = this;
            this.slider = $("<span class='detailLevel'>&nbsp;</span>").slider({
                min : 0, // Basic view
                max : 2, // Advanced view
                slide : function(event, ui) {
                    self.handleSlide(ui.value);
                },
                value : self.options.model ? self.options.model.get("detail") : self.options.value
            });



    	    this.label = $("<span class='sliderDetailLevelLabel'>" + DETAIL_LEVELS[0] + "</span>");
            this.widgetContent = $("<span class='detailSliderContainer'></span>").append(this.label).append(this.slider);
    	    this.element.prepend(this.widgetContent);
    	    this.element.addClass("detailSlider");
            this.handleSlide(this.value());
    	},
    	
    	value : function(value) {
            if(value != undefined) {
                var previousValue = this.slider.slider("value");
                this.slider.slider("value", value);
            }

            return parseInt(this.slider.slider("value"));
    	},

        /**
         * Refreshes the slider/form to the correct value.
         */
        refresh : function() {
            this.handleSlide(this.value());
        },
        
        /**
         * Handles a slide to a particular value
         * @param value the value to be set
         * @private
         */
        handleSlide: function (value) {
            this.value(value);
            this.options.value = value;
            this._updateSliderImpact(value);
            if(this.options.changed) {
                this.options.changed(value);
            }
        },

        /**
    	 * isInitialising indicates that we are in the process of initialising the components 
    	 * and therefore may require to do extra/or different things
         * @param newLevel the new level for the slider
    	 */
    	_updateSliderImpact : function(newLevel) {
    	    //update level by first updating the text
            this._updateLabel(newLevel);

            //then update the elements controller by the slider...
    	    var allElements = $("*", this.element);
    	    allElements.filter(function() {
    	        return $(this).attr("level") <= newLevel;
    	    }).show();
    	    
    	    allElements.filter(function() {
    	        return $(this).attr("level") > newLevel;
    	    }).hide();
    	},

        /**
         * Updates the text of the slider, according to the current value
         * @private
         */
    	_updateLabel : function(newLevel) {
    	   this.label.text(DETAIL_LEVELS[newLevel]);
    	}
    });
});