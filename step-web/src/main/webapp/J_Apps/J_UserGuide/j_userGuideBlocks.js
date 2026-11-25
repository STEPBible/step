/******************************************************************************/
/* STEPBible User Guide -- page blocks.

   The editor (j_userGuideEditor.js) shows a page as a list of blocks.  A page
   is stored as plain HTML (pages/<id>.html), so this module converts both
   ways:

     blocksToHtml(blocks)  -> the HTML written to the page file
     htmlToBlocks(html)    -> blocks, for pages written by the editor or
                              imported from the blog

   The HTML only uses the jUG-* classes from j_userGuide.css, so the viewer
   needs nothing special to display it.
*/

/******************************************************************************/
'use strict';
import { sanitizeHtml } from './j_userGuideSanitize.js';


/******************************************************************************/
/* Block types.  'fields' drive the settings panel of the editor. */

export const BLOCK_TYPES = {
    heading: {
	icon: 'H',
	create: () => ({ level: 2, text: '' }),
	fields: [{ key: 'level', type: 'select', options: [[2, 'headingLarge'], [3, 'headingMedium'], [4, 'headingSmall']] }]
    },
    text: {
	icon: '¶',
	create: () => ({ html: '', align: 'left' }),
	fields: [{ key: 'align', type: 'select', options: [['left', 'alignLeft'], ['center', 'alignCenter'], ['right', 'alignRight']] }]
    },
    image: {
	icon: '\u{1F5BC}',
	create: () => ({ src: '', alt: '', caption: '', size: 'medium', align: 'center' }),
	fields: [
	    { key: 'src', type: 'image' },
	    { key: 'alt', type: 'text', hint: 'altHint' },
	    { key: 'caption', type: 'text' },
	    { key: 'size', type: 'select', options: [['small', 'sizeSmall'], ['medium', 'sizeMedium'], ['full', 'sizeFull'], ['auto', 'sizeAuto']] },
	    { key: 'align', type: 'select', options: [['center', 'alignCenter'], ['left', 'imageLeft'], ['right', 'imageRight']] }
	]
    },
    passage: {
	icon: '\u{1F4D6}',
	create: () => ({ ref: 'John 3:16', version: 'ESV', label: '', style: 'button' }),
	fields: [
	    { key: 'ref', type: 'text', hint: 'refHint' },
	    { key: 'version', type: 'text', hint: 'versionHint' },
	    { key: 'label', type: 'text', hint: 'labelHint' },
	    { key: 'style', type: 'select', options: [['button', 'styleButton'], ['link', 'styleLink']] },
	    { key: 'test', type: 'testPassage' }
	]
    },
    note: {
	icon: '\u{1F4A1}',
	create: () => ({ kind: 'tip', html: '' }),
	fields: [{ key: 'kind', type: 'select', options: [['tip', 'noteTip'], ['info', 'noteInfo'], ['warning', 'noteWarning']] }]
    },
    video: {
	icon: '▶',
	create: () => ({ url: '' }),
	fields: [{ key: 'url', type: 'text', hint: 'videoHint' }]
    },
    button: {
	icon: '➔',
	create: () => ({ label: '', href: '' }),
	fields: [
	    { key: 'label', type: 'text' },
	    { key: 'href', type: 'link', hint: 'hrefHint' }
	]
    },
    table: {
	icon: '▦',
	create: () => ({ html: '<table class="jUG-dataTable"><tbody><tr><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>' }),
	fields: [{ key: 'tableTools', type: 'tableTools' }]
    },
    divider: {
	icon: '―',
	create: () => ({}),
	fields: []
    },
    original: {
	icon: '‹›',
	create: () => ({ html: '' }),
	fields: [],
	hidden: true // Not in the palette: produced when importing complex content.
    }
};


/******************************************************************************/
let _nextId = 1;

export function newBlock (type, props = {})
{
    return Object.assign({ uid: 'b' + (_nextId++), type: type }, BLOCK_TYPES[type].create(), props);
}


/******************************************************************************/
/* Helpers. */

