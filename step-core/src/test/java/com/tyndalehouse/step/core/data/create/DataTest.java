/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
