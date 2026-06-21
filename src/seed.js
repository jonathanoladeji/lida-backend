const User = require('./models/User');
const Community = require('./models/Community');
const Membership = require('./models/Membership');
const Issue = require('./models/Issue');

const seedDatabase = async () => {
  try {
    const existingCommunities = await Community.countDocuments();
    if (existingCommunities > 0) return; // Already seeded

    console.log('Seeding database...');

    // Create admin user
    const admin = await User.create({
      fullName: 'Lida Admin',
      email: 'admin@lida.ng',
      password: 'LidaAdmin2024!',
      phoneNumber: '08000000000',
      state: 'FCT',
      lga: 'Abuja Municipal',
      neighbourhood: 'Maitama',
      agreedToRules: true,
      role: 'admin',
    });

    // Create seed users
    const user1 = await User.create({
      fullName: 'Adebayo Olusegun',
      email: 'adebayo@example.com',
      password: 'Password123!',
      phoneNumber: '08012345678',
      state: 'Osun',
      lga: 'Osogbo',
      neighbourhood: 'Eludun',
      agreedToRules: true,
    });

    const user2 = await User.create({
      fullName: 'Fatima Usman',
      email: 'fatima@example.com',
      password: 'Password123!',
      phoneNumber: '08023456789',
      state: 'FCT',
      lga: 'Abuja Municipal',
      neighbourhood: 'Lokogoma',
      agreedToRules: true,
    });

    const user3 = await User.create({
      fullName: 'Chukwuemeka Obi',
      email: 'chukwu@example.com',
      password: 'Password123!',
      phoneNumber: '08034567890',
      state: 'Rivers',
      lga: 'Port Harcourt',
      neighbourhood: 'GRA Phase II',
      agreedToRules: true,
    });

    // Create communities
    const c1 = await Community.create({
      name: 'Eludun Residents',
      state: 'Osun',
      lga: 'Osogbo',
      areaDescription: 'Eludun community in Osogbo, Osun State',
      type: 'open',
      rules: 'Be respectful. No hate speech. Report issues peacefully.',
      creator: user1._id,
      memberCount: 1,
    });

    const c2 = await Community.create({
      name: 'Lokogoma Neighbours',
      state: 'FCT',
      lga: 'Abuja Municipal',
      areaDescription: 'Lokogoma District, Abuja',
      type: 'open',
      rules: 'Be respectful. No hate speech. Report issues peacefully.',
      creator: user2._id,
      memberCount: 1,
    });

    const c3 = await Community.create({
      name: 'GRA Phase II Residents',
      state: 'Rivers',
      lga: 'Port Harcourt',
      areaDescription: 'GRA Phase II, Port Harcourt, Rivers State',
      type: 'request-to-join',
      rules: 'Be respectful. No hate speech. Report issues peacefully.',
      creator: user3._id,
      memberCount: 1,
    });

    // Create memberships for creators
    await Membership.create([
      { user: user1._id, community: c1._id, role: 'moderator', status: 'active' },
      { user: user2._id, community: c2._id, role: 'moderator', status: 'active' },
      { user: user3._id, community: c3._id, role: 'moderator', status: 'active' },
    ]);

    // Seed issues
    await Issue.create([
      {
        community: c1._id,
        author: user1._id,
        title: 'Prolonged water outage — 3 weeks without supply',
        category: 'water',
        description: 'The main water supply line has been cut off for over three weeks. Residents are spending heavily on water vendors.',
        locationDescription: 'Entire Eludun Street and surrounding lanes',
        severity: 'high',
        status: 'open',
        affectedHouseholds: 45,
        supportCount: 38,
      },
      {
        community: c2._id,
        author: user2._id,
        title: 'Transformer failure — no power for 2 weeks',
        category: 'electricity',
        description: 'The community transformer burnt out two weeks ago. AEDC has been notified but no action has been taken.',
        locationDescription: 'Lokogoma close B, near the junction',
        severity: 'high',
        status: 'under review',
        affectedHouseholds: 120,
        supportCount: 95,
      },
      {
        community: c3._id,
        author: user3._id,
        title: 'Road flooding after rainfall — drainage blocked',
        category: 'flooding',
        description: 'After every heavy rain, the main access road becomes completely flooded. The drainage system is blocked with debris.',
        locationDescription: 'GRA Phase II entrance road',
        severity: 'medium',
        status: 'open',
        affectedHouseholds: 200,
        supportCount: 67,
      },
    ]);

    console.log('✅ Database seeded successfully');
    console.log('Admin login: admin@lida.ng / LidaAdmin2024!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = { seedDatabase };