export function escapeHtml (s)
{
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 'John 3:16' -> 'John.3.16';  'Gen 1' -> 'Gen.1';  'Rom 8:28-39' -> 'Rom.8.28-Rom.8.39'?  STEP accepts 'Rom.8.28-39'. */
export function normaliseReference (ref)
{
    return String(ref || '').trim()
	.replace(/^(\d)\s+/, '$1')        // '1 John' -> '1John'
	.replace(/\s*:\s*/g, '.')         // chapter:verse
	.replace(/\s+(?=\d)/g, '.')       // book chapter
	.replace(/\s+/g, '');
}

export function passageUrl (block)
{
    let q = 'reference=' + normaliseReference(block.ref);
    if (block.version && block.version.trim())
	q += '|version=' + block.version.trim().toUpperCase();
    return '/?q=' + q;
}

/* Accepts youtube.com/watch?v=, youtu.be/, youtube.com/embed/, vimeo.com/123 */
export function videoEmbedUrl (url)
{
    const u = String(url || '').trim();
    let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return '';
}

function _alignClass (align)
{
    return align === 'center' ? 'jUG-alignCenter' : align === 'right' ? 'jUG-alignRight' : align === 'left' ? 'jUG-alignLeft' : '';
}

function _isEmptyHtml (html)
{
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return !d.textContent.trim() && !d.querySelector('img, iframe, table, hr');
}


/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                             Blocks -> HTML                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/* Any block may carry 'anchors': ids that in-page links (#page:anchor) jump
   to.  They are written as empty <a id="..."></a> just before the block, the
   same way the blog did, so the page reads back identically. */

export function blockToHtml (b)
{
    const anchors = (b.anchors || []).map(id => `<a id="${escapeHtml(id)}"></a>`).join('');
    const html = _blockToHtml(b);
    return anchors && html ? anchors + html : anchors || html;
}

function _blockToHtml (b)
{
    switch (b.type)
    {
    case 'heading':
	return b.text.trim() ? `<h${b.level}>${escapeHtml(b.text.trim())}</h${b.level}>` : '';

    case 'text':
    {
	if (_isEmptyHtml(b.html)) return '';
	const cls = b.align && b.align !== 'left' ? ` class="${_alignClass(b.align)}"` : '';
	return `<div${cls}>${sanitizeHtml(b.html).trim()}</div>`;
    }

    case 'image':
    {
	if (!b.src) return '';
	const cls = ['jUG-figure', _alignClass(b.align || 'center'), b.size && b.size !== 'auto' ? 'jUG-size' + b.size[0].toUpperCase() + b.size.slice(1) : ''].filter(Boolean).join(' ');
	const img = `<img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.alt)}" loading="lazy"/>`;
	const linked = b.src.startsWith('data:') ? img : `<a class="jUG-imageLink" href="${escapeHtml(b.src)}" target="_blank">${img}</a>`;
	const caption = b.caption && b.caption.trim() ? `<figcaption>${escapeHtml(b.caption.trim())}</figcaption>` : '';
	return `<figure class="${cls}">${linked}${caption}</figure>`;
    }

    case 'passage':
    {
	if (!b.ref.trim()) return '';
	const label = b.label && b.label.trim() ? b.label.trim() : b.ref.trim() + (b.version ? ' (' + b.version.trim().toUpperCase() + ')' : '');
	const cls = b.style === 'link' ? 'jUG-stepLink' : 'jUG-stepLink jUG-button';
	return `<p class="jUG-buttonRow"><a class="${cls}" href="${escapeHtml(passageUrl(b))}">${escapeHtml(label)}</a></p>`;
    }

    case 'note':
	return _isEmptyHtml(b.html) ? '' : `<div class="jUG-note jUG-note-${b.kind}">${sanitizeHtml(b.html).trim()}</div>`;

    case 'video':
    {
	const src = videoEmbedUrl(b.url);
	return src ? `<div class="jUG-video"><iframe src="${src}" title="Video" loading="lazy" allowfullscreen=""></iframe></div>` : '';
    }

    case 'button':
    {
	if (!b.label.trim() || !b.href.trim()) return '';
	const external = /^https?:/i.test(b.href.trim());
	return `<p class="jUG-buttonRow"><a class="jUG-button" href="${escapeHtml(b.href.trim())}"${external ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(b.label.trim())}</a></p>`;
    }

    case 'table':
    case 'original':
	return _isEmptyHtml(b.html) ? '' : sanitizeHtml(b.html).trim();

    case 'divider':
	return '<hr/>';
    }
    return '';
}


/******************************************************************************/
export function blocksToHtml (blocks)
{
    return blocks.map(blockToHtml).filter(Boolean).join('\n\n') + '\n';
}




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                             HTML -> Blocks                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/


const _INLINE = new Set(['A', 'B', 'I', 'U', 'EM', 'STRONG', 'SPAN', 'SUP', 'SUB', 'BR', 'MARK', 'S', 'IMG']);
const _TEXTLIKE = new Set(['P', 'UL', 'OL', 'BLOCKQUOTE']);
const _STRUCTURAL = 'h2, h3, h4, h5, h6, table, figure, hr, iframe, div, .jUG-video, .jUG-embed, .jUG-note, .jUG-buttonRow, .jUG-imageLink';


/******************************************************************************/
function _imageBlockFrom (el)
{
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!img) return null;
    const holder = el.closest('.jUG-floatRight, .jUG-floatLeft') || el.querySelector('.jUG-floatRight, .jUG-floatLeft') || el;
    const align = holder.classList.contains('jUG-floatRight') ? 'right' : holder.classList.contains('jUG-floatLeft') ? 'left' : 'center';
    return newBlock('image', { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: '', size: 'auto', align: align });
}


