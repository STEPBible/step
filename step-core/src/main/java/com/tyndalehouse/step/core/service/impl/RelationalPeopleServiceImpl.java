package com.tyndalehouse.step.core.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.RelationalPerson;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.RelationalPeopleService;

/**
 * An implementation that retrieves the relational people/genealogy data
 * 
 * @author cjburrell
 * 
 */
public class RelationalPeopleServiceImpl implements RelationalPeopleService {
    private static final String FETCH_SEPARATOR = ".";
    private static final Logger LOG = LoggerFactory.getLogger(RelationalPeopleServiceImpl.class);
    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * creates a new Geography service implementation
     * 
     * @param ebean ebean server
     * @param jsword the jsword service for access to Crosswire functionality
     */
    @Inject
    public RelationalPeopleServiceImpl(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    @Override
    public RelationalPerson getGenealogy(final String name, final int degree) {
        final StringBuilder father = new StringBuilder();
        final StringBuilder mother = new StringBuilder();
        for (int ii = 0; ii < degree; ii++) {
            father.append("father");
            mother.append("mother");

            if (ii < degree - 1) {
                father.append(FETCH_SEPARATOR);
                mother.append(FETCH_SEPARATOR);
            }
        }

        final String fatherFetch = father.toString();
        final String motherFetch = mother.toString();
        LOG.trace("Going to fetch [{}], [{}]", fatherFetch, motherFetch);

        return this.ebean.find(RelationalPerson.class).fetch(fatherFetch).fetch(motherFetch).where().eq(
                "code", name).findUnique();
    }
}
