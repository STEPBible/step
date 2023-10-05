package com.tyndalehouse.step.models.timeline.simile;

import java.io.Serializable;

/**
 * Created by Chris on 09/03/2015.
 */
public class LegendItem implements Serializable {
    private String title;
    private String icon;

    public void setIcon(final String icon) {
        this.icon = icon;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(final String title) {
        this.title = title;
    }
}
