/******************************************************************************/
/* User settings
   =============

   At the time of writing, the user is able to set selected background colours,
   font-sizes, etc.  These are recorded in local storage for future use.

   The code in this file interacts with these settings in order that they can
   override any default settings.

   You simply need to include JFrameworkUserSettings, and call init.  If your
   own code needs to know when the settings have been changed, pass a function
   to init. */
/******************************************************************************/

/******************************************************************************/
'use strict';


/******************************************************************************/
/* The caller should not bother creating one of these -- I create one here
   (at the bottom of the file) and you can just use that. */

class _ClassJFrameworkUserSettings
{
    /**************************************************************************/
    /* Pass a function fn which takes a single argument if you want to be
       that the settings have changed.  Normally there is no need to do this,
       though, because the processing here will do all that is needed.

       If present, this function will be called with a single argument.  If
       the argument is true, the function is being called as part of
       initialisation processing.  Otherwise, it is being called because the
       settings have changed on the fly. */
    
    init (fn)
    {
	const me = this;
	window.addEventListener('storage', (event) => {
	    if (event.key && event.key.startsWith('settings'))
		me._reload(fn, false);
	});

	me._reload(fn, true);
    }

    

    
    /**************************************************************************/
    applySettings (docElt, settings)
    {
        for (const [key, value] of Object.entries(settings))
	{
	    if (key.startsWith('clr'))
		docElt.style.setProperty(`--${key}`, value);
        }

	if ('defaultfont' in settings) // Font size.
	    docElt.style.setProperty('--defaultFontSize', settings['defaultfont'] + 'px');
    }


    /**************************************************************************/
    /* Returns the content of the local storage element which gives the user-
       defined formatting overrides. */
    
    getSettings ()
    {
	return JSON.parse(localStorage.getItem('settings-' + localStorage.getItem('settings')));
    }

    
    /**************************************************************************/
    _reload (fn, calledDuringInitialisation)
    {
	try
	{
	    const settings = this.getSettings();
	    this.applySettings(document.documentElement, settings);
	    if (null != fn)
		fn(calledDuringInitialisation);
	}
	catch (e)
	{
	}
    }
}

export const JFrameworkUserSettings = new _ClassJFrameworkUserSettings();
