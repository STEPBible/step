<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ taglib prefix="search" tagdir="/WEB-INF/tags/search" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bookmarks" tagdir="/WEB-INF/tags/bookmarks" %>
<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.Calendar" %>

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    <link rel="stylesheet" type="text/css" href="css/cardo.css" />
    <%
    } else {
    %>
    <%-- Contains the jquery ui css --%>
    <link rel="stylesheet" type="text/css" href="css/step.${project.version}.min.css"  />
    <%
        }
    %>
    
    
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->

    <script>
        var _prum = [['id', '52698a2cabe53d8c20000000'], ['mark', 'firstbyte', (new Date()).getTime()]];
    </script>
</head>
<body xmlns:fb="http://ogp.me/ns/fb#">
    <!-- Wrap all page content here -->
    <div id="wrap">
    
        <!-- Fixed navbar -->
        <div class="navbar navbar-default navbar-fixed-top " >
            <div>
                <div class="navbar-header search-form">
                    <div class="navbar-brand col-xs-12">
                        <span class="hidden-xs title">
                            <a href="/"><img id="logo" src="images/step-top-left-logo.png" width="31" height="40" /></a>
                            <a href="/">STEP</a>
                            <br />
                            <span class="subtitle">
                                <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House</a>
                            </span>
                        </span>
                        <span class="help"><jsp:include page="js/menu/top/menu.jsp" /></span>
                        <form role="form">
                            <div class="form-group">
                                <div class="input-group">
                                    <input id="masterSearch" type="text" class="form-control input-sm" placeholder="<fmt:message key="search_placeholder" />">
                                    <span class="input-group-btn">
                                      <button class="find btn btn-default btn-danger btn-sm" type="button"><fmt:message key="find" /></button>
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="mainPanel row row-offcanvas">
            <div class="" id='columnHolder'>
                <div class="col-sm-6 col-xs-12 column">
                    <div class="passageContainer active" passage-id=0>
                        <span class="activeMarker"></span>
                        <div class="passageText ui-widget">
                            <div class="passageOptionsGroup">
                                <div class="btn-group pull-right">
                                    <a class="btn btn-default btn-sm previousChapter" type="button" title="<fmt:message key="passage_previous_chapter" />">
                                        <span class="glyphicon glyphicon-arrow-left"></span></a>
                                    <a class="btn btn-default btn-sm nextChapter" type="button" title='<fmt:message key="passage_next_chapter" />'>
                                        <span class="glyphicon glyphicon-arrow-right"></span>
                                    </a>
                                    <%
                                        if(!appManager.isLocal()) {
                                    %>
                                    <div class="dropdown btn-group">
                                        <button class="btn btn-default btn-sm dropdown-share" data-toggle="dropdown" type="button" title="<fmt:message key="share" />">
                                            <span class="glyphicon glyphicon-thumbs-up"></span>
                                        </button>
                                    </div>
                                    <%
                                        }
                                    %>
                                    <div class="dropdown btn-group settingsDropdown">
                                        <button class="btn btn-default btn-sm dropdown-toggle showSettings" title="<fmt:message key="view" />" type="button" data-toggle="dropdown">
                                            <span class="glyphicon glyphicon-cog"></span>
                                        </button>
                                    </div>
                                    <button class="btn btn-default btn-sm showStats" type="button" title="<fmt:message key="passage_open_sidebar" />">
                                        <span class="glyphicon glyphicon-save"></span></button>
                                    <button class="btn btn-default btn-sm closeColumn" title="<fmt:message key="close" />" type="button">
                                        <span class="glyphicon glyphicon-remove"></span>
                                    </button>
                                </div>
                                <div class="resultsLabel pull-right">
                                    <c:if test="${'PASSAGE' ne searchType}">
                                        <c:set var="pageMessage" scope="request"><fmt:message key="paging_showing" /></c:set>
                                        <%= String.format((String) request.getAttribute("pageMessage"), (Integer) request.getAttribute("numResults")) %>
                                    </c:if>
                                </div>
                            </div>
                            
                            <hr />
                            <div class="passageContent" itemprop="text">
                                <c:choose>
                                    <c:when test="${ 'PASSAGE' eq searchType }">
                                        ${ passageText }
                                    </c:when>
                                    <c:otherwise>
                                        <span>
                                            <%-- Do toolbar for original word search --%>
                                            <c:if test="${ ('ORIGINAL_GREEK_RELATED' eq searchType or 'ORIGINAL_HEBREW_RELATED' eq searchType) and fn:length(definitions) gt 0  }">
                                                <div class="originalWordSearchToolbar">
                                                    <div class="panel panel-default">
                                                        <div class="panel-heading">
                                                            <h4 data-toggle="collapse" href="#relatedWords" class="panel-title lexicalGrouping"><span class="glyphicon glyphicon-plus"></span><fmt:message key="lexicon_related_words" /></h4>
                                                        </div>
                                                            <div id="relatedWords" class="panel-body panel-collapse collapse">
                                                                <ul class="panel-collapse"style="height: auto;">
                                                                    <c:forEach items="${definitions}" var="definition">
                                                                        <%-- need to work out if the item is active --%>
                                                                        <c:set var="isActive" value="false" />
                                                                        <c:forEach var="item" items="${filter}">
                                                                            <c:if test="${item eq definition.strongNumber}">
                                                                                <c:set var="isActive" value="true" />
                                                                            </c:if>
                                                                        </c:forEach>
                                                                        
                                                                        <li class="sortable" strongnumber="${ definition.strongNumber}">
                                                                            <a href="javascript:void(0)"strong="G0015">
                                                                                <span class="glyphicon glyphicon-ok ${isActive ? 'active' : '' }"></span>
                                                                                ${ definition.stepTransliteration }
                                                                                (<span class="${fn:substring(definition.strongNumber, 0,1) == 'H' ?'hbFontMini' : 'unicodeFontMini'}">
                                                                                    ${ definition.matchingForm }
                                                                                </span> - ${ definition.gloss} )
                                                                            </a>
                                                                        </li>
                                                                    </c:forEach>
                                                                </ul>
                                                            </div>
                                                    </div>
                                                </div>
                                            </c:if>   
                                            
                                            <c:choose>
                                            <c:when test="${ 'SUBJECT_SIMPLE' eq searchType or 
                                                'SUBJECT_EXTENDED' eq searchType or 
                                                'SUBJECT_FULL' eq searchType or 
                                                'SUBJECT_RELATED' eq searchType }">
                                                <c:if test="${ 'SUBJECT_RELATED' ne searchType }">
                                                    <%-- Do search toolbar --%>
                                                    <div class="subjectToolbar">
                                                        <input <c:if test="${ 'SUBJECT_SIMPLE' eq searchType }">checked="checked"</c:if> type="radio" name="subjectSearchType" 
                                                               value="subject" id="0_esvHeadings"><label for="0_esvHeadings"><fmt:message key="search_subject_esv_headings" /></label>
                                                        <input type="radio" <c:if test="${ 'SUBJECT_EXTENDED' eq searchType }">checked="checked"</c:if> name="subjectSearchType" 
                                                               value="nave" id="0_nave"><label for="0_nave"><fmt:message key="search_subject_nave" /></label>
                                                        <input type="radio" <c:if test="${ 'SUBJECT_FULL' eq searchType }">checked="checked"</c:if> name="subjectSearchType" 
                                                               value="xnave" id="0_extendedNave"><label for="0_extendedNave"><fmt:message key="search_subject_nave_extended" /></label>
                                                    </div>
                                                </c:if>
                                                <c:choose>
                                                    <c:when test="${ 'SUBJECT_SIMPLE' eq searchType }">
                                                        <search:display_results results="${searchResults[0].headingsSearch.results }" />
                                                    </c:when>
                                                    <c:otherwise>
                                                        <div class="panel-group subjectSection searchResults">
                                                            <c:set var="previousHeading" value="not-set" />
                                                            <c:forEach var="result" items="${ searchResults }" varStatus="count">
                                                                
                                                                <c:if test="${ previousHeading ne result.root }">
                                                                    <h4 class="subjectHeading">${ result.root }</h4>
                                                                </c:if>
                                                                <c:set var="previousHeading" value="${result.root}" />
                                                                    <div class="panel panel-default" 
                                                                         root="${ result.root }"
                                                                         fullheader="${ result.heading }"
                                                                          <c:if test="${ not empty result.seeAlso }">seeAlso="${result.seeAlso}"</c:if>  
                                                                    >
                                                                        <div class="panel-heading">
                                                                            <h4 data-toggle="collapse" href="#subject-results-${ count.index }" class="panel-title expandableSearchHeading">
                                                                            <span class="glyphicon glyphicon-plus"></span>${ result.heading }</h4></div>
                                                                        <div class="results panel-collapse collapse"
                                                                             id="subject-results-${ count.index }"><fmt:message key="results_loading" /></div>
                                                                    </div>
                                                            </c:forEach>
                                                        </div>
                                                    </c:otherwise>
                                                </c:choose>
                                                
                                            </c:when>
                                            <c:otherwise>
                                                <div class="searchResults">
                                                    <search:display_results results="${searchResults}" />
                                                </div>
                                            </c:otherwise>
                                            </c:choose>
                                            
                                        </span>
                                    </c:otherwise>
                                </c:choose>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hidden-xs col-sm-2 col-sm-offset-4 column examplesColumn">
                    <div class="passageContainer examplesContainer">
                        <h1><fmt:message key="simple_intro_welcome" /></h1>
                        <h1><fmt:message key="simple_intro_tyndale_house_project" /></h1>
                        <br />
                        
                        <fmt:message key="simple_intro" />
                        <br /><br />
                        <search:sample_search explanation="simple_passage_explanation" option1="Gen 1" option1type="reference" option2="ESV" option2type="version" />
                        <search:sample_search explanation="simple_search_explanation" option1="NIV" option1type="version" option2="brother" option2type="greekMeanings" />
                        <search:sample_search explanation="simple_search_restricted_explanation" option1="The Pentateuch" option1type="reference" option2="ESV" option2type="version" option3="he.sed" option3type="hebrew" />
                        <search:sample_search explanation="simple_passage_explanation" option1="NIV" option1type="version" option2="ESV" option2type="version" option3="brother" option3type="greekMeanings" option4="he.sed" option4type="hebrew" />

                        <div class="text-muted step-copyright">&copy; Tyndale House, Cambridge, UK - <%= Calendar.getInstance().get(Calendar.YEAR) %></div>
                    </div>
                </div>
            </div>
            <div class="sidebar-offcanvas" id="sidebar" role="navigation"></div>
        </div>
    </div>
    
    <%-- Feedback form button--%>
    <button class="btn btn-primary btn-xs" id="raiseSupportTrigger" data-toggle="modal" data-target="#raiseSupport"><fmt:message key="help_feedback" /></button>
    <%
        if(request.getParameter("lang") == null) {
    %>
    <script src="international/interactive.js" type="text/javascript"></script>
    <% } else { %>
    <script src="international/interactive.js?lang=<%= request.getParameter("lang") %>" type="text/javascript"></script>
    <% } %>
    <%@include file="jsps/initLib.jsp" %>

    <%-- Now do javascript --%>
    <script type="text/javascript">
        window.tempModel = ${ not empty passageModel ? passageModel : 'undefined' };
        window.tempVersions = ${ versions };
        if(!window.step) { window.step = {} };
        step.userLanguage = "${ languageName }";
        step.userLanguageCode = "${ languageCode }";
    </script>
    
    
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
            <script src="libs/select2.js" type="text/javascript"></script>
            <script src="libs/require-2.1.9.js" type="text/javascript"></script>
        </c:when>
        <c:otherwise>
            <script src="libs/backbone-min.js" type="text/javascript"></script>
            <script src="libs/backbone.localStorage-min.js" type="text/javascript"></script>
            <script src="libs/select2-3.4.5.min.js" type="text/javascript"></script>
            <script src="libs/require-2.1.9.min.js" type="text/javascript"></script>
                    <%--<script src="libs/prettyCheckable.min.js" type="text/javascript"></script>--%>
        </c:otherwise>
    </c:choose>
    
    <%-- Do these need to use $.ready? --%>
    <script src="js/require_config_dev.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-cookie.js" type="text/javascript"></script>
    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_main_search.js" type="text/javascript"></script>
    <script src="js/step_ready.js" type="text/javascript"></script>
    <script src="js/backbone/step_router.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_display_passage.js" type="text/javascript"></script>
    <script src="js/backbone/models/model_history.js" type="text/javascript"></script>
    <script src="js/backbone/models/passage_model.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_menu_passage.js" type="text/javascript"></script>
    <script src="js/backbone/models/model_settings.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_feedback.js" type="text/javascript"></script>
    
    <%--<script src="js/backbone/models/model_options.js" type="text/javascript"></script>--%>
    
    
    <%-- can be loaded with requires? --%>
    <%--<script src="libs/dohighlight-min.js" type="text/javascript"></script>--%>
    <%--<script src="js/jquery-extensions/jquery-qtip.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/models/model_sidebar.js" type="text/javascript"></script>--%>
    <%--<script src="js/backbone/views/view_sidebar.js"  type="text/javascript"></script>--%>
    
    
    <%--<script src="js/jquery-extensions/jquery-hover-intent.js" type="text/javascript"></script>--%>
    
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

    <% if(!appManager.isLocal()) { %>
    <script>
        (function(w, d, s) {
            function go(){
                var js, fjs = d.getElementsByTagName(s)[0], load = function(url, id) {
                    if (d.getElementById(id)) {return;}
                    js = d.createElement(s); js.src = url; js.id = id;
                    js.async = 'async';
                    fjs.parentNode.insertBefore(js, fjs);
                };
                
                load('//connect.facebook.net/en_GB/all.js#xfbml=1', 'fbjssdk');
                load('https://apis.google.com/js/plusone.js', 'gplus1js');
                load('//platform.twitter.com/widgets.js', 'tweetjs');
                load('//rum-static.pingdom.net/prum.min.js','pingdom');
                var _gaq = _gaq || [];
                _gaq.push(['_setAccount', 'UA-36285759-1']);
                _gaq.push(['_trackPageview']);
                load(('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js', 'ga');
            }
            if (w.addEventListener) { w.addEventListener("load", go, false); }
            else if (w.attachEvent) { w.attachEvent("onload",go); }
        }(window, document, 'script'));
    </script>
    <% } %>
</body>
</html>
