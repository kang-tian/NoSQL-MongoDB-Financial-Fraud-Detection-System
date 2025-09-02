// detect.js
const { connectDB } = require("./db");

async function detectFraud() {
  const db = await connectDB();
  const collection = db.collection(process.env.COLLECTION_NAME);

  // Simple rule-based detection:
  // 1. Amount > 1000
  // 2. Multiple transactions from same user in 1 minute

  // 1️⃣ High-amount transactions
  const highAmount = await collection.find({ amt: { $gt: 1000 } }).toArray();
  console.log("High Amount Transactions:", highAmount.length);

  // 2️⃣ Multiple transactions per user within 1 minute
  const pipeline = [
    {
      $group: {
        _id: { cc_num: "$cc_num", minute: { $dateTrunc: { date: "$trans_date_trans_time", 
            unit: "minute" } } },
        count: { $sum: 1 },
        transactions: { $push: "$$ROOT" }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ];

  const multiTrans = await collection.aggregate(pipeline).toArray();
  console.log("Multiple Transactions in Short Time:", multiTrans.length);
}

detectFraud().catch(console.error);