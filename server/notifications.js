const pool=require('./db');const {authenticate}=require('./auth');const {positiveId,fail}=require('./validation');
async function emit(conn,{actor=null,scope='admin',recipient=null,course=null,section,title,href}){
  await conn.query('INSERT INTO dashboard_notifications(actor_id,scope,recipient_id,course_id,section,title,href) VALUES(?,?,?,?,?,?,?)',[actor,scope,recipient,course,section,title.slice(0,240),href]);
}
async function fromAudit(conn,user,action,resource,id){
  const actor=user?.id||null;
  const section=resource.startsWith('learning_')?'/admin/learning':resource==='practical'?'/admin/practice':resource==='certificates'?'/admin/students':resource==='images'?'/admin/activity-logs':resource==='assessments'?'/admin/learning':'/admin/'+resource;
  const verb={create:'New',update:'Updated',delete:'Deleted',mark:'Reviewed',assign_trainers:'Trainer assignments updated',allow_attempt:'Extra attempt granted',revoke:'Revoked',restore:'Restored',upload:'Uploaded'}[action]||action;
  await emit(conn,{actor,section,title:`${verb} ${resource.replaceAll('_',' ')}${id?' #'+id:''}`,href:section});
  if(resource==='enrollments'&&action!=='delete'){
    const[[row]]=await conn.query('SELECT e.user_id,e.course_id,e.status,c.title FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.id=?',[id]);
    if(row?.user_id)await emit(conn,{actor,scope:'user',recipient:row.user_id,section:'/learn',title:`Enrollment ${row.status}: ${row.title}`,href:row.status==='approved'||row.status==='completed'?'/learn/courses/'+row.course_id:'/learn'});
  }
  if(resource==='orders'&&action==='update'){
    const[[row]]=await conn.query('SELECT user_id,status FROM orders WHERE id=?',[id]);if(row?.user_id)await emit(conn,{actor,scope:'user',recipient:row.user_id,section:'/ecommerce',title:`Order #${id}: ${row.status}`,href:'/ecommerce'});
  }
  if(['learning_modules','learning_units','learning_assessments','practical'].includes(resource)&&['create','update'].includes(action)){
    const queries={learning_modules:'SELECT course_id,title,published FROM learning_modules WHERE id=?',learning_units:'SELECT m.course_id,u.title,u.published FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE u.id=?',learning_assessments:'SELECT course_id,title,published FROM learning_assessments WHERE id=?',practical:'SELECT m.course_id,e.title,e.published FROM coding_exercises e JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE e.id=?'};
    const[[row]]=await conn.query(queries[resource],[id]);if(row?.published)await emit(conn,{actor,scope:'course',course:row.course_id,section:'/learn',title:`${action==='create'?'New learning content':'Learning content updated'}: ${row.title}`,href:resource==='practical'?'/learn/practice/'+id:'/learn/courses/'+row.course_id});
  }
  if(resource==='practical'&&action==='mark'){
    const[[row]]=await conn.query('SELECT s.user_id,s.score,s.exercise_id,e.title,m.course_id FROM coding_submissions s JOIN coding_exercises e ON e.id=s.exercise_id JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE s.id=?',[id]);
    if(row)await emit(conn,{actor,scope:'user',recipient:row.user_id,course:row.course_id,section:'/learn',title:`Feedback ready: ${row.title} — ${row.score}%`,href:'/learn/practice/'+row.exercise_id});
  }
  if(resource==='courses'&&action==='assign_trainers'){
    const[rows]=await conn.query('SELECT t.user_id,c.title FROM course_trainers t JOIN courses c ON c.id=t.course_id WHERE t.course_id=?',[id]);for(const row of rows)await emit(conn,{actor,scope:'user',recipient:row.user_id,course:id,section:'/teach',title:'Teaching assignment: '+row.title,href:'/teach'});
  }
  if(resource==='certificates'&&['revoke','restore'].includes(action)){
    const[[row]]=await conn.query('SELECT user_id,course_id,code,course_title FROM learning_certificates WHERE id=?',[id]);if(row)await emit(conn,{actor,scope:'user',recipient:row.user_id,section:'/learn',title:`Certificate ${action==='revoke'?'revoked':'restored'}: ${row.course_title}`,href:'/certificates/'+row.code});
  }
}
function visibility(user){
  const member='EXISTS(SELECT 1 FROM enrollments e WHERE e.course_id=n.course_id AND e.user_id=? AND e.status IN (\'approved\',\'completed\'))';
  const trainer='EXISTS(SELECT 1 FROM course_trainers t WHERE t.course_id=n.course_id AND t.user_id=?)';
  return {sql:`(n.actor_id IS NULL OR n.actor_id<>?) AND ((n.scope='admin' AND ?=1) OR (n.scope='user' AND n.recipient_id=? AND (n.course_id IS NULL OR ?=1 OR ${member} OR ${trainer})) OR (n.scope IN ('course','trainers') AND (?=1 OR ${trainer} OR (n.scope='course' AND ${member}))))`,params:[user.id,Number(user.admin_access),user.id,Number(user.admin_access),user.id,user.id,Number(user.admin_access),user.id,user.id]};
}
function registerNotifications(app){
  app.use('/api/notifications',authenticate);
  app.get('/api/notifications',async(req,res)=>{
    const v=visibility(req.user);const before=req.query.before?positiveId(req.query.before):Number.MAX_SAFE_INTEGER;
    const[items]=await pool.query(`SELECT n.id,n.section,n.title,n.href,n.created_at,IF(r.notification_id IS NULL,1,0) AS unread FROM dashboard_notifications n LEFT JOIN dashboard_notification_reads r ON r.notification_id=n.id AND r.user_id=? WHERE ${v.sql} AND n.id<? ORDER BY n.id DESC LIMIT 60`,[req.user.id,...v.params,before]);
    const[groups]=await pool.query(`SELECT n.section,COUNT(*) AS total FROM dashboard_notifications n LEFT JOIN dashboard_notification_reads r ON r.notification_id=n.id AND r.user_id=? WHERE ${v.sql} AND r.notification_id IS NULL GROUP BY n.section`,[req.user.id,...v.params]);
    const[[latest]]=await pool.query(`SELECT COALESCE(MAX(n.id),0) AS id FROM dashboard_notifications n WHERE ${v.sql}`,v.params);
    res.json({items,unread:groups.reduce((sum,item)=>sum+Number(item.total),0),sections:Object.fromEntries(groups.map(item=>[item.section,Number(item.total)])),latest:latest.id});
  });
  app.post('/api/notifications/read',async(req,res)=>{
    const v=visibility(req.user);const {id,through}=req.body||{};
    if(id){const notificationId=positiveId(id);const[[row]]=await pool.query(`SELECT n.id FROM dashboard_notifications n WHERE n.id=? AND ${v.sql}`,[notificationId,...v.params]);if(!row)fail('Notification not found.',404);await pool.query('INSERT IGNORE INTO dashboard_notification_reads(user_id,notification_id) VALUES(?,?)',[req.user.id,notificationId]);}
    else if(through){await pool.query(`INSERT IGNORE INTO dashboard_notification_reads(user_id,notification_id) SELECT ?,n.id FROM dashboard_notifications n WHERE ${v.sql} AND n.id<=?`,[req.user.id,...v.params,positiveId(through)]);}
    else fail('Select a notification or visible notification range.');
    res.json({message:'Notifications marked as read.'});
  });
}
module.exports={emit,fromAudit,registerNotifications};
