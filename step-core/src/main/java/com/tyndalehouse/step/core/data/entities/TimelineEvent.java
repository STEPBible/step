package com.tyndalehouse.step.core.data.entities;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.common.PrecisionType;

/**
 * Represents an event or duration in time.
 * 
 * @author Chris
 */
@CacheStrategy(readOnly = true)
@Entity
@DiscriminatorValue("1")
public class TimelineEvent extends ScriptureTarget {
    @Column
    private String summary;

    @Column(nullable = true)
    private long fromDate;

    @Column(nullable = true)
    private long toDate;

    @Column(nullable = true)
    private PrecisionType fromPrecision;

    @Column(nullable = true)
    private PrecisionType toPrecision;

    @ManyToOne(cascade = CascadeType.ALL)
    private HotSpot hotSpot;

    /**
     * @return the summary
     */
    public String getSummary() {
        return this.summary;
    }

    /**
     * @param summary the summary to set
     */
    public void setSummary(final String summary) {
        this.summary = summary;
    }

    /**
     * @return the fromDate
     */
    public long getFromDate() {
        return this.fromDate;
    }

    /**
     * @param fromDate the fromDate to set
     */
    public void setFromDate(final long fromDate) {
        this.fromDate = fromDate;
    }

    /**
     * @return the toDate
     */
    public long getToDate() {
        return this.toDate;
    }

    /**
     * @param toDate the toDate to set
     */
    public void setToDate(final long toDate) {
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
     * @return the hotSpot
     */
    public HotSpot getHotSpot() {
        return this.hotSpot;
    }

    /**
     * @param hotSpot the hotSpot to set
     */
    public void setHotSpot(final HotSpot hotSpot) {
        this.hotSpot = hotSpot;
    }

}
