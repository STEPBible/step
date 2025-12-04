/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                   Data                                   **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* The data is in JSON format and comprises four different kinds of records:

   - Details of individual years, giving information about events.
   = Details of which chapters cover a given year.
   - Duration-start records.
   - Duration-end records.


   Data for individual years ('AnnotatedYears') come as individual records.

   Data for chapters also comes as individual records.  Or more accurately,
   if, say, we have an AnnotatedYear for 987 BC and also chapter details
   for that year, the chapter details are amalgamated into the
   AnnotatedYear record.  You only get specific chapter records where the
   date involved does not coincide with an AnnotatedYear date.

   All records are assigned a unique key, made up of one or two letters
   followed by some numbers.  The letters indicate what kind of record
   it is -- AY (AnnotatedYear), C(hapter), Ds (Duration start) or De
   (Duration end).

   The also have what I refer to here as a 'unified year' (uYear), which
   follows the Modern chronology.  This starts from 0 and increases
   monotonically all the way up to AD 90 (the last date in the chronology
   data), and is set up so that the interval between the uYear for two
   events is the same as the chronological interval between them.  Hence
   it can be used for sorting and positioning output data.

   A given year will have at most one AnnotatedYear record or one Chapter
   record.  It may have 'any' number of duration starts and / or ends.

   Where several duration records share the same year, there is no
   guarantee as to the ordering amongst them.  But if duration records
   share a year with an event record, the duration records are guaranteed
   to come out _after_ the event record.

   Duration records are not displayed to the user -- they simply mark the
   start and end of the duration lines which show, for instance, the
   lifespan of a given individual.

   It might be felt that mixing durations and events was a complication,
   and possibly in some respects it is.  However, it does bring with it
   a significant advantage, in that the code which amends the layout in
   response to (for instance) user decisions to change the font size
   will automatically also cover the changes which have to be made to
   the duration lines.

   Each record has an associated 'unified year'.  This enables you to position
   records on the display.  The very first event has aunified year of zero, and
   all other records have values running forward from that.  This masks the
   difference between the various epoch schemes (AM, BC and AD).  It is this
   unified year which determines the order of the incoming records.

   Each record also has a unique key field.  The keys for event records start
   with 'E', and those for duration starts and ends start with 'Ds' and 'De'
   repsectively.

   The desc field may contain down arrows where a duration starts at that
   date.  Where this is the case, the content looks like:

     <jChronDurationLink style='color:black'>▼</jChronDurationLink>

   which can be transformed so as to colour the down arrow to make it
   mirror the line for the duration.

   The desc, article, and events fields may contain:

    <jLink data-type='P or L' data-strong='G1234' clickHandler>Fred</jLink>
    <jLink data-type='S'      data-ref='Gen.1.2-Gen.1.5' clickHandler>Gen.1.2-5</jLink>


  where the 'P' or 'L' indicates that this is a person or a location.  These
  are to serve as links to maps or genealogy data (both to be loaded in a
  new browser tab).  xChronClick needs to be replaced by appropriate code
  to achieve this.

  The 'S' version makes it possible to update the scripture window instead.
*/

import { JFrameworkUtils } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';

class _ClassJChronologyData
{
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                              Data load                               **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _dataUrl = 'html/json/J_AppsJson/J_Chronology/j_chronology.json';

    
    /**************************************************************************/
    loadData (afterLoadFn)
    {
	Promise.all([this._load(this)])
	    .then(([events]) => { afterLoadFn(); })
	    .catch(error => {
		console.error(`Error loading files: ${error.stack}`);
	    });
    }


    /**************************************************************************/
    _load (dataClass)
    {
	return fetch(JFrameworkUtils.getFullUrl(dataClass._dataUrl))
	    .then(response => {
		if (!response.ok) {
		    throw new Error(`Failed to fetch: ${response.status}`);
		}
		return response.text();
	    })

	    .then(text => { // Success.
		this._data = JSON.parse(text)
		dataClass._index();
		return;
	    })
	
	    .catch(err => {
		console.error('Error in _load', err);
		//throw err; // rethrow if you want the caller to handle it too
	    });
    }


