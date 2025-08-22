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

       Originally, the functionality here was that of rowMatcherFnA, which
       looks at the left-hand (name) column of the table only, and matches
       rows where one of the names starts with the user input, hyphens
       ignored and case-insensitive.

       I have since been asked to include _rowMatcherFnB as well.  This is
       a blunter instrument -- it looks in the right-hand (description)
       column which is much longer, for case-insensitive matches anywhere
       at all in the data, again ignoring hyphens.

       I'm not happy with this because this is a much bigger job -- it
       entails doing regex matches on probably something approaching
       0.6 Mb of text, with the processing running on the client which may
       be a relatively low-end processor such as a mobile phone, and is
       going to give many more false positives.  Plus where the original
       would often give you just one row which actually named the person,
       the new version is likely to give you lots of rows for entirely
       different people. */
    
    rowMatcherFn (row, userInput)
    {
	return this.rowMatcherFnA(row, userInput) || this._rowMatcherFnB(row, userInput);
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



    
