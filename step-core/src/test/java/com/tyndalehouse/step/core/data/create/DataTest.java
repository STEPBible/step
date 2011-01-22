package com.tyndalehouse.step.core.data.create;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.Ebean;
import com.avaje.ebean.SqlRow;
import com.google.inject.Guice;
import com.tyndalehouse.step.core.data.entities.Timeband;

/**
 * Basic test for the loader
 * 
 * @author Chris
 * 
 */
public class DataTest {
    private static final Logger LOG = LoggerFactory.getLogger(DataTest.class);

    /**
     * sets up the tests correctly
     */
    @BeforeClass
    public static void setupData() {
        Guice.createInjector(new DataTestModule());
    }

    /**
     * Tests that a connection server has been established
     */
    @Test
    public void testConnection() {
        final String sql = "select count(*) as count from dual";
        final SqlRow row = Ebean.createSqlQuery(sql).findUnique();

        final Integer i = row.getInteger("count");
        assertEquals(i, Integer.valueOf(1));
        LOG.debug("Got " + i + "  - DataSource good.");
    }

    /**
     * testing the loading process TODO don't want to test the whole timeline component every build
     */
    @Test
    public void tryLoadingProcess() {
        final TimelineModuleLoader timelineLoaderModule = new TimelineModuleLoader();
        final Loader l = new Loader(timelineLoaderModule);
        l.init();

        // we check that we entities in all three tables
        final Timeband timeband = Ebean.find(Timeband.class).fetch("hotspots.events").where().eq("id", 1)
                .findUnique();

        assertNotNull(timeband);
        assertNotNull(timeband.getHotspots());
        assertNotNull(timeband.getHotspots().get(0));
        assertNotNull(timeband.getHotspots().get(0).getEvents());
        assertNotNull(timeband.getHotspots().get(0).getEvents().get(0).getSummary());
    }
    // /**
    // * Tests the relational query builder
    // *
    // * @throws SQLException a SQL exception from the database
    // */
    // @Test
    // public void testRelationalBuilder() throws SQLException {
    // final HotSpotDao hotspotDao = new HotSpotDaoImpl(this.connectionSource);
    //
    // final PreparedQuery<HotSpot> preparedQuery = hotspotDao.getRelationalQueryBuilder().fetch("timeband")
    // .prepare();
    //
    // final List<HotSpot> hotspots = hotspotDao.query(preparedQuery);
    // assertNotNull(hotspots.get(0).getTimeband());
    // assertNotNull(hotspots.get(0).getTimeband().getCode());
    // }
}
