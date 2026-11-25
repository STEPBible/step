/******************************************************************************/
/* STEPBible User Guide -- visual page editor.

   An Elementor-style editor for people who don't write HTML:

   - drag a block from the panel onto the page (or click it to add it at the
     end / after the selected block);
   - type straight into headings, text and notes; select a block to change
     its settings (image, alignment, Bible reference ...);
   - Save writes the page into the git checkout the user picked
     (see j_userGuideRepo.js); then they commit as usual.

   Pages are plain HTML files; j_userGuideBlocks.js converts them to blocks
   and back.  The canvas uses the viewer's own CSS, so what you see is what
   the guide will show.

   The interface is in English.
*/

/******************************************************************************/
'use strict';
import { BLOCK_TYPES, newBlock, blockToHtml, blocksToHtml, htmlToBlocks, escapeHtml, passageUrl } from './j_userGuideBlocks.js';
import { JUserGuideRepo }                from './j_userGuideRepo.js';
import { sanitizeHtml, sanitizeText }    from './j_userGuideSanitize.js';
import { JUserGuideSettings }            from './j_userGuideSettings.js';
import { J_LIB_COMMON_CSS, loadStylesheetFirst } from './imports.js';

const _VIEWER_URL = new URL('application.html', import.meta.url).pathname;
const _MAX_IMAGE_SIDE = 1400;




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Translations                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

const _STRINGS = {
    en: {
	editorTitle: 'Guide editor', openPage: 'Open another page or create a new one', undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)',
	mobileView: 'See it as on a phone', preview: 'Preview (hide the editing tools)', help: 'How does this work?', save: 'Save',
	tabBlocks: 'Blocks', tabPage: 'Page', blocksHint: 'Drag a block onto the page, or click it to add it.',
	bold: 'Bold', italic: 'Italic', underline: 'Underline', link: 'Link', bullets: 'Bulleted list', numbers: 'Numbered list', clearFormat: 'Clear formatting',
	titlePlaceholder: 'Page title', addZone: 'Drop a block here, or click a block on the left',
	b_heading: 'Heading', b_text: 'Text', b_image: 'Image', b_passage: 'Bible passage', b_note: 'Note / tip', b_video: 'Video',
	b_button: 'Button', b_table: 'Table', b_divider: 'Divider', b_original: 'Original content',
	f_level: 'Size', f_align: 'Alignment', f_src: 'Picture', f_alt: 'Description of the picture', f_caption: 'Caption (optional)',
	f_size: 'Size', f_ref: 'Reference', f_version: 'Bible version', f_label: 'Text shown (optional)', f_style: 'Look',
	f_kind: 'Type', f_url: 'YouTube or Vimeo address', f_href: 'Goes to', f_tableTools: 'Rows and columns',
	headingLarge: 'Large', headingMedium: 'Medium', headingSmall: 'Small',
	alignLeft: 'Left', alignCenter: 'Centre', alignRight: 'Right', imageLeft: 'Left, text beside', imageRight: 'Right, text beside',
	sizeSmall: 'Small', sizeMedium: 'Medium', sizeFull: 'Full width', sizeAuto: 'Original',
	styleButton: 'Button', styleLink: 'Link', noteTip: 'Tip', noteInfo: 'Information', noteWarning: 'Warning',
	altHint: 'For people who cannot see it. E.g. "The search box with a word typed in".',
	refHint: 'E.g. John 3:16, Gen 1, Rom 8:28-39', versionHint: 'E.g. ESV, KJV, NIV. Leave empty for the user\'s own.',
	labelHint: 'If empty, the reference is shown.', videoHint: 'Paste the address of the video page.',
	hrefHint: 'A page of the guide, or a web address (https://...).',
	ph_heading: 'Write a heading...', ph_text: 'Write here...', ph_note: 'Write the note...', ph_image: 'Click to choose a picture, or drop it here',
	ph_video: 'Select this block and paste a YouTube address', ph_button: 'Select this block to set the text and where it goes',
	duplicate: 'Duplicate', delete: 'Delete', moveUp: 'Move up', moveDown: 'Move down', drag: 'Drag to move',
	back: 'Back to blocks', chooseImage: 'Choose picture...', changeImage: 'Change picture...', testPassage: 'Try it in STEPBible',
	addRow: '+ Row', addCol: '+ Column', delRow: '- Row', delCol: '- Column', tableTip: 'Click in a cell first.',
	pageId: 'File name', pageIdHint: 'Used in links. It cannot be changed.', pageLocation: 'Where it appears in the menu', topLevel: '(Main menu)',
	deletePage: 'Delete this page', viewInGuide: 'Open in the guide', newPageButton: '+ New page',
	folderTitle: 'Where pages are saved', folderNone: 'No folder chosen yet. You can look around and edit, but to save you need to choose the folder of your copy of the repository.',
	folderConnect: 'Choose folder...', folderReconnect: 'Reconnect "{0}"', folderOk: 'Saving into "{0}"',
	folderUnsupported: 'To save, open this page in Microsoft Edge or Google Chrome.',
	folderNotFound: 'That folder does not contain the guide. Choose the folder of your copy of the repository (or its step-web folder).',
	saved: 'Saved', unsaved: 'Unsaved changes', notSavedYet: 'New page, not saved yet',
	openPageTitle: 'Open a page', searchPages: 'Search pages...', newPageTitle: 'New page', newPageName: 'Title of the new page',
	create: 'Create', cancel: 'Cancel', ok: 'OK', close: 'Close',
	discardTitle: 'Unsaved changes', discardText: 'You have changes on this page that are not saved. What do you want to do?',
	discard: 'Discard them', saveFirst: 'Save first',
	deleteTitle: 'Delete page', deleteText: 'Delete "{0}" from the guide? (Its file is removed from your folder; git can still bring it back until you commit.)',
	linkTitle: 'Link', linkUrl: 'Web address', linkPage: '...or a page of the guide', linkNone: '(choose a page)', removeLink: 'Remove link', apply: 'Apply',
	helpTitle: 'How to edit the guide',
	helpHtml: '<ol><li><b>Choose a page</b> with the button at the top, or create a new one.</li>' +
		  '<li><b>Add blocks</b>: drag them from the left onto the page (or click them). Write directly in headings and text.</li>' +
		  '<li><b>Click a block</b> to change its settings on the left: picture, size, Bible reference... Use the blue bar on the block to move, copy or delete it.</li>' +
		  '<li><b>Save</b>. The first time, choose the folder of your copy of the repository. The page is written there.</li>' +
		  '<li>Then <b>commit</b> the changes with git (or GitHub Desktop) as usual.</li></ol>' +
		  '<p>Ctrl+Z undoes, Ctrl+S saves. Nothing is sent over the internet: everything stays on this computer.</p>',
	savedToast: 'Saved in your folder. Remember to commit it with git.', saveError: 'Could not save: {0}',
	connectTitle: 'Choose where to save', connectText: 'Pages are saved into your copy of the repository. Choose its folder (the repository itself, or its step-web folder). You only need to do this once.',
	connectButton: 'Choose folder...', deletedToast: 'Page deleted. Commit the change with git.',
	originalTag: 'Original content - you can edit the text', readError: 'The guide could not be loaded: {0}', imageError: 'That file is not a picture that can be used.',
	pageOpened: 'Opened "{0}"'
    }
};

