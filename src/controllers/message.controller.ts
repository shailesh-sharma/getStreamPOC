/* eslint @typescript-eslint/no-var-requires: "off" */
import PubNub = require("pubnub");
import stream = require('getstream');

export let getMessageList = async (req : any , res :any, next : any)=>{
    res.send("asdasd")
}


export let getThreadList2 = async (req : any , res :any, next : any)=>{
    try{
        const userId   = req.query.userId as string;
        const {classId} = req.params;

        const pubnub = new PubNub({
            subscribeKey: "sub-c-c5bcda02-50db-11eb-ae10-b69578166507",
            publishKey: "pub-c-550974bc-1374-4d31-8cdb-6d4018014452",
            uuid: userId,
            })

        const filterExpression = `channel.id LIKE "${classId}*"`;
        const response = await pubnub.objects.getMemberships({
            uuid: userId,
            include: {
                channelFields: true,
                customFields : true,
                totalCount : true,
                customChannelFields : true
            },
            sort : {'channel.updated': 'desc'},
            filter : filterExpression
        });

        res.json(response)
    }
    catch(err){
        res.json(err)
    }
}


export let getAnnouncement = async (req : any , res :any, next : any)=>{
    try{
        const client = stream.connect( "uzcx59d8mwym", "4ug936j3552xcrcqcvtexg8bvysk6g3spb3tyz8xmkvv7u39puu5mr5eq563ka2h" , "105987");
        const {classId} = req.params;

        const feedId = `annaouncement_${classId}`
        const annaouncmentFeed = client.feed('annaouncement_temp', feedId)

        const post = await annaouncmentFeed.get({enrich: true , limit : 100 });
        res.json(post)
    }catch(err){
        res.json(err)
    }
}


export let addAnnouncement = async (req : any , res :any, next : any)=>{
    try{
        const client = stream.connect( "uzcx59d8mwym", "4ug936j3552xcrcqcvtexg8bvysk6g3spb3tyz8xmkvv7u39puu5mr5eq563ka2h" , "105987");
        const { userId1 , message , authorFirstName , authorLastName } = req.body;
        const {classId} = req.params;

        const authorInfo : any = await client.user(userId1).getOrCreate({
            firstName : authorFirstName,
            lastName : authorLastName
          });

        const feedId = `annaouncement_${classId}`
        const annaouncmentFeed = client.feed('annaouncement_temp', feedId)


        // add new post in announcment
        const newPostObj = {
            actor: authorInfo,
            verb: 'thread' ,
            object : message,

        };

        const postResponse = await annaouncmentFeed.addActivity(newPostObj);
        res.json(postResponse)
    }catch(err){
        res.json(err);
    }
}



export let getdiscussions = async (req : any , res :any, next : any)=>{
    try{
        const client = stream.connect( "uzcx59d8mwym", "4ug936j3552xcrcqcvtexg8bvysk6g3spb3tyz8xmkvv7u39puu5mr5eq563ka2h" , "105987");
        const {classId , groupId , itemId} = req.params;

        const feedId = `${classId}_${groupId}_${itemId}`
        const annaouncmentFeed = client.feed('discussion_temp', feedId)

        const post = await annaouncmentFeed.get({enrich: true , limit : 100 });;
        res.json(post)
    }catch(err){
        res.json(err)
    }
}


export let adddiscussions = async (req : any , res :any, next : any)=>{
    try{
        const client = stream.connect( "uzcx59d8mwym", "4ug936j3552xcrcqcvtexg8bvysk6g3spb3tyz8xmkvv7u39puu5mr5eq563ka2h" , "105987");

        const { userId1 , message , authorFirstName , authorLastName } = req.body;
        const {classId , groupId , itemId} = req.params;

        const authorInfo : any = await client.user(userId1).getOrCreate({
            firstName : authorFirstName,
            lastName : authorLastName
          });

        const feedId = `${classId}_${groupId}_${itemId}`
        const annaouncmentFeed = client.feed('discussion_temp', feedId);

        // add new post in announcment
        const newPostObj = {
            actor: authorInfo,
            verb: 'thread' ,
            object : message,

        };
        const postResponse = await annaouncmentFeed.addActivity(newPostObj);
        res.json(postResponse)
    }catch(err){
        res.json(err)
    }
}



