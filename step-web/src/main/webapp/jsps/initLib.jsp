<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!-- Set up some library variables -->
<script type="text/javascript">
    var step = {};
    if(typeof console === "undefined") {
        console = { log: function(arg, options) { } };
    }
    //Set up the variables for accessing the server
    STEP_SERVER_BASE_URL = "rest/";

    //Set up timeline:
    Timeline_ajax_url="libs/timeline_ajax/simile-ajax-api.js?bundle=true";
    Timeline_urlPrefix="libs/timeline_js/";
    Timeline_parameters="bundle=true";
</script>