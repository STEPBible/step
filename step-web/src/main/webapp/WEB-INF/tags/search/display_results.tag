<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@attribute name="results" required="true" type="java.util.List" %>
<%@attribute name="sortType" required="false" %>

<c:set var="lastStrong" value="<none>" />
<c:forEach var="result" items="${ results }">
    <c:set var="fontName" value="${ fn:startsWith(result.strongNumber, 'H') ? 'hbFontMini' : 'unicodeFontMini' }" />
    <c:choose>
        <c:when test="${ sortType eq 'ORIGINAL_SPELLING' and result.strongNumber != lastStrong }">
            <h4 class="searchResultStrongHeader" strongNumber="${ result.strongNumber }"><span class="${fontName}">${ result.accentedUnicode }</span> (<em class="stepTransliteration">${ result.stepTransliteration}</em>): ${ result.stepGloss }</h4>
        </c:when>
        <c:when test="${ sortType eq 'VOCABULARY' and result.strongNumber != lastStrong }">
            <h4 class="searchResultStrongHeader" strongNumber="${ result.strongNumber }">${ result.stepGloss } (<em class="stepTransliteration">${ result.stepTransliteration}</em>): <span class="${fontName}">${ result.accentedUnicode }</span></h4>
        </c:when>
    </c:choose>
    <c:set var="lastStrong" value="${ result.strongNumber }" />
    <div class="searchResultRow">
        <div class="searchResultRow">
            ${ result.preview }
        </div>
    </div>
</c:forEach>
