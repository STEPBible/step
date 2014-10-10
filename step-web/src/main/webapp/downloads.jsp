<%@ page import="com.google.inject.Injector" %>
<%@ page import="java.util.Locale" %>
<%@ page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@ page import="com.tyndalehouse.step.rest.controllers.SearchPageController" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
    request.setAttribute("analyticsToken", Boolean.TRUE.equals(Boolean.getBoolean("step.development")) ? SearchPageController.DEV_TOKEN : SearchPageController.LIVE_TOKEN);
%>
<fmt:setBundle basename="HtmlBundle"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>Download free and trustworth Bible study tools, including the NIV and ESV | STEP :: Scripture Tools for Every Person - <fmt:message key="download_desktop_step"/></TITLE>
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
                <td><a href="http://www.stepbible.org/downloads/STEP.exe" data-os="windows"><img src="images/WindowsCyan_Web.jpg"/>
                    <br/>
                    <fmt:message key="download_windows_edition"/>&reg;
                </a></td>
                <td><a href="http://www.stepbible.org/downloads/STEP.dmg" data-os="mac"><img src="images/apple.png"/><br/>
                    <fmt:message key="download_macos"/>&reg;
                    <br />
                    </a>
                </td>
            </tr>
        </table>
    </div>
</div>

<% if(!appManager.isLocal()) { %>
<script>
    (function(w, d, s) {
        function go(){
            var js, fjs = d.getElementsByTagName(s)[0], load = function(url, id) {
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.src = url; js.id = id;
                js.async = 'async';
                fjs.parentNode.insertBefore(js, fjs);
            };

            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', '${analyticsToken}', 'stepbible.org');
            ga('require', 'displayfeatures');
            ga('send', 'pageview');
        }
        if (w.addEventListener) { w.addEventListener("load", go, false); }
        else if (w.attachEvent) { w.attachEvent("onload",go); }

        $("[data-os]").click(function() {
            if(ga) ga('send', 'event', 'downloads', $(this).data('os'));
        });
    }(window, document, 'script'));


</script>
<% } %>
</body>
</HTML>
