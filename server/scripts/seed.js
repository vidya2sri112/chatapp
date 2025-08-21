require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    const users = [
      { username: 'alice', email: 'alice@test.com', password: 'password123' },
      { username: 'bob', email: 'bob@test.com', password: 'password123' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const user = new User(u);
        await user.save();
        console.log(`Seeded user: ${u.email}`);
      } else {
        console.log(`User exists: ${u.email}`);
      }
    }

    await mongoose.disconnect();
    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
