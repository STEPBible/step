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

        var lowest = tagWeights[0];
        var highest = tagWeights.pop();
        var constant = Math.log(highest - (lowest - 1)) / (opts.size.end - opts.size.start);
        if (constant == 0) {
            constant = 1;
        }

        return this.each(function () {
            if (opts.size) {
                var weighting = Math.log($(this).attr("rel") - (lowest - 1)) / constant + opts.size.start;
                $(this).css({"font-size": weighting + opts.size.unit});
            }
        });
    };

    $.fn.tagcloud.defaults = {
        size: {start: 14, end: 18, unit: "pt"}
    };

})(jQuery);
