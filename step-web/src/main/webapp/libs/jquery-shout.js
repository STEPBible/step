/*
 * jQuery Shout plugin
 * http://gnu.gabrielfalcao.com/shout
 *
 * Copyright (c) 2009 Gabriel Falcão
 * Dual licensed under the MIT and GPL 3+ licenses.
 *
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/copyleft/gpl.html
 *
 * Version: 0.1
 */
jQuery.extend(
{
    _jq_shout: {},
    shout: function (event, data){
    	if(this._jq_shout.registry[event] != null) {
	        jQuery.each(this._jq_shout.registry[event],
	                    function (){
	                        this.callback(this.source, data);
	                    });
	    	}
    }
});


jQuery.extend(jQuery._jq_shout,
{
    registry: {}
});

jQuery.extend(jQuery.fn,
{
    hear: function (eventName, messageCallback) {
        var $self = this;
        var list = jQuery._jq_shout.registry[eventName];
        if (!list) {
            jQuery._jq_shout.registry[eventName] = [];
        }
        return this.each(function() {
                             var item = {
                                 source: $self,
                                 callback: messageCallback
                             }
                             jQuery._jq_shout.registry[eventName].push(item);
                         });
    }
});
