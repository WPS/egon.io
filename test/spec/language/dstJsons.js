'use strict';


export const jsonString =
    '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30,"pickedColor":"black","$type":"Element","di":{},"$descriptor":{}},' +
    '{"type":"domainStory:workObjectDocument","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30,"pickedColor":"black","$type":"Element","di":{},"$descriptor":{}},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681","pickedColor":"black","$type":"Element","di":{},"$descriptor":{}},' +
    '{"info":"test"}]';
export const jsonString2 =
        '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30,"$type":"Element","di":{},"$descriptor":{},"pickedColor":"black"},' +
        '{"type":"domainStory:workObjectDocument","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30,"$type":"Element","di":{},"$descriptor":{},"pickedColor":"black"},' +
        '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681","$type":"Element","di":{},"$descriptor":{},"pickedColor":"black"},' +
        '{"info":"test"}]';

export const brokenJsonString =
    '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},' +
    '{"type":"domainStory:workObjectDocument","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},' +
    '{"type":"domainStory:activity","name":"","id":"connection_0001","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_0001","target":"shape_0002"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},' +
    '{"info":"test"}]';

export const oldIntricateV_0_2_0_JsonString =
    '[{"type":"domainStory:group","name":"ein gruppenname","id":"shape_9638","x":751,"y":330,"height":275,"width":525},' +
    '{"type":"domainStory:actorPerson","name":"ein actor name","id":"shape_6458","x":547,"y":223},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_8970","x":681,"y":223},' +
    '{"type":"domainStory:actorSystem","name":"","id":"shape_8118","x":976,"y":223},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_9327","x":987,"y":346},' +
    '{"type":"domainStory:workObject","name":"ein workobject name","id":"shape_5439","x":681,"y":371},' +
    '{"type":"domainStory:workObjectCall","name":"","id":"shape_5296","x":681,"y":506},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_8808","x":1193,"y":506},' +
    '{"type":"domainStory:actorPerson","name":"","id":"shape_3974","x":987,"y":506},' +
    '{"type":"domainStory:activity","name":"ein labeltext","id":"connection_6847","waypoints":[{"original":{"x":585,"y":261},"x":628,"y":261},{"original":{"x":719,"y":261},"x":681,"y":261}],"source":"shape_6458","target":"shape_8970","number":1},' +
    '{"type":"domainStory:activity","name":"","id":"connection_0720","waypoints":[{"original":{"x":719,"y":261},"x":762,"y":261},{"original":{"x":1014,"y":261},"x":976,"y":261}],"source":"shape_8970","target":"shape_8118"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_9638","waypoints":[{"original":{"x":1014,"y":261},"x":1018,"y":308},{"original":{"x":1025,"y":384},"x":1022,"y":346}],"source":"shape_8118","target":"shape_9327","number":2},' +
    '{"type":"domainStory:activity","name":"","id":"connection_8306","waypoints":[{"original":{"x":719,"y":261},"x":719,"y":308},{"original":{"x":719,"y":409},"x":719,"y":371}],"source":"shape_8970","target":"shape_5439"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_6550","waypoints":[{"original":{"x":719,"y":409},"x":719,"y":456},{"original":{"x":719,"y":544},"x":719,"y":506}],"source":"shape_5439","target":"shape_5296"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_0196","waypoints":[{"original":{"x":1025,"y":384},"x":1025,"y":431},{"original":{"x":1025,"y":544},"x":1025,"y":506}],"source":"shape_9327","target":"shape_3974"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_2991","waypoints":[{"original":{"x":1025,"y":544},"x":1072,"y":548},{"original":{"x":1226,"y":563},"x":1193,"y":560}],"source":"shape_3974","target":"shape_8808","number":3},' +
    '{"type":"domainStory:activity","name":"","id":"connection_9263","waypoints":[{"original":{"x":719,"y":544},"x":764,"y":547},{"original":{"x":1005,"y":560},"x":987,"y":559}],"source":"shape_5296","target":"shape_3974"},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_5750","x":1106,"y":382,"text":"ein weiteres kommentar","number":42},' +
    '{"type":"domainStory:connection","name":"","id":"connection_6966","waypoints":[{"original":{"x":1025,"y":544},"x":1045,"y":522},{"original":{"x":1156,"y":397},"x":1143,"y":412}],"source":"shape_3974","target":"shape_5750"},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_3367","x":1109,"y":201,"text":"ein kommentar","number":30},' +
    '{"type":"domainStory:connection","name":"","id":"connection_0733","waypoints":[{"original":{"x":1014,"y":261},"x":1046,"y":251},{"original":{"x":1159,"y":216},"x":1111,"y":231}],"source":"shape_8118","target":"shape_3367"},' +
    '{"info":"Eine Beschreibung"}]';

