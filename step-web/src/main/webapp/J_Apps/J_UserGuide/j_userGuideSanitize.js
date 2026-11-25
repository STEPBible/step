/******************************************************************************/
/* STEPBible User Guide -- HTML sanitiser.

   Pages written in the editor (or imported from a file someone sent) are
   displayed as HTML, so everything goes through here first: only a small set
   of tags, attributes and jUG-* classes survives; scripts, event handlers,
   styles and javascript: URLs are removed; iframes are allowed only for
   video / document hosts; images may be data: URLs (pictures uploaded in the
   editor are stored inside the page so that everything works offline).
*/

/******************************************************************************/
'use strict';

const _TAGS = new Set([
    'a', 'b', 'blockquote', 'br', 'caption', 'div', 'em', 'figcaption', 'figure', 'h2', 'h3', 'h4', 'hr',
    'i', 'iframe', 'img', 'li', 'ol', 'p', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th',
    'thead', 'tr', 'u', 'ul', 'mark', 's'
]);

const _DROP_WITH_CONTENT = new Set(['script', 'style', 'noscript', 'template', 'object', 'embed', 'svg', 'math',
                                    'form', 'input', 'button', 'select', 'textarea', 'link', 'meta', 'base', 'frame', 'frameset']);

const _ATTRS = {
    '*': ['class', 'id', 'title'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'loading'],
    'iframe': ['src', 'allowfullscreen', 'loading', 'allow'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    'ol': ['start']
};

const _IFRAME_HOSTS = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|docs\.google\.com)\//i;


/******************************************************************************/
function _safeUrl (value, tag, attr)
{
    const v = value.trim();
    if (tag === 'iframe')
	return _IFRAME_HOSTS.test(v) ? v : null;
    if (tag === 'img' && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(v))
	return v;
    if (/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(v))
	return v;
    if (/^[a-z0-9._~%!$&'()*+,;=:@\/?-]+$/i.test(v) && !/^[a-z][a-z0-9+.-]*:/i.test(v)) // relative URL without a scheme
	return v;
    return null;
}


/******************************************************************************/
function _clean (node)
{
    for (const child of Array.from(node.childNodes))
    {
	if (child.nodeType === Node.COMMENT_NODE)
	{
	    child.remove();
	    continue;
	}
	if (child.nodeType !== Node.ELEMENT_NODE)
	    continue;

	const tag = child.tagName.toLowerCase();

	if (_DROP_WITH_CONTENT.has(tag))
	{
	    child.remove();
	    continue;
	}

	_clean(child);

	if (!_TAGS.has(tag))
	{
	    child.replaceWith(...Array.from(child.childNodes)); // unwrap unknown tags, keep their text
	    continue;
	}

	const allowed = new Set([..._ATTRS['*'], ...(_ATTRS[tag] || [])]);
	for (const attr of Array.from(child.attributes))
	{
	    const name = attr.name.toLowerCase();
	    if (!allowed.has(name))
	    {
		child.removeAttribute(attr.name);
		continue;
	    }
	    if (name === 'href' || name === 'src')
	    {
		const safe = _safeUrl(attr.value, tag, name);
		if (safe === null) child.removeAttribute(attr.name); else child.setAttribute(attr.name, safe);
	    }
	    else if (name === 'class')
	    {
		const classes = attr.value.split(/\s+/).filter(c => /^jUG-[A-Za-z0-9-]+$/.test(c));
		if (classes.length) child.setAttribute('class', classes.join(' ')); else child.removeAttribute('class');
	    }
	    else if (name === 'target')
	    {
		child.setAttribute('target', '_blank');
		child.setAttribute('rel', 'noopener');
	    }
	}

	if (tag === 'iframe' && !child.getAttribute('src'))
	    child.remove();
	if (tag === 'img' && !child.getAttribute('src'))
	    child.remove();
    }
}


/******************************************************************************/
export function sanitizeHtml (html)
{
    const doc = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html');
    _clean(doc.body);
    return doc.body.innerHTML;
}


/******************************************************************************/
/* Plain text, for titles etc. */

export function sanitizeText (text, maxLength = 200)
{
    return String(text || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, maxLength);
}


/******************************************************************************/
export function sanitizeId (id)
{
    return String(id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 80);
}
