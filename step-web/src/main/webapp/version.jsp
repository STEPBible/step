<%@page import="java.util.ResourceBundle"%>
<%@ page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@ page import="java.util.Locale"%>
<%@ page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% 
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	VersionStepRequest stepRequest = new VersionStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle" />

<% if(!stepRequest.isSuccess()) { 
	ResourceBundle r = ResourceBundle.getBundle("HtmlBundle", locale);
	response.sendError(404, r.getString("unable_to_obtain_version_information"));
	return; 
}
%>


<% request.setCharacterEncoding("utf-8"); %>
<jsp:include page="jsps/header.jsp">
	<jsp:param value="<%= stepRequest.getBook().getName() %>" name="title"/>
	<jsp:param value="<%= stepRequest.getBook().getName() %>" name="description"/>
	<jsp:param value="<%= stepRequest.getBook().getName() %>" name="keywords"/>
</jsp:include>


	<h2><%= stepRequest.getBook().getName() %> (<%= stepRequest.getBook().getInitials() %>)</h1>
		<% 
			String info = stepRequest.getTyndaleInfo();
			if(info != null) {
		%>
		<div class="tyndaleInfo">
	    	<span class='tyndaleInfo'><%=  info %></span>
	    	<p />
	    </div>			
		<% 
			}
		%>
	</div>

	<span id="bookListContainer">
		<h3><fmt:message key="book_list" /></h3>
		<%= stepRequest.getBookList() %>
	</span>
	
	<span class="copyright">
		<h3><fmt:message key="copyright_information" /></h3>
		<span class="shortCopyright"><%= stepRequest.getShortCopyright() %></h1>
		<p />
		<span class="shortPromo"><%= stepRequest.getShortPromo() %></h1>
		<p />
		<span class="about"><%= ((String) stepRequest.getBook().getBookMetaData().getProperty("About")).replace("\\par", "<p />") %></h1>
		<p />
		<%= stepRequest.getMiniPreface() %>

	</span>

</body>
