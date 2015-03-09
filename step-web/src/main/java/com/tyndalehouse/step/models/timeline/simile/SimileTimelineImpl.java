/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
 *             hotspot: '2'
 *             },
 *     ]
 *     }
 * </pre>
 * 
 * @author chrisburrell
 * 
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