    /**************************************************************************/
    getAlternativeChronologyName (key) { return this._data.HeaderDetails[key]; }
    getAdBcOffset () { return this._data.ModernChronologyDateBoundaries.AdBcOffset; }
    getLastUyearInAm () { return this._data.ModernChronologyDateBoundaries.AmLastAsUyear; }
    getFirstUYearBc () { return this._data.ModernChronologyDateBoundaries.BcFirstAsUyear; }
    getLastAsActualYear () { return parseInt(this._data.ModernChronologyDateBoundaries.LastAsString, 10); }
    getLastAsUyear () { return this._data.ModernChronologyDateBoundaries.LastAsUyear; }
    

    /**************************************************************************/
    getEntries () { return this._data.ChronologyEntries; }
    getEntryGivenElement (elt) { return this._keyMap.get(elt.getAttribute('data-key')); }
    getEntryGivenIndex (ix){ return this.getEntries()[ix]; }
    getEntryGivenKey (key) { return this._keyMap.get(key); }
    getNumberOfEntries ()  { return this.getEntries().length; }

    getField (entry, field) { return entry[field]; }

    getKey                                    (entry) { return entry.key; }
    getUnifiedYear                            (entry) { return entry.uYear; }
    getDescription                            (entry) { return entry.desc; }
    getFlags                                  (entry) { return entry.flags ? entry.flags : ''; }
    getModernDate                             (entry) { return entry.dt_Modern; }
    getUssherDate                             (entry) { return entry.dt_Ussher; }
    
    getChapterRefs                            (entry) { return entry.refs; } // A list of lists, each of the sublists made up of a ref and associated flags.
    getChapterRefsAsString                    (entry) { return this.getChapterRefs(entry).map( x => x[0] ).join('; '); }
    getChaptersFromChapterAndYearData         (entry) { return entry.chaptersFromChapterAndYearData; }
    getChaptersFromChapterAndYearDataAsString (entry) { return this.getChaptersFromChapterAndYearData(entry).map( x => x.ref ).join('; '); }
    
    getDurStartChannelNo                      (entry) { return entry.channelNo; }
    getDurStartColour                         (entry) { return entry.colour; }
    getDurStartIsRegency                      (entry) { return this.getDescription(entry).toLowerCase().includes('regency'); }

    getAnnotatedYearModernDate                (entry) { return this.getModernDate(entry); }
    getAnnotatedYearScriptureRefs             (entry) { return entry.bibleRefs; }
    getAnnotatedYearNonScriptureRefs          (entry) { return entry.nonBibleRefs; }
    getAnnotatedYearArticle                   (entry) { return entry.article; }
    getAnnotatedYearEvents                    (entry) { return entry.events; }

    isAnnotatedYearEntry (entry) { return this.getKey(entry).startsWith('A') }
    isChapterEntry       (entry) { return this.getKey(entry).startsWith('C'); }
    isDurEntry           (entry) { return this.getKey(entry).startsWith('D'); }
    isDurStartEntry      (entry) { return this.getKey(entry).startsWith('Ds'); }
    isDurEndEntry        (entry) { return this.getKey(entry).startsWith('De'); }
    isTickMarkEntry      (entry) { return this.getKey(entry).startsWith('T'); }
    isVisibleEntry       (entry) { return !this.isDurEntry(entry); }

    _markers = new Map();
    _keyToElements = new Map();


    /**************************************************************************/
    clearKeyToElementsMapping ()
    {
	this._keyToElements.length = 0;
    }

    
    /**************************************************************************/
    convertDurationEndKeyToStartKey (startKey)
    {
	return startKey.replace('e', 's');
    }

    
    /**************************************************************************/
    convertDurationStartKeyToEndKey (startKey)
    {
	return startKey.replace('s', 'e');
    }

    
    /**************************************************************************/
    /* Binary search to locate either an entry whose unified year matches a
       given year, or two entries which bracket the unified year. */
    
