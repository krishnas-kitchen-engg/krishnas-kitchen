import { createContext } from "react";

import type { RecipeProductionRunRepository } from "../application/recipeProductionRepository";
import type { RecipeProductionService } from "../application/recipeProductionService";
import type { RecipeService } from "../application/recipeService";

export type RecipeIntegrationContextValue = {
  productionRunRepository: RecipeProductionRunRepository;
  productionService: RecipeProductionService;
  service: RecipeService;
};

export const RecipeIntegrationContext = createContext<RecipeIntegrationContextValue | undefined>(
  undefined
);
