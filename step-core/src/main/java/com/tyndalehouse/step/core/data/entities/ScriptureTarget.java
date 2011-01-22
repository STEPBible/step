package com.tyndalehouse.step.core.data.entities;

import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * A marker interface meaning this object can be attached to scripture references
 * 
 * @author Chris
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(discriminatorType = DiscriminatorType.INTEGER, name = "targetTypeId")
public class ScriptureTarget {
    @Id
    @GeneratedValue
    private Integer id;

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
}
