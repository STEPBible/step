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
package com.tyndalehouse.step.core.data.entities.timeline;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;

import org.joda.time.LocalDateTime;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.common.PrecisionType;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.ScriptureTarget;

/**
 * Represents an event or duration in time.
 * 
 * @author chrisburrell
 */
@CacheStrategy(readOnly = true)
@Entity
public class TimelineEvent extends ScriptureTarget implements Serializable {
    private static final long serialVersionUID = -4642904574412249515L;

    @Column(nullable = true)
    private LocalDateTime fromDate;

    @Column(nullable = true)
    private LocalDateTime toDate;

    @Column(nullable = true)
    private PrecisionType fromPrecision;

    @Column(nullable = true)
    private PrecisionType toPrecision;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "timelineEvent")
    private List<ScriptureReference> references;
    @Column(nullable = true)
    private String certainty;
    @Column(nullable = true)
    private String flags;

    /**
     * @return the fromDate
     */
    public LocalDateTime getFromDate() {
        return this.fromDate;
    }

    /**
     * @param fromDate the fromDate to set
     */
    public void setFromDate(final LocalDateTime fromDate) {
        this.fromDate = fromDate;
    }

    /**
     * @return the toDate
     */
    public LocalDateTime getToDate() {
        return this.toDate;
    }

    /**
     * @param toDate the toDate to set
     */
    public void setToDate(final LocalDateTime toDate) {
        this.toDate = toDate;
    }

    /**
     * @return the fromPrecision
     */
    public PrecisionType getFromPrecision() {
        return this.fromPrecision;
    }

    /**
     * @param fromPrecision the fromPrecision to set
     */
    public void setFromPrecision(final PrecisionType fromPrecision) {
        this.fromPrecision = fromPrecision;
    }

    /**
     * @return the toPrecision
     */
    public PrecisionType getToPrecision() {
        return this.toPrecision;
    }

    /**
     * @param toPrecision the toPrecision to set
     */
    public void setToPrecision(final PrecisionType toPrecision) {
        this.toPrecision = toPrecision;
    }

    /**
     * @return the references
     */
    public List<ScriptureReference> getReferences() {
        return this.references;
    }

    /**
     * @param references the references to set
     */
    public void setReferences(final List<ScriptureReference> references) {
        this.references = references;
    }

    /**
     * @return the certainty
     */
    public String getCertainty() {
        return this.certainty;
    }

    /**
     * @param certainty the certainty to set
     */
    public void setCertainty(final String certainty) {
        this.certainty = certainty;
    }

    /**
     * @return the flags
     */
    public String getFlags() {
        return this.flags;
    }

    /**
     * @param flags the flags to set
     */
    public void setFlags(final String flags) {
        this.flags = flags;
    }
}
