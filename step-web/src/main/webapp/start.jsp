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
<!DOCTYPE html">
<html>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8RH0MQG418"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-8RH0MQG418');
</script>
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
                    "description": "Free Bible study software for Windows, Mac and Linux. Software can search and display Greek / Hebrew lexicons, interlinear Bibles...",
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
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#17758F" />
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
		--clrStrongText: #447888;
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
   	<!-- Add IntroJs styles -->
	<link href="css/introjs.min.css" rel="stylesheet">
    <%
    } else {
    %>
    <%-- Contains the jquery ui css --%>
    <link rel="stylesheet" type="text/css" href="css/step.${project.version}.min.css"/>
    <%
        }
    %>
</head>
<!-- The following line has to use background and color style.  Using stepFgBg class does not work for the side panel.  -->
<body style="background-color:var(--clrBackground);color:var(--clrText)">
<!-- Wrap all page content here -->
<div id="wrap">

    <!-- Fixed navbar -->
    <div id="stepnavbar" class="navbar navbar-default navbar-fixed-top">
        <div>
            <div class="navbar-header search-form">
                <div class="navbar-brand col-xs-12">
                    <span class="hidden-xs title" title="Reset to default configuration">
                        <a href="/?noredirect" class="logo">
                            <img class="hidden-narrow" src="/step.png" alt="STEP" width="90px" height="22px">
                        </a>
                        <a href="/?noredirect" class="logo">
                            <img class="hidden-not-narrow" src="/images/narrow_step_logo.png" alt="STEP">
                        </a>
                    </span>
                    <span class="help">
                        <div class="headerButtons pull-right">
                            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                            </button>
                            <a id="copy-icon" style="padding-left:5px" href="javascript:step.util.copyModal();" title="<fmt:message key="copy" />">
                                <i class="glyphicon glyphicon-copy"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;<fmt:message key="copy" /></span>
                            </a>
                            <div class="dropdown" style="display:inline-block">
                                <a id="report-icon" style="padding-left:5px" class="dropdown-toggle" data-toggle="dropdown" href="#" title="Resources powered by STEPBible">
                                    <i class="glyphicon glyphicon-th-list"></i><span class="navbarIconDesc hidden-xs">&nbsp;&nbsp;Resources</span>
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a href="html/gospel_harmony.html" target="_blank" rel="noopener">Harmony of the Gospels</a></li>
                                    <li><a href="html/miracles.html" target="_blank" rel="noopener">Miracles in the Bible</a></li>
                                    <li><a href="html/nt_letters.html" target="_blank" rel="noopener">New Testament Letter Structure</a></li>
                                    <li><a href="html/ot_parallel.html" target="_blank" rel="noopener">Old Testament parallels</a></li>
                                    <li><a href="html/ot_in_nt.html" target="_blank" rel="noopener">Old Testament used in the New Testament</a></li>
                                    <li><a href="html/names.html" target="_blank" rel="noopener">Names of God</a></li>
                                    <li><a href="html/prophets.html" target="_blank" rel="noopener">Prophets in the Bible</a></li>
                                    <li><a href="html/places.html" target="_blank" rel="noopener">Places in the Bible</a></li>
                                    <li><a href="html/split.html?/?q=reference=Gen.1&skipwelcome&secondURL=https://docs.google.com/document/d/1hrMcTGxC1QQphh3oICwyb195gGjlctyUTs5PTlvLCkI/preview" target="_blank" rel="noopener">Create your own notes</a></li>
                                    <li><a href="#" onclick="step.util.ui.initSidebar('readingPlans'); return false;">Reading Plans</a></li>
                                </ul>
                            </div>
                            <a id="stats-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar('analysis');" title="<fmt:message key="passage_stats" />">
                                <i class="glyphicon glyphicon-stats"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;<fmt:message key="passage_stats" /></span>
                            </a>
                            <a id="bookmark-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar('history');" title="<fmt:message key="bookmarks_and_recent_texts" />">
                                <i class="glyphicon glyphicon-bookmark"></i><span class="hidden-xs navbarIconDesc">&nbsp;<fmt:message key="bookmarks" /></span>
                            </a>
                            <a id="fonts-icon" style="padding-left:5px" href="javascript:step.util.showFontSettings();" title="<fmt:message key="font_sizes" />">
                                <span class="largerFont" style="color:white;background:#5E5E5E;font-size:18px"><fmt:message key="passage_font_size_symbol" /></span>
                                <span class="hidden-xs navbarIconDesc">&nbsp;<fmt:message key="font" /></span>
                            </a>
                            <a id="colorgrammar-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar('color');" title="<fmt:message key="display_grammar" />">
                                <span class="largerFont" style="background:url(/images/wave.png) repeat-x 100% 100%;font-size:18px;padding-bottom:7px">G</span>
                                <span class="largerFont hidden-xs hidden-sm navbarIconDesc" style="margin-left:-2">rammar</span>
                            </a>
                            <a id="examples-icon1" style="padding-left:5px" class="navbarIconDesc hidden-sm hideen-md hidden-lg" href="javascript:step.util.ui.showTutorial();" title="<fmt:message key="frequently_asked_questions" />">
                                <i style="vertical-align:middle" class="glyphicon glyphicon-question-sign hidden-sm hidden-md hidden-lg"></i>
                            </a>

                            <span class="navbar-collapse collapse">
                                <span class="dropdown">
                                    <a id="languages-icon" style="padding-left:5px" class="dropdown-toggle extrapad-xs" data-toggle="dropdown" title="<fmt:message key="installation_book_language" />">
                                        <i class="glyphicon icon-language">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                                        </i>
                                        <span class="navbarIconDesc"><fmt:message key="installation_book_language" /></span>
                                    </a>
                                    <ul id="languageMenu" class="kolumny pull-right dropdown-menu">
                                        <li><a href="http://crowdin.net/project/step" target="_new"><fmt:message key="translate_step" /></a></li>
                                    </ul>
                                </span>
            <%
                if (!appManager.isLocal()) {
            %>
                                <a style="padding-left:5px;vertical-align:top" id="raiseSupportTrigger" data-toggle="modal" data-backdrop="static" data-target="#raiseSupport" title="<fmt:message key="help_feedback" />">
                                    <svg viewBox="0 0 18 21" width="18" height="21">
                                        <path d="M 0 3 L 18 3, 18 16, 16 16, 16 21, 12 16, 0 16, 0 3" stroke="var(--clrText)" fill="var(--clrText)" stroke-width="1"></path>
                                        <line x1="2" y1="8" x2="16" y2="8" stroke-width="1" stroke="var(--clrBackground)" />
                                        <line x1="2" y1="10" x2="16" y2="10" stroke-width="1" stroke="var(--clrBackground)" />
                                        <line x1="2" y1="12" x2="16" y2="12" stroke-width="1" stroke="var(--clrBackground)" />
                                    </svg>
                                    <span class="navbarIconDesc hidden-sm">&nbsp;<fmt:message key="help_feedback" /></span>
                                </a>
            <%
                }
            %>
                                <a id="examples-icon2" class="hidden-xs" style="padding-left:5px" href="javascript:step.util.ui.showTutorial();" title="<fmt:message key="frequently_asked_questions" />">
                                    <i class="glyphicon glyphicon-question-sign hidden-xs"></i><span class="hidden-xs hidden-sm navbarIconDesc">&nbsp;<fmt:message key="faq" /></span>
                                </a>
                                <span class="dropdown">
                                    <a id="more-icon" style="padding-left:5px" class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" title="<fmt:message key="help" />">
                                        <i class="glyphicon glyphicon-option-vertical"></i><span style="vertical-align:bottom;line-height:10px" class="navbarIconDesc"><fmt:message key="more" /></span>
                                    </a>
                                    <ul class="dropdown-menu pull-right helpMenu" dir="${ ltr ? "ltr" : "rtl" }">

            <%
                if (!appManager.isLocal()) {
            %> 
                                        <li class="hidden-touch"><a href="/downloads.jsp" title="<fmt:message key="download_desktop_step_about" />"><fmt:message key="download_desktop_step" /></a></li>
            <%
                }
            %>
                                        <!-- <li class="quick_tutorial"><a href="javascript:void(0)" name="TUTORIAL"><fmt:message key="quick_tutorial_link" /></a></li> -->
                                        <li class="extrapad-other"><a href="https://www.stepbible.org/videos" target="_blank"><fmt:message key="video_help" /></a></li>
                                        <li><a href="https://stepbibleguide.blogspot.com" target="_blank"><fmt:message key="help_online" /></a></li>
            <%
                if (appManager.isLocal()) {
            %> 
                                        <li class="available_bibles_and_commentaries"><a href="/versions.jsp" target="_blank" name="AVAILABLE_BIBLES_AND_COMMENTARIES"><fmt:message key="available_versions" /></a></li>
                                        <li><a href="/setup.jsp"><fmt:message key="tools_settings" /></a></li>
            <%
                }
                else {
            %>
                                        <li><a href="https://stepweb.atlassian.net/wiki/display/SUG/Resources" target="_blank"><fmt:message key="available_versions" /></a></li>
            <%
                }
            %>
                                        <li class="classicalUI"><a href="javascript:void(0)"><fmt:message key="display_classical_ui" />&nbsp;<span id="classicalUICheck" class="glyphicon glyphicon-check" style="font-size:11px"></span></a></li>
                                        <li class="resetEverything"><a href="javascript:void(0)"><fmt:message key="tools_forget_my_profile" /></a></li>
                                        <li><a href="https://stepbibleguide.blogspot.com/p/volunteers.html" target="_blank"><fmt:message key="we_need_help" /></a></li>
            <%
                if (!appManager.isLocal()) {
            %> 
                                        <li><a href="javascript:void(0)" id="provideFeedback" data-toggle="modal" data-backdrop="static" data-target="#raiseSupport"><fmt:message key="help_feedback" /></a></li>
                                        <li><a href="/html/cookies_policy.html" target="_blank"><fmt:message key="help_privacy_policy" /></a></li>
            <%
                }
            %>
                                        <li><a target="_new" href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" name="COPYRIGHT"><fmt:message key="copyright_info_link" /></a></li>
                                        <li class="aboutModalTrigger"><a href="javascript:void(0)" name="ABOUT"><fmt:message key="help_about" /></a></li>
            <%
                if (appManager.isLocal()) {
            %>
                                         <li><a href="/shutdown.jsp"><fmt:message key="tools_exit" /></a></li>
            <%
                }
            %>
                                 </ul>
                                </span>
                            </span>
                        </div>
                    </span>
                    <form role="form">
                        <div class="input-group" id="top_input_area" style="display:none">
                            <input id="masterSearch" type="text" class="form-control input-lg">
                            <span class="input-group-btn findButton">
                                <span>Search</span><i class="find glyphicon glyphicon-search"></i>
                            </span>
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
                                <span class=" hidden-xs">
                                    <a id="resizeButton" class="resizePanel" title="Increase size of panel" style="display:none">
                                        <i class="glyphicon glyphicon-resize-full" style="display:inline"></i>
                                        <i class="glyphicon glyphicon-resize-small" style="display:none"></i>
                                    </a>
                                </span>
                                <span class="dropdown settingsDropdown" style="background-color:var(--clrBackground)">
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
                                        <span id="srchRslts">
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

