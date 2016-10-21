# Flexible Reservation System Cwic

![Logo of reservation system Cwic](http://cwic.nl/assets/logo-5a80ab5715af3aaef15a220b1e2c7906.svg "Cwic")

## Introduction
In essence, every reservation is the same: you want to book a place, object or service for a certain period of time. So, why isn't there a reservation system that does not make any assumptions on the entity that is for rent? With this in mind, we started developing Cwic! The flexible reservation system that is highly configurable. This provides an enormous amount of bennefits. If you are a hotel owner and also want to rent bikes, you can add the bikes as entities in the same reservation system you use for the rooms, and already are familliar with.

To get an impression of what is already done, you could visit the [homepage of the project](http://cwic.nl). The interface is in dutch, but we have prepared the full project with internationalization (i18n), so other languages could be added reasonably easy at any time.

But... the flexibility comes at a cost. It takes very, very many man hours to implement all this flexible features. And our initial team only existed of three people. So, we decided to make it open source! Now you can use the system, change it the way you like, contribute to it and let's see where it goes from here. We will still support the project, but we currently have limited amounts of time to work on it.

## Installation for development

1. `git clone ssh://git@github.com:megamsys/sphere.git`
2. `cd sphere`
3. Install postgresql if you don't already have it installed.
4. Create a db named `megam` and make `postgres` as owner.

```
$ su
$ su postgres

$ psql
$ psql > create database megam;
$ psql > alter database owner to megam;

```
5. Initialize the database

```
$ rake db:migrate
$ rake db:seed

```
6. Make sure you have installed ImageMagick for image processing (http://www.imagemagick.org/script/binary-releases.php) or GraphicsMagick (http://www.graphicsmagick.org/README.html)
7. Run `bundle install`
8. Start the server with `rails s`


## Finished features
* Managing Entity types (modelling what you are renting, with which kind of attributes etc.)
* Managing Entities (instances of the things you are renting, so if you rent rooms, Room 1, with airconditioning, Room 2 with 30 square meters of room, etc).
* Adding pictures to entity types and entities, used for presentation of the entities.
* Managing reservations. With availability tracker when making a new reservation.
* Keeping a history of changes made to reservations by whom.
* Possiblity to add slack times to reservations, time that is automatically blocked before or after the reservation because it is needed to set up the entity for next use.
* CRM features, keeping track of customer information, with convenient sticky notes and contact registration. Possibility to add multiple contacts to one customer.
* Custom statuses for entities.
* Calendar views for getting insight in the bookings and availability. And directly adding or editing reservations.
* Overview of current reservations and their progress.
* Adding documents to clients, reservations or entities.
* Easily create a screen for your guests with the starting and end time of upcomming reservations. Possibly with direction symbols for pointing to the location of the event.
* Global search: Search through all your entities, reservations, clients, sticky notes, contact registrations etc. at once and view them in convenient tiles.
* User management and multiple organsation support: One user can work at multiple organisations using the same credentials to log in to these organisations and use a organisation switcher to switch between these organisations.

## What we are currently building
* A frontend for letting the guest make reservations in the `frontend` and `frontend-rebased` branch.
* A dashboard with all the information for the here and now after logging in to the application in the `dashboard` branch.
* Construction of rules concerning availability and costs (per hour, week, month, part of a day, etc) and enforcing these renting periods when creating the reservation. Already in `master` but not complete and thoroughly tested.

## Contribution
We would really appreciate any contribution. Just create a Pull Request and we will be happy to give you feedback and merge additions.

## Maintainers
* [Kevin Reintjes](https://github.com/kreintjes)
* [Christiaan Thijssen](https://github.com/CUnknown)
* [Floris de Lange](https://github.com/florisdelange)

## License

Copyright © 2016 IADA v.o.f. Nijmegen, Netherlands

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

## By the way
We also created a time tracking tool! Please have a look at [Saus](https://saus.io) for inspiration.
