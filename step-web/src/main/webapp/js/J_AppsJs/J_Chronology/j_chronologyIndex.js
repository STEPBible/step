/******************************************************************************/
/* Code used to support j-chronologyIndex.html. */



  
/******************************************************************************/
'use strict';

import { JFrameworkStepDataAccessors }                  from '/js/J_AppsJs/J_Framework/j_framework.stepDataAccessors.js';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';
import { ClassJFrameworkTableWithSearchBox }            from '/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js';
import { JFrameworkUserSettings }                       from '/js/J_AppsJs/J_Framework/j_framework.userSettings.js';
import { JFrameworkUtils }                              from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { JChronologyDataUrl }                           from '/js/J_AppsJs/J_Chronology/j_chronologySharedCode.js';




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Table handler                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This class is directly exported for use in j_chronologyIndex.html. */

class _ClassJChronologyTableHandler
{
    /**************************************************************************/
    initialisationComplete = false;


    
    /**************************************************************************/
    init (hideTableWhenNotInUse)
    {
	/**********************************************************************/
	this._hideTableWhenNotInUse = hideTableWhenNotInUse;


	
	/**********************************************************************/
	function fn (firstTime)
	{
	    const background = getComputedStyle(document.documentElement).getPropertyValue("--clrBackground").trim();
	    const tableHighlight = JFrameworkUtils.isDark(background) ? 'rgba(255, 0, 0, 0.4)' : 'rgb(255, 255, 192)';
	    document.documentElement.style.setProperty('--jframework-clrPopUpMenuItemBackgroundUnselected', tableHighlight);
	}
	
	JFrameworkUserSettings.init(fn);


	
	/**********************************************************************/
        var settings = new SettingsModelList;
        settings.fetch();
        if (settings.length > 0)
        {
            step.settings = settings.at(0);
            var sz = step.settings.get('defaultfont');
	    if (typeof sz !== 'number') sz = 15;
            $('table').css('font-size', sz + 'px');
        }



        /**********************************************************************/
        const dataUrl = JFrameworkUtils.getFullUrl(JChronologyDataUrl);
	this._load(dataUrl, this._initB.bind(this));
	window.addEventListener('blur', () => {
	    this.lostFocus();
	});
    }


    /**************************************************************************/
    /* Called after data-load is complete. */
    
    _initB (data)
    {
        /**********************************************************************/
        /* Fill in date and description table. */

        function tableBodyBuilder ()
	{
            var tblBodyHtml = '';
	    var ix = -1;
	    
	    data.forEach(line => {
		const revisedLines = this._withLinks(line.text).split('<jChronCellBreak/>');
		revisedLines.forEach(entry => {
		    tblBodyHtml +=
			`<tr data-searchTableIx='${++ix}'>` +
 			`<td class='jframework-tb_col tb_col_1 jframework-clickable' data-dataKey='${line.key}'>${entry}</td>` +
  			'</tr>';
		});
	    });

	    return tblBodyHtml;
	}



        /**********************************************************************/
	/* Checks if a given row of data matches the user input. */
	
	function rowMatcherFn (row, userInput)
	{
	    if (userInput.length < 2) return true; // Matching against a single character is ridiculous, so just assume everything matches.
	    const text = row[0].querySelector('td')?.textContent
	    return text.toLowerCase().includes(userInput.toLowerCase());
	}



        /**********************************************************************/
	/* Initialise the search table handler. */
	
	this._tableHandlerArgs =
        {
	    headerId: 'header',  
	    searchBoxId: 'chronologySearchBox',
	    tableContainerId: 'chronologyTableContainer',
	    bodyBuilderFn: tableBodyBuilder.bind(this),
	    clickHandlerFn: JEventHandlers.tableClickHandler.bind(JEventHandlers),
	    rowMatcherFn: rowMatcherFn.bind(this),
	    hideTableWhenNotInUse: this._hideTableWhenNotInUse,
	    keepSelectedRowVisible: false,
	};
	
	this._tableHandler = new ClassJFrameworkTableWithSearchBox(this._tableHandlerArgs);
	this._tableHandler.initialise();
	this.initialisationComplete = true;
    }


    /**************************************************************************/
    /* Called if the search table frame loses focus. */
    
    lostFocus ()
    {
	this._tableHandler.owningAppLostFocus();
    }

    
    /**************************************************************************/
    /* Arranges for the table to fill all of the remaining space below the
       header. */
    
    setTableSize ()
    {
	this._tableHandler.setTableSizeOmitting(this._headerHeight);
	this._tableHandler.redraw();
    };



    /**************************************************************************/
    /* Loads the data and then arranges for the next part of the processing to
       do its stuff. */
    
    _load (dataUrl, whenLoadedFn)
    {
	return fetch(dataUrl)
	    .then(response => {
		if (!response.ok) {
		    throw new Error(`Failed to fetch: ${response.status}`);
		}
		return response.text();
	    })

	    .then(text => { // Success.
		const lines = text.split(/\r?\n/);
		if (lines[lines.length - 1].trim() === "") // A newline at the end of the file means the processing sees a blank line, which we do not want.
		    lines.pop();

		const data = lines.map(line => {
		    var fields = line.split('\t', 99);
		    if (fields[0].startsWith('D') || fields[0].startsWith('EC'))
			return null;
		    else
			return { key: fields[0], text: fields[9].replaceAll('jChronDescriptionDate', 'b').trim() }; // Key and extended text fields.
		})

		whenLoadedFn(data.filter(x => x !== null));
	    })
	
	    .catch(err => {
		console.error('Error in _load', err);
		//throw err; // rethrow if you want the caller to handle it too
	    });
    }


    /**************************************************************************/
    _withLinks (s)
    {
	return s
	    .replaceAll('<jLink', '<span class="jframework-linkAsButton"')
	    .replaceAll('jLink', 'span')
	    .replaceAll('clickHandler', "onclick='JEventHandlers.handleLink(event)'");
    }


    /**************************************************************************/
    _withoutLinks (s)
    {
	return s.replaceAll(/<jLink[^>]*>/, '').replaceAll('</jLink>', '');
    }
}

export const JChronologyTableHandler = new _ClassJChronologyTableHandler();





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Event handlers                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This class has been retained so as to maintain some semblance of similarity
   to the equivalent genealogy class.  However, this present class is a mere
   shadow of the genealogy equivalent.  The latter could take on board details
   of selections made elsewhere, and change the content of the search window
   to reflect the selection.  With the chronology data attempting to do that
   doesn't make sense, so there's almost nothing to do here. */

class _ClassJEventHandlers extends ClassJFrameworkMultiframeCommunicationsSlave
{    
    /****************************************************************************/
    handleLink (event)
    {
	event.stopPropagation();

	const tag = event.target;
	
	switch (tag.getAttribute('data-type'))
	{
	    case 'L': { JFrameworkStepDataAccessors.strongLinkToMap      (tag); break; }
	    case 'P': { JFrameworkStepDataAccessors.strongLinkToGenealogy(tag); break; }
	}
    }
    

    /****************************************************************************/
    tableClickHandler (cell, column)
    {
	const key = cell.getAttribute('data-dataKey');
	this.sendMessageTo('chronology', { key: key, source: 'chronologyIndex_searchTableClick' });
    }
}

export const JEventHandlers = new _ClassJEventHandlers();
window.JEventHandlers = JEventHandlers;