export let createThread = async(req:any , res:any, next:any)=>{
    try{
        const {userId1 , userId2 , message , title , authorFirstName , authorLastName } = req.body;
        const {classId} = req.params;
        const client = getStramClient();



        const authorInfo : any = await client.user(userId1).getOrCreate({
            firstName : authorFirstName,
            lastName : authorLastName
          });
        const conversationId = `${userId1}_${userId2}_${Date.now()}`;

        const conversationFeed = client.feed('conversations', conversationId);
        // adding new message

        const messageObj = {
            actor : authorInfo,
            verb : "message",
            object : message,
        }

        const response = await conversationFeed.addActivity(messageObj);

        // adding conversation info in collections

        await client.collections.add('conversationInfo', conversationId , { title , participants : [userId1 , userId2] });

        const userConversationListId = `${classId}_${userId1}`;
        const user2ConversationLIstId = `${classId}_${userId2}`;
        const conversationListFeed = client.feed('user_conversation_list', userConversationListId);

        const newConversationObj = {
            actor: authorInfo,
            verb: 'thread' ,
            object : conversationId,
            title,
            lastMessage : message,
            lastMessageTime : response.time,
            to :[`user_conversation_list:${user2ConversationLIstId}`]
            // adding same conversation in user2 feed
            };

        await conversationListFeed.addActivity(newConversationObj);


        const receiverFeedId = `${classId}_${userId2}`;
        const unreadConversationFeed = client.feed("unread_Conversations" , receiverFeedId)
        const unreadfeedObj = {
            actor : authorInfo,
            object : conversationId,
            verb : "mark_read",
            isRead : false
        }

       await unreadConversationFeed.addActivity(unreadfeedObj);

        res.json(response)

    }catch(err){
        res.json(err);
    }
}



export let getThreadList = async(req:any , res:any, next:any)=>{
    try{
        const {classId} = req.params;
        const userId = req.query.userId as string;
        const nextCursor = req.query.next as string;
        const userConversationListId = `${classId}_${userId}`;

        const client  = getStramClient();

        const conversationListFeed = client.feed('user_conversation_list', userConversationListId);

        const uniqueConversationMap = {};

        const {result: results , next : nextCur} = await getUniqueConversationFromFeed(conversationListFeed , uniqueConversationMap , nextCursor);

        const userUnreadFeedId = `${classId}_${userId}`;
        const unreadResponse = client.feed("unread_Conversations" , userUnreadFeedId);
        const unreadActivities = await unreadResponse.get({ limit : 100 });
        updateResponsseWithReadFlag(results , unreadActivities.results )
        res.json({results , next : nextCur});
    }catch(err){
        res.json(err);
    }
}


const updateResponsseWithReadFlag=(conversationslist : any , userUnreadConversations:any)=>{
        conversationslist.forEach((conversation:any)=>{
            const activity = userUnreadConversations.find((unreadConversation : any) => unreadConversation.object === conversation.object);
            if(activity){
                conversation.isRead = activity.isRead;
            }else{
                conversation.isRead = true;
            }
        });
}


const getUniqueConversationFromFeed = async (feed : any , uniqueConversationMap : any , next : string)=>{
    let results = [] as any;
    const response = await feed.get({enrich: true , limit : 10 , id_lt :  next })

    response.results.forEach((conversation : any)=>{
        if(!uniqueConversationMap[conversation.object]){
            results.push(conversation);
            uniqueConversationMap[conversation.object] = true;
        }
    })

    const lastActivity = response.results[response.results.length - 1];
    if(Object.keys(uniqueConversationMap).length > 10 || response.next === ""){
        return {result: results , next :lastActivity.id };
    }
    else{
        const nextResultObj : any = await getUniqueConversationFromFeed(feed , uniqueConversationMap , lastActivity.id);
        results = results.concat(nextResultObj.result);
        return {result: results , next : nextResultObj.id};
    }
}



