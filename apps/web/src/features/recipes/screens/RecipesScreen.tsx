import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  analyzeRecipeIngredientAvailability,
  generateRecipeShoppingList,
  RECIPE_INGREDIENT_UNITS,
  RecipeDefinitionValidationError,
  useRecipeProductionService,
  useRecipeService,
  type RecipeIngredientInput,
  type RecipePlanningResult,
  type RecipeProductionResult,
  type RecipeRepositoryRecord,
  type RecipeShoppingListResult
} from "@/domains/recipes";
import {
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  type InventoryCatalogItem,
  type InventoryCatalogLocation
} from "@/domains/inventory";
import { hasPermission, useAuth } from "@/features/auth";

const recipeSearchLimit = 25;

type EditableIngredient = RecipeIngredientInput & {
  key: string;
};

type RecipeFormState = {
  description: string;
  ingredients: EditableIngredient[];
  isActive: boolean;
  name: string;
  servings: string;
};

const emptyForm: RecipeFormState = {
  description: "",
  ingredients: [],
  isActive: true,
  name: "",
  servings: ""
};

function createIngredient(item: InventoryCatalogItem): EditableIngredient {
  return {
    itemId: item.id,
    key: `${item.id}:${Date.now()}`,
    quantity: 1,
    unit: item.defaultUnit
  };
}

function formFromRecipe(recipe: RecipeRepositoryRecord): RecipeFormState {
  return {
    description: recipe.description ?? "",
    ingredients: recipe.ingredients.map((ingredient, index) => ({
      ...ingredient,
      key: `${ingredient.itemId}:${ingredient.unit}:${index}`
    })),
    isActive: recipe.isActive,
    name: recipe.name,
    servings: String(recipe.servings)
  };
}

function getRecipeInput(form: RecipeFormState) {
  const description = form.description.trim();

  return {
    description: description || null,
    ingredients: form.ingredients.map(({ key: _key, note, ...ingredient }) => ({
      ...ingredient,
      ...(note?.trim() ? { note: note.trim() } : {})
    })),
    isActive: form.isActive,
    name: form.name,
    servings: Number(form.servings)
  };
}

function getItemName(
  items: readonly InventoryCatalogItem[],
  itemId: string,
  itemLookup?: ReadonlyMap<string, InventoryCatalogItem>
): string {
  return itemLookup?.get(itemId)?.name ?? items.find((item) => item.id === itemId)?.name ?? itemId;
}

