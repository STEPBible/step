#----------------------------------------------------------------
# Look for Python
#----------------------------------------------------------------

AC_DEFUN([SW_FIND_PYTHON],
[

PYINCLUDE=
PYLIB=
PYPACKAGE=
PYTHONBUILD=

# I don't think any of this commented stuff works anymore

#PYLINK="-lModules -lPython -lObjects -lParser"

#AC_ARG_WITH(py,[  --with-py=path          Set location of Python],[
#	PYPACKAGE="$withval"], [PYPACKAGE=])
#AC_ARG_WITH(pyincl,[  --with-pyincl=path      Set location of Python include directory],[
#	PYINCLUDE="$withval"], [PYINCLUDE=])
#AC_ARG_WITH(pylib,[  --with-pylib=path       Set location of Python library directory],[
#	PYLIB="$withval"], [PYLIB=])

#if test -z "$PYINCLUDE"; then
#   if test -n "$PYPACKAGE"; then
#	PYINCLUDE="$PYPACKAGE/include"
#   fi
#fi

#if test -z "$PYLIB"; then
#   if test -n "$PYPACKAGE"; then
#	PYLIB="$PYPACKAGE/lib"
#   fi
#fi

AC_ARG_WITH(python,[  --with-python=path       Set location of Python executable],[ PYBIN="$withval"], [PYBIN=])

# First figure out the name of the Python executable

if test -z "$PYBIN"; then
AC_PATH_PROGS(PYTHON, $prefix/bin/python python python2.4 python2.3 python2.2 python2.1 python2.0 python1.6 python1.5 python1.4 python)
else
PYTHON="$PYBIN"
fi

if test -n "$PYTHON"; then
    AC_MSG_CHECKING(for Python prefix)
    PYPREFIX=`($PYTHON -c "import sys; print sys.prefix") 2>/dev/null`
    AC_MSG_RESULT($PYPREFIX)
    AC_MSG_CHECKING(for Python exec-prefix)
    PYEPREFIX=`($PYTHON -c "import sys; print sys.exec_prefix") 2>/dev/null`
    AC_MSG_RESULT($PYEPREFIX)


    # Note: I could not think of a standard way to get the version string from different versions.
    # This trick pulls it out of the file location for a standard library file.

    AC_MSG_CHECKING(for Python version)

    # Need to do this hack since autoconf replaces __file__ with the name of the configure file
    filehack="file__"
    PYVERSION=`($PYTHON -c "import string,operator; print operator.getitem(string.split(string.__$filehack,'/'),-2)")`
    AC_MSG_RESULT($PYVERSION)

    # Set the include directory

    AC_MSG_CHECKING(for Python header files)		
    if test -r $PYPREFIX/include/$PYVERSION/Python.h; then
        PYINCLUDE="-I$PYPREFIX/include/$PYVERSION -I$PYEPREFIX/lib/$PYVERSION/config"
    fi
    if test -z "$PYINCLUDE"; then
        if test -r $PYPREFIX/include/Py/Python.h; then
            PYINCLUDE="-I$PYPREFIX/include/Py -I$PYEPREFIX/lib/python/lib"
        fi
    fi
    AC_MSG_RESULT($PYINCLUDE)

    # Set the library directory blindly.   This probably won't work with older versions
    AC_MSG_CHECKING(for Python library)
    dirs="$PYVERSION/config $PYVERSION/lib python/lib"
    for i in $dirs; do
        if test -d $PYEPREFIX/lib/$i; then
           PYLIB="$PYEPREFIX/lib/$i"
	   PYTHONBUILD=python_make
           break
        fi
    done
    if test -z "$PYLIB"; then
        AC_MSG_RESULT(Not found)
    else
        AC_MSG_RESULT($PYLIB)
    fi

    # Check for really old versions
    if test -r $PYLIB/libPython.a; then
         PYLINK="-lModules -lPython -lObjects -lParser"
    else
         PYLINK="-l$PYVERSION"
    fi
fi

# Only cygwin (Windows) needs the library for dynamic linking
case $ac_sys_system/$ac_sys_release in
CYGWIN*) PYTHONDYNAMICLINKING="-L$PYLIB $PYLINK"
         PYINCLUDE="-DUSE_DL_IMPORT $PYINCLUDE"
         ;;
*)PYTHONDYNAMICLINKING="";;
esac


AC_SUBST(PYINCLUDE)
AC_SUBST(PYLIB)
AC_SUBST(PYLINK)
AC_SUBST(PYTHONBUILD)
AC_SUBST(PYTHONDYNAMICLINKING)

])
