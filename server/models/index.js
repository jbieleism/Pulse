const Models = require('./config');
const Sequelize = require('sequelize');

// import all models
const Account = require('./account')(Models);
const Beacon = require('./beacon')(Models);
const Category = require('./category')(Models);
const Chatroom = require('./chatroom')(Models);
const History = require('./history')(Models);
const Preferences = require('./preferences')(Models);
const Rating = require('./rating')(Models);
const Request = require('./request')(Models);
const RSVP = require('./rsvp')(Models);
const Status = require('./status')(Models);
const User = require('./user')(Models);

// define any extra models

// relation definitions
Beacon.belongsTo(User);
Beacon.belongsTo(Category);
Beacon.belongsTo(Chatroom);
History.belongsTo(Beacon);
Preferences.belongsTo(User);
// Preferences.belongsTo(Category)
Rating.belongsTo(User);
Rating.belongsTo(Beacon);
Request.belongsTo(User);
Request.belongsTo(Category);
RSVP.belongsTo(User);
RSVP.belongsTo(Beacon);

User.hasMany(Beacon);
User.hasMany(Preferences);
User.hasMany(Rating);
User.hasMany(Request);
User.hasMany(RSVP);

// sync all files
const Sync = function (keyword) {
  if (keyword) {
    Models.sync({ force: true }).then(() => {
      console.log('Successfully dropped tables.');
      Category.bulkCreate([
        { name: 'Active'},
        { name: 'Art'},
        { name: 'Community'},
        { name: 'Eat'},
        { name: 'Games'},
        { name: 'Learn'},
        { name: 'Music'},
        { name: 'Travel'},
        { name: 'Featured'},
        { name: 'Other'},
        { name: 'JB'}
      ]);
      console.log('Populated Categories Table.');
    // Category.create({
    //   name: 'Active'
    // })
    // Category.create({
    //   name: 'Art'
    // })
    // Category.create({
    //   name: 'Community'
    // })
    // Category.create({
    //   name: 'Eat'
    // })
    // Category.create({
    //   name: 'Games'
    // })
    // Category.create({
    //   name: 'Learn'
    // })
    // Category.create({
    //   name: 'Music'
    // })
    // Category.create({
    //   name: 'Travel'
    // })
    // Category.create({
    //   name: 'Featured'
    // })
    // Category.create({
    //   name: 'Other'
    // })
    // Category.create({
    //   name: 'JB'
    // })
    });
  } else {
    Models.sync().then(() => {
      console.log('Successfully initialized tables.');
    });
  }
};

module.exports = {
  Account: Account,
  Beacon: Beacon,
  Category: Category,
  Chatroom: Chatroom,
  History: History,
  Preferences: Preferences,
  Rating: Rating,
  Request: Request,
  RSVP: RSVP,
  Status: Status,
  User: User,
  Models: Models,
  Sync: Sync
};
