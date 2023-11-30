const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
    .connect("mongodb://localhost/things")
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch((error) => console.log("Couldn't connect to mongodb", error));

const thingSchema = new mongoose.Schema({
    // _id:mongoose.SchemaTypes.ObjectId,
    name:String,
    inventor:String,
    inventionDate:String,
    description:String,
    img:String,
    funFacts:[String]
});

const Thing = mongoose.model("Thing", thingSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/things", (req, res) => {
    res.send(things);
});

const getThings = async (res) => {
    const things = await Thing.find();
    res.send(things);
}

app.post("/api/things", upload.single("img"), (req, res) => {
    const result = validateThing(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const thing = {
        _id: things.length + 1,
        name: req.body.name,
        inventor: req.body.inventor,
        inventionDate: req.body.inventionDate,
        description: req.body.description,
        funFacts: req.body.funFacts.split(",")
    }

    if (req.file) {
        thing.img = "images/" + req.file.filename;
    }

    things.push(thing);
    res.send(things);
});

app.put("/api/things/:id", upload.single("img"), (req, res) => {
    const id = parseInt(req.params.id);

    const thing = things.find((r) => r._id === id);;

    const result = validateThing(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    thing.name = req.body.name;
    thing.inventor = req.body.inventor;
    thing.inventionDate = req.body.inventionDate;
    thing.description = req.body.description;
    thing.funFacts = req.body.funFacts.split(",");

    if (req.file) {
        thing.img = "images/" + req.file.filename;
    }

    res.send(thing);
});

app.delete("/api/things/:id", upload.single("img"), (req, res) => {
    const id = parseInt(req.params.id);

    const thing = things.find((t) => t._id === id);

    if (!thing) {
        res.status(404).send("The thing was not found");
        return;
    }

    const index = things.indexOf(thing);
    things.splice(index, 1);
    res.send(thing);

});

const validateThing = (thing) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        funFacts: Joi.allow(""),
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        inventor: Joi.string().min(3).required(),
        inventionDate: Joi.string().required()
    });

    return schema.validate(thing);
};

app.listen(3000, () => {
    console.log("I'm listening");
});