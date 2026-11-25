/******************************************************************************/
/* STEPBible User Guide -- viewer.

   Displays the STEPBible User Guide (imported from stepbibleguide.blogspot.com
   by tools/build_userguide.py) inside STEPBible itself.

   - Content:  /html/json/J_AppsJson/J_UserGuide/j_userGuide_nav.json
                 { nav: [...menu tree...], pages: { id: { title, updated, source } } }
               /html/json/J_AppsJson/J_UserGuide/pages/<id>.html   (one file per page,
                 written by tools/build_userguide.py or by the editor, editor.html)

   - Routing:  #pageId            shows a page
               #pageId:anchorId   shows a page and scrolls to an anchor
               ?page=pageId       same as #pageId

   - Links to STEPBible passages / searches (class jUG-stepLink) are passed
     to the openInStep function given to init (application.js shows them in
     the scripture panel), or opened in a new STEP tab if there is none.

   No framework dependencies: application.js does the layout (J_Lib) and the
   user's display settings.
*/

/******************************************************************************/
'use strict';

const _NAV_URL   = '/html/json/J_AppsJson/J_UserGuide/j_userGuide_nav.json';
const _PAGES_URL = '/html/json/J_AppsJson/J_UserGuide/pages/';
const _EDITOR_URL = new URL('editor.html', import.meta.url).pathname;

