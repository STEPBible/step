<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>

    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Pastor</TITLE>

    <link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.8.5.custom.css" />
    <link rel="stylesheet" type="text/css" href="css/initial-layout.css" />
    <link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />
    <link rel="stylesheet" type="text/css" href="css/passage.css" />

	<link rel="stylesheet" type="text/css" href="libs/menu/ddsmoothmenu.css" />
	<link rel="stylesheet" type="text/css" href="libs/menu/ddsmoothmenu-v.css" />

	<script src="js/initLib.js"></script>   
    <script src="libs/timeline_js/timeline-api.js?bundle=true" type="text/javascript"></script>
    <script src="libs/jquery-1.4.2.min.js" type="text/javascript"></script>
    <script src="libs/jquery-ui-1.8.5.custom.min.js" type="text/javascript"></script>
    <script src="libs/jquery-shout.js" type="text/javascript"></script>
	<script src="libs/menu/ddsmoothmenu.js" type="text/javascript"></script>
    <script src="libs/cookies/jquery_cookie.js" type="text/javascript"></script>
    
    <script src="js/util.js" type="text/javascript"></script>
    <script src="js/passage.js" type="text/javascript"></script>
    <script src="js/bookmark.js" type="text/javascript"></script>
    <script src="js/lexicon_definition.js" type="text/javascript"></script>
    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/timeline.js" type="text/javascript"></script>
    <script src="js/toolbar_menu.js" type="text/javascript"></script>
    <script src="js/interlinear_popup.js" type="text/javascript"></script>
    <script src="js/login.js" type="text/javascript"></script>
    <script src="js/init.js" type="text/javascript"></script>
    
</HEAD>
<body>

<div id="topMenu" class="ddsmoothmenu">
</div>
<div class="column">
	<div class="passageContainer">
		<div id="leftPaneMenu" class="innerMenus"></div>
	    <div class="passageText ui-widget">
	    	<div class="headingContainer">
		    	<input id="leftPassageReference" class="heading editable passageReference" size="30" value="Rom 1:1-7" />
		    	<input id="leftPassageBook" class="heading editable passageVersion" size="5" value="KJV" />
	    	</div>
	    	<div class="passageContent"></div>
	    </div>
	</div>
</div>
	
<div class="bookmarks" id="centerPane">
	<div class="northBookmark">
		<img id="topLogo" src="images/step-logo.png" alt="STEP :: Scripture Tools for Every Pastor" />
	</div>
	<div id="bookmarkPane" class="bookmarkPane ui-corner-all">
		<h3 class="ui-helper-reset ui-state-default ui-corner-all">
			<span class="leftBookmarkArrow ui-icon ui-icon-triangle-1-e"></span>History
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
	
	
<div class="column">
	<div class="passageContainer">
		<div id="rightPaneMenu" class="innerMenus"></div>
	    <div class="passageText ui-widget">
	    	<div class="headingContainer">
		    	<input id="leftPassageReference" class="heading editable passageReference" size="30" value="Jhn 1:1" />
		    	<input id="leftPassageBook" class="heading editable passageVersion" size="5" value="ESV" />
	    	</div>
	    	<div class="passageContent"></div>
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



<!--<div id="bottomSection" class="timeline">No modules have yet been loaded.</div>-->
<!---->
<!--<div id="loading"><img alt="Loading..." src="images/wait16.gif" />Loading...</div>-->
<div id="error">A placeholder for error messages</div>

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
		<label for="name">Your name</label><input id="emailAddress" type="text" size="20" /><br />
		<label for="country">Country</label><input id="password" type="password" size="20" /><br />
	</div>
</div>

</body>

</HTML>
