package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.entities.reference.TimeUnitType;

/**
 * Represents a timeband
 * 
 * @author Chris
 */
@CacheStrategy(readOnly = true)
@Entity
public class Timeband implements KeyedEntity, Serializable {
    private static final long serialVersionUID = 8217910739779785032L;

    @Id
    @GeneratedValue
    private Integer id;
    @Column
    private String code;
    @Column
    private TimeUnitType scale;
    @Column
    private String description;

    @OneToMany(cascade = CascadeType.ALL)
    private List<HotSpot> hotspots;

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
     * @return the code
     */
    @Override
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
     * @return the hotspots
     */
    public List<HotSpot> getHotspots() {
        return this.hotspots;
    }

    /**
     * @param hotspots the hotspots to set
     */
    public void setHotspots(final List<HotSpot> hotspots) {
        this.hotspots = hotspots;
    }
}
