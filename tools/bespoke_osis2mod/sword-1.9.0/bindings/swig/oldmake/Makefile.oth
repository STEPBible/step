TOP        = $(PWD)
SWIG       = swig
#SWIGOPT    = -Wall -proxy
SWIGOPT    = -shadow
CXXSRCS    = 
TARGET     = sword
INTERFACE  = sword.i
LIBS       = -lm -lz -lsword
INCLUDE	   = -I$(TOP)/../../include/

all::
	$(MAKE) -f $(TOP)/Makefile.swig CXXSRCS='$(CXXSRCS)' SWIG='$(SWIG)' \
	TARGET='$(TARGET)' SWIGOPT='$(SWIGOPT)' INTERFACE='$(INTERFACE)' LIBS='$(LIBS)' INCLUDE='$(INCLUDE)' perl5_cpp

static::
	$(MAKE) -f $(TOP)/Makefile.swig CXXSRCS='$(CXXSRCS)' SWIG='$(SWIG)' \
	TARGET='myperl' INTERFACE='$(INTERFACE)' INCLUDE='$INCLUDE' perl5_cpp_static

clean::
	rm -f *_wrap* *.o *~ *.so myperl *.pyc .~* core

check: all
