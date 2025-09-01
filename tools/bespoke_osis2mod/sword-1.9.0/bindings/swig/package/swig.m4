#----------------------------------------------------------------
# Look for SWIG
#----------------------------------------------------------------

AC_DEFUN([SW_PROG_SWIG],
[

AC_ARG_WITH(swigbin,[  --with-swigbin=path        Set location of swig executable],[ SWIGBIN="$withval"], [SWIGBIN=])
AC_ARG_ENABLE(swig,[  --enable-swig=path       Run swig to generate new source default=no],, enable_swig=no)

if test -z "$SWIGBIN"; then
AC_PATH_PROG(SWIG, swig)
else
AC_PATH_PROG(SWIG, swig, "not found", $SWIGBIN)
fi

runswig=true
if test x"$SWIG"="xnot found"; then
	runswig=false
fi
if test x"$enable_swig"="xno"; then
	runswig=false
fi

AM_CONDITIONAL(RUNSWIG, test x$runswig = xtrue)

#ac_cv_swigversion=``

])
