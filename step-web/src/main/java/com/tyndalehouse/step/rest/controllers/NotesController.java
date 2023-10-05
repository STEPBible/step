package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.models.Note;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Caters for persisting notes in the system
 */
@Singleton
public class NotesController {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotesController.class);
    private ClientSessionProvider sessionProvider;

    /**
     */
    @Inject
    public NotesController(ClientSessionProvider sessionProvider) {
        this.sessionProvider = sessionProvider;
    }

    /**
     * @return all the notes in the system
     */
    public List<Note> notes() {
        boolean partialContent = isPartialRequest();


        List<Note> notes = new ArrayList<Note>();

        Note n = new Note();
        n.setId(UUID.randomUUID().toString());
        if (!partialContent) {
            n.setNoteContent("Hi");
        }
        n.setTitle("my first doc");
        notes.add(n);

        Note n2 = new Note();
        n2.setId(UUID.randomUUID().toString());
        if (!partialContent) {
            n2.setNoteContent("Bye");
        }
        n2.setTitle("MY SECOND DOC");
        notes.add(n2);
        return notes;
    }


    /**
     * @return all the notes in the system
     */
    public Note notes(String id) {
        Note n = new Note();
        n.setId(id);
        if (!isPartialRequest()) {
            n.setNoteContent("Some update");
        }
        return n;
    }

    /**
     * @return true if partial request
     */
    private boolean isPartialRequest() {
        return Boolean.parseBoolean(sessionProvider.get().getParam("partial"));
    }
}
