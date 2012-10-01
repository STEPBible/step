<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.VersionsStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	VersionsStepRequest stepRequest = new VersionsStepRequest(injector, request);
%>

<jsp:include page="jsps/header.jsp">
	<jsp:param value="Available versions in STEP" name="title"/>
	<jsp:param value="Lists all the available versions included in the STEP project" name="description"/>
	<jsp:param value="ESV KJV ASV Greek Hebrew texts" name="keywords"/>
</jsp:include>


	<h2>A list of all available versions</h2>
	<span id="bookListContainer">
		<%= stepRequest.getVersionList() %>
	</span>
</body>
