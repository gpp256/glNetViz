#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

#AC_PREREQ([2.68])
AC_INIT([glNetViz], [0.92], [@gpp256])
AC_CONFIG_SRCDIR([perl_modules/myprimitive.c])
AC_CONFIG_HEADERS([config.h])

# Checks for programs.
AC_PROG_CC
AC_PROG_INSTALL
#AC_PATH_PROG([CMD_CURL],[curl],AC_MSG_ERROR(curl command not found.))
AC_PATH_PROG([CMD_CURL],[curl],[/usr/bin/curl])
AC_PATH_PROG([CMD_PERL],[perl],[/usr/bin/perl])

# Checks for libraries.

# Checks for header files.
AC_CHECK_HEADERS([stdlib.h string.h math.h perl.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_TYPE_SIZE_T

# Checks for library functions.
AC_FUNC_MALLOC
AC_FUNC_STRTOD
AC_CHECK_FUNCS([memset])
AC_CONFIG_FILES([Makefile
                 perl_modules/Makefile.PL
                 examples/sample08/get_objs.cgi
                 examples/sample09/get_objpos.cgi
                 examples/sample10/change_objpos.cgi
                 examples/sample10/get_objs.cgi
                 examples/sample10/init.cgi
                 lib/cgi/change_objpos.cgi
                 lib/cgi/get_otherobjs.cgi
                 lib/cgi/get_rotateinfo.pl
                 lib/cgi/get_rotation_array.cgi
                 lib/cgi/sdn.pm
                 lib/cgi/get_sdnobjs.cgi
                 tools/Makefile
])
AC_OUTPUT
