// Author: Raymond Hill
// Version: 2011-01-17
// Title: HTML text hilighter
// Permalink: http://www.raymondhill.net/blog/?p=272
// Purpose: Hilight portions of text inside a specified element, according to a search expression.
// Key feature: Can safely hilight text across HTML tags.
// History:
//   2012-01-29
//     fixed a bug which caused special regex characters in the
//     search string to break the highlighter

function doHighlight(node,className,searchFor,which){
	var doc = document;

	// normalize node argument
	if (typeof node === 'string') {
		node = doc.getElementById(node);
		}

	// normalize search arguments, here is what is accepted:
	// - single string
	// - single regex (optionally, a 'which' argument, default to 0)
	if (typeof searchFor === 'string') {
		// rhill 2012-01-29: escape regex chars first
		// http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
		searchFor = new RegExp(searchFor.replace(/[.*+?|()\[\]{}\\$^]/g,'\\$&'),'ig');
		}
	which = which || 0;

	// initialize root loop
	var indices = [],
		text = [], // will be morphed into a string later
		iNode = 0,
		nNodes = node.childNodes.length,
		nodeText,
		textLength = 0,
		stack = [],
		child, nChildren,
		state;
	// collect text and index-node pairs
	for (;;){
		while (iNode<nNodes){
			child=node.childNodes[iNode++];
			// text: collect and save index-node pair
			if (child.nodeType === 3){
				indices.push({i:textLength, n:child});
				nodeText = child.nodeValue;
				text.push(nodeText);
				textLength += nodeText.length;
				}
			// element: collect text of child elements,
			// except from script or style tags
			else if (child.nodeType === 1){
				// skip style/script tags
				if (child.tagName.search(/^(script|style)$/i)>=0 || $(child).hasClass("note")){
					continue;
					}
				// add extra space for tags which fall naturally on word boundaries
				if (child.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i)<0){
					text.push(' ');
					textLength++;
					}
				// save parent's loop state
				nChildren = child.childNodes.length;
				if (nChildren){
					stack.push({n:node, l:nNodes, i:iNode});
					// initialize child's loop
					node = child;
					nNodes = nChildren;
					iNode = 0;
					}
				}
			}
		// restore parent's loop state
		if (!stack.length){
			break;
			}
		state = stack.pop();
		node = state.n;
		nNodes = state.l;
		iNode = state.i;
		}

	// quit if found nothing
	if (!indices.length){
		return;
		}

	// morph array of text into contiguous text
	text = text.join('');

	// sentinel
	indices.push({i:text.length});

	// find and hilight all matches
	var iMatch, matchingText,
		iTextStart, iTextEnd,
		i, iLeft, iRight,
		iEntry, entry,
		parentNode, nextNode, newNode,
		iNodeTextStart, iNodeTextEnd,
		textStart, textMiddle, textEnd;

	// loop until no more matches
	for (;;){

		// find matching text, stop if none
		matchingText = searchFor.exec(text);
		if (!matchingText || matchingText.length<=which || !matchingText[which].length){
			break;
			}

		// calculate a span from the absolute indices
		// for start and end of match
		iTextStart = matchingText.index;
		for (iMatch=1; iMatch < which; iMatch++){
			iTextStart += matchingText[iMatch].length;
			}
		iTextEnd = iTextStart + matchingText[which].length;

		// find entry in indices array (using binary search)
		iLeft = 0;
		iRight = indices.length;
		while (iLeft < iRight) {
			i=iLeft + iRight >> 1;
			if (iTextStart < indices[i].i){iRight = i;}
			else if (iTextStart >= indices[i+1].i){iLeft = i + 1;}
			else {iLeft = iRight = i;}
			}
		iEntry = iLeft;

		// for every entry which intersect with the span of the
		// match, extract the intersecting text, and put it into
		// a span tag with specified class
		while (iEntry < indices.length){
			entry = indices[iEntry];
			node = entry.n;
			nodeText = node.nodeValue;
			parentNode = node.parentNode;
			nextNode = node.nextSibling;
			iNodeTextStart = iTextStart - entry.i;
			iNodeTextEnd = Math.min(iTextEnd,indices[iEntry+1].i) - entry.i;

			// slice of text before hilighted slice
			textStart = null;
			if (iNodeTextStart > 0){
				textStart = nodeText.substring(0,iNodeTextStart);
				}

			// hilighted slice
			textMiddle = nodeText.substring(iNodeTextStart,iNodeTextEnd);

			// slice of text after hilighted slice
			textEnd = null;
			if (iNodeTextEnd < nodeText.length){
				textEnd = nodeText.substr(iNodeTextEnd);
				}

			// update DOM according to found slices of text
			if (textStart){
				node.nodeValue = textStart;
				}
			else {
				parentNode.removeChild(node);
				}
			newNode = doc.createElement('span');
			newNode.appendChild(doc.createTextNode(textMiddle));
			newNode.className = className;
			parentNode.insertBefore(newNode,nextNode);
			if (textEnd){
				newNode = doc.createTextNode(textEnd);
				parentNode.insertBefore(newNode,nextNode);
				indices[iEntry] = {n:newNode,i:iTextEnd}; // important: make a copy, do not overwrite
				}

			// if the match doesn't intersect with the following
			// index-node pair, this means this match is completed
			iEntry++;
			if (iTextEnd <= indices[iEntry].i){
				break;
				}
			}
		}
	}