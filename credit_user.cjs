const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://patrickkirui413:41365475@cluster0.kyti0.mongodb.net/";
const client = new MongoClient(uri);

const phone = process.argv[2];
const amountStr = process.argv[3];

if (!phone || !amountStr) {
  console.log("Usage: node credit_user.cjs <phoneNumber> <amount>");
  console.log("Example: node credit_user.cjs 254741889901 100");
  process.exit(1);
}

const amount = parseInt(amountStr, 10);
if (isNaN(amount)) {
  console.error("Amount must be a valid number");
  process.exit(1);
}

// Ensure phone starts with 254
let formattedPhone = phone.replace(/\D/g, "");
if (formattedPhone.startsWith("0")) {
  formattedPhone = "254" + formattedPhone.slice(1);
} else if (!formattedPhone.startsWith("254")) {
  formattedPhone = "254" + formattedPhone;
}

async function run() {
  try {
    await client.connect();
    const db = client.db('proxy_store');
    console.log("Connected to database");

    // Find the most recent pending top-up matching the phone number and amount
    const topUp = await db.collection("topups").findOne(
      { phoneNumber: formattedPhone, amount: amount, status: "pending" },
      { sort: { createdAt: -1 } }
    );

    if (!topUp) {
      console.log(`No pending top-up of KES ${amount} found for phone number ${formattedPhone}`);
      return;
    }

    console.log("\nFound Stuck Topup:", JSON.stringify(topUp, null, 2));

    // Update user balance
    const userUpdate = await db.collection("users").updateOne(
      { _id: topUp.userId },
      { $inc: { balance: amount } }
    );

    // Update topup status
    const topupUpdate = await db.collection("topups").updateOne(
      { _id: topUp._id },
      { 
        $set: { 
          status: "completed", 
          completedAt: new Date(), 
          mpesaReceiptNumber: "MANUAL_CREDIT_" + Math.random().toString(36).substring(2, 8).toUpperCase()
        } 
      }
    );

    const user = await db.collection("users").findOne({ _id: topUp.userId });

    console.log("\nSuccess!");
    console.log(`- Updated top-up status to completed.`);
    console.log(`- Added KES ${amount} to user: ${user.name} (${user.email})`);
    console.log(`- New Balance: KES ${user.balance}`);

  } catch (err) {
    console.error("Error crediting user:", err);
  } finally {
    await client.close();
  }
}

run();
