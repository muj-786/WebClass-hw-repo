// index.js
const connectDB = require('./db');
const Recipe = require('./models/recipe');

const createRecipe = async () => {
  try {
    const recipe = new Recipe({
      title: "Classic Tomato Soup",
      description: "A simple and delicious homemade tomato soup.",
      ingredients: ["Tomatoes", "Onion", "Garlic", "Vegetable Broth", "Olive Oil"],
      instructions: "1. Sauté onions and garlic. 2. Add tomatoes and broth. 3. Simmer and blend.",
      prepTimeInMinutes: 30
    });

    const savedRecipe = await recipe.save();
    console.log("✅ Recipe created:", savedRecipe);
  } catch (err) {
    console.error("❌ Error creating recipe:", err);
  }
};

const findAllRecipes = async () => {
  const recipes = await Recipe.find();
  console.log("📜 All Recipes:", recipes);
};

const findRecipeByTitle = async (title) => {
  const recipe = await Recipe.findOne({ title });
  console.log(`🔍 Found Recipe:`, recipe);
};

const updateRecipeDescription = async (title, newDescription) => {
  const updatedRecipe = await Recipe.findOneAndUpdate(
    { title },
    { description: newDescription },
    { new: true } // return updated document
  );
  console.log("✏️ Updated Recipe:", updatedRecipe);
};

const deleteRecipe = async (title) => {
  const deleted = await Recipe.findOneAndDelete({ title });
  if (deleted) {
    console.log(`🗑️ Deleted Recipe: "${title}"`);
  } else {
    console.log(`⚠️ Recipe not found: "${title}"`);
  }
};


const run = async () => {
  await connectDB();

  
  await createRecipe();

  
  await findAllRecipes();
  await findRecipeByTitle("Classic Tomato Soup");

  
  await updateRecipeDescription("Classic Tomato Soup", "A rich and creamy tomato soup, perfect for any day.");

  
  await deleteRecipe("Classic Tomato Soup");

  process.exit();
};

run();
