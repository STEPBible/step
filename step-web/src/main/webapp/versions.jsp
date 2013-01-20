<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.VersionsStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	VersionsStepRequest stepRequest = new VersionsStepRequest(injector, request);
%>

<% if(request.getParameter("lang") != null) {
	Config.set(session, Config.FMT_LOCALE, request.getParameter("lang"));
} else { 
	Config.set(session, Config.FMT_LOCALE, request.getLocale().getLanguage());
} %>
<fmt:setBundle basename="HtmlBundle" />


<jsp:include page="jsps/header.jsp">
	<jsp:param value="<fmt:message key="available_versions_in_step" />" name="title"/>
	<jsp:param value="<fmt:message key="all_available_versions" />" name="description"/>
	<jsp:param value="<fmt:message key="esv_kjv_asv_greek_hebrew"/>" name="keywords"/>
</jsp:include>


	<h2><fmt:message key="list_available_versions"/></h2>
	<span id="bookListContainer">
		<%= stepRequest.getVersionList() %>
	</span>
</body>
