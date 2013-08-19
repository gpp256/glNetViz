glNetViz
========

glNetViz is a tool for visualizing computer network topologies with WebGL.

With the abilities of real time visualizing network traffics flowing around the local network and to/from the Internet, you can manage the various network more easily and efficiently. glNetViz is intended to be a convenient tool that can easily visualize the network topology from the serialized data in YAML or JSON.

Examples
---------
![http://gpp256.zapto.org/glNetViz/examples/sample08_01.png](http://gpp256.zapto.org/glNetViz/examples/sample08_01.png)

Take a look at the demo:

* [http://gpp256.zapto.org/glNetViz/examples/](http://gpp256.zapto.org/glNetViz/examples/)

Quick Start
------------

To install, run the following commands in the glNetViz directory.

    e.g.  
    Debian GNU/Linux:
    $ sudo apt-get install apache2
    $ git clone https://github.com/gpp256/glNetViz.git
    $ cd glNetViz/
    $ ./configure --prefix=/opt/glNetViz
    $ make 
    $ sudo make install
    $ sudo chown -R www-data:www-data /opt/glNetViz
    $ sudo cp /etc/apache2/ports.conf{,.backup130506}
    $ sudo vi /etc/apache2/ports.conf
    $ sudo diff /etc/apache2/ports.conf{.backup130506,}
    9c9
    < Listen 80
    ---
    > Listen 0.0.0.0:80
    $ sudo cp /etc/apache2/sites-enabled/000-default{,.backup130506}
    $ sudo vi /etc/apache2/sites-enabled/000-default
    $ sudo diff /etc/apache2/sites-enabled/000-default{.backup130506,}
    0a1
    > AddHandler cgi-script .cgi
    40a41,48
    >     Alias /glNetViz/ /opt/glNetViz/
    >     <Directory "/opt/glNetViz">
    >         AllowOverride All
    >         Options ExecCGI
    >         Order allow,deny
    >         Allow from all
    >     </Directory>
    $ sudo /etc/init.d/apache2 restart

Some perl modules are needed for starting glNetViz. 

To install some components, run following commands.

    e.g.
    Debian GNU/Linux:
    $ sudo apt-get install perl-modules
    $ sudo apt-get install libyaml-perl

You can access glNetViz sample pages with a web browser that supported WebGL.

    e.g.
    http://youripaddress/glNetViz/examples/


Links
--------

users guide(en): http://gpp256.zapto.org/glNetViz/docs/en/html/index.html  
users guide(ja): http://gpp256.zapto.org/glNetViz/docs/ja/html/index.html  
glNetViz Examples: https://github.com/gpp256/glnetviz_examples/  
blog: http://gpp256.blogspot.jp  

License
----------
Copyright &copy; 2013 Yoshi(@gpp256)  
Distributed under the [MIT License][mit].  

[MIT]: http://www.opensource.org/licenses/mit-license.php

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/2cb7e77baf374d27f6bc8868ed0fd136 "githalytics.com")](http://githalytics.com/gpp256/glNetViz)