<% String langCode = ValidateUtils.checkLangCode(request.getParameter("lang"), locale); %>
<script src="intl/<%= URLEncoder.encode(langCode, "UTF-8") %>.${project.version}.js" type="text/javascript"></script>
<%@include file="jsps/initLib.jsp"%>
<%
String userCountry = request.getHeader("cf-ipcountry");
userCountry = (userCountry == null) ? "UNKNOWN" : userCountry.toUpperCase();
%>
<script type="text/javascript">
    window.tempModel = ${ not empty passageModel ? passageModel : 'undefined' };
    if (!window.step) {
        window.step = {}
    }
    step.userLanguage = "${ languageName }";
    step.userLanguageCode = "${ languageCode }";
    step.acceptLanguages = "${ acceptLanguages }";
    step.userCountryCode = "<%=userCountry%>";

    // code to enable mobile device swipe to go back or forward one chapter
    var ua = navigator.userAgent.toLowerCase();
    step.touchDevice = false;
    step.touchWideDevice = false;
    step.appleTouchDevice = false;
    if (ua.indexOf("android") > -1)
        step.touchDevice = true;
    else if ((ua.indexOf("iphone") > -1) || (ua.indexOf("ipad") > -1) ||
            ((ua.indexOf("macintosh") > -1) && (navigator.maxTouchPoints > 1)) ) { // iPad or iPhone pretenting to be a Mac
        step.touchDevice = true;
        step.appleTouchDevice = true;
    }

