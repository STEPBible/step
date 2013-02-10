<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="com.tyndalehouse.step.jsp.SimpleSearchStepRequest"%>
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
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />


<fieldset name="SEARCH_PERSONAL_NOTES" class="personalNotesFields">
	<legend><fmt:message key="personal_notes" /></legend>
	<table>
		<tr>
			<td><fmt:message key="search_for_personal_notes" /></td>
			<td class="fullSearchWidth"><input type="text" class="personalNotesSearch drop" /></td>
			<td><a class="personalNotesNew"><fmt:message key="new_personal_notes" /></a></td>
		</tr>
		<tr>
			<td><fmt:message key="current_personal_notes" /></td>
			<td class="fullSearchWidth"><input type="text" class="personalNotesCurrent" /></td>
			<td>
				<a class="personalNotesSave"><fmt:message key="save_personal_notes" /></a>
				<a class="personalNotesDelete"><fmt:message key="delete_personal_notes" /></a>
			</td>
		</tr>
	</table>
	
	
</fieldset>


