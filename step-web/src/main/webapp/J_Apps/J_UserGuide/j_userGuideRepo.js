/******************************************************************************/
/* STEPBible User Guide -- where the editor reads and writes pages.

   The guide lives in git, so the editor simply edits the files of a local
   checkout: the user picks the folder once (File System Access API, available
   in Edge and Chrome, works offline) and Save writes

     html/json/J_AppsJson/J_UserGuide/pages/<id>.html
     html/json/J_AppsJson/J_UserGuide/j_userGuide_nav.json
     images/J_AppsImages/J_UserGuide/<hash>.<ext>

   The user then commits with git as usual.  The chosen folder may be the
   step-web folder itself, the webapp folder of the STEP source
   (src/main/webapp) or the root of the repository: we look for the guide
   inside it.

   Without a folder, pages are read from the web server (read-only).
*/

/******************************************************************************/
'use strict';

const _GUIDE_DIR = ['html', 'json', 'J_AppsJson', 'J_UserGuide'];
const _IMAGE_DIR = ['images', 'J_AppsImages', 'J_UserGuide'];
const _NAV_FILE = 'j_userGuide_nav.json';
const _CANDIDATE_ROOTS = [[], ['src', 'main', 'webapp'], ['step-web'], ['step-web', 'src', 'main', 'webapp'], ['step', 'step-web', 'src', 'main', 'webapp']];
const _DB = 'jUserGuideEditor', _STORE = 'handles';


/******************************************************************************/
/* Remembering the folder between visits (handles can be stored in IndexedDB). */

function _db ()
{
    return new Promise((resolve, reject) => {
	const req = indexedDB.open(_DB, 1);
	req.onupgradeneeded = () => req.result.createObjectStore(_STORE);
	req.onsuccess = () => resolve(req.result);
	req.onerror = () => reject(req.error);
    });
}

async function _remember (handle)
{
    try
    {
	const db = await _db();
	db.transaction(_STORE, 'readwrite').objectStore(_STORE).put(handle, 'root');
    }
    catch (e) { /* Not essential. */ }
}

async function _recall ()
{
    try
    {
	const db = await _db();
	return await new Promise(resolve => {
	    const req = db.transaction(_STORE).objectStore(_STORE).get('root');
	    req.onsuccess = () => resolve(req.result || null);
	    req.onerror = () => resolve(null);
	});
    }
    catch (e) { return null; }
}


/******************************************************************************/
async function _dir (base, parts, create = false)
{
    let d = base;
    for (const p of parts)
	d = await d.getDirectoryHandle(p, { create: create });
    return d;
}


/******************************************************************************/
class _ClassJUserGuideRepo
{
    /**************************************************************************/
    constructor ()
    {
	this.root = null;          // The webapp root (contains html/, images/ ...).
	this.pickedName = '';      // Name of the folder the user chose.
	this.pendingHandle = null; // Remembered folder needing permission again.
    }

    get canWrite () { return !!this.root; }
    get supported () { return 'showDirectoryPicker' in window; }


    /**************************************************************************/
    /* On start-up: reuse the folder chosen last time if the browser still
       allows it without asking; otherwise remember it so that the user can
       reconnect with a single click. */

    async restore ()
    {
	if (!this.supported) return false;
	const handle = await _recall();
	if (!handle) return false;
	const permission = await handle.queryPermission({ mode: 'readwrite' });
	if (permission === 'granted')
	    return this._useFolder(handle);
	this.pendingHandle = handle;
	return false;
    }


    /**************************************************************************/
    /* Must be called from a click. */

    async reconnect ()
    {
	const handle = this.pendingHandle;
	if (!handle) return this.choose();
	if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') return false;
	this.pendingHandle = null;
	return this._useFolder(handle);
    }


    /**************************************************************************/
    /* Must be called from a click.  Throws Error('notFound') if the folder
       does not contain the guide. */

    async choose ()
    {
	const handle = await window.showDirectoryPicker({ id: 'stepbible-guide', mode: 'readwrite' });
	return this._useFolder(handle);
    }


    /**************************************************************************/
    async _useFolder (handle)
    {
	for (const candidate of _CANDIDATE_ROOTS)
	{
	    try
	    {
		const root = await _dir(handle, candidate);
		const guide = await _dir(root, _GUIDE_DIR);
		await guide.getFileHandle(_NAV_FILE);
		this.root = root;
		this.pickedName = handle.name;
		await _remember(handle);
		return true;
	    }
	    catch (e) { /* Try the next candidate. */ }
	}
	throw new Error('notFound');
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Reading                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async readNav ()
    {
	if (this.root)
	    return JSON.parse(await this._readText(_GUIDE_DIR, _NAV_FILE));
	const r = await fetch('/' + _GUIDE_DIR.join('/') + '/' + _NAV_FILE, { cache: 'no-cache' });
	if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
	return r.json();
    }


    /**************************************************************************/
    async readPage (id)
    {
	if (this.root)
	{
	    try { return await this._readText(_GUIDE_DIR.concat(['pages']), id + '.html'); }
	    catch (e) { return ''; }
	}
	const r = await fetch('/' + _GUIDE_DIR.join('/') + '/pages/' + encodeURIComponent(id) + '.html', { cache: 'no-cache' });
	return r.ok ? r.text() : '';
    }


    /**************************************************************************/
    async _readText (dirParts, name)
    {
	const dir = await _dir(this.root, dirParts);
	const file = await (await dir.getFileHandle(name)).getFile();
	return file.text();
    }


    /**************************************************************************/
    /* Images in the repo are shown from the folder too (the web server may be
       an older installed copy which does not have them yet). */

    async imageObjectUrl (src)
    {
	if (!this.root || !src.startsWith('/images/J_AppsImages/J_UserGuide/')) return null;
	try
	{
	    const dir = await _dir(this.root, _IMAGE_DIR);
	    const file = await (await dir.getFileHandle(src.split('/').pop())).getFile();
	    return URL.createObjectURL(file);
	}
	catch (e) { return null; }
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Writing                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async _write (dirParts, name, content)
    {
	const dir = await _dir(this.root, dirParts, true);
	const writable = await (await dir.getFileHandle(name, { create: true })).createWritable();
	await writable.write(content);
	await writable.close();
    }


    /**************************************************************************/
    async writePage (id, html)
    {
	await this._write(_GUIDE_DIR.concat(['pages']), id + '.html', html);
    }


    /**************************************************************************/
    async deletePage (id)
    {
	const dir = await _dir(this.root, _GUIDE_DIR.concat(['pages']));
	try { await dir.removeEntry(id + '.html'); } catch (e) { /* Already gone. */ }
    }


    /**************************************************************************/
    /* Same layout as tools/build_userguide.py writes (indent 1, final newline)
       so that git diffs stay small. */

    async writeNav (nav)
    {
	await this._write(_GUIDE_DIR, _NAV_FILE, JSON.stringify(nav, null, 1) + '\n');
    }


    /**************************************************************************/
    /* Stores an image given as a data: URL; returns its site URL.  Files are
       named after their content, so saving the same picture twice is harmless. */

    async writeImage (dataUrl)
    {
	const m = dataUrl.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.*)$/s);
	if (!m) throw new Error('bad image');
	const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
	const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', bytes))).slice(0, 8)
	      .map(b => b.toString(16).padStart(2, '0')).join('');
	const name = hash + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
	await this._write(_IMAGE_DIR, name, bytes);
	return '/' + _IMAGE_DIR.join('/') + '/' + name;
    }
}

export const JUserGuideRepo = new _ClassJUserGuideRepo();
