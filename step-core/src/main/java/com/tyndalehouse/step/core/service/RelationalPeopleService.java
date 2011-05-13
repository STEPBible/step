package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.entities.RelationalPerson;

/**
 * 
 * @author cjburrell
 * 
 */
public interface RelationalPeopleService {
    /**
     * Obtains a list of all people for a particular reference
     * 
     * @param name the reference
     * @param degree the number of links to retrieve
     * @return the list of people
     */
    RelationalPerson getGenealogy(String name, int degree);
}