export const oldIntricateV_0_3_0_JsonString =
    '[{"type":"domainStory:group","name":"ein gruppenname","id":"shape_9638","x":751,"y":330,"height":275,"width":525},' +
    '{"type":"domainStory:actorPerson","name":"ein actor name","id":"shape_6458","x":547,"y":223},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_8970","x":681,"y":223},' +
    '{"type":"domainStory:actorSystem","name":"","id":"shape_8118","x":976,"y":223},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_9327","x":987,"y":346},' +
    '{"type":"domainStory:workObject","name":"ein workobject name","id":"shape_5439","x":681,"y":371},' +
    '{"type":"domainStory:workObjectCall","name":"","id":"shape_5296","x":681,"y":506},' +
    '{"type":"domainStory:workObject","name":"","id":"shape_8808","x":1193,"y":506},' +
    '{"type":"domainStory:actorPerson","name":"","id":"shape_3974","x":987,"y":506},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_5750","x":1106,"y":382,"text":"ein weiteres kommentar","number":42},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_3367","x":1109,"y":201,"text":"ein kommentar","number":30},' +
    '{"type":"domainStory:activity","name":"ein labeltext","id":"connection_6847","waypoints":[{"original":{"x":585,"y":261},"x":628,"y":261},{"original":{"x":719,"y":261},"x":681,"y":261}],"source":"shape_6458","target":"shape_8970","number":1},' +
    '{"type":"domainStory:activity","name":"","id":"connection_0720","waypoints":[{"original":{"x":719,"y":261},"x":762,"y":261},{"original":{"x":1014,"y":261},"x":976,"y":261}],"source":"shape_8970","target":"shape_8118","number":null},' +
    '{"type":"domainStory:activity","name":"","id":"connection_9638","waypoints":[{"original":{"x":1014,"y":261},"x":1018,"y":308},{"original":{"x":1025,"y":384},"x":1022,"y":346}],"source":"shape_8118","target":"shape_9327","number":2},' +
    '{"type":"domainStory:activity","name":"","id":"connection_8306","waypoints":[{"original":{"x":719,"y":261},"x":719,"y":308},{"original":{"x":719,"y":409},"x":719,"y":371}],"source":"shape_8970","target":"shape_5439","number":null},' +
    '{"type":"domainStory:activity","name":"","id":"connection_6550","waypoints":[{"original":{"x":719,"y":409},"x":719,"y":456},{"original":{"x":719,"y":544},"x":719,"y":506}],"source":"shape_5439","target":"shape_5296","number":null},' +
    '{"type":"domainStory:activity","name":"","id":"connection_0196","waypoints":[{"original":{"x":1025,"y":384},"x":1025,"y":431},{"original":{"x":1025,"y":544},"x":1025,"y":506}],"source":"shape_9327","target":"shape_3974","number":null},' +
    '{"type":"domainStory:activity","name":"","id":"connection_2991","waypoints":[{"original":{"x":1025,"y":544},"x":1072,"y":548},{"original":{"x":1226,"y":563},"x":1193,"y":560}],"source":"shape_3974","target":"shape_8808","number":3},' +
    '{"type":"domainStory:activity","name":"","id":"connection_9263","waypoints":[{"original":{"x":719,"y":544},"x":764,"y":547},{"original":{"x":1005,"y":560},"x":987,"y":559}],"source":"shape_5296","target":"shape_3974","number":null},' +
    '{"type":"domainStory:connection","name":"","id":"connection_6966","waypoints":[{"original":{"x":1025,"y":544},"x":1045,"y":522},{"original":{"x":1156,"y":397},"x":1143,"y":412}],"source":"shape_3974","target":"shape_5750"},' +
    '{"type":"domainStory:connection","name":"","id":"connection_0733","waypoints":[{"original":{"x":1014,"y":261},"x":1046,"y":251},{"original":{"x":1159,"y":216},"x":1111,"y":231}],"source":"shape_8118","target":"shape_3367"},' +
    '{"info":"Eine Beschreibung"}]';

