/******************************************************************************/
/* Makes a dialog box draggable.  You need something like this:

  <div class='jframework-modalDialog jframework-draggableContainer' ...>
    <div class='jframework-modalDialogHeader jframework-draggableHeader' ...>

  Or to be more specific, you definitely need the classes with 'draggable' in
  their names; the modalDialog stuff I am less sure about.

  Then simply call

    ClassJFrameworkDraggable.initialise()
*/

/******************************************************************************/
export class ClassJFrameworkDraggable
{
    /**************************************************************************/
    static initialise ()
    {
	const draggables = document.getElementsByClassName('jframework-draggableContainer');
	for (const draggable of draggables)
	    (new ClassJFrameworkDraggable()).initialiseFor(draggable);
    }


    /**************************************************************************/
    initialiseFor (draggable)
    {
	this._offsetX = 0;
	this._offsetY = 0;
	this._isDragging = false;
	
	this._draggable = draggable;
	const header = draggable.querySelector('.jframework-draggableHeader');

	const me = this;
	
	header.addEventListener('mousedown', (event) => {
	    me._isDragging = true;
	    me._offsetX = event.clientX - draggable.offsetLeft;
	    me._offsetY = event.clientY - draggable.offsetTop;
	    document.body.style.cursor = 'move'; // Change cursor during drag
	});


	document.addEventListener('mousemove', (event) => {
	    if (me._isDragging) {
		const x = event.clientX - me._offsetX;
		const y = event.clientY - me._offsetY;
		draggable.style.left = `${x}px`;
		draggable.style.top = `${y}px`;
	    }
	});


	document.addEventListener('mouseup', () => {
	    me._isDragging = false;
	    document.body.style.cursor = 'default';
	});
    }
}
