package com.tyndalehouse.step.models;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;
import com.tyndalehouse.step.models.timeline.simile.SimileEvent;
import org.joda.time.LocalDateTime;

/**
 * A translator is able to convert timeline data into a form that is acceptable by the client
 * 
 */
public interface TimelineTranslator {

    /**
     * translates a list of events to a digestable form of a timeline
     * 
     * @param sourceElement the source element
     * @param suggestedDate a date for the timeline
     * @return the wrapped up form of the timeline
     */
    DigestableTimeline toDigestableForm(final EntityDoc[] sourceElement, LocalDateTime suggestedDate);

    /**
     * Translates a single event into a simile event
     * 
     * @param te the timeline
     * @return the simile event to be sent through
     */
    SimileEvent translateEvent(EntityDoc te);

}
