package com.tyndalehouse.step.core.data.entities;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import com.avaje.ebean.Ebean;
import com.tyndalehouse.step.core.data.DataDrivenTestExtension;

/**
 * tests that i can create a user - probably not going to do this for all entities
 * 
 * @author Chris
 * 
 */
public class UserTest extends DataDrivenTestExtension {
    /**
     * tests we can create a user
     */
    @Test
    public void testCreateUser() {
        final User u = new User();
        u.setEmailAddress("chrisburrell@test.com");
        u.setName("Chris");
        u.setPassword("password".getBytes());
        u.setSalt(new byte[0]);
        getEbean().save(u);
        final User r = Ebean.find(User.class, u.getId());
        assertEquals(u.getEmailAddress(), r.getEmailAddress());
    }
}
