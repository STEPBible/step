package com.tyndalehouse.step.models.timeline.simile;

import java.io.Serializable;
import java.util.List;

import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * An content-rich version of {@link SimileEvent}
 * 
 * @author chrisburrell
 * 
 */
public class EnhancedSimileEvent implements Serializable {
    private static final long serialVersionUID = -3803861355000880742L;
    private SimileEvent event;
    private List<OsisWrapper> verses;

    /**
     * @return the event
     */
    public SimileEvent getEvent() {
        return this.event;
    }

    /**
     * @param event the event to set
     */
    public void setEvent(final SimileEvent event) {
        this.event = event;
    }

    /**
     * @return the verses
     */
    public List<OsisWrapper> getVerses() {
        return this.verses;
    }

    /**
     * @param verses the verses to set
     */
    public void setVerses(final List<OsisWrapper> verses) {
        this.verses = verses;
    }
}