    findBracketingEntries (year, type = '*')
    {
	/**********************************************************************/
	const me = this;


	
	/**********************************************************************/
	function ignoreDurationEnds (ix)
	{
	    while (me.getKey(me.getEntryGivenIndex(ix)).startsWith('De'))
		--ix;
	    return me.getEntryGivenIndex(ix);
	}


	
	/**********************************************************************/
	function ignoreDurationStarts (ix)
	{
	    while (me.getKey(me.getEntryGivenIndex(ix)).startsWith('Ds'))
		--ix;
	    return me.getEntryGivenIndex(ix);
	}


	
	/**********************************************************************/
	if (!Number.isInteger(year)) year = JFrameworkUtils.convertToUnifiedYear(year);
	var low = 0;
	var high = this.getNumberOfEntries();

	while (low <= high)
	{
	    var mid = Math.floor((low + high) / 2);
	    var entryMid = this.getEntryGivenIndex(mid);
	    const midYear = this.getUnifiedYear(entryMid);

	    if (midYear < year)
	    {
		low = mid + 1;
		continue;
	    }
	    
	    if (midYear > year)
	    {
		high = mid - 1;
		continue;
	    }
	    


	    // Don't want duration starts or ends.  These always follow from the real event we actually want.
	    while (me.getKey(me.getEntryGivenIndex(mid)).startsWith('De') || me.getKey(me.getEntryGivenIndex(mid)).startsWith('Ds'))
		--mid;
	    entryMid = ignoreDurationEnds(mid);

		
	    if ('chapter' == type) // By default we find vanilla events.  Check if we've been asked to find a chapter pseudo event instead.
	    {
		var ix = mid;
		var revisedEntry = null;
		    
		while (true)
		{
		    if (++ix >= this.getNumberOfEntries())
			break;

		    const entry = this.getEntryGivenIndex(ix);
		    const year = this.getUnifiedYear(entry);
		    if (year != midYear)
			break;

		    if (this.getKey(entry).startsWith('EC'))
		    {
			revisedEntry = entry;
			break;
		    }
		}

		if (revisedEntry)
		    entryMid = revisedEntry;
	    }

		
	    return { match: entryMid, prev: entryMid, next: entryMid };
	}

	const prev = ignoreDurationEnds(high) || null;
	const next = ignoreDurationEnds(low)  || null;
	return { match: null, prev: prev, next: next };
    }

    
    /**************************************************************************/
    getEventDescriptionDiv (key)
    {
	return this._keyToElements.get(key)[3];
    }

    
    /**************************************************************************/
    getMarkerGivenKey (key)
    {
	return this._keyToElements.get(key)[2];
    }

    
    /**************************************************************************/
    recordElementsForKey (key, elts)
    {
	this._keyToElements.set(key, elts);
    }


    /**************************************************************************/
    reformatData (fn)
    {
	for (var entryIx = 0; entryIx < this.getNumberOfEntries(); ++entryIx)
	{
	    const entry = this.getEntryGivenIndex(entryIx);

	    if (!this.isAnnotatedYearEntry(entry))
		continue;
	    
	    entry['article'] = fn(entry['article']);
	    entry['events'] = entry['events'].map( s => fn(s) );
	}
    }

    
    /**************************************************************************/
    /* The data as suppplied contains <jLink ...> tags in selected fields,
       naming people or places, and giving the appropriate Strongs tags.
       This method turns them into clickable items. */
    
    withLinks (s)
    {
	return s
	    .replaceAll('<jLink', '<span class="jframework-linkAsButton"')
	    .replaceAll('jLink', 'span')
	    .replaceAll('clickHandler', "onclick='JEventHandlers.handleLink(event)'");
    }


    /**************************************************************************/
    /* See withLinks.  This removes the link tags, but retains
       their content. */
    
    withoutLinks (s)
    {
	return s.replace(/<jLink[^>]*>/g, '')
	        .replaceAll('</jLink>', '');
    }


    /**************************************************************************/
    /* All data items have a unique key, and it's convenient to have a map
       which relates the key to the data item. */
    
    _index ()
    {
	this._keyMap = new Map(this.getEntries().map(inner => [inner.key, inner]));
    }
}

export const JChronologyData = new _ClassJChronologyData();