export let  getMessages = async(req:any , res:any, next:any)=>{
    try{
        const {conversationId , classId} = req.params;
        const userId = req.query.userId as string;
        const nextCursor = req.query.next as string;
        const client = getStramClient();
        const conversationFeed = client.feed("conversations" , conversationId );
        const response = await conversationFeed.get({limit : 25 , id_gt : nextCursor , enrich : true });

        const lastMessage : any = response.results[0];

        const conversationInfo : any  = await client.collections.get("conversationInfo" , conversationId);

        let unreadCount = 0;
        if(lastMessage.actor.id !== userId){
            const unreadFeedId = `${classId}_${userId}`
            const unreadFeed = await client.feed("unread_Conversations" , unreadFeedId)
            const unreadFeedResponse : any = await unreadFeed.get({limit : 100});

            const readActivities = unreadFeedResponse.results.find((activity:any)=>activity.object === conversationId && activity.isRead === true );
            if(readActivities){
                response.results.forEach((message : any)=>{
                    const timestamp = new Date(message.time).valueOf();
                    const date = new Date(readActivities.readTimeStamp);
                    const readTimeStampWithTimeDiff = new Date(date.getTime() + (date.getTimezoneOffset() * 60000)).valueOf()
                    if(timestamp > readTimeStampWithTimeDiff){
                        unreadCount++;
                    }
                })

            }
            else{
                for(const mess  of response.results){
                    const message : any = mess;
                    if(message.actor.id !== userId){
                        unreadCount++;
                    }
                    else{
                        break;
                    }
                }
            }
            const unreadActivities = unreadFeedResponse.results.find((activity:any)=>activity.object === conversationId && activity.isRead === false );
            if(unreadActivities){
                await client.activityPartialUpdate({
                    id: unreadActivities.id,
                    set: {
                      'isRead': true,
                      'readTimeStamp' : Date.now()
                    },
                  })
            }
        }

        res.json({results :response.results , unreadCount , next : lastMessage.id , title : conversationInfo.data.title })
    }catch(err){
        res.json(err);
    }
}



export let postMessage = async(req:any , res:any, next:any)=>{
    try{
        const {userId , message } = req.body;
        const {classId , conversationId} = req.params;
        const client = getStramClient();


        const authorInfo : any = await client.user(userId).getOrCreate({
        });

        const conversationFeed = client.feed('conversations', conversationId);
        // adding new message


        // get conversationInfo from from collection

        const conversationInfo : any = await client.collections.get('conversationInfo', conversationId);

        const [userId1 , userId2] = conversationInfo.data.participants;
        const messageObj = {
            actor : authorInfo,
            verb : "message",
            object : message,
        }

        const title = conversationInfo.data.title;
        const response = await conversationFeed.addActivity(messageObj);

        const userConversationListId = `${classId}_${userId1}`;
        const user2ConversationLIstId = `${classId}_${userId2}`;
        const conversationListFeed = client.feed('user_conversation_list', userConversationListId);

        const newConversationObj = {
            actor: authorInfo,
            verb: 'thread' ,
            object : conversationId,
            title,
            lastMessage : message,
            lastMessageTime : response.time,
            to :[`user_conversation_list:${user2ConversationLIstId}`]
            // adding same conversation in user2 feed
            };

        await conversationListFeed.addActivity(newConversationObj);


        let receiverId;
        if(userId === userId1){
            receiverId = userId2;
        }
        else{
            receiverId = userId1;
        }
        const receiverFeedId = `${classId}_${receiverId}`;
        const unreadConversationFeed = client.feed("unread_Conversations" , receiverFeedId)
        const unreadfeedObj = {
            actor : authorInfo,
            object : conversationId,
            verb : "mark_read",
            isRead : false
        }

       await unreadConversationFeed.addActivity(unreadfeedObj);

        res.json(response)


    }catch(err){
        res.json(err)
    }
}



export let registerUser = async(req:any , res:any, next:any)=>{
    try{
        const {userId , name } = req.body;

        const client = getStramClient();

        const response = await client.user(userId).create({
            name
        });

        res.json({userId , name})
    }catch(err){
        res.json(err);
    }
}


const getStramClient = ()=>{
    const client = stream.connect( "uzcx59d8mwym", "4ug936j3552xcrcqcvtexg8bvysk6g3spb3tyz8xmkvv7u39puu5mr5eq563ka2h" , "105987");
    return client;
}