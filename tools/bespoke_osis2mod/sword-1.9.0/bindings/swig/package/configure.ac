# ---------------------------------------------------------------------
# Initialisation
# ---------------------------------------------------------------------
AC_INIT([swordbindings],[1.6.2])
AC_CONFIG_SRCDIR(sword.i)
AC_PREREQ(2.59)
AC_REVISION($Revision: 3063 $)
AM_INIT_AUTOMAKE
AC_CONFIG_MACRO_DIR([m4])

# ---------------------------------------------------------------------
# Check Programs
# ---------------------------------------------------------------------
AC_LANG(C++)
AC_PROG_CC
AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_LIBTOOL
SW_PROG_SWIG

# ---------------------------------------------------------------------
# Check libraries
# ---------------------------------------------------------------------
PKG_PROG_PKG_CONFIG
PKG_CHECK_MODULES([SWORD], [sword >= 1.5.7],,true)

# ---------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------
AM_MAINTAINER_MODE
AC_ARG_ENABLE(swig, [--disable-swig do not run swig to generate input files], enable_swig=$enableval, enable_swig=no)
AM_CONDITIONAL([RUNSWIG], [test x$enable_swig = xyes])

# ---------------------------------------------------------------------
# Check Scripting languages
# ---------------------------------------------------------------------
SW_FIND_PERL
SW_FIND_PYTHON
SW_FIND_PHP4
SW_FIND_TCL

# ---------------------------------------------------------------------
# Final output
# ---------------------------------------------------------------------
AC_CONFIG_FILES(Makefile)
AC_OUTPUT
