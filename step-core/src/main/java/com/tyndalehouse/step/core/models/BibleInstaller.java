package com.tyndalehouse.step.core.models;

import java.io.Serializable;

/**
 * @author chrisburrell
 */
public class BibleInstaller implements Serializable {
    private static final long serialVersionUID = -1;
    private int index;
    private String name;
    private boolean accessesInternet = true;

    /**
     * @param index            index stored within STEP
     * @param name             the name of the installer
     * @param accessesInternet true to indicate the installer access the internet
     */
    public BibleInstaller(final int index, final String name, final boolean accessesInternet) {
        this.index = index;
        this.name = name;
        this.accessesInternet = accessesInternet;
    }

    /**
     * @return the index
     */
    public int getIndex() {
        return index;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @return true if accesses the internet
     */
    public boolean isAccessesInternet() {
        return accessesInternet;
    }
}
