<%@page import="java.io.FileReader"%>
<%@page import="java.io.BufferedReader"%>
<%@ page import="com.google.inject.Injector" %>
<%@ page import="java.util.Locale" %>
<%@ page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@ page import="com.tyndalehouse.step.rest.controllers.SearchPageController" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%!
    public String downloadVersion;
%>
<%
	if (downloadVersion == null) {
		downloadVersion = "";
		try {
			String pathOfServlet = getServletContext().getRealPath("/");
			String[] pathOfServletSplits = pathOfServlet.split("[\\\\\\/]"); // Either \ for Windows or / characters for Linux
			pathOfServlet = "/var/www/" + pathOfServletSplits[pathOfServletSplits.length - 1]  + "_config.txt";
			String prefixForThisTomcatContext = "DOWNLOAD_VERSION:";
			BufferedReader reader = new BufferedReader(new FileReader(pathOfServlet));
			String line;
			while ((line = reader.readLine()) != null) {
				if (line.indexOf(prefixForThisTomcatContext) == 0) {
					downloadVersion = line.substring(prefixForThisTomcatContext.length());
					break;
				}
			}
			reader.close();
		}
		catch (Exception e) {
			downloadVersion = "";
		}
	}

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
    <TITLE>Download free and trustworthy Bible study tools, including the NIV and ESV | STEP :: Scripture Tools for Every Person - <fmt:message key="download_desktop_step"/></TITLE>
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
	  width: 1200px;
	  }

	  .td1 {
	  width: 550px;
	  vertical-align:top;
	  }
	  
	  .td2 {
	  width: 50px;
	  }
	  
	  .td3 {
	  width: 600px;
	  vertical-align:center;
	  }

	  .tr {
	  height: 600px;
	  }
	  
	  .pageContent {
	  margin-left: 100px;
	  }

	  .h {
	  font-weight: bold;
	  font-size: 36px;
      line-height: 1;
	  }

	  .p {
	  font-size: 18px;
	  }

	  .image {
	  width: 600px;
	  }

	  .label {
	  width: 220px;
	  text-align: right;
	  display:inline-block;
	  font-size: 18px;
	  color: black;
	  font-weight: normal;
	  margin-bottom: 0;
	  }


	  .here {
	  color: blue;
	  text-decoration: underline;
	  cursor: pointer;
	  }

	  .button {
	  background-color: #227891;
	  border: none;
	  border-radius: 12px;
	  color: white;
	  padding: 20px;
	  text-align: center;
	  text-decoration: none;
	  display: inline-block;
	  font-size: 24px;
	  margin: 4px 2px;
	  cursor: pointer;
	  width: 200px;
	  margin-left: 120px;
	  outline: none;
	  }

    </style>

