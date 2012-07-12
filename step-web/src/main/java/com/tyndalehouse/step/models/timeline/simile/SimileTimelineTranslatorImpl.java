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

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
import com.tyndalehouse.step.models.TimelineTranslator;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;

/**
 * provides a way of
 * 
 * @author chrisburrell
 * 
 */
public class SimileTimelineTranslatorImpl implements TimelineTranslator {
    private static final String SIMILE_DEFAULT_TIME_FORMAT = "iso8601";

    @Override
    public DigestableTimeline toDigestableForm(final List<TimelineEvent> events,
            final LocalDateTime suggestedDate) {
        final SimileTimelineImpl timeline = new SimileTimelineImpl();

        timeline.setDateTimeFormat(SIMILE_DEFAULT_TIME_FORMAT);

        final List<SimileEvent> eventList = new ArrayList<SimileEvent>();
        for (final TimelineEvent te : events) {
            final SimileEvent e = translateEvent(te);
            eventList.add(e);
        }

        timeline.setEvents(eventList);

        if (suggestedDate != null) {
            timeline.setSuggestedDate(suggestedDate.toString());
        }
        return timeline;
    }

    @Override
    public SimileEvent translateEvent(final TimelineEvent te) {
        final SimileEvent e = new SimileEvent();
        e.setTitle(te.getName());
        e.setDescription(te.getName());
        e.setStart(te.getFromDate().toString());
        e.setEventId(te.getId());
        e.setCertainty(te.getCertainty());
        e.setFlags(te.getFlags());

        e.setStartPrecision(te.getFromPrecision());

        final LocalDateTime toDate = te.getToDate();
        if (toDate != null) {
            e.setEnd(te.getToDate().toString());
            e.setEndPrecision(te.getToPrecision());
            e.setDuration(true);
        } else {
            e.setDuration(false);
        }
        return e;
    }
}
