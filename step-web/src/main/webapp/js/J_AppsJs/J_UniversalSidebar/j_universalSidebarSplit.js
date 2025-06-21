/******************************************************************************/
'use strict';
import { JFrameworkUtils }                               from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js'

class ClassJUniversalSidebarSplit extends ClassJFrameworkMultiframeCommunicationsMaster
{
    /**************************************************************************/
    onload ()
    {
	this._scriptureIframe = document.getElementById('scripture');
    }


    /**************************************************************************/
    /* All of the 'open' actions below relate to situations where the sidebar
       wants to have a page displayed, but wants it to be at the top level.
       In other words, it doesn't want the page to appaer within the iframe --
       it wants it to be an alternative to the full sidebar application, and
       it needs this to be handled in the context of the overall controller
       therefore. */
    
    receiveMessage (data, sendingFrame)
    {
	switch (data.fn)
	{
	    case 'checkScriptureUrl':
	    {
		this.sendMessageTo(sendingFrame, { fn: 'scriptureContent', url: JUniversalSidebarSplit._scriptureIframe.contentWindow.location.href, document: JUniversalSidebarSplit._scriptureIframe.contentDocument });
		break;
	    }

	    
	    case 'openGenealogy':
	    {
		window.open(data.url, 'sidebarGenealogyTab');
		break;
	    }


	    case 'openMap':
	    {
		window.open(data.url, 'sidebarMapsTab');
		break;
	    }


	    case 'openPicture':
	    {
		window.open(data.url, 'photoTab');
		break;
	    }
	}
    }
}

export const JUniversalSidebarSplit = new ClassJUniversalSidebarSplit();
window.JUniversalSidebarSplit = JUniversalSidebarSplit;
