/******************************************************************************/
/* Extends HTML with a pop-up dialog for additional information.

   The pop-up is invisible until you ask for it.  It has two parts: a title bar
   at the top, which stays put and carries a cross for closing the pop-up; and,
   below that, a content area which scrolls vertically if the content is too
   tall for the space available.

   To use it, you need

     <j-popup-dialog></j-popup-dialog>

   somewhere in your page (or, for a component with a shadow DOM, in the
   shadow DOM).  Then call

     popup.show({ titleHtml: "...", contentHtml: "...", anchor: someElement });

   See 'show' below for the options, and for how the pop-up is sized and placed.

   It closes (a) when the user clicks the cross, (b) when the user presses
   Escape, (c) when the user presses anywhere outside it, including in an
   iframe, (d) when the window is resized, or (e) when you call 'hide'.  If you
   want it also to close in other circumstances -- when the thing it is about
   scrolls out of view, say -- call 'hide' yourself.

   If you want to react to clicks on things inside the content -- buttons, say --
   call setContentClickHandler.  Because the content lives in this element's
   shadow DOM, an ordinary click listener on the <j-popup-dialog> would see only
   the element itself, and not what had been clicked.

   Events (both bubble and are composed, so they cross shadow DOM boundaries):

     j-popup-dialog-shown
     j-popup-dialog-hidden

   Claude   STEPBible   Oct 2026.
*/

/******************************************************************************/
const cssUrl = new URL("./j_common.css", import.meta.url);

const CSS = `
@import url("${cssUrl}");

:host {
    display: contents;       /* The element takes no part in layout: the dialog is fixed-position. */
}

.j-popup-dialog[hidden] {
    display: none;
}

.j-popup-dialog {
    position: fixed;
    z-index: var(--j-popup-dialog-z-index, 10000);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-size: small;
    line-height: 1.4;
    text-align: left;
    color: var(--clrSecondary6);
    background: var(--clrSecondary0);
    border: 2px solid var(--clrPrimary4);
    border-radius: 4px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.j-popup-dialog-title-bar {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 6px 4px 8px;
    font-weight: bold;
    background: var(--clrPrimary1);
    border-bottom: 1px solid var(--clrPrimary4);
}

.j-popup-dialog-title {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
}

.j-popup-dialog-close {
    flex: 0 0 auto;
    padding: 0 4px;
    font: inherit;
    font-size: 1.3em;
    line-height: 1;
    color: inherit;
    background: transparent;
    border: none;
    cursor: pointer;
}

.j-popup-dialog-close:hover,
.j-popup-dialog-close:focus-visible {
    background: var(--clrPrimary2);
    outline: none;
}

.j-popup-dialog-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 8px 8px 8px;
}

.j-popup-dialog-content p {
    margin: 0.7em 0;
}
`;



/******************************************************************************/
/* The closest the pop-up may come to the edge of the window; the gap between
   it and the element it is anchored to; and the smallest height it is allowed
   to shrink to. */

const WINDOW_MARGIN = 10;
const ANCHOR_GAP    = 6;
const MIN_HEIGHT    = 80;





/******************************************************************************/
class JPopupDialog extends HTMLElement
{
    /**************************************************************************/
    /* The shadow DOM is built in the constructor so that every method can be
       called at any time, even before the element has been attached to the
       page. */

