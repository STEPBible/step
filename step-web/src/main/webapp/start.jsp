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
        <div class="navbar navbar-default navbar-fixed-top">
            <div>
                <div class="navbar-header search-form">
                    <div class="navbar-brand col-xs-12">
                        <span class="hidden-xs title">
                            <a href="/" id="logo">
                                <svg viewBox="0 0 137 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g fill="#17758F">
                                            <g transform="translate(-1.000000, -2.000000)">
                                                <path d="M20.418,18.035 C21.5660057,18.7183367 22.4406637,19.5929947 23.042,20.659 C23.6433363,21.7250053 23.944,22.954993 23.944,24.349 C23.944,25.6610066 23.6296698,26.884161 23.001,28.0185 C22.3723302,29.152839 21.4840057,30.157329 20.336,31.032 C19.2973281,31.8246706 18.1151733,32.4328312 16.7895,32.8565 C15.4638267,33.2801688 14.0630074,33.5056665 12.587,33.533 C11.1109926,33.533 9.70334003,33.3280021 8.364,32.918 C7.02465997,32.507998 5.83567186,31.8930041 4.797,31.073 C3.23899221,29.8976608 2.17300287,28.4763417 1.599,26.809 L7.339,24.144 C7.339,24.4173347 7.43466571,24.758998 7.626,25.169 C7.81733429,25.579002 8.11799795,25.9753314 8.528,26.358 C8.93800205,26.7406686 9.47099672,27.0686653 10.127,27.342 C10.7830033,27.6153347 11.5893285,27.752 12.546,27.752 C13.3113372,27.752 13.9878304,27.6563343 14.5755,27.465 C15.1631696,27.2736657 15.6551647,27.0345014 16.0515,26.7475 C16.4478353,26.4604986 16.748499,26.1325018 16.9535,25.7635 C17.158501,25.3944982 17.261,25.0186686 17.261,24.636 C17.261,24.1986645 17.1175014,23.7886686 16.8305,23.406 C16.5434986,23.0233314 16.0993363,22.7226678 15.498,22.504 C14.4046612,22.1213314 13.2498394,21.800168 12.0335,21.5405 C10.8171606,21.280832 9.63500574,20.9528353 8.487,20.5565 C7.33899426,20.1601647 6.27300492,19.6340033 5.289,18.978 C4.30499508,18.3219967 3.52600287,17.4063392 2.952,16.231 C2.43266407,15.1923281 2.173,14.0853392 2.173,12.91 C2.173,11.5979934 2.48049692,10.3270061 3.0955,9.097 C3.71050307,7.86699385 4.55099467,6.82833757 5.617,5.981 C6.62833839,5.18832937 7.76266038,4.58016878 9.02,4.1565 C10.2773396,3.73283121 11.602993,3.521 12.997,3.521 C14.391007,3.521 15.7234936,3.72599795 16.9945,4.136 C18.2655064,4.54600205 19.4066616,5.14732937 20.418,5.94 C21.4020049,6.67800369 22.1809971,7.53899508 22.755,8.523 L18.081,11.721 C17.5069971,10.9283294 16.7895043,10.2928357 15.9285,9.8145 C15.0674957,9.33616427 14.1040053,9.097 13.038,9.097 C11.5619926,9.097 10.4208374,9.42499672 9.6145,10.081 C8.80816263,10.7370033 8.405,11.5979947 8.405,12.664 C8.405,13.1560025 8.63049774,13.5933314 9.0815,13.976 C9.53250225,14.3586686 10.120163,14.7003318 10.8445,15.001 C11.568837,15.3016682 12.3819955,15.5681655 13.284,15.8005 C14.1860045,16.0328345 15.0811622,16.2651655 15.9695,16.4975 C16.8578378,16.7298345 17.6983294,16.9689988 18.491,17.215 C19.2836706,17.4610012 19.9259975,17.7343318 20.418,18.035 Z M26.219,3.931 L47.252,3.931 L47.252,9.589 L39.831,9.589 L39.831,33 L33.64,33 L33.64,9.589 L26.219,9.589 L26.219,3.931 Z M51.8630001,3.931 L70.0260001,3.931 L70.0260001,9.589 L58.0950001,9.589 L58.0950001,14.837 L68.5910001,14.837 L68.5910001,20.495 L58.0950001,20.495 L58.0950001,27.383 L70.0260001,27.383 L70.0260001,33 L51.8630001,33 L51.8630001,3.931 Z M88.1670001,3.931 C89.3150059,3.931 90.3946618,4.15649775 91.4060001,4.6075 C92.4173385,5.05850226 93.2988297,5.6734961 94.0505001,6.4525 C94.8021706,7.23150389 95.3966646,8.1471614 95.8340001,9.1995 C96.2713357,10.2518386 96.4900001,11.3793273 96.4900001,12.582 C96.4900001,13.7846727 96.2713357,14.9121614 95.8340001,15.9645 C95.3966646,17.0168386 94.8021706,17.9393294 94.0505001,18.732 C93.2988297,19.5246706 92.4173385,20.1464977 91.4060001,20.5975 C90.3946618,21.0485023 89.3150059,21.274 88.1670001,21.274 L81.8120001,21.274 L81.8120001,33 L75.6210001,33 L75.6210001,3.931 L88.1670001,3.931 Z M87.3470001,15.616 C88.1396708,15.616 88.8298305,15.3221696 89.4175001,14.7345 C90.0051697,14.1468304 90.2990001,13.4293376 90.2990001,12.582 C90.2990001,11.7619959 90.0051697,11.0581696 89.4175001,10.4705 C88.8298305,9.88283039 88.1396708,9.589 87.3470001,9.589 L81.8120001,9.589 L81.8120001,15.616 L87.3470001,15.616 Z" id="STEP"></path>
                                                <rect x="100" y="28" width="21.0971347" height="4.83619792"></rect>
                                                <rect x="106" y="19" width="21.0971347" height="3.83619792"></rect>
                                                <rect x="110" y="11" width="21.0971347" height="2.83619792"></rect>
                                                <rect x="115" y="4" width="21.0971347" height="1.83619792"></rect>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </a>
                            <br />
                            <span class="subtitle">
                                <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House</a>
                            </span>
                        </span>
                        <span class="help"><jsp:include page="js/menu/top/menu.jsp" /></span>
                        <form role="form">
                            <div class="input-group">
                                <input id="masterSearch" type="text" class="form-control input-sm" placeholder="<fmt:message key="search_placeholder" />">
                                <span class="input-group-btn findButton">
                                    <span>Search</span>
                                    <i class="find glyphicon glyphicon-search"></i>
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
                                <div class="resultsLabel pull-right" style="margin-right: 5px">
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
                                                                            <a href="javascript:void(0)" strong="${ definition.strongNumber}">
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
                        <div class="parent-div">
                            <h5 id="accordion-heading1">Examples to use the search box to find Bibles, passages, search terms, etc.<span id="plusminus1">-</span></h5>
                            <div id="accordion-body1">
                                <br>
                                <search:sample_search explanation="simple_passage_explanation" option1="ESV" option1type="version" option2="Gen 1" option2type="reference" sampleURL="/?q=version=ESV|reference=Gen.1&options=VHNUG" />
                                <search:sample_search explanation="multiple_versions_explanation" option1="NIV" option1type="version" option2="ESV" option2type="version" option3="KJV" option3type="version" option4="Gen 1" option4type="reference" sampleURL="/?q=version=NIV|version=ESV|version=KJV|reference=Gen.1&options=HVGUN&display=COLUMN" />
                                <search:sample_search explanation="simple_search_explanation" option1="ESV" option1type="version" option2="brother" option2type="greekMeanings" sampleURL="/?q=version=ESV|strong=G0080&options=HVNGU" />
                                <%--<search:sample_search explanation="simple_search_restricted_explanation" option1="${ pentateuch }" option1type="reference" option2="ESV" option2type="version" option3="he.sed" option3type="hebrew" sampleURL="" />--%>
                                <search:sample_search explanation="chained_searches_explanation" option1="NIV" option1type="version" option2="ESV" option2type="version" option3="land" option3type="text" option4="he.sed" option4type="hebrewMeanings" sampleURL="/?q=version=NIV|version=ESV|text=land|strong=H2617a&options=VGUVNH&display=INTERLEAVED" />
                                <search:sample_search explanation="chained_searches_explanation_subject" option1="ESV" option1type="version" option2="throne" option2type="meanings" option3="David" option3type="subject" option4="Isa-Rev" option4type="reference" sampleURL="/?q=version=ESV|meanings=throne|subject=david|reference=Isa-Rev&options=HNVUG" />
                                <search:sample_search explanation="interlinear_versions_explanation" option1="KJV" option1type="version" option2="WHNU" option2type="version" option3="John 1" option3type="reference" sampleURL="/?q=version=KJV|version=WHNU|reference=John.1&options=HVLUNM&display=INTERLINEAR" showInterlinear="true" />
                            </div>
                        </div>
                        <div class="parent-div">
                            <h5 id="accordion-heading2">Examples of some Bible study tools <span id="plusminus2">+</span></h5>
                            <div id="accordion-body2">
                                <br>
                                <search:sample_search explanation="kjv_verb_imperative_explanation" option1="KJV" option1type="version" option2="Col 3" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Col.3&options=HVGUNC', 'verb, imperative mood', ' Words with a red underlines are verbs in imperative mood.')" />
                                <search:sample_search explanation="kjv_verb_main_supporting_explanation" option1="KJV" option1type="version" option2="Col 1" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Col.1&options=HVGUNC', 'verb, main vs supporting verbs', 'Words with a green underlines are usually main verbs in either indicative or imperative moods.  Words with a purple underline are support verbs in either subjunctive, optative, infinitive or particple moods.  Move your mouse over the word to see the verb grammar at the bottom of the screen.')" />
                                <search:sample_search explanation="kjv_verb_number_and_gender_explanation" option1="KJV" option1type="version" option2="Mat 1" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Mat.1&options=HVGUNC', 'gender and number', 'Word with blue color font are masculine, red are feminine and black are neuter.  Words with bold font are plural.  Mouse over a word to see the grammar of the word.')" />
                                <search:sample_search explanation="esv_word_frequency_explanation" option1="ESV" option1type="version" option2="1Jo 1" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Quick tryout links<span style='background-color:white'>&nbsp;<span class='glyphicon glyphicon-plus'>   </span></span><span class='glyphicon glyphicon-stats'></span></span>"
                                    option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=ESV|reference=1Jo.1&options=HVGUN', 'function:openStats', 'Mouse over the words on the analysis tool (on the right panel) to see where the words are located.  Select book next to Bible text field in the right panel to see the word frequency for the entire book.')" />
                            </div>
                        </div>
                        <div class="parent-div">
                            <h5 id="accordion-heading3">Examples to enable color code grammar <span id="plusminus3">+</span></h5>
                            <div id="accordion-body3">
                                <br>
                                <search:sample_search explanation="kjv_verb_color_explanation" option1="KJV" option1type="version" option2="Eph 1" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Eph.1&options=HVGUNC', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')" />
                                <search:sample_search explanation="sblg_verb_color_explanation" option1="SBLG" option1type="version" option2="Rom 12" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=SBLG|reference=Rom.12&options=CEMVALHUN', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')" />
                                <search:sample_search explanation="cun_verb_color_explanation" option1="CUn" option1type="version" option2="Col 1" option2type="reference"
                                    option3="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>" option3type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=CUn|reference=Col.1&options=HVGUNC', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')" />
                                <search:sample_search explanation="interlinear_verb_color_explanation" option1="SBLG" option1type="version" option2="KJV" option2type="version" option3="CUN" option3type="version" option4="Eph 5" option4type="reference"
                                    option5="<span style='color:black' class='glyphicon glyphicon-plus'></span><span style='color:black;background-color:lightgrey'> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                    option5type="other"
                                    sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=SBLG|version=KJV|version=CUn|reference=Eph.5&options=CVLHUVNEAM&display=INTERLEAVED', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')" />
                                <div id='colorCodeTableDiv'></div>
                            </div>
                        </div>
                        <div class="text-muted step-copyright"><span>&copy; <a href="http://www.tyndale.cam.ac.uk" target="_blank">Tyndale House, Cambridge, UK</a> - <%= Calendar.getInstance().get(Calendar.YEAR) %><span></span></div>
                    </div>
                </div>
            </div>
            <div class="sidebar-offcanvas" id="sidebar" role="navigation"></div>
        </div>
    </div>

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
    <script src="js/color_code_grammar.js" type="text/javascript"></script>

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
	        <script src="js/color_code_grammar.${project.version}.min.js" type="text/javascript" ></script>
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
    <script>
        $(document).ready(function(){
            if (typeof displayQuickTryoutAccordion1 !== "undefined") {
                var tmp = localStorage.getItem('stepBible-displayQuickTryoutAccordion1');
                if (tmp) displayQuickTryoutAccordion1 = JSON.parse(tmp);
                if (displayQuickTryoutAccordion1 == true) {
                    $("#accordion-body1").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus1").text('-');  /* add minus sign */
                }
                else {
                    $("#accordion-body1").slideUp(600); /*if content not visible then show the accordion-body */
                    $("#plusminus1").text('+');  /* add minus sign */
                }
            }
            if (typeof displayQuickTryoutAccordion2 !== "undefined") {
                var tmp = localStorage.getItem('stepBible-displayQuickTryoutAccordion2');
                if (tmp) displayQuickTryoutAccordion2 = JSON.parse(tmp);
                if (displayQuickTryoutAccordion2 == true) {
                    $("#accordion-body2").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus2").text('-');  /* add minus sign */
                }
                else {
                    $("#accordion-body2").slideUp(600); /*if content not visible then show the accordion-body */
                    $("#plusminus2").text('+');  /* add minus sign */
                }
            }
            if (typeof displayQuickTryoutAccordion3 !== "undefined") {
                var tmp = localStorage.getItem('stepBible-displayQuickTryoutAccordion3');
                if (tmp) displayQuickTryoutAccordion3 = JSON.parse(tmp);
                if (displayQuickTryoutAccordion3 == true) {
                    $("#accordion-body3").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus3").text('-');  /* add minus sign */
                }
                else {
                    $("#accordion-body3").slideUp(600); /*if content not visible then show the accordion-body */
                    $("#plusminus3").text('+');  /* add minus sign */
                }
            }

            $("#accordion-heading1").click(function() {
                if($("#accordion-body1").is(':visible')) {  /* check the condition accordion-body is visible or not */
                    $("#accordion-body1").slideUp(600);  /*if content is visible then close accordion-body with specific time duration */
                    $("#plusminus1").text('+')    /* add plus sign */
                    if (typeof displayQuickTryoutAccordion1 !== "undefined") displayQuickTryoutAccordion1 = false;
                }
                else{
                    $("#accordion-body1").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus1").text('-');  /* add minus sign */
                    if (typeof displayQuickTryoutAccordion1 !== "undefined") displayQuickTryoutAccordion1 = true;
                }
                if (typeof displayQuickTryoutAccordion1 !== "undefined") localStorage.setItem('stepBible-displayQuickTryoutAccordion1', JSON.stringify(displayQuickTryoutAccordion1));
            });

            $("#accordion-heading2").click(function() {
                if($("#accordion-body2").is(':visible')) {  /* check the condition accordion-body is visible or not */
                    $("#accordion-body2").slideUp(600);  /*if content is visible then close accordion-body with specific time duration */
                    $("#plusminus2").text('+')    /* add plus sign */
                    if (typeof displayQuickTryoutAccordion2 !== "undefined") displayQuickTryoutAccordion2 = false;
                }
                else{
                    $("#accordion-body2").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus2").text('-');  /* add minus sign */
                    if (typeof displayQuickTryoutAccordion2 !== "undefined") displayQuickTryoutAccordion2 = true;
                }
                if (typeof displayQuickTryoutAccordion2 !== "undefined") localStorage.setItem('stepBible-displayQuickTryoutAccordion2', JSON.stringify(displayQuickTryoutAccordion2));
            });

            $("#accordion-heading3").click(function(){
                if($("#accordion-body3").is(':visible')){  /* check the condition accordion-body is visible or not */
                    $("#accordion-body3").slideUp(600);  /*if content is visible then close accordion-body with specific time duration */
                    $("#plusminus3").text('+')    /* add plus sign */
                    if (typeof displayQuickTryoutAccordion3 !== "undefined") displayQuickTryoutAccordion3 = false;
                }
                else{
                    $("#accordion-body3").slideDown(600); /*if content not visible then show the accordion-body */
                    $("#plusminus3").text('-');  /* add minus sign */
                    if (typeof displayQuickTryoutAccordion3 !== "undefined") displayQuickTryoutAccordion3 = true;
                }
                if (typeof displayQuickTryoutAccordion3 !== "undefined") localStorage.setItem('stepBible-displayQuickTryoutAccordion3', JSON.stringify(displayQuickTryoutAccordion3));
            });

        });
    </script>

</body>
</html>
