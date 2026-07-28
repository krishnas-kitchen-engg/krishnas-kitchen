import { useMemo, type PropsWithChildren } from "react";

import {
  useInventoryAvailability,
  useOptionalInventoryServices,
  type InventoryServiceBundle
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import { createRecipeProductionService } from "../application/recipeProductionService";
import { createRecipeService } from "../application/recipeService";
import { createSupabaseRecipeProductionRunRepository } from "../infrastructure/supabase/supabaseRecipeProductionRunRepository";
import { createSupabaseRecipeRepository } from "../infrastructure/supabase/supabaseRecipeRepository";
import { RecipeIntegrationContext, type RecipeIntegrationContextValue } from "./recipeContextValue";

export function RecipeProviderBridge({ children }: PropsWithChildren) {
  const auth = useAuth();
  const inventoryAvailability = useInventoryAvailability();
  const inventoryServices = useOptionalInventoryServices();
  const value = useMemo<RecipeIntegrationContextValue | null>(() => {
    if (!auth.client || inventoryAvailability.status !== "ready" || !inventoryServices) {
      return null;
    }

    const productionRunRepository = createSupabaseRecipeProductionRunRepository(auth.client);

    return createRecipeIntegrationValue(auth.client, inventoryServices, productionRunRepository);
  }, [auth.client, inventoryAvailability.status, inventoryServices]);

  if (!value) {
    return children;
  }

  return (
    <RecipeIntegrationContext.Provider value={value}>{children}</RecipeIntegrationContext.Provider>
  );
}

function createRecipeIntegrationValue(
  client: NonNullable<ReturnType<typeof useAuth>["client"]>,
  inventoryServices: InventoryServiceBundle,
  productionRunRepository: ReturnType<typeof createSupabaseRecipeProductionRunRepository>
): RecipeIntegrationContextValue {
  const repository = createSupabaseRecipeRepository(client);

  return {
    productionRunRepository,
    productionService: createRecipeProductionService({
      catalog: {
        findProductionItem(organizationId, itemId) {
          return inventoryServices.catalogQueries.findItemById(organizationId, itemId);
        },
        findProductionLocation(organizationId, templeId, locationId) {
          return inventoryServices.catalogQueries.findLocationById(
            organizationId,
            templeId,
            locationId
          );
        }
      },
      inventoryService: inventoryServices.inventory,
      productionRunRepository,
      visibilityService: inventoryServices.visibility
    }),
    service: createRecipeService(repository, {
      catalog: {
        async findIngredientItem(itemId, scope) {
          const item = await inventoryServices.catalogQueries.findItemById(
            scope.organizationId,
            itemId
          );

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
}