export const intricateV0_5_0_JsonString =
    '[{"type":"domainStory:actorPerson","name":"movie-goer","id":"shape_9977","x":214,"y":164},' +
    '{"type":"domainStory:workObjectDocument","name":"schedule","id":"shape_3526","x":214,"y":-45},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_1144","x":316,"y":-43,"text":"e.g. on billboard","number":27.874564459930312},' +
    '{"type":"domainStory:actorPerson","name":"cashier","id":"shape_4658","x":672,"y":164},' +
    '{"type":"domainStory:workObjectConversation","name":"movie, # of seats, time,..","id":"shape_5151","x":522,"y":-45},' +
    '{"type":"domainStory:actorSystem","name":"ticket system","id":"shape_6138","x":920,"y":164},' +
    '{"type":"domainStory:workObjectInfo","name":"available seats","id":"shape_8031","x":803,"y":-45},' +
    '{"type":"domainStory:workObjectDocument","name":"available seats","id":"shape_3387","x":522,"y":77},' +
    '{"type":"domainStory:workObjectConversation","name":"seats","id":"shape_7904","x":522,"y":190},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_8152","x":803,"y":99},' +
    '{"type":"domainStory:workObjectInfo","name":"chosen seats","id":"shape_4138","x":1071,"y":164},' +
    '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_9422","x":522,"y":283},' +
    '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_5209","x":522,"y":390},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_2043","x":803,"y":264},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_7902","x":522,"y":475},' +
    '{"type":"domainStory:activity","name":"chooses movie from","id":"connection_5202","number":"1","waypoints":[{"original":{"x":252,"y":202},"x":252,"y":164},{"original":{"x":252,"y":-7},"x":252,"y":40}],"source":"shape_9977","target":"shape_3526"},' +
    '{"type":"domainStory:connection","name":"","id":"connection_7380","waypoints":[{"original":{"x":252,"y":-7},"x":288,"y":-14},{"original":{"x":366,"y":-29},"x":316,"y":-19}],"source":"shape_3526","target":"shape_1144"},' +
    '{"type":"domainStory:activity","name":"asks for","id":"connection_7781","number":"2","waypoints":[{"original":{"x":252,"y":202},"x":277,"y":185},{"original":{"x":560,"y":-7},"x":522,"y":19}],"source":"shape_9977","target":"shape_5151"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3361","number":null,"waypoints":[{"original":{"x":560,"y":-7},"x":602,"y":-7},{"x":697,"y":-7},{"original":{"x":697,"y":215},"x":697,"y":164}],"source":"shape_5151","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"in","id":"connection_5224","number":null,"waypoints":[{"original":{"x":841,"y":-7},"x":883,"y":-7},{"x":925,"y":-7},{"original":{"x":958,"y":202},"x":952,"y":164}],"source":"shape_8031","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"looks up","id":"connection_9708","number":3,"waypoints":[{"original":{"x":710,"y":202},"x":718,"y":167},{"x":755,"y":-7},{"original":{"x":809,"y":-7},"x":803,"y":-7}],"source":"shape_4658","target":"shape_8031"},' +
    '{"type":"domainStory:activity","name":"shows","id":"connection_2251","number":4,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":180},{"original":{"x":560,"y":115},"x":593,"y":134}],"source":"shape_4658","target":"shape_3387"},' +
    '{"type":"domainStory:activity","name":"to","id":"connection_6291","number":null,"waypoints":[{"original":{"x":560,"y":115},"x":522,"y":128},{"original":{"x":248,"y":219},"x":296,"y":203}],"source":"shape_3387","target":"shape_9977"},' +
    '{"type":"domainStory:activity","name":"selects","id":"connection_8965","number":5,"waypoints":[{"original":{"x":252,"y":202},"x":294,"y":211},{"x":369,"y":228},{"original":{"x":560,"y":228},"x":522,"y":228}],"source":"shape_9977","target":"shape_7904"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3680","number":null,"waypoints":[{"original":{"x":560,"y":228},"x":597,"y":222},{"original":{"x":713,"y":204},"x":672,"y":210}],"source":"shape_7904","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"issues","id":"connection_7770","number":6,"waypoints":[{"original":{"x":710,"y":202},"x":738,"y":188},{"original":{"x":841,"y":137},"x":803,"y":156}],"source":"shape_4658","target":"shape_8152"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_2904","number":null,"waypoints":[{"original":{"x":841,"y":137},"x":874,"y":156},{"original":{"x":954,"y":201},"x":920,"y":182}],"source":"shape_8152","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"reserves","id":"connection_8784","number":7,"waypoints":[{"original":{"x":958,"y":202},"x":1000,"y":202},{"original":{"x":1109,"y":202},"x":1071,"y":202}],"source":"shape_6138","target":"shape_4138"},' +
    '{"type":"domainStory:activity","name":"tells","id":"connection_6154","number":8,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":232},{"original":{"x":560,"y":321},"x":584,"y":302}],"source":"shape_4658","target":"shape_9422"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_6050","number":null,"waypoints":[{"original":{"x":560,"y":321},"x":522,"y":321},{"x":469,"y":321},{"original":{"x":245,"y":216},"x":275,"y":230}],"source":"shape_9422","target":"shape_9977"},' +
    '{"type":"domainStory:activity","name":"pays","id":"connection_7890","number":9,"waypoints":[{"original":{"x":252,"y":202},"x":265,"y":241},{"x":328,"y":428},{"original":{"x":560,"y":428},"x":522,"y":428}],"source":"shape_9977","target":"shape_5209"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_7262","number":null,"waypoints":[{"original":{"x":560,"y":428},"x":602,"y":428},{"x":661,"y":428},{"original":{"x":699,"y":239},"x":697,"y":249}],"source":"shape_5209","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"prints","id":"connection_8506","number":10,"waypoints":[{"original":{"x":710,"y":202},"x":739,"y":224},{"original":{"x":841,"y":302},"x":803,"y":273}],"source":"shape_4658","target":"shape_2043"},' +
    '{"type":"domainStory:activity","name":"with","id":"connection_0126","number":null,"waypoints":[{"original":{"x":841,"y":302},"x":866,"y":284},{"original":{"x":971,"y":209},"x":920,"y":245}],"source":"shape_2043","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"hands over","id":"connection_1646","number":"11","waypoints":[{"original":{"x":710,"y":202},"x":710,"y":249},{"x":710,"y":513},{"original":{"x":560,"y":513},"x":603,"y":513}],"source":"shape_4658","target":"shape_7902"},' +
    '{"info":"Assumption: no line at box office, seats available, cash payment"},' +
    '{"version":"0.5.0"}]';

