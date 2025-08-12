bin_PROGRAMS = swordorbserver

noinst_PROGRAMS = testclient

swordorbserver_SOURCES =  server.cpp
swordorbserver_SOURCES += swordorb-common.c
swordorbserver_SOURCES += swordorb-impl.cpp
swordorbserver_SOURCES += swordorb-cpp-common.cc
swordorbserver_SOURCES += swordorb-stubs.c
swordorbserver_SOURCES += swordorb-cpp-stubs.cc
swordorbserver_SOURCES += swordorb-skels.c
swordorbserver_SOURCES += swordorb-cpp-skels.cc

swordorbserver_CFLAGS = $(SWORD_CFLAGS) $(ORBIT_CFLAGS)
swordorbserver_CXXFLAGS = $(SWORD_CFLAGS) $(ORBIT_CXXFLAGS)
swordorbserver_LDADD = $(SWORD_LIBS) $(ORBIT_LIBS)

testclient_SOURCES =  testclient.cpp
testclient_SOURCES += swordorb-common.c
testclient_SOURCES += swordorb-impl.cpp
testclient_SOURCES += swordorb-cpp-common.cc
testclient_SOURCES += swordorb-stubs.c
testclient_SOURCES += swordorb-cpp-stubs.cc
testclient_SOURCES += swordorb-skels.c
testclient_SOURCES += swordorb-cpp-skels.cc

testclient_CFLAGS = $(SWORD_CFLAGS) $(ORBIT_CFLAGS)
testclient_CXXFLAGS = $(SWORD_CFLAGS) $(ORBIT_CXXFLAGS)
testclient_LDADD = $(SWORD_LIBS) $(ORBIT_LIBS)

BUILT_SOURCES = swordorb-common.c

swordorb-common.c: $(top_srcdir)/corba/swordorb.idl
	orbit-idl-2 -l c $(top_srcdir)/corba/swordorb.idl
	orbit-idl-2 -l cpp $(top_srcdir)/corba/swordorb.idl

clean:
	rm -f *.h *.cc *.o *.c server testclient


