<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	VersionStepRequest stepRequest = new VersionStepRequest(injector, request);
%>

<jsp:include page="jsps/header.jsp">
	<jsp:param value="<%= stepRequest.getBook().getName() %>" name="title"/>
	<jsp:param value="The <%= stepRequest.getBook().getName() %>" name="description"/>
	<jsp:param value="<%= stepRequest.getBook().getName() %>" name="keywords"/>
</jsp:include>

<% if(!stepRequest.isSuccess()) { %>
	Unable to obtain information about this version: <%= request.getParameter("version") %>
<% } else { %>
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
