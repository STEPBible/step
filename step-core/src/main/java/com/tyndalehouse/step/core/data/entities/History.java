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
 * A user may have multiple history items, these are always ordered by the last inserted data however
 * 
 * @author Chris
 * 
 */
@Entity
public class History implements Serializable {
    private static final long serialVersionUID = 2983314321961626288L;

    @Id
    @GeneratedValue
    private Integer id;

    @Column(nullable = false)
    private String historyReference;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @Column(nullable = false)
    private User user;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Timestamp lastUpdated;

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
     * @return the historyReference
     */
    public String getHistoryReference() {
        return this.historyReference;
    }

    /**
     * @param historyReference the historyReference to set
     */
    public void setHistoryReference(final String historyReference) {
        this.historyReference = historyReference;
    }

    /**
     * @return the lastUpdated
     */
    public Timestamp getLastUpdated() {
        return this.lastUpdated;
    }

    /**
     * @param lastUpdated the lastUpdated to set
     */
    public void setLastUpdated(final Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
