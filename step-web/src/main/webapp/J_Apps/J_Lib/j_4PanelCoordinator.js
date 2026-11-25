/******************************************************************************/
/* Coordinates activities amongst the various elements in a 4-panel display.

   Take care -- either here or in the things it relies upon -- to make sure
   that you don't end up in a loop, with a change request from an item X
   turning into an update request to X, which in turn generates a new change
   request.

   A Jamieson   STEPBible   Nov 2026.
*/

import { J_Utils, J_UtilsDebouncer }  from "./j_utils.js"





/******************************************************************************/
class J_ClassPanelHandler
{
    processIncomingChangeRequest (refs, selectionSource, selectionSubsource)
    {
    }
}


/******************************************************************************/
export class J_ClassAppPanelHandler extends J_ClassPanelHandler
{
    processIncomingChangeRequest (data, selectionSource, selectionSubsource)
    {
    }
};


/******************************************************************************/
export class J_ClassInfoBoxPanelHandler extends J_ClassPanelHandler
{
    /**************************************************************************/
    makeExternalLinksText (data)
    {
	return "";
    }

    
    /**************************************************************************/
    makeHeaderText (data)
    {
	return "";
    }


    /**************************************************************************/
    processIncomingChangeRequest (data, selectionSource, selectionSubsource)
    {
	/**********************************************************************/
	/* Initialise info-box-related things just once.  The content of the
	   info-box may include links to genealogy etc.  Some of these 'links'
	   aren't actually links at all -- they are buttons dressed up to look
	   like links, and we set up click-handlers here to process them.

           The first handles clicks on references, and updates the content of
	   the scripture iframe.

	   The second is invoked if you click on a general-noun button, and
	   arranges for details of the noun to be displayed in a pop-up. */

	if (!this._infoBox)
	{
	    const me = this;
	    this._infoBox = document.querySelector("#info-box");
	    this._infoBox.onContentClick("button.j-show-scripture-in-existing-iframe", button => J_4PanelCoordinator.processIncomingScriptureChangeRequest(button.dataset.data, "InfoBox", "scriptureButton"));
	    this._infoBox.onContentClick("button.j-show-general-noun", (button, event) => {
		event.preventDefault();
		me._displayGeneralNounPopup(button.dataset.data, button);
	    });
	}



	/**********************************************************************/
	this._infoBox.setHeader(this.makeHeaderText(data));
	const externalLinksText = this.makeExternalLinksText(data);
	const summary = J_Utils.resolveInfoBoxLinks(data.summary, {}, { place: "skipwelcome" });
	const discussion = J_Utils.resolveInfoBoxLinks(data.discussion, {}, { place: "skipwelcome" });


	
	/**********************************************************************/
	this._infoBox.setContent(externalLinksText + summary + "<p>" + discussion);
	this._infoBox.querySelectorAll("a.j-link-for-current-item").forEach(tag => tag.setAttribute("target", "_self"));
    }

    
    /**************************************************************************/
    /* %%% YOU MAY ALSO POSSIBLY WANT SOMETHING LIKE THIS.

       This assumes that the text in the info-box may contain links to
       general nouns, and you may want to display information for these in
       a pop-up window if you click on the general noun. */
    
    _displayGeneralNounPopup (dStrong, elementWhichWasClicked)
    {
	const ixs = _JsonDataForGeneralNouns.getFromMultiValuedField("dStrong", dStrong, true);
	if (!ixs || 1 != ixs.length) return;
	const rec = _JsonDataForGeneralNouns.convertIndexesToRecords(ixs)[0];
	const title = rec.importantNames.replaceAll("/", " / ");
	const content = J_Utils.resolveInfoBoxLinks(rec.summary, false);
	this._infoBox.showPopup({ titleHtml: title, contentHtml: content, anchor: elementWhichWasClicked });
    }


    /**************************************************************************/
    /* This assumes that if we want to open any new page when running in an
       iframe, we want to open that page in the iframe itself, rather than in
       a new tab.  I have no experience at all of whether this is, in fact, the
       case, because I have never had cause to try it out (which also means
       that I have no idea at all whether that feature runs or not). */

    _getLinkTarget ()
    {
	return J_Utils.runningInIframe() ? "_self" : "_blank";
    }
}


/******************************************************************************/
/* May need to change this at some point.  Presently it looks to see if the
   input is a string, in which case it is assumed to be a semicolon-separated
   list of references.  Otherwise, I take it to be a JSON record with a
   dStrong entry, again a string, in the form "/H1234/G4321/".

   Unless you are definitely dealing with a known scripture, it is better to
   use dStrong -- Jerusalem, for instance, has only a handful of Strongs
   values, whereas it has nearly 1000 references, which makes for a URL too
   long to be handled. */

