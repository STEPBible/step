<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% if(request.getParameter("lang") != null) { %>
		<fmt:setLocale value='<%= request.getParameter("lang") %>' />
<% } else { %> 
		<fmt:setLocale value="en" />
<% } %>
<fmt:setBundle basename="MenuBundle" />


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
	</ul>
	</li>

	<li menu-name="TOOLS"><a href="#"><fmt:message key="tools" /></a>
	<ul>
<!-- 		<li><a href="http://step.tyndalehouse.com/step.zip" target="_blank"><fmt:message key="tools_download_desktop_application" /></a></li> -->
		<li><a href="#" onclick='window.localStorage.clear(); window.location.reload();'><fmt:message key="tools_forget_my_profile" /></a></li>
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