package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

/**
 * A marker interface meaning this object can be attached to scripture references
 * 
 * @author Chris
 * 
 */
// CHECKSTYLE:OFF
@MappedSuperclass
public abstract class ScriptureTarget implements Serializable {
    // CHECKSTYLE:ON
    private static final long serialVersionUID = 1598422350749055247L;

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
