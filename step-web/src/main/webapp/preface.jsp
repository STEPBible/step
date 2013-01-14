<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.PrefaceStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	PrefaceStepRequest stepRequest = new PrefaceStepRequest(injector, request);
%>

<jsp:include page="jsps/header.jsp">
	<jsp:param value="<%= stepRequest.getBook().getName() + \" preface\" %>" name="title"/>
	<jsp:param value="The preface to the <%= stepRequest.getBook().getName()  %>" name="description"/>
	<jsp:param value="<%= stepRequest.getBook().getName() + \" preface\" %>" name="keywords"/>
</jsp:include>

<% if(!stepRequest.isSuccess()) { %>
	Unable to obtain information about this version: <%= request.getParameter("version") %>
<% } else { %>
		<%= stepRequest.getPreface() %>
<% } %>


</body>
