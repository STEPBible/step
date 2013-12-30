<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bookmarks" tagdir="/WEB-INF/tags/bookmarks" %>
<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>

<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
    WebStepRequest stepRequest = new WebStepRequest(injector, request);
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
%>
<fmt:setBundle basename="HtmlBundle" scope="request" />
<!DOCTYPE html  xmlns:fb="http://ogp.me/ns/fb#">
<html>
<head>
    <TITLE><%= stepRequest.getTitle() %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta step-local content="<%= appManager.isLocal() %>" />
    <meta name="step.version" content="${project.version}" />
    <meta name="description" content="<%= stepRequest.getDescription() %>" />
    <meta name="keywords" content="<%= stepRequest.getKeywords() %>" />
    <link rel="shortcut icon"  href="images/step-favicon.ico" />
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <%
        if (stepRequest.getThisVersion().length() > 0 || stepRequest.getThisReference().length() > 0) {
    %>
    <link rel="canonical" href="http://www.stepbible.org/?version=<%= stepRequest.getThisVersion() %>&amp;reference=<%= stepRequest.getThisReference() %>" />
    <%
    } else {
    %>
    <link rel="canonical" href="http://www.stepbible.org" />
    <%
        }
    %>


    <%
        if(request.getParameter("debug") != null) {
    %>
    <!-- Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet" media="screen" />
    <link href="css/bootstrap-theme.min.css" rel="stylesheet" media="screen" />
    <link href="css/select2.css" rel="stylesheet" media="screen" />
    <link href="css/select2-bootstrap.css" rel="stylesheet" media="screen" />
    <link href="scss/step-template.css" rel="stylesheet" media="screen" />
    <%--<link href="css/magicsuggest-1.3.1-min.css" rel="stylesheet" media="screen" />--%>
    <%--<link href="css/typeahead.js-bootstrap.css" rel="stylesheet" media="screen" />--%>
    <%--<link href="css/prettyCheckable.css" rel="stylesheet" media="screen" />--%>


    <%@include file="jsps/offlineJqueryCss.jsp" %>
    <link rel="stylesheet" type="text/css" href="css/qtip.css" />
    <%--<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />--%>
    <%--<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu-v.css" />--%>
    <%--<link rel="stylesheet" type="text/css" href="css/initial-layout.css" />--%>
    <%--<link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />--%>
    <link rel="stylesheet" type="text/css" href="css/passage.css" />
    <!-- 	    <link rel="stylesheet" type="text/css" href="css/timeline.css" /> -->
    <%--<link rel="stylesheet" type="text/css" href="css/search.css" />--%>
    <%--<link rel="stylesheet" type="text/css" href="css/cardo.css" />--%>
    <%
    } else {
    %>
    <%-- Contains the jquery ui css --%>
    <link rel="stylesheet" type="text/css" href="css/step.${project.version}.min.css" />
    <%
        }
    %>
    
    
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->


   

