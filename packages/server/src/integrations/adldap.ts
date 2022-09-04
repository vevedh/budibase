import { Integration, QueryType, IntegrationBase, DatasourceFieldType } from "@budibase/types"
import { IClientConfig, Client } from "ldap-ts-client";


module AdLdapModule {
  

  interface AdLdapConfig extends IClientConfig {
    url: string
    bindDN: string
    secret: string
    baseDN: string
  }

  const SCHEMA: Integration = {
    docs: "https://github.com/saostad/ldap-ts-client#readme",
    description:
      "LDAP Client to connect your Active Directory LDAP Server.",
      friendlyName: "AD Ldap",
      type: "Non-relational",
    datasource: {
      url: {
        type: "string",
        required: false,
        default: "ldap://domain.com",
      },
      bindDN: {
        type: "string",
        required: true,
      },
      secret: {
        type: "password",
        required: true,
      },
      baseDN: {
        type: "string",
        required: false,
      },

    },
    query: {
      command: {
        readable: true,
        displayName: "Get Ldap users",
        type: QueryType.JSON,
      },
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
          }
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
      update: {
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
      }
    },
  }

  class AdLdapIntegration  {
    private readonly config: AdLdapConfig
    private client;

    constructor(config: AdLdapConfig) {
      this.config = config
      

      this.client = new Client(this.config)
    }


    async ldapContext(query: Function) {
      try {
        return await query()
      } catch (err) {
        throw new Error(`Redis error: ${err}`)
      } finally {
        console.log("end")
      }
    }


    async create(query: { key: string; value: string; ttl: number }) {
      return this.ldapContext(async () => {
        const response = null
        return response
      })
    }

    async read(query: { key: string }) {
      return this.ldapContext(async () => {
        const response = null
        return response
      })
    }

    async update(query: { key: string }) {
      return this.ldapContext(async () => {
        const response = null
        return response
      })
    }

    async delete(query: { key: string }) {
      return this.ldapContext(async () => {
        const response = null
        return response
      })
    }
    async command(query: { bucket: string }) {
      return this.ldapContext(async () => {
      const response = await this.client.queryAttributes({
        attributes: [`${query.bucket}`],
        options: {
          filter:"(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))",
          scope: "sub",
          paged: false
        },
        base:this.config.baseDN
        
      });
      console.log("Ldap users :",response)
      // always free-Up after you done the job!
      this.client.unbind();
      return response
    })
    }
  }

  module.exports = {
    schema: SCHEMA,
    integration: AdLdapIntegration,
  }
}
