const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true},
    description:{ type : String},
    ingredients:{type : [String], required: true},
    instructions:{type : String, required : true},
    prepTimeInMinutes:{type: Number, min: [1, 'Prep time must be positive']},
    createdAt: {type: Date, default: Date.now}
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;