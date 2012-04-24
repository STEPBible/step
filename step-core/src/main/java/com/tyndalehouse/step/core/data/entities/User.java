package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * represents a user entity. A user contains a username and password.
 * 
 * @author Chris
 * 
 */
@Entity
@Table(name = "users")
public class User implements Serializable {
    private static final long serialVersionUID = 6221804892435479330L;

    @Id
    @GeneratedValue
    private Integer id;

    @Column
    private String name;

    @Column(nullable = false)
    private byte[] password;

    @Column(nullable = false)
    private byte[] salt;

    @Column(nullable = false)
    private String emailAddress;

    @Column
    private String country;

    @Column
    private String language;

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
     * @return the password
     */
    public byte[] getPassword() {
        return this.password;
    }

    /**
     * @param password the password to set
     */
    public void setPassword(final byte[] password) {
        this.password = password.clone();
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * @return the emailAddress
     */
    public String getEmailAddress() {
        return this.emailAddress;
    }

    /**
     * @param emailAddress the emailAddress to set
     */
    public void setEmailAddress(final String emailAddress) {
        this.emailAddress = emailAddress;
    }

    /**
     * @return the country
     */
    public String getCountry() {
        return this.country;
    }

    /**
     * @param country the country to set
     */
    public void setCountry(final String country) {
        this.country = country;
    }

    /**
     * @return the salt
     */
    public byte[] getSalt() {
        return this.salt;
    }

    /**
     * @param salt the salt to set
     */
    public void setSalt(final byte[] salt) {
        this.salt = salt.clone();
    }

    /**
     * @return the language
     */
    public String getLanguage() {
        return this.language;
    }

    /**
     * @param language the language to set
     */
    public void setLanguage(final String language) {
        this.language = language;
    }
}
