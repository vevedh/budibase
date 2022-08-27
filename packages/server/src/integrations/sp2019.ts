import { DatasourceFieldType, Integration, QueryType } from "@budibase/types"
import { JsomNode } from "sp-jsom-node"

module SP2019Module {
  interface sp2019Config {
    siteUrl: string
    username: string
    password: string
    domain: string
  }

  const sp2019 = new JsomNode({
    modules: ["taxonomy", "userprofiles"],
  })

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
      getAllList: {
        readable: true,
        displayName: "Get All List",
        type: QueryType.JSON,
      },
    },
  }

  class SP2019Integration {
    private readonly config: sp2019Config
    private client: any

    constructor(config: sp2019Config) {
      this.config = config
      this.client = sp2019
        .init({
          siteUrl: config.siteUrl,

          authOptions: {
            username: config.username,
            password: config.password,
            domain: config.domain,
          },
        })
        .getContext()
    }

    async getAllList(query: { json: string }) {
      const oListsCollection = this.client.get_web().get_lists()
      this.client.load(oListsCollection, "Include(Title)")

      await this.client.executeQueryPromise()

      const listsTitlesArr = oListsCollection
        .get_data()
        .map((l: any) => ({ title: l.get_title() }))

      const listsTitlesObj = Object.values(listsTitlesArr)

      return {
        response: listsTitlesObj,
      }
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: SP2019Integration,
  }
}
