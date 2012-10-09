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
package com.tyndalehouse.step.core.guice.providers;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;

import org.apache.commons.dbcp.BasicDataSource;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.EbeanServerFactory;
import com.avaje.ebean.config.ServerConfig;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.ScriptureTarget;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.data.entities.timeline.HotSpot;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;

/**
 * Returns a database connection server instance for use across the application
 * 
 * @author chrisburrell
 * 
 */
public class DatabaseConfigProvider implements Provider<EbeanServer> {
    private final String driverClassName;
    private final boolean poolStatements;
    private final int maxActive;
    private final int maxIdle;
    private final int maxOpenStatements;
    private final String validationQuery;
    private final String url;
    private final String username;
    private final String password;
    private BasicDataSource ds;
    private final boolean generateDDL;

    /**
     * We inject some properties in to the datasource provider
     * 
     * @param driverClassName the driver name
     * @param url the URL connection string
     * @param username the username to login with
     * @param password the password
     * @param maxActive the maximum number of active connections
     * @param maxIdle the maximum number of idle connections
     * @param maxOpenStatements the maximum number of open statements
     * @param poolableStatements true if statements should be pooled
     * @param validationQuery the validation query to check the status of a connection
     */
    // CHECKSTYLE:OFF
    @Inject
    public DatabaseConfigProvider(@Named("app.db.driver") final String driverClassName,
            @Named("app.db.url") final String url, @Named("app.db.username") final String username,
            @Named("app.db.password") final String password, @Named("app.db.maxActive") final int maxActive,
            @Named("app.db.maxIdle") final int maxIdle,
            @Named("app.db.maxOpenStatement") final int maxOpenStatements,
            @Named("app.db.poolableStatements") final boolean poolableStatements,
            @Named("app.db.validationQuery") final String validationQuery,
            @Named("app.db.generate.ddl") final boolean generateDDL) {
        this.driverClassName = driverClassName;
        this.url = url;
        this.username = username;
        this.password = password;
        this.validationQuery = validationQuery;

        this.maxActive = maxActive;
        this.maxIdle = maxIdle;
        this.maxOpenStatements = maxOpenStatements;
        this.poolStatements = poolableStatements;
        this.generateDDL = generateDDL;
    }

    // CHECKSTYLE:ON

    @Override
    public EbeanServer get() {
        final ServerConfig config = new ServerConfig();
        config.setName("db");

        this.ds = new BasicDataSource();
        this.ds.setDefaultAutoCommit(false);
        this.ds.setDriverClassName(this.driverClassName);
        this.ds.setPoolPreparedStatements(this.poolStatements);
        this.ds.setMaxActive(this.maxActive);
        this.ds.setMaxIdle(this.maxIdle);
        this.ds.setMaxOpenPreparedStatements(this.maxOpenStatements);
        this.ds.setValidationQuery(this.validationQuery);
        this.ds.setUrl(this.url);
        this.ds.setUsername(this.username);
        this.ds.setPassword(this.password);

        config.setDataSource(this.ds);
        // config.addPackage("com.tyndalehouse.step.core.data.entities");
        addEntities(config);

        // set DDL options...
        config.setDdlGenerate(this.generateDDL);
        config.setDdlRun(this.generateDDL);

        // config.setLoggingToJavaLogger(true);
        // config.setLoggingLevel(LogLevel.SQL);
        //

        config.setDefaultServer(true);
        config.setRegister(true);

        return EbeanServerFactory.create(config);
    }

    /**
     * Adds all entities to ebean server. We need to this, since it seems since Ebean only looks at exploded
     * parts of the classpath and therfore we would have to hard code the jar file name into the classpath
     * 
     * @param config the configuration to be enhanced
     */
    private void addEntities(final ServerConfig config) {
        config.addClass(ScriptureTarget.class);
        config.addClass(ScriptureReference.class);
        config.addClass(HotSpot.class);
        config.addClass(TimelineEvent.class);
        config.addClass(User.class);
        config.addClass(Session.class);
        config.addClass(Bookmark.class);
        config.addClass(History.class);
        config.addClass(GeoPlace.class);
        config.addClass(TimelineEventsAndDate.class);
        config.addClass(DictionaryArticle.class);
    }

    /**
     * @return the ds
     */
    public BasicDataSource getDs() {
        return this.ds;
    }
}
