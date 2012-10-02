package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * Information about a version, from Tyndale
 * 
 * @author chrisburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class VersionInfo implements Serializable {
    private static final long serialVersionUID = -7037925059424011897L;
    @Id
    private String version;
    @Lob
    private String info;

    /**
     * @return the version
     */
    public String getVersion() {
        return this.version;
    }

    /**
     * @return the info
     */
    public String getInfo() {
        return this.info;
    }

    /**
     * @param version the version to set
     */
    public void setVersion(final String version) {
        this.version = version;
    }

    /**
     * @param info the info to set
     */
    public void setInfo(final String info) {
        this.info = info;
    }
}
