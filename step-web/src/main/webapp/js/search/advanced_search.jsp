<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page import="java.util.Locale"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />




<div class="advancedSearch" style="clear: both">
	<div class="infoBar">
		<a class="closeInfoBar">&nbsp;</a>
		<div class="innerInfoBar ui-state-highlight">
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
		<legend><fmt:message key="search_passage_lookup" /></legend>

		<table class="passageTable">
			<tr>
				<td><fmt:message key="translation_commentary" /></td>
				<td style="white-space: nowrap;"><input type="text" class="passageVersion drop" size="15" /><a class="infoAboutVersion primaryDarkBold" target="_blank" href="version.jsp?version=<%= stepRequest.getThisVersion() %>" title="<fmt:message key="passage_info_about_version" />">&#x24d8;</a></td>
				<td style="padding-left: 10px"><fmt:message key="bible_text" />&nbsp;</td>
				<td><input type="text" class="passageReference drop" size="15" /> <a href='javascript:void' class="searchPassage" type="button" title="<fmt:message key="search_search_button" />">&nbsp;</a></td>
			</tr>
			<tr level="1">
				<td><fmt:message key="comparison_versions" /></td>
				<td><input type="text" class="extraVersions drop" size="15" /><a href='#' class='resetVersions primaryDarkBold'>x</a></td>
				<td level="2" style="padding-left: 10px"><fmt:message key="will_be_shown_as" /></td>
				<td level="2"><input type="text" class="extraVersionsDisplayOptions drop" size="15" readonly=true"/></td>
			</tr>
		</table>
	</fieldset>
<%-- 	<jsp:include page="personal_notes.jsp" /> --%>
	<jsp:include page="simple_text_search.jsp" />
	<jsp:include page="advanced_search_fragment.jsp" />	

	
	

	<fieldset name="SEARCH_SUBJECT">
		<legend><fmt:message key="search_subject" /></legend>
		<table class="subjectSearchTable">
			<tr>
				<td><fmt:message key="subject_search" />&nbsp;</td>
				<td><input type="text" class="subjectText" /></td>
			</tr>
			<tr level="2">
				<td><fmt:message key="search_query_syntax" />&nbsp;</td>
				<td><input type="text" class="subjectQuerySyntax querySyntax" /></td>
			</tr>
		</table>

		<div> 
			<input type="button" class="subjectClear resetSearch" value="<fmt:message key="search_reset_form" />" title="<fmt:message key="search_reset_form_title" />" />
			<input type="button" class="subjectSearch" value="<fmt:message key="search_search_button" />" title="<fmt:message key="search_search_button_title" />" />
		</div>
					
		<hr level="2" />
				
		<jsp:include page="search_toolbar.jsp?namespace=subject&context=false&bibleVersions=false&paging=false&refining=false" />
	</fieldset>


		<jsp:include page="word_search.jsp" />
		
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