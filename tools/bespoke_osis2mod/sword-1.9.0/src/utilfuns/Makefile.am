
if HAVE_VSNPRINTF 
else
AM_CXXFLAGS += -DNO_VSNPRINTF
endif

utilfunsdir = $(top_srcdir)/src/utilfuns
libsword_la_SOURCES += $(utilfunsdir)/swobject.cpp
libsword_la_SOURCES += $(utilfunsdir)/utilstr.cpp
libsword_la_SOURCES += $(utilfunsdir)/utilxml.cpp
libsword_la_SOURCES += $(utilfunsdir)/swversion.cpp
libsword_la_SOURCES += $(utilfunsdir)/swbuf.cpp
libsword_la_SOURCES += $(utilfunsdir)/ftpparse.c
libsword_la_SOURCES += $(utilfunsdir)/url.cpp

if INTERNALFTPLIB
ftpsrc = $(utilfunsdir)/ftplib.c
else
ftpsrc =
endif

if HAVE_LIBZ
UNTGZ = $(utilfunsdir)/zlib/untgz.c
else
UNTGZ =
endif

libsword_la_SOURCES += $(UNTGZ) 
libsword_la_SOURCES += $(ftpsrc)

if USE_INTERNAL_REGEX
SWREGEX = $(utilfunsdir)/regex.c
else
SWREGEX =
endif
libsword_la_SOURCES += $(SWREGEX)


libsword_la_SOURCES += $(utilfunsdir)/roman.cpp
