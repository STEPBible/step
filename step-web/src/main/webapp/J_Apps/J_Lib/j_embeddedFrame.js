/******************************************************************************/
/*
 * <j-embedded-frame src="https://example.org/map" allowed-origin="https://example.org">
 *
 * Generic wrapper around an iframe which manages postMessage traffic in both directions.
 * It knows nothing about the site being embedded; put site-specific knowledge in an adapter.
 *
 * Attributes
 *   src               URL of the page to embed (required).
 *   allowed-origin    Only messages from this origin are accepted / sent to.  Defaults to the origin of src.
 *   title             Accessible title for the iframe.
 *   sandbox           Override the default sandbox flags.
 *   ready-message     If present, the frame counts as ready when it posts a message whose
 *                     "type" property equals this value.  Otherwise it is ready on iframe 'load'.
 *   timeout-ms        Fire 'frame-error' if not ready after this long (default 15000, 0 = never).
 *
 * Events (all bubble and are composed, so they cross shadow boundaries)
 *   frame-ready       { }
 *   frame-message     detail = the data posted by the frame
 *   frame-error       detail = { reason }
 *
 * Methods
 *   send(data)        Post data to the frame (queued until the frame is ready).
 *   whenReady()       Promise resolved when the frame is ready.
 *
 * Claude (mainly)   STEPBible   Oct 2026.
 */

class JEmbeddedFrame extends HTMLElement
{
    /**************************************************************************/
    static observedAttributes = [ "src", "title" ];


    /**************************************************************************/
    constructor ()
    {
	super();
	this._ready = false;
	this._queue = [];
	this._readyResolvers = [];
	this._timer = null;
	this._root = this.attachShadow({ mode: "open" });
	this._root.innerHTML = `
	    <style>
		:host { display: block; position: relative; }
		iframe { border: 0; width: 100%; height: 100%; display: block; }
		.status { position: absolute; inset: 0; display: grid; place-items: center;
			  font: var(--j-embedded-frame-font, 1rem sans-serif);
			  color: var(--clr-j-embedded-frame-status, #555); background: var(--clr-j-embedded-frame-bg, transparent); pointer-events: none; }
		.status[hidden] { display: none; }
	    </style>
	    <iframe part="frame"></iframe>
	    <div class="status" part="status">Loading…</div>`;
	this._iframe = this._root.querySelector("iframe");
	this._status = this._root.querySelector(".status");
	this._onMessage = event => this._handleMessage(event);
	this._onLoad = () => { if (!this.hasAttribute("ready-message")) this._markReady(); };
    }


    /**************************************************************************/
    get allowedOrigin ()
    {
	const explicit = this.getAttribute("allowed-origin");
	if (explicit) return explicit;
	try { return new URL(this.getAttribute("src"), location.href).origin; } catch { return null; }
    }



    /**************************************************************************/
    attributeChangedCallback (name)
    {
	if ("title" === name) this._iframe.title = this.getAttribute("title") ?? "";
	if ("src" === name && this.isConnected) this._applySrc();
    }


    /**************************************************************************/
    connectedCallback ()
    {
	window.addEventListener("message", this._onMessage);
	this._iframe.addEventListener("load", this._onLoad);
	this._iframe.setAttribute("sandbox", this.getAttribute("sandbox") ?? "allow-scripts allow-same-origin allow-popups allow-forms");
	this._applySrc();
    }


    /**************************************************************************/
    disconnectedCallback ()
    {
	window.removeEventListener("message", this._onMessage);
	this._iframe.removeEventListener("load", this._onLoad);
	clearTimeout(this._timer);
    }


    /**************************************************************************/
    send (data)
    {
	if (!this._ready) { this._queue.push(data); return; }
	this._post(data);
    }


    /**************************************************************************/
    whenReady () { return this._ready ? Promise.resolve() : new Promise(resolve => this._readyResolvers.push(resolve)); }


    /**************************************************************************/
    _applySrc ()
    {
	const src = this.getAttribute("src");
	if (!src) return;
	this._ready = false;
	this._status.textContent = "Loading…";
	this._status.hidden = false;
	this._iframe.src = src;
	clearTimeout(this._timer);
	const timeout = Number(this.getAttribute("timeout-ms") ?? 15000);
	if (timeout > 0) this._timer = setTimeout(() => { if (!this._ready) this._fail("timeout"); }, timeout);
    }


    /**************************************************************************/
    _emit (name, detail) { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }


    /**************************************************************************/
    _fail (reason)
    {
	this._status.textContent = "This map could not be loaded.";
	this._status.hidden = false;
	this._emit("frame-error", { reason });
    }


    /**************************************************************************/
    _handleMessage (event)
    {
	if (event.source !== this._iframe.contentWindow) return;     // not from our frame
	if (event.origin !== this.allowedOrigin) return;             // from our frame, but from an unexpected page
	const readyType = this.getAttribute("ready-message");
	if (readyType && !this._ready && event.data?.type === readyType) this._markReady();
	this._emit("frame-message", event.data);
    }


    /**************************************************************************/
    _markReady ()
    {
	if (this._ready) return;
	this._ready = true;
	clearTimeout(this._timer);
	this._status.hidden = true;
	this._queue.splice(0).forEach(data => this._post(data));
	this._readyResolvers.splice(0).forEach(resolve => resolve());
	this._emit("frame-ready", {});
    }


    /**************************************************************************/
    _post (data)
    {
	const origin = this.allowedOrigin;
	if (!origin || !this._iframe.contentWindow) return;
	this._iframe.contentWindow.postMessage(data, origin);   // never "*": we only ever talk to the expected origin
    }
}

customElements.define("j-embedded-frame", JEmbeddedFrame);
