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

    async command(query: { json: string }) {
      return this.spContext(async () => {
        const ctx: SP.ClientContext = this.client.getContext()
        const oListsCollection: SP.ListCollection = ctx.get_web().get_lists()
        ctx.load(oListsCollection, "Include(Title)")

        await ctx.executeQueryPromise()

        const listsTitlesArr = oListsCollection
          .get_data()
          .map((l: any) => ({ title: l.get_title() }))

        const listsTitlesObj = Object.values(listsTitlesArr)
        console.log("Result list :", listsTitlesObj)

        return {
          response: listsTitlesObj,
        }
      })
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: SP2019Integration,
  }
}
