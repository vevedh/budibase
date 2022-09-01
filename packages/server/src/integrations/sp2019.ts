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
      read: {
        type: QueryType.FIELDS,
        fields: {
          bucket: {
            type: "string",
            required: true,
          },
        },
      },
    },
  }

  class SP2019Integration implements IntegrationBase {
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

    async read(query: { bucket: string }) {
      const response = await new Promise((resolve, reject) => {
        //
        try {
          //const spctx: SP.ClientContext = this.client.getContext()
          //const oListsCollection = spctx.get_web().get_lists()
          //console.log("List :", oListsCollection)
          resolve({ result: "succes" })
          /*spctx.load(oListsCollection, "Include(Title)")
          spctx
            .executeQueryPromise()
            .then(() => {
              console.log("List :", oListsCollection)
              resolve({ result: "succes" })
            })
            .catch(err => {
              reject(`Sharepoint error: ${err}`)
            })*/
        } catch (error) {
          reject(`Sharepoint error: ${error}`)
        }
      })

      return response
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: SP2019Integration,
  }
}
