# ---------------------------------------------------------------------
# Initialisation
# ---------------------------------------------------------------------

# Version change: Change line 9 only !
# Change it immediately after a release

define([svnversion], esyscmd([sh -c "svnversion -n"]))dnl
AC_INIT(sword, 1.9.0, sword-bugs@crosswire.org, sword, http://crosswire.org/sword)
AC_CONFIG_SRCDIR(sword.bmp)
AC_PREREQ(2.52)
AC_REVISION($Revision: 1.45 $)

AC_CANONICAL_TARGET
AM_INIT_AUTOMAKE

# this doesn't work
#AM_INIT_AUTOMAKE([subdir-objects])

AM_CONFIG_HEADER(include/config.h)

AC_CONFIG_MACRO_DIR([m4])

case $host_os in
     mingw*)
	   # both lines necessary to convince gcc to build dll
	   LIBS="$LIBS -no-undefined";
	   export lt_cv_deplibs_check_method=pass_all;
	   ;;
esac

# ---------------------------------------------------------------------
# Check Programs
# ---------------------------------------------------------------------
CFLAGS=" $CFLAGS"
CXXFLAGS=" $CXXFLAGS"
AC_LANG(C++)
AC_PROG_CC
AC_PROG_CXX
AC_PROG_INSTALL
AC_LIBTOOL_WIN32_DLL
AC_PROG_LIBTOOL

AC_C_BIGENDIAN

PKG_CHECK_MODULES([CLUCENE2], [libclucene-core >= 2.3],,true)
if test "x$CLUCENE2_LIBS" = x; then
ACX_CLUCENE
fi

# ---------------------------------------------------------------------
# With options
# ---------------------------------------------------------------------
AC_ARG_WITH(zlib,
	AC_HELP_STRING([--with-zlib],[allow zlib compressed modules (default=yes)]),,with_zlib=yes)
AC_ARG_WITH(bzip2,
	AC_HELP_STRING([--with-bzip2],[allow bzip2 compressed modules (default=no)]),,with_bzip2=no)
AC_ARG_WITH(xz,
	AC_HELP_STRING([--with-xz],[allow xz compressed modules (default=no)]),,with_xz=no)
AC_ARG_WITH(icu,
	AC_HELP_STRING([--with-icu],[use ICU for unicode (default=yes)]),,with_icu=yes)
AC_ARG_WITH(icusword,
	AC_HELP_STRING([--with-icusword],[use custom SWORD ICU (default=no)]),,with_icusword=no)
AC_ARG_WITH(conf,
	AC_HELP_STRING([--with-conf],[install a new sword.conf (default=yes)]),,with_conf=yes)
AC_ARG_WITH(cxx11regex,
	AC_HELP_STRING([--with-cxx11regex],[build regex support using c++11 regex (default=no)]),,with_cxx11regex=no)
AC_ARG_WITH(cxx11time,
	AC_HELP_STRING([--with-cxx11time],[build time support using c++11 time (default=no)]),,with_cxx11time=no)
AC_ARG_WITH(curl,
	AC_HELP_STRING([--with-curl],[build install manager support using libcurl (default=yes)]),,with_curl=yes)
AC_ARG_WITH(curl_sftp,
	AC_HELP_STRING([--with-curl_sftp],[build install manager support using libcurl+sftp (requires --with-curl, default=yes)]),,with_curl_sftp=yes)
#AC_ARG_WITH(lucene,
#	AC_HELP_STRING([--with-lucene],[include lucene support for searching (default=no)]),,with_lucene=no)
AC_ARG_WITH([internalregex],
	AS_HELP_STRING([--with-internalregex], [Compile using SWORDs internal copy of regex]))
AC_ARG_WITH([icuregex],
	AS_HELP_STRING([--with-icuregex], [use ICU regex engine]))
AC_ARG_WITH(xapian,
	AC_HELP_STRING([--with-xapian],[use xapian search engine (default=yes)]),,with_xapian=yes)
AC_ARG_WITH([gapi],
	AS_HELP_STRING([--with-gapi], [build SWORD with support for google apis]),,with_gapi=no)


