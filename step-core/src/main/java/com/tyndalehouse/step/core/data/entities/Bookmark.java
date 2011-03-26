package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

/**
 * A user may have multiple bookmarks
 * 
 * @author Chris
 * 
 */
@Entity
public class Bookmark implements Serializable {
    private static final long serialVersionUID = 537098392958960964L;

    @Id
    @GeneratedValue
    private Integer id;

    @Column(nullable = false)
    private String bookmarkReference;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @Column(nullable = false)
    private User user;

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
     * @return the bookmarkReference
     */
    public String getBookmarkReference() {
        return this.bookmarkReference;
    }

    /**
     * @param bookmarkReference the bookmarkReference to set
     */
    public void setBookmarkReference(final String bookmarkReference) {
        this.bookmarkReference = bookmarkReference;
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
}
