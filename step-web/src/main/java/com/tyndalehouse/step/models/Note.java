package com.tyndalehouse.step.models;

import java.util.List;

/**
 * @author chrisburrell
 */
public class Note {
    private String id;
    private String title;
    private List<String> references;
    private String noteContent;

    /**
     * @return the id
     */
    public String getId() {
        return id;
    }

    /**
     * @param id the id
     */
    public void setId(final String id) {
        this.id = id;
    }

    /**
     * @return the references
     */
    public List<String> getReferences() {
        return references;
    }

    /**
     * @param references the references attached to the note
     */
    public void setReferences(final List<String> references) {
        this.references = references;
    }
    /**
     * @return the note content
     */
    public String getNoteContent() {
        return noteContent;
    }
    /**
     * @param noteContent the note content, usually HTML
     */
    public void setNoteContent(final String noteContent) {
        this.noteContent = noteContent;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title
     */
    public void setTitle(final String title) {
        this.title = title;
    }
}
