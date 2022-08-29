import { DatasourceFieldType, Integration, QueryType } from "@budibase/types"
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
    type: "Non-relational",
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
        displayName: "Get All List",
        type: QueryType.JSON,
      },
    },
  }

  class SP2019Integration {
    private readonly config: sp2019Config
    private client: JsomNode

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
      //.getContext()
    }

    async spContext(query: Function) {
      try {
        return await query()
      } catch (err) {
        throw new Error(`SharePoint error: ${err}`)
      } finally {
        this.client.dropContext()
        //this.disconnect()
      }
    }

    async spListContext() {
      try {
        const ctx: SP.ClientContext = this.client.getContext()
        const oListsCollection = ctx.get_web().get_lists()
        ctx.load(oListsCollection, "Include(Title)")
        const result = await ctx.executeQueryPromise()
        return { result: "success" }
      } catch (err) {
        throw new Error(`SharePoint error: ${err}`)
      } finally {
        this.client.dropContext()
        //this.disconnect()
      }
    }

    async create(query: { key: string; value: string; ttl: number }) {
      return this.spContext(async () => {
        const response = null
        return response
      })
    }

    async read(query: { key: string }) {
      return this.spContext(async () => {
        const response = null //await this.client.get(query.key)
        return response
      })
    }

    async delete(query: { key: string }) {
      return this.spContext(async () => {
        const response = null //await this.client.del(query.key)
        return response
      })
    }

    async command(query: { json: string }) {
      return this.spListContext()
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: SP2019Integration,
  }
}
