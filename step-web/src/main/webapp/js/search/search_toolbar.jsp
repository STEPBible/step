<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<div class="searchToolbar">
	Bible version(s): <input type='text' class='searchVersions <%=request.getParameter("namespace")%>SearchVersion' /> 
	
	<span class="searchToolbarButtonSets"> 
	
	<%
		if(request.getParameter("context").equals("true")) {
	%>
	<a href='#' class='moreSearchContext'>More context</a> 
	<a href='#' class='lessSearchContext'>Less context</a> 
	<%
		}
	%>
	
	<input type='hidden' class='searchContext <%=request.getParameter("namespace")%>SearchContext' value='0' readonly='true' /> 
<!-- 	<a href='#' class='concordanceFormat'>Concordance view</a>  -->
	<a href='#' class='refineSearch'>Refine search</a> 
	<a href='#' class='previousPage'>Previous page of results</a> 
	<a href='#' class='nextPage'>Next page of results</a> 
	<a href='#' class='showSearchCriteria'>Show search criteria</a> 
	<a href='#' class='hideSearchCriteria'>Hide search criteria</a>
	<input type='hidden' class='pageNumber <%=request.getParameter("namespace")%>PageNumber' value='0' readonly='true' />
	</span>

	<div class="resultsLabel"></div>
</div>