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
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle"/>
<div class="headerButtons pull-right">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
    </button>
    <%--<button  class="btn btn-default btn-sm showBooks" type="button" title="<fmt:message key="see_books" />">--%>
        <%--<span class="glyphicon glyphicon-book"></span></button>--%>

    <a class="showStats" title="<fmt:message key="passage_open_sidebar" />">
        <i class="glyphicon glyphicon-info-sign"></i>
    </a>
    <div class="navbar-collapse collapse">
        <span class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" title="<fmt:message key="installation_book_language"/>">
                <i class="glyphicon glyphicon-globe" ></i>
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
        <span class="dropdown">
            <a class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" title="<fmt:message key="help"/>">
                <i class="glyphicon glyphicon-question-sign"></i>
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
                <li><a href="https://stepweb.atlassian.net/wiki/display/SUG/Quick+overview" target="_blank"><fmt:message key="help_online"/></a></li>
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
                <li><a href="http://www.tyndale.cam.ac.uk/index.php?page=cookie-policy" target="_blank"><fmt:message key="help_privacy_policy"/></a></li>
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