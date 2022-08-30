import {
  DatasourceFieldType,
  DatasourcePlus,
  Integration,
  IntegrationBase,
  QueryType,
} from "@budibase/types"
import { JsomNode } from "sp-jsom-node"

module SP2019Module {
  interface sp2019Config {
    siteUrl: string
    username: string
    password: string
    domain: string
  }

  const SCHEMA: Integration = {
    // Optional link to docs, which gets shown in the UI.
    docs: "https://github.com/koltyakov/sp-jsom-node",
    friendlyName: "SharePoint2019",
    type: "Object store",
    description:
      "SharePoint2019 Service to manage sharepoint 2019 on-premise server. ",
    datasource: {
      siteUrl: {
        type: "string",
        default: "http://svrsharepoint4.agglo.local",
        required: true,
      },
      username: {
        type: "string",
        default: "username",
        required: true,
      },
      password: {
        type: "password",
        default: "password",
        required: true,
      },
      domain: {
        type: "string",
        default: "domain",
        required: true,
      },
    },
    query: {
      create: {
        type: QueryType.FIELDS,
        fields: {
          key: {
            type: DatasourceFieldType.STRING,
            required: true,
          },
          value: {
            type: DatasourceFieldType.STRING,
            required: true,
          },
          ttl: {
            type: DatasourceFieldType.NUMBER,
          },
        },
      },
      read: {
        readable: true,
        type: QueryType.FIELDS,
        fields: {
          key: {
            type: DatasourceFieldType.STRING,
            required: true,
          },
        },
      },
      delete: {
        type: QueryType.FIELDS,
        fields: {
          key: {
            type: DatasourceFieldType.STRING,
            required: true,
          },
        },
      },
      command: {
        readable: true,
        displayName: "SP2019 Command",
        type: QueryType.JSON,
      },
    },
  }

  class SP2019Integration {
    private readonly config: sp2019Config
    private client: JsomNode
    public lists: any

    constructor(config: sp2019Config) {
      this.config = config
      const sp2019: JsomNode = new JsomNode({
        modules: ["taxonomy", "userprofiles"],
      })
      this.client = sp2019.init({
        siteUrl: this.config.siteUrl,

        authOptions: {
          username: this.config.username,
          password: this.config.password,
          domain: this.config.domain,
        },
      })

      /**/
    }

    async spContext(query: Function) {
      try {
        const ctx: SP.ClientContext = this.client.getContext()
        const oListsCollection = ctx.get_web().get_lists()
        ctx.load(oListsCollection, "Include(Title)")
        await ctx.executeQueryPromise()
        return await query()
      } catch (err) {
        throw new Error(`Redis error: ${err}`)
      } finally {
        this.client.dropContext()
      }
    }

    async create(query: { key: string; value: string; ttl: number }) {
      return this.spContext(async () => {
        const response = { result: "success" }
        return response
      })
    }

    async read(query: { key: string }) {
      return this.spContext(async () => {
        const response = { result: "success" }
        return response
      })
    }

    async delete(query: { key: string }) {
      return this.spContext(async () => {
        const response = { result: "success" }
        return response
      })
    }

    async command(query: { json: string }) {
      return this.spContext(async () => {
        const commands = query.json.trim().split(" ")
        //const pipeline = this.client.pipeline([commands])
        const result = { result: "success" }
        return {
          response: result,
        }
      })
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: SP2019Integration,
  }
}
