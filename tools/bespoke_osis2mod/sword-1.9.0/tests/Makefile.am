AUTOMAKE_OPTIONS = 1.6
AM_CPPFLAGS = -I $(top_srcdir)/include
if USE_INTERNAL_REGEX
AM_CPPFLAGS += -I$(top_srcdir)/include/internal/regex
endif
LDADD = $(top_builddir)/lib/libsword.la

SUBDIRS = cppunit testsuite

noinst_PROGRAMS = utf8norm ciphertest keytest mgrtest parsekey versekeytest \
			vtreekeytest versemgrtest listtest casttest modtest \
			compnone complzss localetest introtest indextest \
			configtest keycast romantest testblocks filtertest \
			rawldidxtest lextest swaptest swbuftest xmltest \
			webiftest striptest ldtest osistest bibliotest \
			httptest

if HAVE_ICU
ICUPROG = icutest translittest tlitmgrtest
else
ICUPROG =
endif

noinst_PROGRAMS += $(ICUPROG)

if HAVE_ICU
icutest_SOURCES = icutest.cpp
translittest_SOURCES = translittest.cpp
tlitmgrtest_SOURCES = tlitmgrtest.cpp
endif

if HAVE_LIBZ
ZLIBPROG = compzip
else
ZLIBPROG =
endif

noinst_PROGRAMS += $(ZLIBPROG)

if HAVE_LIBZ
compzip_SOURCES = compzip.cpp
endif

keytest_SOURCES = keytest.cpp
mgrtest_SOURCES = mgrtest.cpp
ciphertest_SOURCES = ciphertest.cpp
utf8norm_SOURCES = utf8norm.cpp
parsekey_SOURCES = parsekey.cpp
versekeytest_SOURCES = versekeytest.cpp
vtreekeytest_SOURCES = vtreekeytest.cpp
versemgrtest_SOURCES = versemgrtest.cpp
listtest_SOURCES = listtest.cpp
casttest_SOURCES = casttest.cpp
modtest_SOURCES = modtest.cpp
compnone_SOURCES = compnone.cpp
complzss_SOURCES = complzss.cpp
localetest_SOURCES = localetest.cpp
keycast_SOURCES = keycast.cpp
introtest_SOURCES = introtest.cpp
indextest_SOURCES = indextest.cpp
configtest_SOURCES = configtest.cpp
romantest_SOURCES = romantest.cpp
testblocks_SOURCES = testblocks.cpp
filtertest_SOURCES = filtertest.cpp
lextest_SOURCES = lextest.cpp
rawldidxtest_SOURCES = rawldidxtest.cpp
swaptest_SOURCES = swaptest.cpp
swbuftest_SOURCES = swbuftest.cpp
webiftest_SOURCES = webiftest.cpp
striptest_SOURCES = striptest.cpp
xmltest_SOURCES = xmltest.cpp
ldtest_SOURCES = ldtest.cpp
osistest_SOURCES = osistest.cpp
bibliotest_SOURCES = bibliotest.cpp
httptest_SOURCES = httptest.cpp

