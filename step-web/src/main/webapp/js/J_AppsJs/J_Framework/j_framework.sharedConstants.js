/******************************************************************************/
/* URLs etc.

   This contains definitions for external URLs which may possibly turn out to
   be used in more than one place, giving us just a single place to maintain.

   You need to maintain the _Links table as necessary.

   Then set up your various 'a' tags as:

     <a class='jFrameworkLink' href='@xyz' ...> ... </a>

   where xyz is one of the keys here.  The '@' at the front is optional but
   it may help make it clearer that some form of indirection is invovled.

   And finally, you need to call setHrefs somewhere in your startup code.

   This class is also a convenient place to store more general constant
   values.  You can use getValue to obtain the value associated with a key,
   either because the value you wish to obtain is not a URL, or because you
   need to do something more specific with it than simply replace hrefs in
   'a' tags.

   The argument to getValue may optionally begin with an '@', which is
   ignored.
/*

/******************************************************************************/
'use strict';


/******************************************************************************/
export class JFrameworkSharedConstants
{
    /**************************************************************************/
    static _Constants = {
	biblicalTimeline: 'https://www.TheBiblicalTimeline.org',
	stepBibleChronologyDoc: 'https://docs.google.com/document/d/1RM8mtL8zfimRVTFQn7yfskQO0VxgjNrs5Y3Qd1WZ9CU/edit?tab=t.0',
	ussher: 'https://docs.google.com/document/d/1C35-x0vSCCePlAygvmh2eciwHLv_cs8G/preview',

	chapterSummariesData: 'html/json/J_AppsJson/J_Framework/J_ChapterSummaries/j_framework_chapterSummaries.tsv',
	placesData: 'html/json/J_AppsJson/J_Framework/J_Places/j_framework_places.json',

	genealogySplit3: 'html/J_AppsHtml/J_Genealogy/j_peopleSplit3.html',
	multimap: 'html/multimap.html',
    };


    /**************************************************************************/
    /* Returns the value for a given key, or null if there is no associated
       value.  The key may optionally start with '@', which is ignored. */
    
    static getValue (key)
    {
	if (key.startsWith('@')) key = key.slice(1);
	return JFrameworkSharedConstants._Constants[key];
    }
    
	
    /**************************************************************************/
    static setHrefs ()
    {
	document.querySelectorAll('.jFrameworkLink').forEach(link => {
	    var key = link.getAttribute('href');
	    var href = JFrameworkSharedConstants.getValue(key);
	    if (href)
		link.setAttribute('href', href);
	});
    }
}