    constructor ()
    {
        super();

        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${CSS}</style>
            <div class="j-popup-dialog" role="dialog" aria-modal="false" aria-labelledby="j-popup-dialog-title" hidden>
              <div class="j-popup-dialog-title-bar">
                <span class="j-popup-dialog-title" id="j-popup-dialog-title"></span>
                <button type="button" class="j-popup-dialog-close" aria-label="Close" title="Close">&times;</button>
              </div>
              <div class="j-popup-dialog-content"></div>
            </div>
        `;

        this._contentClickHandler = null;

        this.shadowRoot.querySelector(".j-popup-dialog-close").addEventListener("click", () => this.hide());
        this._content().addEventListener("click", event => this._contentClickHandler?.(event));


        /**********************************************************************/
        /* Handlers for the things which dismiss the pop-up.  They are attached
           only while it is showing (see show / hide). */

        this._onOutsidePress = event => {
            if (!event.composedPath().includes(this._dialog())) this.hide();
        };

        this._onKeyDown = event => {
            if ("Escape" === event.key) this.hide();
        };

        // Resizing the window makes the position we calculated meaningless.  A
        // 'blur' means the focus has gone elsewhere: in particular into an
        // iframe, where presses are never seen by this document.
        this._onResizeOrBlur = () => this.hide();
    }



    /**************************************************************************/
    _dialog  () { return this.shadowRoot.querySelector(".j-popup-dialog"); }
    _content () { return this.shadowRoot.querySelector(".j-popup-dialog-content"); }



    /**************************************************************************/
    /* True while the pop-up is showing. */

    get isOpen ()
    {
        return !this._dialog().hidden;
    }



    /**************************************************************************/
    /* Looks for things in the content, which an ordinary querySelector on this
       element cannot see because of the shadow DOM. */

    querySelector    (selector) { return this._content().querySelector(selector); }
    querySelectorAll (selector) { return this._content().querySelectorAll(selector); }



    /**************************************************************************/
    /* 'fn' is called, with the event, whenever the user clicks anywhere in the
       content.  event.target is the actual element clicked, so you can use
       event.target.closest(...) in the usual way.  Call it once, at start-up:
       it carries on working however often the content changes. */

    setContentClickHandler (fn)
    {
        this._contentClickHandler = fn;
    }



    /**************************************************************************/
    /* Shows the pop-up.  Takes an object:

         titleHtml     HTML for the title bar.

         contentHtml   HTML for the scrolling area below it.

         anchor        Optional.  An element which the pop-up should appear next
                       to: just below it, or just above it if there is much more
                       room there.  If omitted, the pop-up appears near the top
                       of 'within'.

         within        Optional.  An element which the pop-up is to be centred
                       horizontally on, and whose width limits its width.  If
                       omitted, the window is used.  (The pop-up is positioned
                       relative to the window, so it is not clipped by this
                       element, and can be taller than it.)

         widthFraction Optional.  Default 0.9.  The pop-up is at most this
                       fraction of the width of 'within' ...

         maxWidth      Optional.  Default "60ch".  ... or this, whichever is
                       smaller.  Any CSS length will do.

       The pop-up is never taller than the window.  Showing a pop-up while
       another is showing replaces it. */

    show ({ titleHtml = "", contentHtml = "", anchor = null, within = null, widthFraction = 0.9, maxWidth = "60ch" } = {})
    {
        const dialog = this._dialog();

        this.hide();     // Starts afresh, and removes any listeners left from last time.

        this.shadowRoot.querySelector(".j-popup-dialog-title").innerHTML = titleHtml;
        this._content().innerHTML = contentHtml;
        this._content().scrollTop = 0;


        /* Width.  This has to be settled before positioning because the height
           depends on it. */

        const boundsRect = within
            ? within.getBoundingClientRect()
            : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

        dialog.style.width = `min(${Math.round(boundsRect.width * widthFraction)}px, ${maxWidth})`;
        dialog.style.maxHeight = "none";
        dialog.hidden = false;


        /* Vertical position, and the room available. */

        const anchorRect = anchor?.getBoundingClientRect?.();

        let top;
        let maxHeight;

        if (!anchorRect)
        {
            top = Math.max(WINDOW_MARGIN, boundsRect.top + 10);
            maxHeight = window.innerHeight - top - WINDOW_MARGIN;
        }
        else
        {
            const spaceBelow = window.innerHeight - anchorRect.bottom - ANCHOR_GAP - WINDOW_MARGIN;
            const spaceAbove = anchorRect.top - ANCHOR_GAP - WINDOW_MARGIN;

            if (spaceBelow >= 200 || spaceBelow >= spaceAbove)
            {
                top = anchorRect.bottom + ANCHOR_GAP;
                maxHeight = spaceBelow;
            }
            else
            {
                maxHeight = spaceAbove;
                dialog.style.maxHeight = `${maxHeight}px`;       // So that offsetHeight is right below.
                top = anchorRect.top - ANCHOR_GAP - dialog.offsetHeight;
            }
        }

        dialog.style.maxHeight = `${Math.max(maxHeight, MIN_HEIGHT)}px`;
        dialog.style.top  = `${Math.max(WINDOW_MARGIN, top)}px`;
        dialog.style.left = `${Math.max(WINDOW_MARGIN, boundsRect.left + (boundsRect.width - dialog.offsetWidth) / 2)}px`;


        /* Closing behaviour.  The listener for outside presses is added on the
           next tick so that the press which led here can't close it again. */

        document.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("resize", this._onResizeOrBlur);
        window.addEventListener("blur", this._onResizeOrBlur);
        setTimeout(() => {
            if (this.isOpen) document.addEventListener("pointerdown", this._onOutsidePress);
        }, 0);

        this.dispatchEvent(new CustomEvent("j-popup-dialog-shown", { bubbles: true, composed: true }));
    }



    /**************************************************************************/
    /* Hides the pop-up.  Harmless if it isn't showing. */

    hide ()
    {
        if (!this.isOpen) return;

        this._dialog().hidden = true;

        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("pointerdown", this._onOutsidePress);
        window.removeEventListener("resize", this._onResizeOrBlur);
        window.removeEventListener("blur", this._onResizeOrBlur);

        this.dispatchEvent(new CustomEvent("j-popup-dialog-hidden", { bubbles: true, composed: true }));
    }
}
customElements.define("j-popup-dialog", JPopupDialog);
