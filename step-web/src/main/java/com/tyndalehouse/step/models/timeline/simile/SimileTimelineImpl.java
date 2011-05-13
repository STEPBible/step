package com.tyndalehouse.step.models.timeline.simile;

import java.util.List;

import com.google.inject.Singleton;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;

/**
 * This is a wrapper around the input expected by the simile timeline
 * 
 * <pre>
 *     'dateTimeFormat': 'iso8601',
 *     'wikiURL': "http://simile.mit.edu/shelf/",
 *     'wikiSection': "Simile Cubism Timeline",
 * 
 *     'events' : [
 *             {'start': '-1262',
 *             'title': 'Barfusserkirche',
 *             'description': 'by Lyonel Feininger, American/German Painter, 1871-1956',
 *             'image': 'http://images.allposters.com/images/AWI/NR096_b.jpg',
 *             'link': 'http://www.allposters.com/-sp/Barfusserkirche-1924-Posters_i1116895_.htm'
 *             },
 *     ]
 *     }
 * </pre>
 * 
 * @author Chris
 * 
 */
@Singleton
public class SimileTimelineImpl implements DigestableTimeline {
    private String dateTimeFormat;
    private List<SimileEvent> events;

    /**
     * @return the dateTimeFormat
     */
    public String getDateTimeFormat() {
        return this.dateTimeFormat;
    }

    /**
     * @param dateTimeFormat the dateTimeFormat to set
     */
    public void setDateTimeFormat(final String dateTimeFormat) {
        this.dateTimeFormat = dateTimeFormat;
    }

    /**
     * @return the events
     */
    public List<SimileEvent> getEvents() {
        return this.events;
    }

    /**
     * @param events the events to set
     */
    public void setEvents(final List<SimileEvent> events) {
        this.events = events;
    }
}
