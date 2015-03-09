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

import static com.tyndalehouse.step.core.utils.ConversionUtils.epochMinutesStringToLocalDateTime;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.EntityDoc;
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
    public DigestableTimeline toDigestableForm(final EntityDoc[] events, final LocalDateTime suggestedDate) {
        final SimileTimelineImpl timeline = new SimileTimelineImpl();

        timeline.setLegend(getLegendItems());

        timeline.setDateTimeFormat(SIMILE_DEFAULT_TIME_FORMAT);

        final List<SimileEvent> eventList = new ArrayList<SimileEvent>();
        for (final EntityDoc te : events) {
            final SimileEvent e = translateEvent(te);
            eventList.add(e);
        }

        timeline.setEvents(eventList);

        if (suggestedDate != null) {
            timeline.setSuggestedDate(suggestedDate.toString());
        }
        return timeline;
    }

    private List<LegendItem> getLegendItems() {
        final List<LegendItem> legendItems = new ArrayList<>();
        add(legendItems, "A something", "triangle_orange.png");
        add(legendItems, "B something", "square_gray.png");
        add(legendItems, "CD", "triangle_yellow.png");
        add(legendItems, "D", "triangle_green.png");
        add(legendItems, "E", "circle_green.png");
        add(legendItems, "F", "square_blue.png");
        add(legendItems, "G", "circle_blue.png");
        add(legendItems, "H", "circle_purple.png");

        return legendItems;
    }

    private void add(final List<LegendItem> legendItems, final String s, final String s1) {
        LegendItem t = new LegendItem();
        t.setTitle(s);
        t.setIcon(s1);
        legendItems.add(t);
    }

    @Override
    public SimileEvent translateEvent(final EntityDoc te) {
        final SimileEvent e = new SimileEvent();
        final String name = te.get("name");
        e.setTitle(name);
        e.setDescription(name);
        e.setStart(epochMinutesStringToLocalDateTime(te.get("fromDate")).toString());
        e.setEventId(te.get("id"));
        e.setCertainty(te.get("certainty"));
        e.setFlags(te.get("flags"));

        e.setStartPrecision(te.get("fromPrecision"));

        final String toDate = te.get("toDate");
        if (toDate != null) {
            final LocalDateTime dt = epochMinutesStringToLocalDateTime(toDate);
            e.setEnd(dt.toString());
            e.setEndPrecision(te.get("toPrecision"));
            e.setDuration(true);
        } else {
            e.setDuration(false);
        }
        return e;
    }
}
