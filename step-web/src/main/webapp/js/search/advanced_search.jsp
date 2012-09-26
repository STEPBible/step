<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>


<div class="advancedSearch" style="clear: both">
	<div class="infoBar ui-state-highlight">
		<span class="ui-icon ui-icon-close closeInfoBar"></span>
		<div class="innerInfoBar">
			<span class="ui-icon ui-icon-info"></span>
			<span class="infoLabel"></span>
		</div>
	</div>
	
	<div class="refinedSearch ui-state-highlight">
		<span class="ui-icon ui-icon-close closeRefinedSearch"></span>
		<div class="innerRefinedSearch">
			<span class="ui-icon ui-icon-info"></span>
			<span class="refinedSearchLabel"></span>
		</div>
	</div>


	<!-- Passage search -->
	<fieldset name="SEARCH_PASSAGE">
		<legend>Passage lookup</legend>

		<table class="passageTable">
			<tr>
				<td>Translation / Commentary</td>
				<td><input type="text" class="passageVersion" size="15" /></td>
				<td style="padding-left: 10px">Bible Text&nbsp;</td>
				<td><input type="text" class="passageReference" size="15" /></td>
			</tr>
			<tr level="1">
				<td>Comparison versions</td>
				<td><input type="text" class="extraVersions" size="15" /></td>
				<td level="2" style="padding-left: 10px">will be shown as</td>
				<td level="2"><input type="text" class="extraVersionsDisplayOptions drop" size="15" readonly=true"/></td>
			</tr>
		</table>
	</fieldset>

	<fieldset class="simpleTextFields" name="SEARCH_SIMPLE_TEXT">
		<legend>Text search</legend>

		<table>
			<tr>
				<td>Search for verses with</td>
				<td><input type="text" class="simpleTextType simpleTextTypePrimary drop" /></td>
				<td><input type="text" class="simpleTextCriteria" /></td>
				<td>within</td>
				<td><input type="text" class="simpleTextScope drop" title="For example, <b>Mark</b>, <b>Rom 1</b>, <b>Phili</b> <br />Or select an option from the list" /></td>
			</tr>
			<tr level="1">
				<td>and <input type="text" class="simpleTextInclude drop" size="13" /></td>
				<td><input type="text" class="simpleTextSecondaryTypes simpleTextTypeSecondary drop" /></td>
				<td><input type="text" class="simpleTextSecondaryCriteria" /></td>
				<td>within</td>
				<td><input type="text" class="simpleTextProximity drop" /></td>
			</tr>
		</table>

		<div class="searchButtonsAlign">
			<input type="button" class="simpleTextClear resetSearch" value="Reset" />
			<input type="button" class="simpleTextSearchButton" value="Search" /><br />
			<span class="resultEstimates">&nbsp;</span>
		</div>

		<hr level="2" />
		<div level="2">Query syntax <input class="simpleTextQuerySyntax querySyntax" style="width: 70%" /> </div>
	
		<hr />
		<jsp:include page="search_toolbar.jsp?namespace=simpleText&context=true&bibleVersions=true"  />
		
	</fieldset>


	<fieldset name="SEARCH_TEXT">
		<legend>Advanced text search</legend>

		<table class="textSearchTable">
			<tr>
				<td colspan="4"><h4
						title="This is used for the main search query. Results returned are centered on this query.">First
						query</h4></td>
			</tr>
			<tr>
				<td>Include all of these words</td>
				<td><input type="text" class="textPrimaryIncludeAllWords" size="15" /></td>
				<td>Include any of these words</td>
				<td><input type="text" class="textPrimaryIncludeWords"
					size="15" /></td>
			</tr>
			<tr>
				<td>Include exact phrase</td>
				<td colspan="3"><input type="text" class="textPrimaryExactPhrase" size="45" /></td>
			</tr>
			<tr level="2">
				<td>Exclude this exact phrase</td>
				<td><input type="text" class="textPrimaryExcludePhrase"
					size="15" /></td>
				<td>Exclude these words</td>
				<td><input type="text" class="textPrimaryExcludeWords"
					size="15" /></td>
			</tr>
			<tr level="2">
				<td>Include spellings similar to</td>
				<td><input type="text" class="textPrimarySimilarSpellings"
					size="15" /></td>
				<td>Include words starting with</td>
				<td><input type="text" class="textPrimaryWordsStarting"
					size="15" /></td>
			</tr>
			<tr level="2">
				<td>Include these words</td>
				<td colspan="1"><input type="text"
					class="textPrimaryIncludeRangedWords" size="15" /></td>
				<td colspan="2">if they are within <input type="text"
					class="textPrimaryWithinXWords" size="2" /> words of each other
				</td>
			</tr>
			<tr  level="1">
				<td colspan="4"><hr /></td>
			</tr>
			<tr level="1">
				<td colspan="4">
					<h4
						title="Use a secondary query if you want to look for terms that are close to the first query">Second
						query</h4>
				</td>
			</tr>
			<tr  level="1">
				<td colspan="4">First and second queries are within 
				<input type="text" class="textVerseProximity" size="2" /> verses of each other</td>
			</tr>
			<tr level="1">
				<td>Include all of these words</td>
				<td><input type="text" class="textCloseByIncludeAllWords" size="15" /></td>
