<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<% if(request.getParameter("lang") != null) {
	Config.set(session, Config.FMT_LOCALE, request.getParameter("lang"));
} else { 
	Config.set(session, Config.FMT_LOCALE, request.getLocale().getLanguage());
} %>
<fmt:setBundle basename="HtmlBundle" />

<div id="login">
	<div id="loginPopup">
		<label for="emailAddress"><fmt:message key="register_email" /></label><input id="emailAddress" type="text" size="20" /><br />
		<label for="password"><fmt:message key="register_password" />:</label><input id="password" type="password" size="20" /><br />
	</div>
	<div id="registerPopup">
		<label for="name"><fmt:message key="register_name" /></label><input id="name" type="text" size="20" /><br />
		<label for="country"><fmt:message key="register_country" /></label><input id="country" type="text" size="20" /><br />
	</div>
</div>

