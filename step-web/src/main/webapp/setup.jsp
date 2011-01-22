<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>

    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Pastor</TITLE>

    <link rel="stylesheet" type="text/css" href="css/ui-layout/layout-default.css" />
    <link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.8.5.custom.css" />
    <link rel="stylesheet" type="text/css" href="css/initial-layout.css" />
    <link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />
    <link rel="stylesheet" type="text/css" href="css/setup-layout.css" />
    
    <script src="libs/jquery-1.4.2.min.js" type="text/javascript"></script>
    <script src="libs/jquery-ui-1.8.5.custom.min.js" type="text/javascript"></script>
    <script src="libs/jquery.layout-latest.js" type="text/javascript"></script>
    <script src="libs/jquery-shout.js" type="text/javascript"></script>
    
    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/setup.js" type="text/javascript"></script>
</HEAD>
<body>

	<h1>STEP - Scripture Tools for Every Pastor</h1>
	
	This is setup page for the STEP software. 
	This page enables you to install different modules used by STEP, including Bibles, Dictionaries, ...
	<p />
	
	<!-- If the user lives in a country that persecutes Christians then actions on this page might give the game away -->
	<b>Please note that actions on this page access the internet. If you are in a "sensitive" country, you may wish to wait before you install any modules.</b>
	<p />
	
	A number of modules must be installed for core functionality to be available. 
	<input id="installCoreModules" type="button" value="Install core functionality" />
	
	<div id="installationOptions">
		<div id="leftColumn" class="column ui-layout-center">
			<h2>Available modules</h2>
			
			<input id="filter" type="text" value="Filter" />
			
			<!--  list of links of all available modules, including 
			dictionaries, broken down by categories -->
			<div id="availableModules"></div>
		</div>
	
		<div id="rightColumn" class="column ui-layout-east">
			<h2>Installed modules</h2>
			<div id="inProgressModules"></div>
		</div>
	</div>
</body>
</HTML>
