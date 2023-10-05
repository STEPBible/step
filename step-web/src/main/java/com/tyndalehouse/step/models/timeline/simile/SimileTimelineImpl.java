package com.tyndalehouse.step.models.timeline.simile;

import com.google.inject.Singleton;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;

import java.util.List;

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
 *             hotspot: '2'
 *             },
 *     ]
 *     }
 * </pre>
 */
@Singleton
public class SimileTimelineImpl implements DigestableTimeline {
    private String dateTimeFormat;
    private List<SimileEvent> events;
    private String suggestedDate;
    public  String id = "bible-history";
    public  String title = "A History of the Bible";
    public  String description = "Some description <b> with HTML</b> can go here!";
    public String focus_date = "0030-01-01T00:00:45.000";
    public int initial_lane_height = 10;
    private List<LegendItem> legend;

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

    /**
     * @return the suggestedDate
     */
    public String getSuggestedDate() {
        return this.suggestedDate;
    }

    /**
     * @param suggestedDate the suggestedDate to set
     */
    public void setSuggestedDate(final String suggestedDate) {
        this.suggestedDate = suggestedDate;
    }

    public void setLegend(List<LegendItem> legendItems) {
        this.legend = legendItems;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getFocus_date() {
        return focus_date;
    }

    public int getInitial_lane_height() {
        return initial_lane_height;
    }

    public List<LegendItem> getLegend() {
        return legend;
    }
}
