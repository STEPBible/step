<%@page import="com.tyndalehouse.step.core.models.Language" trimDirectiveWhitespaces="true" %>
<%@page import="java.util.List" %>
<%@page import="com.tyndalehouse.step.core.service.LanguageService" %>
<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@page import="java.util.Locale" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale);
%>
<fmt:setBundle basename="HtmlBundle"/>
<div class="headerButtons pull-right">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
    </button>

	<a id="copy-icon" style="padding-left:5px" href="javascript:step.util.copyModal();" title="<fmt:message key="copy_text"/>">
        <i class="glyphicon glyphicon-copy"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;<fmt:message key="copy_text"/></span>
    </a>
	
    <a id="panel-icon" style="padding-left:5px" class="hidden-xs navbarIconDesc" href="javascript:step.util.createNewColumn();" title="<fmt:message key="open_in_new_panel"/>">
        <i class="glyphicon glyphicon-plus"></i><span class="navbarIconDesc hidden-sm">&nbsp;<fmt:message key="new_panel"/></span>
    </a>
    <a id="report-icon" style="padding-left:5px" class="hidden-xs navbarIconDesc" href="html/reports_by_step.html" target="_blank" title="Reports that uses STEP">
        <i class="glyphicon glyphicon-th-list"></i><span class="navbarIconDesc hidden-sm">&nbsp;&nbsp;Reports</span>
    </a>
    <a id="stats-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar('analysis');" title="<fmt:message key="passage_stats"/>">
        <i class="glyphicon glyphicon-stats"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;<fmt:message key="passage_stats"/></span>
    </a>
	<a id="bookmark-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar('history');" title="<fmt:message key="bookmarks_and_recent_texts" />">
        <i class="glyphicon glyphicon-bookmark"></i><span class="hidden-xs navbarIconDesc">&nbsp;<fmt:message key="bookmarks" /></span>
    </a>
    <a id="examples-icon" style="padding-left:5px" href="javascript:step.util.ui.showTutorial();" title="<fmt:message key="welcome_to_step" />">
        <i class="glyphicon glyphicon-question-sign"></i><span class="hidden-xs hidden-sm navbarIconDesc">&nbsp;<fmt:message key="examples" /></span>
    </a>
    <a id="fonts-icon" style="padding-left:5px" class="navbarIconDesc" href="javascript:step.util.showFontSettings();"
        title="<fmt:message key="font_sizes"/>">
        <span class="largerFont" style="color:white;background:#5E5E5E;font-size:22px"><fmt:message key="passage_font_size_symbol"/></span>
        <span class="hidden-xs navbarIconDesc">&nbsp;<fmt:message key="font"/></span>
    </a>
    <span class="navbar-collapse collapse">
        <span class="dropdown">
            <a id="languages-icon" style="padding-left:5px" class="dropdown-toggle" data-toggle="dropdown" title="<fmt:message key="installation_book_language"/>">
                <i class="glyphicon icon-language">
                    <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                </i>
                <span style="vertical-align:bottom" class="navbarIconDesc"><fmt:message key="installation_book_language"/></span>
            <ul id="languageMenu" class="kolumny pull-right dropdown-menu">
                <li><a href="http://crowdin.net/project/step" target="_new"><fmt:message key="translate_step"/></a></li>

                <c:forEach var="language" items="${languages}">
                    <c:set var="machineTranslatedWarning">
                        <c:choose>
                            <c:when test="${not language.complete and not language.partial}"><fmt:message key="machine_translated" /></c:when>
                            <c:when test="${language.partial and not language.complete}"><fmt:message key="partially_translated" /></c:when>
                        </c:choose>
                    </c:set>
                    <li class="${ language.code eq languageCode or languageCode eq 'iw' and language.code eq 'he' or languageCode eq 'in' and language.code eq 'id' ? 'active' : '' }" title="${machineTranslatedWarning}"><a onclick="window.localStorage.clear(); $.cookie('lang', '${language.code}')" lang="${language.code}" href="/?lang=${language.code}${param.debug eq null ? "" : "&debug" }">
                          ${ language.originalLanguageName } - ${ language.userLocaleLanguageName }<c:if test="${not language.complete}">*</c:if>
                    </a></li>
                </c:forEach>
            </ul>
        </span>
        <%
            if (!appManager.isLocal()) {
        %>
        <a style="padding-left:5px" id="raiseSupportTrigger" data-toggle="modal" data-target="#raiseSupport" title="<fmt:message key="help_feedback" />">
            <i class="glyphicon glyphicon-bullhorn"></i><span class="navbarIconDesc">&nbsp;<fmt:message key="help_feedback" /></span>
        </a>
        <%
            }
        %>
        <span class="dropdown">
            <a id="more-icon" style="padding-left:5px" class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" title="<fmt:message key="help"/>">
                <i class="glyphicon glyphicon-option-vertical"></i><span style="vertical-align:bottom;line-height:10px" class="navbarIconDesc"><fmt:message key="more"/></span>
            </a>
            <ul class="dropdown-menu pull-right helpMenu" dir="${ ltr ? "ltr" : "rtl" }">
                <!-- # Download STEP -->
                <%
                    if(!appManager.isLocal()) {
                %>
                <li><a href="/downloads.jsp" title="<fmt:message key="download_desktop_step_about" />"><fmt:message key="download_desktop_step" /></a></li>
                <%
                    }
                %>
                <!-- # Quick tryout links -->
                <li class="quick_tutorial"><a href="javascript:void(0)" name="TUTORIAL"><fmt:message key="quick_tutorial_link"/></a></li>
                <!-- # Video demonstrations -->
                <li><a href="https://www.stepbible.org/videos" target="_blank"><fmt:message key="video_help"/></a></li>
                <!-- # Guide and Instructions -->
                <li><a href="https://stepbibleguide.blogspot.com" target="_blank"><fmt:message key="help_online"/></a></li>
                <!-- # Available Bibles etc -->
                <!-- # - (offline list + Install more) -->
                <%
                    if(appManager.isLocal()) {
                %>
                <li class="available_bibles_and_commentaries"><a href="/versions.jsp" target="_blank" name="AVAILABLE_BIBLES_AND_COMMENTARIES"><fmt:message key="available_versions"/></a></li>
                <li><a href="/setup.jsp"><fmt:message key="tools_settings" /></a></li>
                <%
                    } else {
                %>
                <!-- # - (online to Resources) -->
                <li><a href="https://stepweb.atlassian.net/wiki/display/SUG/Resources" target="_blank"><fmt:message key="available_versions"/></a></li>
                <%
                    }
                %>
                <!-- # Classical UI -->
                <li class="classicalUI"><a href="javascript:void(0)"><fmt:message key="display_classical_ui"/>&nbsp;<span id="classicalUICheck" class="glyphicon glyphicon-check" style="font-size:11px"></span></a></li>
                <!-- # Reset everything -->
                <li class="resetEverything"><a href="javascript:void(0)"><fmt:message key="tools_forget_my_profile"/></a></li>
                <!-- # We need your help! -->
                <li><a href="https://stepbibleguide.blogspot.com/p/volunteers.html" target="_blank"><fmt:message key="we_need_help"/></a></li>
                <!-- # Feedback & contact -->
                <%
                    if (!appManager.isLocal()) {
                %>
                <li><a href="javascript:void(0)" id="provideFeedback"  data-toggle="modal" data-target="#raiseSupport"><fmt:message key="help_feedback"/></a></li>
                <!-- # Privacy policy -->
                <li><a href="/html/cookies_policy.html" target="_blank"><fmt:message key="help_privacy_policy"/></a></li>
                <% } %>
                <!-- # Copyright & licences -->
                <li><a target="_new" href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" name="COPYRIGHT"><fmt:message key="copyright_info_link"/></a></li>
                <!-- # About... -->
                <li class="aboutModalTrigger"><a href="javascript:void(0)" name="ABOUT"><fmt:message key="help_about"/></a></li>
                <!-- # Exit -->
                <%
                    if(appManager.isLocal()) {
                %>
                <li><a href="/shutdown.jsp"><fmt:message key="tools_exit" /></a></li>
                <%
                    }
                %>
            </ul>
        </span>
    </span>
</div>