</script>
<%-- The following 3 were added to the step.version_num.min.js.  Keep them as comment in case we want to reverse the change --%>
<%-- <script src="libs/jquery-1.10.2.min.js" type="text/javascript"></script> --%>
<%-- <script src="libs/bootstrap.min.js" type="text/javascript"></script> --%>
<%-- <script src="libs/introjs.min.js" type="text/javascript"></script> --%>
<%
    if (request.getParameter("debug") != null) {
%>

<%-- NOTE: do not include in prod web minifying and use minified versions otherwise --%>

<script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
<script src="libs/underscore-min.js" type="text/javascript"></script>
<script src="libs/json2.js" type="text/javascript"></script>

<c:choose>
    <c:when test="${ param.debug eq '' }">
        <script src="libs/jquery-1.10.2.min.js" type="text/javascript"></script>
        <script src="libs/bootstrap.min.js" type="text/javascript"></script>
        <script src="libs/introjs.min.js" type="text/javascript"></script>
        <script src="libs/backbone.js" type="text/javascript"></script>
        <script src="libs/backbone.localStorage.js" type="text/javascript"></script>
        <script src="libs/select2.js" type="text/javascript"></script>
        <script src="libs/require-2.1.9.js" type="text/javascript"></script>
    </c:when>
    <c:otherwise>
        <script src="libs/jquery-1.10.2.min.js" type="text/javascript"></script>
        <script src="libs/bootstrap.min.js" type="text/javascript"></script>
        <script src="libs/introjs.min.js" type="text/javascript"></script>
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
<script src="js/lexicon_feedback.js" type="text/javascript"></script>
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
<script src="js/backbone/views/view_color.js" type="text/javascript"></script>
<script src="js/state/step.state.js" type="text/javascript"></script>
<script src="js/passage/step.passage.js" type="text/javascript"></script>
<script src="js/defaults/step.defaults.js" type="text/javascript"></script>
<script src="js/step_ready.js" type="text/javascript"></script>
<script src="js/color_code_grammar.js" type="text/javascript"></script>
<%
} else {
%>
<script src="js/step.${project.version}.min.js" type="text/javascript"></script>
<script src="js/color_code_grammar.${project.version}.min.js" type="text/javascript"></script>
<%
    }
%>
<script>
	if (step.touchDevice) {
        jQuery.event.special.touchstart = {
            setup: function( _, ns, handle ){
                if ( ns.includes("noPreventDefault") ) {
                    this.addEventListener("touchstart", handle, { passive: false });
                } else {
                    this.addEventListener("touchstart", handle, { passive: true });
                }
            }
        };
    }
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