import * as aws from "aws-sdk";
import { IChatRepository } from "./IChatRepository";

const TABLE_NAME = "meetup_telegram_bot";

export class DynamoDBChatRepository implements IChatRepository {
  private dynamodb: aws.DynamoDB;

  constructor(dynamodb: aws.DynamoDB) {
    this.dynamodb = dynamodb;
  }

  public async addGroup(chatId: string, groupId: string): Promise<void> {
    const groupIdIndexes: number[] = await this.getGroupIdIndexes(
      chatId,
      groupId
    );
    if (groupIdIndexes.length > 0) {
      return Promise.resolve();
    }

    const params = {
      ExpressionAttributeNames: {
        "#GI": "groups_ids"
      },
      ExpressionAttributeValues: {
        ":gi": {
          L: [{ S: groupId }]
        },
        ":empty": {
          L: []
        }
      },
      Key: {
        chat_id: {
          S: chatId
        }
      },
      TableName: TABLE_NAME,
      UpdateExpression: "SET #GI = list_append(if_not_exists(#GI, :empty), :gi)"
    };

    return new Promise((resolve, reject) => {
      this.dynamodb.updateItem(params, function(err, _) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async removeGroup(chatId: string, groupId: string): Promise<void> {
    const groupIdIndexes: number[] = await this.getGroupIdIndexes(
      chatId,
      groupId
    );
    if (groupIdIndexes.length === 0) {
      return Promise.resolve();
    }

    const toRemove = groupIdIndexes.map(index => `#GI[${index}]`).join(", ");
    const params = {
      ExpressionAttributeNames: {
        "#GI": "groups_ids"
      },
      Key: {
        chat_id: {
          S: chatId
        }
      },
      TableName: TABLE_NAME,
      UpdateExpression: "REMOVE " + toRemove
    };

    return new Promise((resolve, reject) => {
      this.dynamodb.updateItem(params, function(err, _) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async findGroupIds(chatId: string): Promise<string[]> {
    const item = await this.getItem(chatId);
    const groupsIdsAttribute = item.groups_ids || {};
    const groupsIdsRaw = groupsIdsAttribute.L || [];

    return groupsIdsRaw.map(attr => attr.S);
  }

  private async getGroupIdIndexes(
    chatId: string,
    groupId: string
  ): Promise<number[]> {
    const groupsIds = await this.findGroupIds(chatId);

    var indexes = [],
      i = -1;
    while ((i = groupsIds.indexOf(groupId, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes;
  }

  private getItem(chatId: string): Promise<any> {
    const params = {
      Key: {
        chat_id: {
          S: chatId
        }
      },
      TableName: TABLE_NAME
    };

    return new Promise((resolve, reject) => {
      this.dynamodb.getItem(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Item || {});
        }
      });
    });
  }
}
