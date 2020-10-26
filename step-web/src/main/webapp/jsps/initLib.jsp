<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="baseSTEP">
    <c:choose>
        <c:when test="${ param.mobile eq 'online' and not empty param.baseURL }">${ param.baseURL }</c:when>
        <c:when test="${ param.mobile eq 'online' }">http://www.stepbible.org/</c:when>
        <c:otherwise>/</c:otherwise>
    </c:choose>
</c:set>

<!-- Set up some library variables -->
<script type="text/javascript">
    var step = {};
    if(typeof console === "undefined") {
        console = { log: function(arg, options) { } };
    }
    
    //define array indexOf for IE8
    if(!Array.prototype.indexOf){
        Array.prototype.indexOf=function(e){"use strict";if(this==null){throw new TypeError}var t,n,r=Object(this),i=r.length>>>0;if(i===0){return-1}t=0;if(arguments.length>1){t=Number(arguments[1]);if(t!=t){t=0}else if(t!=0&&t!=Infinity&&t!=-Infinity){t=(t>0||-1)*Math.floor(Math.abs(t))}}if(t>=i){return-1}for(n=t>=0?t:Math.max(i-Math.abs(t),0);n<i;n++){if(n in r&&r[n]===e){return n}}return-1};
    }

    //patch to make available 'sendAsBinary'
    if (!('sendAsBinary' in XMLHttpRequest.prototype)) {
        XMLHttpRequest.prototype.sendAsBinary = function(string) {
            var bytes = Array.prototype.map.call(string, function(c) {
                return c.charCodeAt(0) & 0xff;
            });
            this.send(new Uint8Array(bytes).buffer);
        };
    }
    
    //Set up the variables for accessing the server
    STEP_SERVER_BASE_URL = "${baseSTEP}rest/";

    //Set up timeline:
    Timeline_ajax_url="libs/timeline_ajax/simile-ajax-api.js?bundle=true";
    Timeline_urlPrefix="libs/timeline_js/";
    Timeline_parameters="bundle=true";
</script>