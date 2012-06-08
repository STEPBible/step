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
package com.tyndalehouse.step.core.data.create.loaders.translations;

import static com.tyndalehouse.step.core.data.common.PartialDate.parseDate;
import static com.tyndalehouse.step.core.data.entities.reference.TargetType.TIMELINE_EVENT;

import java.util.ArrayList;
import java.util.List;

import com.tyndalehouse.step.core.data.common.PartialDate;
import com.tyndalehouse.step.core.data.common.PrecisionType;
import com.tyndalehouse.step.core.data.create.loaders.CsvData;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Translates from {@link CsvData} to {@link TimelineEvent}
 * 
 * @author chrisburrell
 */
public class TimelineEventTranslation implements CsvTranslation<TimelineEvent> {
    private final JSwordService jsword;

    /**
     * @param jsword the jsword service to be able to lookup the relevant references
     */
    public TimelineEventTranslation(final JSwordService jsword) {
        this.jsword = jsword;
    }

    @Override
    public List<TimelineEvent> parseAll(final CsvData data) {
        final List<TimelineEvent> events = new ArrayList<TimelineEvent>(data.size());
        for (int ii = 0; ii < data.size(); ii++) {
            final TimelineEvent event = new TimelineEvent();
            final PartialDate from = parseDate(data.getData(ii, "From"));
            final PartialDate to = parseDate(data.getData(ii, "To"));

            event.setName(data.getData(ii, "Name"));
            if (from.getPrecision() != PrecisionType.NONE) {
                event.setFromDate(from.getDate());
                event.setFromPrecision(from.getPrecision());
            }

            if (to.getPrecision() != PrecisionType.NONE) {
                event.setToDate(to.getDate());
                event.setToPrecision(to.getPrecision());

            }
            // finally add any scripture reference required
            final List<ScriptureReference> passageReferences = this.jsword.getPassageReferences(
                    data.getData(ii, "Refs"), TIMELINE_EVENT, "KJV");

            event.setReferences(passageReferences);

            events.add(event);
        }
        return events;
    }
}
