<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% if(request.getParameter("lang") != null) { %>
		<fmt:setLocale value='<%= request.getParameter("lang") %>' />
<% } else { %> 
		<fmt:setLocale value="en" />
<% } %>
<fmt:setBundle basename="UiBundle" />


<div id="topMenu-ajax" class="ddsmoothmenu" name="top">
<!-- <a id="loginLink" class="login" href="#" onclick="login()">Login</a> -->
<ul>
	<li menu-name="VIEW"><a href="#"><fmt:message key="menu.view" /></a>
	<ul>
		<li><a href="#" name="SINGLE_COLUMN_VIEW" >Single column view</a></li>
		<li><a href="#" name="TWO_COLUMN_VIEW" >Two column view</a></li>

		<li menu-name="SYNC" class="menuSectionStart"><a href="#">Keep both passages in sync</a>
		<ul>
			<li><a href="#" name="NO_SYNC">Switch sync off</a></li>
			<li><a href="#" name="SYNC_LEFT">Sync with Left</a></li>
			<li><a href="#" name="SYNC_RIGHT">Sync with right</a></li>
		</ul>
		
		</li>
		<li><a href="#" name="SWAP_BOTH_PASSAGES">Swap left and right passages</a></li>
	</ul>
	</li>

	<li menu-name="TOOLS"><a href="#"><fmt:message key="menu.tools" /></a>
	<ul>
<!-- 		<li><a href="http://step.tyndalehouse.com/step.zip" target="_blank">Download the Desktop application</a></li> -->
		<li><a href="#" onclick='window.localStorage.clear(); window.location.reload();'>Forget my profile</a></li>
<!-- 		<li><a href="#" class="notYetImplemented">Install Core Bibles [Coming soon]</a></li> -->
<!-- 		<li><a href="#" class="notYetImplemented">Update [Coming soon]</a></li> -->
<!-- 		<li><a href="#" class="notYetImplemented">User preferences [Coming soon]</a></li> -->
	</ul>
	</li>

	
	<li menu-name="HELP"><a href="#"><fmt:message key="menu.help" /></a>
	<ul>
		<li><a href="http://stepweb.atlassian.net/wiki/display/TYNSTEP/STEP+Help+Manual" target="_blank">Online Help manual</a></li>

<!-- 		<li><a href="http://stepweb.atlassian.net/wiki/display/TYNSTEP/STEP+Help+Manual" onclick="">Submit feedback or suggest a feature</a></li> -->
		<li><a href="#" id="provideFeedback">Provide some feedback</a></li>
		<li><a href="#" id="raiseBug" >Raise a bug</a></li>
<!-- 		<li><a href="res/manual.pdf" target="_blank">Offline Help manual</a></li> -->
		<li><a href="#" name="ABOUT">About...</a></li>
	</ul>
	</li>
</ul>
<br style="clear: left" />
</div>