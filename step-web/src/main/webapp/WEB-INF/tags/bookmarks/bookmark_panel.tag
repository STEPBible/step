<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ attribute name="title" required="true" %>

<div id="historyDisplayPane" class="bookmarkContents panel">
    <div class="panel-heading">
        <h4 class="panel-title">
            <a data-toggle="collapse" data-parent="#historyDisplayPane" href="#${title}">
                <fmt:message key="${ title }" />
            </a><b class="caret"></b>
        </h4>
    </div>
    <div id="${title}" class="panel-collapse collapse out">
        <div class="panel-body">
        </div>
    </div>
</div>