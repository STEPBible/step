<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page import="java.util.Locale"%>
<%@page contentType="text/html; charset=UTF-8" language="java" %>
<%@page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@page import="com.google.inject.Injector"%>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
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
	<fieldset name="SEARCH_PASSAGE" id="searchPassage">
		<legend><fmt:message key="search_passage_lookup" /></legend>

		<table class="passageTable">
			<tr>
				<td><fmt:message key="translation_commentary" /></td>
				<td class="noWrapCell"><input type="text" class="passageVersion drop" size="15" /> <a class="infoAboutVersion primaryDarkBold searchPassageButtons" target="_blank" href="version.jsp?version=<%= stepRequest.getThisVersion() %>" title="<fmt:message key="passage_info_about_version" />">&#x24d8;</a></td>
				<td style="padding-left: 10px"><fmt:message key="bible_text" />&nbsp;</td>
				<td class="noWrapCell"><input type="text" class="passageReference drop" size="15" /> <a href="javascript:void(0)" class="searchPassageButtons searchPassage" type="button" title="<fmt:message key="search_search_button" />">&nbsp;</a></td>
			</tr>
			<tr level="1">
				<td><fmt:message key="comparison_versions" /></td>
				<td class="noWrapCell"><input type="text" class="extraVersions drop" size="15" /> <a href='javascript:void(0)' class='resetVersions primaryDarkBold searchPassageButtons' title="<fmt:message key="passage_reset_extra_versions" />">x</a></td>
				<td level="2" style="padding-left: 10px"><fmt:message key="will_be_shown_as" /></td>
				<td level="2"><input type="text" class="extraVersionsDisplayOptions drop" size="15" readonly="true" /> <a href='https://stepweb.atlassian.net/wiki/x/I4CV' target="_new" class='interlinearHelp primaryDarkBold searchPassageButtons'>Interlinear help</a></td>
			</tr>
		</table>
	</fieldset>
</div>