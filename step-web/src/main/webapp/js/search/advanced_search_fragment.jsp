<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="com.tyndalehouse.step.jsp.AdvancedSearchStepRequest"%>
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
	AdvancedSearchStepRequest stepRequest = new AdvancedSearchStepRequest(injector, request);
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />


<fieldset name="SEARCH_TEXT">
		<legend><fmt:message key="search_advanced_text" /></legend>

		<table class="textSearchTable">
			<tr>
				<td colspan="4"><h4
						title="<fmt:message key="advanced_search_first_query_title" />"><fmt:message key="advanced_search_first_query" />
						</h4></td>
			</tr>
			<tr>
				<td><fmt:message key="advanced_search_include_all" /></td>
				<td><input type="text" class="textPrimaryIncludeAllWords" size="15" /></td>
				<td><fmt:message key="advanced_search_include_any" /></td>
				<td><input type="text" class="textPrimaryIncludeWords"
					size="15" /></td>
			</tr>
			<tr>
				<td><fmt:message key="advanced_search_include_exact" /></td>
				<td colspan="3"><input type="text" class="textPrimaryExactPhrase" size="45" /></td>
			</tr>
			<tr level="2">
				<td><fmt:message key="advanced_search_exclude_exact" /></td>
				<td><input type="text" class="textPrimaryExcludePhrase"
					size="15" /></td>
				<td><fmt:message key="advanced_search_exclude_words" /></td>
				<td><input type="text" class="textPrimaryExcludeWords"
					size="15" /></td>
			</tr>
			<tr level="2">
				<td><fmt:message key="advanced_search_include_similar_spellings" /></td>
				<td><input type="text" class="textPrimarySimilarSpellings"
					size="15" /></td>
				<td><fmt:message key="advanced_search_include_words_starting" /></td>
				<td><input type="text" class="textPrimaryWordsStarting"
					size="15" /></td>
			</tr>
			<tr level="2">
				<%= stepRequest.getPrimaryIncludeTheseWords() %>
			</tr>
			<tr  level="1">
				<td colspan="4"><hr /></td>
			</tr>
			<tr level="1">
				<td colspan="4">
					<h4
						title="<fmt:message key="advanced_search_second_query_title" />"><fmt:message key="advanced_search_second_query" /></h4>
				</td>
			</tr>
			<tr  level="1">
				<td colspan="4"><%= stepRequest.getProximityBetweenQueries() %></td>
			</tr>
			<tr level="1">
				<td><fmt:message key="advanced_search_include_all" /></td>
				<td><input type="text" class="textCloseByIncludeAllWords" size="15" /></td>
				<td><fmt:message key="advanced_search_include_any" /></td>
				<td><input type="text" class="textCloseByIncludeWords"
					size="15" /></td>
			</tr>
			<tr level="1">
				<td><fmt:message key="advanced_search_include_exact" /></td>
				<td colspan="3"><input type="text" class="textCloseByExactPhrase" size="45" /></td>
			</tr>
			<tr level="2">
				<td><fmt:message key="advanced_search_include_similar_spellings" /></td>
				<td><input type="text" class="textCloseBySimilarSpellings"
					size="15" /></td>
				<td><fmt:message key="advanced_search_include_words_starting" /></td>
				<td><input type="text" class="textCloseByWordsStarting"
					size="15" /></td>
			</tr>
			<tr level="2">
				<%= stepRequest.getCloseByIncludeTheseWords() %>
			</tr>
			<tr>
				<td colspan="4"><hr /></td>
			</tr>
			<tr>
				<td colspan="4">
					<h4
						title="<fmt:message key="advanced_search_options_title" />">
						<fmt:message key="advanced_search_options" /></h4>
				</td>
			</tr>
			
			<tr>
				<%= stepRequest.getRestrictSearch() %>
			</tr>
		</table>
		
		<div class="searchButtonsAlign">
			<input type="button" class="textClearButton resetSearch" value="<fmt:message key="search_reset_form" />" title="<fmt:message key="search_reset_form_title" />" />
			<input type="button" class="textSearchButton" value="<fmt:message key="search_search_button" />" title="<fmt:message key="search_search_button_title" />" /><br />
			<span class="resultEstimates">&nbsp;</span>
		</div>
		
		<hr level="2" />
		
		<div level="2">
			<fmt:message key="search_query_syntax" />
			<input class="textQuerySyntax querySyntax" size="45"></input>
		</div>
		<hr />
		
		
		<jsp:include page="search_toolbar.jsp?namespace=text&context=true&bibleVersions=true&paging=true&refining=true" />
	</fieldset>
