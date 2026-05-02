export type MainTab = 'mealplans' | 'mealideas';
export type MealIdeasTab = 'breakfast' | 'lunch' | 'dinner';

export interface Recipe {
  id: string;
  title: string;
  time: string;
  calories: string;
  image: string;
  tag?: string;
  ingredients?: string[];
  preparation?: string;
}

export const FEATURED: Recipe = {
  id: '1',
  title: 'Carrot And Orange Smoothie',
  time: '10 Minutes',
  calories: '70 Cal',
  image: 'https://images.unsplash.com/photo-1622597467836-f3e7e1b67af4?w=700&q=80',
  tag: 'Recipe Of The Day',
  ingredients: ['2 large carrots', '1 orange', '1 cup orange juice', '½ cup Greek yogurt', 'Ice cubes'],
  preparation: 'Peel and chop carrots. Juice the orange. Blend all ingredients until smooth. Serve over ice.',
};

export const RECOMMENDED: Recipe[] = [
  { id: '2', title: 'Fruit Smoothie', time: '12 Minutes', calories: '120 Cal', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80', ingredients: ['½ cup Greek yogurt', '½ cup almond milk', 'Mixed berries', 'Honey to taste'], preparation: 'Blend all ingredients until smooth. Pour and enjoy immediately.' },
  { id: '3', title: 'Salads With Quinoa', time: '12 Minutes', calories: '120 Cal', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', ingredients: ['1 cup cooked quinoa', 'Mixed greens', 'Cherry tomatoes', 'Feta cheese', 'Lemon dressing'], preparation: 'Cook quinoa and cool. Combine with greens and feta. Drizzle with lemon dressing and serve.' },
];

export const FOR_YOU: Recipe[] = [
  { id: '4', title: 'Delights With Greek Yogurt', time: '6 Minutes', calories: '200 Cal', image: 'https://images.unsplash.com/photo-1571167366136-b57e3a61b4b9?w=400&q=80', ingredients: ['½ cup Greek yogurt', 'Fresh berries', '1 tbsp honey', 'Granola'], preparation: 'Layer yogurt, berries and granola. Drizzle honey and serve.' },
  { id: '5', title: 'Baked Salmon', time: '30 Minutes', calories: '350 Cal', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', ingredients: ['2 salmon fillets', 'Lemon juice', '3 garlic cloves', '2 tbsp olive oil', 'Fresh dill'], preparation: 'Preheat oven 400°F. Brush salmon with oil, lemon and garlic. Bake 15-20 mins until flaky.' },
];

export const BREAKFAST: Recipe[] = [
  { id: 'b1', title: 'Spinach And Tomato Omelette', time: '10 Minutes', calories: '220 Cal', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80', tag: 'Recipe Of The Day', ingredients: ['2-3 eggs', 'Handful of fresh spinach', '1 small tomato', 'Salt and pepper', 'Olive oil'], preparation: 'Whisk eggs. Sauté spinach and tomato. Pour eggs over and cook until set. Fold and serve.' },
  { id: 'b2', title: 'Fruit Smoothie', time: '12 Minutes', calories: '120 Cal', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80', ingredients: ['½ cup Greek yogurt', '½ cup almond milk', 'Honey (optional)', 'Mixed berries'], preparation: 'Blend all ingredients until smooth. Taste and adjust sweetness. Pour and serve.' },
  { id: 'b3', title: 'Avocado And Egg Toast', time: '15 Minutes', calories: '180 Cal', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80', ingredients: ['Wholemeal bread', 'Ripe avocado', 'Fried or poached egg', 'Salt, pepper, chilli flakes'], preparation: 'Toast bread. Mash avocado and spread. Top with egg and season.' },
  { id: 'b4', title: 'Green Celery Juice', time: '12 Minutes', calories: '120 Cal', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80', ingredients: ['4 celery stalks', '1 green apple', '1 cucumber', 'Fresh ginger', 'Lemon juice'], preparation: 'Wash all ingredients. Run through juicer. Stir and serve over ice.' },
];

export const LUNCH: Recipe[] = [
  { id: 'l1', title: 'Salads With Quinoa', time: '12 Minutes', calories: '120 Cal', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', ingredients: ['1 cup quinoa', 'Mixed greens', 'Cherry tomatoes', 'Feta', 'Lemon vinaigrette'], preparation: 'Cook quinoa. Mix with greens, tomatoes and feta. Drizzle vinaigrette and toss.' },
  { id: 'l2', title: 'Delights With Greek Yogurt', time: '6 Minutes', calories: '200 Cal', image: 'https://images.unsplash.com/photo-1571167366136-b57e3a61b4b9?w=400&q=80', ingredients: ['½ cup Greek yogurt', 'Fresh berries', '1 tbsp honey', 'Granola'], preparation: 'Layer yogurt, berries and granola. Drizzle honey and serve.' },
];

export const DINNER: Recipe[] = [
  { id: 'd1', title: 'Baked Salmon', time: '30 Minutes', calories: '350 Cal', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', ingredients: ['2 salmon fillets', 'Lemon', '3 garlic cloves', '2 tbsp olive oil', 'Fresh herbs'], preparation: 'Preheat oven 400°F. Season salmon. Bake 15-20 mins. Serve with greens.' },
  { id: 'd2', title: 'Avocado And Egg Toast', time: '15 Minutes', calories: '180 Cal', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80', ingredients: ['Wholemeal bread', 'Avocado', 'Egg', 'Salt and pepper'], preparation: 'Toast bread. Mash avocado and spread. Top with fried egg and season.' },
];

export const PLAN_RESULT: (Recipe & { checked: boolean })[] = [
  { id: 'p1', title: 'Delights With Greek Yogurt', time: '6 Minutes', calories: '200 Cal', image: 'https://images.unsplash.com/photo-1571167366136-b57e3a61b4b9?w=400&q=80', checked: false, ingredients: ['½ cup Greek yogurt', 'Fresh berries', '1 tbsp honey', 'Granola'], preparation: 'Layer yogurt, berries and granola. Drizzle honey and serve.' },
  { id: 'p2', title: 'Spinach And Tomato Omelette', time: '10 Minutes', calories: '225 Cal', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80', checked: false, ingredients: ['2-3 eggs', 'Spinach', 'Tomato', 'Salt and pepper', 'Olive oil'], preparation: 'Whisk eggs. Sauté spinach and tomato. Cook eggs until set. Fold and serve.' },
  { id: 'p3', title: 'Avocado And Egg Toast', time: '15 Minutes', calories: '180 Cal', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80', checked: true, ingredients: ['Wholemeal bread', 'Avocado', 'Egg'], preparation: 'Toast bread. Mash avocado. Top with egg.' },
  { id: 'p4', title: 'Protein Shake With Fruits', time: '9 Minutes', calories: '160 Cal', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', checked: false, ingredients: ['1 scoop protein powder', '1 cup milk', 'Banana', 'Berries'], preparation: 'Blend all ingredients until smooth. Serve chilled.' },
];
