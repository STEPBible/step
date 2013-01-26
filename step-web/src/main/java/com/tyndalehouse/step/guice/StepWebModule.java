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
package com.tyndalehouse.step.guice;

import com.google.inject.servlet.ServletScopes;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.utils.AbstractStepGuiceModule;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.models.TimelineTranslator;
import com.tyndalehouse.step.models.UiDefaults;
import com.tyndalehouse.step.models.timeline.simile.SimileTimelineTranslatorImpl;

/**
 * This module serves to inject data that is specific to the servlet layer. The purpose of it is therefore to
 * abstract away the identity of it being a java web servlet serving the page.
 * 
 * @author chrisburrell
 * 
 */
public class StepWebModule extends AbstractStepGuiceModule {
    private static final String GUICE_PROPERTIES = "/step.web.properties";

    /**
     * sets up the module with the relevant properties file
     */
    public StepWebModule() {
        super(GUICE_PROPERTIES);
        // TODO Auto-generated constructor stub
    }

    @Override
    protected void doConfigure() {
        // this provider is helpful for getting the request at runtime
        bind(ClientSession.class).toProvider(ClientSessionProvider.class).in(ServletScopes.REQUEST);
        bind(UiDefaults.class).asEagerSingleton();

        bind(TimelineTranslator.class).to(SimileTimelineTranslatorImpl.class);

    }
}
