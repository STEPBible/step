<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@page import="java.util.Locale" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale);
    WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person</TITLE>

    <%@include file="jsps/offlinePage.jsp" %>
    <link href="css/bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="css/bootstrap-theme.min.css" rel="stylesheet" media="screen"/>
    <link rel="stylesheet" type="text/css" href="css/setup-layout.css"/>
    <link rel="stylesheet" type="text/css" href="static/static.css"/>
    <link rel="shortcut icon" href="images/step-favicon.ico"/>
    <script src="international/interactive.js" type="text/javascript"></script>
    <script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>
    <script src="js/setup/step.config.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>

</HEAD>
<body>
    <div>
        <div class="header">
            <h1>STEP :: Scripture Tools for Every Person</h1>
        </div>
        <div class="pageContent">
            <h2><fmt:message key="welcome_to_step_configuration"/></h2>

            <div>
                <div class="welcomeSection col-xs-12 col-md-6">
                    <div>
                        <p/>
                        <fmt:message key="configuration_intro"/>

                        <p/>
                        <fmt:message key="installation_instructions"/>

                        <div class="configOptions">
                            <input type="button" value="<fmt:message key="installation_use_step_application" />" id="useStep"
                                   onclick='window.location.href="/";'/>
                        </div>

                        <p/>
                    </div>
                </div>

                <div class="filterBox col-xs-12 col-md-6">
                    <h3><fmt:message key="installation_sort_and_filter"/></h3>

                    <%--<fieldset title="hi"><legend></legend>--%>
                    <div class="sortAndFilter">
                        <fmt:message key="installation_filter_by_value">
                            <fmt:param value="<input type='text' value='' size='6' id='filterValue' />"/>
                        </fmt:message>
                        <select class="filterBy">
                            <option value="initials" selected><fmt:message key="installation_book_initials"/></option>
                            <option value="name"><fmt:message key="installation_book_name"/></option>
                            <option value="languageName"><fmt:message key="installation_book_language"/></option>
                            <option value="category"><fmt:message key="installation_book_category"/></option>
                        </select>
                    </div>
                    <div class="sortAndFilter">
                        <fmt:message key="installation_sort_by"/>
                        <select class="sortBy">
                            <option value="initials"><fmt:message key="installation_book_initials"/></option>
                            <option value="name" selected><fmt:message key="installation_book_name"/></option>
                            <option value="languageName"><fmt:message key="installation_book_language"/></option>
                            <option value="category"><fmt:message key="installation_book_category"/></option>
                        </select>

                    </div>
                </div>
            </div>
        </div>
    </div>


    <div id="content">
        <div id="installedColumn" class='col-xs-6'><h2><fmt:message key="installation_installed_modules"/></h2>
            <p/>
            <div class='versionsContainer'>
                <c:forEach items="${installedVersions}" var="item">
                    <div class='version bg-success' data-initials="${ item.shortInitials }">
                        <fmt:bundle basename="InteractiveBundle">
                            <button class='pull-right' title='<fmt:message key="remove" />'>
                        </fmt:bundle>
                            <span class='glyphicon glyphicon-remove'></span>
                        </button>
                        <span class='versionContainer'>
                            <div class='versionHeader'>
                                <span class='name'>
                                    ${ item.name }
                                </span>
                                (<span class='initials'>${ item.shortInitials } </span>)
                            </div>
                            <div class='row'>
                                <span class='col-xs-6 col-md-4'>
                                    <label>
                                        <fmt:bundle basename="InteractiveBundle">
                                            <fmt:message key="category" />
                                        </fmt:bundle>
                                    </label>
                                    <fmt:bundle basename="InteractiveBundle">
                                        <span class='category'><fmt:message key="${ item.category == 'BIBLE' ? 'bible' : 'commentary' }" /></span>
                                    </fmt:bundle>
                                </span>
                                <span class='col-xs-6 col-md-4'>
                                    <fmt:bundle basename="InteractiveBundle">
                                        <label><fmt:message key="language" /></label>
                                    </fmt:bundle>

                                    <span class='languageName'>${ item.languageName }</span>
                                    (<span class='languageCode'>${ item.languageCode }</span>)
                                </span>
                                <span class='features col-xs-6 col-md-4'>
                                    <fmt:bundle basename="InteractiveBundle">
                                        <label>
                                                <fmt:message key="features" />
                                        </label>
                                        <c:if test="${item.hasRedLetter}"><span class="versionFeature" title="<fmt:message key="jesus_words_in_red_available" />"><fmt:message key="jesus_words_in_red_available_initial" /></span></c:if>
                                        <c:if test="${item.hasNotes}"><span class="versionFeature" title="<fmt:message key="notes_available" />"><fmt:message key="notes_available_initials" /></span></c:if>
                                        <c:if test="${item.hasMorphology}"><span class="versionFeature" title="<fmt:message key="grammar_available" />"><fmt:message key="grammar_available_initial" /></span></c:if>
                                        <c:if test="${item.hasStrongs}"><span class="versionFeature" title="<fmt:message key="vocabulary_available" />"><fmt:message key="vocabulary_available_initial" /></span></c:if>
                                        <c:if test="${item.hasStrongs}"><span class="versionFeature" title="<fmt:message key="interlinear_available" />"><fmt:message key="interlinear_available_initial" /></span></c:if>
                                        <c:if test="${not (item.hasStrongs || item.hasRedLetter || item.hasNotes || item.hasMorphology )}"><fmt:message key="not_applicable" /></c:if>
                                    </fmt:bundle>
                                </span>
                            </div>
                        </span>
                    </div>

                </c:forEach>

            </div>
        </div>

        <div id="toBeInstalledColumn" class='col-xs-6' style="border-right: solid thin darkgrey">
            <h2>
                <fmt:message key="installation_downloadable_modules"/>
                <span class="repositories">
                (<fmt:message key="installation_select_repository"/> <select id="repositories">
                    <option id="selectRepository"><fmt:message key="select_repository"/></option>
                    <option id="allRepositories" value="-1"><fmt:message key="installation_all_repositories"/></option>
                    <option id="installFromDirectory" value="INSTALL_FROM_DIRECTORY"><fmt:message
                            key="installation_add_local_repository"/></option>
                </select>)</span>
            </h2>
            <span id="loadingRepo" style="display: none"><fmt:message key="installation_loading_repository"/></span>

            <p/>

            <div class='versionsContainer'>
            </div>
        </div>
    </div>

</body>
</HTML>
