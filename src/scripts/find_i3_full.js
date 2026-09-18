const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const i3Idx = code.indexOf('I3=async()=>{try{const{data:e}=await Kt.get("/auth/me");if(e&&e.user){localStorage.setItem("leadflow_user",JSON.stringify(e.user));return e.user;}}catch(e){}const c=localStorage.getItem("leadflow_user");if(c){try{return JSON.parse(c);}catch(e){}}if(!localStorage.getItem("accessToken")){localStorage.removeItem("leadflow_user");throw new Error("Unauthenticated");}return{id:"54d9b9ef-b1e5-42a4-8490-0648aa862e00",name:"Preeti Patel",fullName:"Preeti Patel",email:"admin@empirecrm.io",phone:"+1 (555) 222-3333",tenantId:"tenant-empire-default",role:{id:"a6c1ef3d-fd6b-4983-8d2c-14a40343ac77",name:"TENANT_ADMIN",permissions:["*"]}}};onst fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const i3Idx = code.indexOf('I3=async');
console.log(code.substring(i3Idx, i3Idx + 400));
