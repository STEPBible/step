/******************************************************************************/
/* Obtains TIPNR places data and makes it available via lookup based on
   dStrongs.

   To use this functionality, include the class definition in your file,
   and then use something along the lines of:

	(async () => {
	    const a = JFrameworkPlacesData.instance().xxx('H1234');
	    const b = JFrameworkPlacesData.instance().xxx('H1234');
	    ...
	    Do something with the data
	})();

   where xxx is getAllFieldsGivenStrong or getFieldsGivenStrongs as
   appropriate.

   Both return undefined if there is no record with the given dStrongs value;
   and getFieldGivenStrongs also returns undefined if there is no field with
   the given name.

   The data is downloaded and parsed only when you first do a get.
*/

/******************************************************************************/
import { JFrameworkSharedConstants } from '/js/J_AppsJs/J_Framework/j_framework.sharedConstants.js';
import { JFrameworkUtils           } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';


/******************************************************************************/
export class JFrameworkPlacesData
{
    /**************************************************************************/
    static _instance = null;
    static instance ()
    {
	if (null === this._instance)
	    this._instance = new JFrameworkPlacesData();

	return this._instance;
    }

    
    /**************************************************************************/
    async getAllFieldsGivenStrongs (strongs)
    {
        await this._ensureInitialised();
	return this._parsedData.get(strongs);
    }

	
    /**************************************************************************/
    async getFieldGivenStrongs (strongs, fieldName)
    {
        await this._ensureInitialised();

	const rec = await this.getAllFieldsGivenStrongs(strongs);

	if (undefined === rec)
	    return undefined;
	else
	    return rec[fieldName];
    }

	
    /**************************************************************************/
    /* Acquires the places data and creates the index. */
    
    async _ensureInitialised()
    {
        if (!this._initPromise)
	{
	    const url = JFrameworkUtils.getFullUrl(JFrameworkSharedConstants.getValue('placesData'));
            this._initPromise = (async () => {
                const response = await fetch(url);
                const text = await response.text();
		this._processData(text)
            })();
        }
	
        await this._initPromise;
    }


    /**************************************************************************/
    _processData (text)
    {
	this._parsedData = new Map();
	const data = JSON.parse(text);
	for (const [dName, rec] of Object.entries(data))
	    this._parsedData.set(rec.dStrongs, rec);
    }
}
