<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<fmt:setBundle basename="HtmlBundle"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>STEP :: Scripture Tools for Every Person - <fmt:message key="download_desktop_step"/></TITLE>
    <%@include file="jsps/offlinePage.jsp" %>
    <link href="css/bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="css/bootstrap-theme.min.css" rel="stylesheet" media="screen"/>
    <link rel="stylesheet" type="text/css" href="static/static.css"/>
    <link rel="shortcut icon" href="images/step-favicon.ico"/>
    <script src="international/interactive.js" type="text/javascript"></script>
    <script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
    <script src="js/step_constants.js" type="text/javascript"></script>
    <script src="js/step.util.js" type="text/javascript"></script>

    <style type="text/css">
        table {
            margin-top: 50px;
            width: 100%;

        }

        td {
            text-align: center;
        }

        td:first-child {
            border-right: lightgrey solid 1px;
        }

        .pageContent {
            margin: 10px;
        }

        .corner {
            position: absolute;
            bottom: 3px;
            right: 3px;
        }
    </style>

</HEAD>
<body>
<div>
    <div class="header">
        <h1>STEP :: Scripture Tools for Every Person</h1>
    </div>
    <div class="pageContent">
        <h2><fmt:message key="download_desktop_step"/></h2>

        <p><fmt:message key="download_intro"/></p>

        <table>
            <tr>
                <td><a href="http://www.stepbible.org/downloads/STEP.exe"><img src="images/WindowsCyan_Web.jpg"/>
                    <br/>
                    <fmt:message key="download_windows_edition"/> &reg;
                </a></td>
                <td><a href="http://www.stepbible.org/downloads/STEP.dmg"><img src="images/apple.png"/><br/>
                    Apple MacOS X &reg;
                    <br />
                </td>
            </tr>
        </table>
    </div>
</div>
</body>
</HTML>
