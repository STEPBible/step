package com.tyndalehouse.step.models.genealogy;

import java.io.Serializable;
import java.util.List;

/**
 * A form that can be interpreted by the UI
 * 
 * @author cjburrell
 * 
 */
public class JitRelationalPerson implements DigestableRelationalPerson, Serializable {
    private static final long serialVersionUID = -622974168227906617L;
    private String id;
    private String name;
    private String data;
    private List<JitRelationalPerson> children;

    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }

    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
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
     * @return the data
     */
    public String getData() {
        return this.data;
    }

    /**
     * @param data the data to set
     */
    public void setData(final String data) {
        this.data = data;
    }

    /**
     * @return the children
     */
    public List<JitRelationalPerson> getChildren() {
        return this.children;
    }

    /**
     * @param children the children to set
     */
    public void setChildren(final List<JitRelationalPerson> children) {
        this.children = children;
    }
}
