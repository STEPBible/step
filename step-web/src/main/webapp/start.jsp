<%@page import="com.tyndalehouse.step.core.models.ClientSession" trimDirectiveWhitespaces="true" %>
<%@page import="java.util.Locale" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@page import="java.net.URLEncoder" %>
<%@ taglib prefix="search" tagdir="/WEB-INF/tags/search" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.google.inject.Injector" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="java.util.Calendar" %>
<%@ page import="com.tyndalehouse.step.core.utils.ValidateUtils" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale);
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
%>
<fmt:setBundle basename="HtmlBundle" scope="request"/>
<!DOCTYPE html xmlns:fb="http://ogp.me/ns/fb#">
<html>
<head>
    <%
        if (request.getParameter("translate") != null) {
    %>

    <script type="text/javascript">
        var _jipt = [];
        _jipt.push(['project', 'step']);
    </script>
    <script type="text/javascript" src="//cdn.crowdin.net/jipt/jipt.js"></script>
    <%
        }
    %>
    <title>${ title }</title>
        <% Object masterversionObj = request.getAttribute("masterversion");
        if (masterversionObj != null) {
            String reqInitial = request.getAttribute("masterversion").toString();
            if (reqInitial != null) {
                reqInitial = reqInitial.trim(); %>
                <script type="application/ld+json">
                    {
                    "@context": "https://schema.org/",
                    "@type": "WebSite",
                    "url": "https://www.STEPBible.org",
                    "sameas": "https://en.wikipedia.org/wiki/The_SWORD_Project#STEPBible",
                    "description": "Free Bible study software for Windows, Mac, Linux, iPhone, iPad and Android. Software can search and display Greek / Hebrew lexicons, interlinear Bibles...",
                <% if (reqInitial.equals("NIV")) { %>
                    "name": "NIV - New International Version",
                    "author": {
                        "@type": "Person",
                        "name": "Douglas Moo",
                        "jobTitle": "Wessner Chair of Biblical Studies, Wheaton College",
                        "url": "https://en.wikipedia.org/wiki/Douglas_J._Moo",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Wheaton College",
                            "url": "https://www.wheaton.edu/"
                        },
                        "memberOf": {
                            "@type": "Organization",
                            "name": "Committee on Bible Translation",
                            "url": "https://www.biblica.com/niv-bible/niv-bible-translators"
                        }
                    }
                <% }
                else if (reqInitial.startsWith("ESV")) { %>
                    "name": "ESV - English Standard Version",
                    "author": {
                        "@type": "Person",
                        "name": "J. I. Packer",
                        "jobTitle": "Board of Governors' Professor of Theology",
                        "url": "https://en.wikipedia.org/wiki/J._I._Packer",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Regent College",
                            "url": "https://regent-college.edu"
                        },
                        "memberOf": {
                            "@type": "Organization",
                            "name": "Translation Oversight Committee - The English Standard Version",
                            "url": "https://www.esv.org"
                        }
                    }
                <%  }
                else if (reqInitial.startsWith("SBLG")) { %>
                    "name": "SBLG - Greek New Testament",
                    "author": {
                        "@type": "Person",
                        "name": "Michael W. Holmes",
                        "jobTitle": "Chair of the Department of Biblical and Theological Studies",
                        "url": "https://en.wikipedia.org/wiki/Michael_W._Holmes",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Bethel University",
                            "url": "https://www.bethel.edu/"
                        },
                        "memberOf": {
                            "@type": "Organization",
                            "name": "The International Greek New Testament Project",
                            "url": "http://www.igntp.org/"
                        }
                    }
                <%  }
                else if (reqInitial.startsWith("NASB")) { %>
                    "name": "NASB - New American Standard Bible",
                    "author": {
                        "@type": "Organization",
                        "name": "The Lockman Foundation",
                        "url": "https://en.wikipedia.org/wiki/Lockman_Foundation"
                    }
                <%  }
                else { %>
                    "name": "STEPBible - <%= reqInitial %> ",
                    "author": {
                        "@type": "Person",
                        "name": "David Instone-Brewer",
                        "jobTitle": "Research Fellow",
                        "url": "https://cambridge.academia.edu/DInstoneBrewer",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Tyndale House",
                            "url": "https://www.TyndaleHouse.com"
                        },
                        "memberOf": [
                            {
                                "@type": "Organization",
                                "name": "Studiorum Novi Testamenti Societas",
                                "url": "https://snts.online"
                            },
                            {
                                "@type": "Organization",
                                "name": "British and Irish Association for Jewish Studies",
                                "url": "https://britishjewishstudies.org"
                            },
                            {
                                "@type": "Organization",
                                "name": "Committee on Bible Translation",
                                "url": "https://www.biblica.com/niv-bible/niv-bible-translators"
                            }
                        ]
                    }
                <% } %>
                }
                </script>
            <% }
        } %>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
    <meta step-local content="<%= appManager.isLocal() %>"/>
    <meta step-domain content="<%= appManager.getAppDomain() %>"/>
    <meta step-direction content="${ ltr }"/>
    <c:if test="${ not languageComplete }">
        <meta step-incomplete-language content="true"/>
    </c:if>
    <meta property="fb:admins" content="551996214"/>
    <meta name="step.version" content="${project.version}"/>
    <meta name="description" content="${ description }"/>
    <meta name="keywords" content="${ keywords }"/>
    <link rel="shortcut icon" href="images/step-favicon.ico"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <c:choose>
        <c:when test="${ empty canonicalUrl }">
            <link rel="canonical" href="http://${stepDomain}/"/>
        </c:when>
        <c:otherwise>
            <link rel="canonical" href="http://${stepDomain}/?q=${canonicalUrl}"/>
        </c:otherwise>
    </c:choose>

	<style>
	:root {
		--clrHighlight: #17758F;
		--clrHighlightBg: #17758F;
		--clrStrongText: #498090;
		--clrLexiconFocusBG: #c8d8dc;
		--clrRelatedWordBg: #b2e5f3;
        --clrBackground: #ffffff;
        --clrText: #5d5d5d;
        --clr2ndHover: #d3d3d3;
	}
	</style>
    <%
        if (request.getParameter("debug") != null) {
    %>
    <%-- 3rd party libs --%>
    <link rel="stylesheet" type="text/css" href="css/qtip.css"/>
    <link rel="stylesheet" type="text/css" href="css/cardo.css"/>

    <!-- Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="css/bootstrap-theme.min.css" rel="stylesheet" media="screen"/>
    <link href="css/select2.css" rel="stylesheet" media="screen"/>
    <link href="css/select2-bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="scss/step-template.css" rel="stylesheet" media="screen"/>
    <%
    } else {
    %>
    <%-- Contains the jquery ui css --%>
    <link rel="stylesheet" type="text/css" href="css/step.${project.version}.min.css"/>
    <%
        }
    %>
	<!-- Add IntroJs styles -->
	<link href="css/introjs.min.css" rel="stylesheet">

    <% if (!appManager.isLocal()) { %>
    <script type="text/javascript">
        var _prum = [['id', '52698a2cabe53d8c20000000'], ['mark', 'firstbyte', (new Date()).getTime()]];
    </script>
    <% } %>
