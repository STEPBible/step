/******************************************************************************/
/* If there is any chance that the overall application may run in an iframe
   controlled by someone else, we may want to be able to exchange messages
   with the owner to inform the owner of changes, or to respond to requests
   from the owner.

   This class gives a rough outline what might be required.  I have neither
   exercised this nor given it much thought, so it will almost certainly need
   significantly more work.

   In fact, in the context of the 4-panel layouts, I would imagine the chances
   of ever needing one of these is remote -- you'd have 4 panels within one
   panel, and quite possibly one of those four panels would itself have
   a tabbed dialog ...

   A Jamieson   STEPBible   Nov 2026.
*/

/******************************************************************************/
class _XXXXXX_SampleMessageHandler
{
    /**************************************************************************/
    receivedMessage (event)
    {
	switch (event.data?.type)
	{
	    case "sb:mapping-change-place": { /* ... */ break; }
	}
    }


    /**************************************************************************/
    postMessageToParentIframeChangedMasterItem (source, data)
    {
	const message = { type: "sb:mapping-changed-place",
			  source: source,
			  version: 1,
			  firstTime: 0 == this._nthCall++,
			  place: this._makePlaceDetails(data),
			  uStrong: data.uStrong,
			  dStrong: data.dStrong,
			  uniqueId: data.uniqueId,
			  openBibleId: data.openBibleId,
			  openBibleName: data.openBibleUrlName };
	window.parent.postMessage(message, "*");
    }


    /**************************************************************************/
    postMessageToParentIframeChangedScriptureRef (source, ref)
    {
	const message = { type: "sb:mapping-changed-scripture-ref", source: source, version: 1, ref: ref };
	window.parent.postMessage(message, "*");
    }

    
    /**************************************************************************/
    postMessageToParentIframeChangedScriptureStrong (source, strong)
    {
	const message = { type: "sb:mapping-changed-scripture-strong", source: source, version: 1, strong: strong };
	window.parent.postMessage(message, "*");
    }

    
    /**************************************************************************/
    _makePlaceDetails (data)
    {
	return { uStrong: data.uStrong,
		 dStrong: data.dStrong,
		 uniqueId: data.uniqueId,
		 openBibleId: data.openBibleId,
		 openBibleName: data.openBibleUrlName
	       };
    }
}


/******************************************************************************/
export class J_ClassApplicationSpecificEmbeddedApi
{
    /**************************************************************************/
    constructor (messageHandler, allowedOrigins = null)
    {
	this._messageHandler = messageHandler;
	this._allowedOrigins = allowedOrigins;
	window.addEventListener("message", event => {
	    if (!J_Utils.runningInIframe()) return;
	    if (event.source !== window.parent) return;
	    if (this._allowedOrigins && !this._allowedOrigins.includes(event.origin)) return;
	    this._messageHandler.receivedMessage(event);
	});
    }

    
    /**************************************************************************/
    _nthCall = 0;
    postMessageToParentIframeChangedMasterItem (source, data)
    {
	if (!J_Utils.runningInIframe()) return;
	this._messageHandler.postMessageToParentIframeChangedMasterItem(source, data, 0 == this._nthCall++);
    }
    

    /**************************************************************************/
    postMessageToParentIframeChangedScriptureRef (source, ref)
    {
	if (!J_Utils.runningInIframe()) return;
	this._messageHandler.postMessageToParentIframeChangedScriptureRef(source, ref);
    }
	

    /**************************************************************************/
    postMessageToParentIframeChangedScriptureStrong (source, strong)
    {
	if (!J_Utils.runningInIframe()) return;
	this._messageHandler.postMessageToParentIframeChangedScriptureStrong(source, strong);
    }
	


}






