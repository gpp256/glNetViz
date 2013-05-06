#!/bin/sh
#
# get_flowdata_dummy.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#
# dpid, srcport, dstport, ingress srcid, ingress dstid, egress srcid, egress dstid, 
# tcp packets, tcp bytes, udp packets, udp bytes, 
# icmp packets, icmp bytes, other packets, other bytes,
cat <<END_OF_LINE
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

{
"0x000000000001:1:3":["02:3c:a3:00:0a:0b","0x000000000001","0x000000000001","0x000000000003",15,3,5,3,5,3,5,3],
"0x000000000001:3:1":["0x000000000003","0x000000000001","0x000000000001","02:3c:a3:00:0a:0b",15,3,5,3,5,3,5,3],
"0x000000000002:1:3":["02:09:77:00:0c:0b","0x000000000002","0x000000000002","0x000000000003",15,3,5,3,5,3,5,3],
"0x000000000002:3:1":["0x000000000003","0x000000000002","0x000000000002","02:09:77:00:0c:0b",15,3,5,3,5,3,5,3]
}
END_OF_LINE

#"0x000000000001:1:2":["02:3c:a3:00:0a:0b","0x000000000001","0x000000000001","0x000000000002",2,3,2,3,2,3,2,3],
#"0x000000000001:2:1":["0x000000000002","0x000000000001","0x000000000001","02:3c:a3:00:0a:0b",2,3,2,3,2,3,2,3],
#"0x000000000002:1:2":["02:09:77:00:0c:0b","0x000000000002","0x000000000002","0x000000000001",2,3,2,3,2,3,2,3],
#"0x000000000002:2:1":["0x000000000001","0x000000000002","0x000000000002","02:09:77:00:0c:0b",2,3,2,3,2,3,2,3],
