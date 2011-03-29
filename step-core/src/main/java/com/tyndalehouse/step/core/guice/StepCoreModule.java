package com.tyndalehouse.step.core.guice;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;

import org.crosswire.jsword.book.install.Installer;

import com.avaje.ebean.EbeanServer;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.guice.providers.DatabaseConfigProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultInstallersProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultLexiconRefsProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultVersionsProvider;
import com.tyndalehouse.step.core.guice.providers.ServerSessionProvider;
import com.tyndalehouse.step.core.guice.providers.TestData;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.FavouritesService;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.UserDataService;
import com.tyndalehouse.step.core.service.impl.BibleInformationServiceImpl;
import com.tyndalehouse.step.core.service.impl.FavouritesServiceImpl;
import com.tyndalehouse.step.core.service.impl.JSwordServiceImpl;
import com.tyndalehouse.step.core.service.impl.ModuleServiceImpl;
import com.tyndalehouse.step.core.service.impl.TimelineServiceImpl;
import com.tyndalehouse.step.core.service.impl.UserDataServiceImpl;

/**
 * The module configuration that configures the application via guice
 * 
 * @author Chris
 * 
 */
@SuppressWarnings("PMD.CouplingBetweenObjects")
public class StepCoreModule extends AbstractModule {
    private static final String CORE_GUICE_PROPERTIES = "/step.core.properties";

    @Override
    protected void configure() {
        final Properties stepProperties = readProperties();
        bind(Properties.class).annotatedWith(Names.named("StepCoreProperties")).toInstance(stepProperties);

        // for now just have a method that statically initialises the cache
        initialiseCacheManager();

        bind(JSwordService.class).to(JSwordServiceImpl.class).asEagerSingleton();
        bind(BibleInformationService.class).to(BibleInformationServiceImpl.class).asEagerSingleton();
        bind(ModuleService.class).to(ModuleServiceImpl.class).asEagerSingleton();
        bind(TimelineService.class).to(TimelineServiceImpl.class);
        bind(FavouritesService.class).to(FavouritesServiceImpl.class);
        bind(UserDataService.class).to(UserDataServiceImpl.class);
        bind(Loader.class);

        bind(Session.class).toProvider(ServerSessionProvider.class);

        bind(new TypeLiteral<List<String>>() {
        }).annotatedWith(Names.named("defaultVersions")).toProvider(DefaultVersionsProvider.class);
        bind(new TypeLiteral<Map<String, String>>() {
        }).annotatedWith(Names.named("defaultLexiconRefs")).toProvider(DefaultLexiconRefsProvider.class);
        bind(new TypeLiteral<List<Installer>>() {
        }).toProvider(DefaultInstallersProvider.class);

        bind(EbeanServer.class).toProvider(DatabaseConfigProvider.class).asEagerSingleton();

        // bind a cache

        bindDaos();

        // now bind the test data
        if (Boolean.valueOf(stepProperties.getProperty("test.data.load"))) {
            bind(TestData.class).asEagerSingleton();
        }
    }

    /**
     * we return the singleton instance here
     * 
     * @return the singleton cache manager
     */
    @Provides
    public CacheManager getCacheManager() {
        return CacheManager.getInstance();
    }

    /**
     * initialises the cache manager. e.g. disables update checker
     */
    private void initialiseCacheManager() {
        final Configuration config = new Configuration();
        config.setUpdateCheck(false);
        config.defaultCache(new CacheConfiguration());
        CacheManager.create(config);
    }

    /**
     * helper method that binds the DAOs
     */
    private void bindDaos() {
        // bind(TimebandDao.class).to(TimebandDaoImpl.class);
        // bind(HotSpotDao.class).to(HotSpotDaoImpl.class);
        // bind(TimelineEventDao.class).to(TimelineEventDaoImpl.class);
        // bind(ScriptureReferenceDao.class).to(ScriptureReferenceDaoImpl.class);
    }

    /**
     * reads the core properties from the file
     * 
     * @return a list of properties read from file
     */
    private Properties readProperties() {
        final InputStream stream = getClass().getResourceAsStream(CORE_GUICE_PROPERTIES);
        final Properties appProperties = new Properties();
        try {
            appProperties.load(stream);
            Names.bindProperties(super.binder(), appProperties);
        } catch (final IOException e) {
            // This is the preferred way to tell Guice something went wrong
            super.addError(e);
        }
        return appProperties;
    }

}
