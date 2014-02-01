<%@page import="com.tyndalehouse.step.core.models.Language"%>
<%@page import="java.util.List"%>
<%@page import="com.tyndalehouse.step.core.service.LanguageService"%>
<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
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
	for(Language l : languages) {
		sb.append("<li><a lang='");
		sb.append(l.getCode());
		sb.append("' href='./?lang=");
		sb.append(l.getCode());
	    sb.append("' >");
		sb.append(l.getOriginalLanguageName());
		sb.append(" - (");
		sb.append(l.getUserLocaleLanguageName());
		sb.append(")");
		sb.append("</a></li>");
	}
%>
<fmt:setBundle basename="HtmlBundle" />
<div class="pull-right">
    
<!-- <a id="loginLink" class="login" href="javascript:void(0)" onclick="login()">Login</a> -->
<%--<ul class="nav navbar-nav">--%>
	<%--<li menu-name="VIEW" class="dropdown">--%>
        <%--<a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)"><fmt:message key="view" /><b class="caret"></b></a>--%>
	    <%--<ul class="dropdown-menu">--%>
            <!--<li><a href="javascript:void(0)" name="SYNC_LEFT"><fmt:message key="view_sync_with_left" /></a></li>-->
            <!--<li><a href="javascript:void(0)" name="SYNC_RIGHT"><fmt:message key="view_sync_with_right" /></a></li>-->
            <%--<li><a href="javascript:void(0)" name="NO_SYNC"><fmt:message key="view_switch_sync_off" /></a></li>--%>
            <%--<%--%>
                <%--if(appManager.isLocal()) {--%>
            <%--%>--%>
            <%--<li class="divider"></li>--%>
            <%--<li><a href="/step-web/config.jsp"><fmt:message key="tools_settings" /></a></li>--%>
            <%--<li><a href="/shutdown"><fmt:message key="tools_exit" /></a></li>--%>
            <%--<%--%>
                <%--}--%>
            <%--%>--%>
        <%--</ul>--%>
	<%--</li>--%>
    <span class="dropdown clearfix">
        <a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)" ><fmt:message key="installation_book_language" /></a>
        <ul id="languageMenu" class="kolumny pull-right dropdown-menu">
            <li><a href="http://crowdin.net/project/step" target="_new"><fmt:message key="translate_step" /></a></li>
                    <%= sb.toString() %>
        </ul>
    </span>
	<span class="dropdown clearfix">
        <a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)"><fmt:message key="help" /></a>
        <ul class="dropdown-menu pull-right">
            <li><a href="https://stepweb.atlassian.net/wiki/x/AgAW" target="_blank"><fmt:message key="help_online" /></a></li>
            <li><a href="https://stepweb.atlassian.net/wiki/x/iICV" target="_blank"><fmt:message key="we_need_help" /></a>
            <li><a href="javascript:void(0)" onclick='forgetProfile()'><fmt:message key="tools_forget_my_profile" /></a></li>
            <%
                if(!appManager.isLocal()) {
            %>
                <li><a href="javascript:void(0)" id="provideFeedback"><fmt:message key="help_feedback" /></a></li>
                <li><a href="http://www.tyndale.cam.ac.uk/index.php?page=cookie-policy" target="_blank"><fmt:message key="help_privacy_policy" /></a></li>
            <%  } %>
            <li><a href="javascript:void(0)" name="DISPLAY_TOOLTIPS"><fmt:message key="help_display_tooltips" /></a></li>
            <li><a href="javascript:void(0)" name="ABOUT"><fmt:message key="help_about" /></a></li>
        </ul>
	<%--</li>--%>
    </span>
<%--<br style="clear: left" />--%>
</div>