export const intricateConfig = {
  actors: {
    Person:
        '<svg viewBox="0 0 24 24" xmlns="http: //www.w3.org/2000/svg"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
    Group:
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>',
    System:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"/></svg>',
    Pet:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9" cy="5.5" r="2.5"/><circle cx="15" cy="5.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/></svg>'
  },
  workObjects: {
    Conversation:
        '<svg height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
    Document:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',
    Folder:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M9.17,6l2,2H20v10L4,18V6H9.17 M10,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2 h-8L10,4L10,4z"/></svg>',
    Call:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M6.54,5C6.6,5.89,6.75,6.76,6.99,7.59l-1.2,1.2C5.38,7.59,5.12,6.32,5.03,5H6.54 M16.4,17.02c0.85,0.24,1.72,0.39,2.6,0.45 v1.49c-1.32-0.09-2.59-0.35-3.8-0.75L16.4,17.02 M7.5,3H4C3.45,3,3,3.45,3,4c0,9.39,7.61,17,17,17c0.55,0,1-0.45,1-1v-3.49tc0-0.55-0.45-1-1-1c-1.24,0-2.45-0.2-3.57-0.57c-0.1-0.04-0.21-0.05-0.31-0.05c-0.26,0-0.51,0.1-0.71,0.29l-2.2,2.2 c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2C9.1,8.31,9.18,7.92,9.07,7.57C8.7,6.45,8.5,5.25,8.5,4C8.5,3.45,8.05,3,7.5,3L7.5,3z"/></svg>',
    Email:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path fill-opacity="0.9" d="M12,1.95c-5.52,0-10,4.48-10,10s4.48,10,10,10h5v-2h-5c-4.34,0-8-3.66-8-8s3.66-8,8-8s8,3.66,8,8v1.43 c0,0.79-0.71,1.57-1.5,1.57S17,14.17,17,13.38v-1.43c0-2.76-2.24-5-5-5s-5,2.24-5,5s2.24,5,5,5c1.38,0,2.64-0.56,3.54-1.47 c0.65,0.89,1.77,1.47,2.96,1.47c1.97,0,3.5-1.6,3.5-3.57v-1.43C22,6.43,17.52,1.95,12,1.95z M12,14.95c-1.66,0-3-1.34-3-3 s1.34-3,3-3s3,1.34,3,3S13.66,14.95,12,14.95z"/></svg>',
    Info:
        '<svg height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>',
    Flag:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>'
  }
};

