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
    Config.set(session, Config.FMT_LOCALE, locale);
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
    request.setAttribute("analyticsToken", Boolean.TRUE.equals(Boolean.getBoolean("step.development")) ? SearchPageController.DEV_TOKEN : SearchPageController.LIVE_TOKEN);
%>
<fmt:setBundle basename="HtmlBundle"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8">
    <TITLE>Download free and trustworth Bible study tools, including the NIV and ESV | STEP :: Scripture Tools for Every Person - <fmt:message key="download_desktop_step"/></TITLE>
    <%@include file="/jsps/offlinePage.jsp" %>
    <link href="/css/bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="/css/bootstrap-theme.min.css" rel="stylesheet" media="screen"/>
    <link rel="stylesheet" type="text/css" href="static/static.css"/>
    <link rel="shortcut icon" href="images/step-favicon.ico"/>
    <script src="/international/interactive.js" type="text/javascript"></script>
    <script src="/libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
    <script src="/js/step_constants.js" type="text/javascript"></script>
    <script src="/libs/jquery-1.10.2.min.js" type="text/javascript"></script>
    <script src="/js/step.util.js" type="text/javascript"></script>

    <style type="text/css">
        table {
            margin-top: 50px;
            width: 100%;

        }

        td {
            text-align: center;
            border-bottom: lightgrey solid 2px;
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

        <table border="1" style="width: 100%; max-width: 800px;">
            <tr VALIGN="TOP">
                <td WIDTH="33%"><img src="images/WindowsCyan_Web.jpg"/><br />
                    <fmt:message key="download_windows_edition"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Windows.pdf" data-os="windows">Download instructions for Windows</a>&nbsp;
                    <p>Download from a server at:
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible.exe" data-os="windows">USA,</a>&nbsp;
                    <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible.exe" data-os="windows">Europe,</a>&nbsp;
                    <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible.exe" data-os="windows">Asia Pacific</a>
                    </p>
                </td>
                <td WIDTH="33%"><img src="images/apple.png"/><br />
                    <fmt:message key="download_macos"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Mac.pdf" data-os="mac">Download instructions for Mac</a>&nbsp;
                    <p>Download from a server at:
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible.dmg" data-os="mac">USA,</a>&nbsp;
                    <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible.dmg" data-os="mac">Europe,</a>&nbsp;
                    <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible.dmg" data-os="mac">Asia Pacific</a>
                    </p>
                </td>
                <td WIDTH="33%"><img src="images/linux.jpg"/><br />
                    <fmt:message key="download_linux"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Linux.pdf" data-os="linux">Download instructions for Linux</a>&nbsp;
                    <p>Download DEB installation file from:
                        <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible.deb" data-os="linux">USA,</a>&nbsp;
                        <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible.deb" data-os="linux">Europe,</a>&nbsp;
                        <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible.deb" data-os="linux">Asia Pacific</a>
                    </p>
                    <p>Download RPM installation file from:
                        <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible.rpm" data-os="linux">USA,</a>&nbsp;
                        <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible.rpm" data-os="linux">Europe,</a>&nbsp;
                        <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible.rpm" data-os="linux">Asia Pacific</a>
                    </p>
                </td>
            </tr>
			<tr VALIGN="TOP">
                <td WIDTH="33%"><img src="images/WindowsCyan_Web_zh.jpg"/><br />
                    <fmt:message key="download_windows_edition_zh"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Windows.pdf" data-os="windows">Download instructions for Windows</a>&nbsp;
                    <p>Download from a server at:
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_zh.exe" data-os="windows">USA,</a>&nbsp;
                    <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible_zh.exe" data-os="windows">Europe,</a>&nbsp;
                    <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible_zh.exe" data-os="windows">Asia Pacific</a>
                    </p>
                </td>
                <td WIDTH="33%"><img src="images/apple_zh.jpg"/><br />
                    <fmt:message key="download_macos_zh"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Mac.pdf" data-os="mac">Download instructions for Mac</a>&nbsp;
                    <p>Download from a server at:
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_zh.dmg" data-os="mac">USA,</a>&nbsp;
                    <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible_zh.dmg" data-os="mac">Europe,</a>&nbsp;
                    <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible_zh.dmg" data-os="mac">Asia Pacific</a>
                    </p>
                </td>
                <td WIDTH="33%"><img src="images/linux_zh.jpg"/><br />
                    <fmt:message key="download_linux_zh"/>&reg;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_Linux.pdf" data-os="linux">Download instructions for Linux</a>&nbsp;
                    <p>Download DEB installation file from:
                        <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_zh.deb" data-os="linux">USA,</a>&nbsp;
                        <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible_zh.deb" data-os="linux">Europe,</a>&nbsp;
                        <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible_zh.deb" data-os="linux">Asia Pacific</a>
                    </p>
                    <p>Download RPM installation file from:
                        <a href="https://downloads.stepbible.com/file/Stepbible/STEPBible_zh.rpm" data-os="linux">USA,</a>&nbsp;
                        <a href="https://stepbible-eu.s3.eu-north-1.amazonaws.com/STEPBible_zh.rpm" data-os="linux">Europe,</a>&nbsp;
                        <a href="https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/STEPBible_zh.rpm" data-os="linux">Asia Pacific</a>
                    </p>
                </td>
            </tr>
            <tr VALIGN="TOP">
                <td><br /><br />
                    <fmt:message key="download_installer"/><br />
                    <img src="/images/SD+USB.jpg"/>
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEP_installers_450Bibles.zip"><fmt:message key="download3"/></a>&nbsp;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEP_installers_200Bibles.zip"><fmt:message key="download2"/></a>&nbsp;
                    <br />
                    <a href="https://downloads.stepbible.com/file/Stepbible/STEP_installers_9Bibles.zip"><fmt:message key="download1"/></a>
                </td>
                <td><br /><br />
                    <fmt:message key="return_to_main_site"/>
                    <br /><a href="https://www.stepbible.org">www.stepbible.org
                        <br />
                        <br /><img src="images/STEPonline.jpg"/></a>
                    <br /><br /><br />
                    <a href="https://www.stepbible.org/?q=version=NAV&lang=ar">Arabic</a>,
                    <a href="https://www.stepbible.org/?q=version=FarsiOPV&lang=fa">Farsi</a>,
                    <a href="https://www.stepbible.org/?q=version=CUns&lang=zh">Mainland Chinese</a>,
                    <a href="https://www.stepbible.org/?q=version=CUn&lang=zh_TW">Traditional Chinese</a>,
                    <a href="https://www.stepbible.org/?q=version=NVI&lang=es">Spanish</a>,
                    <a href="https://www.stepbible.org/?q=version=PNVI&lang=pt">Portuguese</a>,
                    <a href="https://www.stepbible.org/?q=version=Neno&lang=sw">Swahili</a>,
                    <a href="https://www.stepbible.org/?q=version=NRT&lang=ru">Russian</a>,
                    <a href="https://www.stepbible.org/?q=version=NTLR&lang=ro">Romanian</a>,
                    etc...

                </td>
                <td><br />
                  <h2>Tyndale Keyboard and Unicode Font Kits</h2>
				  <br />
These kits include intuitive and customisable keyboards for typing in and Greek Hebrew, allowing you to create text that can be used directly in publications and websites. The Greek font includes breathing, accents and ancient forms, while the Hebrew font includes vowel pointing and Masoretic punctuation. The packages also include the Cardo Unicode font by David Parry.

				  <br /><br />
                  <a href="https://downloads.stepbible.com/file/Stepbible/TyndaleUnicodePC.zip" data-os="windows">Windows</a> 
                  (<a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_for_Windows_Installation_Guide.pdf" data-os="windows">Install instructions</a>, 
                  <a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_Usage_Guide.pdf" data-os="windows">Usage Guide</a>)
				  <br>
                  <a href="https://downloads.stepbible.com/file/Stepbible/TyndaleUnicodeMac.zip" data-os="mac">Mac</a>
                  (<a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_for_Mac_Installation_Guide.pdf" data-os="mac">Install instructions</a>,
                  <a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_Usage_Guide.pdf" data-os="mac">Usage Guide</a>)
				  <br>
                  <a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_keyboards_for_Linux.tgz" data-os="linux">Linux</a> 
                  (<a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_for_Linux_Installation_Guide.pdf" data-os="linux">Install instructions</a>, 
                  <a href="https://downloads.stepbible.com/file/Stepbible/Tyndale_Keyboards_for_Linux_Usage_Guide.pdf" data-os="linux">Usage Guide</a>)

                </td>
            </tr>
        </table>
        <br />
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

            ga('create', '${analyticsToken}', 'auto');
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
