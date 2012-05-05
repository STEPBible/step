<%@ page language="java"  %> 
<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <TITLE>STEP Bible: <%= stepRequest.getReference(0) %> and <%= stepRequest.getReference(1) %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="Scripture Tools for Every Pastor is a Bible study tool, currently showing: <%= stepRequest.getReference(0) %> in the <%= stepRequest.getVersion(0) %> and <%= stepRequest.getReference(1) %> in the <%= stepRequest.getVersion(1) %>">
	<meta name="keywords" content="bible study kjv esv asv scripture tools for every pastor interlinear strong robinson timeline" />
	
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
	<link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.8.19.custom.css" />
	<script src="js_init/initLib.js" type="text/javascript"></script>   
    <script src="libs/timeline_js/timeline-api.js" type="text/javascript"></script>
    <script src="libs/jquery-1.7.2.min.js" type="text/javascript"></script>
    <script src="libs/jquery-ui-1.8.19.custom.min.js" type="text/javascript"></script>
	
	<%
		if(request.getParameter("debug") != null) {
	%>
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu-v.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-layout.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />
	    <link rel="stylesheet" type="text/css" href="css/passage.css" />
	
	    <script src="js/jquery_cookie.js" type="text/javascript"></script>
		<script src="js/jquery-shout.js" type="text/javascript"></script>
		<script src="js/ddsmoothmenu.js" type="text/javascript"></script>
	    <script src="js/util.js" type="text/javascript"></script>
	    <script src="js/passage.js" type="text/javascript"></script>
	    <script src="js/bookmark.js" type="text/javascript"></script>
	    <script src="js/lexicon_definition.js" type="text/javascript"></script>
	    <script src="js/ui_hooks.js" type="text/javascript"></script>
	    <script src="js/timeline.js" type="text/javascript"></script>
	    <script src="js/geography.js" type="text/javascript"></script>
	    <script src="js/top_menu.js" type="text/javascript"></script>
	    <script src="js/toolbar_menu.js" type="text/javascript"></script>
	    <script src="js/interlinear_popup.js" type="text/javascript"></script>
	    <script src="js/login.js" type="text/javascript"></script>
		<script src="js/title.js" type="text/javascript"></script>
	    <script src="js/init.js" type="text/javascript"></script>
	<%
		} else {
	%>
	    <link rel="stylesheet" type="text/css" href="css/step.min.css" />
		<script src="js/step.min.js" type="text/javascript" ></script>
	<%
	}
	%>
</HEAD>
<body>
<div id="topMenu" class="ddsmoothmenu"><jsp:include page="topmenu.html" /></div>
<div style="height: 100%">
	<div id="middleSection">
		<div class="column leftColumn">
			<div class="passageContainer">
				<div id="leftPaneMenu" class="innerMenus"><jsp:include page="panemenu.html" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
						<a class="bookmarkPassageLink passageButtons">Add a bookmark</a>
						<a class="nextChapter passageButtons">Next chapter</a>
						<a class="previousChapter passageButtons">Previous chapter</a>
				    	<input id="leftPassageReference" class="heading editable passageReference" size="30" 
				    		value="<%= stepRequest.getReference(0) %>" />
				    	<input id="leftPassageBook" class="heading editable passageVersion" size="5" 
				    		value="<%= stepRequest.getVersion(0) %>" />
			    	</div>
			    	<div class="passageContent"><%= stepRequest.getPassage(0) %></div>
			    </div>
			</div>
		</div>
		
		<div class="bookmarks" id="centerPane">
			<div class="northBookmark">
				<img id="topLogo" src="images/step-logo.png" alt="STEP :: Scripture Tools for Every Pastor" />
			</div>
			<div id="bookmarkPane" class="bookmarkPane ui-corner-all">
				<h3 class="ui-helper-reset ui-state-default ui-corner-all">
					<span class="leftBookmarkArrow ui-icon ui-icon-triangle-1-e"></span>Recent Texts
				</h3>
				<div id="historyDisplayPane" class="bookmarkContents"><br /></div>
				<h3 id="bookmarkHeader" class="ui-helper-reset ui-state-default ui-corner-all">
					<span class="leftBookmarkArrow ui-icon ui-icon-triangle-1-e"></span>Bookmarks
				</h3>
				<div id="bookmarkDisplayPane" class="bookmarkContents"><br /></div>
			</div>
			<div class="logo">
				<span class="copyright">&copy; Tyndale House</span>
			</div>
		</div>
			
			
		<div class="column rightColumn">
			<div class="passageContainer">
				<div id="rightPaneMenu" class="innerMenus"><jsp:include page="panemenu.html" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
						<a class="bookmarkPassageLink passageButtons">Add a bookmark</a>
						<a class="nextChapter passageButtons">Next chapter</a>
						<a class="previousChapter passageButtons">Previous chapter</a>
				    	<input id="rightPassageReference" class="heading editable passageReference" size="30" 
				    		value="<%= stepRequest.getReference(1) %>" />
				    	<input id="rightPassageBook" class="heading editable passageVersion" size="5" 
				    		value="<%= stepRequest.getVersion(1) %>" />
			    	</div>
			    	<div class="passageContent"><%= stepRequest.getPassage(1) %></div>
				</div>
			</div>
		</div>
	</div>
	
	<div id="bottomSection" class="bottomModule timeline">
		<div id="bottomModuleHeader" >
			<span class="timelineContext" style="padding-right: 10px"></span>
			<span class="timelineContext" style="float: right;" onclick="hideBottomSection();">Close</span>
		</div>
		<div id="bottomSectionContent" style="clear: both;">	
			No modules have yet been loaded.
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
<div id="error" style="display: none">A placeholder for error messages</div>

<!--  The about popup -->

<div id="about">
	<img id="aboutLogo" src="images/step-logo.png" />
	<h3 id="aboutTitle">STEP :: Scripture Tools for Every Pastor</h3>
	<p>&copy; Tyndale House 2011</p>
</div>

<div id="login">
	<div id="loginPopup">
		<label for="emailAddress">Email address:</label><input id="emailAddress" type="text" size="20" /><br />
		<label for="password">Password:</label><input id="password" type="password" size="20" /><br />
	</div>
	<div id="registerPopup">
		<label for="name">Your name</label><input id="name" type="text" size="20" /><br />
		<label for="country">Country</label><input id="country" type="text" size="20" /><br />
	</div>
</div>

<div id="goToDate" style="display: none">
	Please enter a year: <input type="text" id="scrollToYear" />
</div>

<div id="previewReference" style="display: none"><div id="previewBar" style="display: none;">
	<a href="#" id="previewClose">Close this popup</a>
	<a href="#" id="previewRight">See passage on the right pane</a>
	<a href="#" id="previewLeft">See passage on the left pane</a>
</div><span id="popupText"></span></div>

</body>

</HTML>