</head>
<body>
<!-- Wrap all page content here -->
<div id="wrap">

    <!-- Fixed navbar -->
    <div class="navbar navbar-default navbar-fixed-top " >
        <div>
            <div class="navbar-header">
                <div class="navbar-brand col-xs-1 col-sm-2 col-md-3">
                    <span class="hidden-xs title">
                        <a href="#">STEP</a>
                        <br />
                        <span class="subtitle">
                            <span class="hidden-xs">Created by <br/></span>
                            <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House</a>
                        </span>
                    </span>
                </div>
                <div class="col-xs-6 col-sm-6 col-md-6 search-form">
                    <form role="form">
                        <div class="form-group">
                            <div class="input-group">
                                <input id="masterSearch" type="text" class="form-control input-sm" placeholder="<fmt:message key="search_placeholder" />">
                                <span class="input-group-btn">
                                  <button class="btn btn-default btn-danger btn-sm" type="button">Search</button>
                                </span>
                            </div>
                            <a href="javascript:void(0)" class="advancedSearch">
                                Advanced search
                            </a>
                        </div>
                    </form>
                </div>
                <div class="col-xs-1 col-sm-4 col-md-3 help">
                    <jsp:include page="js/menu/top/menu.jsp" />
                </div>
            </div>
        </div>
    </div>

    <div class="mainPanel row row-offcanvas">
        <div class="" id='columnHolder'>
            <div class="col-sm-6 col-xs-12 column active">
            <span class="activeMarker"></span>
            <div class="passageContainer" passage-id=0>
                <div class="passageText ui-widget">
                    <div class="btn-group pull-right passageOptionsGroup">
                        <button class="btn btn-default btn-sm" type="button" title="<fmt:message key="share" />">
                            <span class="glyphicon glyphicon-comment"></span>
                        </button>
                        <button class="btn btn-default btn-sm showStats" type="button" title="<fmt:message key="passage_stats" />">
                            <span class="glyphicon glyphicon-stats"></span></button>
                        <button class="btn btn-default btn-sm dropdown-toggle showSettings" title="<fmt:message key="view" />" type="button" data-toggle="dropdown">
                            <span class="glyphicon glyphicon-cog"></span>
                        </button>
                    </div>
                    <div class="passageContent" itemprop="text">&nbsp;<%= stepRequest.getPassage(0) %></div>
                </div>
            </div>
        </div>
        </div>
        <div class="sidebar-offcanvas" id="sidebar" role="navigation"></div>
    </div>
    



    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<%--<script src="https://code.jquery.com/jquery.js"></script>--%>
