
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	WebStepRequest stepRequest = new WebStepRequest(injector, request);
%>
<div class="passageToolbarContainer">
	<span class="passageToolbarFloatingContainer">
		<span class="passageLookupButtons passageSizeButtons">
			<a class="syncOtherPassage">Syncs with the other passage</a> <a
			class="continuousPassage">Displays the passage as one large scroll</a>
			<a class="previousChapter"
			href="?reference=<%=stepRequest.getPreviousReference(Integer.parseInt(request
							.getParameter("passageId")))%>&version=<%=stepRequest.getVersion(Integer.parseInt(request
							.getParameter("passageId")))%>">Displays the previous chapter (or expands to the start of the chapter)</a> <a
			class="nextChapter"
			href="?reference=<%=stepRequest.getNextReference(Integer.parseInt(request
							.getParameter("passageId")))%>&version=<%=stepRequest.getVersion(Integer.parseInt(request
							.getParameter("passageId")))%>">Displays the next chapter (or expands to the end of the chapter)</a> 
		<a
			class="bookmarkPassageLink">Add a bookmark</a> <a class="smallerFonts"
			href="#" title="Smaller fonts">A</a> <a class="largerFonts" href="#"
			title="Larger fonts">A</a>
		</span>
	</span>
</div>