# ---------------------------------------------------------------------
# Enable options
# ---------------------------------------------------------------------
AC_ARG_ENABLE(debug,
	AC_HELP_STRING([--enable-debug],[build debug library (default=no)]),,enable_debug=no)
AC_ARG_ENABLE(warnings,
	AC_HELP_STRING([--enable-warnings],[build with compiler warnings as errors (default=no)]),,enable_warnings=no)
AC_ARG_ENABLE(profile,
	AC_HELP_STRING([--enable-profile],[allow profiling (default=no)]),,enable_profile=no)
AC_ARG_ENABLE(profilefn,
	AC_HELP_STRING([--enable-profilefn],[allow functioncheck profiling (default=no)]),,enable_profilefn=no)
AC_ARG_ENABLE(tests,
	AC_HELP_STRING([--enable-tests],[build test programs (default=yes)]),,enable_tests=yes)
AC_ARG_ENABLE(utilities,
	AC_HELP_STRING([--enable-utilities],[build utilities (default=yes)]),,enable_utilities=yes)
AC_ARG_ENABLE(examples,
	AC_HELP_STRING([--enable-examples],[build examples (default=no)]),,enable_examples=no)
AC_ARG_ENABLE(logdebug,
	AC_HELP_STRING([--disable-logd],[strip log debug messages from code for optimization (default=no)]),disable_logdebug=yes,disable_logdebug=no)
AC_ARG_ENABLE(loginfo,
	AC_HELP_STRING([--disable-logi],[strip log information messages from code for optimization (default=no)]),disable_loginfo=yes,disable_loginfo=no)
AM_MAINTAINER_MODE

# ---------------------------------------------------------------------
# Debug and profile
# ---------------------------------------------------------------------

# these are first because the SET AM_C.*FLAGS, not just append
if test x$enable_debug = xyes; then
  GCJFLAGS="-g -O0"
  if test x$ac_cv_prog_cc_g = xyes; then
    AM_CFLAGS="-g3 -O0 -Wall"
  else
    AM_CFLAGS="-O0 -Wall"
  fi
  if test x$ac_cv_prog_cxx_g = xyes; then
    AM_CXXFLAGS="-g3 -O0 -Wall -Woverloaded-virtual"
  else
    AM_CXXFLAGS="-O0 -Wall -Woverloaded-virtual"
  fi
else
  my_save_cxxflags="$CXXFLAGS"
  CXXFLAGS=-Ofast
  AC_MSG_CHECKING([whether CXX supports -Ofast])
  AC_LANG_PUSH([C++])
  AC_COMPILE_IFELSE([AC_LANG_PROGRAM([])],
      [AC_MSG_RESULT([yes])]
      [AM_CFLAGS=-Ofast]
      [AM_CXXFLAGS=-Ofast],
      [AC_MSG_RESULT([no])]
      [AM_CFLAGS=-O3]
      [AM_CXXFLAGS=-O3],
  )
  CXXFLAGS="$my_save_cxxflags"
  AC_LANG_POP([C++])
fi

AM_CFLAGS="$AM_CFLAGS -fPIC"
AM_CXXFLAGS="$AM_CXXFLAGS -fPIC"

#stupid check for old or new g++ compiler param syntax for this compiler option
saved_CXXFLAGS="$CXXFLAGS"
CXXFLAGS="$CXXFLAGS -ftemplate-depth=100"
AC_LANG_PUSH([C++])
AC_COMPILE_IFELSE([AC_LANG_PROGRAM([])],,[CXXFLAGS="$saved_CXXFLAGS -ftemplate-depth-100";])
AC_LANG_POP([C++])

# ---------------------------------------------------------------------
# Check libraries
# ---------------------------------------------------------------------
if test x$with_zlib  = xyes; then
	AC_CHECK_LIB(z, compress,,with_zlib="no")
else
	with_zlib="no"
fi

if test x$with_zlib = xno; then
	AM_CFLAGS="$AM_CFLAGS -DEXCLUDEZLIB"
	AM_CXXFLAGS="$AM_CXXFLAGS -DEXCLUDEZLIB"
fi

if test x$with_bzip2  = xyes; then
	AC_CHECK_LIB(bz2, BZ2_bzBuffToBuffCompress,,with_bzip2="no")
else
	with_bzip2="no"
fi

