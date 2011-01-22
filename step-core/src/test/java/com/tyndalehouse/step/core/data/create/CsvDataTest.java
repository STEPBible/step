package com.tyndalehouse.step.core.data.create;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

/**
 * Tests the Csv Data
 * 
 * @author Chris
 * 
 */
public class CsvDataTest {
    /** testing simple csv data lookup */
    @Test
    public void testSimpleLookup() {
        final String headerName = "name";
        final String headerSurname = "surname";
        final String name1 = "John";
        final String name2 = "Claire";
        final String surname1 = "Blogs";
        final String surname2 = "Smith";

        final List<String[]> fileData = new ArrayList<String[]>();
        fileData.add(new String[] { headerName, headerSurname });
        fileData.add(new String[] { name1, surname1 });
        fileData.add(new String[] { name2, surname2 });

        final CsvData c = new CsvData(fileData);

        assertEquals(name1, c.getData(0, headerName));
        assertEquals(name2, c.getData(1, headerName));
        assertEquals(surname1, c.getData(0, headerSurname));
        assertEquals(surname2, c.getData(1, headerSurname));

    }
}
