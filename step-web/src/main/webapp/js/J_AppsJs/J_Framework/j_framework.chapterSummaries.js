/******************************************************************************/
/* Makes available chapter summaries.

   The original data is held at

      https://www.dropbox.com/scl/fi/95sj5cywnceey5j1vkal8/AllOutlines-ExtraBooks-AI.txt?rlkey=0zgrb1fb3a9cfehwihe322kxz&dl=1

   but I work here with a trimmed down version.  In particular,
   the data gives information for books, for chapter ranges and
   for individual chapters; and covers DC books and extra biblical
   text as well as OT and NT.  Here I supply only OT and NT material
   at present, and only the material which applies to individual
   chapters.  (It would not be difficult to extend this to cover
   additional items, but at the time of writing I have need only of
   OT and NT.)

   In the raw text there are multiple consecutive lines for each
   chapter, organised from very brief summary to comprehensive.
   I take the comprehensive data here.

   To use this functionality, include the class definition in your file,
   and then use something along the lines of:

	(async () => {
	    const a = JFrameworkChapterSummaries.instance().getChapterSummary('Gen.1');
	    const b = JFrameworkChapterSummaries.instance().getChapterSummary('Gen.2');
	    ...
	    Do something with the data
	})();

  The data is downloaded and parsed only when you first do a get.
*/

/******************************************************************************/
import { JFrameworkSharedConstants } from '/js/J_AppsJs/J_Framework/j_framework.sharedConstants.js';
import { JFrameworkUtils } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';


/******************************************************************************/
export class JFrameworkChapterSummaries
{
    /**************************************************************************/
    static _instance = null;
    static instance ()
    {
	if (null === this._instance)
	    this._instance = new JFrameworkChapterSummaries();

	return this._instance;
    }

    
    /**************************************************************************/
    /* Returns the summary data for a given chapter, or null if there is no
       data. */
    
    async getChapterSummary (chapterRefOrRefKey)
    {
        await this._ensureInitialised();

	if ('string' === typeof(chapterRefOrRefKey))
	    chapterRefOrRefKey = JFrameworkUtils.convertStringRefToBCRefKey(chapterRefOrRefKey);
	
        return this._chapterRefKeyToSummary.get(chapterRefOrRefKey);
    }

    
    /**************************************************************************/
    /* Acquires the summary data and creates the index. */
    
    async _ensureInitialised ()
    {
        if (!this._initPromise)
	{
	    const url = JFrameworkUtils.getFullUrl(JFrameworkSharedConstants.getValue('chapterSummariesData'));
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
	const map = new Map();
	const rawData = text.split('\n');
	for (const line of rawData)
	{
	    const [chapter, summary] = line.split(/\t/);
	    map.set(JFrameworkUtils.convertStringRefToBCRefKey(chapter), summary);
	}

        this._chapterRefKeyToSummary = map;
    }
}
