<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page import="java.util.Locale"%>
<%@page import="java.util.ResourceBundle"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<%@ page import="com.tyndalehouse.step.jsp.PrefaceStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	PrefaceStepRequest stepRequest = new PrefaceStepRequest(injector, request);
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale);
	ResourceBundle bundle = ResourceBundle.getBundle("HtmlBundle", locale);

	String book = "";
	String title = "";
	String longTitle = "";
	try {
		book =  stepRequest.getBook().getInitials();
		title = String.format(bundle.getString("preface_title"), book);
		longTitle = String.format(bundle.getString("preface_description"), book);
	} catch(Exception e) {
		
	}
%>


<jsp:include page="/jsps/header.jsp">
	<jsp:param value="<%= title %>" name="title"/>
	<jsp:param value="<%= longTitle %>" name="description"/>
	<jsp:param value="<%= title %>" name="keywords"/>
</jsp:include>

<%= !stepRequest.isSuccess() ?  
		bundle.getString("unable_to_obtain_version_information") + " " + request.getParameter("version")
		: stepRequest.getPreface() %>


</body>