export class J_ClassScripturePanelHandler extends J_ClassPanelHandler
{
    processIncomingChangeRequest (data, selectionSource, selectionSubsource)
    {
	if (typeof data === "string")
	    document.getElementById("j-scripture-iframe").src = J_Utils.makeUrlForScriptureGivenRefs(data);
	else
	    document.getElementById("j-scripture-iframe").src = J_Utils.makeUrlForScriptureGivenListOfDStrong(data.dStrong);
    }
};


/******************************************************************************/
export class J_ClassSearchPanelHandler extends J_ClassPanelHandler
{
    processIncomingChangeRequest (data, selectionSource, selectionSubsource)
    {
	// Search originates requests -- to date I've never wanted it to respond to them.
    }
};



/******************************************************************************/
class J_Class4PanelCoordinator
{
    /**************************************************************************/
    _debouncer = new J_UtilsDebouncer();
    
    _appPanelHandler       = new J_ClassAppPanelHandler();
    _infoBoxPanelHandler   = new J_ClassInfoBoxPanelHandler();
    _scripturePanelHandler = new J_ClassScripturePanelHandler();
    _searchPanelHandler    = new J_ClassSearchPanelHandler();

    _embeddedApiHandler = null;
    _MethodToDetermineWhetherToUseNewUrlInsteadOfUpdatingCurrentScreen = null;
    

    /**************************************************************************/
    setAppPanelHandler       (handler) { this._appPanelHandler       = handler; }
    setInfoBoxPanelHandler   (handler) { this._infoBoxPanelHandler   = handler; }
    setScripturePanelHandler (handler) { this._scripturePanelHandler = handler; }
    setSearchPanelHandler    (handler) { this._searchPanelHandler    = handler; }

    setEmbeddedApiHandler    (handler) { this._embeddedApiHandler    = handler; }
    setMethodToDetermineWhetherToUseNewUrlInsteadOfUpdatingCurrentScreen (fn) { this._methodToDetermineWhetherToUseNewUrlInsteadOfUpdatingCurrentScreen = fn; }

    
    /**************************************************************************/
    /* Called when there are grounds for changing the item being displayed.

       data needs to give sufficient information for things to know what to
         display.

       selectionSource should be one of Search, Scripture, InfoBox, App or
         URL.  The first four indicate the source of the request.  The last
         corresponds to a change request resulting from parsing the overall
         URL for the 4-panel display.

      selectionSubsource can be used to supply additional information.  For
         example, where the change request is coming from an app panel which
         contains a tabbed dialog box, it can indicate which of the tabs was
         responsible.


      Note that this permits any one of the elements to request changes to
      the overall item being displayed.  So for a Places (Mapping)
      application, it enables things to request a change to the Place
      being displayed.

      More specifically, certain panels (typically the info box) may wish
      to display 'external' information which does not require any other
      panels to be updated.  These things do not require coordination
      amongst the four panels, and are therefore not handled here.

      Where one of the panels originates a request, that panel calls
      processIncomingChangeRequest.  This results in the request being
      passed to the other panels AND ALSO TO THE ORIGINATING PANEL.

      It is your choice as how the originating panel responds to this.  You
      might, for instance, find it appropriate to update the originating
      panel before you call processIncomingChangeRequest, in which case
      when processIncomingMasterItemChangeRequest informs the panel of the
      change, it can ignore the information; or you may prefer to wait to
      receive the notification and only then to apply any changes. */

    processIncomingMasterItemChangeRequest (data, selectionSource, selectionSubsource = null)
    {
	if (this._debouncer.isSameAsPrevious(data)) return;
	
	if (this._methodToDetermineWhetherToUseNewUrlInsteadOfUpdatingCurrentScreen && this._methodToDetermineWhetherToUseNewUrlInsteadOfUpdatingCurrentScreen(data, selectionSource, selectionSubsource))
	    return;

	this._appPanelHandler      .processIncomingChangeRequest(data, selectionSource, selectionSubsource);
	this._searchPanelHandler   .processIncomingChangeRequest(data, selectionSource, selectionSubsource);
	this._infoBoxPanelHandler  .processIncomingChangeRequest(data, selectionSource, selectionSubsource);
	this._scripturePanelHandler.processIncomingChangeRequest(data, selectionSource, selectionSubsource);

	if (this._embeddedApiHandler)
	    this._embeddedApiHandler.postMessageToParentIframeChangedMasterItem(selectionSource, data); // Just in case we're running in an iframe.
    }


    /**********************************************************************/
    /* Call this if you want to update the content of the scripture panel
       without messing around with anything else. */
    
    processIncomingScriptureChangeRequest (data, selectionSource, selectionSubsource)
    {
	this._scripturePanelHandler.processIncomingChangeRequest(data, selectionSource, selectionSubsource);
    }
}

export const J_4PanelCoordinator = new J_Class4PanelCoordinator;
