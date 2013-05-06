#!/usr/bin/perl
#
# get_rotateinfo.pl
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#
use CGI qw(param);
use JSON::PP;

#use Data::Dumper;
#use CGI::Carp qw(fatalsToBrowser); # デバッグ用
require 'sdn.pm';

my $conflist = &sdnLib::getConf('../conf/network.conf');

# 要入力チェック
my %posinfo = ();
$posinfo{type} = param('type');
$posinfo{type} = ($posinfo{type} eq '1') ? 'switch_list' : 'host_list';
$posinfo{objid} = param('objid');
$posinfo{rad} = param('rad');
$posinfo{name} = param('name');
$posinfo{pos} = param('pos');

if (exists $conflist->{$posinfo{type}}->{$posinfo{objid}}) {
	$conflist->{$posinfo{type}}->{$posinfo{objid}}->{posidx} = $posinfo{pos}-1;
	&sdnLib::setConf($conflist, '../conf/network.conf');
}

#die sprintf("%s", Data::Dumper->Dump([$conflist,], ["*list",]));
my $ret = 0;
print <<END_OF_LINE;
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

END_OF_LINE

if ($ret) {
	print '{"ret": 1}'."\n";
} else {
	print '{"ret": 0}'."\n";
}