(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[504],{51537:(e,r,t)=>{Promise.resolve().then(t.bind(t,76622))},76622:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>eb});var n=t(95155),i=t(12115),s=t(63159),a=t(81063),o=t(9670),l=t(67172),d=t(85463),c=t(84350),x=t(52269),h=t(55857),m=t(91218),u=t(3951),j=t(50514),A=t(86223),p=t(89915),y=t(18490),v=t(43127),g=t(70323),f=t(99204),b=t(18260),C=t(49339),S=t(89618),w=t(50116),k=t(83397),M=t(53249);let W=["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"],E=["08:00","08:30",...W,"20:00","20:30"],D=["08:00","08:30",...W.slice(0,12)];function I(e){let{bookingData:r,onDataChange:t}=e,[s,a]=(0,i.useState)(r.date||null),[l,d]=(0,i.useState)([]),[c,m]=(0,i.useState)([]),[I,B]=(0,i.useState)(r.time||null),[P,z]=(0,i.useState)([]),[F,_]=(0,i.useState)(!1),[H,N]=(0,i.useState)({}),R=(0,i.useCallback)(e=>{let r=H[(0,y.A)(e,"yyyy-MM-dd")];(!r||!r.isFullDay)&&(a(e),B(null),t({date:e,time:null}))},[H,t]);(0,i.useEffect)(()=>{let e=[],r=new Date;r.setHours(0,0,0,0);for(let t=0;t<14;t++){let n=(0,v.A)(r,t);6!==n.getDay()&&e.push(n)}d(e),!s&&e.length>0&&R(e[0])},[s,R]),(0,i.useEffect)(()=>{let e=async()=>{let e={};for(let r of l)try{let t=(0,y.A)(r,"yyyy-MM-dd"),n=await (0,w.ox)(r);n.isVacationDay&&(e[t]={isFullDay:n.isFullDay,unavailableHours:n.unavailableHours||[]})}catch(e){console.error("Error checking vacation day for ".concat(r.toDateString(),":"),e)}N(e)};l.length>0&&e()},[l]),(0,i.useEffect)(()=>{if(!s)return;let e=s.getDay();4===e?m(E):5===e?m(D):m(W)},[s]),(0,i.useEffect)(()=>{s&&(async()=>{try{_(!0);let e=(await (0,S.CQ)(s)).map(e=>e.time);z(e)}catch(e){console.error("Error fetching booked appointments:",e),z([])}finally{_(!1)}})()},[s]);let T=e=>{B(e),t({time:e})},O=e=>s&&(0,g.A)(e,s),Z=e=>{let r=(0,y.A)(e,"yyyy-MM-dd");return r in H&&H[r].isFullDay},q=e=>{if(!s)return!1;let r=new Date;if(!(0,f.A)(s,r))return!1;let[t,n]=e.split(":").map(Number),i=new Date(s);return i.setHours(t,n,0,0),(0,b.A)(i,r)},V=e=>P.includes(e),$=e=>{if(!s)return!1;let r=H[(0,y.A)(s,"yyyy-MM-dd")];return!!r&&(!!r.isFullDay||r.unavailableHours.includes(e))};return(0,n.jsxs)(x.default,{children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"בחר תאריך"}),(0,n.jsx)(u.Ay,{container:!0,spacing:2,sx:{mb:4},children:l.map(e=>{let r=Z(e);return(0,n.jsx)(u.Ay,{item:!0,children:(0,n.jsx)(j.A,{title:r?"הספר אינו זמין ביום זה":"",arrow:!0,children:(0,n.jsx)("span",{children:(0,n.jsx)(A.A,{color:"error",badgeContent:r?(0,n.jsx)(k.A,{fontSize:"small"}):0,overlap:"circular",anchorOrigin:{vertical:"top",horizontal:"right"},children:(0,n.jsxs)(h.A,{variant:O(e)?"contained":"outlined",onClick:()=>R(e),disabled:r,sx:{minWidth:"100px",display:"flex",flexDirection:"column",p:1,opacity:r?.5:1,bgcolor:r?"rgba(211, 47, 47, 0.1)":void 0,"&:hover":{bgcolor:r?"rgba(211, 47, 47, 0.2)":void 0}},children:[(0,n.jsx)(o.A,{variant:"body2",children:(0,y.A)(e,"EEEE",{locale:C.A})}),(0,n.jsx)(o.A,{variant:"body1",fontWeight:"bold",children:(0,y.A)(e,"d/MM",{locale:C.A})})]})})})})},e.toISOString())})}),s&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,sx:{mt:4},children:"בחר שעה"}),F?(0,n.jsx)(x.default,{sx:{display:"flex",justifyContent:"center",my:4},children:(0,n.jsx)(p.A,{})}):(0,n.jsx)(u.Ay,{container:!0,spacing:2,children:c.map(e=>{let r=q(e),t=V(e),i=$(e),s=r||t||i,a="";return t?a="תור זה כבר תפוס":r?a="זמן זה כבר עבר":i&&(a="הספר אינו זמין בשעה זו"),(0,n.jsx)(u.Ay,{item:!0,children:(0,n.jsx)(j.A,{title:a,arrow:!0,children:(0,n.jsx)("span",{children:(0,n.jsx)(h.A,{variant:I===e?"contained":"outlined",onClick:()=>!s&&T(e),color:"primary",disabled:s,startIcon:t?(0,n.jsx)(M.A,{}):i?(0,n.jsx)(k.A,{}):void 0,sx:{minWidth:"80px",opacity:s?.5:1,cursor:s?"not-allowed":"pointer",bgcolor:t?"rgba(211, 47, 47, 0.1)":i?"rgba(255, 152, 0, 0.1)":void 0,"&:hover":{bgcolor:t?"rgba(211, 47, 47, 0.2)":i?"rgba(255, 152, 0, 0.2)":void 0}},children:e})})})},e)})})]})]})}var B=t(84256),P=t(87850),z=t(83339),F=t(31092),_=t(70680),H=t(69439),N=t(76898),R=t(43388),T=t(20837),O=t(80158),Z=t(77498),q=t(67384),V=t(52121),$=t(63155),G=t(52701),L=t(63491);let Q=[{id:"haircut",name:"תספורת גבר/ ילד",duration:45,price:50,icon:(0,n.jsx)($.A,{})},{id:"beard",name:"סידור זקן",duration:20,price:25,icon:(0,n.jsx)($.A,{})},{id:"sideBurn",name:"סידור קו",duration:20,price:20,icon:(0,n.jsx)($.A,{})},{id:"styling",name:"איזורי שעווה אף/אוזניים/לחיים/גבות",duration:30,price:15,icon:(0,n.jsx)($.A,{})},{id:"coloring",name:"גוונים",duration:60,price:180,icon:(0,n.jsx)($.A,{})},{id:"fullPackage",name:"צבע מלא",duration:90,price:220,icon:(0,n.jsx)($.A,{})}];function U(e){let{bookingData:r,onDataChange:t}=e,[s,a]=(0,i.useState)(r.services||[]),[l,d]=(0,i.useState)(r.people||1),[c,h]=(0,i.useState)(r.notificationMethod||"whatsapp"),[m,j]=(0,i.useState)(r.withChildren||!1),[A,p]=(0,i.useState)(r.childrenCount||0),y=s.reduce((e,r)=>{let t=Q.find(e=>e.id===r);return e+((null==t?void 0:t.price)||0)},0),v=e=>{a(r=>{if(r.includes(e)){let n=r.filter(r=>r!==e);return t({services:n}),n}{let n=[...r,e];return t({services:n}),n}})};return(0,n.jsxs)(x.default,{children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"בחר שירות/ים"}),(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"ניתן לבחור מספר שירותים"}),(0,n.jsx)(u.Ay,{container:!0,spacing:2,sx:{mb:4},children:Q.map(e=>(0,n.jsx)(u.Ay,{item:!0,xs:12,sm:6,children:(0,n.jsx)(B.A,{elevation:s.includes(e.id)?3:1,sx:{borderColor:s.includes(e.id)?"primary.main":"transparent",borderWidth:2,borderStyle:"solid",transition:"all 0.3s ease"},children:(0,n.jsx)(P.A,{onClick:()=>v(e.id),children:(0,n.jsxs)(z.A,{children:[(0,n.jsxs)(x.default,{sx:{display:"flex",alignItems:"center",mb:2},children:[(0,n.jsx)(x.default,{sx:{mr:2,color:"primary.main"},children:e.icon}),(0,n.jsx)(o.A,{variant:"h6",component:"div",children:e.name})]}),(0,n.jsxs)(x.default,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,n.jsxs)(o.A,{variant:"body2",color:"text.secondary",children:[e.duration," דקות"]}),(0,n.jsxs)(o.A,{variant:"h6",color:"primary.main",children:["₪",e.price]})]})]})})})},e.id))}),s.length>0&&(0,n.jsxs)(x.default,{sx:{mt:2,mb:4,p:2,bgcolor:"primary.light",borderRadius:1},children:[(0,n.jsxs)(o.A,{variant:"h6",gutterBottom:!0,children:['סה"כ: ₪',y]}),(0,n.jsxs)(o.A,{variant:"body2",children:["שירותים שנבחרו: ",s.length]})]}),(0,n.jsxs)(x.default,{sx:{mt:4},children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"מספר אנשים"}),(0,n.jsx)(F.A,{type:"number",value:l,onChange:e=>{let r=parseInt(e.target.value);r>0&&r<=5&&(d(r),t({people:r}))},InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(G.A,{})}),inputProps:{min:1,max:5}},sx:{width:"120px"}})]}),(0,n.jsxs)(x.default,{sx:{mt:4},children:[(0,n.jsx)(H.A,{children:(0,n.jsx)(N.A,{control:(0,n.jsx)(R.A,{checked:m,onChange:e=>{let r=e.target.checked;j(r),t({withChildren:r}),r||(p(0),t({childrenCount:0}))},color:"primary"}),label:"מגיע עם ילדים?"})}),(0,n.jsx)(T.A,{in:m,children:(0,n.jsxs)(x.default,{sx:{pl:4,pt:1,pb:2},children:[(0,n.jsx)(o.A,{variant:"body1",gutterBottom:!0,children:"כמה ילדים?"}),(0,n.jsx)(F.A,{type:"number",value:A,onChange:e=>{let r=parseInt(e.target.value);r>=0&&r<=5&&(p(r),t({childrenCount:r}))},InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(L.A,{})}),inputProps:{min:1,max:5}},sx:{width:"120px"}})]})})]}),(0,n.jsx)(O.A,{sx:{my:3}}),(0,n.jsxs)(x.default,{sx:{mt:4},children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"אופן קבלת עדכונים"}),(0,n.jsx)(Z.A,{component:"fieldset",children:(0,n.jsxs)(q.A,{value:c,onChange:e=>{h(e.target.value),t({notificationMethod:e.target.value})},children:[(0,n.jsx)(N.A,{value:"whatsapp",control:(0,n.jsx)(V.A,{}),label:"וואטסאפ"}),(0,n.jsx)(N.A,{value:"sms",control:(0,n.jsx)(V.A,{}),label:"SMS"}),(0,n.jsx)(N.A,{value:"email",control:(0,n.jsx)(V.A,{}),label:"אימייל"})]})})]})]})}var J=t(85396),K=t(60392),X=t(41096),Y=t(62177);function ee(e){let{bookingData:r,onDataChange:t}=e,{control:i,handleSubmit:s,formState:{errors:a}}=(0,Y.mN)({defaultValues:{name:r.name||"",phone:r.phone||"",email:r.email||"",notes:r.notes||""}}),l=e=>{t(e)};return(0,n.jsxs)(x.default,{children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"פרטי התקשרות"}),(0,n.jsx)("form",{onChange:()=>{s(l)()},children:(0,n.jsxs)(u.Ay,{container:!0,spacing:3,children:[(0,n.jsx)(u.Ay,{item:!0,xs:12,children:(0,n.jsx)(Y.xI,{name:"name",control:i,rules:{required:"שדה חובה"},render:e=>{var r,t;let{field:i}=e;return(0,n.jsx)(F.A,{...i,label:"שם מלא",fullWidth:!0,error:!!a.name,helperText:null===(t=a.name)||void 0===t?void 0:null===(r=t.message)||void 0===r?void 0:r.toString(),InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(G.A,{})})}})}})}),(0,n.jsx)(u.Ay,{item:!0,xs:12,children:(0,n.jsx)(Y.xI,{name:"phone",control:i,rules:{required:"שדה חובה",pattern:{value:/^0\d{8,9}$/,message:"מספר טלפון לא תקין"}},render:e=>{var r,t;let{field:i}=e;return(0,n.jsx)(F.A,{...i,label:"טלפון",fullWidth:!0,error:!!a.phone,helperText:null===(t=a.phone)||void 0===t?void 0:null===(r=t.message)||void 0===r?void 0:r.toString(),InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(J.A,{})})}})}})}),(0,n.jsx)(u.Ay,{item:!0,xs:12,children:(0,n.jsx)(Y.xI,{name:"email",control:i,rules:{pattern:{value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,message:"כתובת אימייל לא תקינה"}},render:e=>{var r,t;let{field:i}=e;return(0,n.jsx)(F.A,{...i,label:"אימייל",fullWidth:!0,error:!!a.email,helperText:null===(t=a.email)||void 0===t?void 0:null===(r=t.message)||void 0===r?void 0:r.toString(),InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(K.A,{})})}})}})}),(0,n.jsx)(u.Ay,{item:!0,xs:12,children:(0,n.jsx)(Y.xI,{name:"notes",control:i,render:e=>{let{field:r}=e;return(0,n.jsx)(F.A,{...r,label:"הערות",fullWidth:!0,multiline:!0,rows:4,InputProps:{startAdornment:(0,n.jsx)(_.A,{position:"start",children:(0,n.jsx)(X.A,{})})}})}})})]})})]})}var er=t(54265),et=t(4007),en=t(95439),ei=t(72311),es=t(55592),ea=t(34152),eo=t(80205),el=t(15788),ed=t(88847),ec=t(17322),ex=t(364),eh=t(43927),em=t(86435),eu=t(26348),ej=t(6874),eA=t.n(ej);let ep={haircut:{name:"תספורת גבר/ ילד",price:50},beard:{name:"סידור זקן",price:25},sideBurn:{name:"סידור קו",price:20},styling:{name:"איזורי שעווה אף/אוזניים/לחיים/גבות",price:15},coloring:{name:"גוונים",price:180},fullPackage:{name:"צבע מלא",price:220}},ey={whatsapp:"וואטסאפ",sms:"SMS",email:"אימייל"};function ev(e){let{bookingData:r}=e,[t,s]=(0,i.useState)(!1),[l,d]=(0,i.useState)(!1),[c,m]=(0,i.useState)(null),j=async()=>{d(!0),m(null);try{let e=new Date(r.date);if(r.time){let[t,n]=r.time.split(":").map(Number);e.setHours(t,n,0,0)}let t={date:e,time:r.time||"",service:r.services[0]||"",services:r.services,people:r.people,withChildren:r.withChildren||!1,childrenCount:r.childrenCount||0,notificationMethod:r.notificationMethod,name:r.name,phone:r.phone,email:r.email||"",notes:r.notes||""};console.log("Sending appointment to Firebase:",t);let n=await (0,S.gG)(t);console.log("Appointment created successfully:",n),s(!0)}catch(e){console.error("Error submitting appointment:",e),m("אירעה שגיאה בשמירת התור. אנא נסה שנית.")}finally{d(!1)}},A=()=>r.services.reduce((e,r)=>{var t;return e+((null===(t=ep[r])||void 0===t?void 0:t.price)||0)},0);return t?(0,n.jsxs)(x.default,{sx:{textAlign:"center",py:4},children:[(0,n.jsx)(eo.A,{color:"primary",sx:{fontSize:80,mb:2}}),(0,n.jsx)(o.A,{variant:"h4",gutterBottom:!0,color:"primary.main",children:"בקשת התור נשלחה!"}),(0,n.jsxs)(er.A,{severity:"info",icon:(0,n.jsx)(el.A,{fontSize:"large"}),sx:{maxWidth:"500px",mx:"auto",mb:4,py:2,fontSize:"1.1rem","& .MuiAlert-message":{width:"100%"}},children:[(0,n.jsx)(et.A,{sx:{fontSize:"1.2rem",fontWeight:"bold",textAlign:"center"},children:"חשוב לדעת"}),(0,n.jsxs)(x.default,{sx:{textAlign:"center",fontWeight:"medium"},children:[(0,n.jsx)(o.A,{variant:"body1",paragraph:!0,component:"div",sx:{fontWeight:"bold"},children:"בקשת התור נשלחה לאישור הספר"}),(0,n.jsxs)(o.A,{variant:"body1",component:"div",children:["לאחר אישור הבקשה, תקבל הודעת אישור ב",ey[r.notificationMethod]||"הודעה"]})]})]}),(0,n.jsxs)(x.default,{sx:{maxWidth:"500px",mx:"auto",mb:4,p:3,bgcolor:"background.paper",borderRadius:2,boxShadow:1},children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,color:"primary",children:"סיכום הבקשה"}),(0,n.jsxs)(u.Ay,{container:!0,spacing:2,children:[(0,n.jsxs)(u.Ay,{item:!0,xs:12,children:[(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",children:"שירותים:"}),(0,n.jsx)(en.A,{dense:!0,children:r.services.map(e=>{var r,t;return(0,n.jsxs)(ei.Ay,{sx:{py:.5},children:[(0,n.jsx)(es.A,{sx:{minWidth:"30px"},children:(0,n.jsx)($.A,{fontSize:"small",color:"primary"})}),(0,n.jsx)(ea.A,{primary:(null===(r=ep[e])||void 0===r?void 0:r.name)||"שירות לא ידוע",secondary:"₪".concat((null===(t=ep[e])||void 0===t?void 0:t.price)||0)})]},e)})}),(0,n.jsxs)(o.A,{variant:"body1",fontWeight:"bold",sx:{mt:1},children:['סה"כ: ₪',A()]})]}),(0,n.jsxs)(u.Ay,{item:!0,xs:6,children:[(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",children:"תאריך:"}),(0,n.jsx)(o.A,{variant:"body1",fontWeight:"medium",children:r.date?(0,y.A)(r.date,"EEEE, d בMMMM yyyy",{locale:C.A}):""})]}),(0,n.jsxs)(u.Ay,{item:!0,xs:6,children:[(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",children:"שעה:"}),(0,n.jsx)(o.A,{variant:"body1",fontWeight:"medium",children:r.time})]}),(0,n.jsxs)(u.Ay,{item:!0,xs:6,children:[(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",children:"שם:"}),(0,n.jsx)(o.A,{variant:"body1",fontWeight:"medium",children:r.name})]}),r.withChildren&&(0,n.jsxs)(u.Ay,{item:!0,xs:12,children:[(0,n.jsx)(o.A,{variant:"body2",color:"text.secondary",children:"ילדים:"}),(0,n.jsxs)(o.A,{variant:"body1",fontWeight:"medium",children:[r.childrenCount," ילדים"]})]})]})]}),(0,n.jsx)(x.default,{sx:{mt:4},children:(0,n.jsx)(h.A,{component:eA(),href:"/",variant:"contained",color:"primary",startIcon:(0,n.jsx)(ed.A,{}),sx:{mx:1},children:"חזרה לדף הבית"})})]}):(0,n.jsxs)(x.default,{children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,children:"אישור הזמנה"}),(0,n.jsxs)(er.A,{severity:"info",sx:{mb:4},icon:(0,n.jsx)(el.A,{}),children:[(0,n.jsx)(et.A,{children:"שים לב"}),(0,n.jsx)(o.A,{component:"div",sx:{fontWeight:"medium"},children:"אנא בדוק את פרטי ההזמנה לפני שליחת הבקשה. התור יקבע רק לאחר אישור הספר."})]}),c&&(0,n.jsxs)(er.A,{severity:"error",sx:{mb:4},icon:(0,n.jsx)(ec.A,{}),children:[(0,n.jsx)(et.A,{children:"שגיאה"}),(0,n.jsx)(o.A,{component:"div",children:c})]}),(0,n.jsxs)(a.A,{elevation:2,sx:{p:3,borderRadius:2,mb:4},children:[(0,n.jsx)(o.A,{variant:"h6",gutterBottom:!0,color:"primary",children:"פרטי ההזמנה"}),(0,n.jsxs)(en.A,{children:[(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(ex.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"תאריך",secondary:r.date?(0,y.A)(r.date,"EEEE, d בMMMM yyyy",{locale:C.A}):""})]}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(eh.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"שעה",secondary:r.time})]}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)($.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"שירותים",secondary:(0,n.jsxs)(en.A,{dense:!0,children:[r.services.map(e=>{var r,t;return(0,n.jsx)(ei.Ay,{sx:{py:.5},children:(0,n.jsx)(ea.A,{primary:(null===(r=ep[e])||void 0===r?void 0:r.name)||"שירות לא ידוע",secondary:"₪".concat((null===(t=ep[e])||void 0===t?void 0:t.price)||0)})},e)}),(0,n.jsx)(ei.Ay,{sx:{py:.5},children:(0,n.jsx)(ea.A,{primary:"סה״כ",primaryTypographyProps:{fontWeight:"bold"},secondary:"₪".concat(A()),secondaryTypographyProps:{fontWeight:"bold"}})})]})})]}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(G.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"מספר אנשים",secondary:r.people})]}),r.withChildren&&(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(L.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"מספר ילדים",secondary:r.childrenCount})]}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(em.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"אופן קבלת עדכונים",secondary:ey[r.notificationMethod]||"לא נבחר"})]}),(0,n.jsx)(O.A,{sx:{my:1}}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(G.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"שם מלא",secondary:r.name||"לא הוזן"})]}),(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(J.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"טלפון",secondary:r.phone||"לא הוזן"})]}),r.email&&(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(K.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"אימייל",secondary:r.email})]}),r.notes&&(0,n.jsxs)(ei.Ay,{children:[(0,n.jsx)(es.A,{children:(0,n.jsx)(X.A,{color:"primary"})}),(0,n.jsx)(ea.A,{primary:"הערות",secondary:r.notes})]})]})]}),(0,n.jsx)(x.default,{sx:{mt:4,display:"flex",justifyContent:"center"},children:(0,n.jsx)(h.A,{variant:"contained",color:"primary",size:"large",onClick:j,disabled:l,startIcon:l?(0,n.jsx)(p.A,{size:20,color:"inherit"}):(0,n.jsx)(eu.A,{}),sx:{px:4,py:1.5,borderRadius:2},children:l?"שולח...":"אישור והזמנת תור"})})]})}var eg=t(36482),ef=t(29414);function eb(){let[e,r]=(0,i.useState)(0),[t,u]=(0,i.useState)({date:null,time:null,services:[],people:1,withChildren:!1,childrenCount:0,notificationMethod:"whatsapp",name:"",phone:"",email:"",notes:""}),{t:j}=(0,m.Bd)(),A=[j("booking.date"),j("booking.service"),j("booking.contactInfo"),j("booking.confirmation")],p=e=>{u(r=>({...r,...e}))};return(0,n.jsx)(s.A,{maxWidth:"md",sx:{py:8},children:(0,n.jsxs)(a.A,{elevation:3,sx:{p:4,borderRadius:2},children:[(0,n.jsx)(o.A,{variant:"h4",component:"h1",gutterBottom:!0,textAlign:"center",color:"primary",fontWeight:"bold",children:j("booking.title")}),(0,n.jsx)(l.A,{activeStep:e,alternativeLabel:!0,sx:{mb:5,mt:3},children:A.map(e=>(0,n.jsx)(d.A,{children:(0,n.jsx)(c.A,{children:e})},e))}),(0,n.jsx)(x.default,{sx:{mt:4,mb:4},children:(e=>{switch(e){case 0:return(0,n.jsx)(I,{bookingData:t,onDataChange:p});case 1:return(0,n.jsx)(U,{bookingData:t,onDataChange:p});case 2:return(0,n.jsx)(ee,{bookingData:t,onDataChange:p});case 3:return(0,n.jsx)(ev,{bookingData:t});default:return"Unknown step"}})(e)}),(0,n.jsxs)(x.default,{sx:{display:"flex",justifyContent:"space-between",mt:4},children:[(0,n.jsx)(h.A,{variant:"outlined",disabled:0===e,onClick:()=>{r(e=>e-1)},startIcon:(0,n.jsx)(eg.A,{}),children:j("common.back")}),e<A.length-1&&(0,n.jsx)(h.A,{variant:"contained",color:"primary",onClick:()=>{e!==A.length-1&&r(e=>e+1)},endIcon:(0,n.jsx)(ef.A,{}),disabled:!(()=>{switch(e){case 0:return t.date&&t.time;case 1:return t.services&&t.services.length>0;case 2:return t.name&&t.phone;default:return!0}})(),children:j("common.next")})]})]})})}}},e=>{var r=r=>e(e.s=r);e.O(0,[992,888,881,555,874,990,296,617,14,720,960,595,441,684,358],()=>r(51537)),_N_E=e.O()}]);