// The editor saves into a local git checkout, so the "Edit this page" link is
// only offered on a local STEP (the desktop install or a dev server), never to
// visitors of stepbible.org.
const _SHOW_EDIT_LINK = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
const _APP_NAME = 'STEPBible User Guide';




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Viewer                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJUserGuide
{
    /**************************************************************************/
    constructor ()
    {
	this._data = null;
	this._order = [];          // Page ids in menu order (for previous / next).
	this._parents = new Map(); // Page id -> array of ancestor nodes.
	this._textIndex = null;    // Page id -> lower-cased plain text (built on first search).
	this._currentId = null;
	this._html = new Map();    // Page id -> HTML (fetched on demand).
	this._renderSeq = 0;       // Guards against out-of-order fetches.
	this._openInStepHandler = null;
    }


    /**************************************************************************/
    async _getHtml (id)
    {
	if (!this._html.has(id))
	{
	    const response = await fetch(_PAGES_URL + encodeURIComponent(id) + '.html', { cache: 'no-cache' });
	    this._html.set(id, response.ok ? await response.text() : `<p class='jUG-appEmpty'>This page could not be loaded.</p>`);
	}
	return this._html.get(id);
    }


    /**************************************************************************/
    /* options.openInStep(relativeUrl), if given, shows a STEPBible URL
       alongside the guide; otherwise such links open in a new tab. */

    async init ({ openInStep = null } = {})
    {
	this._openInStepHandler = openInStep;

	this._menu    = document.getElementById('jUG-menu');
	this._main    = document.getElementById('jUG-main');
	this._page    = document.getElementById('jUG-page');
	this._search  = document.getElementById('jUG-search');

	this._wireUpChrome();

	try
	{
	    const response = await fetch(_NAV_URL, { cache: 'no-cache' });
	    if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
	    this._data = await response.json();
	}
	catch (e)
	{
	    this._page.innerHTML = `<h1 class='jUG-appPageTitle'>${_APP_NAME}</h1><p class='jUG-appEmpty'>The guide could not be loaded (${this._escape(e.message)}).</p>`;
	    return;
	}

	this._buildMenu();
	window.addEventListener('hashchange', () => this._route());

	const pageFromQuery = new URLSearchParams(window.location.search).get('page');
	if (pageFromQuery && !window.location.hash)
	    history.replaceState(null, '', '#' + pageFromQuery);

	this._route();
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                              Chrome                                  **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _wireUpChrome ()
    {
	const me = this;

	document.getElementById('jUG-menuButton').addEventListener('click', (event) => {
	    event.stopPropagation();
	    document.body.classList.toggle('jUG-menuOpen');
	});

	this._main.addEventListener('click', () => document.body.classList.remove('jUG-menuOpen'));

	let searchTimer = null;
	const doSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => me._showSearch(me._search.value), 250); };
	this._search.addEventListener('input', doSearch);
	this._search.addEventListener('keydown', (event) => {
	    if ('Escape' === event.key)
	    {
		me._search.value = '';
		me._route();
	    }
	    else if ('Enter' === event.key)
		me._showSearch(me._search.value);
	});

	// All clicks on links within page content go through here.
	this._page.addEventListener('click', (event) => me._onContentClick(event));
    }


    /**************************************************************************/
    _buildMenu ()
    {
	const me = this;

	function build (nodes, ancestors)
	{
	    const ul = document.createElement('ul');
	    for (const node of nodes)
	    {
		me._order.push(node.id);
		me._parents.set(node.id, ancestors);

		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = '#' + node.id;
		a.textContent = node.title;
		a.dataset.page = node.id;
		a.addEventListener('click', () => document.body.classList.remove('jUG-menuOpen'));
		li.appendChild(a);

		if (node.children)
		    li.appendChild(build(node.children, ancestors.concat([node])));

		ul.appendChild(li);
	    }
	    return ul;
	}

	this._menu.innerHTML = '';
	this._menu.appendChild(build(this._data.nav, []));
    }


    /**************************************************************************/
    _highlightMenu (id)
    {
	for (const a of this._menu.querySelectorAll('a'))
	{
	    const isCurrent = a.dataset.page === id;
	    a.classList.toggle('jUG-current', isCurrent);
	    if (isCurrent) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
	}

	const current = this._menu.querySelector('a.jUG-current');
	if (current)
	{
	    const r = current.getBoundingClientRect(), m = this._menu.getBoundingClientRect();
	    if (r.top < m.top || r.bottom > m.bottom)
		current.scrollIntoView({ block: 'center' });
	}
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Pages                                  **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async _route ()
    {
	const hash = decodeURIComponent(window.location.hash.substring(1));
	const [requestedId, anchor] = hash.split(':');
	const id = this._data.pages[requestedId] ? requestedId : this._data.home;

	if (id !== this._currentId || this._page.dataset.mode !== 'page')
	{
	    const seq = ++this._renderSeq;
	    const html = await this._getHtml(id);
	    if (seq !== this._renderSeq)
		return; // The user has already moved on.
	    this._renderPage(id, html);
	}

	if (anchor)
	    this._scrollToAnchor(anchor);
	else if (id !== requestedId || !hash)
	    this._main.scrollTop = 0;
    }


    /**************************************************************************/
    _renderPage (id, html)
    {
	const page = this._data.pages[id];
	this._currentId = id;
	this._page.dataset.mode = 'page';
	this._search.value = '';

	// Breadcrumb.
	const crumbs = (this._parents.get(id) || [])
	      .map(node => `<a href='#${node.id}'>${this._escape(node.title)}</a>`);
	const breadcrumb = crumbs.length ? `<div class='jUG-appBreadcrumb'>${crumbs.join(' &rsaquo; ')}</div>` : '';

	// Previous / next in menu order.
	const ix = this._order.indexOf(id);
	const prev = ix > 0 ? this._order[ix - 1] : null;
	const next = ix >= 0 && ix < this._order.length - 1 ? this._order[ix + 1] : null;
	const link = (pid, cls, arrow) => pid
	      ? `<a class='${cls}' href='#${pid}'>${arrow === '<' ? '&larr; ' : ''}${this._escape(this._data.pages[pid].title)}${arrow === '>' ? ' &rarr;' : ''}</a>`
	      : '';

	this._page.innerHTML =
	    breadcrumb +
	    `<h1 class='jUG-appPageTitle'>${this._escape(page.title)}</h1>` +
	    `<div class='jUG-content'>${html}</div>` +
	    `<div class='jUG-appPageFooter'>${link(prev, 'jUG-prev', '<')}${link(next, 'jUG-next', '>')}</div>` +
	    `<div class='jUG-appSource'>` +
	      (page.source ? `Originally from the <a href='${this._escape(page.source)}' target='_blank' rel='noopener'>STEPBible User Guide blog</a> &middot; ` : '') +
	      `updated ${this._escape(page.updated || '')}` +
	      (_SHOW_EDIT_LINK ? ` &middot; <a href='${_EDITOR_URL}?page=${encodeURIComponent(id)}' target='_blank'>Edit this page</a>` : '') +
	    `</div>`;

	// Wide data tables scroll sideways rather than widening the page.
	for (const table of this._page.querySelectorAll('.jUG-content table.jUG-dataTable'))
	{
	    const wrapper = document.createElement('div');
	    wrapper.className = 'jUG-tableScroll';
	    table.parentNode.insertBefore(wrapper, table);
	    wrapper.appendChild(table);
	}

	document.title = page.title + ' - ' + _APP_NAME;
	this._highlightMenu(id);
	this._main.scrollTop = 0;
    }


    /**************************************************************************/
    _scrollToAnchor (anchor)
    {
	const target = this._page.querySelector(`[id="${CSS.escape(anchor)}"], [name="${CSS.escape(anchor)}"]`);
	if (!target)
	    return;

	// Anchors in the guide are usually empty <a id=...>: scroll to them, but
	// flash the next visible block so the user can see where they landed.
	target.scrollIntoView({ block: 'start' });
	const flash = target.closest('td, div, h2, h3, h4, li') || target.parentElement;
	if (flash)
	{
	    flash.classList.remove('jUG-flash');
	    void flash.offsetWidth;
	    flash.classList.add('jUG-flash');
	}
    }


    /**************************************************************************/
    _onContentClick (event)
    {
	const a = event.target.closest('a');
	if (!a || !this._page.contains(a))
	    return;

	const href = a.getAttribute('href') || '';

	// Same-page anchor: the hash may not change, so handle it directly.
	if (href.startsWith('#') && decodeURIComponent(href.substring(1)) === decodeURIComponent(window.location.hash.substring(1)))
	{
	    event.preventDefault();
	    this._route();
	    return;
	}

	if (a.classList.contains('jUG-stepLink'))
	{
	    event.preventDefault();
	    this._openInStep(href);
	}
    }


    /**************************************************************************/
    /* Opens a STEPBible URL (e.g. '/?q=version=ESV|reference=John.3') next
       to the guide, or in a new tab if there is nowhere to show it. */

    _openInStep (relativeUrl)
    {
	if (this._openInStepHandler)
	    this._openInStepHandler(relativeUrl);
	else
	    window.open(new URL(relativeUrl, window.location.origin).toString(), '_blank', 'noopener');
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Search                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async _buildTextIndex ()
    {
	const index = new Map();
	const parser = new DOMParser();
	const ids = Object.keys(this._data.pages);
	const htmls = await Promise.all(ids.map(id => this._getHtml(id)));
	ids.forEach((id, i) => {
	    const text = parser.parseFromString(htmls[i], 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
	    index.set(id, { text: text, lower: text.toLowerCase(), title: this._data.pages[id].title.toLowerCase() });
	});
	this._textIndex = index;
    }


    /**************************************************************************/
    async _showSearch (query)
    {
	query = query.trim();
	if (!query)
	{
	    this._page.dataset.mode = '';
	    this._route();
	    return;
	}

	if (!this._textIndex)
	{
	    this._page.innerHTML = `<p class='jUG-appEmpty'>Searching&hellip;</p>`;
	    await this._buildTextIndex();
	    if (this._search.value.trim() !== query)
		return; // Superseded by a later keystroke.
	}

	const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 || /\d/.test(w));
	const results = [];

	for (const id of this._order)
	{
	    const entry = this._textIndex.get(id);
	    if (!entry || !words.every(w => entry.lower.includes(w) || entry.title.includes(w)))
		continue;

	    let score = 0;
	    for (const w of words)
	    {
		if (entry.title.includes(w)) score += 50;
		score += Math.min(20, entry.lower.split(w).length - 1);
	    }

	    const first = Math.max(0, entry.lower.indexOf(words[0]));
	    const start = Math.max(0, first - 70);
	    let snippet = (start > 0 ? '... ' : '') + entry.text.substring(start, first + 160) + ' ...';
	    snippet = this._escape(snippet);
	    for (const w of words)
		snippet = snippet.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');

	    results.push({ id: id, score: score, snippet: snippet });
	}

	results.sort((a, b) => b.score - a.score);

	this._page.dataset.mode = 'search';
	this._currentId = null;
	this._highlightMenu(null);
	this._page.innerHTML =
	    `<h1 class='jUG-appPageTitle'>Search: ${this._escape(query)}</h1>` +
	    (results.length
	     ? `<p class='jUG-appBreadcrumb'>${results.length} page${results.length > 1 ? 's' : ''} found</p><ul class='jUG-appResults'>` +
	       results.map(r => `<li><a href='#${r.id}'>${this._escape(this._data.pages[r.id].title)}</a><div class='jUG-snippet'>${r.snippet}</div></li>`).join('') +
	       '</ul>'
	     : `<p class='jUG-appEmpty'>No pages of the guide contain "${this._escape(query)}".</p>`);
	this._main.scrollTop = 0;
    }


    /**************************************************************************/
    _escape (s)
    {
	return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
}




/******************************************************************************/
export const JUserGuide = new _ClassJUserGuide();
