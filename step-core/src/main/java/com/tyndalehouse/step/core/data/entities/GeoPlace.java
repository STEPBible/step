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
