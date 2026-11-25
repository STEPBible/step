/******************************************************************************/
/* Implements a standard way of populating the options table of a search box.

   Or in fact, it implements two alternatives -- a do-nothing one, for
   situations where you don't want to support search (an unlikely eventuality),
   and one which I am hoping will be sufficiently standard that in future
   you don't need anything else.

   Having said which, if it turns out you _do_ need something else, you can
   take J_OptionsTableInitialiserCommon as a basis of your own implementation.
*/
/******************************************************************************/

import J_InputBoxWithOptionsTableInterface from "./j_inputBoxWithOptionsTable.js";
import J_ResponsiveLayout                  from "./j_responsiveLayout.js";




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/** A do-nothing implementation for use where you don't actually want search **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

export class J_OptionsTableInitialiserNull
{
    /*************************************************************************/
    process (headerContent, data, fnToCallOnNewInput, fieldSpecs, panelToShowOnNewInputOnTabbedDisplays)
    {
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**               A common implementation -- see notes below.                **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This is extrapolating rather from the Places application to the idea that
   in future other applications may work in a very similar manner.

   You must pass to the 'process' method:

   - The text or HTML which you want as the header which appears above the
     search box to explain what this is all about.

   - The actual data (discussed below).

   - A couple of field names used to access elements of the data.

   - A function which is called when the user selects new input.


   The data must be in the form of a list of records.  Each must have
   one field, identified by 'shortNameFieldName', which gives short
   names which appear in the left-hand column of the options table.

   Slashes in this field are replaced by <br>.  Leading and trailing
   slashes, if any, are removed.

   The second field name is supposed to identify a slightly longer
   description which goes in the right-hand column of the table.

   When the user selects a new item, the supplied function is called
   passing to it the number of the row in the data which represents
   the selected item. */
   

export class J_OptionsTableInitialiserCommon
{
    /**********************************************************************/
    /* The default columns.  'overrides' is an optional object keyed on field
       name, each value being a set of changes to apply to the default entry
       for that field -- eg { summary: { maxWidth: "80ch" } }.  Entries for
       fields which are not among the defaults are added as new columns. */

    defaultFieldSpecs (overrides = {})
    {
	const specs = [{ fieldName: "names",   width: "20ch", reformatter: this._reformatTypicalNamesField.bind(this) },
		       { fieldName: "summary", maxWidth: "60ch" }];

	Object.entries(overrides).forEach(([fieldName, changes]) => {
	    const existing = specs.find(spec => spec.fieldName === fieldName);
	    if (existing) Object.assign(existing, changes);
	    else specs.push({ fieldName, ...changes });
	});

	return specs;
    }


    /**********************************************************************/
    _reformatTypicalNamesField (text)
    {
	let reformatted = text.replace(/^\/+|\/+$/g, ""); // Remove first and last slashes.
	reformatted = reformatted.replaceAll("/", "<br>");
	return reformatted;
    }

    
    /**********************************************************************/
    /* This does the initialisation.  You need to make sure it is called
       only once, or you'll get multiple listeners stacking up.

       headerContent is used to create a title above the search box to
       explain what's going on.

       data is a list of records which contain the data to go into the
       table (possibly accompanied by other fields not used here).

       fnToCallOnNewInput is a function which is called with when new
       input is selected.  It is called with the rowNo of the matching
       row in 'data'.

       fieldSpecs gives information about the columns to be used in the
       table.  There is one entry in this for each of the fields in
       'data' which are to appear in the table (and hence you can have
       as many columns as you like).  Each entry gives the name of the
       field, and optionally:

       - width:       the width of the column, in any CSS unit ("30ch",
                      "12rem", "25%").  Columns without a width share
                      whatever space is left.

       - maxWidth:    a limit on the length of the lines of text within the
                      column, again in any CSS unit ("60ch").  Longer text
                      wraps.  The column itself can be wider than this (it
                      takes up the space which is left); the text just
                      doesn't stretch across it.

       - reformatter: a function which can be used to reformat the data
                      before it is shown in the table.

       The default settings (see defaultFieldSpecs) reflect the requirements of
       the Mapping functionality, which was the first to use this code.  They
       use the 'names' and 'summary' fields from the 'data' collection.  The
       former is given a width of 30ch and is subject to reformatting, because
       the names field starts and ends with slashes, and contains embedded
       slashes, and we want the various options to come out on separate lines.
       The latter is limited to lines of 60ch.

       To change just a few of the defaults, use defaultFieldSpecs to merge
       your changes into them, matching on field name:

         process(title, data, fn,
                 this.defaultFieldSpecs({ summary: { maxWidth: "80ch" },
                                          names:   { width: "20ch" } }));

       To change the columns altogether, supply your own array.

       panelToShowOnNewInputOnTabbedDisplays is used when the output
       appears on a small screen, where the various panels of the
       large screen layout appear on separate logical tabs.  It
       determines which of the tabs is displayed when the user enters
       new input. */
       
    process (headerContent,
	     data,
	     fnToCallOnNewInput,
	     fieldSpecs = this.defaultFieldSpecs(),
	     panelToShowOnNewInputOnTabbedDisplays = "j-application-specific-holder")
    {
	/******************************************************************/
	const container = document.querySelector("#j-search-container");
	const table = J_InputBoxWithOptionsTableInterface.getSearchTable("j-search-box");
	this._table = table;
	this._data = data;



	/******************************************************************/
	container.setHeader(headerContent);
	container.setRowMatcher(this._filterSearchTable.bind(this));
	function newInput (rowNo) { fnToCallOnNewInput(rowNo); J_ResponsiveLayout.showPanel(panelToShowOnNewInputOnTabbedDisplays); }
	container.addEventListener("j-input-box-with-options-table-row-selected", event => { newInput(event.detail.rowNumber); });


	
	/******************************************************************/
	let html = "<tbody>";



	/******************************************************************/
	data.forEach( (row, index) => {
	    let thisHtml = `<tr n="${index}">`;

	    let additionalClassForThisColumn = " j-input-box-with-options-table-first-column";
	    
	    fieldSpecs.forEach( spec => {
		const rawContent = row[spec.fieldName];
		const colContent = spec.reformatter ? spec.reformatter(rawContent) : rawContent;
		const colWidth = spec.width ? ` style="width:${spec.width}"` : "";
		const content = spec.maxWidth ? `<div class='j-input-box-with-options-table-cell-content' style="max-width:${spec.maxWidth}">${colContent}</div>` : colContent;
		const chunk = `<td class='j-input-box-with-options-table-table-col${additionalClassForThisColumn}'${colWidth}>${content}</td>`;
		thisHtml += chunk;

		additionalClassForThisColumn = "";
	    });

	    thisHtml += "</tr>";
	    html += thisHtml;
	});



	/******************************************************************/
	html += "</tbody>";
	table.innerHTML = html;



	/******************************************************************/
	const searchComponent = document.querySelector("j-input-box-with-options-table");


	/* (The options now float over the page, so the column no longer needs to
	   change size while a search is active.) */

	searchComponent.addEventListener("j-input-box-with-options-table-row-selected", event => {
	    const rowNumber = event.detail.rowNumber;
	    // ... your further processing of rowNumber goes here
	});
    }


    /**************************************************************************/
    /* Hides table rows whose 'names' field doesn't contain a match for the
       current search box content.  An empty search box shows every row.

       Matching is somewhat complicated, because we want, for instance, to
       let the user type in 'Gerizim' and still match 'Mount Gerizim'

       Here's an approximation to the functionality: something matches if:

       - What they have typed so far matches the start of any word in the
         target string (or the start of the target string itself if it is not
         split into separate words).

       - There is appreciable flexibility as regards word separators.  If they
         type a space as a separator, it matches a space OR a dash in the
         target string.  Similarly if they type a dash.  But we also want a
	 match if, by ignoring any separator they have typed, we have a match.
         So, for example, 'fred smith' matches 'fred smith', 'fred-smith'
         and 'fredsmith'.

       - Also if they _fail_ to enter a separator where the target has one,
        this is still regarded as a match.
    */


    _WORD_SEPARATORS = /[\s-]+/;

    _squash (text)
    {
	return text.toLowerCase().split(this._WORD_SEPARATORS).join("");
    }

    _nameMatches (typed, target)
    {
	const words = target.toLowerCase().split(this._WORD_SEPARATORS).filter(Boolean);

	// For each word start, join the remaining words together with no separators
	// and see whether that text begins with what was typed.
	for (let i = 0; i < words.length; i++)
	{
            const fromHere = words.slice(i).join("");
            if (fromHere.startsWith(typed)) return true;
	}
	return false;
    }

    _filterSearchTable (input)
    {
	const normalisedInput = this._squash(input.trim());
	const rows = this._table.querySelectorAll("tr");

	if ("" === normalisedInput)
	{
            rows.forEach(row => row.style.display = "");
            return;
	}

	this._data.forEach((record, index) => {
            const matches = record.names
		  .slice(1, -1)
		  .split("/")
		  .some(name => this._nameMatches(normalisedInput, name));
            const row = this._table.querySelector(`tr[n="${index}"]`);
            if (row) row.style.display = matches ? "" : "none";
	});
    }




    _XXXfilterSearchTable (input)
    {
	function normalise (s) { return s.replace(/-/g, "").toLowerCase(); }
	
	const normalisedInput = normalise(input.trim());
	const rows = this._table.querySelectorAll("tr");

	if ("" === normalisedInput)
	{
	    rows.forEach(row => row.style.display = "");
	    return;
	}

	const needle = "/" + normalisedInput;

	this._data.forEach((record, index) => {
	    const matches = normalise(record.names).includes(needle);
	    const row = this._table.querySelector(`tr[n="${index}"]`);
	    if (row) row.style.display = matches ? "" : "none";
	});
    }
}
