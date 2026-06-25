const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://patrickkirui413:41365475@cluster0.kyti0.mongodb.net/"
const DB_NAME = "venproxy"

async function run() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection("proxies")

    console.log("Connected to database. Starting index creation...")

    // 1. IP Index
    console.log("Creating index on 'ip'...")
    await collection.createIndex({ ip: 1 })

    // 2. Country Index
    console.log("Creating index on 'country'...")
    await collection.createIndex({ country: 1 })

    // 3. Status Index
    console.log("Creating index on 'status'...")
    await collection.createIndex({ status: 1 })

    // 4. isActive Index
    console.log("Creating index on 'isActive'...")
    await collection.createIndex({ isActive: 1 })

    // 5. createdAt (sorting) Index
    console.log("Creating index on 'createdAt'...")
    await collection.createIndex({ createdAt: -1 })

    console.log("Indexes created successfully!")
  } catch (error) {
    console.error("Index creation failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

run()
