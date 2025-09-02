// alerts.js
const { connectDB } = require("./db");

async function checkFraud() {
  const db = await connectDB();
  const collection = db.collection(process.env.COLLECTION_NAME);
  const alerts = db.collection("alerts");

  const suspicious = await collection.find({
    $or: [{ amt: { $gt: 1000 } }, { is_fraud: 1 }]
  }).toArray();

  for (const doc of suspicious) {
    await alerts.updateOne(
      { trans_num: doc.trans_num },
      {
        $setOnInsert: {
          trans_num: doc.trans_num,
          cc_num: doc.cc_num,
          amt: doc.amt,
          detected_at: new Date(),
          reason: doc.amt > 1000 ? "High Amount" : "Marked Fraud"
        }
      },
      { upsert: true }
    );
    console.log("⚠️ Fraud Alert:", doc.trans_num, doc.amt);
  }
}

setInterval(checkFraud, 5000); // check every 5 seconds