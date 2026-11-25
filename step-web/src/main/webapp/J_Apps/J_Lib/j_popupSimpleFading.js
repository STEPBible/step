/******************************************************************************/
/* Extends HTML with a fading popup for simple messages.

   You need

     <j-popup-simple-fading></j-popup-simple-fading>

   in your code.

   Then when you want to use the popup, just call the show method.

   A Jamieson   STEPBible   Oct 2026.
*/

/******************************************************************************/
const CSS = `
.j-popup-simple-fading {
    display: none;
    background: var(--clr-j-popup-simple-fading);
    color: white;
    padding: 15px 25px;
    border-radius: 5px;
    opacity: 1;
    transition: opacity 1s ease-in-out;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 2000;
}

:host(.j-popup-simple-fading-top-right) .j-popup-simple-fading {
    position: absolute;
    top: 5px;
    right: 5px;
}

:host(.j-popup-simple-fading-centered-on-page) .j-popup-simple-fading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: min(90vw, 40ch);
    text-align: center;
}
`;


/******************************************************************************/
class JPopUpSimpleFading extends HTMLElement
{
    /**************************************************************************/
    connectedCallback()
    {
	/**********************************************************************/
        /* connectedCallback runs again every time the element (or any ancestor)
           is movedin the DOM -- which happens when the responsive layout swaps
           between the wide and narrow arrangements.  Everything here must#
	   therefore be done only once. */
	
        if (this._j_initialised) return;
        this._j_initialised = true;



	/**********************************************************************/
        const html = `
          <div class="j-popup-simple-fading"></div>
        `;

        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${CSS}</style>
            ${html}
        `;
    }


    /**************************************************************************/
    /**************************************************************************/
    /* message     HTML to show.
       durationMs  How long it stays fully visible.  Default 1000.
       fadeMs      How long the fade-out takes.  Default 1000. */

    show (message, durationMs = 1000, fadeMs = 1000)
    {
	const popup = this._get();

	// A previous call may still have its timers running, which would hide
	// this new message early.  Cancel them.
	clearTimeout(this._j_fadeTimer);
	clearTimeout(this._j_hideTimer);

	popup.innerHTML = message;
	popup.style.transition = "none";          // So that appearing is instant, not a fade-in.
	popup.style.opacity = "1";
	popup.style.display = "block";
	popup.offsetHeight;                       // Forces the browser to apply the above before the next line.
	popup.style.transition = `opacity ${fadeMs}ms ease-in-out`;

	this._j_fadeTimer = setTimeout(() => {
	    popup.style.opacity = "0";
	    this._j_hideTimer = setTimeout(() => { popup.style.display = "none"; }, fadeMs);
	}, durationMs);
    }
    


    /**************************************************************************/
    _get ()
    {
	return this.shadowRoot.querySelector(".j-popup-simple-fading");
    }
}
customElements.define("j-popup-simple-fading", JPopUpSimpleFading);