export const intricateV0_6_0_JSONString =
    '[' +
    '{"type":"domainStory:workObjectFlag","name":"","id":"shape_2670","x":795,"y":-51},' +
    '{"type":"domainStory:actorPet","name":"","id":"shape_4433","x":474,"y":-51},' +
    '{"type":"domainStory:actorPerson","name":"movie-goer","id":"shape_9977","x":214,"y":164},' +
    '{"type":"domainStory:workObjectDocument","name":"schedule","id":"shape_3526","x":214,"y":-45},' +
    '{"type":"domainStory:textAnnotation","name":"","id":"shape_1144","x":316,"y":-43,"text":"e.g. on billboard","number":27.874564459930312},' +
    '{"type":"domainStory:actorPerson","name":"cashier","id":"shape_4658","x":672,"y":164},' +
    '{"type":"domainStory:workObjectConversation","name":"movie, # of seats, time,..","id":"shape_5151","x":522,"y":-45},' +
    '{"type":"domainStory:actorSystem","name":"ticket system","id":"shape_6138","x":920,"y":164},' +
    '{"type":"domainStory:workObjectInfo","name":"available seats","id":"shape_8031","x":803,"y":-45},' +
    '{"type":"domainStory:workObjectDocument","name":"available seats","id":"shape_3387","x":522,"y":77},' +
    '{"type":"domainStory:workObjectConversation","name":"seats","id":"shape_7904","x":522,"y":190},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_8152","x":803,"y":99},' +
    '{"type":"domainStory:workObjectInfo","name":"chosen seats","id":"shape_4138","x":1071,"y":164},' +
    '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_9422","x":522,"y":283},' +
    '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_5209","x":522,"y":390},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_2043","x":803,"y":264},' +
    '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_7902","x":522,"y":475},' +
    '{"type":"domainStory:activity","name":"chooses movie from","id":"connection_5202","number":"1","waypoints":[{"original":{"x":252,"y":202},"x":252,"y":164},{"original":{"x":252,"y":-7},"x":252,"y":40}],"source":"shape_9977","target":"shape_3526"},' +
    '{"type":"domainStory:connection","name":"","id":"connection_7380","waypoints":[{"original":{"x":252,"y":-7},"x":288,"y":-14},{"original":{"x":366,"y":-29},"x":316,"y":-19}],"source":"shape_3526","target":"shape_1144"},' +
    '{"type":"domainStory:activity","name":"asks for","id":"connection_7781","number":"2","waypoints":[{"original":{"x":252,"y":202},"x":277,"y":185},{"original":{"x":560,"y":-7},"x":522,"y":19}],"source":"shape_9977","target":"shape_5151"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3361","number":null,"waypoints":[{"original":{"x":560,"y":-7},"x":602,"y":-7},{"x":697,"y":-7},{"original":{"x":697,"y":215},"x":697,"y":164}],"source":"shape_5151","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"in","id":"connection_5224","number":null,"waypoints":[{"original":{"x":841,"y":-7},"x":883,"y":-7},{"x":925,"y":-7},{"original":{"x":958,"y":202},"x":952,"y":164}],"source":"shape_8031","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"looks up","id":"connection_9708","number":3,"waypoints":[{"original":{"x":710,"y":202},"x":718,"y":167},{"x":755,"y":-7},{"original":{"x":809,"y":-7},"x":803,"y":-7}],"source":"shape_4658","target":"shape_8031"},' +
    '{"type":"domainStory:activity","name":"shows","id":"connection_2251","number":4,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":180},{"original":{"x":560,"y":115},"x":593,"y":134}],"source":"shape_4658","target":"shape_3387"},' +
    '{"type":"domainStory:activity","name":"to","id":"connection_6291","number":null,"waypoints":[{"original":{"x":560,"y":115},"x":522,"y":128},{"original":{"x":248,"y":219},"x":296,"y":203}],"source":"shape_3387","target":"shape_9977"},' +
    '{"type":"domainStory:activity","name":"selects","id":"connection_8965","number":5,"waypoints":[{"original":{"x":252,"y":202},"x":294,"y":211},{"x":369,"y":228},{"original":{"x":560,"y":228},"x":522,"y":228}],"source":"shape_9977","target":"shape_7904"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_3680","number":null,"waypoints":[{"original":{"x":560,"y":228},"x":597,"y":222},{"original":{"x":713,"y":204},"x":672,"y":210}],"source":"shape_7904","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"issues","id":"connection_7770","number":6,"waypoints":[{"original":{"x":710,"y":202},"x":738,"y":188},{"original":{"x":841,"y":137},"x":803,"y":156}],"source":"shape_4658","target":"shape_8152"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_2904","number":null,"waypoints":[{"original":{"x":841,"y":137},"x":874,"y":156},{"original":{"x":954,"y":201},"x":920,"y":182}],"source":"shape_8152","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"reserves","id":"connection_8784","number":7,"waypoints":[{"original":{"x":958,"y":202},"x":1000,"y":202},{"original":{"x":1109,"y":202},"x":1071,"y":202}],"source":"shape_6138","target":"shape_4138"},' +
    '{"type":"domainStory:activity","name":"tells","id":"connection_6154","number":8,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":232},{"original":{"x":560,"y":321},"x":584,"y":302}],"source":"shape_4658","target":"shape_9422"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_6050","number":null,"waypoints":[{"original":{"x":560,"y":321},"x":522,"y":321},{"x":469,"y":321},{"original":{"x":245,"y":216},"x":275,"y":230}],"source":"shape_9422","target":"shape_9977"},' +
    '{"type":"domainStory:activity","name":"pays","id":"connection_7890","number":9,"waypoints":[{"original":{"x":252,"y":202},"x":265,"y":241},{"x":328,"y":428},{"original":{"x":560,"y":428},"x":522,"y":428}],"source":"shape_9977","target":"shape_5209"},' +
    '{"type":"domainStory:activity","name":"","id":"connection_7262","number":null,"waypoints":[{"original":{"x":560,"y":428},"x":602,"y":428},{"x":661,"y":428},{"original":{"x":699,"y":239},"x":697,"y":249}],"source":"shape_5209","target":"shape_4658"},' +
    '{"type":"domainStory:activity","name":"prints","id":"connection_8506","number":10,"waypoints":[{"original":{"x":710,"y":202},"x":739,"y":224},{"original":{"x":841,"y":302},"x":803,"y":273}],"source":"shape_4658","target":"shape_2043"},' +
    '{"type":"domainStory:activity","name":"with","id":"connection_0126","number":null,"waypoints":[{"original":{"x":841,"y":302},"x":866,"y":284},{"original":{"x":971,"y":209},"x":920,"y":245}],"source":"shape_2043","target":"shape_6138"},' +
    '{"type":"domainStory:activity","name":"hands over","id":"connection_1646","number":"11","waypoints":[{"original":{"x":710,"y":202},"x":710,"y":249},{"x":710,"y":513},{"original":{"x":560,"y":513},"x":603,"y":513}],"source":"shape_4658","target":"shape_7902"},' +
    '{"info":"Assumption: no line at box office, seats available, cash payment"},' +
    '{"version":"0.5.0"}]';
