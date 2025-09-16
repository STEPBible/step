/******************************************************************************/
/* Miscellaneous utilities. */
/******************************************************************************/

/******************************************************************************/
'use strict';


/******************************************************************************/
/* The caller should not bother creating one of these -- I create one here
   (at the bottom of the file) and you can just use that. */

class _ClassJFrameworkUtils
{
    /**************************************************************************/
    amDateToBcDate (amDate)
    {
	return amDate - 2083 - 2091;
    }

    
    /**************************************************************************/
    bcDateToAmDate (bcDate)
    {
	return bcDate - 2091 + 2083;
    }

    
    /**************************************************************************/
    /* Determines if the present window is in an iframe. */

    amInIframe ()
    {
	try
	{
            return window.self !== window.top;
	}
	catch (e)
	{
            return true;
	}
    }
	

    /**************************************************************************/
    /* Helper function for use when you have things like pop-up menus, which
       you wish to hide if the user clicks outside of them.  The method takes
       a list of items, each of which may be either a single selector string
       (eg '#myMenu', '.myMenuClass' or something more complicated, or may
       be a list containing two selectors.

       Best described by example:

       You pass '#myMenuA', '.myMenuClass' as arguments.  The first, we assume,
       identifies a single element, and the second perhaps three.  The
       function looks at each of these in turn.  If it is currently visible
       and the click event occurred outside it, it is hidden.

       Or suppose you pass ['#myMenu', '#myMenuButton'].  In this case it
       starts by looking at items identified by the _second_ selector.  Let's
       assume that there _is_ actually something with id = 'myMenuButton',
       so this selects that single item.  Only if the event did _not_ occur
       within that item does it check the first item (the #myMenu).  If it
       _does_ check it, and if the event fell outside of it, again the item
       is hidden.

       This second form is needed to cater for things like the example I
       have just given: if you have a button which brings up a menu, clicking
       on the button should bring the button up.  But a click on the button
       will be outside of the menu itself, and that would then immediately
       hide the menu.  Having this second argument enables you to avoid this
       problem. */
    
    arrangeToHideItemsIfClickOutside (... selectors)
    {
	document.addEventListener('click', function(event) {
	    selectors.forEach(selector => {
		var dontHideIfWithin = null;
		
		if (Array.isArray(selector))
		{
		    dontHideIfWithin = selector[1];
		    for (var el of document.querySelectorAll(dontHideIfWithin))
		    {
			const showClass = Array.from(el.classList).find(className => /^jframework.*-show$/.test(className));
			if ((showClass || el.style.display !== "none") && el.contains(event.target))
			    return;
		    
			document.querySelectorAll(selector[0]).forEach(el => {
			    const showClass = Array.from(el.classList).find(className => /^jframework.*-show$/.test(className));
			    if (showClass)
				el.classList.remove(showClass);
			    else if (el.style.display !== "none" && !el.contains(event.target))
				el.style.display = "none";
			});
		    }
		}
		
		else
		    document.querySelectorAll(selector).forEach(el => {
			const showClass = Array.from(el.classList).find(className => /^jframework.*-show$/.test(className));
			if (showClass)
			    el.classList.remove(showClass);
			else if (el.style.display !== "none" && !el.contains(event.target))
			    el.style.display = "none";
		});
	    });
	});
    }

    
    /**************************************************************************/
    /* Determines if a colour is dark or light. */

    isDark (colour)
    {
	const rgb = this.toRgb(colour);
	const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b; // sRGB luminance
	return luminance < 128; // threshold
    }


    /**************************************************************************/
    /* Converts any CSS colour designation to { r:..., g:..., b:... }. */
    
    toRgb (colour)
    {
	/*********************************************************************/
	if (colour.startsWith("#"))
	{
	    let hex = colour.slice(1);
	    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
	    const num = parseInt(hex, 16);
	    return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255
	    };
	}



