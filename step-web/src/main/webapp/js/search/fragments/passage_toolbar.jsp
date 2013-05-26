<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle" />

<div class="passageToolbarContainer">
	<span class="passageToolbarFloatingContainer">
		<span class="passageLookupButtons passageSizeButtons">
			<a class="syncOtherPassage"><fmt:message key="passage_sync" /></a> <a
			class="continuousPassage"><fmt:message key="passage_one_scroll" /></a>
			<a class="previousChapter"
			href="?reference=<%=stepRequest.getPreviousReference(Integer.parseInt(request
							.getParameter("passageId")))%>&version=<%=stepRequest.getVersion(Integer.parseInt(request
							.getParameter("passageId")))%>"><fmt:message key="passage_previous_chapter" /></a> <a
			class="nextChapter"
			href="?reference=<%=stepRequest.getNextReference(Integer.parseInt(request
							.getParameter("passageId")))%>&version=<%=stepRequest.getVersion(Integer.parseInt(request
							.getParameter("passageId")))%>"><fmt:message key="passage_next_chapter" /></a> 
		<a
			class="bookmarkPassageLink"><fmt:message key="passage_tools_bookmark" /></a> <a class="smallerFonts"
			href="#" title="<fmt:message key="passage_smaller_fonts" />"><fmt:message key="passage_font_size_symbol" /></a> <a class="largerFonts" href="#"
			title="<fmt:message key="passage_larger_fonts" />"><fmt:message key="passage_font_size_symbol" /></a>
		</span>
	</span>
</div>