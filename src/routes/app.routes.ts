import { Router } from "express";
const router = Router();
import * as messageController from '../controllers/message.controller';


export default function () {
    router.get('/classes/:classId/threads/:threadId/messages' , messageController.getMessageList);
    router.post('/classes/:classId/threads/:threadId/messages/add' , messageController.postMessage);


    router.get("/classes/:classId/threads" , messageController.getThreadList);

    // announcement
    router.get("/classes/:classId/announcement" , messageController.getAnnouncement);
    router.post("/classes/:classId/announcement" , messageController.addAnnouncement);

    // discussion
    router.get("/classes/:classId/groups/:groupId/items:/itemId/discussion" , messageController.getdiscussions);
    router.post("/classes/:classId/groups/:groupId/items:/itemId/discussion" , messageController.adddiscussions);


    // conversation

    router.get("/classes/:classId/conversation" , messageController.getThreadList2);
    router.post("/classes/:classId/conversation" , messageController.createThread2);
    // router.delete("/classes/:classId/conversation/:conversationId" , messageController.deleteConversation);

    router.get("/classes/:classId/conversation/:conversationId" , messageController.getMessageList2);
    router.post("/classes/:classId/conversation/:conversationId" , messageController.postMessage2);


    router.post("/register/user" , messageController.createStreamChatUser);

    return router;
  };