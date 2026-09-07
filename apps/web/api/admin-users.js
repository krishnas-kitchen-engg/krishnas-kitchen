import { createClient } from "@supabase/supabase-js";

const appRoles = new Set([
  "volunteer",
  "cook",
  "senior_cook",
  "inventory_manager",
  "temple_admin",
  "super_admin"
]);

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json"
    },
    status
  });
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;
}

function createSupabaseClients(accessToken) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Admin user creation is not configured for this environment.");
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }),
    serviceClient: createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false
      }
    })
  };
}

async function readActor(serviceClient, actorUserId, organizationId) {
  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] =
    await Promise.all([
      serviceClient
        .from("users")
        .select("id, organization_id, deleted_at")
        .eq("id", actorUserId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      serviceClient
        .from("user_roles")
        .select("role, temple_id")
        .eq("user_id", actorUserId)
        .eq("organization_id", organizationId)
    ]);

  if (profileError || rolesError) {
    throw profileError ?? rolesError;
  }

  if (!profile || profile.deleted_at) {
    return null;
  }

  return {
    profile,
    roles: roles ?? []
  };
}

function assertCanCreateUser(actor, requestedRole) {
  const isOrganizationSuperAdmin = actor.roles.some(
    (role) => role.role === "super_admin" && role.temple_id === null
  );
  const isOrganizationTempleAdmin = actor.roles.some(
    (role) => role.role === "temple_admin" && role.temple_id === null
  );

  if (!isOrganizationSuperAdmin && !isOrganizationTempleAdmin) {
    return "Only organization admins can create app users.";
  }

  if (
    (requestedRole === "super_admin" || requestedRole === "temple_admin") &&
    !isOrganizationSuperAdmin
  ) {
    return "Only a super admin can create admin users.";
  }

  return null;
}

async function readOrganizationName(serviceClient, organizationId) {
  const { data, error } = await serviceClient
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.name ?? "Current organization";
}

async function assertTempleScope(serviceClient, organizationId, templeId) {
  if (!templeId) {
    return;
  }

  const { data, error } = await serviceClient
    .from("temples")
    .select("id")
    .eq("id", templeId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Choose an active temple in this organization.");
  }
}

async function buildUserMetadata(serviceClient, userId, organizationId, fullName) {
  const [
    organizationName,
    { data: roles, error: rolesError },
    { data: temples, error: templesError }
  ] = await Promise.all([
    readOrganizationName(serviceClient, organizationId),
    serviceClient
      .from("user_roles")
      .select("role, temple_id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId),
    serviceClient
      .from("temples")
      .select("id, name")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true })
  ]);

  if (rolesError || templesError) {
    throw rolesError ?? templesError;
  }

  const uniqueRoles = [...new Set((roles ?? []).map((role) => role.role))].sort();
  const scopedTemples = (temples ?? []).filter((temple) =>
    (roles ?? []).some((role) => role.temple_id === null || role.temple_id === temple.id)
  );

  return {
    appMetadata: {
      organization_id: organizationId,
      organization_name: organizationName,
      profile_id: userId,
      roles: uniqueRoles,
      temples: scopedTemples.map((temple) => ({
        id: temple.id,
        name: temple.name
      }))
    },
    userMetadata: {
      display_name: fullName,
      full_name: fullName
    }
  };
}

async function findExistingAuthUserId(serviceClient, email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (error) {
      throw error;
    }

    const existingUser = data.users.find((user) => user.email?.toLowerCase() === email);

    if (existingUser) {
      return existingUser.id;
    }

    if (data.users.length < 1000) {
      return null;
    }
  }

  return null;
}

async function removePartiallyCreatedUser(serviceClient, userId) {
  await Promise.resolve(serviceClient.from("user_roles").delete().eq("user_id", userId)).catch(
    () => null
  );
  await Promise.resolve(serviceClient.from("users").delete().eq("id", userId)).catch(() => null);
  await serviceClient.auth.admin.deleteUser(userId).catch(() => null);
}

export const config = {
  runtime: "edge"
};

