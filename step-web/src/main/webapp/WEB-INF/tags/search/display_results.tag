<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@attribute name="results" required="true" type="java.util.List" %>

<c:forEach var="result" items="${ results }">
    <div class="searchResultRow">
        <div class="searchResultRow">
            ${ result.preview }
        </div>
    </div>
</c:forEach>