/******************************************************************************/
/* True if el is just an image (possibly wrapped in a link / centring div). */

function _isLoneImage (el)
{
    if (el.nodeType !== 1) return false;
    if (el.tagName === 'IMG') return true;
    return el.querySelectorAll('img').length === 1 && !el.textContent.trim() && !el.querySelector('iframe, table, a[id], a[name], [id]:not(a)');
}


/******************************************************************************/
/* Empty <a id="..."> / <a name="..."> elements are targets of in-page links.
   They are collected and attached to the next block, so they survive. */

function _anchorIds (el)
{
    const ids = [];
    if (el.nodeType !== 1) return ids;
    for (const a of [el, ...el.querySelectorAll('[id], a[name]')])
    {
	const id = a.getAttribute('id') || (a.tagName === 'A' ? a.getAttribute('name') : null);
	if (id) ids.push(id);
    }
    return ids;
}


/******************************************************************************/
function _convert (container, state)
{
    let run = []; // Inline nodes waiting to become a text block.

    function push (b)
    {
	if (state.anchors.length)
	{
	    b.anchors = state.anchors.concat(b.anchors || []);
	    state.anchors = [];
	}
	state.out.push(b);
    }

    function flush ()
    {
	const html = run.map(n => n.nodeType === 3 ? escapeHtml(n.textContent) : n.outerHTML).join('').trim()
	      .replace(/^(\s*<br\s*\/?>\s*)+|(\s*<br\s*\/?>\s*)+$/g, '');
	const nodes = run;
	run = [];
	if (_isEmptyHtml(html))
	{
	    for (const n of nodes) state.anchors.push(..._anchorIds(n)); // Keep anchors for the next block.
	    return;
	}
	push(newBlock('text', { html: html }));
    }

    for (const node of Array.from(container.childNodes))
    {
	if (node.nodeType === 3) { run.push(node); continue; }
	if (node.nodeType !== 1) continue;

	const tag = node.tagName;
	const cls = node.classList;

	if (/^H[2-6]$/.test(tag))
	{
	    flush();
	    if (node.querySelector('a[href]:not(.jUG-imageLink)')) // Heading with a link: keep it as it is.
	    {
		push(newBlock('original', { html: node.outerHTML }));
		continue;
	    }
	    state.anchors.push(..._anchorIds(node));
	    const text = node.textContent.replace(/\s+/g, ' ').trim();
	    if (text)
		push(newBlock('heading', { level: Math.min(4, Number(tag[1])), text: text }));
	    for (const img of node.querySelectorAll('img'))     // Heading used to hold a picture.
		push(_imageBlockFrom(img.closest('.jUG-imageLink') || img));
	    continue;
	}
	if (tag === 'HR') { flush(); push(newBlock('divider')); continue; }

	if (tag === 'FIGURE' && cls.contains('jUG-figure'))
	{
	    flush();
	    const img = node.querySelector('img');
	    if (img)
	    {
		const size = ['Small', 'Medium', 'Full'].find(s => cls.contains('jUG-size' + s));
		push(newBlock('image', {
		    src: img.getAttribute('src'), alt: img.getAttribute('alt') || '',
		    caption: node.querySelector('figcaption')?.textContent.trim() || '',
		    size: size ? size.toLowerCase() : 'auto',
		    align: cls.contains('jUG-alignLeft') ? 'left' : cls.contains('jUG-alignRight') ? 'right' : 'center'
		}));
	    }
	    continue;
	}

	if (cls.contains('jUG-video'))
	{
	    flush();
	    const src = node.querySelector('iframe')?.getAttribute('src') || '';
	    const m = src.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/);
	    push(newBlock('video', { url: m ? 'https://www.youtube.com/watch?v=' + m[1] : src }));
	    continue;
	}

	if (cls.contains('jUG-note'))
	{
	    flush();
	    const kind = ['tip', 'info', 'warning'].find(k => cls.contains('jUG-note-' + k)) || 'info';
	    push(newBlock('note', { kind: kind, html: node.innerHTML.trim() }));
	    continue;
	}

	if (cls.contains('jUG-buttonRow') && node.querySelectorAll('a').length === 1)
	{
	    flush();
	    const a = node.querySelector('a');
	    const href = a.getAttribute('href') || '';
	    const m = href.match(/^\/\?q=reference=([^|&]+)(?:\|version=([^|&]+))?$/);
	    if (a.classList.contains('jUG-stepLink') && m)
	    {
		const ref = decodeURIComponent(m[1]).replace(/^(\d?[A-Za-z]+)\.(\d+)\.(\d+)/, '$1 $2:$3').replace(/^(\d?[A-Za-z]+)\.(\d+)$/, '$1 $2');
		const version = m[2] ? decodeURIComponent(m[2]) : '';
		const auto = ref + (version ? ' (' + version + ')' : '');
		const label = a.textContent.trim();
		// Only if rebuilding gives back exactly the same link; otherwise keep it as it is.
		const b = newBlock('passage', { ref: ref, version: version, label: label === auto ? '' : label,
						style: a.classList.contains('jUG-button') ? 'button' : 'link' });
		push(passageUrl(b) === href ? b : newBlock('original', { html: node.outerHTML }));
	    }
	    else
		push(newBlock('button', { label: a.textContent.trim(), href: href }));
	    continue;
	}

	if (tag === 'TABLE')
	{
	    flush();
	    const rows = Array.from(node.rows);
	    const singleColumn = rows.every(r => r.cells.length <= 1) && !node.querySelector(':scope > tbody > tr > th, :scope > tr > th');
	    if (cls.contains('jUG-layoutTable') && singleColumn) // Blog layout tables: use their content.
	    {
		for (const cell of node.querySelectorAll(':scope > tbody > tr > td, :scope > tr > td'))
		{
		    _convert(cell, state);
		    flush();
		}
	    }
	    else
		push(newBlock('table', { html: node.outerHTML }));
	    continue;
	}

	if (cls.contains('jUG-embed') || tag === 'IFRAME')
	{
	    flush();
	    push(newBlock('original', { html: node.outerHTML }));
	    continue;
	}

	if (_isLoneImage(node) && (tag !== 'IMG' || !run.some(n => n.nodeType === 1 || n.textContent.trim())))
	{
	    flush();
	    const b = _imageBlockFrom(node);
	    if (b) push(b);
	    continue;
	}

	if (_INLINE.has(tag) && !node.querySelector(_STRUCTURAL)) { run.push(node); continue; }

	if (_TEXTLIKE.has(tag) && !node.querySelector(_STRUCTURAL))
	{
	    flush();
	    run.push(node);
	    flush();
	    continue;
	}

	if (tag === 'DIV' && !node.querySelector(_STRUCTURAL))
	{
	    // A paragraph-like div becomes a text block of its own.
	    flush();
	    const align = cls.contains('jUG-center') || cls.contains('jUG-alignCenter') ? 'center' : cls.contains('jUG-alignRight') ? 'right' : 'left';
	    run.push(...Array.from(node.childNodes));
	    const before = state.out.length;
	    flush();
	    if (align !== 'left' && state.out.length > before) state.out[state.out.length - 1].align = align;
	    continue;
	}

	// A link left open on the blog that swallowed the content after it:
	// keep the link on its own text, then carry on with the content.
	if (tag === 'A' && node.getAttribute('href'))
	{
	    const lead = node.cloneNode(false);
	    while (node.firstChild && !(node.firstChild.nodeType === 1 && (node.firstChild.matches(_STRUCTURAL) || node.firstChild.querySelector(_STRUCTURAL))))
		lead.appendChild(node.firstChild);
	    if (lead.textContent.trim()) run.push(lead);
	    flush();
	    _convert(node, state);
	    continue;
	}

	// Anything else containing structure: look inside it.
	flush();
	state.anchors.push(...(node.id ? [node.id] : []));
	_convert(node, state);
    }
    flush();
}


/******************************************************************************/
export function htmlToBlocks (html)
{
    const container = document.createElement('div');
    container.innerHTML = html || '';
    const state = { out: [], anchors: [] };
    _convert(container, state);
    if (state.anchors.length)                                  // Anchors at the very end of the page.
	state.out.push(newBlock('original', { html: '', anchors: state.anchors }));
    return state.out;
}
