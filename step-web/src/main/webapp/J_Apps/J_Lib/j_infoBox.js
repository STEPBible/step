/******************************************************************************/
/* Implements an info box as used by the Mapping application (amongst others).

   An info box normally appears at the top right of large screen layouts in
   these applications (although there is nothing here which forces any
   particular positioning) and gives information about the person, place or
   whatever being displayed.

   It has a fixed top line comprising some text at the left and a 'Shareable
   link' button at the right, which is used to generate a URL which can be
   passed to someone else in order to view this same data.  Below this there
   is a vertically scrolling area to hold the details.

   To use it, you need to have something like:

     <j-info-box></j-info-box>

   This will create the relevant framework.  All you have to do is populate it.

   There is also a pop-up, hidden until you ask for it, which can be used to
   show additional information about something in the info box (see showPopup
   below).  It has a fixed title bar with a close button, and a scrolling area
   for the details.

   A Jamieson   STEPBible   Oct-2026
*/
/******************************************************************************/

/******************************************************************************/
import "./j_popupSimpleFading.js";
import "./j_popupDialog.js";

const cssUrl = new URL("./j_common.css", import.meta.url);

const CSS = `
@import url("${cssUrl}");


:host {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 0;
    --clr-j-info-box-bg: var(--clrLexiconFocusBG);
}

.j-info-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    border: 2px solid #333;
    font-size: small;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    text-align: left;
    overflow-y: auto;
    padding-top: 5px;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    background: var(--clr-j-info-box-bg);
    box-sizing: border-box;
}

.j-info-box-header {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.j-info-box-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    line-height: 1.4;

    /* On a large screen, the text is too wide to read easily.
       The following two lines limit the width, which improves
       that, but it looks ridiculous.

    width: 60ch;
    max-width: 100%;
    */
}

.j-info-box-body p {
    margin: 1em 0;
}

`;



/******************************************************************************/
/* Extends HTML with an info box. */

class JInfoBox extends HTMLElement
{
    /**************************************************************************/
    /* The shadow DOM is built here, and not in connectedCallback, so that it
       exists as soon as the element has been created.  That means the methods
       below can safely be called at any time, even before the element has been
       attached to the page, and (unlike connectedCallback) this runs exactly
       once however often the element is moved around.  (The responsive layout
       moves it when swapping between the wide and narrow arrangements.) */

