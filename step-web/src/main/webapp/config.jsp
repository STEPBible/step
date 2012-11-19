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
    <script src="js/util.js" type="text/javascript"></script>
    <script src="js/setup/step.config.js" type="text/javascript"></script>
    <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>
</HEAD>
<body style="font-size: 12px">
	<div class="header">
		<h1>STEP :: Scripture Tools for Every Person</h1>
	</div>

	<h2>Welcome to the STEP Configuration page!</h2>
	<p />
	On this page you can download and install new Bible texts and commentaries.
	Please note that this page <b>will download new modules from the internet.</b> 
	To continue installing Bibles and Commentaries, please press the first button. 
	Alternatively, you can start using the STEP application.
	
	<div class="configOptions">
		<input type="button" value="I want to add modules from the internet." id="dismissWarning" />
		<input type="button" value="I'd like to use the STEP application" id="useStep" onclick='window.location.href="index.jsp";' />
	</div>

	<p />
	In order to install a module, either drag it to the "Installed" column, or click the "Install now"
	link.

	<p />
	
	<div class="halfColumn miniBox">
		<h3>Sort by</h3>
		<div class='optionContainer'>
			<input type='text' style='visibility: hidden' /><br />
			<a href="#" onclick="step.config.sortBy('name');">Name</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('initials');">Initials</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('languageName');">Language</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('languageCode');">Language code</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.sortBy('category');">Category</a>
			<br />
		</div>
		
	</div>
	
	<div class="halfColumn miniBox">
		<h3>Filter by</h3>
		<div class='optionContainer'>
			Filter value: 		<input type='text' value="" id='filterValue' /><br />
			Filters: 
			<a href="#" onclick="step.config.filterBy('name');">Name</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('initials');">Initials</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('language');">Language</a>&nbsp;&nbsp;
			<a href="#" onclick="step.config.filterBy('category');">Category</a>&nbsp;&nbsp;
		</div>
	</div>
	<br /><br /><br /><br /><br /><br />	
	<div id="content">
		<div id="leftColumn" class='halfColumn'>
			<h3>Downloadable modules</h3>
			<p />
			<div class='container'>
				<div class='waitingLabel'>
					Please wait while STEP retrieves a list of available Bibles and commentaries.
					<p />
					<span class='waiting'>
						<img src="images/wait_big.gif" />
					</span>
				</div>
			</div>
		</div>
		<div id="rightColumn" class='halfColumn'><h3>Installed modules</h3><p /><div class='container'></div></div>
	</div>	
	<p />
</body>
</HTML>
