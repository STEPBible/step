package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * An entity representing a particular geographical location
 * 
 * @author cjburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class RelationalPerson extends ScriptureTarget implements Serializable, KeyedEntity {
    private static final long serialVersionUID = -3798208225083529282L;

    @Column
    private String name;

    @Column
    @OneToOne(cascade = CascadeType.PERSIST)
    private RelationalPerson father;

    @Column
    @OneToOne(cascade = CascadeType.PERSIST)
    private RelationalPerson mother;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "relationalPerson")
    private List<ScriptureReference> references;

    @Column(unique = true)
    private String code;

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
     * @return the father
     */
    public RelationalPerson getFather() {
        return this.father;
    }

    /**
     * @param father the father to set
     */
    public void setFather(final RelationalPerson father) {
        this.father = father;
    }

    /**
     * @return the mother
     */
    public RelationalPerson getMother() {
        return this.mother;
    }

    /**
     * @param mother the mother to set
     */
    public void setMother(final RelationalPerson mother) {
        this.mother = mother;
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

    /**
     * @return the code
     */
    public String getCode() {
        return this.code;
    }

    /**
     * @param code the code to set
     */
    public void setCode(final String code) {
        this.code = code;
    }
}
