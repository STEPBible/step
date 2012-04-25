package com.tyndalehouse.step.core.guice.providers;

import org.apache.commons.dbcp.BasicDataSource;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.EbeanServerFactory;
import com.avaje.ebean.config.ServerConfig;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.HotSpot;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.ScriptureTarget;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.StrongDefinition;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;

/**
 * Returns a database connection server instance for use across the application
 * 
 * @author Chris
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
            @Named("app.db.validationQuery") final String validationQuery) {
        this.driverClassName = driverClassName;
        this.url = url;
        this.username = username;
        this.password = password;
        this.validationQuery = validationQuery;

        this.maxActive = maxActive;
        this.maxIdle = maxIdle;
        this.maxOpenStatements = maxOpenStatements;
        this.poolStatements = poolableStatements;
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
        config.setDdlGenerate(true);
        config.setDdlRun(true);

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
        // timeline entities
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
        config.addClass(StrongDefinition.class);
    }

    /**
     * @return the ds
     */
    public BasicDataSource getDs() {
        return this.ds;
    }
}
