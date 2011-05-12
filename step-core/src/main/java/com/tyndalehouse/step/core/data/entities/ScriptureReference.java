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
 * @author Chris
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
}
