/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.OneToMany;

import com.tyndalehouse.step.core.data.entities.reference.SourceType;

/**
 * Represents a dictionary article
 * 
 * @author chrisburrell
 * 
 */
@Entity
public class DictionaryArticle implements Serializable {
    private static final long serialVersionUID = 4729195176353512170L;

    @Id
    @GeneratedValue
    private Integer id;
    private String headword;
    private int headwordInstance;
    private char clazz;
    private String status;
    private SourceType source;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "dictionaryArticle")
    private List<ScriptureReference> scriptureReferences;

    @Lob
    private String text;

    /**
     * @return the headword
     */
    public String getHeadword() {
        return this.headword;
    }

    /**
     * @param headword the headword to set
     */
    public void setHeadword(final String headword) {
        this.headword = headword;
    }

    /**
     * @return the clazz
     */
    public char getClazz() {
        return this.clazz;
    }

    /**
     * @param clazz the clazz to set
     */
    public void setClazz(final char clazz) {
        this.clazz = clazz;
    }

    /**
     * @return the status
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * @param status the status to set
     */
    public void setStatus(final String status) {
        this.status = status;
    }

    /**
     * @return the source
     */
    public SourceType getSource() {
        return this.source;
    }

    /**
     * @param source the source to set
     */
    public void setSource(final SourceType source) {
        this.source = source;
    }

    /**
     * @return the text
     */
    public String getText() {
        return this.text;
    }

    /**
     * @param text the text to set
     */
    public void setText(final String text) {
        this.text = text;
    }

    /**
     * @return the scriptureReferences
     */
    public List<ScriptureReference> getScriptureReferences() {
        return this.scriptureReferences;
    }

    /**
     * @param scriptureReferences the scriptureReferences to set
     */
    public void setScriptureReferences(final List<ScriptureReference> scriptureReferences) {
        this.scriptureReferences = scriptureReferences;
    }

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
     * @return the headwordInstance
     */
    public int getHeadwordInstance() {
        return this.headwordInstance;
    }

    /**
     * @param headwordInstance the headwordInstance to set
     */
    public void setHeadwordInstance(final int headwordInstance) {
        this.headwordInstance = headwordInstance;
    }
}
