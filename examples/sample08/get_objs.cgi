#!/usr/bin/perl
#
# get_otherobjs.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#
use CGI qw(param);
use JSON::PP;
#use Data::Dumper;
#use CGI::Carp qw(fatalsToBrowser); 
require '../../lib/cgi/sdn.pm';

# Initialize
my $MAX_POS_NUM = 642;
my $pos_array = &sdnLib::getPosPool('./conf/pos642.json');
my $outinfo = {
	objList => {},
	linkList => [],
};
my $objid = 0;
my $linkinfo = [];

# -----------------------------------------------
# Main Routine
# -----------------------------------------------
my $conflist = &sdnLib::getConf(&getConfFile());
&getControllerObjects();
&getSwitchObjects();
&getHostObjects();
&connectSwitches();

my $data = encode_json $outinfo ;
print <<END_OF_LINE;
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

$data
END_OF_LINE
exit(0);

# -----------------------------------------------
# Sub Routines
# -----------------------------------------------
# get controller objects
sub getControllerObjects {
	foreach my $n (@{$conflist->{controller_list}}) {
		$outinfo->{objList}->{$objid} = {
			origin => $n->{origin},
			'pos' => [0,0,0], 
			name => $n->{name},
			texture => 0, 
			rad => $n->{rad},
			otherinfo => { ipaddr => $n->{ipaddr} },
		};
		$objid++;
	}
}

# get switch objects
sub getSwitchObjects {
	#while (my ($k, $v) = each (%{$conflist->{switch_list}})) {
	foreach my $k (sort {$a cmp $b } keys (%{$conflist->{switch_list}})) {
		my $v = $conflist->{switch_list}->{$k};
		my $org = [0,0,0];
		my $pos = (exists $v->{apos}) ? 
			[$v->{apos}->[0]*$v->{rad}, $v->{apos}->[1]*$v->{rad}, $v->{apos}->[2]*$v->{rad}] : 
			&getPos($v->{posidx}, $v->{rad});
		$outinfo->{objList}->{$objid} = {
			origin => $org,
			'pos' => $pos, 
			name => $v->{name},
			texture => 1, 
			rad => $v->{rad},
			otherinfo => { dpid => $k },
		};
		my $dst = [];
		map { $dst->[$_] = $org->[$_] + $pos->[$_]; } (0..2);
		&pushLink('gray', $org, $dst);
		foreach (@{$v->{neighbor_list}}) {
			push @$linkinfo, {
				s_id => $k, s_pos => $dst, d_id => $_->{dpid}, color => $_->{color},
			};
		}
		$v->{pos} = $dst;
		$objid++;
	}
}

# get host objects
sub getHostObjects {
	while (my ($k, $v) = each (%{$conflist->{host_list}})) {
		my $org = (exists $conflist->{switch_list}->{$v->{neighbor_obj}}->{apos}) ? 
			$conflist->{switch_list}->{$v->{neighbor_obj}}->{pos} : &getPos(
				$conflist->{switch_list}->{$v->{neighbor_obj}}->{posidx}, 
				$conflist->{switch_list}->{$v->{neighbor_obj}}->{rad},
		);
		my $pos = (exists $v->{rpos}) ? 
			[$v->{rpos}->[0]*$v->{rad}, $v->{rpos}->[1]*$v->{rad}, $v->{rpos}->[2]*$v->{rad}] :
			&getPos($v->{posidx}, $v->{rad});
		$outinfo->{objList}->{$objid} = {
			otherinfo => { 
				swport => $v->{swport}, 
				swdpid => $v->{neighbor_obj}, 
				ipaddr => $v->{ipaddr},
				hwaddr => $k,
			},
			origin => $org,
			'pos' => $pos, 
			name => $v->{name},
			texture => 2, 
			rad => $v->{rad},
		};
		my $dst = [];
		map { $dst->[$_] = $org->[$_] + $pos->[$_]; } (0..2);
		&pushLink('yellow', $org, $dst);
		$objid++;
	}
}

# connect respective switches
sub connectSwitches {
	my %ckdup = ();
	foreach (@$linkinfo) {
		next if (exists $ckdup{$_->{d_id}.':'.$_->{s_id}});
		&pushLink($_->{color}, $_->{s_pos}, 
			$conflist->{switch_list}->{$_->{d_id}}->{pos});
		$ckdup{$_->{s_id}.':'.$_->{d_id}}++;
	}
}

# push link objects
sub pushLink {
	my $color = shift;
	my $src = shift;
	my $dst = shift;
	push @{$outinfo->{linkList}}, {
		color => $color, width => 1, src => $src, dst => $dst,
		rot => &sdnLib::getRot($src, $dst, 
			'perl -I../../lib/cgi/lib/perl5 ../../lib/cgi/get_rotateinfo.pl'),
	};
}

# get object position
sub getPos {
	my $id = shift;
	my $rad = shift;
	my $pos = $pos_array->[$id % $MAX_POS_NUM];
	return [$pos->[0] * $rad, $pos->[1] * $rad, $pos->[2] * $rad ] ;
}

sub getConfFile {
	my $id = param('id');
	my $file = './conf/network03.conf';
	if ($id eq '2') {
		$file = './conf/network02.conf';
	} elsif ($id eq '4') {
		$file = './conf/network04.conf';
	} elsif ($id eq '8') {
		$file = './conf/network08.conf';
	} elsif ($id eq '27') {
		$file = './conf/network27.conf';
	}
	return $file;
}

__END__
