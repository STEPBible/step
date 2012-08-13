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
package com.tyndalehouse.step.core.service;

import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.data.entities.timeline.HotSpot;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
import com.tyndalehouse.step.core.models.EnhancedTimelineEvent;

/**
 * The timeline service gives access to all the data relating to the timeline the events, the configuration,
 * etc.
 * 
 * The timeline data is currently loaded from a CSV file and stored in the database
 * 
 * @author chrisburrell
 * 
 */
public interface TimelineService {
    /**
     * the version used to key the timeline events when they are loaded
     */
    String KEYED_REFERENCE_VERSION = "KJV";

    /**
     * Retrieves the whole configuration of the timeline. This defines a number of different bands, each with
     * their hotpots. Each timeband is given a suggested scale (or time unit - decade, century, month day),
     * etc. The hotspots also also given a unit.
     * 
     * @return a list of timebands with all the required details
     */
    List<HotSpot> getTimelineConfiguration();

    /**
     * Returns events that fall within a certain time period
     * 
     * @param from from date
     * @param to to date
     * @return a list of timeline events contained between the two dates
     */
    List<TimelineEvent> getTimelineEvents(LocalDateTime from, LocalDateTime to);

    /**
     * Given a reference to a passage, this looks up the relevant set of events
     * 
     * @param reference the reference to look up
     * @return a set of events and the date at which they occur
     */
    TimelineEventsAndDate getEventsFromScripture(String reference);

    /**
     * Returns all the required information about a timeline event
     * 
     * @param id the id of the event
     * @param version the version to use to lookup any associated verse numbers
     * @return the timeline event with all its data
     */
    EnhancedTimelineEvent getTimelineEvent(int id, String version);

    /**
     * @param reference reference of the scripture passage under consideration
     * @return the list of events matching that reference
     */
    List<TimelineEvent> lookupEventsMatchingReference(String reference);
}
