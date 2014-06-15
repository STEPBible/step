<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@page import="java.util.Locale" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
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

    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>
    <script src="js/setup/step.config.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>

</HEAD>
<body style="font-size: 12px;">
<div class="header">
    <h1>STEP :: Scripture Tools for Every Person</h1>
</div>

<div style="margin: 5px 10px">
    <h2><fmt:message key="welcome_to_step_configuration"/></h2>

    <p/>
    <fmt:message key="configuration_intro"/>

    <p/>
    <fmt:message key="installation_instructions"/>

    <div class="configOptions">
        <input type="button" value="<fmt:message key="installation_use_step_application" />" id="useStep"
               onclick='window.location.href="start.jsp";'/>
    </div>

    <p/>

    <div class="" style="border: solid thin darkgrey; padding: 10px 20px 10px 20px; display: inline-block">
        <h3 style="margin-left: -10px"><fmt:message key="installation_sort_and_filter"/></h3>

        <%--<fieldset title="hi"><legend></legend>--%>
        <div class="sortAndFilter">
            <fmt:message key="installation_filter_by_value">
                <fmt:param value="<input type='text' value='' size='6' id='filterValue' />"/>
            </fmt:message>
            <select>
                <option value="name" onchange="step.config.filterBy('name');"><fmt:message key="installation_book_name"/></option>
                <option value="initials" onchange="step.config.filterBy('initials');"><fmt:message key="installation_book_initials"/></option>
                <option value="languageName" onchange="step.config.filterBy('languageName');"><fmt:message key="installation_book_language"/></option>
                <option value="category" onchange="step.config.filterBy('category');"><fmt:message key="installation_book_category"/></option>
            </select>
        </div>
        <div  class="sortAndFilter">
            <fmt:message key="installation_sort_by"/>
            <select>
                <option value="name" onchange="step.config.sortBy('name');"><fmt:message key="installation_book_name"/></option>
                <option value="initials" onchange="step.config.sortBy('initials');"><fmt:message key="installation_book_initials"/></option>
                <option value="languageName" onchange="step.config.sortBy('languageName');"><fmt:message key="installation_book_language"/></option>
                <option value="category" onchange="step.config.sortBy('category');"><fmt:message key="installation_book_category"/></option>
            </select>

        </div>
    </div>

    <hr />

    <div id="content">
        <div id="leftColumn" class='col-xs-6' style="border-right: solid thin darkgrey">
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
        <div id="rightColumn" class='col-xs-6'><h2><fmt:message key="installation_installed_modules"/></h2>

            <p/>

            <div class='versionsContainer'></div>
        </div>
    </div>
    <p/>
</div>
</body>
</HTML>
