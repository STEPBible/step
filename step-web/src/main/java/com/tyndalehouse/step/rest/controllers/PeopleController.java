package com.tyndalehouse.step.rest.controllers;

import java.util.ArrayList;
import java.util.List;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.RelationalPerson;
import com.tyndalehouse.step.core.service.RelationalPeopleService;
import com.tyndalehouse.step.models.genealogy.JitRelationalPerson;

/**
 * Getting some geographical data to display
 * 
 * @author Chris
 * 
 */
@Singleton
public class PeopleController {
    private final RelationalPeopleService peopleService;

    /**
     * Constructs a simple geography service
     * 
     * @param peopleService the people service
     */
    @Inject
    public PeopleController(final RelationalPeopleService peopleService) {
        this.peopleService = peopleService;

    }

    /**
     * returns all places that are within a passage reference
     * 
     * @param personName the biblical name
     * @param degreeFromUser the number of generations to lookup
     * @return the list of places (lat/long/precisions)
     * 
     */
    public JitRelationalPerson getGenealogy(final String personName, final String degreeFromUser) {
        final int degree = Integer.parseInt(degreeFromUser);
        final RelationalPerson genealogy = this.peopleService.getGenealogy(personName, degree);
        return collapseGenealogy(genealogy, degree);
    }

    /**
     * 
     * @param sourcePerson the person we are trying to translate
     * @param degree the number of generations to ascend
     * @return the genealogy with the father/mother collapsed into a list
     */
    private JitRelationalPerson collapseGenealogy(final RelationalPerson sourcePerson, final int degree) {
        final JitRelationalPerson p = new JitRelationalPerson();
        p.setData(sourcePerson.getName());
        p.setId(sourcePerson.getCode());
        p.setName(sourcePerson.getName());

        final List<JitRelationalPerson> children = new ArrayList<JitRelationalPerson>();

        if (degree > 0) {
            final int newDegree = degree - 1;
            if (sourcePerson.getFather() != null) {
                children.add(collapseGenealogy(sourcePerson.getFather(), newDegree));
            }

            if (sourcePerson.getMother() != null) {
                children.add(collapseGenealogy(sourcePerson.getMother(), newDegree));
            }
        }

        p.setChildren(children);

        return p;

    }
}
