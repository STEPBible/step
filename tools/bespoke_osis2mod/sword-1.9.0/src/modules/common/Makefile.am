commondir = $(top_srcdir)/src/modules/common

libsword_la_SOURCES += $(commondir)/rawstr.cpp
libsword_la_SOURCES += $(commondir)/rawstr4.cpp
libsword_la_SOURCES += $(commondir)/swcomprs.cpp
libsword_la_SOURCES += $(commondir)/lzsscomprs.cpp

if HAVE_LIBZ
libsword_la_SOURCES += $(commondir)/zipcomprs.cpp
endif

if HAVE_BZIP2
libsword_la_SOURCES += $(commondir)/bz2comprs.cpp
endif

if HAVE_XZ
libsword_la_SOURCES += $(commondir)/xzcomprs.cpp
endif

libsword_la_SOURCES += $(commondir)/rawverse.cpp
libsword_la_SOURCES += $(commondir)/rawverse4.cpp
libsword_la_SOURCES += $(commondir)/swcipher.cpp
libsword_la_SOURCES += $(commondir)/zverse.cpp
libsword_la_SOURCES += $(commondir)/zverse4.cpp
libsword_la_SOURCES += $(commondir)/zstr.cpp
libsword_la_SOURCES += $(commondir)/entriesblk.cpp
libsword_la_SOURCES += $(commondir)/sapphire.cpp
