/******************************************************************************/
/* Code used to support j-chronologyIndex.html. */



  
/******************************************************************************/
'use strict';

import { JFrameworkStepDataAccessors }                  from '/js/J_AppsJs/J_Framework/j_framework.stepDataAccessors.js';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';
import { ClassJFrameworkTableWithSearchBox }            from '/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js';
import { JFrameworkUserSettings }                       from '/js/J_AppsJs/J_Framework/j_framework.userSettings.js';
import { JFrameworkUtils }                              from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { JChronologyData }                              from '/js/J_AppsJs/J_Chronology/j_chronologySharedCode.js';




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
	JChronologyData.loadData(this._initB.bind(this));
	window.addEventListener('blur', () => {
	    this.lostFocus();
	});
    }


    /**************************************************************************/
    /* Called after data-load is complete. */
    
    _initB ()
    {
        /**********************************************************************/
        /* Fill in date and description table. */

        function tableBodyBuilder ()
	{
            var tblBodyHtml = '';
	    var ix = -1;
	    
	    JChronologyData.getEntries().filter ( x => JChronologyData.isAnnotatedYearEntry(x) ) .forEach(dataFileEntry => {
		const tblData = JChronologyData.getAnnotatedYearEvents(dataFileEntry);
		tblData.forEach(tblEntry => {
		    tblEntry = JChronologyData.withLinks(tblEntry);
		    tblBodyHtml +=
			`<tr data-searchTableIx='${++ix}'>` +
 			`<td class='jframework-tb_col tb_col_1 jframework-clickable' data-dataKey='${JChronologyData.getKey(dataFileEntry)}'>${tblEntry}</td>` +
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
    /* This gets called on small screens only.  On these, by default we'd see
       only the search box until the user clics in it, at which point we'd also
       see the search tab;e.  This (inherited) method arrnges for the search
       table to be made visible straight away. */
    
    receiveActivation ()
    {
	const searchBox = document.getElementById('chronologySearchBox');
	searchBox.click();
	searchBox.focus();
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
