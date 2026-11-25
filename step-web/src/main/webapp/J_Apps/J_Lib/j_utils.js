/******************************************************************************/
/* Miscellaneous utilities.

   A Jamieson   Oct 2026.
*/

class _J_Utils
{
    /**********************************************************************/
    /* A number of applications create links to invoke other functionality.
       For instance, the mapping application has an info-box which tags
       the names of people, so that you can click on the names and be taken
       to the Genealogy details for those people.  This is handled by
       creating a STEPBible URL which contains appropriate parameters, and
       then opening this, typically in another tab.

       The BaseUrls below give the start of the relevant flavour of URL.
       One advantage of splitting them out like this is that it give you
       the chance, during development work, of overriding the default
       settings here, and making them point somewhere else. */
    
    BaseUrlForProductionStepBible = "https://www.stepbible.org/";
    BaseUrlForStepBible = window.location.href.includes("8989") ? (window.location.href + "/") : this.BaseUrlForProductionStepBible;
    BaseUrlForChronologyFunctionality = this.BaseUrlForStepBible + "html/J_AppsHtml/J_Chronology/j_chronologySplit3.html";
    BaseUrlForGenealogyFunctionality  = this.BaseUrlForStepBible + "html/J_AppsHtml/J_Genealogy/j_peopleSplit3.html";
    BaseUrlForPlaceFunctionality      = this.BaseUrlForStepBible + "html/J_Places/application.html";

    
    /**********************************************************************/
    /* Used when displaying a list of names.  nameList is a string holding
       a number of names, slash-separated and possibly precededed and
       followed by slashes.

       Any duplicates are removed.

       If it contains two elements which are identical except that one
       contains dashes between words, and one contains spaces ('Ramoth
       Gilead' vs 'Ramoth-Gilead'), it drops the dash separated one.

       Also if it contains a one-word name and a multi-word name starting
       with that one-word name, it drops the one-word name and retains
       the multi-word form, with all but the first word in parentheses:

         Ramoth   and   Ramoth Gilead  ==> Ramoth (Gilead).

      The result is returned as a single string, with elements separated
      by 'separator'. */
    
    compactNameList (nameList, separator)
    {	
	/* Dedupe case-insensitively, keeping the first instance (with its own casing). */
	const seen = new Set();
	const elements = nameList.replace(/^\/|\/$/g, "")
              .replaceAll("-", " ")
              .split("/")
              .filter(e => e !== "")
              .filter(e => { const k = e.toLowerCase(); return seen.has(k) ? false : (seen.add(k), true); });

	const lower = elements.map(e => e.toLowerCase());
	const result = [...elements];
	const dropped = new Set();                       // Indexes to remove.

	elements.forEach((shorter, i) => {
            if (dropped.has(i)) return;
            const j = lower.findIndex((e, k) => k !== i && !dropped.has(k) && e.startsWith(lower[i] + " "));
            if (j === -1) return;

            const merged = `${shorter} (${elements[j].slice(shorter.length + 1)})`;
            result[Math.min(i, j)] = merged;             // Whichever came first keeps its slot.
            dropped.add(Math.max(i, j));
	});

	return result.filter((_, i) => !dropped.has(i)).join(separator);
    }

    
    /**********************************************************************/
    /* Displays a fading welcome message on startup, unless surpressed. */
    
    displayWelcomeIfRequired (popupSelector, message, fadeDuration)
    {
	const wantWelcome = null === this.getParameterFromUrl("skipwelcome");
	if (!wantWelcome) return;
	const welcomePopup = document.querySelector(popupSelector);
	if (welcomePopup) welcomePopup.show(message, fadeDuration);
    }


    /**********************************************************************/
    getMyFileName ()
    {
	return window.location.pathname.split("/").pop();
    }


