export interface Recipe {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  freeSugar: number;
  fibre: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  folate: number;
}

let cachedRecipes: Recipe[] | null = null;

export async function loadRecipes(): Promise<Recipe[]> {
  if (cachedRecipes) {
    return cachedRecipes;
  }

  try {
    const response = await fetch('/Indian_Food_Nutrition_Processed.csv');
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    // Skip header
    const recipes: Recipe[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle CSV parsing with commas inside quoted fields
      const values = parseCSVLine(line);
      
      if (values.length >= 12) {
        recipes.push({
          name: values[0].trim(),
          calories: parseFloat(values[1]) || 0,
          carbs: parseFloat(values[2]) || 0,
          protein: parseFloat(values[3]) || 0,
          fats: parseFloat(values[4]) || 0,
          freeSugar: parseFloat(values[5]) || 0,
          fibre: parseFloat(values[6]) || 0,
          sodium: parseFloat(values[7]) || 0,
          calcium: parseFloat(values[8]) || 0,
          iron: parseFloat(values[9]) || 0,
          vitaminC: parseFloat(values[10]) || 0,
          folate: parseFloat(values[11]) || 0,
        });
      }
    }
    
    cachedRecipes = recipes;
    console.log(`Loaded ${recipes.length} recipes from CSV`);
    return recipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) {
    return recipes;
  }
  
  const lowerQuery = query.toLowerCase();
  return recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(lowerQuery)
  );
}

export function filterRecipesByCalories(
  recipes: Recipe[], 
  minCalories: number = 0, 
  maxCalories: number = Infinity
): Recipe[] {
  return recipes.filter(
    recipe => recipe.calories >= minCalories && recipe.calories <= maxCalories
  );
}

export function sortRecipes(
  recipes: Recipe[], 
  sortBy: 'name' | 'calories' | 'protein' = 'name',
  ascending: boolean = true
): Recipe[] {
  const sorted = [...recipes].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else {
      comparison = a[sortBy] - b[sortBy];
    }
    
    return ascending ? comparison : -comparison;
  });
  
  return sorted;
}
