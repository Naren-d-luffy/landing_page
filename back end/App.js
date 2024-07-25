import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors"
import bodyParser from 'body-parser'

const app = express();
const port = 5000;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);


app.use(cors());
app.use(bodyParser.json());

let collection;

client.connect().then(() => {
  console.log("Connected to MongoDB");

  const database = client.db("page");
  collection = database.collection("dashboard");

  app.get("/landing", async (req, res) => {
    try {
      let words = [];
      const database = client.db("page");
      const collection = database.collection("landing");
  
      await collection.find().sort({_id: 1}).forEach(landing => {
        words.push(landing);
      });
  
      res.status(200).json(words);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/submit-form", async (req, res) => {
    try {
      const formData = req.body;
      const database = client.db("page");
      const collection = database.collection("dashboard");

      await collection.insertOne(formData);
      res.status(200).send("Form submitted successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/dash", async (req, res) => {
    try {
      const database = client.db("page");
      const collection = database.collection("dashboard");
      const words = await collection.find().toArray(); 
      res.status(200).json(words);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/delete", async (req, res) => {
    try {
      const { id } = req.body;
      console.log("Delete request body:", req.body); 
      console.log("Deleting item with id:", id); 
  
      if (!id) {
        res.status(400).send("No ID provided");
        return;
      }
  
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (e) {
        console.error("Invalid ObjectId:", e);
        res.status(400).send("Invalid ID format");
        return;
      }
  
      const result = await collection.deleteOne({ _id: objectId });
  
      if (result.deletedCount === 0) {
        res.status(404).send("Item not found");
        return;
      }
  
      res.status(200).send("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/item/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const item = await collection.findOne({ _id: objectId });
      
      if (!item) {
        return res.status(404).send("Item not found");
      }
      
      res.status(200).json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/edit", async (req, res) => {
    try {
      const { _id, name, email, subject, message } = req.body;
      await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { name, email, subject, message } }
      );
      res.status(200).send("Item updated successfully");
    } catch (error) {
      console.log("Error updating item:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.patch("/item/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, subject, message } = req.body;
  
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (e) {
        console.error("Invalid ObjectId:", e);
        res.status(400).send("Invalid ID format");
        return;
      }
  
      const result = await collection.updateOne(
        { _id: objectId },
        { $set: { name, email, subject, message } }
      );
  
      if (result.modifiedCount === 0) {
        res.status(404).send("Item not found or no changes made");
        return;
      }
  
      res.status(200).send("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

}).catch(error => {
  console.log("Failed to connect to MongoDB", error);
});