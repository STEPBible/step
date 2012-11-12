<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person</TITLE>

	<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.23.custom.css" />
    <link rel="stylesheet" type="text/css" href="css/setup-layout.css" />
    <link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
    
	<script src="js_init/initLib.js" type="text/javascript"></script>   
    <script src="libs/jquery-1.8.2.min.js" type="text/javascript"></script>
	<script src="libs/jquery-ui-1.8.23.custom.min.js" type="text/javascript"></script>

    <script src="js/ui_hooks.js" type="text/javascript"></script>
    <script src="js/setup/step.setup.js" type="text/javascript"></script>
</HEAD>
<body style="font-size: 12px">
	<div class="header">
		<h1>STEP :: Scripture Tools for Every Person</h1>
	</div>

	<h2>Welcome to STEP!</h2>
	<p />
	This page will help you download and install some Bibles and Commentaries.
	<p />
	
	<!-- If the user lives in a country that persecutes Christians then actions on this page might give the game away -->
	<b>Please note that actions on this page access the internet. If you are in a "sensitive" country, you may wish to wait before you install any modules.</b>
	<p />
	
	<div style="text-align: center">
		<input id="install" type="button" value="Start the installation" />
	</div>
	
	<div style="height: 300px; overflow-y: scroll; border: 1px solid lightgrey">
		<ul id="progressStatus">
			
		</ul>
	</div>
	
	
<!-- 	<div id="installationOptions"> -->
<!-- 		<div id="leftColumn" class="column ui-layout-center"> -->
<!-- 			<h2>Available modules</h2> -->
			
<!-- 			<input id="filter" type="text" value="Filter" /> -->
			
<!-- 			  list of links of all available modules, including  
<!-- 			dictionaries, broken down by categories --> 
<!-- 			<div id="availableModules"></div> -->
<!-- 		</div> -->
	
<!-- 		<div id="rightColumn" class="column ui-layout-east"> -->
<!-- 			<h2>Installed modules</h2> -->
<!-- 			<div id="inProgressModules"></div> -->
<!-- 		</div> -->
<!-- 	</div> -->
</body>
</HTML>
