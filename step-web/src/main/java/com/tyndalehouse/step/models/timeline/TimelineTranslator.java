package com.tyndalehouse.step.models.timeline;

import java.util.List;

import com.tyndalehouse.step.core.data.entities.TimelineEvent;

/**
 * A translator is able to convert timeline data into a form that is acceptable by the client
 * 
 * @author Chris
 * 
 */
public interface TimelineTranslator {

    /**
     * translates a list of events to a digestable form of a timeline
     * 
     * @param events a list of events
     * @return the wrapped up form of the timeline
     */
    DigestableTimeline toDigestableTimeline(final List<TimelineEvent> events);

}
