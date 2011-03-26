package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import com.tyndalehouse.step.core.data.entities.reference.TargetType;

/**
 * The object that represents a scripture reference
 * 
 * @author Chris
 */
@Entity
public class ScriptureReference implements Serializable {
    private static final long serialVersionUID = -3854523992102175988L;

    @Id
    @GeneratedValue
    private Integer scriptureReferenceId;

    @ManyToOne
    private ScriptureTarget target;

    @Column
    private TargetType targetType;

    @Column
    private int startVerseId;

    @Column
    private int endVerseId;

    /**
     * @return the scriptureReferenceId
     */
    public Integer getScriptureReferenceId() {
        return this.scriptureReferenceId;
    }

    /**
     * @param scriptureReferenceId the scriptureReferenceId to set
     */
    public void setScriptureReferenceId(final Integer scriptureReferenceId) {
        this.scriptureReferenceId = scriptureReferenceId;
    }

    // /**
    // * @return the target
    // */
    // public AbstractScriptureTarget getTarget() {
    // return this.target;
    // }
    //
    // /**
    // * @param target the target to set
    // */
    // public void setTarget(final AbstractScriptureTarget target) {
    // this.target = target;
    // }

    /**
     * @return the targetType
     */
    public TargetType getTargetType() {
        return this.targetType;
    }

    /**
     * @param targetType the targetType to set
     */
    public void setTargetType(final TargetType targetType) {
        this.targetType = targetType;
    }

    /**
     * @return the startVerseId
     */
    public int getStartVerseId() {
        return this.startVerseId;
    }

    /**
     * @param startVerseId the startVerseId to set
     */
    public void setStartVerseId(final int startVerseId) {
        this.startVerseId = startVerseId;
    }

    /**
     * @return the endVerseId
     */
    public int getEndVerseId() {
        return this.endVerseId;
    }

    /**
     * @param endVerseId the endVerseId to set
     */
    public void setEndVerseId(final int endVerseId) {
        this.endVerseId = endVerseId;
    }

    /**
     * @return the target
     */
    public ScriptureTarget getTarget() {
        return this.target;
    }

    /**
     * @param target the target to set
     */
    public void setTarget(final ScriptureTarget target) {
        this.target = target;
    }

}
