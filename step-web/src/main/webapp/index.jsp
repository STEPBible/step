<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>


<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle" />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <TITLE><%= stepRequest.getVersion(0) %> <%= stepRequest.getReference(0) %>: <%= stepRequest.getTitle() %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<%-- 	<meta name="description" content="<%= stepRequest.getTitle() %>..."> --%>
	
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
	
	<%
		if(request.getParameter("lang") == null) {
	%>
		<script src="international/interactive.js" type="text/javascript"></script>
	<% } else { %>
		<script src="international/interactive.js?lang=<%= request.getParameter("lang") %>" type="text/javascript"></script>
	<% } %>

	<%
		if(request.getParameter("debug") != null) {
	%>

		<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.10.2.custom.min.css" />
		<link rel="stylesheet" type="text/css" href="css/qtip.css" />
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu-v.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-layout.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />
	    <link rel="stylesheet" type="text/css" href="css/passage.css" />
<!-- 	    <link rel="stylesheet" type="text/css" href="css/timeline.css" /> -->
	    <link rel="stylesheet" type="text/css" href="css/search.css" />
	    <link rel="stylesheet" type="text/css" href="css/cardo.css" />
		
		<script src="js_init/initLib.js" type="text/javascript"></script>   
	    <script src="libs/dohighlight-min.js" type="text/javascript"></script>
<!-- 	    <script src="libs/timeline_js/timeline-api.js" type="text/javascript"></script> -->
	    <script src="libs/jquery-1.9.1.min.js" type="text/javascript"></script>
		<script src="libs/jquery-ui-1.10.2.custom.min.js" type="text/javascript"></script>
		<script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
<!-- 		<script src="libs/jquery.tagcloud.js" type="text/javascript"></script> -->
<!-- 		<script src="libs/jquery-ui-1.9-beta.min.js" type="text/javascript"></script> -->
	    <script src="js/jquery-extensions/jquery-qtip.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-hover-intent.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-cookie.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-local-store.js" type="text/javascript"></script>
		<script src="js/jquery-extensions/jquery-shout.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-versions-complete.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-lexical-complete.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-detail-slider.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-passage-buttons.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-original-word-toolbar.js" type="text/javascript"></script>
	    <script src="js/jquery-extensions/jquery-search-result.js" type="text/javascript"></script>
		<script src="js/ddsmoothmenu.js" type="text/javascript"></script>
	    <script src="js/util.js" type="text/javascript"></script>
	    <script src="js/lexicon_definition.js" type="text/javascript"></script>
	    <script src="js/ui_hooks.js" type="text/javascript"></script>
<!-- 	    <script src="js/timeline.js" type="text/javascript"></script> -->
<!-- 	    <script src="js/geography.js" type="text/javascript"></script> -->
	    <script src="js/toolbar_menu.js" type="text/javascript"></script>
		<script src="js/defaults/step.defaults.js" type="text/javascript"></script>
		<script src="js/search/step.search.js" type="text/javascript"></script>
		<script src="js/search/step.search.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.quick.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.original.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.simpletext.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.textual.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.timeline.ui.js" type="text/javascript"></script>
		<script src="js/search/step.search.subject.ui.js" type="text/javascript"></script>
<!-- 		<script src="js/search/step.search.personalnotes.ui.js" type="text/javascript"></script> -->
		<script src="js/navigation/step.navigation.js" type="text/javascript"></script>	    


		<script src="js/state/step.state.js" type="text/javascript"></script>
		<script src="js/state/step.state.browser.js" type="text/javascript"></script>
		<script src="js/state/step.state.view.js" type="text/javascript"></script>
		<script src="js/state/step.state.passage.js" type="text/javascript"></script>
		<script src="js/state/step.state.original.js" type="text/javascript"></script>

	    <script src="js/menu/step.menu.js" type="text/javascript"></script>
	    <script src="js/menu/top/help.js" type="text/javascript"></script>
	    <script src="js/menu/top/view.js" type="text/javascript"></script>
	    <script src="js/menu/top/top.menu.ui.js" type="text/javascript"></script>
	    <script src="js/menu/passage/context.js" type="text/javascript"></script>
	    <script src="js/menu/passage/display.js" type="text/javascript"></script>
	    <script src="js/menu/passage/passageTools.js" type="text/javascript"></script>
	    <script src="js/menu/passage/search.js" type="text/javascript"></script>

	    <script src="js/passage/step.version.js" type="text/javascript"></script>

	    <script src="js/passage/step.alternatives.js" type="text/javascript"></script>
	    <script src="js/passage/step.passage.js" type="text/javascript"></script>
	    <script src="js/passage/step.passage.ui.js" type="text/javascript"></script>
	    <script src="js/passage/step.passage.navigation.js" type="text/javascript"></script>
	    <script src="js/passage/step.passage.navigation.ui.js" type="text/javascript"></script>
	    <script src="js/bookmark/step.bookmark.js" type="text/javascript"></script>
	    <script src="js/bookmark/step.bookmark.ui.js" type="text/javascript"></script>
	    <script src="js/init.js" type="text/javascript"></script>
	<%
		} else {
	%>
	    <link rel="stylesheet" type="text/css" href="css/step.min.css" />
		<script src="js/step.min.js" type="text/javascript" ></script>
		
		<script type="text/javascript">
		  var _gaq = _gaq || [];
		  _gaq.push(['_setAccount', 'UA-36285759-1']);
		  _gaq.push(['_trackPageview']);
		
		  (function() {
		    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		  })();
		</script>
	<%
	}
	%>
