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

import com.tyndalehouse.step.models.timeline.DigestableTimeline;

/**
 * This represents the following fragment:
 * 
 * <pre>
 *      {'start': '-1262',
 *       'title': 'Barfusserkirche',
 *         'description': 'by Lyonel Feininger, American/German Painter, 1871-1956',
 *         'image': 'http://images.allposters.com/images/AWI/NR096_b.jpg',
 *         'link': 'http://www.allposters.com/-sp/Barfusserkirche-1924-Posters_i1116895_.htm'
 *         },
 * </pre>
 * 
 * @author Chris
 * 
 */
public class SimileEvent implements DigestableTimeline {
    private String start;
    private String end;
    private boolean duration;
    private String title;
    private String description;
    private int hotSpotId;
    private int eventId;

    private String image;
    private String link;

    /**
     * @return the start
     */
    public String getStart() {
        return this.start;
    }

    /**
     * @param start the start to set
     */
    public void setStart(final String start) {
        this.start = start;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(final String title) {
        this.title = title;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @return the image
     */
    public String getImage() {
        return this.image;
    }

    /**
     * @param image the image to set
     */
    public void setImage(final String image) {
        this.image = image;
    }

    /**
     * @return the link
     */
    public String getLink() {
        return this.link;
    }

    /**
     * @param link the link to set
     */
    public void setLink(final String link) {
        this.link = link;
    }

    /**
     * @return the end
     */
    public String getEnd() {
        return this.end;
    }

    /**
     * @param end the end to set
     */
    public void setEnd(final String end) {
        this.end = end;
    }

    /**
     * @return the duration
     */
    public boolean isDuration() {
        return this.duration;
    }

    /**
     * @param duration the duration to set
     */
    public void setDuration(final boolean duration) {
        this.duration = duration;
    }

    /**
     * @return the hotspotId
     */
    public int getHotSpotId() {
        return this.hotSpotId;
    }

    /**
     * @param hotSpotId the hotSpotId to set
     */
    public void setHotSpotId(final int hotSpotId) {
        this.hotSpotId = hotSpotId;
    }

    /**
     * @return the eventId
     */
    public int getEventId() {
        return this.eventId;
    }

    /**
     * @param eventId the eventId to set
     */
    public void setEventId(final int eventId) {
        this.eventId = eventId;
    }
}
