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
package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import com.tyndalehouse.step.core.data.entities.reference.TargetType;

/**
 * The object that represents a scripture reference
 * 
 * @author chrisburrell
 */
@Entity
public class ScriptureReference implements Serializable {
    private static final long serialVersionUID = -3854523992102175988L;

    @Id
    @GeneratedValue
    private Integer id;

    @ManyToOne(optional = true)
    @Column(nullable = true)
    private GeoPlace geoPlace;

    @ManyToOne(optional = true)
    @Column(nullable = true)
    private TimelineEvent timelineEvent;

    @ManyToOne(optional = true)
    @Column(nullable = true)
    private DictionaryArticle dictionaryArticle;

    @Column
    private TargetType targetType;

    @Column
    private int startVerseId;

    @Column
    private int endVerseId;

    /**
     * @return the id
     */
    public Integer getId() {
        return this.id;
    }

    /**
     * @param id the id to set
     */
    public void setId(final Integer id) {
        this.id = id;
    }

    /**
     * @return the targetType
     */
    public TargetType getTargetType() {
        return this.targetType;
    }

    /**
     * @param targetType the targetType to set
     */
    public void setTargetType(final TargetType targetType) {
        this.targetType = targetType;
    }

    /**
     * @return the startVerseId
     */
    public int getStartVerseId() {
        return this.startVerseId;
    }

    /**
     * @param startVerseId the startVerseId to set
     */
    public void setStartVerseId(final int startVerseId) {
        this.startVerseId = startVerseId;
    }

    /**
     * @return the endVerseId
     */
    public int getEndVerseId() {
        return this.endVerseId;
    }

    /**
     * @param endVerseId the endVerseId to set
     */
    public void setEndVerseId(final int endVerseId) {
        this.endVerseId = endVerseId;
    }

    /**
     * @return the geoPlace
     */
    public GeoPlace getGeoPlace() {
        return this.geoPlace;
    }

    /**
     * @param geoPlace the geoPlace to set
     */
    public void setGeoPlace(final GeoPlace geoPlace) {
        this.geoPlace = geoPlace;
    }

    /**
     * @return the timelineEvent
     */
    public TimelineEvent getTimelineEvent() {
        return this.timelineEvent;
    }

    /**
     * @param timelineEvent the timelineEvent to set
     */
    public void setTimelineEvent(final TimelineEvent timelineEvent) {
        this.timelineEvent = timelineEvent;
    }

    /**
     * @return the dictionaryArticle
     */
    public DictionaryArticle getDictionaryArticle() {
        return this.dictionaryArticle;
    }

    /**
     * @param dictionaryArticle the dictionaryArticle to set
     */
    public void setDictionaryArticle(final DictionaryArticle dictionaryArticle) {
        this.dictionaryArticle = dictionaryArticle;
    }
}
