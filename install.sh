#!/usr/bin/env bash
git clone https://github.com/metao1/react-addressbook.git
cd react-addressbook
npm install
bower install --verbose
python -m SimpleHTTPServer
