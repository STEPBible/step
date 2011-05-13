package com.tyndalehouse.step.core.data.create;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.SqlRow;
import com.tyndalehouse.step.core.data.DataDrivenTestExtension;

/**
 * Basic test for the loader
 * 
 * @author Chris
 * 
 */
public class DataTest extends DataDrivenTestExtension {
    private static final Logger LOG = LoggerFactory.getLogger(DataTest.class);

    /**
     * default constructor called by JUnit to create the test
     */
    public DataTest() {
        setRunInTransaction(false);
    }

    /**
     * Tests that a connection server has been established
     */
    @Test
    public void testConnection() {
        final String sql = "select count(*) as count from dual";
        final SqlRow row = getEbean().createSqlQuery(sql).findUnique();

        final Integer i = row.getInteger("count");
        assertEquals(i, Integer.valueOf(1));
        LOG.debug("Got " + i + "  - DataSource good.");
    }

    /**
     * testing the loading process
     * <p />
     * TODO: don't want to test the whole timeline/geography component every build
     */
    // @Test
    // public void tryLoadingProcess() {
    // final JSwordServiceImpl jsword = new JSwordServiceImpl(null);
    // final TimelineModuleLoader timelineLoaderModule = new TimelineModuleLoader(getEbean(), jsword);
    // final GeographyModuleLoader geoLoaderModule = new GeographyModuleLoader(getEbean(), jsword);
    // final RelationalPeopleModuleLoader peopleLoader = new RelationalPeopleModuleLoader(getEbean(), jsword);
    // final Loader l = new Loader(getEbean(), timelineLoaderModule, geoLoaderModule, peopleLoader);
    // l.init();
    //
    // // we check that we entities in all three tables
    // final Timeband timeband = getEbean().find(Timeband.class).fetch("hotspots.events").where()
    // .eq("id", 1).findUnique();
    //
    // assertNotNull(timeband);
    // assertNotNull(timeband.getHotspots());
    // assertNotNull(timeband.getHotspots().get(0));
    // assertNotNull(timeband.getHotspots().get(0).getEvents());
    // assertNotNull(timeband.getHotspots().get(0).getEvents().get(0).getSummary());
    // }
}
