<%@page import="com.tyndalehouse.step.jsp.WordSearchStepRequest"%>
<%@page import="java.util.ResourceBundle"%>
<%@page import="org.crosswire.common.util.Language"%>
<%@page import="org.apache.taglibs.standard.tag.common.fmt.BundleSupport"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page import="java.util.Locale"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% 
	Locale locale;
	
	String overridenLocale = request.getParameter("lang");
	if(overridenLocale != null) {
		locale = new Locale(overridenLocale);
	} else if(request.getLocale() != null) {
		locale = request.getLocale();
	} else {
		locale = Locale.ENGLISH;	
	}
	
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());

	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	WordSearchStepRequest stepRequest = new WordSearchStepRequest(injector, request, locale);
%>


<fmt:setBundle basename="HtmlBundle" />


<fieldset name="SEARCH_ORIGINAL">
		<legend><fmt:message key="search_word" /></legend>

		<table class="wordSearch" >
			<%= stepRequest.getSearch() %>
		</table>
		
		
		<div class="searchButtonsAlign">
			<input type="button" class="originalClear " value="<fmt:message key="search_reset_form" />" title="<fmt:message key="search_reset_form_title" />" />
			<input type="button" class="originalSearchButton " value="<fmt:message key="search_search_button" />" title="<fmt:message key="search_search_button_title" />" />
		</div>
		
		<hr level="2" />
		
		<div level="2">
			<fmt:message key="search_query_syntax" />&nbsp;
			<input type="text" class="originalQuerySyntax querySyntax" size="45" />
		</div>
		<hr />
		
		
		<jsp:include page="search_toolbar.jsp?namespace=original&context=true&bibleVersions=true&paging=true&refining=true" />
	</fieldset>