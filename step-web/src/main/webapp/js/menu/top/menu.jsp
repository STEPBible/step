<%@page import="com.tyndalehouse.step.core.models.Language"%>
<%@page import="java.util.List"%>
<%@page import="com.tyndalehouse.step.core.service.LanguageService"%>
<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	List<Language> languages = injector.getInstance(LanguageService.class).getAvailableLanguages();
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	
	StringBuilder sb = new StringBuilder(1024);
	for(Language l : languages) {
		sb.append("<a lang='");
		sb.append(l.getCode());
		sb.append("' href='./?lang=");
		sb.append(l.getCode());
	    sb.append("' >");
		sb.append(l.getOriginalLanguageName());
		sb.append(" - (");
		sb.append(l.getUserLocaleLanguageName());
		sb.append(")");
		sb.append("</a>");
	}
%>
<fmt:setBundle basename="HtmlBundle" />


<div id="topMenu-ajax" class="ddsmoothmenu" name="top">
<!-- <a id="loginLink" class="login" href="#" onclick="login()">Login</a> -->
<ul>
	<li menu-name="VIEW"><a href="#"><fmt:message key="view" /></a>
	<ul>
		<li><a href="#" name="SINGLE_COLUMN_VIEW" ><fmt:message key="view_single_column" /></a></li>
		<li><a href="#" name="TWO_COLUMN_VIEW" ><fmt:message key="view_two_columns" /></a></li>

		<li menu-name="SYNC" class="menuSectionStart"><a href="#"><fmt:message key="view_both_passages_sync" /></a>
			<ul>
				<li><a href="#" name="NO_SYNC"><fmt:message key="view_switch_sync_off" /></a></li>
				<li><a href="#" name="SYNC_LEFT"><fmt:message key="view_sync_with_left" /></a></li>
				<li><a href="#" name="SYNC_RIGHT"><fmt:message key="view_sync_with_right" /></a></li>
			</ul>		
		</li>
		<li><a href="#" name="SWAP_BOTH_PASSAGES"><fmt:message key="view_swap_left_and_right" /></a></li>
		<li>
			<a href="#"><fmt:message key="installation_book_language" /></a>
			<ul>
				<%= sb.toString() %>
			</ul>
		</li>
	</ul>
	</li>

	<li menu-name="TOOLS"><a href="#"><fmt:message key="tools" /></a>
	<ul>
<!-- 		<li><a href="http://step.tyndalehouse.com/step.zip" target="_blank"><fmt:message key="tools_download_desktop_application" /></a></li> -->
			<li><a href="#" onclick='forgetProfile()'><fmt:message key="tools_forget_my_profile" /></a></li>

<!-- 		<li><a href="#" class="notYetImplemented">Install Core Bibles [Coming soon]</a></li> -->
<!-- 		<li><a href="#" class="notYetImplemented">Update [Coming soon]</a></li> -->
<!-- 		<li><a href="#" class="notYetImplemented">User preferences [Coming soon]</a></li> -->
	</ul>
	</li>

	
	<li menu-name="HELP"><a href="#"><fmt:message key="help" /></a>
	<ul>
		<li><a href="http://stepweb.atlassian.net/wiki/display/TYNSTEP/STEP+Help+Manual" target="_blank"><fmt:message key="help_online" /></a></li>
		<li><a href="#" id="provideFeedback"><fmt:message key="help_feedback" /></a></li>
		<li><a href="#" id="raiseBug" ><fmt:message key="help_raise_a_bug" /></a></li>
		<li><a href="#" name="ABOUT"><fmt:message key="help_about" /></a></li>
	</ul>
	</li>
</ul>
<br style="clear: left" />
</div>