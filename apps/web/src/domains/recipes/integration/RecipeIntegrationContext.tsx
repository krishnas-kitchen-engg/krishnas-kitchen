import { useMemo, type PropsWithChildren } from "react";

import { useInventoryCatalogQueries, useInventoryServices } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import { createRecipeProductionService } from "../application/recipeProductionService";
import { createRecipeService } from "../application/recipeService";
import { createSupabaseRecipeProductionRunRepository } from "../infrastructure/supabase/supabaseRecipeProductionRunRepository";
import { createSupabaseRecipeRepository } from "../infrastructure/supabase/supabaseRecipeRepository";
import { RecipeIntegrationContext, type RecipeIntegrationContextValue } from "./recipeContextValue";

export function RecipeProviderBridge({ children }: PropsWithChildren) {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const inventoryServices = useInventoryServices();
  const value = useMemo<RecipeIntegrationContextValue>(() => {
    if (!auth.client) {
      throw new Error("Recipe persistence requires Supabase.");
    }

    const repository = createSupabaseRecipeRepository(auth.client);
    const productionRunRepository = createSupabaseRecipeProductionRunRepository(auth.client);

    return {
      productionRunRepository,
      productionService: createRecipeProductionService({
        catalog: {
          findProductionItem(organizationId, itemId) {
            return catalogQueries.findItemById(organizationId, itemId);
          },
          findProductionLocation(organizationId, templeId, locationId) {
            return catalogQueries.findLocationById(organizationId, templeId, locationId);
          }
        },
        inventoryService: inventoryServices.inventory,
        productionRunRepository,
        visibilityService: inventoryServices.visibility
      }),
      service: createRecipeService(repository, {
        catalog: {
          async findIngredientItem(itemId, scope) {
            const item = await catalogQueries.findItemById(scope.organizationId, itemId);

            return item
              ? {
                  deletedAt: item.deletedAt,
                  id: item.id,
                  organizationId: item.organizationId
                }
              : null;
          }
        }
      })
    };
  }, [auth.client, catalogQueries, inventoryServices.inventory, inventoryServices.visibility]);

  return (
    <RecipeIntegrationContext.Provider value={value}>{children}</RecipeIntegrationContext.Provider>
  );
}
