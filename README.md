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

###Installing


###Testing

Presumption is that grunt is installed. To test run `grunt`. This will perform all current tests.


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