</HEAD>
<body>
<div id="topMenu" class="ddsmoothmenu"><jsp:include page="js/menu/top/menu.jsp" /></div>
<div>
	<div id="middleSection">
		<div class="column leftColumn">
			<div class="passageContainer" passage-id=0>
				<div id="leftPaneMenu" class="innerMenus"><jsp:include page="js/menu/passage/menu.jsp" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
			    		<jsp:include page="js/search/advanced_search.jsp?passageId=0" />
						<jsp:include page="js/search/passage_toolbar.jsp?passageId=0" />
			    	</div>
			    	<div class="passageContent">&nbsp;<%= stepRequest.getPassage(0) %></div>
			    </div>
			</div>
		</div>
		<div id="holdingPage">
			<h1>STEP<br /> <em>S</em>cripture <em>T</em>ools for <em>E</em>very <em>P</em>erson</h1>
			<img src="images/step-logo-big.png" title="STEP" /><br />
			<em><fmt:message key="step_tag_line" /></em><br /><br />
			
			<table>
				<tr>
					<td><a target="_new" href="https://stepweb.atlassian.net/wiki/display/SUG/STEP+User+Guide" title="<fmt:message key="quick_tutorial" />"/><fmt:message key="help_manual" /></a></td>
					<td><a target="_new" href="versions.jsp" title="<fmt:message key="detailed_help_manual" />"/><fmt:message key="available_versions" /></a></td>
				</tr>
				<tr>
					<td><a target="_new" href="http://www.tyndale.cam.ac.uk/index.php?mact=News,cntnt01,detail,0&cntnt01articleid=28&cntnt01returnid=15" title="<fmt:message key="find_out_more_about_step" />"><fmt:message key="about_step_project" /></a></td>
					<td><a target="_new" href="http://www.facebook.com/pages/STEP-Development-Scripture-Tools-from-Tyndale-House-Cambridge/218909814807605?sk=app_208195102528120" title="<fmt:message key="support_the_project"/>" /><fmt:message key="volunteers_required" /></a></td>
				</tr>
			</table>
			<br />
			<a target="_new" href="http://www.tyndale.cam.ac.uk" style="color: #991c32">Tyndale House<br />Cambridge</a> 
			<br />
			&copy; <%= java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)  %>
		</div>
		
		<jsp:include page="js/bookmark/bookmark.jsp"></jsp:include>
			
		<div class="column rightColumn">
			<div class="passageContainer" passage-id=1>
				<div id="rightPaneMenu" class="innerMenus"><jsp:include page="js/menu/passage/menu.jsp" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
			    		<jsp:include page="js/search/advanced_search.jsp?passageId=1" />
			    		<jsp:include page="js/search/passage_toolbar.jsp?passageId=1" />
			    	</div>
			    	<div class="passageContent">&nbsp;<%= stepRequest.getPassage(1) %></div>
				</div>
			</div>
		</div>
	</div>
	
	<div id="bottomSection" class="bottomModule timeline">
		<div id="bottomModuleHeader" >
			<span class="timelineContext" style="padding-right: 10px"></span>
			<span class="timelineContext" style="float: right;" onclick="step.navigation.hideBottomSection();"><fmt:message key="close" /></span>
		</div>
		<div id="bottomSectionContent" style="clear: both;">	
			<fmt:message key="no_modules_loaded_yet" />
		</div>
	</div>
</div>

<div class="interlinearPopup">
	<input type="text" class="interlinearVersions"/>
	<div class="interlinearChoices"></div>
</div>
<div class="interlinearPopup">
	<input type="text" class="interlinearVersions"/>
	<div class="interlinearChoices"></div>
</div>


<!--<div id="loading"><img alt="Loading..." src="images/wait16.gif" />Loading...</div>-->
<div id="error" class="ui-state-error" style="display: none">
	<span id="closeError"></span>
	<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
	<span id="errorText"><fmt:message key="error_message_holder" /></span>
</div>

<!--  The about popup -->

<div id="about">
	<img id="aboutLogo" src="images/step-logo.png" />
	<h3 id="aboutTitle">STEP :: Scripture Tools for Every Person</h3>
	<p>&copy; Tyndale House, Cambridge&copy; <%= java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)  %></p>
</div>

<%-- <jsp:include page="jsps/login.jsp"></jsp:include> --%>

<div id="goToDate" style="display: none">
	<fmt:message key="please_enter_year" /> <input type="text" id="scrollToYear" />
</div>

<!--  The popup that can have lots of helpful information -->
<jsp:include page="jsps/lexicon_definition.jsp"  />
<img src="images/wait_big.gif" id="waiting" />
<div id="previewReference" style="display: none"><div id="previewBar" style="display: none;">
	<a href="#" id="previewClose"><fmt:message key="close_this_popup" /></a>
	<a href="#" id="previewRight"><fmt:message key="see_passage_on_right_pane" /></a>
	<a href="#" id="previewLeft"><fmt:message key="see_passage_on_left_pane" /></a>
</div><span id="popupText"></span></div>

<div id="validUser" style="display: none">
	<div id="validUserQuestion">
		<fmt:message key="register_tag_line" /><p />
		<table>
			<tr><td><fmt:message key="register_name" /></td><td><input type="text" id='userName' />*</td></tr>
			<tr><td><fmt:message key="register_email" /></td><td><input type="text" id='userEmail' />*</td></tr>
		</table>
		<div style="display: none" id="validationMessage"></div>
	</div>
</div>
<div id='stepInDevelopmentWarning' class="ui-state-highlight"><fmt:message key="step_disclaimer" /></div>
</body>

</HTML>
