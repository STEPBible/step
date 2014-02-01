<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
    AppManagerService appManager = injector.getInstance(AppManagerService.class);    
%>
<fmt:setBundle basename="HtmlBundle" scope="request" />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML xmlns:fb="http://ogp.me/ns/fb#">
<HEAD>
    <TITLE><%= stepRequest.getTitle() %></TITLE>
    <META http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<%-- 	<meta name="description" content="<%= stepRequest.getTitle() %>..."> --%>
    <meta step-local content="<%= appManager.isLocal() %>" />
    <meta name="step.version" content="${project.version}" />
    <meta name="description" content="<%= stepRequest.getDescription() %>" />
    <meta name="keywords" content="<%= stepRequest.getKeywords() %>" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />

    <% 
        if (stepRequest.getThisVersion().length() > 0 || stepRequest.getThisReference().length() > 0) {
    %>
        <link rel="canonical" href="http://www.stepbible.org/?version=<%= stepRequest.getThisVersion() %>&amp;reference=<%= stepRequest.getThisReference() %>" />
    <%
    } else {
    %>
            <link rel="canonical" href="http://www.stepbible.org" />
    <%    
    }
    %>
	<%
		if(request.getParameter("debug") != null) {
	%>
        <%@include file="jsps/offlineJqueryCss.jsp" %>
		<link rel="stylesheet" type="text/css" href="css/qtip.css" />
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />
		<link rel="stylesheet" type="text/css" href="css/ddsmoothmenu-v.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-layout.css" />
	    <link rel="stylesheet" type="text/css" href="css/initial-fonts.css" />
	    <link rel="stylesheet" type="text/css" href="css/passage.css" />
<!-- 	    <link rel="stylesheet" type="text/css" href="css/timeline.css" /> -->
	    <link rel="stylesheet" type="text/css" href="css/search.css" />
	    <link rel="stylesheet" type="text/css" href="css/cardo.css" />
    <%
        } else {
    %>
        <%-- Contains the jquery ui css --%>
        <link rel="stylesheet" type="text/css" href="css/step.${project.version}.min.css" />
    <%
        }
    %>

    <%
        if(request.getParameter("lang") == null) {
    %>
        <script src="international/interactive.js" type="text/javascript"></script>
    <% } else { %>
        <script src="international/interactive.js?lang=<%= request.getParameter("lang") %>" type="text/javascript"></script>
    <% } %>
    <%@include file="jsps/initLib.jsp" %>

    <%-- Now do javascript --%>
    <%
        if(request.getParameter("debug") != null) {
    %>

<%-- NOTE: do not include in prod web minifying and use minified versions otherwise --%>
        <%@include file="jsps/offlineJqueryJs.jsp" %>

        <script src="libs/dohighlight-min.js" type="text/javascript"></script>
        <script src="libs/sprintf-0.7-beta1.js" type="text/javascript"></script>
 		<script src="libs/jquery.tagcloud.js" type="text/javascript"></script>
        <script src="libs/tinymce/jquery.tinymce.min.js" type="text/javascript"></script>
        <script src="libs/underscore-min.js" type="text/javascript"></script>
        <script src="libs/json2.js" type="text/javascript"></script>

        <% if(request.getParameter("debugBackbone") != null) { %>
            <script src="libs/backbone.js" type="text/javascript"></script>
            <script src="libs/backbone.localStorage.js" type="text/javascript"></script>
        <% } else { %>
            <script src="libs/backbone-min.js" type="text/javascript"></script>
            <script src="libs/backbone.localStorage-min.js" type="text/javascript"></script>
        <% } %>
        <script src="js/jquery-extensions/jquery-qtip.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-hover-intent.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-cookie.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-local-store.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-shout.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-versions-complete.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-lexical-complete.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-detail-slider.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-sort.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-passage-buttons.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-original-word-toolbar.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-search-result.js" type="text/javascript"></script>
        <script src="js/jquery-extensions/jquery-bible-books.js" type="text/javascript"></script>
        <script src="js/ddsmoothmenu.js" type="text/javascript"></script>
        <script src="js/util.js" type="text/javascript"></script>
        <script src="js/lexicon_definition.js" type="text/javascript"></script>
        <script src="js/ui_hooks.js" type="text/javascript"></script>
<%-- 	    <script src="js/timeline.js" type="text/javascript"></script> --%>
<%-- 	    <script src="js/geography.js" type="text/javascript"></script> --%>
        <script src="js/toolbar_menu.js" type="text/javascript"></script>
        <script src="js/defaults/step.defaults.js" type="text/javascript"></script>
        <script src="js/navigation/step.navigation.js" type="text/javascript"></script>
        <script src="js/state/step.state.js" type="text/javascript"></script>
        <script src="js/state/step.state.view.js" type="text/javascript"></script>
        <script src="js/menu/step.menu.js" type="text/javascript"></script>
        <script src="js/menu/top/help.js" type="text/javascript"></script>
        <script src="js/menu/top/view.js" type="text/javascript"></script>
        <script src="js/menu/top/top.menu.ui.js" type="text/javascript"></script>
        <script src="js/menu/passage/context.js" type="text/javascript"></script>
        <script src="js/menu/passage/display.js" type="text/javascript"></script>
        <script src="js/menu/passage/passageTools.js" type="text/javascript"></script>
        <script src="js/menu/passage/search.js" type="text/javascript"></script>
        <script src="js/passage/step.version.js" type="text/javascript"></script>
        <script src="js/passage/step.alternatives.js" type="text/javascript"></script>
        <script src="js/passage/step.passage.js" type="text/javascript"></script>
        <script src="js/passage/step.fonts.js" type="text/javascript"></script>
        <script src="js/passage/step.passage.navigation.js" type="text/javascript"></script>
        <script src="js/passage/step.passage.navigation.ui.js" type="text/javascript"></script>
        <script src="js/bookmark/step.bookmark.ui.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_passage.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_passage.js" type="text/javascript"></script>
        <script src="js/backbone/router.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_menu_passage.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_passage.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_lookup_menu.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_menu_search.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_control_criteria.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_search.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_search_subject.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_search_original.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_search_advanced.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_search_simple.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_notes.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_subject.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_word.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_advanced.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_text.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_criteria_notes.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_search.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_subject.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_text.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_word.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_display_notes.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_quick_lexicon.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_quick_lexicon.js" type="text/javascript"></script>
        <script src="js/backbone/models/model_bookmark.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_bookmarks_history.js" type="text/javascript"></script>
        <script src="js/backbone/views/view_wordle_stat.js" type="text/javascript"></script>
        
        <script src="js/init.js" type="text/javascript"></script>
        <script src="js/backbone/step.js" type="text/javascript"></script>
	<%
		} else {
	%>
        <%-- If local, then we need to include our own copy of JQuery. Otherwise, include from CDN --%>
        <%
            if(appManager.isLocal()) {
        %>
            <%@include file="jsps/offlineJqueryJs.jsp" %>
        <%
            } else {
        %>
            <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" type="text/javascript" ></script>
            <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js" type="text/javascript" ></script>
        <%
            }
        %>

		<script src="js/step.${project.version}.min.js" type="text/javascript" ></script>

        <% if (!appManager.isLocal()) { %>
             <script type="text/javascript">
              var _gaq = _gaq || [];
              _gaq.push(['_setAccount', 'UA-36285759-1']);
              _gaq.push(['_trackPageview']);

              (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
              })();
            </script>
            <script>
                var _prum = [['id', '52698a2cabe53d8c20000000'],
                    ['mark', 'firstbyte', (new Date()).getTime()]];
                (function() {
                    var s = document.getElementsByTagName('script')[0]
                            , p = document.createElement('script');
                    p.async = 'async';
                    p.src = '//rum-static.pingdom.net/prum.min.js';
                    s.parentNode.insertBefore(p, s);
                })();
            </script>
        <% } %>
	<%
	}
	%>
