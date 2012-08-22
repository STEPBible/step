<div class="searchToolbar">
	Bible version(s): <input type='text' class='searchVersions <%=request.getParameter("specificSearchVersion")%>' /> 
	<span class="searchToolbarButtonSets"> 
	<a href='#' class='moreSearchContext'>More context</a> 
	<a href='#' class='lessSearchContext'>Less context</a> 
	<input type='hidden'	size='2' class='searchContext <%=request.getParameter("specificSearchContext")%>' value='0' readonly='true' /> 
	<a href='#' class='concordanceFormat'>Concordance view</a> 
	<a href='#' class='refineSearch'>Refine search</a> 
	<a href='#' class='showSearchCriteria'>Show search criteria</a> 
	<a href='#' class='hideSearchCriteria'>Hide search criteria</a>
	</span>
</div>