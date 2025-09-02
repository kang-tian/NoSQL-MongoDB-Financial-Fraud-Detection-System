// simulate.js
const { connectDB } = require("./db");
const { faker } = require("@faker-js/faker");

async function simulateTransactions() {
  const db = await connectDB();
  const collection = db.collection(process.env.COLLECTION_NAME);

  const fakeTransactions = [];

  for (let i = 0; i < 100; i++) { // generate 100 transactions
    fakeTransactions.push({
      trans_date_trans_time: faker.date.recent(),
      cc_num: faker.finance.creditCardNumber(),
      merchant: faker.company.name(),
      category: faker.commerce.department(),
      amt: parseFloat(faker.finance.amount(10, 5000, 2)), // correct method
      first: faker.person.firstName(),  // corrected
      last: faker.person.lastName(),    // corrected
      gender: faker.person.gender(),    // corrected
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      lat: parseFloat(faker.location.latitude()),
      long: parseFloat(faker.location.longitude()),
      city_pop: faker.number.int({ min: 1000, max: 1000000 }),
      job: faker.person.jobTitle(),
      dob: faker.date.birthdate({ min: 18, max: 70, mode: "age" }),
      trans_num: faker.string.uuid(),
      unix_time: Math.floor(Date.now() / 1000),
      merch_lat: parseFloat(faker.location.latitude()),
      merch_long: parseFloat(faker.location.longitude()),
      is_fraud: faker.datatype.boolean() ? 1 : 0
    });
  }

  const result = await collection.insertMany(fakeTransactions);
  console.log(`Inserted ${result.insertedCount} transactions`);
  process.exit(0);
}

simulateTransactions().catch(console.error);