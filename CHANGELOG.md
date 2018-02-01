## 0.9.7 (February 1, 2018)

* Updated mia-js-core to version 1.0.5
* Set different value fpr cache control generic controller
* Split up output and cache controllers
* Serval bugfixes in generic

## 0.9.6 (January 12, 2018)

* Updated mia-js-core to version 1.0.1
* Removed base model function tests from user.spec.js

## 0.9.5 (January 10, 2018)

* Updated mia-js-core to version 0.9.10
* MongoDB and driver update (3.6.1/3.0.1)
* Reactivated jasmine tests, see "npm test"
* Refactored express deprecations

## 0.9.4 (December 20, 2017)

* Refactored frontend demo project (/web) to use React.js v16 and all the fun stuff like redux, server-side-rendering, isomorphic style loading, declarative routing, etc
* Replaced grunt with webpack as build tool

## 0.9.3 (November 30, 2017)

* Implemented cronjob to sync database indexes with those defined in model schema
* Added Babel to use ES6+ syntax
* Updated MongoDB config object

## 0.8.9 (Dezember 8, 2016)

* Updated mia.js-core and generic projects
* Removed unneeded node-modules

## 0.8.7 (October 19, 2016)

* Updated mia.js-core and generic projects


## 0.8.6 (May 27, 2016)

* Updated mia.js-core and generic projects to run mia.js with optional db connection

## 0.8.5 (May 27, 2016)

* Added language support for notification templates
* Bugfix notification processor on APNS error
* Bugfix notification processor log


## 0.8.4 (March 4, 2016)

* Added rate limiter functionallity
* Renamed identifier of generic default output controller
 
## 0.8.2 (January 07, 2016)

* Added node 0.12x support
* Added xml default output controller
* Added reply-to field to notifications mail
* Bugfix email regex to support new domains like .email .international

## 0.8.1 (Sepember 18, 2015)

* Updated modules mongodb, memcache and q to latest version due to memory leak
* Reengineered mia.ja to work with updated modules
* Reengineered mia.js logger

## 0.8.0 (August 28, 2015)

* Initial public release
