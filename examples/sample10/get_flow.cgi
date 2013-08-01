#!/bin/sh
# get_flowdata_dummy.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#
# dpid, srcport, dstport, ingress srcid, ingress dstid, egress srcid, egress dstid, 
# tcp packets, tcp bytes, udp packets, udp bytes, 
# icmp packets, icmp bytes, other packets, other bytes,

print_flowdata() {
	case $FLOWID in 
		2)
			cat <<-END_OF_LINE
			{
			"0x000000000001:1:3":["02:3c:a3:00:0a:0b","0x000000000001","0x000000000001","0x000000000002",15,3,5,3,5,3,5,3],
			"0x000000000001:3:1":["0x000000000002","0x000000000001","0x000000000001","02:3c:a3:00:0a:0b",15,3,5,3,5,3,5,3],
			"0x000000000002:1:3":["02:09:77:00:0c:0b","0x000000000002","0x000000000002","0x000000000001",15,3,5,3,5,3,5,3],
			"0x000000000002:3:1":["0x000000000001","0x000000000002","0x000000000002","02:09:77:00:0c:0b",15,3,5,3,5,3,5,3]
			}
			END_OF_LINE
			;;
		3|4)
			cat <<-END_OF_LINE
			{
			"0x000000000001:1:3":["02:3c:a3:00:0a:0b","0x000000000001","0x000000000001","0x000000000003",15,3,5,3,5,3,5,3],
			"0x000000000001:3:1":["0x000000000003","0x000000000001","0x000000000001","02:3c:a3:00:0a:0b",15,3,5,3,5,3,5,3],
			"0x000000000002:1:3":["02:09:77:00:0c:0b","0x000000000002","0x000000000002","0x000000000003",15,3,5,3,5,3,5,3],
			"0x000000000002:3:1":["0x000000000003","0x000000000002","0x000000000002","02:09:77:00:0c:0b",15,3,5,3,5,3,5,3]
			}
			END_OF_LINE
			;;
		8)
			cat <<-END_OF_LINE
			{
			"0x01:1:3":["02:3c:a3:00:0a:0b","0x01","0x01","0x05",15,3,10,6,5,3,0,0],
			"0x01:3:1":["0x05","0x01","0x01","02:3c:a3:00:0a:0b",15,3,10,6,5,3,0,0],
			"0x06:1:3":["0x05","0x06","0x06","0x08",15,3,0,0,5,3,0,0],
			"0x06:3:1":["0x08","0x06","0x06","0x05",15,3,0,0,5,3,0,0],
			"0x05:1:3":["0x01","0x05","0x05","0x06",15,3,0,0,5,3,0,0],
			"0x05:3:1":["0x06","0x05","0x05","0x01",15,3,0,0,5,3,0,0],
			"0x03:1:3":["0x01","0x03","0x03","0x04",0,0,5,3,0,0,0,0],
			"0x03:3:1":["0x04","0x03","0x03","0x01",0,0,5,3,0,0,0,0],
			"0x04:1:3":["0x03","0x04","0x04","0x08",0,0,5,3,0,0,0,0],
			"0x04:3:1":["0x08","0x04","0x04","0x03",0,0,5,3,0,0,0,0],
			"0x08:1:3":["02:09:77:00:0c:0b","0x08","0x08","0x06",15,3,10,6,5,3,0,0],
			"0x08:3:1":["0x06","0x08","0x08","02:09:77:00:0c:0b",15,3,10,6,5,3,0,0]
			}
			END_OF_LINE
			;;
		27)
			cat <<-END_OF_LINE
			{
			"0x01:1:3":["02:3c:a3:00:0a:0b","0x01","0x01","0x10",5,3,15,6,0,0,0,0],
			"0x01:3:1":["0x10","0x01","0x01","02:3c:a3:00:0a:0b",5,3,15,6,0,0,0,0],
			"0x10:1:3":["0x01","0x10","0x10","0x18",5,3,15,6,0,0,0,0],
			"0x10:3:1":["0x18","0x10","0x10","0x10",5,3,15,6,0,0,0,0],
			"0x18:1:3":["0x10","0x18","0x18","0x19",5,3,15,6,0,0,0,0],
			"0x18:3:1":["0x19","0x18","0x18","0x10",5,3,15,6,0,0,0,0],
			"0x19:1:3":["0x18","0x19","0x19","0x20",5,3,15,6,0,0,0,0],
			"0x19:3:1":["0x20","0x19","0x19","0x18",5,3,15,6,0,0,0,0],
			"0x20:1:3":["0x19","0x20","0x20","0x23",5,3,15,6,0,0,0,0],
			"0x20:3:1":["0x23","0x20","0x20","0x19",5,3,15,6,0,0,0,0],
			"0x23:1:3":["0x20","0x23","0x23","0x26",5,3,15,6,0,0,0,0],
			"0x23:3:1":["0x26","0x23","0x23","0x20",5,3,15,6,0,0,0,0],
			"0x26:1:3":["02:09:77:00:0c:0b","0x26","0x26","0x23",5,3,15,6,0,0,0,0],
			"0x26:3:1":["0x23","0x26","0x26","02:09:77:00:0c:0b",5,3,15,6,0,0,0,0],
			"0x09:1:3":["02:09:77:00:0c:05","0x09","0x09","0x08",5,3,0,0,15,3,0,0],
			"0x09:3:1":["0x08","0x09","0x09","02:09:77:00:0c:05",5,3,0,0,15,3,0,0],
			"0x08:1:3":["0x09","0x08","0x08","0x07",5,3,0,0,15,3,0,0],
			"0x08:3:1":["0x07","0x08","0x08","0x09",5,3,0,0,15,3,0,0],
			"0x07:1:3":["0x08","0x07","0x07","0x15",5,3,0,0,15,3,0,0],
			"0x07:3:1":["0x15","0x07","0x07","0x08",5,3,0,0,15,3,0,0],
			"0x15:1:3":["0x07","0x15","0x15","0x24",5,3,0,0,15,3,0,0],
			"0x15:3:1":["0x24","0x15","0x15","0x07",5,3,0,0,15,3,0,0],
			"0x24:1:3":["0x15","0x24","0x24","0x21",5,3,0,0,15,3,0,0],
			"0x24:3:1":["0x21","0x24","0x24","0x15",5,3,0,0,15,3,0,0],
			"0x21:1:3":["0x24","0x21","0x21","0x18",5,3,0,0,15,3,0,0],
			"0x21:3:1":["0x18","0x21","0x21","0x24",5,3,0,0,15,3,0,0],
			"0x18:1:3":["02:09:77:00:0c:06","0x18","0x18","0x21",5,3,0,0,15,3,0,0],
			"0x18:3:1":["0x21","0x18","0x18","02:09:77:00:0c:06",5,3,0,0,15,3,0,0]
			}
			END_OF_LINE
			;;
		*)
			cat <<-END_OF_LINE
			{
			"0x000000000001:1:3":["02:3c:a3:00:0a:0b","0x000000000001","0x000000000001","0x000000000003",15,3,5,3,5,3,5,3],
			"0x000000000001:3:1":["0x000000000003","0x000000000001","0x000000000001","02:3c:a3:00:0a:0b",15,3,5,3,5,3,5,3],
			"0x000000000002:1:3":["02:09:77:00:0c:0b","0x000000000002","0x000000000002","0x000000000003",15,3,5,3,5,3,5,3],
			"0x000000000002:3:1":["0x000000000003","0x000000000002","0x000000000002","02:09:77:00:0c:0b",15,3,5,3,5,3,5,3]
			}
			END_OF_LINE
			;;
	esac
}

FLOWID=`echo "$QUERY_STRING" | sed -n 's/^.*id=\([^&]*\).*$/\1/p' | sed "s/%20/ /g"`
cat <<END_OF_LINE
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

END_OF_LINE
print_flowdata
exit 0;

#__END__