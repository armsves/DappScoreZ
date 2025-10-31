/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ratings.json`.
 */
export type Ratings = {
  "address": "63uX58srXmpgXzZpdZUpBjDGWJj2fje227ecoVLS1Jvx",
  "metadata": {
    "name": "ratings",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "getProjectRating",
      "discriminator": [
        182,
        230,
        59,
        235,
        186,
        140,
        235,
        220
      ],
      "accounts": [
        {
          "name": "projectRating",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  114,
                  97,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "project_rating.project_id",
                "account": "projectRating"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "getUserRating",
      "discriminator": [
        185,
        1,
        36,
        20,
        205,
        194,
        222,
        35
      ],
      "accounts": [
        {
          "name": "userRating",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  97,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "user",
          "type": "pubkey"
        },
        {
          "name": "projectId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProjectRating",
      "discriminator": [
        211,
        160,
        16,
        26,
        117,
        232,
        91,
        30
      ],
      "accounts": [
        {
          "name": "projectRating",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  114,
                  97,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitRating",
      "discriminator": [
        238,
        207,
        253,
        243,
        170,
        69,
        73,
        199
      ],
      "accounts": [
        {
          "name": "projectRating",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  114,
                  97,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "userRating",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  97,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "textReview",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  101,
                  120,
                  116,
                  95,
                  114,
                  101,
                  118,
                  105,
                  101,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "reviewText",
          "type": {
            "option": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "projectRating",
      "discriminator": [
        131,
        20,
        221,
        253,
        11,
        74,
        169,
        5
      ]
    },
    {
      "name": "textReview",
      "discriminator": [
        224,
        134,
        47,
        145,
        199,
        183,
        112,
        62
      ]
    },
    {
      "name": "userRating",
      "discriminator": [
        254,
        218,
        207,
        119,
        241,
        58,
        117,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidRating",
      "msg": "Rating must be between 1 and 5"
    },
    {
      "code": 6001,
      "name": "arithmeticError",
      "msg": "Arithmetic operation failed"
    },
    {
      "code": 6002,
      "name": "reviewTooLong",
      "msg": "Review text is too long (max 500 characters)"
    }
  ],
  "types": [
    {
      "name": "projectRating",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "totalRating",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "averageRating",
            "type": "f64"
          },
          {
            "name": "reviewCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "textReview",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "reviewText",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userRating",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "hasRated",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
