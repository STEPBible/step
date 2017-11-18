package com.tyndalehouse.step.tools.modules;

import com.google.inject.Binder;
import com.google.inject.Guice;
import com.google.inject.Module;
import com.google.inject.Provider;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import org.crosswire.common.util.CWProject;
import org.crosswire.jsword.book.sword.SwordBookPath;

import java.io.File;

/**
 * Indexes a single module modules
 * 
 * @author chrisburrell
 *
 */
public class IndexModule {
    /**
     * main method
     * 
     * @param args list of arguments
     */
    public static void main(final String[] args) {
        CWProject.instance().setFrontendName("step");

        final JSwordModuleService instance = Guice.createInjector(new StepCoreModule(), new Module() {

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

        }).getInstance(JSwordModuleService.class);
        System.out.println("Indexing " + args[0]);
        instance.index(args[0]);

        System.out.println("Finished indexing " + args[0]);
    }
}
