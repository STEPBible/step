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
    public String sha256sum_deb;
    public String sha256sum_rpm;
%>
<%
	if (downloadVersion == null) {
		downloadVersion = "";
                sha256sum_deb = "";
                sha256sum_rpm = "";

		try {
			String pathOfServlet = getServletContext().getRealPath("/");
			String[] pathOfServletSplits = pathOfServlet.split("[\\\\\\/]"); // Either \ for Windows or / characters for Linux
			pathOfServlet = "/var/www/" + pathOfServletSplits[pathOfServletSplits.length - 1]  + "_config.txt";
			String prefixForThisTomcatContext = "DOWNLOAD_VERSION:";
			String DebSHAString = "DEB_SHA256:";
			String RpmSHAString = "RPM_SHA256:";
			BufferedReader reader = new BufferedReader(new FileReader(pathOfServlet));
			String line;
			while ((line = reader.readLine()) != null) {
				if (line.indexOf(prefixForThisTomcatContext) == 0) {
					downloadVersion = line.substring(prefixForThisTomcatContext.length());
				}
				if (line.indexOf(DebSHAString) == 0) {
					sha256sum_deb = line.substring(DebSHAString.length());
				}
				if (line.indexOf(RpmSHAString) == 0) {
					sha256sum_rpm = line.substring(RpmSHAString.length());
				}
			}
			reader.close();
		}
		catch (Exception e) {
			downloadVersion = "";
	                sha256sum_deb = "";
	                sha256sum_rpm = "";
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
	<meta name="description" content="Forever free Bible Study Software for your Windows, Mac, Linux, iPhone, iPad and Android. Bible study tools include search and Greek, Hebrew lexicons." />
    <title>Free Bible study software for Windows, Mac, iPhone, Android and Linux</title>
    <%@include file="/jsps/offlinePage.jsp" %>
    <link href="/css/bootstrap.css" rel="stylesheet" media="screen"/>
    <link href="/css/bootstrap-theme.min.css" rel="stylesheet" media="screen"/>
    <link rel="stylesheet" type="text/css" href="static/static.css"/>
    <link rel="shortcut icon" href="images/step-favicon.ico"/>
	<script type="application/ld+json"> {
		"@context": "https://schema.org/",
		"@type": "SoftwareApplication",
		"url": "https://www.STEPBible.org",
		"sameas": "https://en.wikipedia.org/wiki/The_SWORD_Project#STEPBible",
		"description": "Free Bible study software for Windows, Mac, Linux, iPhone, iPad and Android. Software can search and display Greek / Hebrew lexicons, interlinear Bibles...",
		"name": "STEPBible - Download free Bible study software",
		"author": {
			"@type": "Person",
			"name": "David Instone-Brewer",
			"jobTitle": "Research Fellow",
			"url": "https://cambridge.academia.edu/DInstoneBrewer",
			"affiliation": {
				"@type": "Organization",
				"name": "Tyndale House",
				"url": "https://www.TyndaleHouse.com"
			},
			"memberOf": [
				{
					"@type": "Organization",
					"name": "Studiorum Novi Testamenti Societas",
					"url": "https://snts.online"
				},
				{
					"@type": "Organization",
					"name": "British and Irish Association for Jewish Studies",
					"url": "https://britishjewishstudies.org"
				},
				{
					"@type": "Organization",
					"name": "Committee on Bible Translation",
					"url": "https://www.biblica.com/niv-bible/niv-bible-translators"
				}
			]
		}
	}
	</script>
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
	  width: 600px;
	  vertical-align:top;
	  }
	  
	  .td2 {
	  width: 50px;
	  }
	  
	  .td3 {
	  width: 550px;
	  vertical-align:top;
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

	  .ol {
	  font-size: 18px;
	  }

	  .sha {
	  font-size: 14px;
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
          <p class="h" id="windows"><br>How to verify the STEPBible installer for Windows</p>
          <br>
	  <table>
		<tr class="tr" style="height:498px">
		  <td class="td1">
			<p class="p">
			  The stepbible_<%= downloadVersion %>.exe file has been signed with a digital certificate to prove its authenticity.
                          <br><br>
                          To verify that your download has this certificate:
                          </p>
                          <ol class="ol">
                          <li>Right-click on the stepbible_<%= downloadVersion %>.exe file and select Properties from the menu.</li>
                          <br>
                          <li>In the Properties dialogue window, click on the Digital Signatures tab.  You should see STEPBIBLE in the Signature list.</li>
                          <br>
                          <li>Click on the Details button.</li>
                          </ol>
		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyWindows1.png" style="width:350px">
		  </td>
		</tr>
		<tr class="tr" style="height:445px">
		  <td class="td1">
                          <ol class="ol" start="4">
                          <li>In the Digital Signature Details dialogue window, click on the View Certificate button.</li>
                          </ol>
		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyWindows2.png" style="width:350px">
		  </td>
		</tr>
		<tr class="tr" style="height:473px">
		  <td class="td1">
                          <ol class="ol" start="5">
                          <li>Check the certificate information, which should state that the certificate was issued to STEPBIBLE (SCRIPTURE TOOLS FOR EVERY PERSON) by Sectigo Public Code Signing CA, and is valid from 2024-01-24 to 2027-01-24.</li>
                          </ol>
                          <br><br>
                          <p class="p">
                          If this is not what is displayed, do not run the executable.  Instead, contact feedback@stepbible.org.
                          </p>

		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyWindows3.png" style="width:350px">
		  </td>
		</tr>
	  </table>
          <br><br>
          <p class="h" id="mac"><br>How to verify the STEPBible installer for MacOS</p>
          <br>
	  <table>
		<tr class="tr" style="height:330px">
		  <td class="td1">
			<p class="p">
			  The MacOS download file can be verified as follows:
                        <ol class="ol">
                        <li>Open the Finder window.</li>
                        <br>
                        <li>Navigate to the stepbible_<%= downloadVersion %>.dmg file, and double-click on it.</li>
                        <br>
                        <li>Double-click on the STEP - Scripture Tools for Every Person Installer.app icon.</li>
		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyMac1.png" style="width:450px">
		  </td>
		</tr>
		<tr class="tr" style="height:428px">
		  <td class="td1">
			<p class="p">
                        <ol class="ol" start="4">
                        <li>Verify that the information window says: "Apple checked it for malicious software and none was detected."</li>
                        </ol>
			  <br/><br/>
                          <p class="p">
                          If this message is not present, do not continue.  Instead, contact feedback@stepbible.org.
                          </p>

		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyMac2.png" style="width:450px">
		  </td>
		</tr>
	  </table>
          <br><br>
          <p class="h" id="linux"><br>How to verify the STEPBible installer for Linux</p>
          <br>
	  <table>
		<tr class="tr">
		  <td class="td1">
			<p class="p">
			 The Linux download files can be verified by checking the sha256sum of the file, as follows:
                        <ol class="ol">
                        <li>Open a terminal window.</li>
                        <br>
                        <li>Change to the directory (i.e., "cd") into which the file was downloaded.</li>
                        <br>
                        <li>Execute the sha256sum command, giving the download file as a parameter.</li>
                        <br>
                        <li>Compare the result with the appropriate sum, below.</li>
                        </ol>
                        <br>
			<p class="p">stepbible_<%= downloadVersion %>.deb:</p>
                        <p class="sha"><%= sha256sum_deb %> </p>
			<br>
			<p class="p">stepbible_<%= downloadVersion %>.rpm:</p>
                        <p class="sha"><%= sha256sum_rpm %> </p>
                          <br><br>
                          <p class="p">
                          If your sha256sum does not match, do not run the executable.  Instead, contact feedback@stepbible.org.
                          </p>
		  </td>
		  <td class="td2">
		  <td class="td3">
			<img class="image" src="/images/VerifyLinux.png" style="width:550px">
		  </td>
		</tr>
	  </table>
	</div>
<br><br><br><br><br><br>

</body>
</HTML>
