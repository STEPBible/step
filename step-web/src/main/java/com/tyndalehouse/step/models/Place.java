package com.tyndalehouse.step.models;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * A place
 * 
 * @author chrisburrell
 * 
 */
public class Place {
    private Double latitude;
    private Double longitude;
    private String name;
    private String precision;

    /** for serialisation */
    public Place() {
        // no-op
    }

    /**
     * Constructs a place from an entity document
     * 
     * @param openBibleDoc the doc in question
     */
    public Place(final EntityDoc openBibleDoc) {
        this.latitude = Double.parseDouble(openBibleDoc.get("latitude"));
        this.longitude = Double.parseDouble(openBibleDoc.get("longitude"));
        this.name = openBibleDoc.get("esvName");
        this.precision = openBibleDoc.get("precision");
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
     * @return the precision
     */
    public String getPrecision() {
        return this.precision;
    }

    /**
     * @param precision the precision to set
     */
    public void setPrecision(final String precision) {
        this.precision = precision;
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }
}