</HEAD>
<body>
<div id="fb-root"></div>
<% if (!appManager.isLocal()) { %>
<script>(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<% } %>

<div id="topMenu" class="ddsmoothmenu"><jsp:include page="js/menu/top/menu.jsp" /></div>
<div>
	<div id="middleSection">
		<div class="column leftColumn">
			<div class="passageContainer" passage-id=0 itemscope itemtype="http://schema.org/Book">
				<div id="leftPaneMenu" class="innerMenus"><jsp:include page="js/menu/passage/menu.jsp" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
			    		<jsp:include page="js/search/fragments/advanced_search.jsp?passageId=0" />
						<jsp:include page="js/search/fragments/passage_toolbar.jsp?passageId=0" />
			    	</div>
			    	<div class="passageContent" itemprop="text">&nbsp;<%= stepRequest.getPassage(0) %></div>
			    </div>
			</div>
		</div>
		<div id="holdingPage">
			<h1>STEP<br /> <em>S</em>cripture <em>T</em>ools for <em>E</em>very <em>P</em>erson<br />
			from <a href="http://www.tyndalehouse.com" target="_new">Tyndale House, Cambridge</a></h1>
			<img src="images/step-logo-big.png" title="STEP" width="265" height="340" /><br />
			<em><fmt:message key="step_tag_line" /></em><br /><br />

			<table>
				<tr>
					<td colspan="3"><a target="_new" href="https://stepweb.atlassian.net/wiki/display/SUG/STEP+User+Guide" title="<fmt:message key="quick_tutorial" />"><fmt:message key="help_manual" /></a></td>
					<td colspan="3"><a target="_new" href="versions.jsp" title="<fmt:message key="detailed_help_manual" />"><fmt:message key="available_versions" /></a></td>
				</tr>
				<tr>
					<td colspan="2"><a target="_new" href="http://www.tyndale.cam.ac.uk/index.php?mact=News,cntnt01,detail,0&cntnt01articleid=28&cntnt01returnid=15" title="<fmt:message key="find_out_more_about_step" />"><fmt:message key="about_step_project" /></a></td>
					<td colspan="2"><a target="_new" href="https://stepweb.atlassian.net/wiki/x/iICV" title="<fmt:message key="support_the_project"/>"><fmt:message key="volunteers_required" /></a></td>
                    <td colspan="2"><a href="http://www.tyndale.cam.ac.uk/index.php?page=cookie-policy" target="_blank"><fmt:message key="help_privacy_policy" /></a></td>
                </tr>
			</table>
			<br />
			<a target="_new" href="http://www.tyndale.cam.ac.uk" style="color: #991c32">Tyndale House<br />Cambridge</a>
			<br />
			&copy; <%= java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)  %>
		</div>

		<jsp:include page="WEB-INF/tags/bookmarks/bookmark.tag"></jsp:include>

		<div class="column rightColumn">
			<div class="passageContainer" passage-id=1>
				<div id="rightPaneMenu" class="innerMenus"><jsp:include page="js/menu/passage/menu.jsp" /></div>
			    <div class="passageText ui-widget">
			    	<div class="headingContainer">
			    		<jsp:include page="js/search/fragments/advanced_search.jsp?passageId=1" />
			    		<jsp:include page="js/search/fragments/passage_toolbar.jsp?passageId=1" />
			    	</div>
			    	<div class="passageContent">&nbsp;</div>
				</div>
			</div>
		</div>
	</div>
	
	<div id="bottomSection" class="bottomModule timeline">
		<div id="bottomModuleHeader" >
			<span class="timelineContext" style="padding-right: 10px"></span>
			<span class="timelineContext" style="float: right;" onclick="step.navigation.hideBottomSection();"><fmt:message key="close" /></span>
		</div>
		<div id="bottomSectionContent" style="clear: both;">	
			<fmt:message key="no_modules_loaded_yet" />
		</div>
	</div>
