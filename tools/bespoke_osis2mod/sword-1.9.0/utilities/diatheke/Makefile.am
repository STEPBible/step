AUTOMAKE_OPTIONS = 1.6

LDADD = $(top_builddir)/lib/libsword.la

bin_PROGRAMS = diatheke

diatheke_SOURCES = diatheke.cpp corediatheke.cpp diathekemgr.cpp \
	diafiltmgr.cpp thmlcgi.cpp gbfcgi.cpp osiscgi.cpp

noinst_HEADERS = corediatheke.h diafiltmgr.h diathekemgr.h gbfcgi.h thmlcgi.h \
	osiscgi.h

include cgi/Makefile.am
