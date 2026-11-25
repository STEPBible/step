/******************************************************************************/
/* A standard data handler.

   This was written to support the mapping functionality, but other things like
   Genealogy have similar requirements, so I'm assuming this may represent a
   suitable candidate as a library class.

   It is set up to deal with a single file of JSON data, which it reads and
   stores as a list of records in the Data variable.  You are free to access
   that list directly if you need to do more than is covered by the
   functionality here.

   Aside from reading the data, the class simply gives you different ways
   of accessing it.

   Fields are assumed to be of one of two kinds.  There are single-valued
   fields (eg 'Fred') and multi-valued fields ('/Fred/Bill/').  The latter
   clearly make assumptions about how the data has been set up (ie they assume
   multiple string values, separated by slashes, and with a slash at front
   and end), so multi-valued fields are perhaps a little more tightly bound
   to the way in which I create JSON data for use in the various applications.
   Single-valued fields should be good for anything, though.

   getByIndex does the obvious thing -- you pass an index, and the
   class returns the record at that offset into the list.

   The remaining get* methods all return a list of indexes, on the basis
   that potentially many different records may match the search criteria.

   getFromSingleValuedField (fieldName, key) looks in the given field for the
   given key value.

   getFromMultiValuedField (fieldName, key) does the same, except that it
   looks in multi-valued fields, and the search string is made up of the
   key, preceded and followed by slashes.

   A Jamieson   Oct 2026.
*/

export class J_ClassStandardDataHandler
{
    /**************************************************************************/
    /* Reads JSON data.

       multiValuedFields should be set to a list of multi-valued fields which
       you may search on.  Such fields are assumed either to be empty, or to
       start and end with a slash, with one or more values slash-separated.
       At the time of writing I have not bohered to index these fields, but
       it could be done if this turns out to be a requirement for the sake of
       efficiency.

       Each entry in multiValuedFields should comprise:

         { fieldName: "myField", unique: trueOrFalse }

       If unique is true, the search facilities give up as soon as a match
       is found.  If false, they return a list containing all matches. */
    
    async initialise (dataPath, _ignoredFieldDescriptions = null)   // Second argument accepted for compatibility with callers; not used.
    {
	const response = await fetch(dataPath);
	if (!response.ok) throw new Error(`${dataPath}: ${response.status} ${response.statusText}`);

	this.Data = await response.json();
	return this;
    }


    /**************************************************************************/
    convertIndexesToRecords (ixs)
    {
	const me = this;
	return ixs.map(i => me.Data[i]);
    }

    
    /**************************************************************************/
    getByIndex (ix)
    {
	return this.Data[ix];
    }

    
    /**************************************************************************/
    /* There are some string fields which may contain multiple values.  In such
       cases, the string is of the form /abc/def/ghi/.../xyz/.

       The purpose of the present method is to identify all of those records
       in the data array where the key appears (as /key/) in the given field. */
    
    getFromMultiValuedField (fieldName, key, firstOnly)
    {
	const target = "/" + key.toLowerCase() + "/";
	const matches = record => String(record[fieldName]).toLowerCase().includes(target);

	if (firstOnly)
	{
            const index = this.Data.findIndex(matches);
            return -1 === index ? [] : [index];
	}

	return this.Data.flatMap((record, index) => matches(record) ? [index] : []);
    }


    /**************************************************************************/
    /* Returns a list of indexes for all records which match a given value in
       a given single-valued field. */
    
    getFromSingleValuedField (fieldName, key, firstOnly)
    {
	const target = key.toLowerCase();
	const matches = record => String(record[fieldName]).toLowerCase() === target;

	if (firstOnly)
	{
            const index = this.Data.findIndex(matches);     // Stops at the first match.
            return -1 === index ? [] : [index];
	}

	return this.Data.flatMap((record, index) => matches(record) ? [index] : []);
    }
}
