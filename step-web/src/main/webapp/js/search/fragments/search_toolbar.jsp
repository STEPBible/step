<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />
<div class="searchToolbar">
	<% if(request.getParameter("bibleVersions").equals("true")) { %>
	    <fmt:message key="search_bible_versions" /> <input type='text' class='searchVersions <%=request.getParameter("namespace")%>SearchVersion _drop _m' />
	<% } %>
	<span class="searchToolbarButtonSets"> 
	
	<% if(request.getParameter("context").equals("true")) { %>
        <a href="javascript:void(0)" class='moreSearchContext'><fmt:message key="search_more_context" /></a>
    	<a href="javascript:void(0)" class='lessSearchContext'><fmt:message key="search_less_context" /></a>
	<% } %>
	
	<input type='hidden' class='searchContext <%=request.getParameter("namespace")%>SearchContext _m' value='0' readonly='true' />
	<% if(request.getParameter("refining").equals("true")) { %>
	    <a href="javascript:void(0)" class='refineSearch'><fmt:message key="search_refine_search" /></a>
	<% } %>

	<% if(request.getParameter("paging").equals("true")) { %>
        <a href="javascript:void(0)" class='adjustPageSize'><fmt:message key="search_toggle_page_size" /></a>
        <a href="javascript:void(0)" class='previousPage'><fmt:message key="search_previous_page" /></a>
        <a href="javascript:void(0)" class='nextPage'><fmt:message key="search_next_page" /></a>
	<% } %>

	<a class="smallerFonts" href="javascript:void(0)" title="<fmt:message key="passage_smaller_fonts" />"><fmt:message key="passage_font_size_symbol" /></a>
	<a class="largerFonts" href="javascript:void(0)" title="<fmt:message key="passage_larger_fonts" />"><fmt:message key="passage_font_size_symbol" /></a>
	<a href="javascript:void(0)" class='showSearchCriteria'><fmt:message key="search_show_criteria" /></a>
	<a href="javascript:void(0)" class='hideSearchCriteria'><fmt:message key="search_hide_criteria" /></a>
	<input type='hidden' class='pageNumber <%=request.getParameter("namespace")%>PageNumber' value='0' readonly='true' />
	</span>

	<div class="resultsLabel"></div>
</div>