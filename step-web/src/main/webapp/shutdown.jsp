<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@ page import="java.util.Locale" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!-- The following 4 lines are needed so that the traditional Chinese, instead of Simplified Chinese will be used -->
<% Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName()); %>
<% Locale locale = injector.getInstance(ClientSession.class).getLocale(); %>
<% if (locale.getLanguage().equalsIgnoreCase("zh") && locale.getCountry().equalsIgnoreCase("tw")) { %>
    <fmt:setLocale value="zh_TW"/>
<% } %>
<fmt:setBundle basename="HtmlBundle" />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person</TITLE>
    <link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
    <%@include file="/jsps/offlinePage.jsp" %>
</HEAD>
<body style="font-size: 12px">
	<div class="header">
		<h1>STEP :: Scripture Tools for Every Person</h1>
	</div>

	<h2><fmt:message key="step_is_shutting_down" /></h2>
	<p />
		<fmt:message key="you_can_close_browser" />
	<p />

    <script>
        $.get(STEP_SERVER_BASE_URL + "setup/shutdown");
    </script>
</body>
</HTML>
