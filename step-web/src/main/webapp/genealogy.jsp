<%@ page contentType="text/html; charset=UTF-8" language="java"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
	<TITLE>STEP Genealogy Demo</TITLE>
	<META http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	
	<link rel="shortcut icon" href="images/step-favicon.ico" />
	
	<link rel="stylesheet" type="text/css"
		href="css/jquery-ui-1.8.19.custom.css" />
	<link rel="stylesheet" type="text/css" href="css/qtip.css" />

<!-- 	<link rel="stylesheet" type="text/css" href="js/modules/genealogy.css" /> -->

	

	
	<script src="libs/d3.v2.min.js" type="text/javascript"></script>
	<script src="libs/jquery-1.7.2.min.js" type="text/javascript"></script>
	<script src="libs/jquery-ui-1.9-beta.min.js" type="text/javascript"></script>
	<script src="js/jquery-extensions/jquery-qtip.js" type="text/javascript"></script>
	<script src="js/jquery-extensions/jquery-hover-intent.js" type="text/javascript"></script>
	
	
	<script src="js/modules/step.modules.genealogy.js" type="text/javascript"></script>
<!-- 	<script src="js/modules/step.modules.genealogy2.js" type="text/javascript"></script> -->
</HEAD>
<body  onload="init();">
	<div id="center-container">
		<div id="d3">
		
		</div>
	</div>
	  <input type="radio" id="s-normal" name="selection" value="normal" />
	    <input type="radio" id="s-root" name="selection" checked="checked" value="root" />
	<div id="log"></div>
</body>

</HTML>
