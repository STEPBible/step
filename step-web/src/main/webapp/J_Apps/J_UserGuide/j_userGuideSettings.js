/******************************************************************************/
/* STEPBible User Guide -- the user's STEPBible display settings.

   STEPBible lets the user choose colours and a font size.  It keeps them in
   local storage:

     localStorage["settings"]             name of the active settings profile
     localStorage["settings-" + name]     JSON for that profile:
                                            clr...       colours
                                            defaultfont  font size in pixels

   Each clr... value becomes the CSS variable --clr... (the variables which
   J_Lib's j_common.css defines defaults for), and defaultfont becomes
   --defaultFontSize, so anything styled with those variables follows the
   user's settings.

   This is the mechanism of the old J_Framework's j_framework.userSettings.js,
   kept here because J_Lib does not (yet) provide it.  It also listens for
   changes made in another STEPBible tab.
*/

/******************************************************************************/
class _ClassJUserGuideSettings
{
    /**************************************************************************/
    /* Applies the settings now, and again whenever they change.  onChange
       (optional) is called after each application. */

    init (onChange = null)
    {
	this._onChange = onChange;
	this._apply();
	window.addEventListener("storage", event => {
	    if (null === event.key || event.key.startsWith("settings")) this._apply();
	});
    }


    /**************************************************************************/
    /* Applies the settings to a same-origin iframe (eg the scripture window).
       Does nothing if the frame cannot be reached. */

    applyToFrame (iframe)
    {
	try
	{
	    const doc = iframe.contentDocument;
	    if (doc && doc.documentElement) this.applyTo(doc.documentElement, this.getSettings());
	}
	catch (e)
	{
	}
    }


    /**************************************************************************/
    applyTo (element, settings)
    {
	if (!settings) return;

	for (const [key, value] of Object.entries(settings))
	    if (key.startsWith("clr") && "string" === typeof value)
		element.style.setProperty(`--${key}`, value);

	if ("defaultfont" in settings && isFinite(parseFloat(settings.defaultfont)))
	    element.style.setProperty("--defaultFontSize", parseFloat(settings.defaultfont) + "px");
    }


    /**************************************************************************/
    /* The active settings profile, or null if there is none (eg STEPBible has
       never been opened in this browser) or local storage is unavailable. */

    getSettings ()
    {
	try
	{
	    const name = localStorage.getItem("settings");
	    if (null === name) return null;
	    return JSON.parse(localStorage.getItem("settings-" + name));
	}
	catch (e)
	{
	    return null;
	}
    }


    /**************************************************************************/
    _apply ()
    {
	this.applyTo(document.documentElement, this.getSettings());
	if (this._onChange) this._onChange();
    }
}

export const JUserGuideSettings = new _ClassJUserGuideSettings();
