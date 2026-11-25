/*
 * Adapter between <j-embedded-frame> and the History Globe page.
 * It is the ONLY place that knows History Globe's message format.
 *
 * !! The message shapes below are PLACEHOLDERS.  Replace the functions in FORMAT with the
 * !! site's documented messages; nothing else in the application needs to change.
 *
 * Events dispatched by the adapter (it is an EventTarget); detail shown in brackets:
 *   ready            ()
 *   place-selected   ({ dStrong })          the user clicked a place inside the globe
 *   year-changed     ({ year })             the user moved the time slider
 *   other            ({ data })             any message we do not recognise (for diagnostics)
 *
 * Methods:
 *   showPlace(dStrong)   ask the globe to centre on / highlight a place
 *   setYear(year)
 *
 * Claude (mainly)   STEPBible   Oct 2026.
 */

/******************************************************************************/
const J_HISTORY_GLOBE_FORMAT = {
    /**************************************************************************/
    /* Incoming messages. */
    
    parse (data)
    {
	/**********************************************************************/
	if (!data || "object" !== typeof data) return null;



	/**********************************************************************/
	switch (data.type)                                     // PLACEHOLDER names
	{
	    case "hg:ready":         return { type: "hg:ready",        data: data.view };
	    case "hg:view-changed":  return { type: "hg:view-changed", data: data.view };
	    case "hg:verse-clicked": return { type: "hg:view-changed", data: data.osis };
	    case "hg:error":         return { type: "hg:error",        data: { code: data.code, message: data.message } };
	    default: return null;
	}
    },

    
    /**************************************************************************/
    /* Outgoing messages. */

    showPlace: dStrong => ({ type: "show-place", dStrong }),   // PLACEHOLDER
};



/******************************************************************************/
class J_ClassHistoryGlobeAdapter extends EventTarget
{
    /**************************************************************************/
    constructor (frame, handler, format = J_HISTORY_GLOBE_FORMAT)
    {
	super();
	this._handler = handler;
	this._frame = frame;
	this._format = format;
	this._onMessage = event => this._handle(event.detail);
	this._onReady = () => this.dispatchEvent(new CustomEvent("ready"));
	frame.addEventListener("frame-message", this._onMessage);
	frame.addEventListener("frame-ready", this._onReady);
    }


    /**************************************************************************/
    destroy ()
    {
	this._frame.removeEventListener("frame-message", this._onMessage);
	this._frame.removeEventListener("frame-ready", this._onReady);
    }


    /**************************************************************************/
    showPlace (dStrong) { this._frame.send(this._format.showPlace(dStrong)); }


    /**************************************************************************/
    setYear (year)      { this._frame.send(this._format.setYear(year)); }


    /**************************************************************************/
    _handle (data)
    {
	this._handler(data);
	const parsed = this._format.parse(data);
	if (!parsed) { this.dispatchEvent(new CustomEvent("other", { detail: { data } })); return; }
	const { type, ...detail } = parsed;
	this.dispatchEvent(new CustomEvent(type, { detail }));
    }
}

export { J_ClassHistoryGlobeAdapter, J_HISTORY_GLOBE_FORMAT  };