<!-- Include all compiled plugins (below), or include individual files as needed -->

        <%
        if(request.getParameter("lang") == null) {
    %>
    <script src="international/interactive.js" type="text/javascript"></script>
        <% } else { %>
    <script src="international/interactive.js?lang=<%= request.getParameter("lang") %>" type="text/javascript"></script>
        <% } %>
    <%@include file="jsps/initLib.jsp" %>

    <%-- Now do javascript --%>
    <%
        if(request.getParameter("debug") != null) {
    %>

    <%-- NOTE: do not include in prod web minifying and use minified versions otherwise --%>
    <%@include file="jsps/offlineJqueryJs.jsp" %>
    <script src="libs/bootstrap.min.js"></script>
    <%--<script src="libs/magicsuggest-1.3.1-min.js"></script>--%>
    
    <script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
    <%--<script src="libs/jquery.tagcloud.js" type="text/javascript"></script>--%>
    <%--<script src="libs/tinymce/jquery.tinymce.min.js" type="text/javascript"></script>--%>
    <script src="libs/underscore-min.js" type="text/javascript"></script>
    <script src="libs/json2.js" type="text/javascript"></script>

    <c:choose>
        <c:when test="${ param.debug eq '' }">
            <script src="libs/backbone.js" type="text/javascript"></script>
            <script src="libs/backbone.localStorage.js" type="text/javascript"></script>
            <%--<script src="libs/select2.js" type="text/javascript"></script>--%>
            <script src="libs/require-2.1.9.js" type="text/javascript"></script>
    </c:when>
    <c:otherwise>
            <script src="libs/backbone-min.js" type="text/javascript"></script>
            <script src="libs/backbone.localStorage-min.js" type="text/javascript"></script>
            <%--<script src="libs/select2-3.4.5.min.js" type="text/javascript"></script>--%>
            <script src="libs/require-2.1.9.min.js" type="text/javascript"></script>
            <%--<script src="libs/prettyCheckable.min.js" type="text/javascript"></script>--%>
    </c:otherwise>
    </c:choose>
    
    <%-- Do these need to use $.ready? --%>
    <script src="js/require_config_dev.js" type="text/javascript"></script>
    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>
    <script src="js/backbone/models/model_data.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_main_search.js" type="text/javascript"></script>
    <script src="js/step_ready.js" type="text/javascript"></script>
    <script src="js/backbone/step_router.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_display_passage.js" type="text/javascript"></script>
    <script src="js/backbone/models/passage_model.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_menu_passage.js" type="text/javascript"></script>
    <%--<script src="js/backbone/models/model_options.js" type="text/javascript"></script>--%>
    
    
    <%-- can be loaded with requires? --%>
    <%--<script src="libs/dohighlight-min.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-qtip.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_sidebar.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_sidebar.js"  type="text/javascript"></script>--%>
    
    
    <%--<script src="js/jquery-extensions/jquery-hover-intent.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-cookie.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-local-store.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-shout.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-versions-complete.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-lexical-complete.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-detail-slider.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-passage-buttons.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-original-word-toolbar.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-search-result.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-bible-books.js" type="text/javascript"></script>--%>
    <%--<script src="js/ddsmoothmenu.js" type="text/javascript"></script>--%>
    <%--<script src="js/util.js" type="text/javascript"></script>--%>
    <%--<script src="js/ui_hooks.js" type="text/javascript"></script>--%>
    
    <%--<script src="js/lexicon_definition.js" type="text/javascript"></script>--%>
    <%-- 	    <script src="js/timeline.js" type="text/javascript"></script> --%>
    <%-- 	    <script src="js/geography.js" type="text/javascript"></script> --%>
    <%--<script src="js/toolbar_menu.js" type="text/javascript"></script>--%>
    <%--<script src="js/defaults/step.defaults.js" type="text/javascript"></script>--%>
    <%--<script src="js/navigation/step.navigation.js" type="text/javascript"></script>--%>
    <script src="js/state/step.state.js" type="text/javascript"></script>
    <%--<script src="js/state/step.state.view.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/step.menu.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/top/help.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/top/view.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/top/top.menu.ui.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/passage/context.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/passage/display.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/passage/passageTools.js" type="text/javascript"></script>--%>
    <%--<script src="js/menu/passage/search.js" type="text/javascript"></script>--%>
    <%--<script src="js/passage/step.version.js" type="text/javascript"></script>--%>
    <%--<script src="js/passage/step.alternatives.js" type="text/javascript"></script>--%>
    <script src="js/passage/step.passage.js" type="text/javascript"></script>
    <%--<script src="js/passage/step.fonts.js" type="text/javascript"></script>--%>
    <%--<script src="js/passage/step.passage.navigation.js" type="text/javascript"></script>--%>
    <%--<script src="js/passage/step.passage.navigation.ui.js" type="text/javascript"></script>--%>
    <%--<script src="js/bookmark/step.bookmark.ui.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_passage.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_passage.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/router.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_passage.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_lookup_menu.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_menu_search.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_control_criteria.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_search.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_search_subject.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_search_original.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_search_advanced.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_search_simple.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_notes.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_subject.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_word.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_advanced.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_text.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_criteria_notes.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_search.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_subject.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_text.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_word.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_display_notes.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_quick_lexicon.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_quick_lexicon.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_bookmark.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_bookmarks_history.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_wordle_stat.js" type="text/javascript"></script>--%>

    <%--<script src="js/init.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/step.js" type="text/javascript"></script>--%>
        <%
		} else {
	%>
    <%-- If local, then we need to include our own copy of JQuery. Otherwise, include from CDN --%>
        <%
            if(appManager.isLocal()) {
        %>
    <%@include file="jsps/offlineJqueryJs.jsp" %>
        <%
            } else {
        %>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" type="text/javascript" ></script>
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.js" type="text/javascript"></script>
    <%--<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js" type="text/javascript" ></script>--%>
        <%
            }
        %>

    <script src="js/step.${project.version}.min.js" type="text/javascript" ></script>

        <% if (!appManager.isLocal()) { %>
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-36285759-1']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    </script>
    <script>
        var _prum = [['id', '52698a2cabe53d8c20000000'],
            ['mark', 'firstbyte', (new Date()).getTime()]];
        (function() {
            var s = document.getElementsByTagName('script')[0]
                    , p = document.createElement('script');
            p.async = 'async';
            p.src = '//rum-static.pingdom.net/prum.min.js';
            s.parentNode.insertBefore(p, s);
        })();
    </script>
        <% } %>
        <%
	}
	%>
    
    <%--<img src="images/wait_big.gif" id="waiting" />--%>
    
</body>
</html>
