package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.BibleInstaller;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.SwingService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import org.apache.http.conn.ssl.SSLInitializationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.swing.*;
import java.util.ResourceBundle;

/**
 * This class wraps around the Swing interface!
 */
public class SwingServiceImpl implements SwingService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SwingServiceImpl.class);
    private final Provider<ClientSession> clientSessionProvider;
    private final JSwordModuleService moduleService;

    /**
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public SwingServiceImpl(Provider<ClientSession> clientSessionProvider, JSwordModuleService moduleService) {
        this.clientSessionProvider = clientSessionProvider;
        this.moduleService = moduleService;
    }

    @Override
    public BibleInstaller addDirectoryInstaller() {
        ResourceBundle bundle = ResourceBundle.getBundle("HtmlBundle", clientSessionProvider.get().getLocale());
        setDefaultUILookAndFeel();
        JFileChooser chooser = new JFileChooser();
        chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        chooser.setAcceptAllFileFilterUsed(false);
        chooser.setDialogTitle(bundle.getString("select_directory"));
        chooser.setRequestFocusEnabled(true);
        
        
        if (chooser.showOpenDialog(null) == JFileChooser.APPROVE_OPTION) {
            return moduleService.addDirectoryInstaller(chooser.getSelectedFile().getAbsolutePath());
        }
        throw new StepInternalException("Unable to select a directory - exit ungracefully");
    }

    /**
     * Sets the default ui look and feel.
     */
    private void setDefaultUILookAndFeel() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (final Exception e) {
            LOGGER.error("Failed to change look and feel", e);
        }
    }
}
