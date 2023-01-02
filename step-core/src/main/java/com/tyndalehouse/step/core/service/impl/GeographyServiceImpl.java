//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.core.service.impl;
//pt20201119
//pt20201119import javax.inject.Inject;
//pt20201119import javax.inject.Singleton;
//pt20201119
//pt20201119import org.apache.lucene.queryParser.QueryParser.Operator;
//pt20201119import org.slf4j.Logger;
//pt20201119import org.slf4j.LoggerFactory;
//pt20201119
//pt20201119import com.tyndalehouse.step.core.data.EntityManager;
//pt20201119import com.tyndalehouse.step.core.data.EntityDoc;
//pt20201119import com.tyndalehouse.step.core.data.EntityIndexReader;
//pt20201119import com.tyndalehouse.step.core.service.GeographyService;
//pt20201119import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Returns geography data
 * 
 * @author cjburrell
 * 
 */
//pt20201119@Singleton
//pt20201119public class GeographyServiceImpl implements GeographyService {
//pt20201119    private static final String OPEN_BIBLE_VERSION = "ESV_th";
//pt20201119    private static final Logger LOG = LoggerFactory.getLogger(GeographyServiceImpl.class);
//pt20201119    private final JSwordPassageService jsword;
//pt20201119    private final EntityIndexReader openBiblePlaces;
//pt20201119
//pt20201119    /**
//pt20201119     * creates a new Geography service implementation
//pt20201119     *
//pt20201119     * @param manager the entity manager
//pt20201119     * @param jsword the jsword service for access to Crosswire functionality
//pt20201119     */
//pt20201119    @Inject
//pt20201119    public GeographyServiceImpl(final EntityManager manager, final JSwordPassageService jsword) {
//pt20201119        this.jsword = jsword;
//pt20201119        this.openBiblePlaces = manager.getReader("obplace");
//pt20201119    }
//pt20201119
//pt20201119    @Override
//pt20201119    public EntityDoc[] getPlaces(final String reference) {
//pt20201119        LOG.debug("Returning places for reference [{}]", reference);
//pt20201119
//pt20201119        final String allReferences = this.jsword.getAllReferences(reference, OPEN_BIBLE_VERSION);
//pt20201119        return this.openBiblePlaces.searchSingleColumn("references", allReferences, Operator.OR, false);
//pt20201119    }
//pt20201119}
