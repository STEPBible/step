/*!
 * jquery.tagcloud.js
 * A Simple Tag Cloud Plugin for JQuery
 *
 * https://github.com/addywaddy/jquery.tagcloud.js
 * created by Adam Groves
 */
(function ($) {

    /*global jQuery*/
    "use strict";

    var compareWeights = function (a, b) {
        return a - b;
    };
    

    
    $.fn.tagcloud = function (options) {
        var opts = $.extend({}, $.fn.tagcloud.defaults, options);
        var tagWeights = this.map(function () {
            return $(this).attr("rel");
        });
        tagWeights = jQuery.makeArray(tagWeights).sort(compareWeights);

        var lowest = 1;
        for(var i = 0; i < tagWeights.length; i++) {
            if(tagWeights[i] != 0) {
                lowest = tagWeights[i];
                break;
            }    
        }
        
        
        var highest = tagWeights.pop();
        var constant = Math.log(highest - (lowest - 1)) / (opts.size.end - opts.size.start);
        if (constant == 0) {
            constant = 1;
        }

        var duration = 3000;
 
        return this.each(function () {
            if (opts.size) {
                var rel = $(this).attr("rel");
                var thisLink = $(this); 
                if(rel == "0") {
//                    console.log("reducing size");
                    thisLink.animate({
                        fontSize : "0pt"
                    }, {
                        duration: duration / 2,
                        queue: false,
                        complete : function() {
//                            console.log("removing self");
                            $(this).hide({ duration: duration /2, complete : function() {
                                $(this).remove();    
                            }});
                        }
                    });
                }
                
                var weighting = Math.log(rel - (lowest - 1)) / constant + opts.size.start;
                if(opts.animate) {
                    var styles = thisLink.attr("style");
                        thisLink.animate({
                            fontSize: weighting + opts.size.unit
                        }, {
                            queue: false,
                            duration: duration
                        });
                } else {
                    $(this).css({"font-size": weighting + opts.size.unit});
                }
            }
        });
    };

    $.fn.tagcloud.defaults = {
        size: {start: 14, end: 18, unit: "pt"}
    };

})(jQuery);
