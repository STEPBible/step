package com.tyndalehouse.step.tools.modules;

import com.google.inject.Binder;
import com.google.inject.Guice;
import com.google.inject.Module;
import com.google.inject.Provider;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.BibleInformationService;

/**
 * Indexes all modules
 */
public class IndexAll {
    /**
     * main method
     * 
     * @param args list of arguments
     */
    public static void main(final String[] args) {
        final BibleInformationService instance = Guice.createInjector(new StepCoreModule(), new Module() {

            @Override
            public void configure(final Binder binder) {
                binder.bind(ClientSession.class).toProvider(new Provider<ClientSession>() {

                    @Override
                    public ClientSession get() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                });
            }

        }).getInstance(BibleInformationService.class);
        instance.indexAll();
    }
}
