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
	  "<tr>" +
	    "<td class='jframework-tb_col tb_col_1 jframework-clickable'>" + displayName + "</td>" +
	    "<td class='jframework-tb_col tb_col_2 jframework-clickable'>" + shortDescriptionWhere + shortDescription + "</td>" +
	  "</tr>";

	return res;
    }


    /**************************************************************************/
    /* A function which checks what the user has typed into the text box
       against the various rows.  The match is based on the start of the input,
       and allows for the possibility that the user may be using an alternative
       name.

       There are two potential versions of this function.  The version
       actually properly implemented below -- which is the original approach
       -- looks only at the left-hand (name) column of the table.  Each
       cell in that column may contain either a single name or a number of
       alternatives.

       The search is case-insensitive, and looks only for matches starting
       at the beginning of each string.  (I deliberately chose to match
       only at the _start_ of each string because quite a lot of names also
       appear within other names.)


       The alternative approach -- commented out below -- added to these
       a second test based upon the second column of the table (the
       description column).  This test is again case-insensitive, but in
       this case is applied anywhere in the string.

       It was at one time thought that this would give additional flexibility,
       for instance looking for all entries referring to 'king', to cater for
       the possibility that the user might remember they were looking for a
       king, but not which one.  The trouble was that this gave a huge number
       of false positives -- very many entries contain that word, because
       very many people are recorded as having performed some particular
       activity for a king.

       In view of this, the code is currently commented out, but I've been
       asked to retain it, just in case. */
    
    rowMatcherFn (row, userInput)
    {
	return this.rowMatcherFnA(row, userInput);    // $$$  || this._rowMatcherFnB(row, userInput);
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



    
