package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.StringWriter;
import java.util.HashSet;
import java.util.Set;

import org.junit.Test;

/**
 * Checks a user is valid
 * 
 * @author chrisburrell
 * 
 */
public class UserServiceImplTest {
    /**
     * tests an existing user is found, and an invalid one is not
     */
    @Test
    public void testExistingUser() {
        final UserServiceImpl usi = new UserServiceImpl(false, true, "random");
        final Set<String> users = new HashSet<String>();
        users.add("chris@chris.com");
        usi.setUsers(users);

        assertTrue(usi.checkUserIdentity("ChrIs@chris.com", "Chris"));
        assertFalse(usi.checkUserIdentity("Charlie@chris.com", "Charlie"));
    }

    /**
     * tests an existing user is created when auto register is on
     */
    @Test
    public void testUserIsCreated() {
        final UserServiceImpl usi = new UserServiceImpl(true, true, "random");
        final StringWriter userWriter = new StringWriter(16);
        usi.setUserWriter(userWriter);
        usi.setUsers(new HashSet<String>());

        usi.checkUserIdentity("Charlie@chris.com", "Charlie");
        assertTrue(userWriter.toString().startsWith("charlie@chris.com,Charlie"));
    }

    /**
     * tests an existing user is not created when auto register is off
     */
    @Test
    public void testUserIsNotCreated() {
        final UserServiceImpl usi = new UserServiceImpl(true, false, "random");
        final StringWriter userWriter = new StringWriter(16);
        usi.setUserWriter(userWriter);
        usi.setUsers(new HashSet<String>());

        usi.checkUserIdentity("Charlie@chris.com", "Charlie");
        assertEquals(0, userWriter.toString().length());
    }
}
