<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	VersionStepRequest stepRequest = new VersionStepRequest(injector, request);
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <TITLE>STEP :: <%= stepRequest.getBook().getName() %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="Scripture Tools for Every Person is a Bible study tool, currently showing information about <%= stepRequest.getBook().getName() %>">
	<meta name="keywords" content="<%= stepRequest.getBook().getName() %> <%= stepRequest.getBook().getInitials() %>" />
	
	<!-- used for webmaster tools -->
	<meta name="google-site-verification" content="OZfGjgjfTQq0Gn-m6pecYXYNGoDTllWS6v9aBOi64AU" />
	<link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
</HEAD>
<body>
	<jsp:include page="jsps/header.jsp" />


<% if(!stepRequest.isSuccess()) { %>
	Unable to obtain information about this version: <%= request.getParameter("version") %>
<% } else { %>
	<h2><%= stepRequest.getBook().getName() %> (<%= stepRequest.getBook().getInitials() %>)</h1>
	<span id="bookListContainer">
		<h3>Book list</h3>
		<%= stepRequest.getBookList() %>
	</span>
	
	<span class="copyright">
		<h3>Copyright information</h3>
		<span class="shortCopyright"><%= stepRequest.getShortCopyright() %></h1>
		<p />
		<span class="shortPromo"><%= stepRequest.getShortPromo() %></h1>
		<p />
		<span class="about"><%= ((String) stepRequest.getBook().getBookMetaData().getProperty("About")).replace("\\par", "<p />") %></h1>
	</span>
<% } %>

</body>
