#!/bin/sh
#
# get_connection_array.cgi
#
# Copyright (c) 2013 Yoshi 
# This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
# 
# e.g.
# Input : start time, end time, proto
# Output: proto num, src ip, src port, dst ip, dst port, packet counter, bytes
cat <<END_OF_LINE
Content-Type: application/json, charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000

[
[6, "192.168.1.10", 2000, "10.1.1.1", 21, 392, 2930],
[6, "192.168.1.10", 5000, "10.1.1.1", 22, 32, 20930],
[6, "192.168.1.10", 12000, "10.1.1.1", 23, 903, 90293],
[6, "192.168.1.10", 32000, "10.1.1.1", 25, 329, 3902],
[6, "192.168.1.10", 15000, "10.1.1.1", 80, 1209, 190210320],
[6, "192.168.1.10", 20000, "10.1.1.1", 443, 39, 329009],
[6, "192.168.1.10", 50000, "10.1.1.1", 8080, 239, 90321],
[6, "192.168.1.10", 50000, "10.1.1.1", 64000, 90, 2190]
]
END_OF_LINE
