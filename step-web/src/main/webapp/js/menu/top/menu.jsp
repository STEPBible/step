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
    <button  class="btn btn-default btn-sm showStats" type="button" title="<fmt:message key="passage_open_sidebar" />">
        <span class="glyphicon glyphicon-save"></span></button>
    <div class="navbar-collapse collapse">
        <span class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)"><span class="caret mini-level"></span><fmt:message
                    key="installation_book_language"/><span class="caret top-level"></span></a> <span class="separator">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
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
            <a class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" href="javascript:void(0)"><span class="caret mini-level"></span><fmt:message key="help"/><span class="caret top-level"></span></a>
            <ul class="dropdown-menu pull-right helpMenu" dir="${ ltr ? "ltr" : "rtl" }">
                if(appManager.isLocal()) {
                <li><a href="/setup.jsp"><fmt:message key="tools_settings" /></a></li>
                }
                <li class="quick_tutorial"><a href="javascript:void(0)" name="TUTORIAL"><fmt:message key="quick_tutorial_link"/></a></li>
                <li class="available_bibles_and_commentaries"><a href="/versions.jsp" target="_blank" name="AVAILABLE_BIBLES_AND_COMMENTARIES"><fmt:message key="available_versions"/></a></li>
                <li><a href="https://stepweb.atlassian.net/wiki/x/AgAW" target="_blank"><fmt:message key="help_online"/></a>
                </li>
                <li><a href="https://stepweb.atlassian.net/wiki/x/iICV" target="_blank"><fmt:message
                    key="we_need_help"/></a>
                <li class="resetEverything"><a href="javascript:void(0)"><fmt:message key="tools_forget_my_profile"/></a>
                </li>
                <%
                    if (!appManager.isLocal()) {
                %>
                <li><a href="javascript:void(0)" id="provideFeedback"  data-toggle="modal" data-target="#raiseSupport"><fmt:message key="help_feedback"/></a></li>
                <li><a href="http://www.tyndale.cam.ac.uk/index.php?page=cookie-policy" target="_blank"><fmt:message
                    key="help_privacy_policy"/></a></li>
                <% } %>
                <li><a target="_new" href="https://stepweb.atlassian.net/wiki/x/C4C_/" name="COPYRIGHT"><fmt:message key="copyright_info_link"/></a></li>
                <li class="aboutModalTrigger"><a href="javascript:void(0)" name="ABOUT"><fmt:message key="help_about"/></a></li>
                if(appManager.isLocal()) {
                <li><a href="/shutdown"><fmt:message key="tools_exit" /></a></li>
                }
            </ul>
        </span>
    </div>
</div>