#!/usr/bin/perl
#
# get_rotation_array.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#

use CGI qw(param);
use JSON::PP;
#use CGI::Carp qw(fatalsToBrowser); 
#use Data::Dumper;

my $flow_id = param('id');
my $src = param('src');
my $dst = param('dst');

$src =~ s/\s+//g;
$dst =~ s/\s+//g;

if ($flow_id eq '' || $flow_id =~ /[^\d]/ || $flow_id < 0) {
	&printResult('{ "ret": 1 }'); exit 1;
}

my @s_pos = split(/,/, $src) ;
my @d_pos = split(/,/, $dst) ;

if (@s_pos != 3 || @d_pos != 3 ) {
	&printResult('{ "ret": 2 }'); exit 2;
} else {
	foreach (0..2) {
		if (&ckNum($s_pos[$_]) || &ckNum($d_pos[$_])) {
			&printResult('{ "ret": 3 }'); exit 3;
		}
	}
}

my $outinfo = { id => $flow_id, rot => &getRot(\@s_pos, \@d_pos), ret => 0 };
#die sprintf("%s", Data::Dumper->Dump([$outinfo,], ["*list",]));
my $data = encode_json $outinfo ;
&printResult($data);
exit 0;

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
}


sub ckNum {
	my $num = shift;
	return 1 if ($num =~ /[^\-\d\.]/);
	return 0;
};

sub getRot {
    my $src = shift;
	my $dst = shift;
	my $cmd = 'perl get_rotateinfo.pl';
	my @result = `$cmd $src->[0] $src->[1] $src->[2] $dst->[0] $dst->[1] $dst->[2]`;
	chomp($result);
	my $rot = [];
	foreach (@result) {
		chomp;
		s/\s+//g;
		next if (/[^\-,\d\.]/);
		my @cols = split(/,/, $_);
		push @$rot, \@cols;
	}
	return $rot;
}

__END__
