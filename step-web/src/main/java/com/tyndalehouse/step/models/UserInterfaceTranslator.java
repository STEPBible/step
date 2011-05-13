package com.tyndalehouse.step.models;

import java.util.List;

/**
 * A translator is able to convert timeline data into a form that is acceptable by the client
 * 
 * @author Chris
 * @param <S> the source class
 * @param <T> the target class
 */
public interface UserInterfaceTranslator<S, T> {

    /**
     * translates a list of events to a digestable form of a timeline
     * 
     * @param sourceElement the source element
     * @return the wrapped up form of the timeline
     */
    T toDigestableForm(final List<S> sourceElement);

}
