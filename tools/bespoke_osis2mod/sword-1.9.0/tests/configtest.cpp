/******************************************************************************
 *
 *  configtest.cpp -	
 *
 * $Id: configtest.cpp 3497 2017-11-01 10:35:38Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

#include <iostream>
#include <swconfig.h>
#ifndef NO_SWORD_NAMESPACE
using sword::SWConfig;
#endif

int main(int argc, char **argv) {
    SWConfig config("./test1.conf");
    config["Section1"]["Entry1"] = "Value1";
    config["Section1"]["Entry2"] = "oops";
    config["Section1"]["Entry2"] = "Value2";
    config.save();
    SWConfig config2("./test1.conf");
    std::cout << "Should be Value2: " << config2["Section1"]["Entry2"] << std::endl;
    return 0;
}
