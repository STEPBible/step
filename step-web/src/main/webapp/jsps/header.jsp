<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <TITLE><%= request.getParameter("title") %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="<%= request.getParameter("description") %>" />
	<meta name="keywords" content="<%= request.getParameter("keywords") %>" />
	
	<link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
</HEAD>
<body>

<div class="header">
	<h1><a href="./">STEP :: Scripture Tools for Every Person</a></h1>
</div>