const _LANG = 'en';   // English only

function T (key, ...args)
{
    const s = _STRINGS.en[key] ?? key;
    return s.replace(/\{(\d)\}/g, (_, i) => args[i] ?? '');
}

const _PALETTE = ['heading', 'text', 'image', 'passage', 'note', 'video', 'button', 'table', 'divider'];




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Editor                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJUserGuideEditor
{
    /**************************************************************************/
    constructor ()
    {
	this.nav = null;          // Content of j_userGuide_nav.json.
	this.page = null;         // { id, title, parent, isNew }
	this.blocks = [];
	this.selected = null;     // uid of the selected block.
	this._past = [];          // Undo stack (JSON snapshots).
	this._future = [];
	this._current = '';       // Snapshot of the current state.
	this._saved = '';         // Snapshot when last loaded / saved.
	this._typingTimer = null;
	this._savedRange = null;  // Text selection kept while the link dialog is open.
	this._imageTarget = null; // Block waiting for a picture from the file picker.
    }


    /**************************************************************************/
    async init ()
    {
	await loadStylesheetFirst(J_LIB_COMMON_CSS); // STEPBible colour variables (J_Lib).
	document.body.style.visibility = '';
	JUserGuideSettings.init();
	this._$ = id => document.getElementById(id);
	this._translateStatic();
	this._buildPalette();
	this._wireUp();

	try { await JUserGuideRepo.restore(); } catch (e) { /* Choose again later. */ }
	this._renderFolder();

	try
	{
	    this.nav = await JUserGuideRepo.readNav();
	}
	catch (e)
	{
	    this._toast(T('readError', e.message), true);
	    return;
	}

	const wanted = new URLSearchParams(location.search).get('page');
	await this._openPage(wanted && this.nav.pages[wanted] ? wanted : this.nav.home);
	this._selectTab('blocks');
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                           Static UI                                  **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _translateStatic ()
    {
	document.documentElement.lang = _LANG;
	for (const el of document.querySelectorAll('[data-t]')) el.textContent = T(el.dataset.t);
	for (const el of document.querySelectorAll('[data-t-title]')) { el.title = T(el.dataset.tTitle); el.setAttribute('aria-label', T(el.dataset.tTitle)); }
	for (const el of document.querySelectorAll('[data-t-placeholder]')) el.placeholder = T(el.dataset.tPlaceholder);
    }


    /**************************************************************************/
    _buildPalette ()
    {
	const palette = this._$('jUGe-palette');
	for (const type of _PALETTE)
	{
	    const tile = document.createElement('button');
	    tile.type = 'button';
	    tile.className = 'jUGe-tile';
	    tile.draggable = true;
	    tile.dataset.type = type;
	    tile.innerHTML = `<span class='jUGe-tileIcon' aria-hidden='true'>${BLOCK_TYPES[type].icon}</span><span class='jUGe-tileLabel'>${escapeHtml(T('b_' + type))}</span>`;
	    tile.addEventListener('click', () => this._addBlock(type));
	    tile.addEventListener('dragstart', (e) => {
		e.dataTransfer.setData('application/x-jug-new', type);
		e.dataTransfer.effectAllowed = 'copy';
	    });
	    palette.appendChild(tile);
	}
    }


    /**************************************************************************/
    _wireUp ()
    {
	const me = this;

	this._$('jUGe-pageButton').addEventListener('click', () => me._showPagePicker());
	this._$('jUGe-save').addEventListener('click', () => me.save());
	this._$('jUGe-undo').addEventListener('click', () => me._undo());
	this._$('jUGe-redo').addEventListener('click', () => me._redo());
	this._$('jUGe-help').addEventListener('click', () => me._dialog(T('helpTitle'), T('helpHtml'), [{ label: T('close'), primary: true }]));

	this._$('jUGe-device').addEventListener('click', (e) => {
	    document.body.classList.toggle('jUGe-mobile');
	    e.currentTarget.classList.toggle('jUGe-on', document.body.classList.contains('jUGe-mobile'));
	});

	this._$('jUGe-preview').addEventListener('click', (e) => {
	    const on = document.body.classList.toggle('jUGe-previewing');
	    e.currentTarget.classList.toggle('jUGe-on', on);
	    me._select(null);
	    me._renderCanvas();
	});

	for (const tab of document.querySelectorAll('.jUGe-tab'))
	    tab.addEventListener('click', () => { me._select(null); me._selectTab(tab.dataset.tab); });

	// Title.
	const title = this._$('jUGe-title');
	title.addEventListener('input', () => {
	    me.page.title = sanitizeText(title.value);
	    me._$('jUGe-pageName').textContent = me.page.title || T('titlePlaceholder');
	    me._changedTyping();
	});
	title.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); title.blur(); } });

	// Format bar: keep the focus in the text while clicking its buttons.
	const format = this._$('jUGe-format');
	format.addEventListener('mousedown', (e) => e.preventDefault());
	format.addEventListener('click', (e) => {
	    const btn = e.target.closest('button[data-cmd]');
	    if (!btn) return;
	    if (btn.dataset.cmd === 'link')
		me._editLink();
	    else
	    {
		document.execCommand(btn.dataset.cmd, false, null);
		me._syncFocusedEditable();
	    }
	});

	document.addEventListener('focusin', (e) => {
	    format.hidden = !(e.target.isContentEditable && e.target.dataset.rich === 'yes');
	});
	document.addEventListener('focusout', () => setTimeout(() => {
	    if (!(document.activeElement && document.activeElement.isContentEditable)) format.hidden = true;
	}, 0));

	// Canvas: drag & drop, clicking outside blocks.
	const blocks = this._$('jUGe-blocks');
	const addZone = this._$('jUGe-addZone');
	for (const target of [blocks, addZone])
	{
	    target.addEventListener('dragover', (e) => me._onDragOver(e));
	    target.addEventListener('drop', (e) => me._onDrop(e));
	}
	document.addEventListener('dragend', () => me._clearDrop());
	this._$('jUGe-canvas').addEventListener('dragleave', (e) => { if (!e.relatedTarget || !me._$('jUGe-canvas').contains(e.relatedTarget)) me._clearDrop(); });
	addZone.addEventListener('click', () => me._selectTab('blocks'));
	this._$('jUGe-canvas').addEventListener('mousedown', (e) => {
	    if (!e.target.closest('.jUGe-block') && !e.target.closest('.jUGe-format') && e.target !== me._$('jUGe-title')) me._select(null);
	});

	// Picture file picker (shared by all image blocks).
	this._$('jUGe-file').addEventListener('change', async (e) => {
	    const file = e.target.files[0];
	    e.target.value = '';
	    if (file && me._imageTarget) await me._setImageFromFile(me._imageTarget, file);
	});

	// Keyboard.
	document.addEventListener('keydown', (e) => {
	    const inField = e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
	    const ctrl = e.ctrlKey || e.metaKey;
	    if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); me.save(); return; }
	    if (inField) return;
	    if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); me._undo(); }
	    else if (ctrl && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); me._redo(); }
	    else if ((e.key === 'Delete' || e.key === 'Backspace') && me.selected) { e.preventDefault(); me._deleteBlock(me.selected); }
	    else if (e.key === 'Escape') me._select(null);
	});

	window.addEventListener('beforeunload', (e) => {
	    if (me._isDirty()) { e.preventDefault(); e.returnValue = ''; }
	});
    }


    /**************************************************************************/
    _selectTab (tab)
    {
	for (const t of document.querySelectorAll('.jUGe-tab')) t.setAttribute('aria-selected', String(t.dataset.tab === tab));
	this._$('jUGe-panelBlocks').hidden = tab !== 'blocks';
	this._$('jUGe-panelPage').hidden = tab !== 'page';
	this._$('jUGe-panelBlock').hidden = tab !== 'block';
	document.querySelector('.jUGe-tabs').hidden = tab === 'block';
	if (tab === 'page') this._renderPagePanel();
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Pages                                  **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async _openPage (id)
    {
	const html = await JUserGuideRepo.readPage(id);
	this.page = { id: id, title: this.nav.pages[id]?.title || id, parent: this._parentOf(id), isNew: false };
	this.blocks = htmlToBlocks(html);
	this._resetHistory();
	this._afterPageChange();
	history.replaceState(null, '', '?page=' + encodeURIComponent(id));
    }


    /**************************************************************************/
    _newPage (title, parent)
    {
	let id = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
	    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60) || 'page';
	const base = id;
	for (let n = 2; this.nav.pages[id]; n++) id = base + '-' + n;

	this.page = { id: id, title: title, parent: parent, isNew: true };
	this.blocks = [newBlock('text')];
	this._resetHistory();
	this._saved = '';            // A new page counts as unsaved until saved.
	this._afterPageChange();
	history.replaceState(null, '', '?page=' + encodeURIComponent(id));
    }


    /**************************************************************************/
    _afterPageChange ()
    {
	this.selected = null;
	this._$('jUGe-title').value = this.page.title;
	this._$('jUGe-pageName').textContent = this.page.title;
	document.title = this.page.title + ' - ' + T('editorTitle');
	this._renderCanvas();
	this._selectTab('blocks');
	this._updateStatus();
	this._$('jUGe-canvas').scrollTop = 0;
    }


    /**************************************************************************/
    /* Asks what to do with unsaved changes.  Returns true if we may go on. */

    async _confirmLeave ()
    {
	if (!this._isDirty()) return true;
	const choice = await this._dialog(T('discardTitle'), `<p>${escapeHtml(T('discardText'))}</p>`,
					  [{ label: T('cancel'), value: 'cancel' }, { label: T('discard'), value: 'discard', danger: true },
					   { label: T('saveFirst'), value: 'save', primary: true }]);
	if (choice === 'save') return await this.save();
	return choice === 'discard';
    }


    /**************************************************************************/
    async _showPagePicker ()
    {
	const me = this;
	const tree = (nodes) => '<ul>' + nodes.map(n =>
	    `<li><button type='button' data-page='${escapeHtml(n.id)}'${n.id === me.page?.id ? " aria-current='page'" : ''}>${escapeHtml(n.title)}</button>${n.children ? tree(n.children) : ''}</li>`
	).join('') + '</ul>';

	const body = `<div style='display:flex;gap:8px'><input type='text' id='jUGe-pageFilter' placeholder='${escapeHtml(T('searchPages'))}' autocomplete='off'>` +
	      `<button type='button' class='jUGe-btn jUGe-primary' id='jUGe-newPage' style='white-space:nowrap'>${escapeHtml(T('newPageButton'))}</button></div>` +
	      `<div class='jUGe-pageList'>${tree(this.nav.nav)}</div>`;

	// The buttons only close the dialog with a value; we act once it is closed
	// (opening another dialog from inside this one would mix up their events).
	const choice = await this._dialog(T('openPageTitle'), body, [{ label: T('close') }], (dlg) => {
	    const filter = dlg.querySelector('#jUGe-pageFilter');
	    filter.addEventListener('input', () => {
		const q = filter.value.toLowerCase().trim();
		for (const li of dlg.querySelectorAll('.jUGe-pageList li'))
		    li.hidden = !!q && !li.textContent.toLowerCase().includes(q);
	    });
	    dlg.querySelector('#jUGe-newPage').addEventListener('click', () => dlg.close('new'));
	    for (const b of dlg.querySelectorAll('.jUGe-pageList button'))
		b.addEventListener('click', () => dlg.close('page:' + b.dataset.page));
	    setTimeout(() => filter.focus(), 30);
	});

	if (choice === 'new')
	    await this._showNewPage();
	else if (choice && choice.startsWith('page:'))
	{
	    const id = choice.substring(5);
	    if (id !== this.page.id && await this._confirmLeave())
	    {
		await this._openPage(id);
		this._toast(T('pageOpened', this.page.title));
	    }
	}
    }


    /**************************************************************************/
    async _showNewPage ()
    {
	if (!await this._confirmLeave()) return;
	const body = `<div class='jUGe-field'><label for='jUGe-newTitle'>${escapeHtml(T('newPageName'))}</label><input type='text' id='jUGe-newTitle' autocomplete='off'></div>` +
	      `<div class='jUGe-field'><label for='jUGe-newParent'>${escapeHtml(T('pageLocation'))}</label>${this._parentSelect('jUGe-newParent', this.page?.parent || '')}</div>`;
	const choice = await this._dialog(T('newPageTitle'), body, [{ label: T('cancel') }, { label: T('create'), value: 'create', primary: true }],
					  (dlg) => setTimeout(() => dlg.querySelector('#jUGe-newTitle').focus(), 30),
					  (dlg) => ({ title: sanitizeText(dlg.querySelector('#jUGe-newTitle').value), parent: dlg.querySelector('#jUGe-newParent').value }));
	if (choice && choice.value === 'create' && choice.data.title)
	    this._newPage(choice.data.title, choice.data.parent);
    }


    /**************************************************************************/
    _parentSelect (id, current, excludeId = null)
    {
	const options = [`<option value=''>${escapeHtml(T('topLevel'))}</option>`];
	const walk = (nodes, depth) => {
	    for (const n of nodes)
	    {
		if (n.id === excludeId) continue; // A page cannot go inside itself.
		options.push(`<option value='${escapeHtml(n.id)}'${n.id === current ? ' selected' : ''}>${'   '.repeat(depth)}${escapeHtml(n.title)}</option>`);
		if (n.children) walk(n.children, depth + 1);
	    }
	};
	walk(this.nav.nav, 0);
	return `<select id='${id}'>${options.join('')}</select>`;
    }


    /**************************************************************************/
    _renderPagePanel ()
    {
	const me = this;
	const panel = this._$('jUGe-panelPage');
	if (!this.page) return;
	panel.innerHTML =
	    `<div class='jUGe-field'><label>${escapeHtml(T('pageId'))}</label><input type='text' value='${escapeHtml(this.page.id)}.html' readonly>` +
	    `<div class='jUGe-hint'>${escapeHtml(T('pageIdHint'))}</div></div>` +
	    `<div class='jUGe-field'><label for='jUGe-parent'>${escapeHtml(T('pageLocation'))}</label>${this._parentSelect('jUGe-parent', this.page.parent, this.page.id)}</div>` +
	    `<div class='jUGe-btnRow'>` +
	    (this.page.isNew ? '' : `<a class='jUGe-btn' href='${_VIEWER_URL}?page=${encodeURIComponent(this.page.id)}' target='_blank'>${escapeHtml(T('viewInGuide'))}</a>`) +
	    (this.page.id === this.nav.home || this.page.isNew ? '' : `<button type='button' class='jUGe-btn jUGe-danger' id='jUGe-deletePage'>${escapeHtml(T('deletePage'))}</button>`) +
	    `</div>`;

	panel.querySelector('#jUGe-parent').addEventListener('change', (e) => { me.page.parent = e.target.value; me._changed(); });
	panel.querySelector('#jUGe-deletePage')?.addEventListener('click', () => me._deletePage());
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Menu tree                              **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _findNode (id, nodes = this.nav.nav, parent = null)
    {
	for (let i = 0; i < nodes.length; i++)
	{
	    if (nodes[i].id === id) return { node: nodes[i], list: nodes, index: i, parent: parent };
	    if (nodes[i].children)
	    {
		const r = this._findNode(id, nodes[i].children, nodes[i]);
		if (r) return r;
	    }
	}
	return null;
    }


    /**************************************************************************/
    _parentOf (id)
    {
	return this._findNode(id)?.parent?.id || '';
    }


    /**************************************************************************/
    /* Puts the page in the menu under 'parent' (or moves it there), with its
       current title. */

    _placeInMenu (id, title, parent)
    {
	const found = this._findNode(id);
	if (found && (found.parent?.id || '') === parent)
	{
	    found.node.title = title;
	    return;
	}

	const node = { id: id, title: title };
	if (found)                                   // Moving: take it out, keeping its sub-pages.
	{
	    if (found.node.children) node.children = found.node.children;
	    found.list.splice(found.index, 1);
	    if (found.parent && found.parent.children.length === 0) delete found.parent.children;
	}

	if (!parent)
	    this.nav.nav.push(node);
	else
	{
	    const p = this._findNode(parent).node;
	    (p.children = p.children || []).push(node);
	}
    }


    /**************************************************************************/
    _removeFromMenu (id)
    {
	const found = this._findNode(id);
	if (!found) return;
	// Its sub-pages move up to take its place.
	found.list.splice(found.index, 1, ...(found.node.children || []));
	if (found.parent && found.parent.children.length === 0) delete found.parent.children;
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Blocks                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _block (uid) { return this.blocks.find(b => b.uid === uid); }
    _index (uid) { return this.blocks.findIndex(b => b.uid === uid); }


    /**************************************************************************/
    _addBlock (type, index = null, props = {})
    {
	const b = newBlock(type, props);
	if (index === null)
	{
	    const sel = this.selected ? this._index(this.selected) : -1;
	    index = sel >= 0 ? sel + 1 : this.blocks.length;
	}
	this.blocks.splice(index, 0, b);
	this._changed();
	this._renderCanvas();
	this._select(b.uid);

	// Put the cursor straight into blocks you type into.
	const editable = this._blockEl(b.uid)?.querySelector('[contenteditable]');
	if (editable) editable.focus();
	this._blockEl(b.uid)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	return b;
    }


    /**************************************************************************/
    _moveBlock (uid, toIndex)
    {
	const from = this._index(uid);
	if (from < 0) return;
	const [b] = this.blocks.splice(from, 1);
	if (toIndex > from) toIndex--;
	this.blocks.splice(Math.max(0, Math.min(toIndex, this.blocks.length)), 0, b);
	this._changed();
	this._renderCanvas();
	this._select(uid);
    }


    /**************************************************************************/
    _duplicateBlock (uid)
    {
	const i = this._index(uid);
	const copy = Object.assign(JSON.parse(JSON.stringify(this.blocks[i])), { uid: newBlock('divider').uid });
	delete copy.anchors; // Anchor ids must stay unique.
	this.blocks.splice(i + 1, 0, copy);
	this._changed();
	this._renderCanvas();
	this._select(copy.uid);
    }


    /**************************************************************************/
    _deleteBlock (uid)
    {
	const i = this._index(uid);
	if (i < 0) return;
	this.blocks.splice(i, 1);
	this.selected = null;
	this._changed();
	this._renderCanvas();
	this._selectTab('blocks');
    }


    /**************************************************************************/
    _select (uid)
    {
	this.selected = uid;
	for (const el of document.querySelectorAll('.jUGe-block'))
	    el.classList.toggle('jUGe-selected', el.dataset.uid === uid);
	if (uid)
	{
	    this._renderBlockPanel();
	    this._selectTab('block');
	}
	else if (!this._$('jUGe-panelBlock').hidden)
	    this._selectTab('blocks');
    }


    /**************************************************************************/
    _blockEl (uid) { return this._$('jUGe-blocks').querySelector(`.jUGe-block[data-uid="${uid}"]`); }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Canvas                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _renderCanvas ()
    {
	const container = this._$('jUGe-blocks');
	container.innerHTML = '';
	const previewing = document.body.classList.contains('jUGe-previewing');

	if (previewing)
	{
	    container.innerHTML = blocksToHtml(this.blocks);
	    for (const a of container.querySelectorAll('a[href]')) { a.target = '_blank'; a.rel = 'noopener'; }
	    this._fixImages(container);
	    this._$('jUGe-addZone').hidden = true;
	    return;
	}

	for (const b of this.blocks)
	    container.appendChild(this._renderBlock(b));

	this._fixImages(container);
	this._$('jUGe-addZone').hidden = false;
    }


    /**************************************************************************/
    /* Pictures saved to the folder but not yet on the web server: show them
       from the folder. */

    _fixImages (container)
    {
	for (const img of container.querySelectorAll('img'))
	    img.addEventListener('error', async () => {
		const url = await JUserGuideRepo.imageObjectUrl(img.getAttribute('src'));
		if (url) img.src = url;
	    }, { once: true });
    }


    /**************************************************************************/
    _renderBlock (b)
    {
	const me = this;
	const wrap = document.createElement('div');
	wrap.className = 'jUGe-block' + (b.uid === this.selected ? ' jUGe-selected' : '');
	wrap.dataset.uid = b.uid;

	const bar = document.createElement('div');
	bar.className = 'jUGe-blockBar';
	bar.innerHTML =
	    `<span class='jUGe-blockName' draggable='true' title='${escapeHtml(T('drag'))}'>⠇ ${escapeHtml(T('b_' + b.type))}</span>` +
	    `<button type='button' data-act='up' title='${escapeHtml(T('moveUp'))}' aria-label='${escapeHtml(T('moveUp'))}'>↑</button>` +
	    `<button type='button' data-act='down' title='${escapeHtml(T('moveDown'))}' aria-label='${escapeHtml(T('moveDown'))}'>↓</button>` +
	    `<button type='button' data-act='dup' title='${escapeHtml(T('duplicate'))}' aria-label='${escapeHtml(T('duplicate'))}'>⧉</button>` +
	    `<button type='button' data-act='del' title='${escapeHtml(T('delete'))}' aria-label='${escapeHtml(T('delete'))}'>\u{1F5D1}</button>`;
	bar.addEventListener('mousedown', (e) => e.stopPropagation());
	bar.addEventListener('click', (e) => {
	    const act = e.target.closest('button')?.dataset.act;
	    const i = me._index(b.uid);
	    if (act === 'up' && i > 0) me._moveBlock(b.uid, i - 1);
	    if (act === 'down' && i < me.blocks.length - 1) me._moveBlock(b.uid, i + 2);
	    if (act === 'dup') me._duplicateBlock(b.uid);
	    if (act === 'del') me._deleteBlock(b.uid);
	});
	const handle = bar.querySelector('.jUGe-blockName');
	handle.addEventListener('dragstart', (e) => {
	    e.dataTransfer.setData('application/x-jug-move', b.uid);
	    e.dataTransfer.effectAllowed = 'move';
	    e.dataTransfer.setDragImage(wrap, 20, 20);
	    setTimeout(() => wrap.classList.add('jUGe-dragging'), 0);
	});
	wrap.appendChild(bar);

	wrap.appendChild(this._renderBlockBody(b));
	wrap.addEventListener('mousedown', () => { if (me.selected !== b.uid) me._select(b.uid); });
	return wrap;
    }


    /**************************************************************************/
    _editable (tag, b, key, opts = {})
    {
	const me = this;
	const el = document.createElement(tag);
	if (opts.className) el.className = opts.className;
	el.setAttribute('contenteditable', opts.plain ? 'plaintext-only' : 'true');
	el.dataset.placeholder = opts.placeholder || '';
	el.dataset.rich = opts.plain ? 'no' : 'yes';
	el.dataset.uid = b.uid;
	el.dataset.key = key;
	if (opts.plain) el.textContent = b[key]; else el.innerHTML = b[key];
	if (!opts.plain && !el.textContent.trim() && !el.querySelector('img, table')) el.innerHTML = '';

	el.addEventListener('input', () => {
	    b[key] = opts.plain ? el.textContent : el.innerHTML;
	    me._changedTyping();
	});
	if (opts.plain)
	    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); me._addBlock('text', me._index(b.uid) + 1); } });

	el.addEventListener('paste', (e) => {
	    e.preventDefault();
	    const html = e.clipboardData.getData('text/html');
	    const text = e.clipboardData.getData('text/plain');
	    if (opts.plain || !html)
		document.execCommand('insertText', false, text);
	    else
		document.execCommand('insertHTML', false, sanitizeHtml(html).replace(/\sclass="[^"]*"/g, ''));
	});
	return el;
    }


    /**************************************************************************/
    _renderBlockBody (b)
    {
	const me = this;
	const div = (cls, html) => { const d = document.createElement('div'); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };

	switch (b.type)
	{
	case 'heading':
	    return this._editable('h' + b.level, b, 'text', { plain: true, placeholder: T('ph_heading') });

	case 'text':
	    return this._editable('div', b, 'html', { placeholder: T('ph_text'), className: b.align !== 'left' ? (b.align === 'center' ? 'jUG-alignCenter' : 'jUG-alignRight') : '' });

	case 'note':
	    return this._editable('div', b, 'html', { placeholder: T('ph_note'), className: `jUG-note jUG-note-${b.kind}` });

	case 'table':
	    return this._editable('div', b, 'html', {});

	case 'original':
	{
	    const d = div('');
	    d.appendChild(div('jUGe-originalTag', escapeHtml(T('originalTag'))));
	    d.appendChild(this._editable('div', b, 'html', {}));
	    return d;
	}

	case 'image':
	{
	    if (!b.src)
	    {
		const ph = div('jUGe-placeholder', `<span class='jUGe-tileIcon'>\u{1F5BC}</span><span>${escapeHtml(T('ph_image'))}</span>`);
		ph.addEventListener('click', () => me._pickImage(b));
		ph.addEventListener('dragover', (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); ph.classList.add('jUGe-over'); } });
		ph.addEventListener('dragleave', () => ph.classList.remove('jUGe-over'));
		ph.addEventListener('drop', (e) => {
		    const file = e.dataTransfer.files[0];
		    if (!file) return;
		    e.preventDefault(); e.stopPropagation();
		    me._setImageFromFile(b, file);
		});
		return ph;
	    }
	    const d = div('', blockToHtml(b));
	    d.addEventListener('dblclick', () => me._pickImage(b));
	    return d;
	}

	case 'video':
	    return b.url && blockToHtml(b) ? div('', blockToHtml(b)) : div('jUGe-placeholder', `<span class='jUGe-tileIcon'>▶</span><span>${escapeHtml(T('ph_video'))}</span>`);

	case 'button':
	    return blockToHtml(b) ? div('', blockToHtml(b)) : div('jUGe-placeholder', `<span class='jUGe-tileIcon'>➔</span><span>${escapeHtml(T('ph_button'))}</span>`);

	default: // passage, divider
	    return div('', blockToHtml(b) || '&nbsp;');
	}
    }


    /**************************************************************************/
    /* After execCommand etc. the 'input' event may not fire: copy the content
       of the focused editable back into its block. */

    _syncFocusedEditable ()
    {
	const el = document.activeElement;
	if (!el || !el.isContentEditable || !el.dataset.uid) return;
	const b = this._block(el.dataset.uid);
	if (!b) return;
	b[el.dataset.key] = el.dataset.rich === 'yes' ? el.innerHTML : el.textContent;
	this._changedTyping();
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                            Drag and drop                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _dropIndex (clientY)
    {
	const els = Array.from(this._$('jUGe-blocks').querySelectorAll(':scope > .jUGe-block'));
	for (let i = 0; i < els.length; i++)
	{
	    const r = els[i].getBoundingClientRect();
	    if (clientY < r.top + r.height / 2) return i;
	}
	return els.length;
    }


    /**************************************************************************/
    _onDragOver (e)
    {
	const types = e.dataTransfer.types;
	if (!types.includes('application/x-jug-new') && !types.includes('application/x-jug-move') && !types.includes('Files')) return;
	e.preventDefault();
	e.dataTransfer.dropEffect = types.includes('application/x-jug-move') ? 'move' : 'copy';

	const index = this._dropIndex(e.clientY);
	const els = Array.from(this._$('jUGe-blocks').querySelectorAll(':scope > .jUGe-block'));
	let line = document.querySelector('.jUGe-dropLine');
	if (!line) { line = document.createElement('div'); line.className = 'jUGe-dropLine'; }
	if (index < els.length) els[index].before(line); else this._$('jUGe-blocks').appendChild(line);
	this._$('jUGe-addZone').classList.toggle('jUGe-over', index === els.length);
    }


    /**************************************************************************/
    _clearDrop ()
    {
	document.querySelector('.jUGe-dropLine')?.remove();
	this._$('jUGe-addZone').classList.remove('jUGe-over');
	for (const el of document.querySelectorAll('.jUGe-dragging')) el.classList.remove('jUGe-dragging');
    }


    /**************************************************************************/
    async _onDrop (e)
    {
	const index = this._dropIndex(e.clientY);
	const type = e.dataTransfer.getData('application/x-jug-new');
	const moving = e.dataTransfer.getData('application/x-jug-move');
	const file = e.dataTransfer.files && e.dataTransfer.files[0];
	this._clearDrop();
	if (!type && !moving && !file) return;
	e.preventDefault();

	if (type) this._addBlock(type, index);
	else if (moving) this._moveBlock(moving, index);
	else if (file && file.type.startsWith('image/'))
	{
	    const b = this._addBlock('image', index);
	    await this._setImageFromFile(b, file);
	}
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                           Block settings                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _renderBlockPanel ()
    {
	const me = this;
	const b = this._block(this.selected);
	const panel = this._$('jUGe-panelBlock');
	if (!b) return;

	panel.innerHTML =
	    `<button type='button' class='jUGe-panelBack'>← ${escapeHtml(T('back'))}</button>` +
	    `<div class='jUGe-panelTitle'><span class='jUGe-tileIcon'>${BLOCK_TYPES[b.type].icon}</span>${escapeHtml(T('b_' + b.type))}</div>`;
	panel.querySelector('.jUGe-panelBack').addEventListener('click', () => me._select(null));

	for (const f of BLOCK_TYPES[b.type].fields)
	    panel.appendChild(this._renderField(b, f));

	const actions = document.createElement('div');
	actions.className = 'jUGe-btnRow';
	actions.innerHTML = `<button type='button' class='jUGe-btn' data-act='dup'>⧉ ${escapeHtml(T('duplicate'))}</button>` +
	    `<button type='button' class='jUGe-btn jUGe-danger' data-act='del'>\u{1F5D1} ${escapeHtml(T('delete'))}</button>`;
	actions.addEventListener('click', (e) => {
	    const act = e.target.closest('button')?.dataset.act;
	    if (act === 'dup') me._duplicateBlock(b.uid);
	    if (act === 'del') me._deleteBlock(b.uid);
	});
	panel.appendChild(actions);
    }


    /**************************************************************************/
    _renderField (b, f)
    {
	const me = this;
	const field = document.createElement('div');
	field.className = 'jUGe-field';
	const id = 'jUGe-f-' + f.key;
	const label = `<label for='${id}'>${escapeHtml(T('f_' + f.key))}</label>`;
	const hint = f.hint ? `<div class='jUGe-hint'>${escapeHtml(T(f.hint))}</div>` : '';

	const update = (value, typing = false) => {
	    b[f.key] = value;
	    if (typing) me._changedTyping(); else me._changed();
	    const el = me._blockEl(b.uid);
	    if (el)
	    {
		const fresh = me._renderBlock(b);
		el.replaceWith(fresh);
		me._fixImages(fresh);
	    }
	};

	switch (f.type)
	{
	case 'select':
	    // Few options: segmented buttons (easier than a drop-down).
	    field.innerHTML = label.replace(`for='${id}'`, '') + `<div class='jUGe-segmented' role='group'>` +
		f.options.map(([v, k]) => `<button type='button' data-v='${v}' aria-pressed='${String(b[f.key]) === String(v)}'>${escapeHtml(T(k))}</button>`).join('') +
		`</div>` + hint;
	    field.querySelector('.jUGe-segmented').addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const v = typeof f.options[0][0] === 'number' ? Number(btn.dataset.v) : btn.dataset.v;
		for (const x of field.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === btn));
		update(v);
	    });
	    if (f.options.length > 3) field.querySelector('.jUGe-segmented').style.flexWrap = 'wrap';
	    break;

	case 'text':
	    field.innerHTML = label + `<input type='text' id='${id}' value='${escapeHtml(b[f.key])}' autocomplete='off'>` + hint;
	    field.querySelector('input').addEventListener('input', (e) => update(e.target.value, true));
	    break;

	case 'link':
	{
	    const pages = Object.entries(this.nav.pages).map(([pid, p]) => `<option value='#${escapeHtml(pid)}'>${escapeHtml(p.title)}</option>`).join('');
	    field.innerHTML = label + `<input type='text' id='${id}' value='${escapeHtml(b[f.key])}' list='${id}-pages' autocomplete='off'>` +
		`<datalist id='${id}-pages'>${pages}</datalist>` + hint;
	    field.querySelector('input').addEventListener('input', (e) => update(e.target.value, true));
	    break;
	}

	case 'image':
	    field.innerHTML = label.replace(`for='${id}'`, '') +
		(b.src ? `<img class='jUGe-thumb' alt='' src='${escapeHtml(b.src)}'>` : '') +
		`<button type='button' class='jUGe-btn'>${escapeHtml(T(b.src ? 'changeImage' : 'chooseImage'))}</button>`;
	    field.querySelector('button').addEventListener('click', () => me._pickImage(b));
	    this._fixImages(field);
	    break;

	case 'testPassage':
	    field.innerHTML = `<button type='button' class='jUGe-btn'>\u{1F4D6} ${escapeHtml(T('testPassage'))}</button>`;
	    field.querySelector('button').addEventListener('click', () => window.open(passageUrl(b) + '&skipwelcome', '_blank', 'noopener'));
	    break;

	case 'tableTools':
	    field.innerHTML = `<label>${escapeHtml(T('f_tableTools'))}</label><div class='jUGe-btnRow'>` +
		['addRow', 'delRow', 'addCol', 'delCol'].map(a => `<button type='button' class='jUGe-btn' data-a='${a}'>${escapeHtml(T(a))}</button>`).join('') +
		`</div><div class='jUGe-hint'>${escapeHtml(T('tableTip'))}</div>`;
	    field.addEventListener('mousedown', (e) => e.preventDefault()); // Keep the caret in the cell.
	    field.addEventListener('click', (e) => {
		const a = e.target.closest('button')?.dataset.a;
		if (a) me._tableEdit(b, a);
	    });
	    break;
	}
	return field;
    }


    /**************************************************************************/
    _tableEdit (b, action)
    {
	const el = this._blockEl(b.uid)?.querySelector('[contenteditable]');
	const table = el?.querySelector('table');
	if (!table) return;
	const sel = window.getSelection();
	const cell = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement)?.closest('td, th');
	const rows = Array.from(table.rows);
	const row = cell ? cell.parentElement : rows[rows.length - 1];
	const col = cell ? cell.cellIndex : row.cells.length - 1;

	if (action === 'addRow')
	{
	    const r = row.cloneNode(true);
	    for (const c of r.cells) { c.innerHTML = '&nbsp;'; if (c.tagName === 'TH') { const td = document.createElement('td'); td.innerHTML = '&nbsp;'; c.replaceWith(td); } }
	    row.after(r);
	}
	else if (action === 'delRow' && rows.length > 1)
	    row.remove();
	else if (action === 'addCol')
	    for (const r of rows) { const c = document.createElement(r.cells[0]?.tagName === 'TH' ? 'th' : 'td'); c.innerHTML = '&nbsp;'; (r.cells[col] || r.lastElementChild).after(c); }
	else if (action === 'delCol' && rows[0].cells.length > 1)
	    for (const r of rows) r.cells[Math.min(col, r.cells.length - 1)]?.remove();

	b.html = el.innerHTML;
	this._changed();
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Pictures                               **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _pickImage (b)
    {
	this._imageTarget = b;
	this._$('jUGe-file').click();
    }


    /**************************************************************************/
    /* Pictures are kept in the page as data: URLs until Save, which writes
       them as files.  Big pictures are scaled down first. */

    async _setImageFromFile (b, file)
    {
	if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type))
	{
	    this._toast(T('imageError'), true);
	    return;
	}

	let dataUrl = await new Promise((resolve, reject) => {
	    const reader = new FileReader();
	    reader.onload = () => resolve(reader.result);
	    reader.onerror = () => reject(reader.error);
	    reader.readAsDataURL(file);
	});

	try
	{
	    const bitmap = await createImageBitmap(file);
	    const scale = Math.min(1, _MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
	    if (file.type !== 'image/gif' && (scale < 1 || file.size > 900 * 1024))
	    {
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		const ctx = canvas.getContext('2d');
		if (file.type === 'image/jpeg') { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
		ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		const png = file.type === 'image/png' ? canvas.toDataURL('image/png') : null;
		dataUrl = png && png.length < 1.2 * 1024 * 1024 ? png : canvas.toDataURL('image/jpeg', 0.86);
	    }
	}
	catch (e) { /* Keep the original. */ }

	b.src = dataUrl;
	if (!b.alt) b.alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim();
	this._changed();
	this._renderCanvas();
	this._select(b.uid);
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                                Links                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    async _editLink ()
    {
	const sel = window.getSelection();
	if (!sel.rangeCount) return;
	const editable = document.activeElement;
	this._savedRange = sel.getRangeAt(0).cloneRange();
	const existing = (sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest('a');
	const current = existing?.getAttribute('href') || '';

	const pages = Object.entries(this.nav.pages).map(([pid, p]) =>
	    `<option value='#${escapeHtml(pid)}'${current === '#' + pid ? ' selected' : ''}>${escapeHtml(p.title)}</option>`).join('');
	const body = `<div class='jUGe-field'><label for='jUGe-linkUrl'>${escapeHtml(T('linkUrl'))}</label>` +
	      `<input type='text' id='jUGe-linkUrl' value='${escapeHtml(current.startsWith('#') ? '' : current)}' placeholder='https://' autocomplete='off'></div>` +
	      `<div class='jUGe-field'><label for='jUGe-linkPage'>${escapeHtml(T('linkPage'))}</label>` +
	      `<select id='jUGe-linkPage'><option value=''>${escapeHtml(T('linkNone'))}</option>${pages}</select></div>`;

	const buttons = [{ label: T('cancel') }];
	if (existing) buttons.push({ label: T('removeLink'), value: 'remove', danger: true });
	buttons.push({ label: T('apply'), value: 'apply', primary: true });

	const choice = await this._dialog(T('linkTitle'), body, buttons,
					  (dlg) => setTimeout(() => dlg.querySelector('#jUGe-linkUrl').focus(), 30),
					  (dlg) => ({ url: dlg.querySelector('#jUGe-linkUrl').value.trim(), page: dlg.querySelector('#jUGe-linkPage').value }));

	editable.focus();
	sel.removeAllRanges();
	sel.addRange(this._savedRange);
	if (!choice || choice.value === 'cancel') return;

	if (choice.value === 'remove')
	{
	    if (existing) { sel.selectAllChildren(existing); document.execCommand('unlink'); }
	}
	else
	{
	    let href = choice.data.page || choice.data.url;
	    if (!href) return;
	    if (!choice.data.page && !/^(https?:|mailto:|\/|#)/i.test(href)) href = 'https://' + href;
	    if (sel.isCollapsed && !existing)
		document.execCommand('insertHTML', false, `<a href="${escapeHtml(href)}">${escapeHtml(choice.data.page ? this.nav.pages[href.substring(1)].title : href)}</a>`);
	    else if (existing)
		existing.setAttribute('href', href);
	    else
		document.execCommand('createLink', false, href);

	    for (const a of editable.querySelectorAll('a[href]'))
	    {
		if (/^https?:/i.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
		else { a.removeAttribute('target'); a.removeAttribute('rel'); }
	    }
	}
	this._syncFocusedEditable();
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                           Undo / dirty state                         **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _snapshot ()
    {
	return JSON.stringify({ title: this.page.title, parent: this.page.parent, blocks: this.blocks });
    }


    /**************************************************************************/
    _resetHistory ()
    {
	this._past = [];
	this._future = [];
	this._current = this._saved = this._snapshot();
	this._updateUndoButtons();
    }


    /**************************************************************************/
    _changed ()
    {
	clearTimeout(this._typingTimer);
	const snap = this._snapshot();
	if (snap !== this._current)
	{
	    this._past.push(this._current);
	    if (this._past.length > 200) this._past.shift();
	    this._future = [];
	    this._current = snap;
	}
	this._updateUndoButtons();
	this._updateStatus();
    }


    /**************************************************************************/
    /* While typing, record an undo step only when the user pauses. */

    _changedTyping ()
    {
	this._updateStatus(true);
	clearTimeout(this._typingTimer);
	this._typingTimer = setTimeout(() => this._changed(), 700);
    }


    /**************************************************************************/
    _restore (snap)
    {
	const s = JSON.parse(snap);
	this.page.title = s.title;
	this.page.parent = s.parent;
	this.blocks = s.blocks;
	this._current = snap;
	this._$('jUGe-title').value = s.title;
	this._$('jUGe-pageName').textContent = s.title;
	this.selected = null;
	this._renderCanvas();
	this._selectTab('blocks');
	this._updateUndoButtons();
	this._updateStatus();
    }

    _undo () { this._changed(); if (this._past.length) { this._future.push(this._current); this._restore(this._past.pop()); } }
    _redo () { if (this._future.length) { this._past.push(this._current); this._restore(this._future.pop()); } }


    /**************************************************************************/
    _updateUndoButtons ()
    {
	this._$('jUGe-undo').disabled = !this._past.length;
	this._$('jUGe-redo').disabled = !this._future.length;
    }


    /**************************************************************************/
    _isDirty ()
    {
	return !!this.page && (this.page.isNew || this._snapshot() !== this._saved);
    }


    /**************************************************************************/
    _updateStatus (typing = false)
    {
	const status = this._$('jUGe-status');
	const dirty = typing || this._isDirty();
	status.textContent = this.page.isNew ? T('notSavedYet') : dirty ? T('unsaved') : T('saved');
	status.classList.toggle('jUGe-dirty', dirty);
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Saving                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _renderFolder ()
    {
	const me = this;
	const box = this._$('jUGe-folder');
	if (!JUserGuideRepo.supported)
	    box.innerHTML = `<strong>${escapeHtml(T('folderTitle'))}</strong>${escapeHtml(T('folderUnsupported'))}`;
	else if (JUserGuideRepo.canWrite)
	    box.innerHTML = `<strong>${escapeHtml(T('folderTitle'))}</strong><span class='jUGe-folderOk'>${escapeHtml(T('folderOk', JUserGuideRepo.pickedName))}</span>` +
		`<button type='button' class='jUGe-btn'>${escapeHtml(T('folderConnect'))}</button>`;
	else
	    box.innerHTML = `<strong>${escapeHtml(T('folderTitle'))}</strong>${escapeHtml(T('folderNone'))}` +
		`<button type='button' class='jUGe-btn jUGe-primary'>${escapeHtml(JUserGuideRepo.pendingHandle ? T('folderReconnect', JUserGuideRepo.pendingHandle.name) : T('folderConnect'))}</button>`;

	box.querySelector('button')?.addEventListener('click', () => me._connect(!JUserGuideRepo.canWrite && !!JUserGuideRepo.pendingHandle));
    }


    /**************************************************************************/
    /* Must run from a click.  After connecting, the menu is re-read from the
       folder (it is the reference, the web server may be older). */

    async _connect (reconnect = false)
    {
	try
	{
	    const ok = reconnect ? await JUserGuideRepo.reconnect() : await JUserGuideRepo.choose();
	    if (!ok) return false;
	}
	catch (e)
	{
	    if (e.name !== 'AbortError') this._toast(e.message === 'notFound' ? T('folderNotFound') : e.message, true);
	    return false;
	}

	this._renderFolder();
	const fresh = await JUserGuideRepo.readNav();
	if (!this._isDirty() && !this.page.isNew && fresh.pages[this.page.id])
	{
	    this.nav = fresh;
	    await this._openPage(this.page.id);
	}
	else
	    this.nav = fresh;
	return true;
    }


    /**************************************************************************/
    /* Returns true when saved. */

    async save ()
    {
	this._changed();
	if (!this.page) return false;

	if (!JUserGuideRepo.canWrite)
	{
	    if (!JUserGuideRepo.supported)
	    {
		this._toast(T('folderUnsupported'), true);
		return false;
	    }
	    const choice = await this._dialog(T('connectTitle'), `<p>${escapeHtml(T('connectText'))}</p>`,
					      [{ label: T('cancel') }, { label: T('connectButton'), value: 'go', primary: true }]);
	    if (choice !== 'go' || !await this._connect(!!JUserGuideRepo.pendingHandle)) return false;
	}

	if (!this.page.title.trim())
	{
	    this._$('jUGe-title').focus();
	    return false;
	}

	try
	{
	    // 1. Pictures added in this session become files.
	    for (const b of this.blocks)
		if (b.type === 'image' && b.src && b.src.startsWith('data:'))
		    b.src = await JUserGuideRepo.writeImage(b.src);

	    // 2. The page.
	    await JUserGuideRepo.writePage(this.page.id, blocksToHtml(this.blocks));

	    // 3. The menu (re-read first, in case another tab changed it).
	    this.nav = await JUserGuideRepo.readNav();
	    const meta = this.nav.pages[this.page.id] || {};
	    this.nav.pages[this.page.id] = { title: this.page.title, updated: new Date().toISOString().substring(0, 10), source: meta.source || null };
	    this._placeInMenu(this.page.id, this.page.title, this.page.parent);
	    await JUserGuideRepo.writeNav(this.nav);
	}
	catch (e)
	{
	    this._toast(T('saveError', e.message), true);
	    return false;
	}

	this.page.isNew = false;
	this._current = this._saved = this._snapshot();
	this._renderCanvas();
	this._updateStatus();
	this._toast(T('savedToast'));
	return true;
    }


    /**************************************************************************/
    async _deletePage ()
    {
	const choice = await this._dialog(T('deleteTitle'), `<p>${escapeHtml(T('deleteText', this.page.title))}</p>`,
					  [{ label: T('cancel') }, { label: T('delete'), value: 'delete', danger: true }]);
	if (choice !== 'delete') return;
	if (!JUserGuideRepo.canWrite && !await this._connect(!!JUserGuideRepo.pendingHandle)) return;

	try
	{
	    this.nav = await JUserGuideRepo.readNav();
	    this._removeFromMenu(this.page.id);
	    delete this.nav.pages[this.page.id];
	    await JUserGuideRepo.writeNav(this.nav);
	    await JUserGuideRepo.deletePage(this.page.id);
	}
	catch (e)
	{
	    this._toast(T('saveError', e.message), true);
	    return;
	}
	this._saved = this._snapshot(); // Nothing left to save.
	await this._openPage(this.nav.home);
	this._toast(T('deletedToast'));
    }


    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                           Dialog and toast                           **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Shows the modal dialog.  buttons: [{ label, value, primary, danger }].
       Resolves to the value of the button pressed (null if closed), or to
       { value, data } when collect(dialog) is given. */

    _dialog (title, bodyHtml, buttons, onOpen = null, collect = null)
    {
	const dlg = this._$('jUGe-dialog');
	this._$('jUGe-dialogTitle').textContent = title;
	this._$('jUGe-dialogBody').innerHTML = bodyHtml;
	const bar = this._$('jUGe-dialogButtons');
	bar.innerHTML = '';
	let defaultValue = null;
	for (const b of buttons)
	{
	    const btn = document.createElement('button');
	    btn.type = 'submit';
	    btn.value = b.value || '';
	    btn.className = 'jUGe-btn' + (b.primary ? ' jUGe-primary' : '') + (b.danger ? ' jUGe-danger' : '');
	    btn.textContent = b.label;
	    bar.appendChild(btn);
	    if (b.primary) defaultValue = b.value || '';
	}

	// Enter in a text box = the primary button.
	this._$('jUGe-dialogBody').onkeydown = (e) => {
	    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && defaultValue !== null) { e.preventDefault(); dlg.close(defaultValue); }
	};

	return new Promise(resolve => {
	    dlg.onclose = () => {
		const value = dlg.returnValue || null;
		resolve(collect ? { value: value, data: collect(dlg) } : value);
	    };
	    dlg.returnValue = '';
	    dlg.showModal();
	    if (onOpen) onOpen(dlg);
	});
    }


    /**************************************************************************/
    _toast (message, isError = false)
    {
	const t = this._$('jUGe-toast');
	t.textContent = message;
	t.classList.toggle('jUGe-error', isError);
	t.classList.add('jUGe-show');
	clearTimeout(this._toastTimer);
	this._toastTimer = setTimeout(() => t.classList.remove('jUGe-show'), isError ? 7000 : 4000);
    }
}




/******************************************************************************/
export const JUserGuideEditor = new _ClassJUserGuideEditor();
