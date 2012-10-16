package com.tyndalehouse.step.tools.analysis;

import org.crosswire.jsword.book.OSISUtil;
import org.jdom.Attribute;
import org.jdom.Element;
import org.jdom.filter.Filter;

public class StrongElements implements Filter {
    private static final long serialVersionUID = 1L;

    @Override
    public boolean matches(final Object arg) {
        if (arg instanceof Element) {
            final Element element = (Element) arg;
            final Attribute attribute = element.getAttribute(OSISUtil.ATTRIBUTE_W_LEMMA);
            return attribute != null;
        }
        return false;
    }
}