package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * A session is associated with a user and may or may not be active (expiresOn value) A user may be logged in
 * multiple times and hence have several sessions.
 * 
 * @author Chris
 * 
 */
@Entity
public class Session implements Serializable {
    private static final long serialVersionUID = 6232919302889735151L;

    @Id
    @GeneratedValue
    private Integer id;

    @Column(unique = true)
    private String jSessionId;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @Column
    private User user;

    @Column
    private String ipAddress;

    @Temporal(TemporalType.TIMESTAMP)
    @Column
    private Timestamp expiresOn;

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
     * @return the jSessionId
     */
    public String getJSessionId() {
        return this.jSessionId;
    }

    /**
     * @param jSessionId the jSessionId to set
     */
    public void setJSessionId(final String jSessionId) {
        this.jSessionId = jSessionId;
    }

    /**
     * @return the user
     */
    public User getUser() {
        return this.user;
    }

    /**
     * @param user the user to set
     */
    public void setUser(final User user) {
        this.user = user;
    }

    /**
     * @return the expiresOn
     */
    public Timestamp getExpiresOn() {
        return this.expiresOn;
    }

    /**
     * @param expiresOn the expiresOn to set
     */
    public void setExpiresOn(final Timestamp expiresOn) {
        this.expiresOn = expiresOn;
    }

    /**
     * @return the ipAddress
     */
    public String getIpAddress() {
        return this.ipAddress;
    }

    /**
     * @param ipAddress the ipAddress to set
     */
    public void setIpAddress(final String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