</head>
<!-- The following line has to use background and color style.  Using stepFgBg class does not work for the side panel.  -->
<body xmlns:fb="http://ogp.me/ns/fb#" style="background-color:var(--clrBackground);color:var(--clrText)">
<!-- Wrap all page content here -->
<div id="wrap">

    <!-- Fixed navbar -->
    <div id="stepnavbar" class="navbar navbar-default navbar-fixed-top">

    </div>

    <div class="mainPanel row row-offcanvas">
        <div class="" id='columnHolder'>
            <div class="col-sm-6 col-xs-12 column">
                <div class="passageContainer active" passage-id=0>
                    <div class="passageText ui-widget">
                        <div class="passageOptionsGroup">
                            <div class="pull-right">
                                    <span class="nextPreviousChapterGroup"
                                          style="${ 'PASSAGE' ne searchType ? 'display: none' : '' }">
                                        <a class="previousChapter" href="/?q=${previousChapter}"
                                           title="<fmt:message key="passage_previous_chapter" />">
                                            <i class="glyphicon glyphicon-arrow-left"></i></a>
                                        <a class="nextChapter" href="/?q=${nextChapter}"
                                           title='<fmt:message key="passage_next_chapter" />'>
                                            <i class="glyphicon glyphicon-arrow-right"></i>
                                        </a>
                                    </span>
                                <%
                                    if (!appManager.isLocal()) {
                                %>
                                <span id="thumbsup" class="dropdown hidden-xs">
                                        <a class="dropdown-share" data-toggle="dropdown"
                                           title="<fmt:message key="share" />">
                                            <i class="glyphicon glyphicon-thumbs-up"></i>
                                        </a>
                                </span>
                                <%
                                    }
                                %>

                                <a id="resizeButton" class="resizePanel" title="Increase size of panel" style="display:none">
                                    <i class="glyphicon glyphicon-resize-full" style="display:inline"></i>
                                    <i class="glyphicon glyphicon-resize-small" style="display:none"></i>
                                </a>

                                <span class="dropdown settingsDropdown">
                                        <a class="dropdown-toggle showSettings" data-toggle="dropdown"
                                           title="<fmt:message key="view" />">
                                            <i class="glyphicon glyphicon-cog"></i>
                                        </a>
                                </span>

                                <%--  this button starts hidden as there is only 1 column showing --%>
                                <a class="openNewPanel hidden-xs" title="<fmt:message key="new_panel" />">
                                    <i class="glyphicon glyphicon-plus"></i>
                                </a>
                                <a class="closeColumn disabled hidden-xs" title="<fmt:message key="close" />">
                                    <i class="glyphicon glyphicon-remove"></i>
                                </a>
                            </div>
                            <div class="resultsLabel pull-right" style="margin-right: 5px">
                                <c:if test="${'PASSAGE' ne searchType}">
                                    <c:set var="pageMessage" scope="request"><fmt:message key="paging_showing"/></c:set>
                                    <%= String.format((String) request.getAttribute("pageMessage"), (Integer) request.getAttribute("numResults")) %>
                                </c:if>
                            </div>
                        </div>
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
                                                            <h4 data-toggle="collapse" href="#relatedWords"
                                                                class="panel-title lexicalGrouping"><span
                                                                    class="glyphicon glyphicon-plus"></span><fmt:message
                                                                    key="lexicon_related_words"/>
                                                            <span class="pull-right sortOptions">
                                                                <span>Sort by </span>
                                                                <fmt:bundle basename="InteractiveBundle">
                                                                    <fmt:message key="scripture_help"
                                                                                 var="scriptureHelp"/>
                                                                    <fmt:message key="vocabulary_help"
                                                                                 var="vocabularyHelp"/>
                                                                    <a data-value="SCRIPTURE_SORT"
                                                                       class="${ (empty param.sort or sort eq 'false' or not (param.sort  eq 'VOCABULARY')) ? 'active' : '' }"
                                                                       href="javascript:void(0)"
                                                                       title="${scriptureHelp}"><fmt:message
                                                                            key="scripture"/></a> |
                                                                    <a data-value="VOCABULARY"
                                                                       class="${param.sort eq 'VOCABULARY' ?  'active' : '' }"
                                                                       href="javascript:void(0)"
                                                                       title="${vocabularyHelp}"><fmt:message
                                                                            key="vocabulary"/></a></span>
                                                                </fmt:bundle>
                                                            </h4>
                                                        </div>
                                                            <div id="relatedWords"
                                                                 class="panel-body panel-collapse collapse">
                                                                <ul class="panel-collapse" style="height: auto;">
                                                                    <c:forEach items="${definitions}" var="definition">
                                                                        <%-- need to work out if the item is active --%>
                                                                        <c:set var="isActive" value="false"/>
                                                                        <c:forEach var="item" items="${filter}">
                                                                            <c:if test="${item eq definition.strongNumber}">
                                                                                <c:set var="isActive" value="true"/>
                                                                            </c:if>
                                                                        </c:forEach>

                                                                        <li class="sortable"
                                                                            strongnumber="${ definition.strongNumber}">
                                                                            <a href="javascript:void(0)"
                                                                               strong="${ definition.strongNumber}">
                                                                                <span class="glyphicon glyphicon-ok ${isActive ? 'active' : '' }"></span>


                                                                                <%  if (locale.getLanguage().equalsIgnoreCase("es")) { %>
																						${ definition._es_Gloss}
																				<%	}
																					else if (locale.getLanguage().equalsIgnoreCase("zh")) {
                                                                                        if (locale.getCountry().equalsIgnoreCase("tw")) %>
                                                                                            ${ definition._zh_tw_Gloss}
                                                                                <%      else %>
                                                                                            ${ definition._zh_Gloss}
                                                                                <%  }
                                                                                    else if (locale.getLanguage().equalsIgnoreCase("km")) { %>
																						${ definition._km_Gloss}
																				<%	}
                                                                                    else { %>
                                                                                        ${ definition.gloss}
                                                                                <%  } %>

                                                                                (<span
                                                                                    class="transliteration">${ definition.stepTransliteration }</span>
                                                                                - <span
                                                                                    class="${fn:substring(definition.strongNumber, 0,1) == 'H' ?'hbFontMini' : 'unicodeFontMini'}">
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
                                                            <span class="radioGroup"><input
                                                                    <c:if test="${ 'SUBJECT_SIMPLE' eq searchType }">checked="checked"</c:if>
                                                                    type="radio" name="subjectSearchType"
                                                                    value="subject" id="0_esvHeadings"><label
                                                                    for="0_esvHeadings"><fmt:message
                                                                    key="search_subject_book_headings"/></label></span>
                                                            <span class="radioGroup"><input type="radio"
                                                                                            <c:if test="${ 'SUBJECT_EXTENDED' eq searchType }">checked="checked"</c:if>
                                                                                            name="subjectSearchType"
                                                                                            value="nave"
                                                                                            id="0_nave"><label
                                                                    for="0_nave"><fmt:message
                                                                    key="search_subject_nave"/></label></span>
                                                            <span class="radioGroup"><input type="radio"
                                                                                            <c:if test="${ 'SUBJECT_FULL' eq searchType }">checked="checked"</c:if>
                                                                                            name="subjectSearchType"
                                                                                            value="xnave"
                                                                                            id="0_extendedNave"><label
                                                                    for="0_extendedNave"><fmt:message
                                                                    key="search_subject_nave_extended"/></label></span>
                                                        </div>
                                                    </c:if>
                                                    <c:choose>
                                                        <c:when test="${ 'SUBJECT_SIMPLE' eq searchType }">
                                                            <search:display_results
                                                                    results="${searchResults[0].headingsSearch.results }"/>
                                                        </c:when>
                                                        <c:otherwise>
                                                            <div class="panel-group subjectSection searchResults">
                                                                <c:set var="previousHeading" value="not-set"/>
                                                                <c:forEach var="result" items="${ searchResults }"
                                                                           varStatus="count">

                                                                    <c:if test="${ previousHeading ne result.root }">
                                                                        <h4 class="subjectHeading">${ result.root }</h4>
                                                                    </c:if>
                                                                    <c:set var="previousHeading"
                                                                           value="${result.root}"/>
                                                                    <div class="panel panel-default"
                                                                         root="${ result.root }"
                                                                         fullheader="${ result.heading }"
                                                                         <c:if test="${ not empty result.seeAlso }">seeAlso="${result.seeAlso}"</c:if>
                                                                    >
                                                                            <div class="panel-heading">
                                                                                <h4 data-toggle="collapse"
                                                                                    href="#subject-results-${ count.index }"
                                                                                    class="panel-title expandableSearchHeading">
                                                                                <span class="glyphicon glyphicon-plus"></span>${ result.heading }</h4></div>
                                                                            <div class="results panel-collapse collapse"
                                                                                 id="subject-results-${ count.index }"><fmt:message
                                                                                    key="results_loading"/></div>
                                                                        </div>
                                                                </c:forEach>
                                                            </div>
                                                        </c:otherwise>
                                                    </c:choose>
                                                </c:when>
                                                <c:otherwise>
                                                <div class="searchResults">
                                                    <search:display_results results="${searchResults}"
                                                                            sortType="${ sort }"/>
                                                </div>
                                                </c:otherwise>
                                            </c:choose>

                                        </span>
                                </c:otherwise>
                            </c:choose>
                            <search:copyrightinfo/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hidden-xs col-sm-6 column examplesColumn" dir="${ ltr ? "ltr" : "rtl" }">
            </div>
        </div>
        <div class="sidebar-offcanvas" dir="${ ltr ? "ltr" : "rtl" }" id="sidebar" style="overflow-y:hidden" role="navigation"></div>
    </div>
</div>

<% if (request.getParameter("mobile") == null) {
    String langCode = ValidateUtils.checkLangCode(request.getParameter("lang"), locale); %>
    <script src="intl/<%= URLEncoder.encode(langCode, "UTF-8") %>.${project.version}.js" type="text/javascript"></script>
<% } %>
<%@include file="jsps/initLib.jsp"%>
<%
String userCountry = request.getHeader("cf-ipcountry");
userCountry = (userCountry == null) ? "UNKNOWN" : userCountry.toUpperCase();
%>
<%-- Now do javascript --%>
<script type="text/javascript">
    window.tempModel = ${ not empty passageModel ? passageModel : 'undefined' };
    if (!window.step) {
        window.step = {}
    }
    step.userLanguage = "${ languageName }";
    step.userLanguageCode = "${ languageCode }";
    step.userCountryCode = "<%=userCountry%>";


    // code to enable mobile device swipe to go back or forward one chapter
    var ua = navigator.userAgent.toLowerCase(); 
    if ((ua.indexOf("android") > -1) || (ua.indexOf("iphone") > -1) || (ua.indexOf("ipad") > -1) ||
        ((ua.indexOf("macintosh") > -1) && (navigator.maxTouchPoints == 5))) {
        document.getElementById("resizeButton").style.display = "inline";
        touchableElement = document.getElementById("columnHolder");
        touchableElement.addEventListener('touchstart', function (event) {
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
        }, false);

        touchableElement.addEventListener('touchend', function (event) {
            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            handleGesture();
        }, false);
    }

    function handleGesture() {
        var minDistance = 40;
        var verticalTolerance = 40;
        var touchDiffY = Math.abs(touchendY - touchstartY);
        if (touchDiffY < verticalTolerance) { // If there is lots of vertical movement, it is not a swipe left/right
            var touchDiffX = touchendX - touchstartX;
            if (Math.abs(touchDiffX) > minDistance) {
                var activePassage = $(event.srcElement.closest(".passageContainer"));
                if (touchDiffX < 0)
                    activePassage.find("a.nextChapter").click();
                else 
                    activePassage.find("a.previousChapter").click();
                // Record swipeCount up to three, after which the prev/next arrows won't be displayed.
                var swipeCount = step.util.localStorageGetItem("swipeCount");
                if (swipeCount == null) swipeCount = 0;
                if (swipeCount <= 3) {
                    swipeCount++;
                    step.util.localStorageSetItem("swipeCount", swipeCount);
                }
            }
            else if ((touchDiffX < 3) && (touchDiffY < 3)) {
                if ((event.srcElement.outerHTML.substring(0,7) === "<button") ||
                    ((event.srcElement.outerHTML.substring(0,5) === "<span") && (event.srcElement.outerHTML.indexOf("verse") == -1)) ) {
                        return;
                }
                // A touch on elements which do not have events will clear highlight and quick lexicon
                step.passage.removeStrongsHighlights(undefined, "primaryLightBg secondaryBackground relatedWordEmphasisHover");
                $('#quickLexicon').remove();
            }
        }
    }

</script>
<script src="libs/jquery-1.10.2.min.js" type="text/javascript"></script>
<script src="libs/bootstrap.min.js" type="text/javascript"></script>
<script src="libs/introjs.min.js" type="text/javascript"></script>
<%
    if (request.getParameter("debug") != null) {
%>

<%-- NOTE: do not include in prod web minifying and use minified versions otherwise --%>

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
<script src="js/passage_selection.js" type="text/javascript"></script>
<script src="js/search_selection.js" type="text/javascript"></script>
<script src="js/copy_text.js" type="text/javascript"></script>
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
<script src="js/backbone/views/view_examples.js" type="text/javascript"></script>
<script src="js/state/step.state.js" type="text/javascript"></script>
<script src="js/passage/step.passage.js" type="text/javascript"></script>
<script src="js/defaults/step.defaults.js" type="text/javascript"></script>
<script src="js/step_ready.js" type="text/javascript"></script>
<script src="js/color_code_grammar.js" type="text/javascript"></script>
<%
} else {
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
            stepJs.src = '/js/step.${project.version}.min.js';
            stepJs.id = "international";
            stepJs.async = false;
            document.head.appendChild(stepJs);
        </script>
    </c:when>
    <c:otherwise>
        <script src="js/step.${project.version}.min.js" type="text/javascript"></script>
        <script src="js/color_code_grammar.${project.version}.min.js" type="text/javascript"></script>
    </c:otherwise>
</c:choose>
<%
    }
%>
<script>
	jQuery.event.special.touchstart = {
		setup: function( _, ns, handle ){
			if ( ns.includes("noPreventDefault") ) {
				this.addEventListener("touchstart", handle, { passive: false });
			} else {
				this.addEventListener("touchstart", handle, { passive: true });
			}
		}
	};
</script>
<% if (!appManager.isLocal()) { %>
<script>
    (function (w, d, s) {
        function go() {
            var js, fjs = d.getElementsByTagName(s)[0], load = function (url, id) {
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.src = url;
                js.id = id;
                js.async = 'async';
                fjs.parentNode.insertBefore(js, fjs);
            };

            load('//connect.facebook.net/en_GB/all.js#xfbml=1', 'fbjssdk');
            load('//platform.twitter.com/widgets.js', 'tweetjs');

            window.dataLayer = window.dataLayer || [];
 	    }
        if (w.addEventListener) {
            w.addEventListener("load", go, false);
        }
        else if (w.attachEvent) {
            w.attachEvent("onload", go);
        }
    } (window, document, 'script'));
</script>
<% }
%>
</body>
</html>