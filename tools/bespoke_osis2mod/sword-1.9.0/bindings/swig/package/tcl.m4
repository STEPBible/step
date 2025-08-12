#--------------------------------------------------------------------
#	Try to locate the Tcl package
#--------------------------------------------------------------------

AC_DEFUN([SW_FIND_TCL],
[


TCLINCLUDE=
TCLLIB=
TCLPACKAGE=
#TCLSWIG=

AC_ARG_WITH(tclconfig,[  --with-tclconfig=path  Set location of tclConfig.sh],
        with_tclconfig="$withval")
AC_ARG_WITH(tcl,[  --with-tcl=path         Set location of Tcl package],[
	TCLPACKAGE="$withval"], [TCLPACKAGE=])
AC_ARG_WITH(tclincl,[  --with-tclincl=path     Set location of Tcl include directory],[
	TCLINCLUDE="-I$withval"], [TCLINCLUDE=])
AC_ARG_WITH(tcllib,[  --with-tcllib=path      Set location of Tcl library directory],[
	TCLLIB="-L$withval"], [TCLLIB=])

AC_MSG_CHECKING([for Tcl configuration])
# First check to see if --with-tclconfig was specified.
if test x"${with_tclconfig}" != x ; then
   if test -f "${with_tclconfig}/tclConfig.sh" ; then
      TCLCONFIG=`(cd ${with_tclconfig}; pwd)`
   else
      AC_MSG_ERROR([${with_tcl} directory doesn't contain tclConfig.sh])
   fi
fi
# check in a few common install locations
if test x"${TCLCONFIG}" = x ; then
    for i in `ls -d /usr/lib 2>/dev/null` \
	     `ls -d ${prefix}/lib 2>/dev/null` \
	    `ls -d /usr/local/lib 2>/dev/null` ; do
	if test -f "$i/tclConfig.sh" ; then
	    TCLCONFIG=`(cd $i; pwd)`
	    break
	fi
    done
fi
if test x"${TCLCONFIG}" = x ; then
    AC_MSG_RESULT(no)
else
    AC_MSG_RESULT(found $TCLCONFIG/tclConfig.sh)
    . $TCLCONFIG/tclConfig.sh
    TCLINCLUDE=-I$TCL_PREFIX/include
    TCLLIB=$TCL_LIB_SPEC
fi

if test -z "$TCLINCLUDE"; then
   if test -n "$TCLPACKAGE"; then
	TCLINCLUDE="-I$TCLPACKAGE/include"
   fi
fi

if test -z "$TCLLIB"; then
   if test -n "$TCLPACKAGE"; then
	TCLLIB="-L$TCLPACKAGE/lib -ltcl"
   fi
fi

AC_MSG_CHECKING(for Tcl header files)
if test -z "$TCLINCLUDE"; then
AC_TRY_CPP([#include <tcl.h>], , TCLINCLUDE="")
if test -z "$TCLINCLUDE"; then
	dirs="$prefix/include /usr/local/include /usr/include /opt/local/include"
	for i in $dirs ; do
		if test -r $i/tcl.h; then
			AC_MSG_RESULT($i)
			TCLINCLUDE="-I$i"
			break
		fi
	done
fi
if test -z "$TCLINCLUDE"; then
#	TCLINCLUDE="-I/usr/local/include"
    	AC_MSG_RESULT(not found)
fi
else
        AC_MSG_RESULT($TCLINCLUDE)
fi

AC_MSG_CHECKING(for Tcl library)
if test -z "$TCLLIB"; then
dirs="$prefix/lib /usr/local/lib /usr/lib /opt/local/lib"
for i in $dirs ; do
	if test -r $i/libtcl.a; then
	    AC_MSG_RESULT($i)
	    TCLLIB="-L$i -ltcl"
	    break
	fi
done
if test -z "$TCLLIB"; then
	AC_MSG_RESULT(not found)
#	TCLLIB="-L/usr/local/lib"
fi
else
AC_MSG_RESULT($TCLLIB)
fi

# Only cygwin (Windows) needs the library for dynamic linking
case $ac_sys_system/$ac_sys_release in
CYGWIN*) TCLDYNAMICLINKING="$TCLLIB";;
*)TCLDYNAMICLINKING="";;
esac

AC_SUBST(TCLINCLUDE)
AC_SUBST(TCLLIB)
AC_SUBST(TCLDYNAMICLINKING)
#AC_SUBST(TCLSWIG)

])
