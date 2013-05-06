#!/bin/sh
#
# get_gwflow_dummy.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
#
# src id, dst id, tcp packets, tcp bytes, udp packets, udp bytes, icmp packets, icmp bytes
cat <<END_OF_LINE
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

{
"SW03:FW01":[15,3,5,3,5,3],
"FW01:FW03":[15,3,5,3,5,3]
}
END_OF_LINE

