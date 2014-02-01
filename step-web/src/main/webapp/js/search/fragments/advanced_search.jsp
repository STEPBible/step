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
<div class="advancedSearch" >
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
		
        <div>
            <div class="row">
                <div class="col-sm-3 col-xs-6">
                    <fmt:message key="translation_commentary" />
                </div>
                <div class="col-sm-3 col-xs-6">
                    <div class="input-group">
                        <input type="text" class="drop btn form-control" />
                        <select class="multiselect versionsList" multiple="multiple" >
                        </select>
                    </div>
                </div>
                <div class="col-sm-3 col-xs-6">
                    <fmt:message key="bible_text" />
                </div>
                <div class="col-sm-3 col-xs-6">
                    <input type="text" class="passageReference drop" size="15" /> <a href="javascript:void(0)" class="searchPassageButtons searchPassage" type="button" title="<fmt:message key="search_search_button" />">&nbsp;</a>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-3 col-xs-6" level="1">
                    <fmt:message key="comparison_versions" />
                </div>
                <div class="col-sm-3 col-xs-6">
                    <input type="text" class="extraVersions drop" size="15" /> <a href='javascript:void(0)' class='resetVersions primaryDarkBold searchPassageButtons' title="<fmt:message key="passage_reset_extra_versions" />">x</a>
                </div>
                <div class="col-sm-3 col-xs-6" level="1">
                    <fmt:message key="will_be_shown_as" />
                </div>
                <div class="col-sm-3 col-xs-6">
                    <input type="text" class="extraVersionsDisplayOptions drop" size="15" readonly="true" /> <a href='https://stepweb.atlassian.net/wiki/x/I4CV' target="_new" class='interlinearHelp primaryDarkBold searchPassageButtons'>Interlinear help</a>
                </div>
            </div>
        </div>
        <%--<table class="table passageTable">--%>
			<%--<tr>--%>
				<%--<td></td>--%>
				<%--<td class="noWrapCell"></td>--%>
				<%--<td style="padding-left: 10px">&nbsp;</td>--%>
				<%--<td class="noWrapCell"></td>--%>
			<%--</tr>--%>
			<%--<tr level="1">--%>
				<%--<td></td>--%>
				<%--<td class="noWrapCell"></td>--%>
				<%--<td level="2" style="padding-left: 10px"><fmt:message key="will_be_shown_as" /></td>--%>
				<%--<td level="2"><input type="text" class="extraVersionsDisplayOptions drop" size="15" readonly="true" /> <a href='https://stepweb.atlassian.net/wiki/x/I4CV' target="_new" class='interlinearHelp primaryDarkBold searchPassageButtons'>Interlinear help</a></td>--%>
			<%--</tr>--%>
		<%--</table>--%>
            <%--</div>--%>
	</fieldset>
</div>