export default async function handler(request) {
  if (request.method !== "POST" && request.method !== "PATCH") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const accessToken = readBearerToken(request);

  if (!accessToken) {
    return jsonResponse({ error: "Admin user creation requires a signed-in admin session." }, 401);
  }

  let authClient;
  let serviceClient;

  try {
    ({ authClient, serviceClient } = createSupabaseClients(accessToken));
  } catch (caughtError) {
    return jsonResponse({ error: caughtError.message }, 503);
  }

  const { data: authData, error: authError } = await authClient.auth.getUser();

  if (authError || !authData.user) {
    return jsonResponse({ error: "Admin user creation requires a valid session." }, 401);
  }

  const body = await request.json().catch(() => null);
  const organizationId = normalizeText(body?.organizationId);

  if (request.method === "PATCH") {
    const userId = normalizeText(body?.userId);
    const temporaryPassword =
      typeof body?.temporaryPassword === "string" ? body.temporaryPassword : "";

    if (!organizationId || !userId || temporaryPassword.length < 8) {
      return jsonResponse(
        {
          error:
            "User, organization, and a temporary password of at least 8 characters are required."
        },
        400
      );
    }

    try {
      const actor = await readActor(serviceClient, authData.user.id, organizationId);
      if (!actor || assertCanCreateUser(actor, "volunteer")) {
        return jsonResponse(
          { error: "Only organization admins can set temporary passwords." },
          403
        );
      }

      const { data: targetProfile, error: targetError } = await serviceClient
        .from("users")
        .select("id")
        .eq("id", userId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!targetProfile)
        return jsonResponse({ error: "Active user was not found in this organization." }, 404);

      const { data: authUserData, error: authUserError } =
        await serviceClient.auth.admin.getUserById(userId);
      if (authUserError || !authUserData.user)
        throw authUserError ?? new Error("Auth user not found.");

      const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
        app_metadata: { ...authUserData.user.app_metadata, must_change_password: true },
        password: temporaryPassword
      });
      if (updateError) throw updateError;
      return jsonResponse({ success: true });
    } catch (caughtError) {
      return jsonResponse(
        {
          error:
            caughtError instanceof Error
              ? caughtError.message
              : "Temporary password could not be set."
        },
        500
      );
    }
  }

  const email = normalizeEmail(body?.email);
  const fullName = normalizeText(body?.fullName);
  const password = typeof body?.password === "string" ? body.password : "";
  const role = normalizeText(body?.role);
  const templeId = normalizeText(body?.templeId) || null;

  if (!organizationId || !fullName || !email || !password) {
    return jsonResponse(
      { error: "Full name, email, password, and organization are required." },
      400
    );
  }

  if (!appRoles.has(role)) {
    return jsonResponse({ error: "Choose a valid role." }, 400);
  }

  if (password.length < 8) {
    return jsonResponse({ error: "Temporary password must be at least 8 characters." }, 400);
  }

  if (role === "super_admin" && templeId) {
    return jsonResponse({ error: "Super admin must be organization-scoped." }, 400);
  }

  try {
    const actor = await readActor(serviceClient, authData.user.id, organizationId);

    if (!actor) {
      return jsonResponse(
        { error: "Current admin profile was not found for this organization." },
        403
      );
    }

    const authorizationError = assertCanCreateUser(actor, role);

    if (authorizationError) {
      return jsonResponse({ error: authorizationError }, 403);
    }

    await assertTempleScope(serviceClient, organizationId, templeId);

    const existingAppProfile = await serviceClient
      .from("users")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("email", email)
      .maybeSingle();

    if (existingAppProfile.error) {
      throw existingAppProfile.error;
    }

    if (existingAppProfile.data) {
      return jsonResponse({ error: "A user profile with this email already exists." }, 409);
    }

    const existingAuthUserId = await findExistingAuthUserId(serviceClient, email);

    if (existingAuthUserId) {
      return jsonResponse(
        {
          error:
            "An Auth user with this email already exists. Use the existing-user role tools or archive the duplicate first."
        },
        409
      );
    }

    const { data: createdAuthUser, error: createAuthError } =
      await serviceClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password,
        user_metadata: {
          display_name: fullName,
          full_name: fullName
        }
      });

    if (createAuthError || !createdAuthUser.user) {
      throw createAuthError ?? new Error("Auth user creation returned no user.");
    }

    const userId = createdAuthUser.user.id;
    const createdAt = new Date().toISOString();

    const { error: profileError } = await serviceClient.from("users").insert({
      deleted_at: null,
      email,
      full_name: fullName,
      id: userId,
      organization_id: organizationId
    });

    if (profileError) {
      await removePartiallyCreatedUser(serviceClient, userId);
      throw profileError;
    }

    const { error: roleError } = await serviceClient.from("user_roles").insert({
      created_at: createdAt,
      organization_id: organizationId,
      role,
      temple_id: templeId,
      user_id: userId
    });

    if (roleError) {
      await removePartiallyCreatedUser(serviceClient, userId);
      throw roleError;
    }

    const metadata = await buildUserMetadata(serviceClient, userId, organizationId, fullName);
    const { error: metadataError } = await serviceClient.auth.admin.updateUserById(userId, {
      app_metadata: { ...metadata.appMetadata, must_change_password: true },
      user_metadata: metadata.userMetadata
    });

    if (metadataError) {
      await removePartiallyCreatedUser(serviceClient, userId);
      throw metadataError;
    }

    return jsonResponse({
      user: {
        email,
        fullName,
        id: userId,
        organizationId,
        role,
        templeId
      }
    });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Admin user could not be created.";

    return jsonResponse({ error: message }, 500);
  }
}
