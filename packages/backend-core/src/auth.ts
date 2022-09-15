const passport = require("koa-passport")
const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require("passport-jwt").Strategy
// NTLM Windows auth
const WindowsStrategy = require('passport-windowsauth');
import { getGlobalDB } from "./tenancy"
const refresh = require("passport-oauth2-refresh")
import { Configs } from "./constants"
import { getScopedConfig } from "./db/utils"
import {
  jwt,
  local,
  authenticated,
  //winauth,
  google,
  oidc,
  auditLog,
  tenancy,
  authError,
  ssoCallbackUrl,
  csrf,
  internalApi,
  adminOnly,
  builderOnly,
  builderOrAdmin,
  joiValidator,
} from "./middleware"
import { invalidateUser } from "./cache/user"
import { User } from "@budibase/types"

// Strategies
passport.use(new LocalStrategy(local.options, local.authenticate))
passport.use(new JwtStrategy(jwt.options, jwt.authenticate))

// NTLM Windows auth
passport.use(new WindowsStrategy({
  ldap: {
    url:             'ldap://agglo.local',
    base:            'DC=agglo,DC=local',
    bindDN:          'CN=ldapquery,CN=Users,DC=AGGLO,DC=LOCAL',
    bindCredentials: 'Ldap@Cacem972'
  }
}, (profile, done) => {
  console.log('auth');
  if (profile) {
      console.log("LDAP profile",profile);
      done(null, profile.name);
  } else
      done('Not authorized', null);
}));


passport.serializeUser((user: User, done: any) => done(null, user))

passport.deserializeUser(async (user: User, done: any) => {
  const db = getGlobalDB()

  try {
    const dbUser = await db.get(user._id)
    return done(null, dbUser)
  } catch (err) {
    console.error(`User not found`, err)
    return done(null, false, { message: "User not found" })
  }
})

async function refreshOIDCAccessToken(
  db: any,
  chosenConfig: any,
  refreshToken: string
) {
  const callbackUrl = await oidc.getCallbackUrl(db, chosenConfig)
  let enrichedConfig: any
  let strategy: any

  try {
    enrichedConfig = await oidc.fetchStrategyConfig(chosenConfig, callbackUrl)
    console.log("OIDC infos :",enrichedConfig)
    if (!enrichedConfig) {
      throw new Error("OIDC Config contents invalid")
    }
    strategy = await oidc.strategyFactory(enrichedConfig)
  } catch (err) {
    console.error(err)
    throw new Error("Could not refresh OAuth Token")
  }

  refresh.use(strategy, {
    setRefreshOAuth2() {
      return strategy._getOAuth2Client(enrichedConfig)
    },
  })

  return new Promise(resolve => {
    refresh.requestNewAccessToken(
      Configs.OIDC,
      refreshToken,
      (err: any, accessToken: string, refreshToken: any, params: any) => {
        resolve({ err, accessToken, refreshToken, params })
      }
    )
  })
}

async function refreshGoogleAccessToken(
  db: any,
  config: any,
  refreshToken: any
) {
  let callbackUrl = await google.getCallbackUrl(db, config)

  let strategy
  try {
    strategy = await google.strategyFactory(config, callbackUrl)
  } catch (err: any) {
    console.error(err)
    throw new Error(
      `Error constructing OIDC refresh strategy: message=${err.message}`
    )
  }

  refresh.use(strategy)

  return new Promise(resolve => {
    refresh.requestNewAccessToken(
      Configs.GOOGLE,
      refreshToken,
      (err: any, accessToken: string, refreshToken: string, params: any) => {
        resolve({ err, accessToken, refreshToken, params })
      }
    )
  })
}

async function refreshOAuthToken(
  refreshToken: string,
  configType: string,
  configId: string
) {
  const db = getGlobalDB()

  const config = await getScopedConfig(db, {
    type: configType,
    group: {},
  })

  let chosenConfig = {}
  let refreshResponse
  if (configType === Configs.OIDC) {
    // configId - retrieved from cookie.
    chosenConfig = config.configs.filter((c: any) => c.uuid === configId)[0]
    if (!chosenConfig) {
      throw new Error("Invalid OIDC configuration")
    }
    refreshResponse = await refreshOIDCAccessToken(
      db,
      chosenConfig,
      refreshToken
    )
  } else {
    chosenConfig = config
    refreshResponse = await refreshGoogleAccessToken(
      db,
      chosenConfig,
      refreshToken
    )
  }

  return refreshResponse
}

async function updateUserOAuth(userId: string, oAuthConfig: any) {
  const details = {
    accessToken: oAuthConfig.accessToken,
    refreshToken: oAuthConfig.refreshToken,
  }

  try {
    const db = getGlobalDB()
    const dbUser = await db.get(userId)

    //Do not overwrite the refresh token if a valid one is not provided.
    if (typeof details.refreshToken !== "string") {
      delete details.refreshToken
    }

    dbUser.oauth2 = {
      ...dbUser.oauth2,
      ...details,
    }

    await db.put(dbUser)

    await invalidateUser(userId)
  } catch (e) {
    console.error("Could not update OAuth details for current user", e)
  }
}

export = {
  buildAuthMiddleware: authenticated,
  passport,
  google,
  oidc,
  //winauth,
  jwt: require("jsonwebtoken"),
  buildTenancyMiddleware: tenancy,
  auditLog,
  authError,
  buildCsrfMiddleware: csrf,
  internalApi,
  refreshOAuthToken,
  updateUserOAuth,
  ssoCallbackUrl,
  adminOnly,
  builderOnly,
  builderOrAdmin,
  joiValidator,
}
