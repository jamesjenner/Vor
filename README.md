Vor
===

A dashboard style monitor utilising 10 foot interface.

Overview
------
Vor consists of two components, the backend and frontend.

The frontend is implemented as an HTML5 interface, that can run in any modern web browser. The backend is implemented using nodejs. 
The communications between the frontend and backend is via websockets, a protocol introduced in HTML5.

This provides the advantage that the backend can be either local or remote. 

Quick Start
-------

1. Clone the rep: `git clone https://github.com/jamesjenner/Vor.git`
2. Install server dependancies via [NPM](http://www.npmjs.org/): `npm install`
3. If linux, then install bcrypt via [NPM](http://www.npmjs.org/): `npm bcrypt`
4. If windows, then install bcryptjs via [NPM](http://www.npmjs.org/): `npm bcryptjs`
5. Start the server: `node vor`
6. Run the client by opening `index.html` in a web browser.


Development
------

###State

The current state of development is avaialble at [trello](https://trello.com/b/tyFglxpx).

###Installing

See Quick Start section (above). 

TODO: Add notes on running via a web server, distributed mode, etc.

###Testing

Presumption is that grunt is installed. To test run `grunt`. This will perform all current tests.


###TODO

* Update meltingpot so that it has the same data directory option
* Change meltingpot so that users.json is seperated out from the comms handler
* Implement encryption for persisted data, specifically any credential information for third party data sources
* Determine how to manage debug/logging, possibly update meltingpot first
* Look at option for uploading icons and images, for panel icon and for logo
* Determine approach for themes
* Determine approach for user defined content, possibly markdown style
* Update README.ms to include installation for development.
* Display summary help if invalid param is used, possibly move away from opt

License (MIT)
---------
Copyright(c) 2014 James Jenner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
