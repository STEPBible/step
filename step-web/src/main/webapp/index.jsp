<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>

    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Pastor</TITLE>

    <link rel="stylesheet" type="text/css" href="css/ui-layout/layout-default.css" />
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
    
    <script src="js/util.js" type="text/javascript"></script>
    <script src="js/passage.js" type="text/javascript"></script>
    <script src="js/bookmark.js" type="text/javascript"></script>
    <script src="js/lexicon_definition.js" type="text/javascript"></script>
    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/timeline.js" type="text/javascript"></script>
    <script src="js/toolbar_menu.js" type="text/javascript"></script>
    <script src="js/interlinear_popup.js" type="text/javascript"></script>
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
	
<div class="ui-layout-center bookmarks" id="bookmarkPane">
	<div class="ui-layout-north northBookmark">
		<img id="topLogo" src="images/step-logo.png" alt="STEP :: Scripture Tools for Every Pastor" />
	</div>
	<div id="bookmarkPane" class="ui-layout-center bookmarksContent"><span>Bookmarks</span></div>
	<div class="ui-layout-south logo">
		<span class="copyright">&copy; Tyndale House</span>
	</div>
</div>
	
	
<div class="column">
	<div class="passageContainer">
		<div id="rightPaneMenu" class="innerMenus"></div>
	    <div class="passageText ui-widget">
	    	<div class="headingContainer">
		    	<input id="leftPassageReference" class="heading editable passageReference" size="30" value="Revelation 1" />
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
<!--<div id="error" class="ui-state-highlight">A placeholder for error messages</div>-->

<!--  The about popup -->

<div id="about">
	<img id="aboutLogo" src="images/step-logo.png" />
	<h3 id="aboutTitle">STEP :: Scripture Tools for Every Pastor</h3>
	<p>&copy; Tyndale House 2011</p>
</div>


</body>

</HTML>
