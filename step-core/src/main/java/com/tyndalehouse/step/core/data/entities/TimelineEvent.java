package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;

import org.joda.time.LocalDateTime;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.common.PrecisionType;

/**
 * Represents an event or duration in time.
 * 
 * @author Chris
 */
@CacheStrategy(readOnly = true)
@Entity
public class TimelineEvent extends ScriptureTarget implements Serializable {
    private static final long serialVersionUID = -4642904574412249515L;

    @Column
    private String summary;

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

}
