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
package com.tyndalehouse.step.core.data;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.tyndalehouse.step.core.data.create.DataTestModule;

/**
 * A simple data test that sets up the context and objects to be able to do persistence.
 * 
 * @author chrisburrell
 * 
 */
public class DataDrivenTestExtension {
    private static volatile EbeanServer ebean;
    private static volatile Injector injector;
    private boolean runInTransaction = true;

    /**
     * prevent initialisation, from anything but extending classes
     */
    protected DataDrivenTestExtension() {
        // do nothing
    }

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
