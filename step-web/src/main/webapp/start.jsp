<%@page import="com.tyndalehouse.step.core.models.ClientSession" trimDirectiveWhitespaces="true" %>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ taglib prefix="search" tagdir="/WEB-INF/tags/search" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="java.util.Calendar" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
%>

<fmt:setBundle basename="HtmlBundle" scope="request" />
<!DOCTYPE html  xmlns:fb="http://ogp.me/ns/fb#">
<html>
<head>
    <%
        if(request.getParameter("translate") != null) {
    %>

    <script type="text/javascript">
        var _jipt = [];
        _jipt.push(['project', 'step']);
    </script>
    <script type="text/javascript" src="//cdn.crowdin.net/jipt/jipt.js"></script>
    <%
        }
    %>

    <TITLE>${ title }</TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta step-local content="<%= appManager.isLocal() %>" />
    <meta step-domain content="<%= appManager.getAppDomain() %>" />
    <meta step-direction content="${ ltr }" />
    <c:if test="${ not languageComplete }">
        <meta step-incomplete-language content="true" />
    </c:if>
    <meta property="fb:admins" content="551996214" />
    <meta name="step.version" content="${project.version}" />
    <meta name="description" content="${ description }" />
    <link rel="shortcut icon"  href="images/step-favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <c:choose>
        <c:when test="${ empty canonicalUrl }">
            <link rel="canonical" href="http://${stepDomain}/" />
        </c:when>
        <c:otherwise>
            <link rel="canonical" href="http://${stepDomain}/?q=${canonicalUrl}" />
        </c:otherwise>
    </c:choose>

    <%
        if(request.getParameter("debug") != null) {
    %>
    <!-- Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet" media="screen" />
    <link href="css/bootstrap-theme.min.css" rel="stylesheet" media="screen" />
    <link href="css/select2.css" rel="stylesheet" media="screen" />
    <link href="css/select2-bootstrap.css" rel="stylesheet" media="screen" />
    <link href="scss/step-template.css" rel="stylesheet" media="screen" />

    <link rel="stylesheet" type="text/css" href="css/qtip.css" />
    <link rel="stylesheet" type="text/css" href="css/passage.css" />
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
        <%
        if(appManager.isLocal()) {
        %>
            <script src="libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="libs/respond.js/1.3.0/respond.min.js"></script>
        <% } else { %>
            <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <% } %>
    <![endif]-->

    <% if(!appManager.isLocal()) { %>
        <script type="text/javascript">
            var _prum = [['id', '52698a2cabe53d8c20000000'], ['mark', 'firstbyte', (new Date()).getTime()]];
        </script>
    <% } %>
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
                            <a href="/"><img id="logo" src="images/step-top-left-logo.png" width="40" height="50" /></a>
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
                                    <span class="input-group-btn findButton">
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
                                    <div class="btn-group pull-left nextPreviousChapterGroup" style="${ 'PASSAGE' ne searchType ? 'display: none' : '' }">
                                    <a class="btn btn-default btn-sm previousChapter" type="button" href="/?q=${previousChapter}" title="<fmt:message key="passage_previous_chapter" />">
                                        <span class="glyphicon glyphicon-arrow-left"></span></a>
                                    <a class="btn btn-default btn-sm nextChapter" type="button" href="/?q=${nextChapter}" title='<fmt:message key="passage_next_chapter" />'>
                                        <span class="glyphicon glyphicon-arrow-right"></span>
                                    </a>
                                </div>
                                <div class="btn-group pull-right">
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
                                    
                                    <%--  this button starts hidden as there is only 1 column showing --%>
                                    <button class="btn btn-default btn-sm openNewPanel" title="<fmt:message key="open_in_new_panel" />">
                                        <span class="glyphicon glyphicon-plus"></span>
                                    </button>
                                    <button class="btn btn-default btn-sm closeColumn disabled" title="<fmt:message key="close" />" type="button">
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
                                            <c:if test="${ ('ORIGINAL_GREEK_RELATED' eq searchType or 'ORIGINAL_HEBREW_RELATED' eq searchType or 'ORIGINAL_MEANING' eq searchType) and fn:length(definitions) gt 0  }">
                                                <div class="originalWordSearchToolbar">
                                                    <div class="panel panel-default">
                                                        <div class="panel-heading">
                                                            <h4 data-toggle="collapse" href="#relatedWords" class="panel-title lexicalGrouping"><span class="glyphicon glyphicon-plus"></span><fmt:message key="lexicon_related_words" />
                                                            <span class="pull-right sortOptions">
                                                                <span>Sort by </span>
                                                                <fmt:bundle basename="InteractiveBundle">
                                                                    <fmt:message key="scripture_help" var="scriptureHelp" />
                                                                    <fmt:message key="vocabulary_help" var="vocabularyHelp"  />
                                                                    <a data-value="SCRIPTURE_SORT" class="${ (empty param.sort or sort eq 'false' or not (param.sort  eq 'VOCABULARY')) ? 'active' : '' }" href="javascript:void(0)" title="${scriptureHelp}"><fmt:message key="scripture" /></a> |
                                                                    <a data-value="VOCABULARY" class="${param.sort eq 'VOCABULARY' ?  'active' : '' }" href="javascript:void(0)" title="${vocabularyHelp}"><fmt:message key="vocabulary" /></a></span>
                                                                </fmt:bundle>
                                                            </h4>
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
                                                                                ${ definition.gloss}
                                                                                (<span class="transliteration">${ definition.stepTransliteration }</span>
                                                                                - <span class="${fn:substring(definition.strongNumber, 0,1) == 'H' ?'hbFontMini' : 'unicodeFontMini'}">
                                                                                    ${ definition.matchingForm })
                                                                                </span>
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
                                                            <span class="radioGroup"><input <c:if test="${ 'SUBJECT_SIMPLE' eq searchType }">checked="checked"</c:if> type="radio" name="subjectSearchType" 
                                                                   value="subject" id="0_esvHeadings"><label for="0_esvHeadings"><fmt:message key="search_subject_book_headings" /></label></span>
                                                            <span class="radioGroup"><input type="radio" <c:if test="${ 'SUBJECT_EXTENDED' eq searchType }">checked="checked"</c:if> name="subjectSearchType" 
                                                                   value="nave" id="0_nave"><label for="0_nave"><fmt:message key="search_subject_nave" /></label></span>
                                                            <span class="radioGroup"><input type="radio" <c:if test="${ 'SUBJECT_FULL' eq searchType }">checked="checked"</c:if> name="subjectSearchType" 
                                                                   value="xnave" id="0_extendedNave"><label for="0_extendedNave"><fmt:message key="search_subject_nave_extended" /></label></span>
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
                                                    <search:display_results results="${searchResults}" sortType="${ sort }" />
                                                </div>
                                            </c:otherwise>
                                            </c:choose>
                                            
                                        </span>
                                    </c:otherwise>
                                </c:choose>
                                <search:copyrightinfo />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hidden-xs col-sm-6 column examplesColumn" dir="${ ltr ? "ltr" : "rtl" }">
                    <div class="passageContainer examplesContainer">
                        <button class="btn btn-default btn-sm closeColumn" title="<fmt:message key="close" />" type="button" >
                            <span class="glyphicon glyphicon-remove"></span>
                        </button>
                        
                        <h1><fmt:message key="simple_intro_welcome" /></h1>
                        <h1><fmt:message key="simple_intro_tyndale_house_project" /></h1>
                        <br />
                        
                        <fmt:message key="simple_intro" />
                        <br /><br />

                        <fmt:bundle basename="InteractiveBundle">
                            <fmt:message key="the_pentateuch" var="pentateuch" />
                        </fmt:bundle>
                        <search:sample_search explanation="simple_passage_explanation" option1="ESV" option1type="version" option2="Gen 1" option2type="reference" sampleURL="/?q=version=ESV|reference=Gen.1&options=VHNUG" />
                        <search:sample_search explanation="multiple_versions_explanation" option1="NIV" option1type="version" option2="ESV" option2type="version" option3="KJV" option3type="version" option4="Gen 1" option4type="reference" sampleURL="/?q=version=NIV|version=ESV|version=KJV|reference=Gen.1&options=HVGUN&display=COLUMN" />
                        <search:sample_search explanation="simple_search_explanation" option1="ESV" option1type="version" option2="brother" option2type="greekMeanings" sampleURL="/?q=version=ESV|strong=G0080&options=HVNGU" />
                        <%--<search:sample_search explanation="simple_search_restricted_explanation" option1="${ pentateuch }" option1type="reference" option2="ESV" option2type="version" option3="he.sed" option3type="hebrew" sampleURL="" />--%>
                        <search:sample_search explanation="chained_searches_explanation" option1="NIV" option1type="version" option2="ESV" option2type="version" option3="land" option3type="text" option4="he.sed" option4type="hebrewMeanings" sampleURL="/?q=version=NIV|version=ESV|text=land|strong=H2617&options=VGUVNH&display=INTERLEAVED" />
                        <search:sample_search explanation="chained_searches_explanation_subject" option1="ESV" option1type="version" option2="throne" option2type="meanings" option3="David" option3type="subject" option4="Isa-Rev" option4type="reference" sampleURL="/?q=version=ESV|meanings=throne|subject=david|reference=Isa-Rev&options=HNVUG" />
                        <search:sample_search explanation="interlinear_versions_explanation" option1="KJV" option1type="version" option2="WHNU" option2type="version" option3="John 1" option3type="reference" sampleURL="/?q=version=KJV|version=WHNU|reference=John.1&options=HVLUNM&display=INTERLINEAR" showInterlinear="true" />

                        <div class="text-muted step-copyright">&copy; <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House, Cambridge, UK</a> - <%= Calendar.getInstance().get(Calendar.YEAR) %></div>
                    </div>
                </div>
            </div>
            <div class="sidebar-offcanvas" id="sidebar" role="navigation"></div>
        </div>
    </div>

    <%-- Feedback form button--%>
    <span id="supportContainer">
        <button id="stepDisclaimer" type="button" class="btn btn-danger btn-xs" data-container="body" data-trigger="hover focus" data-toggle="popover" data-placement="top" data-content="<fmt:message key="step_disclaimer" />"/>
            BETA
        </button>

        <%-- If local, then we need to include our own copy of JQuery. Otherwise, include from CDN --%>
        <%
            if(!appManager.isLocal()) {
        %>
            <button class="btn btn-primary btn-xs" id="raiseSupportTrigger" data-toggle="modal" data-target="#raiseSupport"><fmt:message key="help_feedback" /></button>
        <%
            }
        %>
    </span>
    <% if(request.getParameter("mobile") == null) { %>
        <%
            if(request.getParameter("lang") == null) {
        %>
        <script src="international/interactive.js?lang=<%= locale.getLanguage() %>&step.version=${project.version}" type="text/javascript"></script>
        <% } else { %>
        <script src="international/interactive.js?lang=<%= request.getParameter("lang") %>&step.version=${project.version}" type="text/javascript"></script>
        <% }
       }
     %>
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

    <script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
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
        </c:otherwise>
    </c:choose>
    <script src="libs/jquery-sortable.js" type="text/javascript"></script>

    <%-- Do these need to use $.ready? --%>
    <script src="js/require_config_dev.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-cookie.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>
    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_main_search.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_restore.js" type="text/javascript"></script>

    <script src="js/backbone/step_router.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_display.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_display_passage.js" type="text/javascript"></script>
    <script src="js/backbone/models/model_history.js" type="text/javascript"></script>
    <script src="js/backbone/models/passage_model.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_menu_passage.js" type="text/javascript"></script>
    <script src="js/backbone/models/model_settings.js" type="text/javascript"></script>
    <script src="js/backbone/views/view_feedback.js" type="text/javascript"></script>
    <script src="js/state/step.state.js" type="text/javascript"></script>
    <script src="js/passage/step.passage.js" type="text/javascript"></script>
    <script src="js/defaults/step.defaults.js" type="text/javascript"></script>
    <script src="js/step_ready.js" type="text/javascript"></script>

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
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js" type="text/javascript"></script>
        <%
            }
        %>

    <c:choose>
        <c:when test="${ param.mobile eq 'online' }">
            <script type="text/javascript">
                var languages = document.createElement("script");
                languages.src = 'international/interactive-en.js';
                languages.id = "international";
                languages.async = false;
                document.head.appendChild(languages);

                var stepJs = document.createElement("script");
                stepJs.src = 'js/step.${project.version}.min.js';
                stepJs.id = "international";
                stepJs.async = false;
                document.head.appendChild(stepJs);
            </script>
        </c:when>
        <c:otherwise>
            <script src="js/step.${project.version}.min.js" type="text/javascript" ></script>
        </c:otherwise>
    </c:choose>
    <%
	}
	%>
    
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


                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                ga('create', '${analyticsToken}', 'auto');
                ga('require', 'displayfeatures');
                ga('send', 'pageview');
            }
            if (w.addEventListener) { w.addEventListener("load", go, false); }
            else if (w.attachEvent) { w.attachEvent("onload",go); }
        }(window, document, 'script'));
    </script>
    <% } %>
</body>
</html>
