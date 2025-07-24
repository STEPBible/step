/******************************************************************************/
/* Handles modal dialogs.

   This shows and hides modals, and when visible places an opaque layer across
   the underlying window, partly to set the modal off from the background, and
   partly so that nly clicks on the modal itself do anything (except that a
   click on the background will hide the modal).

   The facilities support the option of having more than one modal visible at
   once, with one of them taking priority.  In this case the background is
   hidden only when all modals are hidden.

   This should be used in conjuncton with j_framework.modalDialog.css.

   Modal dialogs should be defined with class jframework-modalDialog.  The
   above CSS file, along with this present code, will handle showing and
   or hiding the dialogs as appropriate, but you will need to deal with the
   actual formatting (colours, layouts, etc).

   The code here assumes that when visible, dialogs should be shown with
   display:flex.

   IMPORTANT: You must define a div of class modalDialogOverlay to act as
   the background overlay.
*/

export class ClassJFrameworkModalDialog
{
    /**************************************************************************/
    constructor ()
    {
	this._overlay.addEventListener("click", () => { this.closeTopModalDialog() });
    }

    
    /**************************************************************************/
    addModalCloseButtonHandlers ()
    {
	document.body.addEventListener('click', (e) => {
	    if (e.target.matches('.jframework-modalDialogCloseBtn')) {
		this.closeTopModalDialog();
	    }
	});
    }

    
    /**************************************************************************/
    closeTopModalDialog ()
    {
	if (this._openModalDialogs.length === 0) return;

	const popUp = this._openModalDialogs.pop();
	popUp.classList.add("jframework-modalDialogDisplayFlex");
	popUp.classList.remove("jframework-modalDialogDisplayFlex");

	if (this._openModalDialogs.length === 0)
	    this._overlay.classList.remove("jframework-modalDialogDisplayFlex");
	else
	    this._updateZIndexes();
    }


    /**************************************************************************/
    showModalDialog (popUp)
    {
	popUp.classList.add("jframework-modalDialogDisplayFlex");
	this._openModalDialogs.push(popUp);
	this._overlay.classList.add("jframework-modalDialogDisplayFlex");
	this._updateZIndexes();
    }


    /**************************************************************************/
    _updateZIndexes ()
    {
	var maxIndex = 0
	this._openModalDialogs.forEach((popUp, i) => {
	    maxIndex = 1000 + 2 * i;
	    popUp.style.zIndex = maxIndex;
	});

	this._overlay.style.zIndex = maxIndex - 1;
    }



    /**************************************************************************/
    _overlay = document.getElementById("modalDialogOverlay");
    _openModalDialogs = [];
}
