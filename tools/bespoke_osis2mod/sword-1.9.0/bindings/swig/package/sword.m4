##	-*- autoconf -*-
dnl This file was created by Joachim Ansorg <jansorg@gmx.de>
dnl It provides macord for the autoconf package to find the Sword library on your system.

dnl ----------------------------------------------------------------------
dnl		Check wheter to use static linking
dnl		first parameter is the required version
dnl		second is whether to use static sword library
dnl ----------------------------------------------------------------------
AC_DEFUN([SW_CHECK_SWORD],
[
dnl AC_MSG_CHECKING([for a Sword installation])

dnl The option for the configure script
AC_ARG_WITH(sword-dir,
[  --with-sword-dir=DIR     Path where Sword is being installed (default=/usr) ],
[
  ac_sword_dir=$withval
],ac_sword_dir=/usr
)

AC_ARG_ENABLE(static-sword,
[  --enable-static-sword    Link to the static Sword library],
 	ac_static_sword="YES",
 	[ ac_static_sword="$2" ]
)

dnl try to find Sword library files
AC_MSG_CHECKING([for Sword library files])
AC_REQUIRE([AC_FIND_ZLIB])
ac_sword_library_dirs="$ac_sword_dir/lib /usr/lib64 /usr/lib /usr/lib/sword /usr/local/lib /usr/local/lib/sword /usr/local/sword/lib"

if test "$ac_static_sword" = "YES"; then
	SEARCH_LIBS="libsword.a";
else
	SEARCH_LIBS="libsword.a libsword.so";
fi


AC_CACHE_VAL(ac_cv_sword_libdir, AC_FIND_FILE($SEARCH_LIBS, $ac_sword_library_dirs, ac_cv_sword_libdir))

if test "$ac_cv_sword_libdir" = "NO"; then
  AC_MSG_ERROR(SWORD library not found. Try to use configure with --with-sword-dir=/your/SWORD/path!);
fi

if test "$ac_static_sword" = "YES"; then
	LIB_SWORD="$ac_cv_sword_libdir/libsword.a";
else
	LIB_SWORD="-L$ac_cv_sword_libdir -lsword";
fi

#AC_SUBST(SWORD_LIBRARY_PATH)
AC_SUBST(LIB_SWORD)
all_libraries="$all_libraries -L$ac_cv_sword_libdir"

if test "$ac_static_sword" = "YES"; then
	MESSAGE="static library $ac_cv_sword_libdir/libsword.a";
else
	MESSAGE="$ac_cv_sword_libdir";
fi
AC_MSG_RESULT([$MESSAGE])



dnl -- try to find Swords include files --
AC_MSG_CHECKING([for Sword include files])
ac_sword_include_dirs="$ac_sword_dir/include/sword $ac_sword_dir/include /usr/include/sword /usr/include /usr/local/include/sword /usr/local/include /usr/local/sword/include /usr/local/sword/include/sword"

AC_CACHE_VAL(ac_cv_sword_incdir, AC_FIND_FILE(swmgr.h, $ac_sword_include_dirs, ac_cv_sword_incdir))

if test "$ac_cv_sword_incdir" = "NO"; then
	AC_MSG_ERROR([The Sword include file files were not found.
Please try to use configure with --with-sword-dir=/your/SWORD/path !
])
fi

SWORD_INCLUDES="-I$ac_cv_sword_incdir"
SWORD_INCLUDE_DIR="$ac_cv_sword_incdir"
AC_SUBST(SWORD_INCLUDES)
AC_SUBST(SWORD_INCLUDE_DIR)
all_includes="$all_includes -I$ac_cv_sword_incdir"

AC_MSG_RESULT([$ac_cv_sword_incdir])



dnl -- check if Sword matches the minimum version --
AC_MSG_CHECKING([if you have Sword $1 or later])

AC_CACHE_VAL(ac_cv_installed_sword_version,
[
AC_LANG_SAVE
AC_LANG_CPLUSPLUS
ac_LD_LIBRARY_PATH_safe=$LD_LIBRARY_PATH
ac_LIBRARY_PATH="$LIBRARY_PATH"
ac_cxxflags_safe="$CXXFLAGS"
ac_ldflags_safe="$LDFLAGS"
ac_libs_safe="$LIBS"

CXXFLAGS="$CXXFLAGS -I$"
LDFLAGS="$LDFLAGS -L$ac_cv_sword_libdir"
LIBS="$LIB_SWORD -lz"
LD_LIBRARY_PATH="$ac_cv_sword_libdir"
export LD_LIBRARY_PATH
LIBRARY_PATH=
export LIBRARY_PATH

cat > conftest.$ac_ext <<EOF
#include <iostream.h>
#include <swversion.h>
using std::cout;
using std::endl;
using sword::SWVersion;

int main(int argc, char* argv[]) {
	if (argc != 2) {
		cout << SWVersion::currentVersion << endl;
	}
	else if (argc == 2) 
	{
		if (SWVersion(&argv[[1]]) < SWVersion::currentVersion || SWVersion(&argv[[1]]) == SWVersion::currentVersion)
		{
			cout << 0 << endl;
			return 0;
		}
		else	
		{
			cout << 1 << endl;
			return 1; //version not recent enough
		}
	}
	return 0;
}
EOF

ac_link='${CXX-g++} -o conftest $CXXFLAGS $all_includes $CPPFLAGS $LDFLAGS conftest.$ac_ext $LIBS 1>&5'
if AC_TRY_EVAL(ac_link) && test -s conftest; then
	if test -x conftest; then
		eval ac_cv_installed_sword_version=`./conftest 2>&5`
		echo "configure: ac_cv_installed_sword_version=$ac_cv_installed_sword_version" >&AC_FD_CC
		eval sword_test_returncode=`./conftest $1 2>&5`;
		echo "configure: sword_test_returncode=$sword_test_returncode" >&AC_FD_CC
	fi
else
  echo "configure: failed program was:" >&AC_FD_CC
  cat conftest.$ac_ext >&AC_FD_CC
fi

rm -f conftest*
CXXFLAGS="$ac_cxxflags_safe"
LDFLAGS="$ac_ldflags_safe"
LIBS="$ac_libs_safe"

LD_LIBRARY_PATH="$ac_LD_LIBRARY_PATH_safe"
export LD_LIBRARY_PATH
LIBRARY_PATH="$ac_LIBRARY_PATH"
export LIBRARY_PATH
AC_LANG_RESTORE
])

right_version="ok";
if test "x$sword_test_returncode" = "x1"; then
	echo "configure: changing right_version" >&AC_FD_CC
	right_version="wrong version";
fi;
	
AC_MSG_RESULT([$ac_cv_installed_sword_version])
echo "configure: right_version=$right_version" >&AC_FD_CC
if test "x$right_version" != "xok"; then
        AC_MSG_ERROR([Your Sword installation is not recent enough! $sword_test_returncode Please
upgrade to version $1!]);
fi;

])