    constructor()
    {
        super();

        const html = `
          <div class="j-info-box">
            <j-popup-simple-fading id="j-popup-url-copied" class="j-popup-simple-fading-top-right"></j-popup-simple-fading>
            <div class="j-info-box-header">
              <span class="j-info-box-title"></span>
              <button id="j-info-box-url-copier" type="button" class="j-common-button" title='Copy to clipboard a URL for this screen'>Shareable link</button>
            </div>
            <div class="j-info-box-body"></div>
          </div>

          <j-popup-dialog></j-popup-dialog>
        `;


        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${CSS}</style>
            ${html}
        `;


        /**********************************************************************/
        /* One click listener for the whole of the content area, which handles
           everything registered via onContentClick.  It lives on the body
           element, which is never replaced (only its contents are), so it
           survives every call to setContent, and the buttons / links which
           setContent creates need no listeners of their own. */

        this._clickHandlers = [];

        const dispatchClick = (event, container) => {
            for (const { selector, fn } of this._clickHandlers)
            {
                const element = event.target.closest(selector);
                if (element && container.contains(element))
                {
                    fn(element, event);
                    return;    // The first matching handler wins.
                }
            }
        };

        this._body().addEventListener("click", event => dispatchClick(event, this._body()));

        // Clicks in the pop-up's content are handled just the same way.  (The
        // pop-up is a component with its own shadow DOM, so it passes them on.)
        this._popup().setContentClickHandler(event => dispatchClick(event, event.currentTarget));


        /**********************************************************************/
        /* The pop-up looks after most of its own closing (see j_popupDialog.js).
           What it cannot know is that it is about the info box content, so
           scrolling that content closes it.  Scroll events don't bubble, hence
           'capture'; and scrolling the pop-up's own content isn't ours to
           worry about, because that is in the pop-up's shadow DOM. */

        this.shadowRoot.addEventListener("scroll", () => this._popup().hide(), true);
    }


    /**************************************************************************/
    _body ()
    {
        return this.shadowRoot.querySelector(".j-info-box-body");
    }


    /**************************************************************************/
    _popup ()
    {
        return this.shadowRoot.querySelector("j-popup-dialog");
    }


    /**************************************************************************/
    clearContent ()
    {
        this.setContent("");
    }


    /**************************************************************************/
    /* Replacing the content also closes any pop-up, because the thing which
       the pop-up was about is no longer there. */

    setContent (html)
    {
        this.hidePopup();
        this._body().innerHTML = html;
    }


    /**************************************************************************/
    /* Because the content is in a shadow DOM, document.querySelector and the
       like cannot see it, and nor can querySelector on the <j-info-box>
       itself.  These do the same job, but within the content area. */

    querySelector (selector)
    {
        return this._body().querySelector(selector);
    }


    querySelectorAll (selector)
    {
        return this._body().querySelectorAll(selector);
    }


    /**************************************************************************/
    /* Call this once, at start-up, to say what should happen when the user
       clicks on something in the content area which matches 'selector' (for
       instance "button[data-ref]").  'fn' is called with the matching element
       and the event:

         infoBox.onContentClick("button[data-ref]", button => myFunction(button.dataset.ref));

       The content can be replaced as often as you like: the registration
       carries on working for whatever is there at the time of the click.
       To stop a link which has been clicked from doing its normal thing,
       call event.preventDefault() in 'fn'. */

    onContentClick (selector, fn)
    {
        this._clickHandlers.push({ selector, fn });
    }


    /**************************************************************************/
    /* Shows the pop-up.  Takes an object:

         titleHtml    HTML for the title bar, which stays put.
         contentHtml  HTML for the area below it, which scrolls if it has to.
         anchor       Optional.  The element which was clicked (the element
                      passed to your onContentClick function will do).  The
                      pop-up appears just below it -- or just above it if
                      there is much more room there.  If you leave this out,
                      the pop-up appears near the top of the info box.

       Example:

         infoBox.onContentClick("a.j-more-info", (link, event) => {
             event.preventDefault();
             infoBox.showPopup({ titleHtml: "Bethel", contentHtml: "<p>...</p>", anchor: link });
         });

       The pop-up is always centred horizontally on the info box, and is no
       wider than 90% of the info box or 60ch, whichever is smaller.  It may
       be taller than the info box (it is positioned relative to the window,
       not clipped to the info box) but never taller than the window.

       It closes when the user clicks its cross, presses Escape, or presses
       anywhere outside it; and also if the info box content is replaced, the
       info box is scrolled, or the window is resized.  Showing a second
       pop-up replaces the first.  Anything in the content which matches an
       onContentClick selector works just as it does in the main content
       area. */

    showPopup ({ titleHtml = "", contentHtml = "", anchor = null } = {})
    {
        this._popup().show({ titleHtml, contentHtml, anchor, within: this });   // 'within': centred on, and limited by the width of, the info box.
    }


    /**************************************************************************/
    /* Hides the pop-up.  Harmless if it isn't showing. */

    hidePopup ()
    {
        this._popup().hide();
    }


    /**************************************************************************/
    setHeader (text)
    {
        this.shadowRoot.querySelector(".j-info-box-title").innerHTML = text;
    }


    /**************************************************************************/
    setUrlToClipboardCopier (fn)
    {
	this.shadowRoot.querySelector("#j-info-box-url-copier").onclick = fn;
    }

    
    /**************************************************************************/
    showCopyConfirmationPopup ()
    {
	this.shadowRoot.querySelector("#j-popup-url-copied").show("URL copied to clipboard");
    }
}
customElements.define("j-info-box", JInfoBox);