	/*********************************************************************/
	const rgbMatch = colour.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbMatch)
	{
	    return {
		r: parseInt(rgbMatch[1], 10),
		g: parseInt(rgbMatch[2], 10),
		b: parseInt(rgbMatch[3], 10)
	    };
	}


	/*********************************************************************/
	/* Handle named colours by letting the browser convert them */

	const temp = document.createElement("div");
	temp.style.color = colour;
	document.body.appendChild(temp);
	const computed = getComputedStyle(temp).colour;
	document.body.removeChild(temp);
	return parseColour(computed);
    }


    /**************************************************************************/
    _fullToAbbreviatedNameMappings = {
	'Genesis': ['Gen', 'Gen'],
	'Exodus': ['Exo', 'Exod'],
	'Leviticus': ['Lev', 'Lev'],
	'Numbers': ['Num', 'Num'],
	'Deuteronomy': ['Deu', 'Deut'],
	'Joshua': ['Jos', 'Josh'],
	'Judges': ['Jdg', 'Judg'],
	'Ruth': ['Rut', 'Ruth'],
	'1 Samuel': ['1Sa', '1Sam'],
	'2 Samuel': ['2Sa', '2Sam'],
	'1 Kings': ['1Ki', '1Kgs'],
	'2 Kings': ['2Ki', '2Kgs'],
	'1 Chronicles': ['1Ch', '1Chr'],
	'2 Chronicles': ['2Ch', '2Chr'],
	'Ezra': ['Ezr', 'Ezra'],
	'Nehemiah': ['Neh', 'Neh'],
	'Esther': ['Est', 'Esth'],
	'Job': ['Job', 'Job'],
	'Psalms': ['Psa', 'Ps'],
	'Proverbs': ['Pro', 'Prov'],
	'Ecclesiastes': ['Ecc', 'Eccl'],
	'Song of Solomon': ['Sng', 'Song'],
	'Isaiah': ['Isa', 'Isa'],
	'Jeremiah': ['Jer', 'Jer'],
	'Lamentations': ['Lam', 'Lam'],
	'Ezekiel': ['Ezk', 'Ezek'],
	'Daniel': ['Dan', 'Dan'],
	'Hosea': ['Hos', 'Hos'],
	'Joel': ['Jol', 'Joel'],
	'Amos': ['Amo', 'Amos'],
	'Obadiah': ['Oba', 'Obad'],
	'Jonah': ['Jon', 'Jonah'],
	'Micah': ['Mic', 'Mic'],
	'Nahum': ['Nam', 'Nah'],
	'Habakkuk': ['Hab', 'Hab'],
	'Zephaniah': ['Zep', 'Zeph'],
	'Haggai': ['Hag', 'Hag'],
	'Zechariah': ['Zec', 'Zech'],
	'Malachi': ['Mal', 'Mal'],
	'Matthew': ['Mat', 'Matt'],
	'Mark': ['Mrk', 'Mark'],
	'Luke': ['Luk', 'Luke'],
	'John': ['Jhn', 'John'],
	'Acts': ['Act', 'Acts'],
	'Romans': ['Rom', 'Rom'],
	'1 Corinthians': ['1Co', '1Cor'],
	'2 Corinthians': ['2Co', '2Cor'],
	'Galatians': ['Gal', 'Gal'],
	'Ephesians': ['Eph', 'Eph'],
	'Philippians': ['Php', 'Phil'],
	'Colossians': ['Col', 'Col'],
	'1 Thessalonians': ['1Th', '1Thess'],
	'2 Thessalonians': ['2Th', '2Thess'],
	'1 Timothy': ['1Ti', '1Tim'],
	'2 Timothy': ['2Ti', '2Tim'],
	'Titus': ['Tit', 'Titus'],
	'Philemon': ['Phm', 'Phlm'],
	'Hebrews': ['Heb', 'Heb'],
	'James': ['Jas', 'Jas'],
	'1 Peter': ['1Pe', '1Pet'],
	'2 Peter': ['2Pe', '2Pet'],
	'1 John': ['1Jn', '1John'],
	'2 John': ['2Jn', '2John'],
	'3 John': ['3Jn', '3John'],
	'Jude': ['Jud', 'Jude'],
	'Revelation': ['Rev', 'Rev'],
	'Tobit': ['Tob', 'Tob'],
	'Judith': ['Jdt', 'Jdt'],
	'Additions to Esther (Greek)': ['Esg', 'EsthGr'],
	'Wisdom of Solomon': ['Wis', 'Wis'],
	'Sirach': ['Sir', 'Sir'],
	'Baruch': ['Bar', 'Bar'],
	'Epistle of Jeremiah': ['Lje', 'EpJer'],
	'Song of the Three Young Men': ['S3y', 'PrAzar'],
	'Susannah': ['Sus', 'Sus'],
	'Bel and the Dragon': ['Bel', 'Bel'],
	'1 Maccabees': ['1Ma', '1Macc'],
	'2 Maccabees': ['2Ma', '2Macc'],
	'3 Maccabees': ['3Ma', '3Macc'],
	'4 Maccabees': ['4Ma', '4Macc'],
	'1 Esdras (Greek)': ['1Es', '1Esd'],
	'2 Esdras (Latin)': ['2Es', '2Esd'],
	'Prayer of Manasseh': ['Man', 'PrMan'],
	'Psalm 151': ['Ps2', 'AddPs'],
	'Odae': ['Oda', 'Odes'],
	'Psalms of Solomon': ['Pss', 'PssSol'],
	'Joshua A': ['Jsa', 'JoshA'],
	'Judges B': ['Jdb', 'JudgB'],
	'Tobit S': ['Tbs', 'TobS'],
	'Susannah Th': ['Sst', 'SusTh'],
	'Daniel Th': ['Dnt', 'DanTh'],
	'Bel and the Dragon Th': ['Blt', 'BelTh'],
	'Epistle to the Laodiceans': ['Lao', 'EpLao'],
	'4 Ezra': ['Eza', '4Ezra'],
	'5 Ezra': ['5Ez', '5Ezra'],
	'6 Ezra': ['6Ez', '6Ezra']
    };
    
    
    convertFullNameToUsxAbbreviation (fullBookName)
    {
	var res = this._fullToAbbreviatedNameMappings[fullBookName];
	if (null !== res)
	    res = res[0];
	return res;
    }


    convertFullNameToOsisAbbreviation (fullBookName)
    {
	var res = this._fullToAbbreviatedNameMappings[fullBookName];
	if (null !== res)
	    res = res[1];
	return res;
    }


    /**************************************************************************/
    /* You can use this if you have a section of code which takes a long time
       to run, and therefore risks making the web page appear sluggish. */
    
    debounce (fn, delay = 100)
    {
	let timeout;
	return (...args) => {
	    clearTimeout(timeout);
	    timeout = setTimeout(() => fn(...args), delay);
	};
    }


    /**************************************************************************/
    /* Checks to see whether the screen width is above or below 'threshold' and
       then runs either small or large screenSettings code as appropriate.

       Either may be null, in which case that particular code does nothing.

       The method returns the return value of whatever it ends up calling --
       although there is no need for the methods to return anything where a
       return value would be meaningless. */
    
    doResponsive (smallScreenSettings, largeScreenSettings)
    {
	const windowWidth = window.top.innerWidth;
	if (windowWidth >= this.getStandardMediaWidthSplit())
	{
	    if (null != largeScreenSettings)
		return largeScreenSettings();
	}
	else
	    if (null != smallScreenSettings)
		return smallScreenSettings();
    }


    /**************************************************************************/
    /* Given something like 'myPage.html' returns a full URL for it.  The
       argument should not start with a slash -- you just want the bit after
       that. */
    
    getFullUrl (page)
    {
	if (page.startsWith('/'))
            page = page.slice(1);

	return window.location.origin + "/" + page;
    }


    /**************************************************************************/
    /* You need to be careful with innerWidth.  For starters, it includes the
       width of any scrollbar, so it may not always be what you want -- although
       if your only interest is whether we have a large or a small screen, it
       probably doesn't matter hugely. */
    
    getMasterWindowWidth ()
    {
	if (this.amInIframe())
	    return window.parent.innerWidth;
	else
	    return window.innerWidth;
    }


    /**************************************************************************/
    /* Returns the standard value which we normally use to mark the boundary
       between small and large screens. */
    
    getStandardMediaWidthSplit ()
    {
	const rootStyles = window.getComputedStyle(document.documentElement);
	const x = rootStyles.getPropertyValue('--minimumSizeOfBigScreens');
	if (x)
	    return parseInt(x.trim());
	else
	    return 960; // Probably is 960 anyway, but I'd prefer to pick it up from CSS as above if I can so there's only one copy.
    }

    
    /**************************************************************************/
    /* Does what it says on the tin. */
    
    isLargeScreen ()
    {
	return this.doResponsive( () => false, () => true);
    }

    
    /**************************************************************************/
    makeGenealogyUrlBasedOnStrong (strong)
    {
	return this.getFullUrl(`html/J_AppsHtml/J_Genealogy/j_peopleSplit3.html?strong=${strong}`);
    }


    /**************************************************************************/
    makeMapUrl (coords, strong, placeName, book)
    {
	return this.getFullUrl(`html/multimap.html?coord=${coords}&strong=${strong}&gloss=${placeName}&book=${book}`);
    }


    /**************************************************************************/
    makeOpenBiblePhotoDetailUrl (specificContentSelector)
    {
	return this._makeOpenBibleGeneralPhotoUrl(specificContentSelector, 'ancient');
    }


    /**************************************************************************/
    makeOpenBiblePhotoOnlyUrl (specificContentSelector)
    {
	return this._makeOpenBibleGeneralPhotoUrl(specificContentSelector, 'photo');
    }


    /**************************************************************************/
    _makeOpenBibleGeneralPhotoUrl (specificContentSelector, type)
    {
	return `https://www.openbible.info/geo/${type}/` + specificContentSelector;
    }


    /**************************************************************************/
    /* Gets the id of the current frame.  Also copes with being at the top
       level rather than in a frame, in which case it returns null. */
    
    myFrameId ()
    {
	try
	{
	    return window.frameElement.id;
	}
	catch (e)
	{
	    return null;
	}
    }


    /**************************************************************************/
    /* Standard processing to set up onload and onresize processing.

       As I discovered to my cost, if the onload function sets up code which
       the onresize function relies upon, it is possible to get a race
       condition, where resize is invoked before onload is complete.

       The way to get round this is relatively straightofrward, but not _so_
       straightforward that you'd want to have to remember what to do all
       the time.

       You pass to this function just the basic code which you want to run
       on load, plus optionally the basic code you want to run on resize.

       The resize function, if there is one, is used as-is.  But the onload
       function is extended, such that it starts by removing the onresize
       handler if there is one, then runs the onload and then reinstates
       onresize.  This ensures that onresize can't attempt to do anything
       while the load is in progress.

       Finally, it calls the onresize function to make sure that any resize
       event which occurred in the interim is actioned. */
    
    setOnloadEtc (onloadFn, onresizeFn = null)
    {
	function extendedOnloadFn ()
	{
	    if (null != onresizeFn) window.removeEventListener('resize', onresizeFn);
	    onloadFn();
	    if (null != onresizeFn) window.addEventListener('resize', onresizeFn);
	    if (null != onresizeFn) onresizeFn();
	}

	window.onload = extendedOnloadFn();
    }


    /**************************************************************************/
    /* Checks if there is a frame / tag with the given name. */
    
    targetExists (targetName)
    {
	if (this.amInIframe())
	    return window.parent.document.getElementById(targetName) ? true : false;
	else
	    return false;
    }
}

export const JFrameworkUtils = new _ClassJFrameworkUtils();
