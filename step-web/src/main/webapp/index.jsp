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

	<script src="js/initLib.js"></script>   
    <script src="libs/timeline_js/timeline-api.js?bundle=true" type="text/javascript"></script>
    <script src="libs/jquery-1.4.2.min.js" type="text/javascript"></script>
    <script src="libs/jquery-ui-1.8.5.custom.min.js" type="text/javascript"></script>
    <script src="libs/jquery.layout-latest.js" type="text/javascript"></script>
    <script src="libs/jquery-shout.js" type="text/javascript"></script>
    
    <script src="js/util.js" type="text/javascript"></script>
    <script src="js/passage_toolbar.js" type="text/javascript"></script>
    <script src="js/passage.js" type="text/javascript"></script>
    <script src="js/bookmark.js" type="text/javascript"></script>
    <script src="js/lexicon_definition.js" type="text/javascript"></script>
    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/timeline.js" type="text/javascript"></script>
    <script src="js/init.js" type="text/javascript"></script>
    
</HEAD>
<body>

<div id="leftColumn" class="column">
	<!--  the toolbar -->
	<div class="ui-layout-north toolbar"></div>

	<div class="passageContainer leftPassage ui-layout-center">
		<div id="leftPassagePane">
		    <input class="passageVersion defaultValue" type="text" value="Select a Bible version, e.g. ESV" />
		    <input class="passageReference defaultValue" type="text"  value="Select a reference, e.g. Gen 1:1" /><button class="searchButton">Search</button>
		    <input id="leftCheck" type="checkbox" class="toolbarButton"><label for="leftCheck">Toolbar</label></input>
		</div>
	    <div class="passageText ui-widget"></div>
	</div>
</div>


<div class="ui-layout-center bookmarks" id="bookmarkPane">
	<div class="ui-layout-north northBookmark">
		<img src="images/step-logo.png" alt="STEP :: Scripture Tools for Every Pastor" />
	</div>
	<div id="bookmarkPane" class="ui-layout-center bookmarksContent"><span>Bookmarks</span></div>
	<div class="ui-layout-south logo">
		<span class="copyright">&copy; Tyndale House</span>
	</div>
</div>

<div id="rightColumn" class="column">
	<!--  the toolbar -->
	<div class="ui-layout-north toolbar"></div>
	<div class="passageContainer rightPassage ui-layout-center">
		<div id="rightPassagePane">
		    <input class="passageVersion defaultValue" type="text" value="Select a Bible version, e.g. ESV" />
		    <input class="passageReference defaultValue" type="text"  value="Select a reference, e.g. Gen 1:1" /><button class="searchButton">Search</button>
		    <input id="rightCheck" type="checkbox" class="toolbarButton"><label for="rightCheck">Toolbar</label></input>
		</div>
	
	    <div class="passageText ui-widget"></div>
    </div>
	
</div>

<div id="bottomSection" class="timeline">No modules have yet been loaded.</div>

<div id="loading"><img alt="Loading..." src="images/wait16.gif" />Loading...</div>
<div id="error" class="ui-state-highlight">A placeholder for error messages</div>

</body>

</HTML>
