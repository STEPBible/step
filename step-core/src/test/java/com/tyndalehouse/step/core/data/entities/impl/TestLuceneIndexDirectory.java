package com.tyndalehouse.step.core.data.entities.impl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;

/**
 * A singleton to help locate the lucene indexes in testing
 * 
 * @author chrisburrell
 * 
 */
public final class TestLuceneIndexDirectory {
    private static Map<String, Directory> directories = new HashMap<String, Directory>();

    /**
     * no implementation
     */
    private TestLuceneIndexDirectory() {
        // no op
    }

    /**
     * @param name name of entity
     * @return the directory, probably memory
     */
    public static Directory getEntityDirectory(final String name) {
        Directory directory = directories.get(name);
        if (directory == null) {
            directory = new RAMDirectory();
            directories.put(name, directory);
        }
        return directory;
    }
}
