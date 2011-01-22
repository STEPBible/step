package com.tyndalehouse.step.core.data.entities;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.entities.reference.TimeUnitType;

/**
 * The entity representing a timeline
 * 
 * @author Chris
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class HotSpot implements KeyedEntity {
    @Id
    @GeneratedValue
    private Integer id;

    @Column
    private String description;

    @Column
    private String code;

    @Column
    private TimeUnitType scale;

    @ManyToOne(cascade = CascadeType.ALL)
    private Timeband timeband;

    @OneToMany
    private List<TimelineEvent> events;

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
     * @return the code
     */
    public String getCode() {
        return this.code;
    }

    /**
     * @param code the code to set
     */
    public void setCode(final String code) {
        this.code = code;
    }

    /**
     * @return the scale
     */
    public TimeUnitType getScale() {
        return this.scale;
    }

    /**
     * @param scale the scale to set
     */
    public void setScale(final TimeUnitType scale) {
        this.scale = scale;
    }

    /**
     * @return the timeband
     */
    public Timeband getTimeband() {
        return this.timeband;
    }

    /**
     * @param timeband the timeband to set
     */
    public void setTimeband(final Timeband timeband) {
        this.timeband = timeband;
    }

    /**
     * @return the events
     */
    public List<TimelineEvent> getEvents() {
        return this.events;
    }

    /**
     * @param events the events to set
     */
    public void setEvents(final List<TimelineEvent> events) {
        this.events = events;
    }

}
