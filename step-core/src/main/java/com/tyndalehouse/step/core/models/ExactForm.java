package com.tyndalehouse.step.core.models;

import java.io.Serializable;

/**
 * Contains information about a bible version to be displayed on the screen in the UI
 * 
 * @author CJBurrell
 * 
 */
public class ExactForm implements Serializable {
    private static final long serialVersionUID = 6598606392490334637L;
    private String text;
    private boolean greek;

    public boolean isGreek() {
        return greek;
    }

    public void setGreek(final boolean greek) {
        this.greek = greek;
    }

    public String getText() {
        return text;
    }

    public void setText(final String text) {
        this.text = text;
    }
}
