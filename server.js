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
    .connect("mongodb+srv://sgold242:YZjZdZ2Ipl637zGa@cluster0.sm07b42.mongodb.net/?retryWrites=true&w=majority")
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

// const createThing = async () => {
//     const thing = new Thing({
//         name: "Hourglass",
//         inventor: "Liutprand",
//         inventionDate: "8th Century AD",
//         description: "An hourglass is a device used to measure the passage of time through the use of sand flowing from the top to the bottom",
//         img: 'images/hourglass.png',
//         funFacts: [
//             "The duration of time a given hourglass will last depends on the size and shape of the hourglass",
//             "The hourglass was used for measuring time during ocean travel due to being unaffected by waves",
//             "Ferdinand Magellan used 18 hourglasses during a trip around the globe, each turned by the ship's page in order to provide times for the ship's log",
//         ],
//     });

//     const result = await thing.save();
//     console.log(result);
// };

// createThing();

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