package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.data.common.GeoPrecision;

/**
 * An entity representing a particular geographical location
 * 
 * @author cjburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class GeoPlace extends ScriptureTarget implements Serializable {
    private static final long serialVersionUID = -3798208225083529282L;
    private static final int COORDINATE_PRECISION = 17;

    @Column
    private String esvName;
    @Column
    private String root;
    @Column(precision = COORDINATE_PRECISION)
    private Double latitude;
    @Column(precision = COORDINATE_PRECISION)
    private Double longitude;
    @Column
    private String comment;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "geoPlace")
    private List<ScriptureReference> references;

    @Column
    private GeoPrecision precision;

    // private static final long serialVersionUID = -3343458338757180529L;

    /**
     * @return the esvName
     */
    public String getEsvName() {
        return this.esvName;
    }

    /**
     * @param esvName the esvName to set
     */
    public void setEsvName(final String esvName) {
        this.esvName = esvName;
    }

    /**
     * @return the root
     */
    public String getRoot() {
        return this.root;
    }

    /**
     * @param root the root to set
     */
    public void setRoot(final String root) {
        this.root = root;
    }

    /**
     * @return the latitude
     */
    public Double getLatitude() {
        return this.latitude;
    }

    /**
     * @param latitude the latitude to set
     */
    public void setLatitude(final Double latitude) {
        this.latitude = latitude;
    }

    /**
     * @return the longitude
     */
    public Double getLongitude() {
        return this.longitude;
    }

    /**
     * @param longitude the longitude to set
     */
    public void setLongitude(final Double longitude) {
        this.longitude = longitude;
    }

    /**
     * @return the comment
     */
    public String getComment() {
        return this.comment;
    }

    /**
     * @param comment the comment to set
     */
    public void setComment(final String comment) {
        this.comment = comment;
    }

    /**
     * @return the precision
     */
    public GeoPrecision getPrecision() {
        return this.precision;
    }

    /**
     * @param precision the precision to set
     */
    public void setPrecision(final GeoPrecision precision) {
        this.precision = precision;
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
