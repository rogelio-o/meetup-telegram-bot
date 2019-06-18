import {
  App,
  IApp,
  IHttpRequest,
  IHttpResponse,
  JsonParser
} from "lambda-framework";
import { AWSHandler } from "lambda-framework-aws";
import * as aws from "aws-sdk";
import { TelegramService } from "./services/telegramService";
import { MeetupService } from "./services/MeetupService";
import { IChatRepository } from "./repositories/IChatRepository";
import { DynamoDBChatRepository } from "./repositories/DynamoDBChatRepository";
import { GroupsInChatService } from "./services/GroupsInChatService";
import { TelegramInputController } from "./controllers/TelegramInputController";

const telegramService: TelegramService = new TelegramService(
  process.env.TELEGRAM_TOKEN,
  process.env.ENVIRONMENT === "prod"
);
const meetupService: MeetupService = new MeetupService();
const chatRepository: IChatRepository = new DynamoDBChatRepository(
  new aws.DynamoDB()
);
const groupsInChatService: GroupsInChatService = new GroupsInChatService(
  meetupService,
  chatRepository
);
const telegramInputController: TelegramInputController = new TelegramInputController(
  groupsInChatService,
  telegramService
);

const app: IApp = new App();

app.use(new JsonParser().create());
app
  .route("/")
  .post(async (req: IHttpRequest, res: IHttpResponse) => {
    const body: any = req.body;
    const message: any = body.message;

    try {
      await telegramInputController.process(message);
    } catch (e) {
      console.log(e);
    }

    res.send("OK");
  })
  .get((req: IHttpRequest, res: IHttpResponse) => {
    res.sendStatus(418);
  });

const handler: AWSHandler = new AWSHandler(app);
export const handle = handler.handle.bind(handler);