    /**********************************************************************/
    /* Gets parameter values from the current URL.

       paramNameOrNames may be a single value, in which case the result
       is the value of that parameter, or null if not found.

       Or it may be a list of names, which function as alternatives, in
       which the processing runs through the list in order, and returns
       a pair comprising the name of the first matching parameter and
       its value, or null if there are no matches.

       This second form is mainly to support legacy functionality.
       For example, when I rewrite the Mapping functionality, I wanted
       to take a parameter 'show' as indicating what should be displayed.
       But we alreaady had a lot of places which called the _old_
       functionality, and were passing a parameter 'strongs', so I
       needed to cater for both.

       The lookup is case insenstive, so if you ask for "Show", it will
       match "show" as well.  This is true regardless of whether you
       are asking for a single parameter, or are offering a list of
       alternatives.

       In the latter case -- where the return value, if non-null,
       returns a two-element list, the first element being the
       parameter name, the name is returned in the form you
       passed to the method.

       So if you have said you are prepared to accept both 'Strong'
       and 'Show', and the URL actually contains 'show', you will get
       back the value associated with 'show', but the associated
       name will be the 'Show' you passed in the arguments to the
       method. */
    
    getParameterFromUrl (paramNameOrNames)
    {
	const params = new Map([...new URLSearchParams(location.search)].map(([k, v]) => [k.toLowerCase(), v]));

	if ("string" === typeof paramNameOrNames)
	    return params.get(paramNameOrNames.toLowerCase());

	for (const paramName of paramNameOrNames)
	{
	    const res = params.get(paramName.toLowerCase())
	    if (res)
		return [paramName, res];
	}

	return null;	    
    }

    
    /**********************************************************************/
    /* Looks for tags matching the input parameter -- either all template
       tags if you accept the default, or all tags matching your override
       (such as all tags with class .my-tag.

       We then take the id of each of the selected tags.  So long as it
       is of the form xxx-content, we assume that there is some other tag
       with the id xxx, and we append the content of the xxx-content tag
       to xxx.

       If things fail to match, the method silently does nothing. */
    
    initialiseTemplates (selector = "template")
    {
	document.querySelectorAll(selector).forEach(template => {
            const targetId = template.id.replace(/-content$/, "");
	    if (targetId !== template.id)
	    {
		const target = document.getElementById(targetId);
		if (target) target.appendChild(template.content.cloneNode(true));
	    }
	});
    }


    /**********************************************************************/
    /* Not foolproof, but better than nothing. */
    
    isServedFromLocalhost ()
    {
	const hostname = window.location.hostname
              .toLowerCase()
              .replace(/^\[|\]$/g, "");

	return (
            hostname === "localhost" ||
		hostname.endsWith(".localhost") ||
		hostname === "127.0.0.1" ||
		hostname === "::1"
	);
    }


    /**********************************************************************/
    makeUrlForChronologyGivenYear (year, extraUrlParms = null)
    {
	const urlAsString = this.BaseUrlForChronologyFunctionality + `?year=${year}` + (extraUrlParms ? `&${extraUrlParms}` : "");
	return (new URL(urlAsString)).toString();
    }


    /**********************************************************************/
    /* The place is drawn centred in a box which covers lat +/- delta and
       lon +/- delta.  This uses openStreetMap. */
    
