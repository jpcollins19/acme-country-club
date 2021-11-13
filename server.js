const express = require(`express`);
const app = express();
const { syncAndSeed, Facility, Member, Booking } = require(`./db`);

app.get(`/api/facilities`, async (req, res, next) => {
  try {
    const facilities = await Facility.findAll({
      include: [{ model: Booking, as: `bookings` }],
    });

    res.send(facilities);
  } catch (err) {
    next(err);
  }
});

app.get(`/api/members`, async (req, res, next) => {
  try {
    const members = await Member.findAll({
      include: [
        { model: Member, as: `sponsor` },
        { model: Member, as: `sponsored` },
      ],
    });

    res.send(members);
  } catch (err) {
    next(err);
  }
});

app.get(`/api/bookings`, async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Member, as: `bookedBy` },
        { model: Facility, as: `facility` },
      ],
    });

    res.send(bookings);
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await syncAndSeed();
    const port = process.env.PORT || 1113;
    app.listen(port, () => {
      console.log(`listening to port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

init();