if test x$with_bzip2 = xno; then
	AM_CFLAGS="$AM_CFLAGS -DEXCLUDEBZIP2"
	AM_CXXFLAGS="$AM_CXXFLAGS -DEXCLUDEBZIP2"
fi

if test x$with_xz  = xyes; then
	AC_CHECK_LIB(lzma, lzma_easy_buffer_encode,,with_xz="no")
else
	with_xz="no"
fi

if test x$with_xz = xno; then
	AM_CFLAGS="$AM_CFLAGS -DEXCLUDEXZ"
	AM_CXXFLAGS="$AM_CXXFLAGS -DEXCLUDEXZ"
fi

AS_IF([test "x$with_internalregex" = "xyes"],
      [have_systemregex="no, using internal regex"],
      [AC_SEARCH_LIBS(regexec, regex, [have_systemregex="yes"], [have_systemregex="no, using internal regex"])])

AS_IF([test "x$have_systemregex" = "xyes"],
      [with_internalregex="no"
       AC_MSG_NOTICE([Using system regex.h])],
      [with_internalregex="yes"
       AS_IF([test "x$with_internalregex" = "xno"],
      	[AC_MSG_ERROR([System regex forced but not found])],
	[AC_MSG_NOTICE([Using internal regex.h])])])
 

# ---------------------------------------------------------------------
# Find CppUnit
# ---------------------------------------------------------------------
# Locate CppUnit (minimum version 1.8.0) for testing.  
AM_PATH_CPPUNIT(1.8.0)

# You can set up an automake conditional and use it to conditionally
# build cppunit-using test programs.
AM_CONDITIONAL(HAVE_CPPUNIT, test "$CPPUNIT_LIBS")


