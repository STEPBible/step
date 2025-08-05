/******************************************************************************
 *
 *  server.cpp -	
 *
 * $Id: server.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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


#include "swordorb-impl.hpp"
#include <iostream>
#include <swmgr.h>
#include "webmgr.hpp"

SWConfig *sysConf = 0;
WebMgr *swordMgr = 0;

class CleanStatics {
public:
	CleanStatics() {}
	~CleanStatics() {
		if (swordMgr)
			delete swordMgr;

		if (sysConf)
			delete sysConf;
	}
} cleanStatics;




int main (int argc, char* argv[]) {
  try {

	for (int i = 1; i < argc; i++) {
		if (!strcmp(argv[i], "-sysConf")) {
			if ((i+1) < argc)
				sysConf = new SWConfig(argv[i+1]);
		}
	}

	swordMgr = new WebMgr(sysConf);

 	  // Initialize the CORBA orb
 	  CORBA::ORB_ptr orb = CORBA::ORB_init (argc, argv);
	
 	  // Get the root POA
 	  CORBA::Object_var pfobj = orb->resolve_initial_references("RootPOA");

 	  PortableServer::POA_var rootPOA =
         PortableServer::POA::_narrow(pfobj);

 	  // Activate the root POA's manager
 	  PortableServer::POAManager_var mgr = rootPOA->the_POAManager();

 	  mgr->activate();

 	  // Create a Servant and explicitly create a CORBA object
 	  swordorb::SWMgr_impl servant(swordMgr);
 	  CORBA::Object_var object = servant._this();

 	  // Here we get the IOR for the Hello server object.
 	  // Our "client" will use the IOR to find the object to connect to
 	  CORBA::String_var ref = orb->object_to_string( object );

 	  // print out the IOR
 	  std::cout << ref << std::endl;

 	  // run the server event loop
 	  orb->run();
  }
  catch(const CORBA::Exception& ex)
  {
    std::cout << "Exception caught." << std::endl;
  }

}