<!-- 			</tr> -->
<!-- 			<tr> -->
				<td>Include any of these words</td>
				<td><input type="text" class="textCloseByIncludeWords"
					size="15" /></td>
			</tr>
			<tr level="1">
				<td>Include exact phrase</td>
				<td colspan="3"><input type="text" class="textCloseByExactPhrase" size="45" /></td>
			</tr>
			<tr level="2">
				<td>Include spellings similar to</td>
				<td><input type="text" class="textCloseBySimilarSpellings"
					size="15" /></td>
				<td>Include words starting with</td>
				<td><input type="text" class="textCloseByWordsStarting"
					size="15" /></td>
			</tr>
			<tr level="2">
				<td>Include these words</td>
				<td colspan="1"><input type="text"
					class="textCloseByIncludeRangedWords" size="15" /></td>
				<td colspan="2">if they are within <input type="text"
					class="textCloseByWithinXWords" size="2" /> words of each other
				</td>
			</tr>
			<tr>
				<td colspan="4"><hr /></td>
			</tr>
			<tr>
				<td colspan="4">
					<h4
						title="Search options to specialise the search further">Search
						options</h4>
				</td>
			</tr>
			
			<tr>
				<td>Restrict search to</td>
				<td><input type="text" class="textRestriction showRanges" size="15" /></td>
				<td><i>or</i> exclude range</td>
				<td><input type="text" class="textRestrictionExclude showRanges" size="15" /></td>
			</tr>
		</table>
		
		<div class="searchButtonsAlign">
			<input type="button" class="textClearButton resetSearch" value="Clear" />
			<input type="button" class="textSearchButton" value="Search" /><br />
			<span class="resultEstimates">&nbsp;</span>
		</div>
		
		<hr level="2" />
		
		<div level="2">
			Query syntax
			<input class="textQuerySyntax querySyntax" size="45"></input>
		</div>
		<hr />
		
		
		<jsp:include page="search_toolbar.jsp?namespace=text&context=true&bibleVersions=true" />
	</fieldset>

	<fieldset name="SEARCH_ORIGINAL">
		<legend>Word search</legend>

		<table class="wordSearch" >
			<tr>
				<td >Search for</td>
				<td><input type='text' class='originalType drop' size="20" readonly=true" /></td>
				<td><input type='text' class='originalWord' title="Select an option from the previous dropdown first." /></td>
			</tr>
			<tr>
				<td><span class="originalMeaning">as they occur in</span><span class="originalAncient">showing</span></td>
				<td></td>
				<td>
					<input type='text' class='originalWordScope originalMeaning' />
					<input type='text' class='originalForms drop originalAncient' size="20" readonly=true" />
				</td>
			</tr>
			<tr>
				<td>Restrict results to</td>
				<td><input type="text" class="originalScope drop" size="20" readonly=true" title="Once the original word has been identified, constrains the displayed search results." /></td>
			</tr>
			<tr>
				<td level="1">and group by</td>
				<td level="1"><input type="text" class="originalSorting drop" size="15" readonly=true" /></td>
			</tr>
		</table>
		
		
		<div class="searchButtonsAlign">
			<input type="button" class="originalClear " value="Clear" title="Reset the form" />
			<input type="button" class="originalSearchButton " value="Search" title="Search for the keyed-in word" />
		</div>
		
		<hr level="2" />
		
		<div level="2">
			Query syntax&nbsp;
			<input type="text" class="originalQuerySyntax querySyntax" size="45" />
		</div>
		<hr />
		
		
		<jsp:include page="search_toolbar.jsp?namespace=original&context=true&bibleVersions=true" />
	</fieldset>

	<fieldset name="SEARCH_SUBJECT">
		<legend>Subject search</legend>
		<table class="subjectSearchTable">
			<tr>
				<td>Subject&nbsp;</td>
				<td><input type="text" class="subjectText" /></td>
			</tr>
			<tr level="2">
				<td>Query Syntax&nbsp;</td>
				<td><input type="text" class="subjectQuerySyntax querySyntax subjectText" /></td>
			</tr>
			
		</table>

		<div> 
			<input type="button" class="subjectClear resetSearch" value="Clear" title="Clears the search criteria" />
			<input type="button" class="subjectSearch" value="Search" title="This will search for subjects matching the selected criteria" />
		</div>
					
		<hr level="2" />
		

		<hr />
				
		<jsp:include page="search_toolbar.jsp?namespace=subject&context=false&bibleVersions=false" />
	</fieldset>


<%-- 	
	<fieldset name="SEARCH_TIMELINE">
		<legend>Timeline search</legend>
		<table style="width: 100%">
			<tr>
				<td>Search by scripture reference</td>
				<td><input type="text" class="timelineReference" /></td>
				<td colspan="3"><input type="button"
					class="timelineReferenceSearch passageButtons" value="Search"
					title="Finds timeline events related to the selected reference" /></td>
			</tr>
			<tr>
				<td>Search by description</td>
				<td><input type="text" class="timelineEventDescription" /></td>
				<td colspan="3"><input
					class="timelineDescriptionSearch passageButtons" type="button"
					value="Search"</td>
			</tr>
			<tr style="display: none">
				<td>Search by date</td>
				<td><input type="text" class="timelineDate" /></td>
				<td>+/-</td>
				<td><input type="text" class="timelineYears" size="4" /> years</td>
				<td><input class="timelineDateSearch passageButtons"
					type="button" value="Search" /></td>
			</tr>
			
			<input type="hidden" class="timelineSearchDescription" />
		</table>
	</fieldset>
--%>
	</div>