# ---------------------------------------------------------------------
# Find pkg-config
# ---------------------------------------------------------------------
use_pkgconfig=yes
PKG_PROG_PKG_CONFIG(PKG_CONFIG, pkg-config, no)
if test x$PKG_CONFIG = xno ; then
  AC_MSG_WARN([*** pkg-config not found. See http://www.freedesktop.org/software/pkgconfig/])
  AC_MSG_WARN([not using pkg-config])
  use_pkgconfig=no
fi

if $PKG_CONFIG --atleast-pkgconfig-version 0.14 ; then
  :
else
  AC_MSG_WARN([*** pkg-config too old; version 0.14 or better required.])
  AC_MSG_WARN([not using pkg-config])
  use_pkgconfig=no
fi


# ---------------------------------------------------------------------
# Find ICU tools
# ---------------------------------------------------------------------
ICU_LIBS=
ICU_IOLIBS=
if test x$with_icu = xyes; then
	AC_PATH_PROG(ICU_CONFIG, icu-config, no)
	if test "$ICU_CONFIG" != "no" ; then
	   ICU_LIBS=`$ICU_CONFIG --ldflags`
	   ICU_IOLIBS=`$ICU_CONFIG --ldflags-icuio`
	   with_icu=yes
	   LIBS="$LIBS $ICU_LIBS $ICU_IOLIBS"
	   AM_CXXFLAGS="$AM_CXXFLAGS -D_ICU_"
	   AM_CFLAGS="$AM_CFLAGS -D_ICU_"
	else
	   echo "*** The icu-config script installed by icu could not be found"
	   echo "*** compiling without ICU support"
	   with_icu=no
	fi
fi


if test x$with_icusword = xyes; then
AM_CXXFLAGS="$AM_CXXFLAGS -D_ICUSWORD_"
AM_CFLAGS="$AM_CFLAGS -D_ICUSWORD_"
fi

if test x$enable_warnings = xyes; then
  AM_CFLAGS="$AM_CFLAGS -Werror"
  AM_CXXFLAGS="$AM_CXXFLAGS -Werror -Woverloaded-virtual"
fi

if test x$enable_profile = xyes; then
  AM_CFLAGS="$AM_CFLAGS -pg"
  AM_CXXFLAGS="$AM_CXXFLAGS -pg"
fi
if test x$enable_profilefn = xyes; then
  AM_CFLAGS="$AM_CFLAGS -g -finstrument-functions"
  AM_CXXFLAGS="$AM_CXXFLAGS -g -finstrument-functions"
  LIBS="$LIBS -g -finstrument-functions -lfnccheck"
fi

# ---------------------------------------------------------------------
# Check for curl for installmgr suport
# ---------------------------------------------------------------------

with_internalftplib=no
if test x$with_curl = xyes; then
    AC_PATH_PROG(CURL_CONFIG, curl-config, no)
    if test "$CURL_CONFIG" = "no" ; then
	echo "*** The curl-config script installed by curl could not be found"
	echo "*** compiling without libcurl support"
	with_curl="no, using internal ftplib"
	with_curl_sftp=no
	with_internalftplib=yes
    else
	echo "curl found - remote install options available"
	CURL_AM_CFLAGS=`$CURL_CONFIG --cflags`
	CURL_LIBS=`$CURL_CONFIG --libs`
	AM_CXXFLAGS="$AM_CXXFLAGS -DCURLAVAILABLE $CURL_AM_CFLAGS"
	AM_CFLAGS="$AM_CFLAGS -DCURLAVAILABLE $CURL_AM_CFLAGS"
	LIBS="$LIBS $CURL_LIBS"
	if test x$with_curl_sftp = xyes; then
		if test x`$CURL_CONFIG --protocols|grep SFTP|wc -l` = x1; then
			AM_CXXFLAGS="$AM_CXXFLAGS -DCURLSFTPAVAILABLE"
			AM_CFLAGS="$AM_CFLAGS -DCURLSFTPAVAILABLE"
		else
			with_curl_sftp=no;
		fi
	fi
    fi
else
	with_curl="no, using internal ftplib"
	with_curl_sftp=no;
	with_internalftplib=yes
fi

if test x$with_cxx11regex = xyes; then
	AM_CXXFLAGS="$AM_CXXFLAGS -DUSECXX11REGEX -std=c++11"
fi

if test x$with_cxx11time = xyes; then
	AM_CXXFLAGS="$AM_CXXFLAGS -DUSECXX11TIME -std=c++11"
fi

if test x$disable_logdebug = xyes; then
	AM_CXXFLAGS="$AM_CXXFLAGS -DSTRIPLOGD"
fi

if test x$disable_loginfo = xyes; then
	AM_CXXFLAGS="$AM_CXXFLAGS -DSTRIPLOGI"
fi

# ---------------------------------------------------------------------
# Check for clucene for lucene searching support
# ---------------------------------------------------------------------

# NOTE the $libdir hack at the end of the c[xx]flags.  Apparently F16 finds that clucene is not multilib-save and places some include files in /usr/lib[64]/
with_clucene=no
if test "x$CLUCENE2_LIBS" != x; then
   echo "clucene 2.x found - lucene searching options available"
   AM_CXXFLAGS="$AM_CXXFLAGS $CLUCENE2_CFLAGS -DUSELUCENE -DCLUCENE2 -I$libdir"
   AM_CFLAGS="$AM_CFLAGS $CLUCENE2_CFLAGS -DUSELUCENE -DCLUCENE2 -I$libdir"
   LIBS="$LIBS $CLUCENE2_LIBS"
   with_clucene="yes 2.x"
   CLUCENE_LIBS="$CLUCENE_LIBS $CLUCENE2_LIBS"
else
if test "x$CLUCENE_LIBS" != x; then
   echo "lucene 0.x found - lucene searching options available"
   AM_CXXFLAGS="$AM_CXXFLAGS $CLUCENE_CXXFLAGS -DUSELUCENE -I$libdir"
   AM_CFLAGS="$AM_CFLAGS -DUSELUCENE -I$libdir"
   LIBS="$LIBS $CLUCENE_LIBS"
   with_clucene="yes 0.x"
else
   echo "lucene searching options not available"
fi
fi

if test x$with_xapian = xyes; then
	AC_LANG_CPLUSPLUS
	AC_CHECK_LIB(xapian,main,,with_xapian="no")
else
	with_xapian="no"
fi

if test x$with_icuregex = xyes; then
	if test x$with_icu = xno; then
		with_icuregex="requested; but using ICU not enabled"
	else
		AM_CFLAGS="$AM_CFLAGS -DUSEICUREGEX"
		AM_CXXFLAGS="$AM_CXXFLAGS -DUSEICUREGEX"
	fi
else
	with_icuregex="no"
fi

if test x$with_xapian = xyes; then
	AM_CFLAGS="$AM_CFLAGS -DUSEXAPIAN"
	AM_CXXFLAGS="$AM_CXXFLAGS -DUSEXAPIAN"
	if test x$with_clucene = xno; then
		with_clucene="no"
	else
		with_clucene="$with_clucene; but using XAPIAN instead"
	fi
fi

AC_CHECK_FUNCS(vsnprintf, [have_vsnprintf="yes"])

# ---------------------------------------------------------------------
# Alter global conf directory only if not /etc
# ---------------------------------------------------------------------

if test "x$sysconfdir" = "x/etc"; then
  dir_confdef="no"
else
  dir_confdef="yes"
fi

changequote(<<,>>)
V1=`expr $VERSION : '\([0-9]*\)\.[0-9]*\.*[0-9]*\.*[0-9]*'`
V2=`expr $VERSION : '[0-9]*\.\([0-9]*\)\.*[0-9]*\.*[0-9]*'`
V3=`expr $VERSION : '[0-9]*\.[0-9]*\.*\([0-9]*\)\.*[0-9]*'`
V4=`expr $VERSION : '[0-9]*\.[0-9]*\.*[0-9]*\.*\([0-9]*\)'`
changequote([,])

SWORD_VERSION_STR=$VERSION
SWORD_VERSION_MAJOR=$V1
SWORD_VERSION_MINOR=$V2
SWORD_VERSION_MICRO=$V3
if test "$V4" = "" ; then V4=0; fi
SWORD_VERSION_NANO=$V4

if test "$V2" -le 9 ; then V2=0$V2 ; fi
if test "$V3" -le 9 ; then V3=00$V3 ; elif test "$V3" -le 99 ; then V3=0$V3 ; fi
if test "$V4" -le 9 ; then V4=00$V4 ; elif test "$V4" -le 99 ; then V4=0$V4 ; fi
SWORD_VERSION_NUM=$V1$V2$V3$V4

echo "checking compiler warnings"
m4_foreach(WARN_CHECK, [-Wno-address, -Wno-nonnull-compare],
[
	saved_CXXFLAGS="$CXXFLAGS"
	CXXFLAGS="$CXXFLAGS WARN_CHECK"
	AC_LANG_PUSH([C++])
	AC_COMPILE_IFELSE([AC_LANG_PROGRAM([])],[WARNING_CHECK=WARN_CHECK],[WARNING_CHECK=;])
	AC_LANG_POP([C++])
	CXXFLAGS="$saved_CXXFLAGS"
	echo "WARNING_CHECK: $WARNING_CHECK"
	WARNINGS_OFF="$WARNINGS_OFF $WARNING_CHECK"
])

echo "WARNINGS_OFF: $WARNINGS_OFF"
AM_CXXFLAGS="$AM_CXXFLAGS $WARNINGS_OFF"
 

AC_SUBST(SWORD_VERSION_NUM)
AC_SUBST(SWORD_VERSION_STR)
AC_SUBST(SWORD_VERSION_MAJOR)
AC_SUBST(SWORD_VERSION_MINOR)
AC_SUBST(SWORD_VERSION_MICRO)
AC_SUBST(SWORD_VERSION_NANO)



# ---------------------------------------------------------------------
# Substitute variables into makefiles
# ---------------------------------------------------------------------
AC_SUBST(with_zlib)
AC_SUBST(with_bzip2)
AC_SUBST(with_xz)
AC_SUBST(with_icu)
AC_SUBST(with_icusword)
AC_SUBST(with_conf)
AC_SUBST(dir_confdef)
AC_SUBST(CC)
AC_SUBST(enable_debug)
AC_SUBST(enable_profile)

AC_SUBST(AM_CXXFLAGS)
AC_SUBST(AM_CFLAGS)

AC_SUBST(target_cpu)
AC_SUBST(target_vendor)
AC_SUBST(target_os)

AC_SUBST(target_system)
AC_SUBST(target_mingw32)

AC_SUBST(CURL_LIBS)
AC_SUBST(ICU_LIBS)
AC_SUBST(ICU_IOLIBS)
AC_SUBST(CLUCENE_LIBS)


# ---------------------------------------------------------------------
# Conditional variables
# ---------------------------------------------------------------------

AM_CONDITIONAL(HAVE_LIBZ, test x$with_zlib = xyes)
AM_CONDITIONAL(HAVE_BZIP2, test x$with_bzip2 = xyes)
AM_CONDITIONAL(HAVE_XZ, test x$with_xz = xyes)
AM_CONDITIONAL(HAVE_ICU, test x$with_icu = xyes)
AM_CONDITIONAL(HAVE_ICUSWORD, test x$with_icusword = xyes)
AM_CONDITIONAL(HAVE_VSNPRINTF, test x$have_vsnprintf = xyes)

AM_CONDITIONAL(USELUCENE, test "x$with_clucene" != xno)
AM_CONDITIONAL(SHAREDLIB, test x$enable_shared = xyes)
AM_CONDITIONAL(INSTCONF, test x$with_conf = xyes)
AM_CONDITIONAL(USECXX11REGEX, test x$with_cxx11regex = xyes)
AM_CONDITIONAL(USEICUREGEX, test x$with_icuregex = xyes)
AM_CONDITIONAL(USECXX11TIME, test x$with_cxx11time = xyes)
AM_CONDITIONAL(STRIPLOGD, test x$disable_logdebug = xyes)
AM_CONDITIONAL(STRIPLOGI, test x$disable_loginfo = xyes)
AM_CONDITIONAL(WITHCURL, test x$with_curl = xyes)
AM_CONDITIONAL(WITHGAPI, test x$with_gapi = xyes)
AM_CONDITIONAL(WITHCURLSFTP, test x$with_curl_sftp = xyes)
AM_CONDITIONAL(INTERNALFTPLIB, test x$with_internalftplib = xyes)
AM_CONDITIONAL(USE_INTERNAL_REGEX, test x$with_internalregex = xyes)
AM_CONDITIONAL(CONFDEF, test x$dir_confdef = xyes)
AM_CONDITIONAL(USE_PKGCONF, test x$use_pkgconfig = xyes)
AM_CONDITIONAL(BUILDTESTS, test x$enable_tests = xno)
AM_CONDITIONAL(BUILDUTILS, test x$enable_utilities = xyes)
AM_CONDITIONAL(BUILDEXAMPLES, test x$enable_examples = xno)

# ---------------------------------------------------------------------
# Final output
# ---------------------------------------------------------------------
# AC_CONFIG_FILES(Makefile utilities/Makefile  sword.pc include/swversion.h sword.spec)
AC_CONFIG_FILES(Makefile lib/Makefile utilities/Makefile sword.pc include/swversion.h sword.spec)
AC_OUTPUT

echo
echo
echo "Configuration:"
echo     ""
echo     " Settings:"
echo     "     LIBDIR:               $libdir"
echo     "     DEBUG:                $enable_debug"
echo     "     PROFILE:              $enable_profile"
echo     "     BUILD TESTS:          $enable_tests"
echo     "     BUILD EXAMPLES:       $enable_examples"
echo     "     BUILD UTILITIES:      $enable_utilities"
echo     "     STRIP LOG DEBUG:      $disable_logdebug"
echo     "     STRIP LOG INFO:       $disable_loginfo"
echo     ""
echo     " Dependencies for standard use:"
echo     "     REGEX:                $have_systemregex"
echo     "     ZLIB:                 $with_zlib"
echo     "     LIBICU:               $with_icu"
echo     "     LIBCURL:              $with_curl"
echo     "     CLUCENE-CORE:         $with_clucene"
echo     ""
echo     " Optional / Experimental:"
echo     "     LIBCURL SFTP:         $with_curl_sftp"
echo     "     BZIP2:                $with_bzip2"
echo     "     XZ:                   $with_xz"
echo     "     ICUSWORD:             $with_icusword"
echo     "     ICU-REGEX:            $with_icuregex"
echo     "     CXX11-REGEX:          $with_cxx11regex"
echo     "     CXX11-TIME:           $with_cxx11time"
echo     "     XAPIAN-CORE:          $with_xapian"
echo     "     GAPI:                 $with_gapi"


