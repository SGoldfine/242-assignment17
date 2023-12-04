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

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

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

app.get("/api/things", (req, res) => {
    getThings(res);
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
        name: req.body.name,
        inventor: req.body.inventor,
        inventionDate: req.body.inventionDate,
        description: req.body.description,
        funFacts: req.body.funFacts.split(",")
    }

    if (req.file) {
        thing.img = "images/" + req.file.filename;
    }

    createThing(thing, res);
});

const createThing = async (res, thing) => {
    const result = await thing.save();
    res.send(thing);
};

app.put("/api/things/:id", upload.single("img"), (req, res) => {
    const result = validateThing(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateThing(req, res);
});

const updateThing = async (req, res) => {
    let fieldsToUpdate = {
        name: req.body.name,
        inventor: req.body.inventor,
        inventionDate: req.body.inventionDate,
        description: req.body.description,
        funFacts: req.body.funFacts.split(",")
    };

    if(req.file) {
        fieldsToUpdate.img = "images/" + req.file.filename;
    }

    const result = await Thing.updateOne({_id: req.params.id}, fieldsToUpdate);
    const thing = await Thing.findById(req.params.id);
    res.send(thing);
};

app.delete("/api/things/:id", upload.single("img"), (req, res) => {
    removeThing(res, req.params.id);
})

const removeThing = async (res, id) => {
    const thing = await Thing.findByIdAndDelete(id);
    res.send(thing);
}

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

app.listen(3001, () => {
    console.log("I'm listening");
});