#
# get_rotateinfo.pl
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../MIT-LICENSE.txt)

# file: runme.pl
use lib qw (/usr/local/www/data/nox/webgl/pm/lib/perl5/);
use myprimitive;
use Data::Dumper;

# Usage: $0 startx, starty, startz, endx, endy, endz
# perl get_rotateinfo.pl 1.545085 0 -4.75528 -3.870705 2.90446 -1.25767
# [-147.144933, 0, 1, 0],[28.204428, 0, 0, 1],

# Create a couple of a vectors

if (@ARGV != 6) {
	print "Usage: $0 startx, starty, startz, endx, endy, endz\n";
	exit 1;
}

#width=1: color=yellow: src=1.545085, 0, -4.75528: dst=-3.870705, 2.90446, -1.25767:       SW01-SW02
#width=1: color=gray: src=-3.870705, 2.90446, -1.25767: dst=1.469465, -4.330125, 2.022545: SW02-SW03
#width=1: color=yellow: src=1.545085, 0, -4.75528: dst=1.469465, -4.330125, 2.022545:      SW01-SW03
#$s = example::new_Vector(1.545085, 0, -4.75528);
#$e = example::new_Vector(-3.870705, 2.90446, -1.25767);
#[-147.144933, 0, 1, 0],[28.204428, 0, 0, 1],
$s = myprimitive::new_Vector($ARGV[0], $ARGV[1], $ARGV[2]);
$e = myprimitive::new_Vector($ARGV[3], $ARGV[4], $ARGV[5]);
# perl -I/root/work/swig/blib/arch/auto/example/ runme.pl 1.545085 0 -4.75528 -3.870705 2.90446 -1.25767
#[-147.144933, 0, 1, 0],[28.204428, 0, 0, 1],

#print "I just created the following vectors\n";
#example::vector_print($s);
#example::vector_print($e);

myprimitive::rotate_arrow($s, $e);
print "\n";

# Now call some of our functions

#print "\nNow I'm going to compute the dot product\n";
#$d = example::dot_product($v,$w);
#print "dot product = $d (should be 68)\n";
#
## Add the vectors together
#
#print "\nNow I'm going to add the vectors together\n";
#$r = example::vector_add($v,$w);
#example::vector_print($r);
#print "The value should be (11,13,15)\n";
#
#printf "%s", Data::Dumper->Dump([\$r],[*list]);

# Now I'd better clean up the return result r

#print "\nNow I'm going to clean up the return result\n";
#example::free($r);
myprimitive::free($s);
myprimitive::free($e);

#print "Good\n";






