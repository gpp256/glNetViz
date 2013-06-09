#!/usr/bin/perl
#
# get_objpos.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#

use CGI qw(param);
use JSON::PP;

# ------------------------------------------
# main routine
# ------------------------------------------
my $id = param('id');
my $fromlat = param('fromlat');
my $fromlon = param('fromlon');
my $tolat = param('tolat');
my $tolon = param('tolon');

$id = &ckNum($id);
$fromlat = &ckNum($fromlat); 
$fromlon = &ckNum($fromlon);
$tolat = &ckNum($tolat); 
$tolon = &ckNum($tolon);

my $outinfo = decode_json &get_result();
$outinfo->{id} = $id;
$outinfo->{ret} = 0;
my $data = encode_json $outinfo ;
&printResult($data);
exit(0);

# ------------------------------------------
# Sub routines
# ------------------------------------------
sub ckNum {
	my $num = shift;
	$num =~ s/\s+//g; 
	&printResult('{ "ret": 1 }') unless ($num =~ /^(\-?\d+\.?\d*)$/);
	return $1;
};


sub printResult {
	my $lines = shift;
	print <<END_OF_LINE;
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

$lines
END_OF_LINE
	exit(1);
}

sub get_result {
	my @lines = `../../lib/tools/earthmap $fromlat $fromlon $tolat $tolon 2>/dev/null`;
	return join('', @lines);
}
__END__
if (msg['ret'] != 0) return 0;
g.atkinfo[msg['id']] = {
	rot  : msg['rot'],
	start: msg['start'],
	end  : msg['end'],
	flows: msg['flows']
};
