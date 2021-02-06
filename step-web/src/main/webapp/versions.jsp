<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ page import="com.tyndalehouse.step.jsp.VersionsStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale);
	VersionsStepRequest stepRequest = new VersionsStepRequest(injector);
%>
<fmt:setBundle basename="HtmlBundle" />
<% request.setCharacterEncoding("utf-8"); %>
<jsp:include page="/jsps/header.jsp">
	<jsp:param><jsp:attribute name='name'>title</jsp:attribute>
		<jsp:attribute name='value'><fmt:message key='available_versions_in_step' /></jsp:attribute>
	</jsp:param>
	<jsp:param>
		<jsp:attribute name='name'>description</jsp:attribute>
		<jsp:attribute name='value'><fmt:message key='all_available_versions' /></jsp:attribute>
	</jsp:param>
	<jsp:param>
		<jsp:attribute name='name'>keywords</jsp:attribute>
		<jsp:attribute name='value'><fmt:message key='esv_kjv_asv_greek_hebrew' /></jsp:attribute>
	</jsp:param>
</jsp:include>


	<h2><fmt:message key="list_available_versions"/></h2>
    <span style="font-size: 12px"><fmt:message key="modules_from_crosswire"/></span>
    <p></p>
	<span id="bookListContainer">
		<%= stepRequest.getVersionList() %>
        <p></p>
	</span>

</body>
