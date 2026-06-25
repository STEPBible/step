package com.tyndalehouse.step.core.service.impl;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.SemanticRelatedVersesService;

import javax.inject.Singleton;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

@Singleton
public class SemanticRelatedVersesServiceImpl implements SemanticRelatedVersesService {

    private static final String RESOURCE_PATH =
            "related-verses/bible_semantic_export_minified.json";

    private final String[] pool;
    private final int[][] related;

    public SemanticRelatedVersesServiceImpl() {
        final JsonFactory factory = new JsonFactory();
        factory.disable(JsonFactory.Feature.INTERN_FIELD_NAMES);

        final InputStream stream = ModuleLoader.class.getResourceAsStream(RESOURCE_PATH);
        if (stream == null) {
            throw new StepInternalException("Unable to read resource: " + RESOURCE_PATH);
        }

        final HashMap<String, String[]> raw = new HashMap<String, String[]>(40_000);
        final HashMap<String, String> internCache = new HashMap<String, String>(40_000);

        try {
            final JsonParser p = factory.createParser(stream);
            try {
                if (p.nextToken() != JsonToken.START_OBJECT) {
                    throw new StepInternalException("Expected JSON object at root: " + RESOURCE_PATH);
                }

                while (p.nextToken() == JsonToken.FIELD_NAME) {
                    final String key = p.getText();
                    if (p.nextToken() != JsonToken.START_ARRAY) {
                        throw new StepInternalException("Expected array at " + key);
                    }
                    final List<String> vals = new ArrayList<String>(100);
                    while (p.nextToken() != JsonToken.END_ARRAY) {
                        final String val = p.getText();
                        final String prev = internCache.putIfAbsent(val, val);
                        vals.add(prev != null ? prev : val);
                    }
                    raw.put(key, vals.toArray(new String[0]));
                }
            } finally {
                p.close();
            }
        } catch (IOException e) {
            throw new StepInternalException(
                    "Failed to load semantic related verses from " + RESOURCE_PATH + ": " + e.getMessage(), e);
        } finally {
            try { stream.close(); } catch (IOException ignored) { }
        }

        final TreeSet<String> union = new TreeSet<String>();
        for (Map.Entry<String, String[]> e : raw.entrySet()) {
            union.add(e.getKey());
            for (String v : e.getValue()) {
                union.add(v);
            }
        }

        this.pool = union.toArray(new String[0]);
        this.related = new int[this.pool.length][];

        for (Map.Entry<String, String[]> e : raw.entrySet()) {
            final int idx = Arrays.binarySearch(this.pool, e.getKey());
            if (idx < 0) {
                throw new StepInternalException("Pool missing key during finalization: " + e.getKey());
            }
            final String[] vals = e.getValue();
            final int[] indices = new int[vals.length];
            for (int i = 0; i < vals.length; i++) {
                final int vIdx = Arrays.binarySearch(this.pool, vals[i]);
                if (vIdx < 0) {
                    throw new StepInternalException("Pool missing value during finalization: " + vals[i]);
                }
                indices[i] = vIdx;
            }
            this.related[idx] = indices;
        }
    }

    @Override
    public List<String> getRelatedNrsvRefs(final String nrsvOsisRef) {
        if (nrsvOsisRef == null || nrsvOsisRef.isEmpty()) return Collections.emptyList();
        final int idx = Arrays.binarySearch(this.pool, nrsvOsisRef);
        if (idx < 0 || this.related[idx] == null) return Collections.emptyList();
        final int[] indices = this.related[idx];
        final List<String> out = new ArrayList<String>(indices.length);
        for (int i : indices) out.add(this.pool[i]);
        return out;
    }
}