export function RecipesScreen() {
  const auth = useAuth();
  const recipeService = useRecipeService();
  const productionService = useRecipeProductionService();
  const catalogQueries = useInventoryCatalogQueries();
  const inventoryActor = useInventoryActor();
  const inventoryPermissions = useInventoryPermissions();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canReadRecipes = hasPermission(auth.permissions, "recipes.read");
  const canManageRecipes = hasPermission(auth.permissions, "recipes.manage");
  const canProduceRecipes = canManageRecipes && inventoryPermissions.canConsumeInventory;
  const [recipes, setRecipes] = useState<readonly RecipeRepositoryRecord[]>([]);
  const [items, setItems] = useState<readonly InventoryCatalogItem[]>([]);
  const [locations, setLocations] = useState<readonly InventoryCatalogLocation[]>([]);
  const [search, setSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRepositoryRecord | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<RecipeRepositoryRecord | null>(null);
  const [form, setForm] = useState<RecipeFormState>(emptyForm);
  const [status, setStatus] = useState<"editing" | "idle" | "loading">("loading");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [planningMode, setPlanningMode] = useState<"batches" | "servings">("servings");
  const [targetServings, setTargetServings] = useState("");
  const [batchCount, setBatchCount] = useState("1");
  const [planningResult, setPlanningResult] = useState<RecipePlanningResult | null>(null);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<RecipeShoppingListResult | null>(null);
  const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);
  const [productionLocationId, setProductionLocationId] = useState("");
  const [productionNotes, setProductionNotes] = useState("");
  const [productionResult, setProductionResult] = useState<RecipeProductionResult | null>(null);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [productionStatus, setProductionStatus] = useState<"executing" | "idle">("idle");
  const productionSubmitLock = useRef(false);
  const [selectedIngredientItems, setSelectedIngredientItems] = useState<
    ReadonlyMap<string, InventoryCatalogItem>
  >(new Map());

  const filteredItems = useMemo(() => {
    const normalizedSearch = itemSearch.trim().toLocaleLowerCase();

    return items.filter(
      (item) =>
        !normalizedSearch ||
        item.name.toLocaleLowerCase().includes(normalizedSearch) ||
        item.id.toLocaleLowerCase().includes(normalizedSearch)
    );
  }, [itemSearch, items]);

  const loadRecipes = useCallback(async () => {
    if (!organizationId || !templeId || !canReadRecipes) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const [recipeRecords, catalogItems, catalogLocations] = await Promise.all([
        recipeService.listRecipes({
          organizationId,
          search,
          templeId
        }),
        catalogQueries.searchItems({
          limit: recipeSearchLimit,
          organizationId
        }),
        catalogQueries.listActiveLocations({
          limit: recipeSearchLimit,
          organizationId,
          templeId
        })
      ]);

      setRecipes(recipeRecords);
      setItems(catalogItems);
      setLocations(catalogLocations);
      setProductionLocationId(
        (currentLocationId) => currentLocationId || catalogLocations[0]?.id || ""
      );
      setStatus("idle");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Recipes failed to load.");
      setStatus("idle");
    }
  }, [canReadRecipes, catalogQueries, organizationId, recipeService, search, templeId]);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    if (!selectedRecipe || !organizationId || !templeId || status === "editing") {
      setPlanningResult(null);
      setPlanningError(null);
      setShoppingList(null);
      setProductionResult(null);
      setProductionError(null);
      setSelectedIngredientItems(new Map());
      return;
    }

    setShoppingList(null);
    setProductionResult(null);
    setProductionError(null);

    if (!selectedRecipe.isActive) {
      setPlanningResult(null);
      setPlanningError("Inactive recipes cannot be used for availability planning.");
      setSelectedIngredientItems(new Map());
      return;
    }

    const currentRecipe = selectedRecipe;
    const currentOrganizationId = organizationId;
    const currentProductionLocationId = productionLocationId;
    const currentTempleId = templeId;
    const desiredServings =
      planningMode === "servings" ? Number(targetServings || currentRecipe.servings) : undefined;
    const desiredBatches = planningMode === "batches" ? Number(batchCount || 1) : undefined;
    let isActive = true;

    async function loadAvailability() {
      try {
        const [balances, ingredientItems] = await Promise.all([
          currentProductionLocationId
            ? visibility.getVisibleBalances({
                locationId: currentProductionLocationId,
                organizationId: currentOrganizationId,
                templeId: currentTempleId
              })
            : visibility.getItemBalances({
                organizationId: currentOrganizationId,
                templeId: currentTempleId
              }),
          Promise.all(
            currentRecipe.ingredients.map((ingredient) =>
              catalogQueries.findItemById(currentOrganizationId, ingredient.itemId)
            )
          )
        ]);
        const ingredientItemLookup = new Map(
          ingredientItems
            .filter((item): item is InventoryCatalogItem => item !== null)
            .map((item) => [item.id, item])
        );
        const result =
          planningMode === "batches"
            ? analyzeRecipeIngredientAvailability({
                balances,
                batchCount: desiredBatches ?? Number.NaN,
                recipe: currentRecipe
              })
            : analyzeRecipeIngredientAvailability({
                balances,
                recipe: currentRecipe,
                targetServings: desiredServings ?? Number.NaN
              });

        if (!isActive) {
          return;
        }

        setSelectedIngredientItems(ingredientItemLookup);
        setPlanningResult(result);
        setPlanningError(null);
      } catch (availabilityError) {
        if (!isActive) {
          return;
        }

        setPlanningResult(null);
        setSelectedIngredientItems(new Map());
        setProductionResult(null);
        setPlanningError(
          availabilityError instanceof Error
            ? availabilityError.message
            : "Recipe availability failed to calculate."
        );
      }
    }

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, [
    availabilityRefreshKey,
    batchCount,
    catalogQueries,
    organizationId,
    planningMode,
    productionLocationId,
    selectedRecipe,
    status,
    targetServings,
    templeId,
    visibility
  ]);

  if (!canReadRecipes) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Recipes unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include recipe access.
        </p>
      </section>
    );
  }

  function startCreate() {
    setEditingRecipe(null);
    setSelectedRecipe(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setStatus("editing");
  }

  function startEdit(recipe: RecipeRepositoryRecord) {
    setEditingRecipe(recipe);
    setSelectedRecipe(recipe);
    setForm(formFromRecipe(recipe));
    setError(null);
    setSuccess(null);
    setStatus("editing");
  }

  function selectRecipe(recipe: RecipeRepositoryRecord) {
    setSelectedRecipe(recipe);
    setTargetServings(String(recipe.servings));
    setBatchCount("1");
    setPlanningMode("servings");
    setPlanningError(null);
    setPlanningResult(null);
    setShoppingList(null);
    setProductionResult(null);
    setProductionError(null);
  }

  async function saveRecipe() {
    if (!organizationId || !templeId || !canManageRecipes) {
      setError("You do not have permission to manage recipes.");
      return;
    }

    try {
      const input = getRecipeInput(form);
      const savedRecipe = editingRecipe
        ? await recipeService.updateRecipe(
            {
              organizationId,
              recipeId: editingRecipe.id,
              templeId
            },
            input
          )
        : await recipeService.createRecipe(
            {
              organizationId,
              templeId
            },
            input
          );

      if (!savedRecipe) {
        setError("Recipe was not found.");
        return;
      }

      setSelectedRecipe(savedRecipe);
      setEditingRecipe(null);
      setStatus("idle");
      setSuccess(`Recipe ${savedRecipe.name} saved.`);
      await loadRecipes();
    } catch (saveError) {
      setError(
        saveError instanceof RecipeDefinitionValidationError
          ? saveError.message
          : saveError instanceof Error
            ? saveError.message
            : "Recipe failed to save."
      );
    }
  }

  async function deactivateRecipe(recipe: RecipeRepositoryRecord) {
    if (!organizationId || !templeId || !canManageRecipes) {
      setError("You do not have permission to manage recipes.");
      return;
    }

    const deactivatedRecipe = await recipeService.deactivateRecipe({
      organizationId,
      recipeId: recipe.id,
      templeId
    });

    if (!deactivatedRecipe) {
      setError("Recipe was not found.");
      return;
    }

    setSelectedRecipe(deactivatedRecipe);
    setSuccess(`Recipe ${deactivatedRecipe.name} deactivated.`);
    await loadRecipes();
  }

  function addIngredient(item: InventoryCatalogItem) {
    if (form.ingredients.some((ingredient) => ingredient.itemId === item.id)) {
      setError("That ingredient is already in this recipe.");
      return;
    }

    setError(null);
    setForm((currentForm) => ({
      ...currentForm,
      ingredients: [...currentForm.ingredients, createIngredient(item)]
    }));
  }

  function updateIngredient(key: string, updates: Partial<RecipeIngredientInput>) {
    setForm((currentForm) => ({
      ...currentForm,
      ingredients: currentForm.ingredients.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, ...updates } : ingredient
      )
    }));
  }

  function removeIngredient(key: string) {
    setForm((currentForm) => ({
      ...currentForm,
      ingredients: currentForm.ingredients.filter((ingredient) => ingredient.key !== key)
    }));
  }

  function generateShoppingList() {
    if (!planningResult) {
      setPlanningError("Run recipe availability before generating a shopping list.");
      setShoppingList(null);
      return;
    }

    setShoppingList(generateRecipeShoppingList(planningResult));
  }

  async function executeProductionRun() {
    if (productionSubmitLock.current || productionStatus === "executing") {
      return;
    }

    if (!organizationId || !templeId || !selectedRecipe) {
      setProductionError("Recipe, organization, and temple context are required.");
      return;
    }

    if (!canProduceRecipes) {
      setProductionError("You do not have permission to execute production runs.");
      return;
    }

    if (!inventoryActor) {
      setProductionError("Inventory actor is required.");
      return;
    }

    if (!planningResult) {
      setProductionError("Review ingredient availability before confirming production.");
      return;
    }

    if (!productionLocationId) {
      setProductionError("Select a production source location.");
      return;
    }

    setProductionStatus("executing");
    setProductionError(null);
    productionSubmitLock.current = true;

    try {
      const result = await productionService.executeProductionRun({
        actor: inventoryActor,
        locationId: productionLocationId,
        notes: productionNotes,
        organizationId,
        permission: canProduceRecipes ? "granted" : "denied",
        recipe: selectedRecipe,
        targetServings: planningResult.targetServings,
        templeId
      });

      setProductionResult(result);
      setShoppingList(null);
      setAvailabilityRefreshKey((currentKey) => currentKey + 1);
    } catch (productionRunError) {
      setProductionResult(null);
      setProductionError(
        productionRunError instanceof Error
          ? productionRunError.message
          : "Production run failed to complete."
      );
    } finally {
      productionSubmitLock.current = false;
      setProductionStatus("idle");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Recipes</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Kitchen recipes</h1>
        </div>
        {canManageRecipes ? (
          <button
            className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
            onClick={startCreate}
            type="button"
          >
            New
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
          {success}
        </div>
      ) : null}

      {status === "editing" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <label className="block text-sm font-medium text-stone-800">
            Recipe name
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              value={form.name}
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Description
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              value={form.description}
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Batch servings
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              inputMode="decimal"
              onChange={(event) => setForm({ ...form, servings: event.target.value })}
              type="number"
              value={form.servings}
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-stone-800">
            <input
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              type="checkbox"
            />
            Active recipe
          </label>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-stone-950">Ingredients</h2>
            {form.ingredients.map((ingredient) => (
              <div
                className="space-y-2 rounded-md border border-stone-200 p-3"
                key={ingredient.key}
              >
                <p className="text-sm font-semibold text-stone-950">
                  {getItemName(items, ingredient.itemId)}
                </p>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    className="min-h-11 rounded-md border border-stone-300 px-3 text-base text-stone-950"
                    inputMode="decimal"
                    onChange={(event) =>
                      updateIngredient(ingredient.key, {
                        quantity: Number(event.target.value)
                      })
                    }
                    type="number"
                    value={ingredient.quantity}
                  />
                  <select
                    className="min-h-11 rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                    onChange={(event) =>
                      updateIngredient(ingredient.key, {
                        unit: event.target.value as ItemUnit
                      })
                    }
                    value={ingredient.unit}
                  >
                    {RECIPE_INGREDIENT_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  className="min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                  onChange={(event) =>
                    updateIngredient(ingredient.key, {
                      note: event.target.value
                    })
                  }
                  placeholder="Prep note"
                  value={ingredient.note ?? ""}
                />
                <button
                  className="min-h-11 w-full rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
                  onClick={() => removeIngredient(ingredient.key)}
                  type="button"
                >
                  Remove ingredient
                </button>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-medium text-stone-800">
              Add inventory item
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => setItemSearch(event.target.value)}
                placeholder="Search active items"
                value={itemSearch}
              />
            </label>
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <button
                  className="min-h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-left text-sm font-medium text-stone-950"
                  key={item.id}
                  onClick={() => addIngredient(item)}
                  type="button"
                >
                  {item.name} ({item.defaultUnit})
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
              onClick={() => setStatus("idle")}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                void saveRecipe();
              }}
              type="button"
            >
              Save recipe
            </button>
          </div>
        </section>
      ) : null}

      {status !== "editing" ? (
        <>
          <label className="block text-sm font-medium text-stone-800">
            Search recipes
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              onChange={(event) => setSearch(event.target.value)}
              value={search}
            />
          </label>
          <section className="space-y-2">
            {status === "loading" ? (
              <p className="text-sm text-stone-600">Loading recipes...</p>
            ) : null}
            {recipes.map((recipe) => (
              <button
                className="w-full rounded-md border border-stone-200 bg-white p-3 text-left"
                key={recipe.id}
                onClick={() => selectRecipe(recipe)}
                type="button"
              >
                <span className="block text-base font-semibold text-stone-950">{recipe.name}</span>
                <span className="mt-1 block text-sm text-stone-600">
                  {recipe.servings} servings - {recipe.ingredients.length} ingredients -{" "}
                  {recipe.isActive ? "active" : "inactive"}
                </span>
              </button>
            ))}
            {status === "idle" && recipes.length === 0 ? (
              <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
                No recipes yet.
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      {selectedRecipe && status !== "editing" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">
              Version {selectedRecipe.version} - {selectedRecipe.isActive ? "Active" : "Inactive"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">{selectedRecipe.name}</h2>
            {selectedRecipe.description ? (
              <p className="mt-2 text-sm leading-6 text-stone-600">{selectedRecipe.description}</p>
            ) : null}
            <p className="mt-2 text-sm text-stone-600">
              Batch size: {selectedRecipe.servings} servings
            </p>
          </div>
          <ul className="space-y-2">
            {selectedRecipe.ingredients.map((ingredient) => (
              <li
                className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm"
                key={`${ingredient.itemId}:${ingredient.unit}`}
              >
                <span className="font-semibold text-stone-950">
                  {getItemName(items, ingredient.itemId, selectedIngredientItems)}
                </span>
                <span className="ml-2 text-stone-700">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                {ingredient.note ? (
                  <span className="mt-1 block text-stone-600">{ingredient.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
          {canManageRecipes ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
                onClick={() => startEdit(selectedRecipe)}
                type="button"
              >
                Edit
              </button>
              <button
                className="min-h-11 rounded-md border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-800 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-500"
                disabled={!selectedRecipe.isActive}
                onClick={() => {
                  void deactivateRecipe(selectedRecipe);
                }}
                type="button"
              >
                Deactivate
              </button>
            </div>
          ) : null}

          <section className="space-y-3 border-t border-stone-200 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">
                Ingredient availability
              </p>
              <h3 className="mt-1 text-lg font-semibold text-stone-950">Scale and compare stock</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`min-h-11 rounded-md border px-4 text-sm font-semibold ${
                  planningMode === "servings"
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-stone-300 text-stone-800"
                }`}
                onClick={() => setPlanningMode("servings")}
                type="button"
              >
                Servings
              </button>
              <button
                className={`min-h-11 rounded-md border px-4 text-sm font-semibold ${
                  planningMode === "batches"
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-stone-300 text-stone-800"
                }`}
                onClick={() => setPlanningMode("batches")}
                type="button"
              >
                Batches
              </button>
            </div>
            {planningMode === "servings" ? (
              <label className="block text-sm font-medium text-stone-800">
                Desired servings
                <input
                  className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                  inputMode="decimal"
                  onChange={(event) => setTargetServings(event.target.value)}
                  type="number"
                  value={targetServings}
                />
              </label>
            ) : (
              <label className="block text-sm font-medium text-stone-800">
                Batch count
                <input
                  className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                  inputMode="decimal"
                  onChange={(event) => setBatchCount(event.target.value)}
                  type="number"
                  value={batchCount}
                />
              </label>
            )}
            {planningError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {planningError}
              </div>
            ) : null}
            {planningResult ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-stone-950">
                  {planningResult.targetServings} servings, {planningResult.batchCount} batch
                  {planningResult.batchCount === 1 ? "" : "es"} -{" "}
                  {planningResult.isAvailable ? "all ingredients available" : "shortages found"}
                </p>
                <ul className="space-y-2">
                  {planningResult.ingredients.map((ingredient) => {
                    const itemKnown = selectedIngredientItems.has(ingredient.itemId);

                    return (
                      <li
                        className={`rounded-md border p-3 text-sm ${
                          ingredient.status === "available"
                            ? "border-green-200 bg-green-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                        key={`${ingredient.itemId}:${ingredient.unit}`}
                      >
                        <span className="block font-semibold text-stone-950">
                          {getItemName(items, ingredient.itemId, selectedIngredientItems)}
                        </span>
                        {!itemKnown ? (
                          <span className="mt-1 block font-medium text-red-800">
                            Inventory item is missing or inactive.
                          </span>
                        ) : null}
                        <span className="mt-1 block text-stone-700">
                          Required {ingredient.requiredQuantity} {ingredient.unit} - available{" "}
                          {ingredient.availableQuantity} {ingredient.unit}
                        </span>
                        {ingredient.shortageQuantity > 0 ? (
                          <span className="mt-1 block font-semibold text-amber-900">
                            Short {ingredient.shortageQuantity} {ingredient.unit}
                          </span>
                        ) : (
                          <span className="mt-1 block font-semibold text-green-800">
                            Sufficient stock
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button
                  className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
                  onClick={generateShoppingList}
                  type="button"
                >
                  Generate shopping list
                </button>
              </div>
            ) : null}
            {shoppingList ? (
              <section className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500">Shopping list</p>
                  <h4 className="mt-1 text-base font-semibold text-stone-950">
                    {shoppingList.isEmpty
                      ? "No purchases needed"
                      : `${shoppingList.itemCount} item${shoppingList.itemCount === 1 ? "" : "s"} to purchase`}
                  </h4>
                </div>
                {shoppingList.isEmpty ? (
                  <p className="text-sm font-medium text-green-800">
                    Current projected inventory covers this scaled recipe.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {shoppingList.items.map((item) => {
                      const itemKnown = selectedIngredientItems.has(item.itemId);

                      return (
                        <li
                          className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm"
                          key={`${item.itemId}:${item.unit}`}
                        >
                          <span className="block font-semibold text-stone-950">
                            {getItemName(items, item.itemId, selectedIngredientItems)}
                          </span>
                          {!itemKnown ? (
                            <span className="mt-1 block font-medium text-red-800">
                              Inventory item is missing or inactive.
                            </span>
                          ) : null}
                          <span className="mt-1 block text-stone-700">
                            Required {item.requiredQuantity} {item.unit} - available{" "}
                            {item.availableQuantity} {item.unit}
                          </span>
                          <span className="mt-1 block font-semibold text-amber-900">
                            Purchase {item.shortageQuantity} {item.unit}
                          </span>
                          {item.note ? (
                            <span className="mt-1 block text-stone-600">{item.note}</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : null}
            <section className="space-y-3 rounded-md border border-stone-200 bg-white p-3">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Production run</p>
                <h4 className="mt-1 text-base font-semibold text-stone-950">
                  Confirm recipe production
                </h4>
              </div>
              <label className="block text-sm font-medium text-stone-800">
                Source location
                <select
                  className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                  onChange={(event) => setProductionLocationId(event.target.value)}
                  value={productionLocationId}
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-stone-800">
                Notes
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
                  onChange={(event) => setProductionNotes(event.target.value)}
                  placeholder="Optional production notes"
                  value={productionNotes}
                />
              </label>
              {productionError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                  {productionError}
                </div>
              ) : null}
              {productionResult ? (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
                  Production recorded for {productionResult.productionRun.servings} servings with{" "}
                  {productionResult.transactions.length} consumption transaction
                  {productionResult.transactions.length === 1 ? "" : "s"}.
                </div>
              ) : null}
              <button
                className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300 disabled:text-stone-600"
                disabled={
                  !canProduceRecipes ||
                  !planningResult ||
                  !planningResult.isAvailable ||
                  !productionLocationId ||
                  productionStatus === "executing"
                }
                onClick={() => {
                  void executeProductionRun();
                }}
                type="button"
              >
                {productionStatus === "executing"
                  ? "Recording production..."
                  : "Confirm production"}
              </button>
              {!canProduceRecipes ? (
                <p className="text-sm font-medium text-stone-600">
                  Recipe management and inventory consumption permissions are required.
                </p>
              ) : null}
              {planningResult && !planningResult.isAvailable ? (
                <p className="text-sm font-medium text-amber-900">
                  Resolve ingredient shortages before confirming production.
                </p>
              ) : null}
            </section>
          </section>
        </section>
      ) : null}
    </section>
  );
}