</div>

<div class="interlinearPopup">
	<input type="text" class="interlinearVersions"/>
	<div class="interlinearChoices"></div>
</div>
<div class="interlinearPopup">
	<input type="text" class="interlinearVersions"/>
	<div class="interlinearChoices"></div>
</div>


<!--<div id="loading"><img alt="Loading..." src="images/wait16.gif" />Loading...</div>-->
<div id="error" class="ui-state-error" style="display: none">
	<span id="closeError"></span>
	<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
	<span id="errorText"><fmt:message key="error_message_holder" /></span>
</div>

<!--  The about popup -->

<div id="about" style="text-align: center;">
	<img id="aboutLogo" src="images/step-logo.png" width="88" height="56" />
	<h3 id="aboutTitle">STEP :: Scripture Tools for Every Person<br /></h3>
    <p><a style="color: #33339F" href='https://stepweb.atlassian.net/wiki/x/C4C_/' target="_new"><fmt:message key="copyright_info_link" /></a>
	<br/>
    <p>&copy; Tyndale House, Cambridge <%= java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)  %></p>
</div>

<%-- <jsp:include page="jsps/login.jsp"></jsp:include> --%>

<div id="goToDate" style="display: none">
	<fmt:message key="please_enter_year" /> <input type="text" id="scrollToYear" />
</div>

<!--  The popup that can have lots of helpful information -->
<jsp:include page="jsps/lexicon_definition.jsp"  />
<img src="images/wait_big.gif" id="waiting" />
<div id="previewReference" style="display: none"><div id="previewBar" style="display: none;">
	<a href="javascript:void(0)" id="previewClose"><fmt:message key="close_this_popup" /></a>
	<a href="javascript:void(0)" id="previewRight"><fmt:message key="see_passage_on_right_pane" /></a>
	<a href="javascript:void(0)" id="previewLeft"><fmt:message key="see_passage_on_left_pane" /></a>
</div><span id="popupText"></span></div>

<div id="validUser" style="display: none">
	<div id="validUserQuestion">
		<fmt:message key="register_tag_line" /><p />
		<table>
			<tr><td><fmt:message key="register_name" /></td><td><input type="text" id='userName' />*</td></tr>
			<tr><td><fmt:message key="register_email" /></td><td><input type="text" id='userEmail' />*</td></tr>
		</table>
		<div style="display: none" id="validationMessage"></div>
	</div>
</div>
<div id='stepInDevelopmentWarning' class="ui-state-highlight"><fmt:message key="step_disclaimer" /></div>


<% if(!appManager.isLocal()) { %>
<script type="text/javascript" src="https://apis.google.com/js/plusone.js" async>
    {lang: 'en-GB'}
</script>
<script type="text/javascript" async>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
<% } %>
</body>
</HTML>
