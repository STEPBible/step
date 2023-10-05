package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.Note;

import java.util.List;

/**
 * Allows access to personal notes
 */
public interface NotesService {

    /**
     * Saves notes.
     * 
     * @param id the id
     * @param email the email
     * @param content the content, in HTML form
     * @return the doc id
     */
    int saveNote(int id, String email, String content);

    /**
     * Gets the all notes. The content will not be returned.
     * 
     * @param email the email
     * @return the all notes
     */
    List<Note> getAllNotes(String email);

}
