/******************************************************************************/
/* Miscellaneous code shared among more than one file. */

'use strict';

export class ClassGenealogySharedCode
{
    
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                        People index lookups                          **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Returns the HTML for a single row of the lookup table.  The row consists
       of two cells, one given the name of the person and any alternative
       names, and one giving summary information about them. */
    
    makeSearchTableRowHtml (key, rec)
    {
	var shortDescription = rec.shortDescription.split('(')[0].trim();
	if (!shortDescription.endsWith('.')) shortDescription += '.';

	const x = key.split('@');
	var displayName = x[0]; // Name portion only.
	if (displayName.includes('built'))
	{
	    const bits = displayName.split('_built_');
	    displayName = bits[0] + ' (built ' + bits[1] + ')';
	}
			
	const alternativeNames = 1 == rec.allNames.length ? '' : '<br>' + rec.allNames.slice(1).map( str => str.split('@')[0] ).join('<br>');
	if (0 != alternativeNames.length)
	{
	    displayName += ' &bull; or ...';
	    displayName += alternativeNames;
	}

	const shortDescriptionWhere = `At ${x[1].split('-')[0]}` + (x[1].includes('-') ? ' etc' : '') + '. ';
			
	const res =  
	  `<tr data-personIndexWithinOverallSearchTable='${rec.ix}'>` + // Oct 2025.  Need an easy way of relating table rows back to the underlying entries in the search table.
	    "<td class='jframework-tb_col tb_col_1 jframework-clickable'>" + displayName + "</td>" +
	    "<td class='jframework-tb_col tb_col_2 jframework-clickable'>" + shortDescriptionWhere + shortDescription + "</td>" +
	  "</tr>";

	return res;
    }


    /**************************************************************************/
    /* A function which checks what the user has typed into the text box
       against the various rows.  The match is based on the start of the input,
       and allows for the possibility that the user may be using an alternative
       name. */
    
    rowMatcherFn (row, userInput)
    {
	return this.rowMatcherFnA(row, userInput); // Oct 2025 || this._rowMatcherFnB(row, userInput);
    }
    
    rowMatcherFnA (row, userInput)
    {
	const re = new RegExp('^' + userInput.replace('-', ''), 'i');
	const entries = row.find('.tb_col_1').html().split('<br>');
		
	for (var ix = 0; ix < entries.length; ++ix)
	{
	    var matchAgainst = entries[ix];
	    matchAgainst = matchAgainst.replace('-', '');
	    if (re.test(matchAgainst)) return true;
	}

	return false;
    }

    _rowMatcherFnB (row, userInput)
    {
	const re = new RegExp(userInput.replace('-', ''), 'i');
	var entry = row.find('.tb_col_2').html();
	entry = entry.replace('-', '');
	return re.test(entry);
    }
}



    
