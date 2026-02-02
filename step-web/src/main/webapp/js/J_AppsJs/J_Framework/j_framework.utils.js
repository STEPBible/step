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
    /* Tries to arrange a vertically scrolling container so that the given Y
       position is centred within it -- doing something sensible if the height
       of the content is not enough to make centring possible. */
    
    centrePointVerticallyWithinScrollingContainer (container, targetY)
    {
	const containerHeight = container.clientHeight;
	const contentHeight = container.scrollHeight;

	// Compute ideal scroll position so that targetY is centered
	var desiredScrollTop = parseFloat(targetY) - containerHeight / 2;

	// Clamp within scrollable range
	desiredScrollTop = Math.max(0, Math.min(desiredScrollTop, contentHeight - containerHeight));

	container.scrollTo({
	    top: desiredScrollTop
	});
    }

    
    /**************************************************************************/
    /* Caters for eg 1000 BC, 20 AD and AM 0.  The program which generates the
       chronology data for use here converts all dates to an overall numbering
       scheme.  This takes a date in raw form and converts it to that same
       scheme. */
    
    convertToUnifiedYear (yearWithScheme)
    {
	if (yearWithScheme.includes('AD'))
	    return parseInt(yearWithScheme, 10) + 2083 + 2091;
	else if (yearWithScheme.includes('BC'))
	    return 2091 - parseInt(yearWithScheme) + 2083;
	else
	    return parseInt(yearWithScheme); // Assume AM, which starts from zero and therefore requires no conversion.
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
    /* Lightens a given colour by a given factor.  The colour can be anything
       acceptable to toRgb, including the rgb(...) value which you get if you
       read colours from an existing element -- getComputedStyle(elt).color or
       whatever. */
    
    lightenColour (colour, factor)
    {
	var x = this.toRgb(colour);
	var r = x.r;
	var g = x.g;
	var b = x.b;
	
	r = Math.round(r + (255 - r) * factor);
	g = Math.round(g + (255 - g) * factor);
	b = Math.round(b + (255 - b) * factor);

	return `rgb(${r}, ${g}, ${b})`;	
    }

    
    /**************************************************************************/
    /* Converts any CSS colour designation to { r:..., g:..., b:... }. */
    
    toRgb (colour)
    {
	const match = colour.match(/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
	if (match)
	{
	    let [_, R, G, B] = match.map(Number);
	    return { r: R, g : G, b: B };
	}



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
    /* Full book name, USX abbreviation and OSIS abbreviation.  Dummy entries
       are required to make the offsets into the list tie up with the UBS
       numbering scheme. */
    
    _bookNamesAndAbbreviations = [
	/*   0 */ ['DUMMY0', 'AAA', 'AAA'],
	/*   1 */ ['Genesis', 'Gen', 'Gen'],
	/*   2 */ ['Exodus', 'Exo', 'Exod'],
	/*   3 */ ['Leviticus', 'Lev', 'Lev'],
	/*   4 */ ['Numbers', 'Num', 'Num'],
	/*   5 */ ['Deuteronomy', 'Deu', 'Deut'],
	/*   6 */ ['Joshua', 'Jos', 'Josh'],
	/*   7 */ ['Judges', 'Jdg', 'Judg'],
	/*   8 */ ['Ruth', 'Rut', 'Ruth'],
	/*   9 */ ['1 Samuel', '1Sa', '1Sam'],
	/*  10 */ ['2 Samuel', '2Sa', '2Sam'],
	/*  11 */ ['1 Kings', '1Ki', '1Kgs'],
	/*  12 */ ['2 Kings', '2Ki', '2Kgs'],
	/*  13 */ ['1 Chronicles', '1Ch', '1Chr'],
	/*  14 */ ['2 Chronicles', '2Ch', '2Chr'],
	/*  15 */ ['Ezra', 'Ezr', 'Ezra'],
	/*  16 */ ['Nehemiah', 'Neh', 'Neh'],
	/*  17 */ ['Esther', 'Est', 'Esth'],
	/*  18 */ ['Job', 'Job', 'Job'],
	/*  19 */ ['Psalms', 'Psa', 'Ps'],
	/*  20 */ ['Proverbs', 'Pro', 'Prov'],
	/*  21 */ ['Ecclesiastes', 'Ecc', 'Eccl'],
	/*  22 */ ['Song of Solomon', 'Sng', 'Song'],
	/*  23 */ ['Isaiah', 'Isa', 'Isa'],
	/*  24 */ ['Jeremiah', 'Jer', 'Jer'],
	/*  25 */ ['Lamentations', 'Lam', 'Lam'],
	/*  26 */ ['Ezekiel', 'Ezk', 'Ezek'],
	/*  27 */ ['Daniel', 'Dan', 'Dan'],
	/*  28 */ ['Hosea', 'Hos', 'Hos'],
	/*  29 */ ['Joel', 'Jol', 'Joel'],
	/*  30 */ ['Amos', 'Amo', 'Amos'],
	/*  31 */ ['Obadiah', 'Oba', 'Obad'],
	/*  32 */ ['Jonah', 'Jon', 'Jonah'],
	/*  33 */ ['Micah', 'Mic', 'Mic'],
	/*  34 */ ['Nahum', 'Nam', 'Nah'],
	/*  35 */ ['Habakkuk', 'Hab', 'Hab'],
	/*  36 */ ['Zephaniah', 'Zep', 'Zeph'],
	/*  37 */ ['Haggai', 'Hag', 'Hag'],
	/*  38 */ ['Zechariah', 'Zec', 'Zech'],
	/*  39 */ ['Malachi', 'Mal', 'Mal'],
	/*  40 */ ['DUMMY40', 'BBB', 'BBB'],
	/*  41 */ ['Matthew', 'Mat', 'Matt'],
	/*  42 */ ['Mark', 'Mrk', 'Mark'],
	/*  43 */ ['Luke', 'Luk', 'Luke'],
	/*  44 */ ['John', 'Jhn', 'John'],
	/*  45 */ ['Acts', 'Act', 'Acts'],
	/*  46 */ ['Romans', 'Rom', 'Rom'],
	/*  47 */ ['1 Corinthians', '1Co', '1Cor'],
	/*  48 */ ['2 Corinthians', '2Co', '2Cor'],
	/*  49 */ ['Galatians', 'Gal', 'Gal'],
	/*  50 */ ['Ephesians', 'Eph', 'Eph'],
	/*  51 */ ['Philippians', 'Php', 'Phil'],
	/*  52 */ ['Colossians', 'Col', 'Col'],
	/*  53 */ ['1 Thessalonians', '1Th', '1Thess'],
	/*  54 */ ['2 Thessalonians', '2Th', '2Thess'],
	/*  55 */ ['1 Timothy', '1Ti', '1Tim'],
	/*  56 */ ['2 Timothy', '2Ti', '2Tim'],
	/*  57 */ ['Titus', 'Tit', 'Titus'],
	/*  58 */ ['Philemon', 'Phm', 'Phlm'],
	/*  59 */ ['Hebrews', 'Heb', 'Heb'],
	/*  60 */ ['James', 'Jas', 'Jas'],
	/*  61 */ ['1 Peter', '1Pe', '1Pet'],
	/*  62 */ ['2 Peter', '2Pe', '2Pet'],
	/*  63 */ ['1 John', '1Jn', '1John'],
	/*  64 */ ['2 John', '2Jn', '2John'],
	/*  65 */ ['3 John', '3Jn', '3John'],
	/*  66 */ ['Jude', 'Jud', 'Jude'],
	/*  67 */ ['Revelation', 'Rev', 'Rev'],
	/*  68 */ ['Tobit', 'Tob', 'Tob'],
	/*  69 */ ['Judith', 'Jdt', 'Jdt'],
	/*  70 */ ['Additions to Esther (Greek)', 'Esg', 'EsthGr'],
	/*  71 */ ['Wisdom of Solomon', 'Wis', 'Wis'],
	/*  72 */ ['Sirach', 'Sir', 'Sir'],
	/*  73 */ ['Baruch', 'Bar', 'Bar'],
	/*  74 */ ['Epistle of Jeremiah', 'Lje', 'EpJer'],
	/*  75 */ ['Song of the Three Young Men', 'S3y', 'PrAzar'],
	/*  76 */ ['Susannah', 'Sus', 'Sus'],
	/*  77 */ ['Bel and the Dragon', 'Bel', 'Bel'],
	/*  78 */ ['1 Maccabees', '1Ma', '1Macc'],
	/*  79 */ ['2 Maccabees', '2Ma', '2Macc'],
	/*  80 */ ['3 Maccabees', '3Ma', '3Macc'],
	/*  81 */ ['4 Maccabees', '4Ma', '4Macc'],
	/*  82 */ ['1 Esdras (Greek)', '1Es', '1Esd'],
	/*  83 */ ['2 Esdras (Latin)', '2Es', '2Esd'],
	/*  84 */ ['Prayer of Manasseh', 'Man', 'PrMan'],
	/*  85 */ ['Psalm 151', 'Ps2', 'AddPs'],
	/*  86 */ ['Odae', 'Oda', 'Odes'],
	/*  87 */ ['Psalms of Solomon', 'Pss', 'PssSol'],
	/*  88 */ ['Joshua A', 'Jsa', 'JoshA'],
	/*  89 */ ['Judges B', 'Jdb', 'JudgB'],
	/*  90 */ ['Tobit S', 'Tbs', 'TobS'],
	/*  91 */ ['Susannah Th', 'Sst', 'SusTh'],
	/*  92 */ ['Daniel Th', 'Dnt', 'DanTh'],
	/*  93 */ ['Bel and the Dragon Th', 'Blt', 'BelTh'],
	/*  94 */ ['Epistle to the Laodiceans', 'Lao', 'EpLao'],
	/*  95 */ ['DUMMY95', 'CCC', 'CCC'],
	/*  96 */ ['DUMMY96', 'DDD', 'DDD'],
	/*  97 */ ['DUMMY97', 'EEE', 'EEE'],
	/*  98 */ ['DUMMY98', 'FFF', 'FFF'],
	/*  99 */ ['DUMMY99', 'GGG', 'GGG'],
	/* 100 */ ['DUMMY100', 'HHH', 'HHH'],
	/* 101 */ ['DUMMY101', 'III', 'III'],
	/* 102 */ ['DUMMY102', 'JJJ', 'JJJ'],
	/* 103 */ ['DUMMY103', 'KKK', 'KKK'],
	/* 104 */ ['DUMMY104', 'LLL', 'LLL'],
	/* 105 */ ['4 Ezra', 'Eza', '4Ezra'],
	/* 106 */ ['5 Ezra', '5Ez', '5Ezra'],
	/* 107 */ ['6 Ezra', '6Ez', '6Ezra']
    ];
    
    

    /**************************************************************************/
    /* Various conversions.  May be useful to add to the list at some point,
       but without any overt requirement to do so, I haven't bothered at
       present. */
    
    convertFullNameToOsisAbbreviation (fullName)
    {
	const bookNo = this.convertFullNameToUsxBookNo(fullName);
	return this._bookNamesAndAbbreviations[bookNo][2];
    }


    /**************************************************************************/
    convertFullNameToUsxAbbreviation (fullName)
    {
	const bookNo = this.convertFullNameToUsxBookNo(fullName);
	return this._bookNamesAndAbbreviations[bookNo][1];
    }


    /**************************************************************************/
    convertAnyBookIdToUsxBookNo (fullNameOrAbbreviation)
    {
	var       res = this.convertUsxAbbreviationToUsxBookNo (fullNameOrAbbreviation);
	if (!res) res = this.convertOsisAbbreviationToUsxBookNo(fullNameOrAbbreviation);
	if (!res) res = this.convertFullNameToUsxBookNo        (fullNameOrAbbreviation);
	return res;
    }

    
    /**************************************************************************/
    convertFullNameToUsxBookNo (fullName)
    {
	if (!this._fullNameToUsxBookNo)
	{
	    this._fullNameToUsxBookNo = new Map();
	    this._bookNamesAndAbbreviations.forEach((entry, i) => { this._fullNameToUsxBookNo.set(entry[0], i); });
	}

	return this._fullNameToUsxBookNo.get(fullName);
    }
	

    /**************************************************************************/
    convertOsisAbbreviationToUsxAbbreviation (osisAbbreviation)
    {
	const bookNo = this.convertOsisAbbreviationToUsxBookNo(osisAbbreviation);
	return this._bookNamesAndAbbreviations[bookNo][1];
    }

    
    /**************************************************************************/
    convertOsisAbbreviationToUsxBookNo (osisAbbreviation)
    {
	if (!this._osisAbbreviationToUsxBookNo)
	{
	    this._osisAbbreviationToUsxBookNo = new Map();
	    this._bookNamesAndAbbreviations.forEach((entry, i) => { this._osisAbbreviationToUsxBookNo.set(entry[3], i); });
	}

	return this._osisAbbreviationToUsxBookNo.get(osisAbbreviation);
    }
	

    /**************************************************************************/
    convertUsxAbbreviationToOsisAbbreviation (usxAbbreviation)
    {
	const bookNo = this.convertUsxAbbreviationToUsxBookNo(usxAbbreviation);
	return this._bookNamesAndAbbreviations[bookNo][2];
    }

    
    /**************************************************************************/
    convertUsxAbbreviationToUsxBookNo (usxAbbreviation)
    {
	if (!this._usxAbbreviationToUsxBookNo)
	{
	    this._usxAbbreviationToUsxBookNo = new Map();
	    this._bookNamesAndAbbreviations.forEach((entry, i) => { this._usxAbbreviationToUsxBookNo.set(entry[1], i); });
	}

	return this._usxAbbreviationToUsxBookNo.get(usxAbbreviation);
    }
	


    /**************************************************************************/
    /* Converts a BC refkey to something of the form Gen.1 (using USX
       abbreviations. */
    
    convertBCRefKeyToStringRef (refKey)
    {
	const bookNo = Math.floor(refKey / 1000);
	const chapter = refKey % 1000;
	return this._bookNamesAndAbbreviations[bookNo] + '.' + chapter;
    }

    
    /**************************************************************************/
    /* Converts eg Gen.1 to the equivalent BC key.  The book portion may be a
       full name, a USX abbreviation or an OSIS abbreviation.  Book and
       chapter may be separated by any consecutive run of non-word
       characters. */
    
    convertStringRefToBCRefKey (ref)
    {
	const [book, chapter] = ref.split(/\W+/);
	const bookNo = this.convertAnyBookIdToUsxBookNo(book);
	return 1000 * bookNo + parseInt(chapter, 10);
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
