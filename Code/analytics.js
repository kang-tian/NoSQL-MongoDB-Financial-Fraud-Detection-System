// analytics.js
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import Table from "cli-table3";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(process.env.DB_NAME); // Make sure .env has DB_NAME=BankDataset
    const collection = db.collection("Bank");

    // 👉 Debug: list collections
    const collections = await db.listCollections().toArray();
    console.log("📂 Available collections:", collections.map(c => c.name), "\n");

    const count = await collection.countDocuments();
    if (count === 0) {
      console.warn("⚠️ No documents found in 'Bank'. Check your import script!\n");
    }

    // ---- 1. Transaction Summary ----
    const summary = await collection.aggregate([
      { $group: { _id: null, total: { $sum: "$amt" }, avg: { $avg: "$amt" }, count: { $sum: 1 } } }
    ]).toArray();

    console.log("📊 Transaction Summary:");
    if (summary.length > 0) {
      const t = new Table({ head: ["Total Amount", "Average Amount", "Count"] });
      t.push([summary[0].total.toFixed(2), summary[0].avg.toFixed(2), summary[0].count]);
      console.log(t.toString());
    } else {
      console.log("⚠️ No summary data found.\n");
    }

    // ---- 2. Top 5 Customers by Spending ----
    const topCustomers = await collection.aggregate([
      { $group: { _id: "$cc_num", totalSpent: { $sum: "$amt" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]).toArray();

    console.log("\n👤 Top 5 Customers by Spending:");
    if (topCustomers.length > 0) {
      const t = new Table({ head: ["Customer CC Num", "Total Spent"] });
      topCustomers.forEach(c => t.push([c._id, c.totalSpent.toFixed(2)]));
      console.log(t.toString());
    } else {
      console.log("⚠️ No customer data found.\n");
    }

    // ---- 3. Suspicious Transactions ----
    const suspicious = await collection.find({ $or: [{ amt: { $gte: 5000 } }, { is_fraud: 1 }] }).toArray();

    console.log("\n⚠️ Suspicious Transactions (Amount ≥ 5000 or Fraud Flag):");
    if (suspicious.length > 0) {
      const t = new Table({ head: ["Transaction ID", "Customer CC Num", "Amount", "Fraud?"] });
      suspicious.forEach(tx => t.push([tx.trans_num, tx.cc_num, tx.amt.toFixed(2), tx.is_fraud]));
      console.log(t.toString());
    } else {
      console.log("⚠️ No suspicious transactions found.\n");
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
    console.log("\n🔒 MongoDB connection closed");
  }
}

run();