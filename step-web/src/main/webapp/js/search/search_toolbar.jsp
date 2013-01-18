<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% if(request.getParameter("lang") != null) { %>
		<fmt:setLocale value='<%= request.getParameter("lang") %>' />
<% } else { %> 
		<fmt:setLocale value="en" />
<% } %>
<fmt:setBundle basename="HtmlBundle" />



<div class="searchToolbar">
	<%
		if(request.getParameter("bibleVersions").equals("true")) {
	%>
	<fmt:message key="search_bible_versions" /> <input type='text' class='searchVersions <%=request.getParameter("namespace")%>SearchVersion' /> 
	<%
		}
	%>
	<span class="searchToolbarButtonSets"> 
	
	<%
		if(request.getParameter("context").equals("true")) {
	%>
	<a href='#' class='moreSearchContext'><fmt:message key="search_more_context" /></a> 
	<a href='#' class='lessSearchContext'><fmt:message key="search_less_context" /></a> 
	<%
		}
	%>
	
	<input type='hidden' class='searchContext <%=request.getParameter("namespace")%>SearchContext' value='0' readonly='true' /> 
<!-- 	<a href='#' class='concordanceFormat'>Concordance view</a>  -->

	<%
		if(request.getParameter("refining").equals("true")) {
	%>
	<a href='#' class='refineSearch'><fmt:message key="search_refine_search" /></a> 
	<% 
		}
	%>

	<%
		if(request.getParameter("paging").equals("true")) {
	%>
	<a href='#' class='adjustPageSize'><fmt:message key="search_toggle_page_size" /></a> 
	<a href='#' class='previousPage'><fmt:message key="search_previous_page" /></a> 
	<a href='#' class='nextPage'><fmt:message key="search_next_page" /></a> 
	<%
		}
	%>
	<a class="smallerFonts" href="#" title="Smaller fonts">A</a>
	<a class="largerFonts" href="#" title="Larger fonts">A</a>
	<a href='#' class='showSearchCriteria'><fmt:message key="search_show_criteria" /></a> 
	<a href='#' class='hideSearchCriteria'><fmt:message key="search_hide_criteria" /></a>
	<input type='hidden' class='pageNumber <%=request.getParameter("namespace")%>PageNumber' value='0' readonly='true' />
	</span>

	<div class="resultsLabel"></div>
</div>