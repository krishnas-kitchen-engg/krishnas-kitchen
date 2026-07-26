import { useContext } from "react";

import { RecipeIntegrationContext } from "./recipeContextValue";
import type { RecipeProductionRunRepository } from "../application/recipeProductionRepository";
import type { RecipeProductionService } from "../application/recipeProductionService";
import type { RecipeService } from "../application/recipeService";

function useRecipeIntegration() {
  const context = useContext(RecipeIntegrationContext);

  if (!context) {
    throw new Error("Recipe integration hooks must be used inside RecipeProviderBridge.");
  }

  return context;
}

export function useRecipeService(): RecipeService {
  const context = useRecipeIntegration();

  return context.service;
}

export function useRecipeProductionService(): RecipeProductionService {
  const context = useRecipeIntegration();

  return context.productionService;
}

export function useRecipeProductionRunRepository(): RecipeProductionRunRepository {
  const context = useRecipeIntegration();

  return context.productionRunRepository;
}
