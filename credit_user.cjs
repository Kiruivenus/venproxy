const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Load environment variables from .env or .env.local files
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const fallbackEnvPath = path.join(__dirname, '.env');
  let filePath = '';
  if (fs.existsSync(envPath)) {
    filePath = envPath;
  } else if (fs.existsSync(fallbackEnvPath)) {
    filePath = fallbackEnvPath;
  } else {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    });
  } catch (err) {
    console.warn("Could not parse environment file:", err.message);
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI is not defined in .env or .env.local");
  process.exit(1);
}

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
