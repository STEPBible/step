/******************************************************************************/
/* Uses local storage to make it possible Obtains TIPNR places data and makes it via lookup based on dStrongs.

   To use this functionality, include the class definition in your file,
   and then use either getAllFieldsGivenStrongs or getFieldGivenStrongs
   as appropriate.  The former gives back the full record from the places
   JSON file; the latter gives back just a single field.

   Both return undefined if there is no record with the given dStrongs value;
   and getFieldGivenStrongs also returns undefined if there is no field with
   the given name.
*/

/******************************************************************************/
export class ClassJFrameworkOneOff
{
    /**************************************************************************/
    static _instance = null;
    static instance ()
    {
	if (null === this._instance)
	    this._instance = new ClassJFrameworkOneOff();

	return this._instance;
    }

    
    /**************************************************************************/
    alreadySet (settingName)
    {
	if (null != localStorage.getItem(settingName)) return true;
	localStorage.setItem(settingName, 'AlreadySet');
	return false;
    }
}