    makeUrlForOpenStreetMap (lat, lon, delta = 0.5)
    {
	const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
	return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=cyclemap&marker=${lat},${lon}`;
    }


    /**********************************************************************/
    makeUrlForPersonGivenUStrong (uStrong, extraUrlParms = null)
    {
	const urlAsString = this.BaseUrlForGenealogyFunctionality + `?strong=${uStrong}` + (extraUrlParms ? `&${extraUrlParms}` : "");
	return (new URL(urlAsString)).toString();
    }


    /**********************************************************************/
    makeUrlForPlaceGivenAnySelector (selector, extraUrlParms = null)
    {
	const urlAsString = this.BaseUrlForPlaceFunctionality + `?show=${selector}` + (extraUrlParms ? `&${extraUrlParms}` : "");
	return (new URL(urlAsString)).toString();
    }


    /**********************************************************************/
    makeUrlForPlaceGivenUStrong (uStrong, extraUrlParms = null)
    {
	const urlAsString = this.BaseUrlForPlaceFunctionality + `?show=${uStrong}` + (extraUrlParms ? `&${extraUrlParms}` : "");
	return (new URL(urlAsString)).toString();
    }


    /**********************************************************************/
    /* The place is drawn centred at the given zoom level.  'shade=1' means
       that the map as first drawn already has relief shading visible. */
    
    makeUrlForProprietaryMap (baseUrl, name, lat, lon, zoom = 10)
    {
	return `${baseUrl}/j_map.html?lat=${lat}&lon=${lon}&zoom=${zoom}&shade=1&name=${name}`;
    }


    /**************************************************************************/
    /* Updates a frame using which is display STEPBible details, based upon a
       list of Strongs values. */
    
    makeUrlForScriptureGivenListOfDStrong (listOfDStrongAsString)
    {
	//@srchJoin=(1o2o3o4o5o6o7o8o9o10o11o12o13o14o15o16o17o18o19o20o21)@strong=H3389@strong=H3390...
	const listOfDStrong = listOfDStrongAsString.slice(1, -1).split("/");
	const srchJoin = "@srchJoin=(" + Array.from({ length: listOfDStrong.length }, (_, i) => i + 1).join("o") + ")";
	const strongText = listOfDStrong.map(s => "@strong=" + s).join("");
	return `${this.BaseUrlForProductionStepBible}?skipwelcome&q=${srchJoin}${strongText}&options=NGVUH`;
    }


    /**************************************************************************/
    /* Updates a frame using which is display STEPBible details, based upon a
       list of scripture refs.  If there is more than one ref, they should be
       separated by commas or semicolons. */
    
    makeUrlForScriptureGivenRefs (refs)
    {
	return `${this.BaseUrlForProductionStepBible}/?skipwelcome&q=@reference=${refs}&options=NGVUH`;
    }


    /**********************************************************************/
    /* Resolves all the links in a string which uses my own standard tags.
       This might typically be used in an info-box, where a textual field
       contains tags identifying people etc, we want to turn them into
       genuine HTML links which will bring up Genealogy data or whatever.

       You can pass things like { chronology: { ...} } as an argument to
       control what the input tags turn into.

       There are rather too many complications here, but anyway ...

       The method you call is resolveInfoBoxLinks.  You pass it the HTML
       containing the links you want to resolve, along with any overrides
       to the basic config, and any parameter settings (as a string --
       "myParm=Hello").

       The config information overrides the built-in config which you
       specify as the last parameter to resolveInfoBoxLinks.  You can
       opt here either for the default config (which creates a mixture
       of buttons and <a> tags), or for the 'no-link' config, which
       converts all links to simple spans, with no associated functionality.

       In the overrides, the 'as' parameter decides what kind of thing you
       want:

         'a' -> an <a> tag, in which case the target value indicates what
           the target should be.

        'button' -> a button tag.

        'span' -> A span tag.  In this case, the effect is that you end
	  up with just the content of the input tag, but with no
          associated functionality.


      extraUrlParms lets you specify additional URL parameters to form
      part of the URL.  person: "myParm=Hello", for instance. */

    _TARGET = this.runningInIframe() ? "_self" : "_blank";
    
    _RESOLVE_INFO_BOX_LINKS_DEFAULT_CONFIG = {
	chronology:  { as: "a",      target: this._TARGET, targetWhenPointingAtSelf: "_self" },
	person:      { as: "a",      target: this._TARGET, targetWhenPointingAtSelf: "_self" },
	place:       { as: "a",      target: this._TARGET, targetWhenPointingAtSelf: "_self" },
	generalNoun: { as: "button", variant: "j-show-general-noun" },
	reference:   { as: "button", variant: "j-show-scripture-in-existing-iframe" },
	ambiguous:   { as: "span" },
	ignore:      { as: "span" }
    }

    _RESOLVE_INFO_BOX_LINKS_NO_LINKS_CONFIG = {
	chronology:  { as: "span" },
	generalNoun: { as: "span" },
	person:      { as: "span" },
	place:       { as: "span" },
	reference:   { as: "span" },
	ambiguous:   { as: "span" },
	ignore:      { as: "span" }
    }

    getDefaultLinkConfig () { return this._RESOLVE_INFO_BOX_LINKS_DEFAULT_CONFIG; }
    getNoLinksConfig () { return this._RESOLVE_INFO_BOX_LINKS_NO_LINKS_CONFIG; }
    resolveInfoBoxLinks (html, configOverrides = {}, extraUrlParms = {}, baseConfig = this.getDefaultLinkConfig())
    {
	const specs = { ...baseConfig, ...configOverrides };    // Shallow merge: an override replaces that kind's whole spec.
	const template = document.createElement("template");
	template.innerHTML = html;

	this._resolveEmbeddedChronologyLinks (template, specs.chronology,  extraUrlParms.chronolgy);
	this._resolveEmbeddedPersonLinks     (template, specs.person,      extraUrlParms.person);
	this._resolveEmbeddedPlaceLinks      (template, specs.place,       extraUrlParms.place);
	this._resolveEmbeddedGeneralNounLinks(template, specs.generalNoun, extraUrlParms.generalNoun);
	this._resolveEmbeddedReferenceLinks  (template, specs.reference,   extraUrlParms.reference);
	this._resolveEmbeddedAmbiguousLinks  (template, specs.ambiguous)
	this._resolveEmbeddedIgnoreLinks     (template, specs.ignore);

	return template.innerHTML;
    }
    
    
    /**********************************************************************/
    runningInIframe ()
    {
	return window.parent !== window;
    }

    
    /**********************************************************************/
    /* I'm not sure whether we will ever want to use this.  It interacts
       with the details set out in j_common.css, in order to change
       between light and dark mode.  All of this represents Claude's
       suggestion, but I'm not sure whether we already have our own
       approach with which things ought to interact.  If you feel the
       need to use this, it would probably be a good idea to do what I
       never did, and find out if there is, in fact, a STEPBible
       mechanism already in existence. */
    
    setColourScheme (scheme) // "light" | "dark" | "auto"
    {
	if ("auto" === scheme)
	    delete document.documentElement.dataset.theme;
	else
	    document.documentElement.dataset.theme = scheme;
    }


    /**********************************************************************/
    /* Turns XX-AMBIGUOUS links into ... probably into not very much. */

    _resolveEmbeddedAmbiguousLinks (template, config)
    {
	const elements = [...document.querySelectorAll("*")]
	      .filter(el => el.tagName.startsWith("SB-AMBIGUOUS"));
	
	elements.forEach(tag => {
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, otherData: null });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Turns SB-CHRONOLOGY links into STEPBible chronology links. */

    _resolveEmbeddedChronologyLinks (template, config, extraUrlParms)
    {
	template.content.querySelectorAll("SB-CHRONOLOGY").forEach(tag => {
            const href = this.makeUrlForChronologyGivenYear(tag.getAttribute("year"), extraUrlParms);
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, pointingAtSelf: tag.hasAttribute("forCurrentItem"), otherData: href });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Turns SB-GENERAL-NOUN links into something appropriately
       clickable. */
    
    _resolveEmbeddedGeneralNounLinks (template, config, extraUrlParms)
    {
	template.content.querySelectorAll("SB-GENERAL-NOUN").forEach(tag => {
	    const uStrong = tag.getAttribute("u");
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, pointingAtSelf: tag.hasAttribute("forCurrentItem"), otherData: uStrong });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Turns SB-IGNORE links into ... probably into not very much. */

    _resolveEmbeddedIgnoreLinks (template, config)
    {
	template.content.querySelectorAll("SB-IGNORE").forEach(tag => {
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, otherData: null });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Turns SB-PERSON links into STEPBible genealogy links. */
    
    _resolveEmbeddedPersonLinks (template, config, extraParams, extraUrlParms)
    {
	template.content.querySelectorAll("SB-PERSON").forEach(tag => {
            const href = this.makeUrlForPersonGivenUStrong(tag.getAttribute("u"), extraUrlParms);
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, pointingAtSelf: tag.hasAttribute("forCurrentItem"), otherData: href });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Turns SB-PLACE links into STEPBible Place links. */
    
    _resolveEmbeddedPlaceLinks (template, config, extraUrlParms)
    {
	template.content.querySelectorAll("SB-PLACE").forEach(tag => {
            const href = this.makeUrlForPlaceGivenUStrong(tag.getAttribute("u"), extraUrlParms);
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, pointingAtSelf: tag.hasAttribute("forCurrentItem"), otherData: href });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    /* Note that this works differently from the other _resolve functions.

       Those create <a> tags, which open up the target information in a
       new tab.

       The assumption here is that you will be operating in a 4-panel
       layout in which one of the panels is alreaady showing scripture
       information, and you will want to target that panel, rather than
       opening a new tab.

       We therefore generate a button to do this, but style it to look
       like a plain vanilla link. */
    
    _resolveEmbeddedReferenceLinks (template, config, extraUrlParms)
    {
	template.content.querySelectorAll("SB-REF").forEach(tag => {
            const ref = tag.getAttribute("ref");
	    const replacementTag = this._resolveLinksHelper(config, { clickableContent: tag.childNodes, pointingAtSelf: tag.hasAttribute("forCurrentItem"), otherData: ref });
	    tag.replaceWith(replacementTag)
	});

	return template;
    }


    /**********************************************************************/
    _resolveLinksHelper (config, { clickableContent, pointingAtSelf, otherData })
    {
	/*****************************************************************/
	const childNodes = [...clickableContent];



	/*****************************************************************/
	/* If we ever decide that self links should be rendered as genuine
	   links, just comment out this portion of the code. */
	
	if (pointingAtSelf)
	{
	    const span = document.createElement("span");
	    span.classList.add("j-self-link-as-non-link");
	    span.append(... childNodes);
	    return span;
	}



	
	/*****************************************************************/
	if ("a" === config.as)
	{
	    const a = document.createElement("a");
	    a.append(... childNodes);
	    a.href = otherData;
	    a.target = config.target ?? "_blank";
	    a.classList.add("j-link-without-decoration");
	    if ("_blank" === a.target) a.rel = "noopener";
	    if (pointingAtSelf)
	    {
		a.target = "_self";
		a.classList.add("j-link-for-current-item");
	    }

	    return a;
	}



	/*****************************************************************/
	if ("button" === config.as)
	{
            const button = document.createElement("button");
            button.type = "button";
            button.className = `j-common-link-button ${config.variant}`;
            if (undefined !== otherData) button.dataset.data = otherData;     // For onContentClick("button[data-ref]", ...)
            button.append(...childNodes);
            return button;
	}



	/*****************************************************************/
	if ("span" === config.as)
	{
	    const span = document.createElement("span");
	    span.append(...childNodes);
	    return span;
	}
    }
}

export const J_Utils = new _J_Utils();





/******************************************************************************/
/******************************************************************************/
/*                                                                            */
/*                                 Debouncer                                  */
/*                                                                            */
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
export class J_UtilsDebouncer
{
    _lastValue;
    _hasValue = false;
    
    isSameAsPrevious (value)
    {
        if (this._hasValue && Object.is(value, this._lastValue))
            return true;

        this._lastValue = value;
        this._hasValue = true;
        return false;
    }
}
