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

    <a class="showStats" title="<fmt:message key="passage_open_sidebar" />">
        <i class="glyphicon icon-sidebar">
            <svg width="22px" height="16px" viewBox="0 0 58 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g>
                    <path d="M0,6.00638655 C0,2.68915086 2.68113741,0 6.00212389,0 L51.9978761,0 C55.3127576,0 58,2.68354127 58,6.00638655 L58,41.9936134 C58,45.3108491 55.3188626,48 51.9978761,48 L6.00212389,48 C2.6872424,48 0,45.3164587 0,41.9936134 L0,6.00638655 Z M5,6.00638655 L5,41.9936134 C5,42.5531699 5.44680121,43 6.00212389,43 L51.9978761,43 C52.5537478,43 53,42.5531169 53,41.9936134 L53,6.00638655 C53,5.44683008 52.5531988,5 51.9978761,5 L6.00212389,5 C5.44625218,5 5,5.44688308 5,6.00638655 Z M33,5 L33,43 L37,43 L37,5 L33,5 Z"></path>
                    <g transform="translate(39.000000, 11.000000)">
                        <polygon points="0.5 4 11.5 4 11.5 0 0.5 0"></polygon>
                        <polygon points="0.5 15 11.5 15 11.5 11 0.5 11"></polygon>
                        <polygon points="0.5 26 11.5 26 11.5 22 0.5 22"></polygon>
                    </g>
                </g>
            </svg>
        </i>
    </a>
    <div class="navbar-collapse collapse">
        <span class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" title="<fmt:message key="installation_book_language"/>">
                <i class="glyphicon icon-language">
                    <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                </i>
                <span><fmt:message key="installation_book_language"/></span>
            <ul id="languageMenu" class="kolumny pull-right dropdown-menu">
                <li><a href="http://crowdin.net/project/step" target="_new"><fmt:message key="translate_step"/></a></li>

                <c:forEach var="language" items="${languages}">
                    <c:set var="machineTranslatedWarning">
                        <c:choose>
                            <c:when test="${not language.complete and not language.partial}"><fmt:message key="machine_translated" /></c:when>
                            <c:when test="${language.partial and not language.complete}"><fmt:message key="partially_translated" /></c:when>
                        </c:choose>
                    </c:set>
                    <li class="${ language.code eq languageCode or languageCode eq 'iw' and language.code eq 'he' or languageCode eq 'in' and language.code eq 'id' ? 'active' : '' }" title="${machineTranslatedWarning}"><a onclick="window.localStorage.clear(); $.cookie('lang', '${language.code}')" lang="${language.code}" href="./?lang=${language.code}${param.debug eq null ? "" : "&debug" }">
                          ${ language.originalLanguageName } - ${ language.userLocaleLanguageName }<c:if test="${not language.complete}">*</c:if>
                    </a></li>
                </c:forEach>
            </ul>
        </span>
        <%
            if (!appManager.isLocal()) {
        %>
        <a id="raiseSupportTrigger" data-toggle="modal" data-target="#raiseSupport" title="<fmt:message key="help_feedback" />">
            <i class="glyphicon glyphicon-bullhorn"></i>
        </a>
        <%
            }
        %>
        <span class="dropdown">
            <a class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" title="<fmt:message key="help"/>">
                <i class="glyphicon glyphicon-option-vertical"></i>
                <span><fmt:message key="help"/></span>
            </a>
            <ul class="dropdown-menu pull-right helpMenu" dir="${ ltr ? "ltr" : "rtl" }">
                <!-- # Download STEP -->
                <%
                    if(!appManager.isLocal()) {
                %>
                <li><a href="/downloads.jsp" title="<fmt:message key="download_desktop_step_about" />"><fmt:message key="download_desktop_step" /><span class="new-notice"><fmt:message key="new_functionality" /></span></a></li>
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
                <!-- # Reset everything -->
                <li class="resetEverything"><a href="javascript:void(0)"><fmt:message key="tools_forget_my_profile"/></a></li>
                <!-- # We need your help! -->
                <li><a href="https://stepweb.atlassian.net/wiki/x/iICV" target="_blank"><fmt:message key="we_need_help"/></a></li>
                <!-- # Feedback & contact -->
                <%
                    if (!appManager.isLocal()) {
                %>
                <li><a href="javascript:void(0)" id="provideFeedback"  data-toggle="modal" data-target="#raiseSupport"><fmt:message key="help_feedback"/></a></li>
                <!-- # Privacy policy -->
                <li><a href="https://academic.tyndalehouse.com/privacy-policy" target="_blank"><fmt:message key="help_privacy_policy"/></a></li>
                <% } %>
                <!-- # Copyright & licences -->
                <li><a target="_new" href="https://stepweb.atlassian.net/wiki/x/C4C_/" name="COPYRIGHT"><fmt:message key="copyright_info_link"/></a></li>
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
    </div>
</div>
