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
package com.tyndalehouse.step.core.data.entities.aggregations;

import java.io.Serializable;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * A simple wrapper around a timeline set of events and a central date
 * 
 * @author chrisburrell
 * 
 */
public class TimelineEventsAndDate implements Serializable {
    private static final long serialVersionUID = -7079914843690188557L;
    private EntityDoc[] events;
    private LocalDateTime dateTime;

    /**
     * @return the events
     */
    public EntityDoc[] getEvents() {
        return this.events;
    }

    /**
     * @param events the events to set
     */
    public void setEvents(final EntityDoc[] events) {
        this.events = events;
    }

    /**
     * @return the dateTime
     */
    public LocalDateTime getDateTime() {
        return this.dateTime;
    }

    /**
     * @param dateTime the dateTime to set
     */
    public void setDateTime(final LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}