</HEAD>
<body>

	<div class="pageContent">

	  <img src="/images/STEPBible_logo.png" width=1200px/>

	  <table>
		<tr class="tr">
		  <td class="td1">
			<p class="h" id="download_step_header">Download STEPBible to your computer</p>
			<p class="p">
			  Run STEPBible from your computer when disconnected from the internet.  ESV,
			  NIV and ancient language Bibles are included.
			  <br/><br/>
			  Current version for download is: <%= downloadVersion %>
			  <br/>
			  <label class="label" for="step_os">Operating system:</label>
			  <select name="step_os" id="step_os">
				<option value="windows">Windows</option>
				<option value="mac">Mac OS</option>
				<option value="linux_deb">Linux (.deb)</option>
				<option value="linux_rpm">Linux (.rpm)</option>
			  </select>

			  <br/>

			  <label class="label" for="lexicon">With lexicon(s):</label>
			  <select name="lexicon" id="lexicon">
				<option value="lexicon_english">English</option>
				<option value="lexicon_english_chinese">English + Chinese</option>
			  </select>

			  <br/>

			  <label class="label" for="region">Download region:</label>
			  <select name="region" id="region">
				<option value="region_usa">USA</option>
				<option value="region_europe">Europe</option>
				<option value="region_asia_pacific">Asia Pacific</option>
			  </select>

			  <br/><br/><br/>

			  <button id="exeDownload" class="button" onclick=_userDownload(this.id)>Download</button>

			  <br/><br/>

			  Click <a class="here" id="exeInstruction" onclick=_userDownload(this.id)>here</a> for installation instructions.

			  <br/><br/>

			</p>
			<p>Previous versions of STEP installation files are available at our 
			 <a href="https://test.stepbible.org/downloads">test server</a>
			</p>
			<p>
			  STEP is available on different platforms, thanks to the
			  <a href="https://www.ej-technologies.com/products/install4j/overview.html"
				 target="_new">install4j multi-platform installer builder</a>.
			</p>

		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/STEP_screenshot.png">
		  </td>
		</tr>
		<tr class="tr">
		  <td class="td1">
			<p class="h">Tyndale Keyboard and Unicode Font Kits</p>
			<p class="p">
			  These kits include intuitive and customisable keyboards for typing
			  in Greek and Hebrew, allowing you to create text that can be used
			  directly in publications and websites. The Greek font includes
			  breathing, accents and ancient forms, while the Hebrew font includes
			  vowel pointing and Masoretic punctuation. The packages also include
			  the Cardo Unicode font by David Parry.

			  <br/><br/>

			  <label class="label" for="keyboard_os">Operating system:</label>
			  <select name="keyboard_os" id="keyboard_os">
				<option value="windows">Windows</option>
				<option value="mac">Mac OS</option>
				<option value="linux">Linux</option>
			  </select>

			  <br/><br/><br/>
			  
			  <button id="keyboardDownload" class="button" onclick=_userDownload(this.id)>Download</button>

			  <br/><br/>

			  Click <a class="here" id="keyboardInstruction" onclick=_userDownload(this.id)>here</a> for installation instructions.
			  <br/>
			  Click <a class="here" id="keyboardGuide" onclick=_userDownload(this.id)>here</a> for usage guide.
			</p>
		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/keyboards.png">
		  </td>
		</tr>
	  </table>
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
	<script>
	function _userDownload(clickItemID) {
		if (clickItemID === "exeDownload") {
			var os =  $( "#step_os option:selected" ).val();
			var lexicon = $('#lexicon option:selected').val();
			var region = $('#region option:selected').val();
			var fileExtension = "";
			if (os === "windows") fileExtension = "exe";
			else if (os === "mac") fileExtension = "dmg";
			else if (os === "linux_deb") fileExtension = "deb";
			else if (os === "linux_rpm") fileExtension = "rpm";
			else console.log("Unknown os selected: " + os);
			var fileName = "";
			var version = "<%= downloadVersion %>";
			if (version.length > 0) version = "_" + version;
			if (lexicon === "lexicon_english") fileName = "stepbible" + version;
			else if (lexicon === "lexicon_english_chinese") fileName = "stepbible_zh" + version;
			else console.log("Unknown lexicon selected: " + lexicon);
			var path = "";
			if (region === "region_usa") path = "https://downloads.stepbible.com/file/Stepbible/";
			else if (region === "region_europe") path = "https://stepbible-eu.s3.eu-north-1.amazonaws.com/";
			else if (region === "region_asia_pacific") path = "https://stepbible-ap.s3-ap-southeast-1.amazonaws.com/";
			else console.log("Unknown region selected: " + region);
			var downloadPath = path + fileName + "." + fileExtension;
			window.location.href = downloadPath;
		}
		else if (clickItemID === "exeInstruction") {
			var os =  $( "#step_os option:selected" ).val();
			var fileName = "";
			if (os === "windows") fileName = "STEPBible_Windows.pdf";
			else if (os === "mac") fileName = "STEPBible_Mac.pdf";
			else if (os === "linux_deb") fileName = "STEPBible_Linux.pdf";
			else if (os === "linux_rpm") fileName = "STEPBible_Linux.pdf";
			else console.log("Unknown os selected: " + os);
			var downloadPath = "https://downloads.stepbible.com/file/Stepbible/" + fileName;
			window.location.href = downloadPath;
		}
		else if (clickItemID === "keyboardDownload") {
			var os = $('#keyboard_os option:selected').val();
			var fileNames = "";
			if (os === "windows") fileName = "TyndaleUnicodePC.zip";
			else if (os === "mac") fileName = "TyndaleUnicodeMac.zip";
			else if (os === "linux") fileName = "Tyndale_keyboards_for_Linux.tgz";
			else console.log("Unknown os selected: " + os);
			var downloadPath = "https://downloads.stepbible.com/file/Stepbible/" + fileName;
			window.location.href = downloadPath;
		}
		else if (clickItemID === "keyboardInstruction") {
			var os = $('#keyboard_os option:selected').val();
			var fileNames = "";
			if (os === "windows") fileName = "Tyndale_Keyboards_for_Windows_Installation_Guide.pdf";
			else if (os === "mac") fileName = "Tyndale_Keyboards_for_Mac_Installation_Guide.pdf";
			else if (os === "linux") fileName = "Tyndale_Keyboards_for_Linux_Installation_Guide.pdf";
			else console.log("Unknown os selected: " + os);
			var downloadPath = "https://downloads.stepbible.com/file/Stepbible/" + fileName;
			window.location.href = downloadPath;
		}
		else if (clickItemID === "keyboardGuide") {
			var os = $('#keyboard_os option:selected').val();
			var fileNames = "";
			if (os === "windows") fileName = "Tyndale_Keyboards_Usage_Guide.pdf";
			else if (os === "mac") fileName = "Tyndale_Keyboards_Usage_Guide.pdf";
			else if (os === "linux") fileName = "Tyndale_Keyboards_for_Linux_Usage_Guide.pdf";
			else console.log("Unknown os selected: " + os);
			var downloadPath = "https://downloads.stepbible.com/file/Stepbible/" + fileName;
			window.location.href = downloadPath;
		}
	}
	</script>
<% } %>
</body>
</HTML>
