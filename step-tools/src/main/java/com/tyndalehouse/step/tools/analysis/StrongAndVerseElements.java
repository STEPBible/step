//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

import org.jdom.Element;

public final class StrongAndVerseElements extends StrongElements {
    private static final long serialVersionUID = 1L;

    @Override
    public boolean matches(final Object arg) {
        // if (super.matches(arg)) {
        // return true;
        // }

        if (arg instanceof Element) {
            final Element element = (Element) arg;
            return "verse".equals(element.getName());
        }
        return false;
    }
}
