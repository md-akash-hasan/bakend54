const express = require("express");
var cors = require("cors");
const dotenv = require("dotenv");
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const PORT = process.env.PORTS;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("modiul");
    const destinationCollaction = db.collection("destination");
    const bookingcollection = db.collection("bookingData");

    const verify = async (req, res, next) => {
      const authHeades = req.headers.authorization;
      console.log(authHeades);
      if (!authHeades) {
        return res.status(401).json({ message: "Token not found" });
      }
      const token = authHeades.split(" ")[1];
      console.log(token);
      if (!token) {
        return res.status(401).json({ message: "Token not found" });
      }
      try {
        const JWKS = createRemoteJWKSet(
          new URL(`${process.env.FONTENT_LINK}/api/auth/jwks`),
        );
        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload);
        next();
      } catch {
        return res.status(401).json({ message: "Token not found" });
      }
    };
    app.get("/feature", async (req, res) => {
      let result = await destinationCollaction.find().limit(4).toArray();
      res.json(result);
    });

    app.get("/bookingData/:userId", verify, async (req, res) => {
      let { userId } = req.params;
      let result = await bookingcollection.find({ userId }).toArray();
      res.json(result);
    });

    app.delete("/destinatondelete/:userId", verify, async (req, res) => {
      let { userId } = req.params;
      console.log(userId);
      let result = await bookingcollection.deleteOne({
        _id: new ObjectId(userId),
      });
      res.json(result);
    });

    app.post("/booking", verify, async (req, res) => {
      let data = req.body;
      console.log(data);
      let result = await bookingcollection.insertOne(data);
      res.json(result);
    });

    app.post("/destination", async (req, res) => {
      const destination = req.body;
      console.log(destination);
      const result = await destinationCollaction.insertOne(destination);
      res.json(result);
    });
    app.get(
      "/destinations",

      async (req, res) => {
        const result = await destinationCollaction.find().toArray();
        res.send(result);
      },
    );
    app.get("/destinations/:id", async (req, res) => {
      const { id } = req.params;
      const result = await destinationCollaction.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
    app.patch("/destinations/:id", async (req, res) => {
      const { id } = req.params;
      const updataData = req.body;
      console.log(updataData);
      const result = await destinationCollaction.updateOne(
        {
          _id: new ObjectId(id),
        },
        { $set: updataData },
      );
      res.json(result);
    });

    app.delete("/destinations/:id", verify, async (req, res) => {
      const { id } = req.params;
      const result = await destinationCollaction.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server cholse  vai !");
});

app.listen(PORT, () => {
  console.log("server is raning");
});
