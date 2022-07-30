# Theater Seat Booking App

This is a theater seat booking app that will automatically select best seats based on the given input parameters (how many seats are currently occupied, number of places adjacent to each other).

Seats are selected in the below order of preference:
1. Higher price category
2. The order of preference of the area
  - Auditorium
  - Balcony Middle
  - Balcony Left or Balcony Right
  - Box Left 1.-2. or Box Right 1.-2.
3. The row closer to the stage
4. Seats closer to the middle of the row

## Setup

To run this project install it locally using npm:

```
$ cd ../seat-booking-app
$ npm install
$ npm run
```

## Examples

![Example_0](https://user-images.githubusercontent.com/63402512/181908093-13350b08-33b6-4e49-a8de-8687ae7ef3cd.png)

