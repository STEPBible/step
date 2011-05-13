package com.tyndalehouse.step.core.service.impl;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.RelationalPerson;

/**
 * tests the geography data retrieval queries
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class RelationalPeopleServiceImplTest extends DataDrivenTestExtension {
    /**
     * Tests the successful path of registering a user
     */
    @Test
    public void testGetPeople() {
        final RelationalPerson abraham = new RelationalPerson();
        final RelationalPerson sarah = new RelationalPerson();
        final RelationalPerson isaac = new RelationalPerson();
        final RelationalPerson ishmael = new RelationalPerson();
        final RelationalPerson rebekah = new RelationalPerson();
        final RelationalPerson esau = new RelationalPerson();
        final RelationalPerson jacob = new RelationalPerson();
        final RelationalPerson hagar = new RelationalPerson();

        abraham.setCode("abraham");
        sarah.setCode("sarah");
        isaac.setCode("isaac");
        ishmael.setCode("ishmael");
        rebekah.setCode("rebekah");
        esau.setCode("esau");
        jacob.setCode("jacob");
        hagar.setCode("hagar");

        esau.setFather(isaac);
        esau.setMother(rebekah);
        jacob.setFather(isaac);
        jacob.setMother(rebekah);

        isaac.setFather(abraham);
        isaac.setMother(sarah);
        ishmael.setFather(abraham);
        ishmael.setMother(hagar);

        getEbean().save(abraham);
        getEbean().save(sarah);
        getEbean().save(isaac);
        getEbean().save(ishmael);
        getEbean().save(rebekah);
        getEbean().save(esau);
        getEbean().save(jacob);
        getEbean().save(hagar);

        final RelationalPeopleServiceImpl people = new RelationalPeopleServiceImpl(getEbean(),
                new JSwordServiceImpl(null));

        final RelationalPerson esauTree = people.getGenealogy("esau", 1);
        Assert.assertNotNull(esauTree.getFather());

    }
}
