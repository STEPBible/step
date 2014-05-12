<%@page import="com.tyndalehouse.step.core.models.Language" %>
<%@page import="java.util.List" %>
<%@page import="com.tyndalehouse.step.core.service.LanguageService" %>
<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@page import="java.util.Locale" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
    List<Language> languages = injector.getInstance(LanguageService.class).getAvailableLanguages();
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());

    StringBuilder sb = new StringBuilder(1024);
    for (Language l : languages) {
        sb.append("<li><a onclick='window.localStorage.clear(); $.cookie(\"lang\", \""); 
        sb.append(l.getCode());
        sb.append("\")' lang='");
        sb.append(l.getCode());
        sb.append("' href='./?lang=");
        sb.append(l.getCode());
        
        if(request.getParameter("debug") != null) {
            sb.append("&debug");
        }
        
        sb.append("' >");
        sb.append(l.getOriginalLanguageName());
        sb.append(" - (");
        sb.append(l.getUserLocaleLanguageName());
        sb.append(")");
        sb.append("</a></li>");
    }
%>
<fmt:setBundle basename="HtmlBundle"/>
<div class="pull-right">

    <%--if(appManager.isLocal()) {--%>
    <%--<li><a href="/step-web/config.jsp"><fmt:message key="tools_settings" /></a></li>--%>
    <%--<li><a href="/shutdown"><fmt:message key="tools_exit" /></a></li>--%>
    <%--}--%>

        <button  class="btn btn-default btn-sm showStats" type="button" title="<fmt:message key="passage_open_sidebar" />">
            <span class="glyphicon glyphicon-save"></span></button>
        
        <span class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)"><fmt:message
                key="installation_book_language"/></a> &nbsp;&nbsp;|&nbsp;&nbsp; 
        <ul id="languageMenu" class="kolumny pull-right dropdown-menu">
            <li><a href="http://crowdin.net/project/step" target="_new"><fmt:message key="translate_step"/></a></li>
            <%= sb.toString() %>
        </ul>
    </span>
	<span class="dropdown">
        <a class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" href="javascript:void(0)"><fmt:message key="help"/></a>
        <ul class="dropdown-menu pull-right helpMenu">
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
            <li><a href="javascript:void(0)" id="provideFeedback"><fmt:message key="help_feedback"/></a></li>
            <li><a href="http://www.tyndale.cam.ac.uk/index.php?page=cookie-policy" target="_blank"><fmt:message
                key="help_privacy_policy"/></a></li>
            <% } %>
            <li class="aboutModalTrigger"><a href="javascript:void(0)" name="ABOUT"><fmt:message key="help_about"/></a></li>
        </ul>
    </span>
</div>