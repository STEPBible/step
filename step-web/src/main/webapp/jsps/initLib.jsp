<%@page import="java.io.FileReader"%>
<%@page import="java.io.BufferedReader"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%!
    public String restAPIURL;
%>
<%-- Don't know if the following lines are useful, commented them out on Jan 20, 2021.  PT --%>
<%-- <c:set var="baseSTEP"> --%>
<%--     <c:choose> --%>
<%--         <c:when test="${ param.mobile eq 'online' and not empty param.baseURL }">${ param.baseURL }</c:when> --%>
<%--         <c:when test="${ param.mobile eq 'online' }">http://www.stepbible.org/</c:when> --%>
<%--         <c:otherwise>/</c:otherwise> --%>
<%--     </c:choose> --%>
<%-- </c:set> --%>
<%	if (restAPIURL == null) {
        restAPIURL = "rest/";
        try {
            String pathOfServlet = getServletContext().getRealPath("/");
            String[] pathOfServletSplits = pathOfServlet.split("[\\\\\\/]"); // Either \ for Windows or / characters for Linux
            pathOfServlet = "/var/www/" + pathOfServletSplits[pathOfServletSplits.length - 1]  + "_config.txt";
            String prefixForThisTomcatContext = "REST_API_URL:";
            BufferedReader reader = new BufferedReader(new FileReader(pathOfServlet));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.indexOf(prefixForThisTomcatContext) == 0) {
					restAPIURL = line.substring(prefixForThisTomcatContext.length()) + "rest/";
					break;
				}
            }
            reader.close();
        }
        catch (Exception e) {
            restAPIURL = "rest/";
        }
	}
%>

<!-- Set up some library variables -->
<script type="text/javascript">
    var step = {};
    if(typeof console === "undefined") {
        console = { log: function(arg, options) { } };
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
    STEP_SERVER_BASE_URL = "<%= restAPIURL %>";

    //Set up timeline - comment out in June 13, 2023
    // Timeline_ajax_url="libs/timeline_ajax/simile-ajax-api.js?bundle=true";
    // Timeline_urlPrefix="libs/timeline_js/";
    // Timeline_parameters="bundle=true";
</script>