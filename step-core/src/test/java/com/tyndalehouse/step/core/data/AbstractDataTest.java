package com.tyndalehouse.step.core.data;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.tyndalehouse.step.core.data.create.DataTestModule;

/**
 * A simple data test that sets up the context and objects to be able to do persistence. TODO think about
 * whethere the ebean server needs to be a new server each time by redoing the guice injector, we redo the
 * server. could make static, but then tests interfere with each other
 * 
 * @author Chris
 * 
 */
public abstract class AbstractDataTest {
    private static volatile EbeanServer ebean;
    private static volatile Injector injector;
    private boolean runInTransaction = true;

    /**
     * sets up the tests correctly
     */
    @BeforeClass
    public static synchronized void setupData() {
        if (injector == null) {
            injector = Guice.createInjector(new DataTestModule());
        }
        if (ebean == null) {
            ebean = injector.getInstance(EbeanServer.class);
        }
    }

    /**
     * we ensure that tests are isolated by running them in a transaction
     */
    @Before
    public void startTransaction() {
        if (this.runInTransaction) {
            ebean.beginTransaction();
        }
    }

    /**
     * each method should roll back what it does to ensure that is thread-safe and doesn't interfere with
     * others
     */
    @After
    public void rollbackTransaction() {
        if (this.runInTransaction) {
            ebean.endTransaction();
        }
    }

    /**
     * @return the ebean
     */
    public EbeanServer getEbean() {
        return ebean;
    }

    /**
     * @param runInTransaction the runInTransaction to set
     */
    public void setRunInTransaction(final boolean runInTransaction) {
        this.runInTransaction = runInTransaction;
    }
}
