AUTOMAKE_OPTIONS = 1.6
AM_CPPFLAGS = -I $(top_srcdir)/include
if USE_INTERNAL_REGEX
AM_CPPFLAGS += -I$(top_srcdir)/include/internal/regex
endif
LDADD = $(top_builddir)/lib/libsword.la

noinst_PROGRAMS = parallelbibles listbiblebooknames simpleverselookup

parallelbibles_SOURCES = parallelbibles.cpp
listbiblebooknames_SOURCES = listbiblebooknames.cpp
simpleverselookup_SOURCES = simpleverselookup.cpp

distclean-local:
	-rm -f Makefile.in
	