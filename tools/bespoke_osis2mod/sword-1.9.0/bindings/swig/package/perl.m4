#----------------------------------------------------------------
# Look for Perl5
#----------------------------------------------------------------

AC_DEFUN([SW_FIND_PERL],
[


PERLBIN=
PERLSWIG=

AC_ARG_WITH(perl,[  --with-perl=path       Set location of Perl5 executable],[ PERLBIN="$withval"], [PERLBIN=])

# First figure out what the name of Perl5 is

if test -z "$PERLBIN"; then
AC_PATH_PROGS(PERL, perl perl5.6.1 perl5.6.0 perl5.004 perl5.003 perl5.002 perl5.001 perl5 perl)
else
AC_PATH_PROG(PERL, perl, , $PERLBIN)
#PERL="$PERLBIN"
fi


AC_MSG_CHECKING(for Perl5 header files)
if test -n "$PERL"; then
	PERL5DIR=`($PERL -e 'use Config; print $Config{archlib};') 2>/dev/null`
	if test "$PERL5DIR" != ""; then
		dirs="$PERL5DIR $PERL5DIR/CORE"
		PERL5EXT=none
		PERLBUILD=perl_make
		for i in $dirs; do
			if test -r $i/perl.h; then
				AC_MSG_RESULT($i)
				PERL5EXT="$i"
				break;
			fi
		done
		if test "$PERL5EXT" = none; then
			PERL5EXT="$PERL5DIR/CORE"
			AC_MSG_RESULT(could not locate perl.h...using $PERL5EXT)
		fi

		AC_MSG_CHECKING(for Perl5 library)
		PERL5LIB=`($PERL -e 'use Config; $_=$Config{libperl}; s/^lib//; s/$Config{_a}$//; print $_') 2>/dev/null`
		if test "$PERL5LIB" = "" ; then
			AC_MSG_RESULT(not found)
		else
			AC_MSG_RESULT($PERL5LIB)
		fi
	else
		AC_MSG_RESULT(unable to determine perl5 configuration)
		PERL5EXT=$PERL5DIR
	fi
else
       	AC_MSG_RESULT(could not figure out how to run perl5)
#	PERL5EXT="/usr/local/lib/perl/archname/5.003/CORE"
fi

# Only cygwin (Windows) needs the library for dynamic linking
case $ac_sys_system/$ac_sys_release in
CYGWIN*) PERL5DYNAMICLINKING="-L$PERL5EXT -l$PERL5LIB";;
*)PERL5DYNAMICLINKING="";;
esac


AC_SUBST(PERL5EXT)
AC_SUBST(PERL5DYNAMICLINKING)
AC_SUBST(PERL5LIB)
AC_SUBST(PERLBUILD)

])
