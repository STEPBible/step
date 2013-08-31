<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.jsp.WebStepRequest"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle" />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person</TITLE>

    <%@include file="jsps/offlinePage.jsp" %>
    <link rel="stylesheet" type="text/css" href="css/setup-layout.css" />
    <link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
    <script src="international/interactive.js" type="text/javascript"></script>

    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/util.js" type="text/javascript"></script>
    <script src="js/setup/step.config.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>
</HEAD>
<body style="font-size: 12px">
	<div class="header">
		<h1>STEP :: Scripture Tools for Every Person</h1>
	</div>

	<h2><fmt:message key="welcome_to_step_configuration" /></h2>
	<p />
	<fmt:message key="configuration_intro" />

    <p />
    <fmt:message key="installation_instructions" />

    <div class="configOptions">
         <input type="button" value="<fmt:message key="installation_use_step_application" />" id="useStep" onclick='window.location.href="index.jsp";' />
         <input type="button" value="<fmt:message key="installation_add_modules_from_internet" />" id="dismissWarning" />
	</div>


    <p />

	<div class="halfColumn miniBox">
		<h3><fmt:message key="installation_sort_by" /></h3>
		<div class='optionContainer'>
			<%--<input type='text' style='visibility: hidden' /><br />--%>
			<a href="#" onclick="step.config.sortBy('name');"><fmt:message key="installation_book_name" /></a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('initials');"><fmt:message key="installation_book_initials" /></a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('languageName');"><fmt:message key="installation_book_language" /></a>&nbsp;&nbsp;
			<%--<a href="#" onclick="step.config.sortBy('languageCode');"><fmt:message key="installation_book_language_code" /></a>&nbsp;&nbsp;--%>
			<a href="#" onclick="step.config.sortBy('category');"><fmt:message key="installation_book_category" /></a>
			<br />
		</div>

	</div>

	<div class="halfColumn miniBox">
		<h3><fmt:message key="installation_filter_by" /></h3>
		<div class='optionContainer'>
			<fmt:message key="installation_filter_by_value" /> 		<input type='text' value="" size="6" id='filterValue' />
			<fmt:message key="instlalation_filters" />
			<a href="#" onclick="step.config.filterBy('name');"><fmt:message key="installation_book_name" /></a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('initials');"><fmt:message key="installation_book_initials" /></a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('language');"><fmt:message key="installation_book_language" /></a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('category');"><fmt:message key="installation_book_category" /></a>&nbsp;&nbsp;
		</div>
	</div>
    <br /><br /><br /><br /><br /><br />
    <div id="content">
		<div id="leftColumn" class='halfColumn'>
			<h3><fmt:message key="installation_downloadable_modules" /></h3>
			<p />
			<div class='container'>
				<div class='waitingLabel'>
					<fmt:message key="installation_please_wait_while_step_retrieves_bibles" />
					<p />
					<span class='waiting'>
						<img src="images/wait_big.gif" />
					</span>
				</div>
			</div>
		</div>
		<div id="rightColumn" class='halfColumn'><h3><fmt:message key="installation_installed_modules" /></h3><p /><div class='container'></div></div>
	</div>
	<p />
</body>
</HTML>
