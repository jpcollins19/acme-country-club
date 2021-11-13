const Sequelize = require(`sequelize`);
const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost/acme_country_club`
);
const { STRING, UUID, UUIDV4, DATE } = Sequelize;

const Facility = db.define(`facilities`, {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  fac_name: {
    type: STRING,
    allowNull: false,
  },
});

const Member = db.define(`members`, {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  first_name: {
    type: STRING,
    allowNull: false,
  },
});

const Booking = db.define(`bookings`, {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  startTime: {
    type: DATE,
    allowNull: false,
    defaultValue: () => new Date(),
  },
  endTime: {
    type: DATE,
    allowNull: false,
    defaultValue: () => new Date(new Date().getTime() + 1000 * 60 * 60),
  },
});

Member.belongsTo(Member, { as: `sponsor` });
Member.hasMany(Member, { foreignKey: `sponsorId`, as: `sponsored` });

Booking.belongsTo(Facility, { as: `facility` });
Booking.belongsTo(Member, { as: `bookedBy` });

Member.hasMany(Booking, { foreignKey: "bookedById" });

Facility.hasMany(Booking, { as: "bookings" });

const members = ["moe", "lucy", "larry", "ethyl"];
const facilities = ["tennis", "ping-pong", "raquet-ball", "bowling"];

const syncAndSeed = async () => {
  await db.sync({ force: true });

  const [tennis, pingPong, requetBall, bowling] = await Promise.all(
    facilities.map((fac_name) => Facility.create({ fac_name }))
  );

  const [moe, lucy, larry, ethyl] = await Promise.all(
    members.map((first_name) => Member.create({ first_name }))
  );

  moe.sponsorId = lucy.id;
  larry.sponsorId = lucy.id;
  ethyl.sponsorId = moe.id;

  await Promise.all([moe.save(), larry.save(), ethyl.save()]);
  await Booking.create({ bookedById: lucy.id, facilityId: tennis.id });
};

module.exports = {
  syncAndSeed,
  Facility,
  Member,
  Booking,
};
