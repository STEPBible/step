<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />



<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person</TITLE>

	<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.23.custom.css" />
    <link rel="stylesheet" type="text/css" href="css/setup-layout.css" />
    <link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
    
	<script src="js_init/initLib.js" type="text/javascript"></script>  
	<script src="international/interactive.js" type="text/javascript"></script>
	 
    <script src="libs/jquery-1.8.2.min.js" type="text/javascript"></script>
	<script src="libs/jquery-ui-1.8.23.custom.min.js" type="text/javascript"></script>

    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/setup/step.firstTime.js" type="text/javascript"></script>
</HEAD>
<body style="font-size: 12px">
	<div class="header">
		<h1>STEP :: Scripture Tools for Every Person</h1>
	</div>

	<h2><fmt:message key="welcome_to_step" /></h2>
	<p />
		<fmt:message key="first_time_notice" />
	 
	<p />
	
	<div style="height: 300px; overflow-y: scroll; border: 1px solid lightgrey">
		<ul id="progressStatus">
			
		</ul>
	</div>
</body>
</HTML>
