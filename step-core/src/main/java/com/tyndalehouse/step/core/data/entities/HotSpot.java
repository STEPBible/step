package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import org.joda.time.LocalDateTime;

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
public class HotSpot implements Serializable {
    private static final long serialVersionUID = -7904172771680747618L;

    @Id
    @GeneratedValue
    private Integer id;

    @Column
    private LocalDateTime start;

    @Column
    private LocalDateTime end;

    @Column
    private String description;

    @Column
    private TimeUnitType scale;

    @Column
    private String color;

    @Column
    private double magnify;

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
     * @return the start
     */
    public LocalDateTime getStart() {
        return this.start;
    }

    /**
     * @param start the start to set
     */
    public void setStart(final LocalDateTime start) {
        this.start = start;
    }

    /**
     * @return the end
     */
    public LocalDateTime getEnd() {
        return this.end;
    }

    /**
     * @param end the end to set
     */
    public void setEnd(final LocalDateTime end) {
        this.end = end;
    }

    /**
     * @return the color
     */
    public String getColor() {
        return this.color;
    }

    /**
     * @param color the color to set
     */
    public void setColor(final String color) {
        this.color = color;
    }

    /**
     * @return the magnify
     */
    public double getMagnify() {
        return this.magnify;
    }

    /**
     * @param magnify the magnify to set
     */
    public void setMagnify(final double magnify) {
        this.magnify = magnify;
    }
}
