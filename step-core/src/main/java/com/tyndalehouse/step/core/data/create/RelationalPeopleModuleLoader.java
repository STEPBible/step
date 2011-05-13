package com.tyndalehouse.step.core.data.create;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.RelationalPerson;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Loads anything related to the timeline
 * 
 * @author Chris
 * 
 */
public class RelationalPeopleModuleLoader extends AbstractCsvModuleLoader implements ModuleLoader {
    private static final String GENEALOGY_FILE = "genealogy/basic.csv";
    private static final Logger LOG = LoggerFactory.getLogger(RelationalPeopleModuleLoader.class);

    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * we need to persist object through an orm
     * 
     * @param ebean the persistence server
     * @param jsword the jsword service
     */
    @Inject
    public RelationalPeopleModuleLoader(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    @Override
    public void init() {
        LOG.debug("Loading relational people");
        final long currentTime = System.currentTimeMillis();

        final Map<String, RelationalPerson> people = loadPeople();
        this.ebean.save(people.values());

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} relational people", Long.valueOf(duration), people.size());
    }

    /**
     * Loads people from the database
     * <p />
     * TODO refactor so that we don't store the people in two different maps - the map from the Abstract class
     * is not used
     * 
     * @return a list of people with their relationships
     */
    private Map<String, RelationalPerson> loadPeople() {
        final Map<String, RelationalPerson> peopleInProgress = new HashMap<String, RelationalPerson>();

        load(GENEALOGY_FILE, new CsvDataMapper<RelationalPerson>() {
            @Override
            public RelationalPerson mapRow(final int rowNum, final CsvData data) {
                final RelationalPerson relationalPerson = getRelationalPerson(peopleInProgress, data.getData(
                        rowNum, "unique_key"));

                // set core data
                relationalPerson.setName(data.getData(rowNum, "person"));
                relationalPerson.setFather(getRelationalPerson(peopleInProgress, data.getData(rowNum,
                        "father_key")));
                relationalPerson.setMother(getRelationalPerson(peopleInProgress, data.getData(rowNum,
                        "mother_key")));
                relationalPerson.setReferences(RelationalPeopleModuleLoader.this.jsword
                        .getPassageReferences(data.getData(rowNum, "reference")));

                // refactor as storing this map twice?
                return relationalPerson;
            }
        });

        return peopleInProgress;
    }

    /**
     * returns a person who is already part of the map
     * 
     * @param peopleInProgress the people in progress that we've identified so far
     * @param uniqueKey the unique key
     * @return the person, either new or recup-ed from the map
     */
    private RelationalPerson getRelationalPerson(final Map<String, RelationalPerson> peopleInProgress,
            final String uniqueKey) {
        RelationalPerson relationalPerson = peopleInProgress.get(uniqueKey);
        // create if we don't have the person already
        if (relationalPerson == null) {
            relationalPerson = new RelationalPerson();
            relationalPerson.setCode(uniqueKey);
            peopleInProgress.put(uniqueKey, relationalPerson);
        }
        return relationalPerson;
    }
}
