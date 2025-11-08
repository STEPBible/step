LDADD = $(top_builddir)/lib/libsword.la

# Rules for the test code (use `make check` to execute)
if HAVE_CPPUNIT
TESTS = LibSword
else
TESTS =
endif
check_PROGRAMS = $(TESTS)
LibSword_SOURCES = main.cpp stringmgr_test.cpp swbuf_test.cpp url_test.cpp versekey_test.cpp 
LibSword_CXXFLAGS = $(CPPUNIT_CFLAGS) -I$(top_srcdir)/include
LibSword_LDFLAGS = $(CPPUNIT_LIBS)

swcppunitpdir = $(top_srcdir)/tests/cppunit

#all: check
